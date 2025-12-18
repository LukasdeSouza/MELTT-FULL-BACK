import pool from "../db.js";

const normalizeDateFilter = (value) => {
  if (!value) return null;

  const trimmed = String(value).trim();

  const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    return trimmed;
  }

  const brSlashMatch = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (brSlashMatch) {
    const [, day, month, year] = brSlashMatch;
    return `${year}-${month}-${day}`;
  }

  const brDashMatch = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (brDashMatch) {
    const [, day, month, year] = brDashMatch;
    return `${year}-${month}-${day}`;
  }

  return trimmed;
};

class CustosController {
  async getAllCustos(req, res) {
    const page = parseInt(req.query.page) || 1;
    let limit = req.query.limit === 'all' ? null : parseInt(req.query.limit) || 10;

    // NÃO calcular offset quando limit=all
    let offset = limit ? (page - 1) * limit : 0;

    const situacao = req.query.situacao;
    const tipoCusto = req.query.tipo_custo;
    const evento = req.query.evento;
    const turmaId = req.query.turma_id;
    const vencimento = normalizeDateFilter(req.query.vencimento);

    const situacoesValidas = ["Pendente", "Pago", "Parcialmente Pago", "Vencido"];
    const tiposValidos = ["Fixo", "Pre-evento", "Temporada"];

    try {
      let query = `SELECT custos.*, turmas.nome AS turma_nome, turmas.identificador AS turma_identificador
                   FROM custos
                   LEFT JOIN turmas ON custos.turma_id = turmas.id`;
      let countQuery = `SELECT COUNT(*) AS total FROM custos LEFT JOIN turmas ON custos.turma_id = turmas.id`;

      const filters = [];

      if (situacao && situacoesValidas.includes(situacao)) {
        filters.push({
          clause: (index) => `custos.situacao = $${index}`,
          value: situacao,
        });
      }

      const tipoFiltroValido = tipoCusto && tipoCusto !== "Todos" && tiposValidos.includes(tipoCusto);

      if (tipoFiltroValido) {
        filters.push({
          clause: (index) => `custos.tipo_custo = $${index}`,
          value: tipoCusto,
        });
      }

      if (evento) {
        filters.push({
          clause: (index) => `custos.evento LIKE $${index}`,
          value: `%${evento}%`,
        });
      }

      if (turmaId) {
        filters.push({
          clause: (index) => `custos.turma_id = $${index}`,
          value: turmaId,
        });
      }

      if (vencimento) {
        filters.push({
          clause: (index) => `DATE(custos.vencimento) = $${index}::date`,
          value: vencimento,
        });
      }

      if (filters.length > 0) {
        const whereClause = filters
          .map((filter, idx) => filter.clause(idx + 1))
          .join(" AND ");

        query += ` WHERE ${whereClause}`;
        countQuery += ` WHERE ${whereClause}`;
      }

      const params = filters.map((filter) => filter.value);
      const countParams = [...params];

      if (process.env.NODE_ENV !== "production") {
        console.log("[CustosController] filtros aplicados:", {
          situacao,
          tipoCusto,
          evento,
          turmaId,
          vencimento,
        });
        console.log("[CustosController] params query:", params);
      }

      query += " ORDER BY custos.criado_em DESC";

      // Aplicar LIMIT e OFFSET APENAS quando há limite definido (não é 'all')
      if (limit) {
        const limitParam = params.length + 1;
        const offsetParam = params.length + 2;
        query += ` LIMIT $${limitParam} OFFSET $${offsetParam}`;
        params.push(limit, offset);
      }
      // Quando limit=all, não adiciona LIMIT/OFFSET - traz TUDO

      const resultsResult = await pool.query(query, params);
      const results = resultsResult.rows;
      const countResult = await pool.query(countQuery, countParams);
      const total = parseInt(countResult.rows[0].total);

      const totalPages = limit ? Math.ceil(total / limit) : 1;

      res.status(200).json({
        page: limit ? page : 1,
        totalPages,
        totalItems: total,
        itemsPerPage: limit || total, // Quando limit=all, mostra o total real
        data: results,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getCustosById(req, res) {
    const id = req.params.id;
    try {
      const result = await pool.query(
        `SELECT custos.*, turmas.nome AS turma_nome, turmas.identificador AS turma_identificador, fornecedores.nome AS fornecedor_nome
         FROM custos
         LEFT JOIN turmas ON custos.turma_id = turmas.id
         LEFT JOIN fornecedores ON custos.fornecedor_id = fornecedores.id
         WHERE custos.id_custo = $1`,
        [id]
      );
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getTotalCustos(req, res) {
    try {
      const totalResult = await pool.query(
        `SELECT SUM(valor) AS total FROM custos`
      );

      const totalByTypeResult = await pool.query(
        `SELECT
        tipo_custo,
        SUM(valor) AS total
      FROM custos
      GROUP BY tipo_custo`
      );

      // Detalhamento por situação de pagamento
      const paymentDetailsByTypeResult = await pool.query(
        `SELECT
          tipo_custo,
          situacao,
          SUM(valor) AS total_valor,
          SUM(CASE WHEN situacao = 'Parcialmente Pago' THEN valor_pago_parcial ELSE 0 END) AS total_pago_parcial,
          SUM(CASE WHEN situacao = 'Pago' THEN valor ELSE 0 END) AS total_pago_completo
        FROM custos
        GROUP BY tipo_custo, situacao`
      );
      const paymentDetailsByType = paymentDetailsByTypeResult.rows;

      // Totais gerais por situação
      const paymentDetailsGeneralResult = await pool.query(
        `SELECT
          situacao,
          SUM(valor) AS total_valor,
          SUM(CASE WHEN situacao = 'Parcialmente Pago' THEN valor_pago_parcial ELSE 0 END) AS total_pago_parcial,
          SUM(CASE WHEN situacao = 'Pago' THEN valor ELSE 0 END) AS total_pago_completo
        FROM custos
        GROUP BY situacao`
      );
      const paymentDetailsGeneral = paymentDetailsGeneralResult.rows;

      const totalGeralCentavos = parseFloat(totalResult.rows[0]?.total) || 0;
      const totalGeralReais = totalGeralCentavos / 100;

      const formatToCurrency = (centavos) => {
        const reais = (centavos || 0) / 100;
        return reais.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });
      };

      const totaisPorTipo = {
        'Fixo': 0,
        'Pre-evento': 0,
        'Temporada': 0
      };

      totalByTypeResult.rows.forEach(row => {
        if (totaisPorTipo.hasOwnProperty(row.tipo_custo)) {
          totaisPorTipo[row.tipo_custo] = row.total || 0;
        }
      });

      // Processar detalhes de pagamento por tipo
      const getPaymentDetails = (tipo) => {
        const details = paymentDetailsByType.filter(row => row.tipo_custo === tipo);

        let totalValor = 0;
        let totalPago = 0;
        let totalPendente = 0;
        let totalParcial = 0;
        let totalVencido = 0;

        details.forEach(row => {
          const valor = parseFloat(row.total_valor) || 0;

          if (row.situacao === 'Pago') {
            totalPago += valor;
          } else if (row.situacao === 'Pendente') {
            totalPendente += valor; // Valor completo está pendente
          } else if (row.situacao === 'Parcialmente Pago') {
            const valorPagoParcial = parseFloat(row.total_pago_parcial) || 0;
            totalParcial += valorPagoParcial; // Valor que já foi pago parcialmente
            totalPago += valorPagoParcial; // Soma o que foi pago parcialmente
            totalPendente += (valor - valorPagoParcial); // O restante é pendente
          } else if (row.situacao === 'Vencido') {
            totalVencido += valor;
            totalPendente += valor; // Valores vencidos também são pendentes
          }

          totalValor += valor;
        });

        return {
          total: {
            centavos: totalValor,
            reais: totalValor / 100,
            formatado: formatToCurrency(totalValor)
          },
          pago: {
            centavos: totalPago,
            reais: totalPago / 100,
            formatado: formatToCurrency(totalPago)
          },
          pendente: {
            centavos: totalPendente,
            reais: totalPendente / 100,
            formatado: formatToCurrency(totalPendente)
          },
          parcial: {
            centavos: totalParcial,
            reais: totalParcial / 100,
            formatado: formatToCurrency(totalParcial)
          },
          vencido: {
            centavos: totalVencido,
            reais: totalVencido / 100,
            formatado: formatToCurrency(totalVencido)
          }
        };
      };

      // Processar totais gerais
      let totalGeralPago = 0;
      let totalGeralPendente = 0;
      let totalGeralParcial = 0;
      let totalGeralVencido = 0;

      paymentDetailsGeneral.forEach(row => {
        const valor = parseFloat(row.total_valor) || 0;

        if (row.situacao === 'Pago') {
          totalGeralPago += valor;
        } else if (row.situacao === 'Pendente') {
          totalGeralPendente += valor; // Valor completo está pendente
        } else if (row.situacao === 'Parcialmente Pago') {
          const valorPagoParcial = parseFloat(row.total_pago_parcial) || 0;
          totalGeralParcial += valorPagoParcial; // Valor que já foi pago parcialmente
          totalGeralPago += valorPagoParcial; // Soma o que foi pago dos parciais
          totalGeralPendente += (valor - valorPagoParcial); // Soma o que ainda falta pagar dos parciais
        } else if (row.situacao === 'Vencido') {
          totalGeralVencido += valor;
          totalGeralPendente += valor; // Valores vencidos também são pendentes
        }
      });

      console.log('Debug - Payment Details General:', JSON.stringify(paymentDetailsGeneral, null, 2));
      console.log('Debug - Totais calculados:', {
        totalGeralPago,
        totalGeralPendente,
        totalGeralParcial,
        totalGeralVencido,
        totalGeralCentavos
      });

      // Receita total (somente pagos e parcialmente pagos)
      const receitaTotalCentavos =
        (paymentDetailsGeneral.find(r => r.situacao === 'Pago')?.total_valor || 0) +
        (paymentDetailsGeneral.find(r => r.situacao === 'Parcialmente Pago')?.total_pago_parcial || 0);

      const receitaTotal = totalGeralPago + totalGeralParcial

      const response = {
        totalGeral: formatToCurrency(totalGeralCentavos),
        totalGeralCentavos: totalGeralCentavos,
        totalGeralReais: totalGeralReais,
        detalhamentoGeral: {
          pago: {
            centavos: totalGeralPago,
            reais: totalGeralPago / 100,
            formatado: formatToCurrency(totalGeralPago)
          },
          pendente: {
            centavos: totalGeralPendente,
            reais: totalGeralPendente / 100,
            formatado: formatToCurrency(totalGeralPendente)
          },
          parcial: {
            centavos: totalGeralParcial,
            reais: totalGeralParcial / 100,
            formatado: formatToCurrency(totalGeralParcial)
          },
          vencido: {
            centavos: totalGeralVencido,
            reais: totalGeralVencido / 100,
            formatado: formatToCurrency(totalGeralVencido)
          }
        },
        totaisPorTipo: {
          fixo: getPaymentDetails('Fixo'),
          preEvento: getPaymentDetails('Pre-evento'),
          temporada: getPaymentDetails('Temporada')
        },
        receitaTotal: {
          centavos: receitaTotal,
          reais: receitaTotal / 100,
          formatado: formatToCurrency(receitaTotal)
        }
      };

      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getTotalCustosById(req, res) {
    const turmaId = req.params.id; // id da turma vindo da rota
    try {
      const totalResult = await pool.query(
        `SELECT SUM(valor) AS total 
       FROM custos 
       WHERE turma_id = $1`,
        [turmaId]
      );

      const totalByTypeResult = await pool.query(
        `SELECT 
        tipo_custo,
        SUM(valor) AS total
       FROM custos 
       WHERE turma_id = $1
       GROUP BY tipo_custo`,
        [turmaId]
      );

      const totalGeralCentavos = parseFloat(totalResult.rows[0]?.total) || 0;
      const totalGeralReais = totalGeralCentavos / 100;

      const formatToCurrency = (centavos) => {
        const reais = centavos / 100;
        return reais.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });
      };

      const totaisPorTipo = {
        'Fixo': 0,
        'Pre-evento': 0,
        'Temporada': 0
      };

      totalByTypeResult.rows.forEach(row => {
        if (totaisPorTipo.hasOwnProperty(row.tipo_custo)) {
          totaisPorTipo[row.tipo_custo] = row.total || 0;
        }
      });

      const response = {
        turmaId,
        totalGeral: formatToCurrency(totalGeralCentavos),
        totalGeralCentavos: totalGeralCentavos,
        totalGeralReais: totalGeralReais,
        totaisPorTipo: {
          fixo: {
            centavos: totaisPorTipo['Fixo'],
            reais: totaisPorTipo['Fixo'] / 100,
            formatado: formatToCurrency(totaisPorTipo['Fixo'])
          },
          preEvento: {
            centavos: totaisPorTipo['Pre-evento'],
            reais: totaisPorTipo['Pre-evento'] / 100,
            formatado: formatToCurrency(totaisPorTipo['Pre-evento'])
          },
          temporada: {
            centavos: totaisPorTipo['Temporada'],
            reais: totaisPorTipo['Temporada'] / 100,
            formatado: formatToCurrency(totaisPorTipo['Temporada'])
          }
        }
      };

      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }


  async createCustos(req, res) {
    const {
      tipo_custo,
      turma_id,
      evento,
      fornecedor_id,
      beneficiario,
      categoria,
      valor,
      valor_pago_parcial,
      vencimento,
      situacao,
      chave_pix
    } = req.body;
    console.log(req.body, "req.body custos");
    const query =
      `INSERT INTO custos (tipo_custo, turma_id, evento, fornecedor_id, beneficiario, categoria, valor, valor_pago_parcial, vencimento, situacao, chave_pix)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`;
    try {
      const result = await pool.query(query, [
        tipo_custo,
        turma_id,
        evento,
        fornecedor_id,
        beneficiario,
        categoria,
        valor,
        valor_pago_parcial,
        vencimento,
        situacao,
        chave_pix ?? null
      ]);
      res.status(201).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateCustos(req, res) {
    const id = req.params.id;
    const {
      tipo_custo,
      turma_id,
      evento,
      fornecedor_id,
      beneficiario,
      categoria,
      valor,
      valor_pago_parcial,
      vencimento,
      situacao,
      chave_pix
    } = req.body;
    const query =
      `UPDATE custos
         SET tipo_custo = $1,
             turma_id = $2,
             evento = $3,
             fornecedor_id = $4,
             beneficiario = $5,
             categoria = $6,
             valor = $7,
             valor_pago_parcial = $8,
             vencimento = $9,
             situacao = $10,
             chave_pix = $11
       WHERE id_custo = $12`;
    try {
      await pool.query(query, [
        tipo_custo,
        turma_id,
        evento,
        fornecedor_id,
        beneficiario,
        categoria,
        valor,
        valor_pago_parcial,
        vencimento,
        situacao,
        chave_pix ?? null,
        id
      ]);
      res.status(200).json({
        message: "Custo atualizado com sucesso!",
        result: req.body,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteCustos(req, res) {
    const id = req.params.id;
    try {
      await pool.query("DELETE FROM custos WHERE id_custo = $1", [id]);
      res
        .status(200)
        .json({ message: "Custo deletado com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new CustosController();
