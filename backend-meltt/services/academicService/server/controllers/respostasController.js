import pool from "../db.js";

class RespostasController {
  async getAllRespostas(req, res) {
    const page = parseInt(req.query.page) || 1; // Página atual (default: 1)
    const limit = parseInt(req.query.limit) || 10; // Itens por página (default: 10)
    const offset = (page - 1) * limit; // Calcula o deslocamento

    try {
      const resultsResult = await pool.query(
        "SELECT * FROM respostas LIMIT $1 OFFSET $2",
        [limit, offset]
      );
      const results = resultsResult.rows;

      const countResult = await pool.query(
        "SELECT COUNT(*) AS total FROM respostas"
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

  async getRespostaById(req, res) {
    const id = req.params.id;
    try {
      const result = await pool.query(
        "SELECT * FROM respostas WHERE id = $1",
        [id]
      );
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getRespostaByTopicoId(req, res) {
    const id = req.params.id;
    try {
      const result = await pool.query(
        "SELECT * FROM respostas WHERE topico_id = $1",
        [id]
      );
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createResposta(req, res) {
    const { topico_id, usuario_id, resposta } = req.body;
    const query =
      "INSERT INTO respostas (topico_id, usuario_id, resposta) VALUES ($1, $2, $3) RETURNING id";
    try {
      const result = await pool.query(query, [topico_id, usuario_id, resposta]);
      res.status(201).json({ id: result.rows[0].id, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateResposta(req, res) {
    const id = req.params.id;
    const { topico_id, usuario_id, resposta } = req.body;
    const query =
      "UPDATE respostas SET topico_id = $1, usuario_id = $2, resposta = $3 WHERE id = $4";
    try {
      await pool.query(query, [topico_id, usuario_id, resposta, id]);
      res.status(200).json({ message: "Resposta atualizada com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteResposta(req, res) {
    const id = req.params.id;
    try {
      await pool.query("DELETE FROM respostas WHERE id = $1", [id]);
      res.status(200).json({ message: "Resposta deletada com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new RespostasController();
