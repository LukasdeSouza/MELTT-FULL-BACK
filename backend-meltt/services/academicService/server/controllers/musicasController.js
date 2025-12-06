import pool from "../db.js";

class MusicasController {
  async getAllMusicas(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
      const [dataResult, totalResult] = await Promise.all([
        pool.query("SELECT * FROM musicas LIMIT $1 OFFSET $2", [limit, offset]),
        pool.query("SELECT COUNT(*) AS total FROM musicas"),
      ]);

      const dataRows = dataResult.rows;
      const totalCount = parseInt(totalResult.rows[0]?.total) || 0;

      res.status(200).json({
        page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
        data: dataRows,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getMusicaById(req, res) {
    try {
      const result = await pool.query("SELECT * FROM musicas WHERE id = $1", [req.params.id]);
      res.status(result.rows.length ? 200 : 404).json(result.rows[0] || { error: "Música não encontrada" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getMusicasByTurmaId(req, res) {
    try {
      const result = await pool.query("SELECT * FROM musicas WHERE turma_id = $1", [req.params.id]);
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createMusica(req, res) {
    try {
      const { turma_id, nome, url_arquivo, user_id } = req.body;
      console.log(req.body)

      if (!turma_id || !nome || !url_arquivo || !user_id) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios" });
      }

      const result = await pool.query(
        "INSERT INTO musicas (turma_id, nome, url_arquivo, user_id) VALUES ($1, $2, $3, $4) RETURNING id",
        [turma_id, nome, url_arquivo, user_id]
      );

      res.status(201).json({ id: result.rows[0].id, turma_id, nome, url_arquivo, user_id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateMusica(req, res) {
    try {
      const { turma_id, nome, url_arquivo, user_id } = req.body;
      const updateResult = await pool.query(
        "UPDATE musicas SET turma_id = $1, nome = $2, url_arquivo = $3, user_id = $4 WHERE id = $5",
        [turma_id, nome, url_arquivo, user_id, req.params.id]
      );

      if (updateResult.rowCount === 0) {
        return res.status(404).json({ error: "Música não encontrada" });
      }

      const result = await pool.query("SELECT * FROM musicas WHERE id = $1", [req.params.id]);
      res.status(200).json({ message: "Atualizada com sucesso", value: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteMusica(req, res) {
    try {
      const result = await pool.query("DELETE FROM musicas WHERE id = $1", [req.params.id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Música não encontrada" });
      }

      res.status(200).json({ message: "Deletada com sucesso", id: req.params.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new MusicasController();