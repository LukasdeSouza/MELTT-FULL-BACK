import pool from "../db.js";

class EventosController {
  async getAllEventos(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const resultsResult = await pool.query("SELECT * FROM eventos LIMIT $1 OFFSET $2", [limit, offset]);
      const results = resultsResult.rows;
      const countResult = await pool.query("SELECT COUNT(*) AS total FROM eventos");
      const total = parseInt(countResult.rows[0].total);

      res.status(200).json({
        page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        data: results,
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getEventosById(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query("SELECT * FROM eventos WHERE id = $1", [id]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getEventosByTurmaId(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query("SELECT * FROM eventos WHERE turma_id = $1", [id]);
      res.status(200).json(result.rows);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createEventos(req, res) {
    try {
      const { nome, token, turma_id, data_formatura } = req.body;
      const result = await pool.query(
        "INSERT INTO eventos (nome, token, turma_id, data_formatura) VALUES ($1, $2, $3, $4) RETURNING id",
        [nome, token, turma_id, data_formatura]
      );
      res.status(201).json({ id: result.rows[0].id, ...req.body });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateEventos(req, res) {
    try {
      const { id } = req.params;
      const { nome, token, turma_id, data_formatura } = req.body;

      const updateResult = await pool.query(
        "UPDATE eventos SET nome = $1, token = $2, turma_id = $3, data_formatura = $4 WHERE id = $5",
        [nome, token, turma_id, data_formatura, id]
      );

      if (updateResult.rowCount === 0) {
        return res.status(404).json({ error: "Evento não encontrado." });
      }

      const updatedEventoResult = await pool.query("SELECT * FROM eventos WHERE id = $1", [id]);
      res.status(200).json({ message: "Evento atualizado com sucesso!", value: updatedEventoResult.rows[0] });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteEventos(req, res) {
    try {
      const { id } = req.params;
      const deleteResult = await pool.query("DELETE FROM eventos WHERE id = $1", [id]);
      
      if (deleteResult.rowCount === 0) {
        return res.status(404).json({ error: "Evento não encontrado." });
      }
      
      res.status(200).json({ message: "Evento deletado com sucesso!", id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new EventosController();