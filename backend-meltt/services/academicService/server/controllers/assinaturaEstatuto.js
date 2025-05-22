import pool from "../db.js";

class AssinaturaEstatutoController {
  async getAllEstatutosAssinados(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const [results] = await pool.promise().query(
        "SELECT * FROM assinatura_estatuto LIMIT ? OFFSET ?",
        [limit, offset]
      );

      const [[{ total }]] = await pool.promise().query(
        "SELECT COUNT(*) AS total FROM assinatura_estatuto"
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

  async getEstatutoAssinadosById(req, res) {
    try {
      const id = req.params.id;
      const [result] = await pool.promise().query(
        "SELECT * FROM assinatura_estatuto WHERE id = ?",
        [id]
      );
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getEstatutoAssinadosByUser(req, res) {
    try {
      const id = req.params.id;
      const [result] = await pool.promise().query(
        "SELECT * FROM assinatura_estatuto WHERE id_usuario = ?",
        [id]
      );
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async assinaturEstatuto(req, res) {
    try {
      const { id_usuario, id_turma, email, nome, data_assinada } = req.body;
      const [result] = await pool.promise().query(
        "INSERT INTO assinatura_estatuto (id_usuario, id_turma, email, nome, data_assinada) VALUES (?, ?, ?, ?, ?)",
        [id_usuario, id_turma, email, nome, data_assinada]
      );
      res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new AssinaturaEstatutoController();
