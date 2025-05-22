import pool from "../db.js";

class EventosController {
  async getAllEventos(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const [results] = await pool.query("SELECT * FROM eventos LIMIT ? OFFSET ?", [limit, offset]);
      const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM eventos");

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
      const [result] = await pool.query("SELECT * FROM eventos WHERE id = ?", [id]);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getEventosByTurmaId(req, res) {
    try {
      const { id } = req.params;
      const [result] = await pool.query("SELECT * FROM eventos WHERE turma_id = ?", [id]);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async createEventos(req, res) {
    try {
      const { nome, token, turma_id, data_formatura } = req.body;
      const [result] = await pool.query(
        "INSERT INTO eventos (nome, token, turma_id, data_formatura) VALUES (?, ?, ?, ?)",
        [nome, token, turma_id, data_formatura]
      );
      res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async updateEventos(req, res) {
    try {
      const { id } = req.params;
      const { nome, token, turma_id, data_formatura } = req.body;

      const [updateResult] = await pool.query(
        "UPDATE eventos SET nome = ?, token = ?, turma_id = ?, data_formatura = ? WHERE id = ?",
        [nome, token, turma_id, data_formatura, id]
      );

      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ error: "Evento não encontrado." });
      }

      const [[updatedEvento]] = await pool.query("SELECT * FROM eventos WHERE id = ?", [id]);
      res.status(200).json({ message: "Evento atualizado com sucesso!", value: updatedEvento });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async deleteEventos(req, res) {
    try {
      const { id } = req.params;
      const [deleteResult] = await pool.query("DELETE FROM eventos WHERE id = ?", [id]);
      
      if (deleteResult.affectedRows === 0) {
        return res.status(404).json({ error: "Evento não encontrado." });
      }
      
      res.status(200).json({ message: "Evento deletado com sucesso!", id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

export default new EventosController();