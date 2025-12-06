import pool from "../db.js";

class FornecedoresController {
  async getAllFornecedores(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const nome = req.query.nome || null;
    const noPagination = req.query.all === 'true' || req.query.noPagination === 'true'; // Desabilita paginação

    try {
      let query = "SELECT * FROM fornecedores";
      let countQuery = "SELECT COUNT(*) AS total FROM fornecedores";
      let queryParams = [];
      let countParams = [];

      if (nome) {
        query += ` WHERE nome LIKE $1`;
        countQuery += ` WHERE nome LIKE $1`;
        queryParams.push(`%${nome}%`);
        countParams.push(`%${nome}%`);
      }

      query += " ORDER BY criado_em DESC";

      if (!noPagination) {
        const limitParam = queryParams.length + 1;
        const offsetParam = queryParams.length + 2;
        query += ` LIMIT $${limitParam} OFFSET $${offsetParam}`;
        queryParams.push(limit, offset);
      }

      const result = await pool.query(query, queryParams);
      const results = result.rows;

      if (noPagination) {
        res.status(200).json({
          totalItems: results.length,
          data: results,
        });
      } else {
        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
          page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          data: results,
        });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  async getFornecedoresById(req, res) {
    const id = req.params.id;
    try {
      const result = await pool.query(
        "SELECT * FROM fornecedores WHERE id = $1",
        [id]
      );
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createFornecedores(req, res) {
    const {
      nome,
      telefone,
      cnpj,
      responsavel,
    } = req.body;
    const query =
      "INSERT INTO fornecedores (nome, telefone, cnpj, responsavel) VALUES ($1, $2, $3, $4) RETURNING id";
    try {
      const result = await pool.query(query, [
        nome,
        telefone,
        cnpj,
        responsavel,
      ]);
      res.status(201).json({ id: result.rows[0].id, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateFornecedores(req, res) {
    const id = req.params.id;
    const {
      nome,
      telefone,
      cnpj,
      responsavel,
    } = req.body;
    const query =
      "UPDATE fornecedores SET nome = $1, telefone = $2, cnpj = $3, responsavel = $4 WHERE id = $5";
    try {
      await pool.query(query, [
        nome,
        telefone,
        cnpj,
        responsavel,
        id,
      ]);
      res.status(200).json({
        message: "Fornecedor atualizado com sucesso!",
        result: req.body,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteFornecedores(req, res) {
    const id = req.params.id;
    try {
      await pool.query("DELETE FROM fornecedores WHERE id = $1", [id]);
      res
        .status(200)
        .json({ message: "Fornecedor deletado com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new FornecedoresController();
