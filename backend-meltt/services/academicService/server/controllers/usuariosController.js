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
        whereClauses.push(`ativo = $${queryParams.length + 1}`);
        queryParams.push(parseInt(ativo));
      }

      if (nome) {
        whereClauses.push(`nome LIKE $${queryParams.length + 1} || '%'`);
        queryParams.push(nome);
      }

      // Adiciona WHERE se houver filtros
      if (whereClauses.length > 0) {
        const whereStatement = ` WHERE ${whereClauses.join(" AND ")}`;
        query += whereStatement;
        countQuery += whereStatement;
      }

      // Query principal com paginação
      query += ` LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      const paginationParams = [...queryParams, limit, offset];

      // Executa as queries em paralelo
      const [results, countResult] = await Promise.all([
        pool.query(query, paginationParams),
        pool.query(countQuery, queryParams)
      ]);

      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        data: results.rows,
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createUsuario(req, res) {
    try {
      const { email, senha, tipo, documento, nome, id_bling, ativo, telefone, faculdade, turma_id } = req.body;
      
      const result = await pool.query(
        `INSERT INTO usuarios 
        (email, senha, tipo, documento, nome, id_bling, ativo, telefone, faculdade, turma_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
        [email, senha, tipo, documento, nome, id_bling, ativo, telefone, faculdade, turma_id]
      );

      res.status(201).json({ 
        id: result.rows[0].id, 
        ...req.body 
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getUsuarioById(req, res) {
    try {
      const result = await pool.query(
        "SELECT * FROM usuarios WHERE id = $1", 
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      res.status(200).json(result.rows[0]);

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getUsuariosByTurmaId(req, res) {
    try {
      const result = await pool.query(
        "SELECT * FROM usuarios WHERE turma_id = $1",
        [req.params.id]
      );

      res.status(200).json(result.rows);

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
        SET email = $1, senha = $2, tipo = $3, documento = $4, 
            nome = $5, id_bling = $6, ativo = $7, telefone = $8, faculdade = $9, turma_id = $10
        WHERE id = $11`;

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

      const result = await pool.query(updateQuery, params);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const updatedUserResult = await pool.query(
        "SELECT * FROM usuarios WHERE id = $1", 
        [id]
      );

      res.status(200).json({
        message: "Usuário atualizado com sucesso!",
        data: updatedUserResult.rows[0]
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateUsuarioStatus(req, res) {
    try {
      const result = await pool.query(
        "UPDATE usuarios SET ativo = 0 WHERE id = $1",
        [req.params.id]
      );

      if (result.rowCount === 0) {
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