import pool from '../db.js';

// @desc    Adicionar uma turma ao pipeline comercial
// @route   POST /api/comercial/turmas
// @access  Private
export const addTurmaToPipeline = async (req, res) => {
  const { turma_id, contatoPrincipal, telefone, status, createdBy } = req.body;

  if (!turma_id || !contatoPrincipal) {
    return res.status(400).json({ message: 'turma_id e contatoPrincipal são obrigatórios' });
  }

  try {
    // Verifica se a turma já está no pipeline
    const existingResult = await pool.query(
      'SELECT * FROM turmas_comercial WHERE turma_id = $1',
      [turma_id]
    );

    if (existingResult.rows.length > 0) {
      return res.status(409).json({ message: 'Esta turma já está no pipeline comercial.' });
    }

    const timeline = [{
      data: new Date(),
      acao: `Status inicial definido como ${status || 'contato'}`,
      tipo: status || 'contato',
    }];

    const estatisticas = {
      propostas: 0,
      reunioes: { agendadas: 0, realizadas: 0, remarcadas: 0 },
    };

    const result = await pool.query(
      'INSERT INTO turmas_comercial (turma_id, contatoPrincipal, telefone, status, timeline, estatisticas, createdBy) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
      [turma_id, contatoPrincipal, telefone, status || 'contato', JSON.stringify(timeline), JSON.stringify(estatisticas), createdBy]
    );

    res.status(201).json({ id: result.rows[0].id, turma_id, contatoPrincipal, status: status || 'contato' });
  } catch (error) {
    console.error('Erro ao adicionar turma ao pipeline:', error);
    res.status(500).json({ message: 'Erro de servidor' });
  }
};

// @desc    Obter todas as turmas no pipeline comercial
// @route   GET /api/comercial/turmas
// @access  Private
export const getPipelineTurmas = async (req, res) => {
  const { status } = req.query;

  const safeJsonParse = (value, fallback) => {
    try {
      if (value === null || value === undefined) return fallback;
      if (typeof value === 'object') return value; // já é objeto
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  };

  try {
    let query = `
      SELECT 
        tc.id,
        tc.turma_id,
        t.nome,
        t.instituicao,
        tc.contatoPrincipal,
        tc.telefone,
        tc.status,
        tc.timeline,
        tc.estatisticas,
        tc.dataPrimeiroContato,
        tc.createdAt,
        tc.updateAt
      FROM turmas_comercial tc
      JOIN turmas t ON tc.turma_id = t.id
    `;

    const params = [];
    if (status) {
      query += ' WHERE tc.status = $1';
      params.push(status);
    }

    query += ' ORDER BY tc.createdAt DESC';

    const result = await pool.query(query, params);

    const results = result.rows.map(row => ({
      ...row,
      timeline: safeJsonParse(row.timeline, []),
      estatisticas: safeJsonParse(row.estatisticas, {}),
    }));

    res.status(200).json(results);
  } catch (error) {
    console.error('Erro ao obter turmas do pipeline:', error.message);
    res.status(500).json({ message: error.message || 'Erro de servidor' });
  }
};

// @desc    Atualizar o status de uma turma no pipeline
// @route   PATCH /api/comercial/turmas/:id
// @access  Private
export const updateTurmaStatus = async (req, res) => {
  const { id } = req.params;
  const { status, acao, responsavel } = req.body;

  if (!status || !acao) {
    return res.status(400).json({ message: 'status e acao são obrigatórios' });
  }

  try {
    // Buscar a turma para obter a timeline atual
    const turmasResult = await pool.query('SELECT * FROM turmas_comercial WHERE id = $1', [id]);

    if (turmasResult.rows.length === 0) {
      return res.status(404).json({ message: 'Turma não encontrada no pipeline' });
    }

    const turma = turmasResult.rows[0];

    let timeline = [];
    try {
      // Pode ser JSON válido ou [object Object]
      if (typeof turma.timeline === 'string') {
        timeline = JSON.parse(turma.timeline);
      } else if (Array.isArray(turma.timeline)) {
        timeline = turma.timeline;
      } else {
        timeline = [];
      }
    } catch (e) {
      console.warn('Timeline inválida, redefinindo para []');
      timeline = [];
    }

    let estatisticas = {};
    try {
      estatisticas =
        typeof turma.estatisticas === 'string'
          ? JSON.parse(turma.estatisticas)
          : turma.estatisticas || {};
    } catch (e) {
      console.warn('Estatísticas inválidas, redefinindo para {}');
      estatisticas = {};
    }

    // Adicionar novo evento à timeline
    timeline.push({
      data: new Date(),
      acao: acao,
      tipo: status,
      responsavel: responsavel, // ID do usuário que fez a ação
    });

    // Lógica para atualizar estatísticas (exemplo)
    if (!estatisticas.reunioes) estatisticas.reunioes = { agendadas: 0 };
    if (status === 'reuniao') {
      estatisticas.reunioes.agendadas =
        (estatisticas.reunioes.agendadas || 0) + 1;
    } else if (status === 'proposta') {
      estatisticas.propostas = (estatisticas.propostas || 0) + 1;
    }

    await pool.query(
      'UPDATE turmas_comercial SET status = $1, timeline = $2, estatisticas = $3 WHERE id = $4',
      [status, JSON.stringify(timeline), JSON.stringify(estatisticas), id]
    );

    res.status(200).json({ message: 'Status da turma atualizado com sucesso' });
  } catch (error) {
    console.error('Erro ao atualizar status da turma:', error);
    res.status(500).json({ message: 'Erro de servidor' });
  }
};

// @desc    Obter estatísticas do pipeline comercial
// @route   GET /api/comercial/stats
// @access  Private
export const getPipelineStats = async (req, res) => {
  try {
    const statusCountsResult = await pool.query(
      'SELECT status, COUNT(*) as count FROM turmas_comercial GROUP BY status'
    );

    const stats = {
      contato: 0,
      reuniao: 0,
      proposta: 0,
      negociacao: 0,
      fechada: 0,
      perdida: 0,
    };

    statusCountsResult.rows.forEach(item => {
      stats[item.status] = parseInt(item.count);
    });

    const totalInitial = stats.contato + stats.reuniao + stats.proposta + stats.negociacao + stats.fechada + stats.perdida;

    const conversionRates = {
      contato_reuniao: stats.contato > 0 ? ((stats.reuniao + stats.proposta + stats.negociacao) / (stats.contato + stats.reuniao + stats.proposta + stats.negociacao)) * 100 : 0,
      reuniao_proposta: (stats.reuniao + stats.proposta + stats.negociacao) > 0 ? ((stats.proposta + stats.negociacao) / (stats.reuniao + stats.proposta + stats.negociacao)) * 100 : 0,
      proposta_negociacao: (stats.proposta + stats.negociacao) > 0 ? (stats.negociacao / (stats.proposta + stats.negociacao)) * 100 : 0,
    };

    res.status(200).json({ stats, conversionRates });

  } catch (error) {
    console.error('Erro ao obter estatísticas do pipeline:', error);
    res.status(500).json({ message: 'Erro de servidor' });
  }
};