import pool from "../db.js";

class FaculdadeController {
  async getAllFaculdade(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
      const [results] = await pool.query(
        "SELECT * FROM faculdades LIMIT ? OFFSET ?",
        [limit, offset]
      );
      
      const [[{ total }]] = await pool.query(
        "SELECT COUNT(*) AS total FROM faculdades"
      );
      
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
      const [result] = await pool.query("SELECT * FROM faculdades WHERE id = ?", [id]);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createFaculdade(req, res) {
    const { nome, endereco, telefone } = req.body;
    try {
      const [result] = await pool.query(
        "INSERT INTO faculdades (nome, endereco, telefone) VALUES (?, ?, ?)",
        [nome, endereco, telefone]
      );
      res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateFaculdade(req, res) {
    const id = req.params.id;
    const { nome, endereco, telefone } = req.body;
    try {
      await pool.query(
        "UPDATE faculdades SET nome = ?, endereco = ?, telefone = ? WHERE id = ?",
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
      await pool.query("DELETE FROM faculdades WHERE id = ?", [id]);
      res.status(200).json({ message: "Faculdade deletada com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new FaculdadeController();