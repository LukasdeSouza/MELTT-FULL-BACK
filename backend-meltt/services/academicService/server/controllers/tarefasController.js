import pool from "../db.js";

class TarefasController {
  async getAllTarefas(req, res) {
    const page = parseInt(req.query.page) || 1; // Página atual (default: 1)
    const limit = parseInt(req.query.limit) || 10; // Itens por página (default: 10)
    const offset = (page - 1) * limit; // Calcula o deslocamento

    try {
      const resultsResult = await pool.query(
        "SELECT * FROM tarefas LIMIT $1 OFFSET $2",
        [limit, offset]
      );
      const results = resultsResult.rows;
      const countResult = await pool.query(
        "SELECT COUNT(*) AS total FROM tarefas"
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
  };


  async getTarefaById(req, res) {
    const id = req.params.id;
    try {
      const result = await pool.query("SELECT * FROM tarefas WHERE id = $1", [id]);
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createTarefa(req, res) {
    const { nome, atribuido_por } = req.body;
      const query = "INSERT INTO tarefas (nome, atribuido_por) VALUES ($1, $2) RETURNING id";
      try {
        const result = await pool.query(query, [nome, atribuido_por]);
        res.status(201).json({ id: result.rows[0].id, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateTarefa(req, res) {
    const id = req.params.id;
    const { nome, atribuido_por } = req.body;
    const query = "UPDATE tarefas SET nome = $1, atribuido_por = $2 WHERE id = $3";
    try {
      await pool.query(query, [nome, atribuido_por, id]);
      res.status(200).json({ message: "Tarefa atualizada com sucesso!", id, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteTarefa(req, res) {
    const id = req.params.id;
    console.log(`Tentando deletar tarefa com ID: ${id}`);
    try {
      await pool.query("UPDATE tarefas SET status = 0 WHERE id = $1", [id]);
      res.status(200).json({ message: "Tarefa Inativada com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getResponsaveis(req, res) {
    try {
      const result = await pool.query(
        "SELECT u.id AS usuario_id, u.nome AS usuario_nome, ut.tarefa_id FROM usuario_tarefa ut JOIN usuarios u ON ut.usuario_id = u.id"
      );
      res.status(200).json(result.rows);
    } catch (err) {
      console.error("Erro na consulta:", err);
      res.status(500).json({ error: "Erro ao buscar responsáveis", details: err.message });
    }
  }

  async vincularResponsavel(req, res) {
    const { usuario_id, tarefa_id } = req.body;
    const query = "INSERT INTO usuario_tarefa (usuario_id, tarefa_id) VALUES ($1, $2)";
    try {
      await pool.query(query, [usuario_id, tarefa_id]);
      res.status(201).json({ message: "Responsável vinculado com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async desvincularResponsavel(req, res) {
    const { usuario_id, tarefa_id } = req.body;
    const query = "DELETE FROM usuario_tarefa WHERE usuario_id = $1 AND tarefa_id = $2";
    try {
      await pool.query(query, [usuario_id, tarefa_id]);
      res.status(200).json({ message: "Responsável desvinculado com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new TarefasController();
