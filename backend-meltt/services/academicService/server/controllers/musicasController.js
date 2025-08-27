import db from "../db.js";

class MusicasController {
  async getAllMusicas(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
      const [data, total] = await Promise.all([
        db.query("SELECT * FROM musicas LIMIT ? OFFSET ?", [limit, offset]),
        db.query("SELECT COUNT(*) AS total FROM musicas"),
      ]);

      const dataRows = data[0];
      const totalCount = total[0]?.[0]?.total || 0;

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
      const [rows] = await db.query("SELECT * FROM musicas WHERE id = ?", [req.params.id]);
      res.status(rows.length ? 200 : 404).json(rows[0] || { error: "Música não encontrada" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getMusicasByTurmaId(req, res) {
    try {
      const [rows] = await db.query("SELECT * FROM musicas WHERE turma_id = ?", [req.params.id]);
      res.status(200).json(rows);
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

      const [result] = await db.query(
        "INSERT INTO musicas SET ?",
        { turma_id, nome, url_arquivo, user_id }
      );

      res.status(201).json({ id: result.insertId, turma_id, nome, url_arquivo, user_id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateMusica(req, res) {
    try {
      const [result] = await db.query(
        "UPDATE musicas SET ? WHERE id = ?",
        [req.body, req.params.id]
      );

      if (!result.affectedRows) {
        return res.status(404).json({ error: "Música não encontrada" });
      }

      const [rows] = await db.query("SELECT * FROM musicas WHERE id = ?", [req.params.id]);
      res.status(200).json({ message: "Atualizada com sucesso", value: rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteMusica(req, res) {
    try {
      const [result] = await db.query("DELETE FROM musicas WHERE id = ?", [req.params.id]);

      if (!result.affectedRows) {
        return res.status(404).json({ error: "Música não encontrada" });
      }

      res.status(200).json({ message: "Deletada com sucesso", id: req.params.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new MusicasController();