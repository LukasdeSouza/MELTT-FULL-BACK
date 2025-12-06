import pool from "../db.js";

class AgendaController {
  async getAllAgenda(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const resultsResult = await pool.query(
        "SELECT * FROM agenda LIMIT $1 OFFSET $2",
        [limit, offset]
      );
      const results = resultsResult.rows;

      const countResult = await pool.query(
        "SELECT COUNT(*) AS total FROM agenda"
      );
      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        data: results,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getAgenda(req, res) {
    try {
      const id = req.params.id;
      const result = await pool.query(
        "SELECT * FROM agenda WHERE id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Agenda não encontrada." });
      }

      res.status(200).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createAgenda(req, res) {
    try {
      const { nome, descricao, data, nome_turma, turma_id } = req.body;
      const result = await pool.query(
        `INSERT INTO agenda 
        (nome, descricao, data, nome_turma, turma_id) 
        VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [nome, descricao, data, nome_turma, turma_id]
      );

      res.status(201).json({
        id: result.rows[0].id,
        ...req.body,
      });
    } catch (err) {
      console.log('err', err)
      res.status(500).json({ error: err.message });
    }
  }

  async updateAgenda(req, res) {
    try {
      const id = req.params.id;
      const { nome, descricao, data, nome_turma, turma_id } = req.body;

      await pool.query(
        `UPDATE agenda SET 
          nome = $1, 
          descricao = $2, 
          data = $3, 
          nome_turma = $4, 
          turma_id = $5 
        WHERE id = $6`,
        [nome, descricao, data, nome_turma, turma_id, id]
      );

      const result = await pool.query(
        "SELECT * FROM agenda WHERE id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Agenda não encontrada." });
      }

      res.status(200).json({
        message: "Agenda atualizada com sucesso!",
        value: result.rows[0],
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteAgenda(req, res) {
    try {
      const id = req.params.id;
      const result = await pool.query(
        "DELETE FROM agenda WHERE id = $1",
        [id]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Agenda não encontrada." });
      }

      res.status(200).json({ message: "Agenda deletada com sucesso!", id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new AgendaController();