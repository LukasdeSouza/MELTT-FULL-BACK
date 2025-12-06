import pool from "../db.js";

class FaculdadeController {
  async getAllFaculdade(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
      const resultsResult = await pool.query(
        "SELECT * FROM faculdades LIMIT $1 OFFSET $2",
        [limit, offset]
      );
      const results = resultsResult.rows;
      
      const countResult = await pool.query(
        "SELECT COUNT(*) AS total FROM faculdades"
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

  async getFaculdadeById(req, res) {
    const id = req.params.id;
    try {
      const result = await pool.query("SELECT * FROM faculdades WHERE id = $1", [id]);
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createFaculdade(req, res) {
    const { nome, endereco, telefone } = req.body;
    try {
      const result = await pool.query(
        "INSERT INTO faculdades (nome, endereco, telefone) VALUES ($1, $2, $3) RETURNING id",
        [nome, endereco, telefone]
      );
      res.status(201).json({ id: result.rows[0].id, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateFaculdade(req, res) {
    const id = req.params.id;
    const { nome, endereco, telefone } = req.body;
    try {
      await pool.query(
        "UPDATE faculdades SET nome = $1, endereco = $2, telefone = $3 WHERE id = $4",
        [nome, endereco, telefone, id]
      );
      res.status(200).json({ message: "Faculdade atualizada com sucesso!", result: req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteFaculdade(req, res) {
    const id = req.params.id;
    try {
      await pool.query("DELETE FROM faculdades WHERE id = $1", [id]);
      res.status(200).json({ message: "Faculdade deletada com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new FaculdadeController();