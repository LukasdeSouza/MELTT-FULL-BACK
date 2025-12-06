import pool from "../db.js";

class TurmaController {
  async getAllTurmas(req, res) {
    const page = parseInt(req.query.page) || 1; // Página atual (default: 1)
    const limit = parseInt(req.query.limit) || 10; // Itens por página (default: 10)
    const offset = (page - 1) * limit; // Calcula o deslocamento
    const nome = req.query.nome || null; // Filtro opcional pelo nome
    const noPagination = req.query.all === 'true' || req.query.noPagination === 'true'; // Desabilita paginação

    try {
      let query = "SELECT * FROM turmas";
      let countQuery = "SELECT COUNT(*) AS total FROM turmas";
      let queryParams = [];
      let countParams = [];

      // Aplica filtro se fornecido
      if (nome) {
        query += ` WHERE nome LIKE $1`;
        countQuery += ` WHERE nome LIKE $1`;
        queryParams.push(`%${nome}%`);
        countParams.push(`%${nome}%`);
      }

      // Aplica paginação apenas se não for solicitado todos os registros
      if (!noPagination) {
        const limitParam = queryParams.length + 1;
        const offsetParam = queryParams.length + 2;
        query += ` LIMIT $${limitParam} OFFSET $${offsetParam}`;
        queryParams.push(limit, offset);
      }

      const result = await pool.query(query, queryParams);
      const results = result.rows;

      // Se não há paginação, retorna formato simplificado
      if (noPagination) {
        res.status(200).json({
          totalItems: results.length,
          data: results,
        });
      } else {
        // Com paginação, mantém o formato original
        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].total);
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
          page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          data: results,
        });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getTurmaById(req, res) {
    const id = req.params.id;
    try {
      const result = await pool.query("SELECT * FROM turmas WHERE id = $1", [
        id,
      ]);
      res.status(200).json({ data: result.rows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getTurmaByFaculdadeId(req, res) {
    const id = req.params.id;
    try {
      const result = await pool.query(
        "SELECT * FROM turmas WHERE faculdade_id = $1",
        [id]
      );
      res.status(200).json(result.rows);
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
      meltt_contrato_uuid,
      tem_brinde,
      instituicao,
      temporada_id
    } = req.body;
    const query =
      "INSERT INTO turmas (nome, identificador, regras_adesao, regras_renegociacao, regras_rescisao, arquivo_url, meltt_contrato_url, ano_formatura, estatuto_uuid, meltt_contrato_uuid, tem_brinde, instituicao, temporada_id ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id";
    try {
      const result = await pool.query(query, [
        nome,
        identificador,
        regras_adesao,
        regras_renegociacao ?? null,
        regras_rescisao ?? null,
        arquivo_url,
        meltt_contrato_url,
        ano_formatura,
        estatuto_uuid,
        meltt_contrato_uuid,
        tem_brinde ?? "nao",
        instituicao,
        temporada_id
      ]);
      res.status(201).json({ id: result.rows[0].id, ...req.body });
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
      meltt_contrato_url,
      tem_brinde
    } = req.body;
    const query =
      "UPDATE turmas SET nome = $1, identificador = $2, regras_adesao = $3, regras_renegociacao = $4, regras_rescisao = $5, ano_formatura = $6, arquivo_url = $7, meltt_contrato_url = $8, tem_brinde = $9 WHERE id = $10";
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
        tem_brinde ?? "nao",
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
      await pool.query("DELETE FROM turmas WHERE id = $1", [id]);
      res.status(200).json({ message: "Turma deletado com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async vincularPlanoFormatura(req, res) {
    const { turma_id, plano_id } = req.body; // Dados do corpo da requisição
    const query =
      "INSERT INTO turma_plano_formatura (turma_id, plano_id) VALUES ($1, $2)";
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
      "DELETE FROM turma_plano_formatura WHERE turma_id = $1 AND plano_id = $2";
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

    const querySelecionados = 'SELECT plano_id FROM turma_plano_formatura WHERE turma_id = $1';

    try {
      const result = await pool.query(querySelecionados, [turma_id]);
      const planosAtuais = result.rows.map(row => row.plano_id);

      // Identificar planos a remover (presentes antes, mas não agora)
      const planosRemover = planosAtuais.filter(plano => !planos_ids.includes(plano));

      // Identificar planos a adicionar (não estavam antes, mas foram selecionados agora)
      const planosAdicionar = planos_ids.filter(plano => !planosAtuais.includes(plano));

      // Executa as operações
      const promises = [];

      if (planosRemover.length > 0) {
        const placeholders = planosRemover.map((_, i) => `$${i + 2}`).join(',');
        const removerQuery = `DELETE FROM turma_plano_formatura WHERE turma_id = $1 AND plano_id IN (${placeholders})`;
        promises.push(pool.query(removerQuery, [turma_id, ...planosRemover]));
      }

      if (planosAdicionar.length > 0) {
        for (const plano of planosAdicionar) {
          promises.push(pool.query('INSERT INTO turma_plano_formatura (turma_id, plano_id) VALUES ($1, $2)', [turma_id, plano]));
        }
      }

      await Promise.all(promises);
      res.status(200).json({ message: "Planos de formatura atualizados com sucesso!" });
    } catch (error) {
      res.status(500).json(error);
    }
  }

  async getEventosByTurmaId(req, res) {
    const turma_id = req.params.id;
    try {
      const result = await pool.query(
        "SELECT * FROM eventos WHERE turma_id = $1",
        [turma_id]
      );
      res.status(200).json({ data: result.rows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

}


export default new TurmaController();
