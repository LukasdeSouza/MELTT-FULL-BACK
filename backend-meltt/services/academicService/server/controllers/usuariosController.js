import pool from "../db.js";

class UsuarioController {
  async getAllUsuarios(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { ativo, nome } = req.query;

    try {
      let query = "SELECT * FROM usuarios";
      let countQuery = "SELECT COUNT(*) AS total FROM usuarios";
      const queryParams = [];
      const whereClauses = [];

      // Construção dinâmica das cláusulas WHERE
      if (ativo !== undefined) {
        whereClauses.push("ativo = ?");
        queryParams.push(parseInt(ativo));
      }

      if (nome) {
        whereClauses.push("nome LIKE CONCAT(?, '%')");
        queryParams.push(nome);
      }

      // Adiciona WHERE se houver filtros
      if (whereClauses.length > 0) {
        const whereStatement = ` WHERE ${whereClauses.join(" AND ")}`;
        query += whereStatement;
        countQuery += whereStatement;
      }

      // Query principal com paginação
      query += " LIMIT ? OFFSET ?";
      const paginationParams = [...queryParams, limit, offset];

      // Executa as queries em paralelo
      const [results, [countResult]] = await Promise.all([
        pool.query(query, paginationParams),
        pool.query(countQuery, queryParams)
      ]);

      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        data: results[0],
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createUsuario(req, res) {
    try {
      const { email, senha, tipo, documento, nome, id_bling, ativo, telefone, faculdade, turma_id } = req.body;
      
      const [result] = await pool.query(
        `INSERT INTO usuarios 
        (email, senha, tipo, documento, nome, id_bling, ativo, telefone, faculdade, turma_id) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [email, senha, tipo, documento, nome, id_bling, ativo, telefone, faculdade, turma_id]
      );

      res.status(201).json({ 
        id: result.insertId, 
        ...req.body 
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getUsuarioById(req, res) {
    try {
      const [results] = await pool.query(
        "SELECT * FROM usuarios WHERE id = ?", 
        [req.params.id]
      );

      if (results.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      res.status(200).json(results[0]);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getUsuariosByTurmaId(req, res) {
    try {
      const [results] = await pool.query(
        "SELECT * FROM usuarios WHERE turma_id = ?",
        [req.params.id]
      );

      res.status(200).json(results);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateUsuario(req, res) {
    try {
      const { id } = req.params;
      const fields = req.body;

      const updateQuery = `
        UPDATE usuarios
        SET email = ?, senha = ?, tipo = ?, documento = ?, 
            nome = ?, id_bling = ?, ativo = ?, telefone = ?, faculdade = ?, turma_id = ?
        WHERE id = ?`;

      const params = [
        fields.email,
        fields.senha,
        fields.tipo,
        fields.documento,
        fields.nome,
        fields.id_bling,
        fields.ativo,
        fields.telefone,
        fields.faculdade,
        fields.turma_id,
        id
      ];

      const [result] = await pool.query(updateQuery, params);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const [updatedUser] = await pool.query(
        "SELECT * FROM usuarios WHERE id = ?", 
        [id]
      );

      res.status(200).json({
        message: "Usuário atualizado com sucesso!",
        data: updatedUser[0]
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateUsuarioStatus(req, res) {
    try {
      const [result] = await pool.query(
        "UPDATE usuarios SET ativo = 0 WHERE id = ?",
        [req.params.id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "Usuário não encontrado!" });
      }

      res.status(200).json({
        message: "Usuário marcado como inativo!",
        id: req.params.id
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new UsuarioController();