import pool from "../db.js";

class TopicosController {
  async getAllTopicos(req, res) {
    const page = parseInt(req.query.page) || 1; // Página atual (default: 1)
    const limit = parseInt(req.query.limit) || 10; // Itens por página (default: 10)
    const offset = (page - 1) * limit; // Calcula o deslocamento

    try {
      const [results] = await pool.query(
        "SELECT * FROM topicos LIMIT ? OFFSET ?",
        [limit, offset]
      );

      const [countResult] = await pool.query(
        "SELECT COUNT(*) AS total FROM topicos"
      );
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

  async getTopicoById(req, res) {
    const id = req.params.id;
    try {
      const [result] = await pool.query("SELECT * FROM topicos WHERE id = ?", [
        id,
      ]);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getTopicoByTurmaId(req, res) {
    const id = req.params.id;
    try {
      const [result] = await pool.query(
        "SELECT * FROM topicos WHERE turma_id = ?",
        [id]
      );
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createTopico(req, res) {
    const { turma_id, titulo, descricao, usuario_id } = req.body;
    try {
      const [result] = await pool.query(
        "INSERT INTO topicos (turma_id, titulo, descricao) VALUES (?, ?, ?)",
        [turma_id, titulo, descricao]
      );

      const mensagem = `Novo Tópico criado: ${titulo}`;
      const tipo = "ALUNO";
      await pool.query(
        "INSERT INTO notificacoes (usuario_id, tipo, mensagem) VALUES (?, ?, ?)",
        [usuario_id, tipo, mensagem]
      );

      res.status(201).json({ id: result.insertId, turma_id, titulo, descricao, usuario_id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateTopico(req, res) {
    const id = req.params.id;
    const { turma_id, aluno_id, titulo, descricao } = req.body;
    try {
      await pool.query(
        "UPDATE topicos SET turma_id = ?, aluno_id = ?, titulo = ?, descricao = ? WHERE id = ?",
        [turma_id, aluno_id, titulo, descricao, id]
      );
      res.status(200).json({ message: "Tópico atualizado com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteTopico(req, res) {
    const id = req.params.id;
    try {
      await pool.query("DELETE FROM topicos WHERE id = ?", [id]);
      res.status(200).json({ message: "Tópico deletado com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new TopicosController();
