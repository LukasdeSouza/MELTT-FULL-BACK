import pool from "../db.js";

class FeedbackController {
  async getAllFeedbacks(req, res) {
    const page = parseInt(req.query.page) || 1; // Página atual (default: 1)
    const limit = parseInt(req.query.limit) || 10; // Itens por página (default: 10)
    const offset = (page - 1) * limit; // Calcula o deslocamento
    const turma_id = req.query.turma_id || null; // Filtro opcional por turma
    const usuario_id = req.query.usuario_id || null; // Filtro opcional por usuário

    try {
      let query = "SELECT * FROM feedback";
      let countQuery = "SELECT COUNT(*) AS total FROM feedback";
      let queryParams = [];
      let countParams = [];
      const conditions = [];

      // Aplica filtros se fornecidos
      if (turma_id) {
        conditions.push("turma_id = ?");
        queryParams.push(turma_id);
        countParams.push(turma_id);
      }

      if (usuario_id) {
        conditions.push("usuario_id = ?");
        queryParams.push(usuario_id);
        countParams.push(usuario_id);
      }

      if (conditions.length > 0) {
        const whereClause = " WHERE " + conditions.join(" AND ");
        query += whereClause;
        countQuery += whereClause;
      }

      query += " ORDER BY data_criacao DESC LIMIT ? OFFSET ?";
      queryParams.push(limit, offset);

      const [results] = await pool.query(query, queryParams);
      const [countResult] = await pool.query(countQuery, countParams);
      const total = countResult[0].total;
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

  async getFeedbackById(req, res) {
    const id = req.params.id;
    try {
      const [result] = await pool.query("SELECT * FROM feedback WHERE id = ?", [id]);
      if (result.length === 0) {
        return res.status(404).json({ error: "Feedback não encontrado" });
      }
      res.status(200).json({ data: result[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createFeedback(req, res) {
    const { turma_id, usuario_id, texto, nota } = req.body;

    // Validações
    if (!turma_id || !usuario_id || nota === undefined) {
      return res.status(400).json({ error: "turma_id, usuario_id e nota são obrigatórios" });
    }

    if (nota < 0 || nota > 5) {
      return res.status(400).json({ error: "A nota deve estar entre 0 e 5" });
    }

    const query =
      "INSERT INTO feedback (turma_id, usuario_id, texto, nota) VALUES (?, ?, ?, ?)";
    try {
      const [result] = await pool.query(query, [turma_id, usuario_id, texto || null, nota]);
      res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
      // Trata erro de constraint única (usuário já deu feedback para essa turma)
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json({ error: "Usuário já possui feedback para esta turma" });
      }
      res.status(500).json({ error: err.message });
    }
  }

  async deleteFeedback(req, res) {
    const id = req.params.id;
    try {
      const [result] = await pool.query("DELETE FROM feedback WHERE id = ?", [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Feedback não encontrado" });
      }
      res.status(200).json({ message: "Feedback deletado com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new FeedbackController();

