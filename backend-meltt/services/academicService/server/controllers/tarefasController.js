import pool from "../db.js";

class TarefasController {
  async getAllTarefas(req, res) {
    const page = parseInt(req.query.page) || 1; // Página atual (default: 1)
    const limit = parseInt(req.query.limit) || 10; // Itens por página (default: 10)
    const offset = (page - 1) * limit; // Calcula o deslocamento

    try {
      const [results] = await pool.query(
        "SELECT * FROM tarefas LIMIT ? OFFSET ?",
        [limit, offset]
      );
      const [countResult] = await pool.query(
        "SELECT COUNT(*) AS total FROM tarefas"
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
  };

  getTarefaById(req, res) {
    const id = req.params.id;
    db.query("SELECT * FROM tarefas WHERE id = ?", [id], (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(200).json(result);
    });
  };

  createTarefa(req, res) {
    const { nome, atribuido_por, responsaveis, prazo_tarefa } = req.body;
    const query =
      "INSERT INTO tarefas (nome, atribuido_por, responsaveis, prazo_tarefa) VALUES (?, ?)";
    db.query(query, [nome, atribuido_por, responsaveis, prazo_tarefa], (err, result) => {
      if (err) return res.status(500).json(err);
      res.status(201).json({ id: result.insertId, ...req.body });
    });
  };

  updateTarefa(req, res) {
    const id = req.params.id;
    const { nome, atribuido_por, responsaveis, prazo_tarefa } = req.body;
    const query =
      "UPDATE tarefas SET nome = ?, atribuido_por = ?, responsaveis = ? WHERE id = ?";
    db.query(query, [nome, atribuido_por, responsaveis, prazo_tarefa, id], (err) => {
      if (err) return res.status(500).json(err);
      res.status(200).json({ message: "Tarefa atualizada com sucesso!", id, ...req.body });
    });
  };

  deleteTarefa(req, res) {
    const id = req.params.id;
    db.query("DELETE FROM tarefas WHERE id = ?", [id], (err) => {
      if (err) return res.status(500).json(err);
      res.status(200).json({ message: "Turma deletada com sucesso!" });
    });
  };

  getResponsaveis(req, res) {
    db.query(
      "SELECT u.id AS usuario_id, u.nome AS usuario_nome, ut.tarefa_id FROM usuario_tarefa ut JOIN usuarios u ON ut.usuario_id = u.id",
      (err, result) => {
        if (err) {
          console.error("Erro na consulta:", err);
          return res.status(500).json({ error: "Erro ao buscar responsáveis", details: err });
        }
        console.log("Resultado da consulta:", result);
        res.status(200).json(result);
      }
    );
  }

  async getTarefaById(req, res) {
    const id = req.params.id;
    try {
      const [result] = await pool.query("SELECT * FROM tarefas WHERE id = ?", [id]);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createTarefa(req, res) {
    const { nome, atribuido_por } = req.body;
    const query = "INSERT INTO tarefas (nome, atribuido_por) VALUES (?, ?)";
    try {
      const [result] = await pool.query(query, [nome, atribuido_por]);
      res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateTarefa(req, res) {
    const id = req.params.id;
    const { nome, atribuido_por } = req.body;
    const query = "UPDATE tarefas SET nome = ?, atribuido_por = ? WHERE id = ?";
    try {
      await pool.query(query, [nome, atribuido_por, id]);
      res.status(200).json({ message: "Tarefa atualizada com sucesso!", id, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteTarefa(req, res) {
    const id = req.params.id;
    try {
      await pool.query("DELETE FROM tarefas WHERE id = ?", [id]);
      res.status(200).json({ message: "Tarefa deletada com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getResponsaveis(req, res) {
    try {
      const [result] = await pool.query(
        "SELECT u.id AS usuario_id, u.nome AS usuario_nome, ut.tarefa_id FROM usuario_tarefa ut JOIN usuarios u ON ut.usuario_id = u.id"
      );
      res.status(200).json(result);
    } catch (err) {
      console.error("Erro na consulta:", err);
      res.status(500).json({ error: "Erro ao buscar responsáveis", details: err.message });
    }
  }

  async vincularResponsavel(req, res) {
    const { usuario_id, tarefa_id } = req.body;
    const query = "INSERT INTO usuario_tarefa (usuario_id, tarefa_id) VALUES (?, ?)";
    try {
      await pool.query(query, [usuario_id, tarefa_id]);
      res.status(201).json({ message: "Responsável vinculado com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async desvincularResponsavel(req, res) {
    const { usuario_id, tarefa_id } = req.body;
    const query = "DELETE FROM usuario_tarefa WHERE usuario_id = ? AND tarefa_id = ?";
    try {
      await pool.query(query, [usuario_id, tarefa_id]);
      res.status(200).json({ message: "Responsável desvinculado com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new TarefasController();
