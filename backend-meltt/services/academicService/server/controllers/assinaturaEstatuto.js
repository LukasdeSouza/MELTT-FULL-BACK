import pool from "../db.js";

class AssinaturaEstatutoController {
  async getAllEstatutosAssinados(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const resultsResult = await pool.query(
        "SELECT * FROM assinatura_estatuto LIMIT $1 OFFSET $2",
        [limit, offset]
      );
      const results = resultsResult.rows;

      const countResult = await pool.query(
        "SELECT COUNT(*) AS total FROM assinatura_estatuto"
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

  async getEstatutoAssinadosById(req, res) {
    try {
      const id = req.params.id;
      const result = await pool.query(
        "SELECT * FROM assinatura_estatuto WHERE id = $1",
        [id]
      );
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getEstatutoAssinadosByUser(req, res) {
    try {
      const id = req.params.id;
      const result = await pool.query(
        "SELECT * FROM assinatura_estatuto WHERE id_usuario = $1",
        [id]
      );
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async assinaturEstatuto(req, res) {
    try {
      const { id_usuario, id_turma, email, nome, data_assinada } = req.body;
      const result = await pool.query(
        "INSERT INTO assinatura_estatuto (id_usuario, id_turma, email, nome, data_assinada) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [id_usuario, id_turma, email, nome, data_assinada]
      );
      res.status(201).json({ id: result.rows[0].id, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new AssinaturaEstatutoController();
