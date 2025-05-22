import pool from "../db.js";

class TurmaController {
  async getAllTurmas(req, res) {
    const page = parseInt(req.query.page) || 1; // Página atual (default: 1)
    const limit = parseInt(req.query.limit) || 10; // Itens por página (default: 10)
    const offset = (page - 1) * limit; // Calcula o deslocamento

    try {
      const [results] = await pool.query(
        "SELECT * FROM turmas LIMIT ? OFFSET ?",
        [limit, offset]
      );
      const [countResult] = await pool.query(
        "SELECT COUNT(*) AS total FROM turmas"
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

  async getTurmaById(req, res) {
    const id = req.params.id;
    try {
      const [result] = await pool.query("SELECT * FROM turmas WHERE id = ?", [
        id,
      ]);
      res.status(200).json({ data: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getTurmaByFaculdadeId(req, res) {
    const id = req.params.id;
    try {
      const [result] = await pool.query(
        "SELECT * FROM turmas WHERE faculdade_id = ?",
        [id]
      );
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createTurma(req, res) {
    const {
      nome,
      identificador,
      regras_adesao,
      regras_renegociacao,
      regras_rescisao,
      arquivo_url,
      meltt_contrato_url,
      ano_formatura,
      estatuto_uuid,
      meltt_contrato_uuid
    } = req.body;
    const query =
      "INSERT INTO turmas (nome, identificador, regras_adesao, regras_renegociacao, regras_rescisao, arquivo_url, meltt_contrato_url, ano_formatura, estatuto_uuid, meltt_contrato_uuid ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    try {
      const [result] = await pool.query(query, [
        nome,
        identificador,
        regras_adesao,
        regras_renegociacao ?? null,
        regras_rescisao ?? null,
        arquivo_url,
        meltt_contrato_url,
        ano_formatura,
        estatuto_uuid,
        meltt_contrato_uuid
      ]);
      res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateTurma(req, res) {
    const id = req.params.id;
    const {
      nome,
      identificador,
      regras_adesao,
      regras_renegociacao,
      regras_rescisao,
      ano_formatura,
      arquivo_url,
      meltt_contrato_url
    } = req.body;
    const query =
      "UPDATE turmas SET nome = ?, identificador = ?, regras_adesao = ?, regras_renegociacao = ?, regras_rescisao = ?, ano_formatura = ?, arquivo_url = ?, meltt_contrato_url = ? WHERE id = ?";
    try {
      await pool.query(query, [
        nome,
        identificador,
        regras_adesao,
        regras_renegociacao ?? null,
        regras_rescisao ?? null,
        ano_formatura,
        arquivo_url,
        meltt_contrato_url,
        id,
      ]);
      res.status(200).json({ message: "Turma atualizado com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteTurma(req, res) {
    const id = req.params.id;
    try {
      await pool.query("DELETE FROM turmas WHERE id = ?", [id]);
      res.status(200).json({ message: "Turma deletado com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async vincularPlanoFormatura(req, res) {
    const { turma_id, plano_id } = req.body; // Dados do corpo da requisição
    const query =
      "INSERT INTO turma_plano_formatura (turma_id, plano_id) VALUES (?, ?)";
    try {
      await pool.query(query, [turma_id, plano_id]);
      res
        .status(201)
        .json({ message: "Plano de formatura vinculado com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async desvincularPlanoFormatura(req, res) {
    const { turma_id, plano_id } = req.body; // Dados do corpo da requisição
    const query =
      "DELETE FROM turma_plano_formatura WHERE turma_id = ? AND plano_id = ?";
    try {
      await pool.query(query, [turma_id, plano_id]);
      res
        .status(200)
        .json({ message: "Plano de formatura desvinculado com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async atualizarPlanosFormatura(req, res) {
    const { turma_id, planos_ids } = req.body; // Lista de planos selecionados no frontend

    if (!turma_id || !Array.isArray(planos_ids)) {
      return res.status(400).json({ message: "Dados inválidos" });
    }

    const querySelecionados = 'SELECT plano_id FROM turma_plano_formatura WHERE turma_id = ?';

    await pool.query(querySelecionados, [turma_id], (err, result) => {
      if (err) return res.status(500).json(err);

      const planosAtuais = result.map(row => row.plano_id);

      // Identificar planos a remover (presentes antes, mas não agora)
      const planosRemover = planosAtuais.filter(plano => !planos_ids.includes(plano));

      // Identificar planos a adicionar (não estavam antes, mas foram selecionados agora)
      const planosAdicionar = planos_ids.filter(plano => !planosAtuais.includes(plano));

      // Monta as queries necessárias
      const removerQuery = 'DELETE FROM turma_plano_formatura WHERE turma_id = ? AND plano_id IN (?)';
      const adicionarQuery = 'INSERT INTO turma_plano_formatura (turma_id, plano_id) VALUES ?';

      // Executa as operações
      const promises = [];

      if (planosRemover.length > 0) {
        promises.push(pool.query(removerQuery, [turma_id, planosRemover]));
      }

      if (planosAdicionar.length > 0) {
        const valoresAdicionar = planosAdicionar.map(plano => [turma_id, plano]);
        promises.push(pool.query(adicionarQuery, [valoresAdicionar]));
      }

      Promise.all(promises)
        .then(() => res.status(200).json({ message: "Planos de formatura atualizados com sucesso!" }))
        .catch(error => res.status(500).json(error));
    });
  }


}


export default new TurmaController();
