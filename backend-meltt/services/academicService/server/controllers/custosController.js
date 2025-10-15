import pool from "../db.js";

class CustosController {
  async getAllCustos(req, res) {
    const page = parseInt(req.query.page) || 1;
    let limit = req.query.limit === 'all' ? null : parseInt(req.query.limit) || 10;

    // NÃO calcular offset quando limit=all
    let offset = limit ? (page - 1) * limit : 0;

    const situacao = req.query.situacao;
    const tipoCusto = req.query.tipo_custo;
    const evento = req.query.evento;

    const situacoesValidas = ["Pendente", "Pago", "Parcialmente Pago", "Vencido"];
    const tiposValidos = ["Fixo", "Pre-evento", "Temporada"];

    try {
      let query = `SELECT custos.*, turmas.nome AS turma_nome
                   FROM custos
                   LEFT JOIN turmas ON custos.turma_id = turmas.id`;
      let countQuery = `SELECT COUNT(*) AS total FROM custos`;

      const conditions = [];
      const params = [];
      const countParams = [];

      if (situacao && situacoesValidas.includes(situacao)) {
        conditions.push("custos.situacao = ?");
        params.push(situacao);
        countParams.push(situacao);
      }

      if (tipoCusto && tiposValidos.includes(tipoCusto)) {
        conditions.push("custos.tipo_custo = ?");
        params.push(tipoCusto);
        countParams.push(tipoCusto);
      }

      if (evento) {
        conditions.push("custos.evento LIKE ?");
        params.push(`%${evento}%`);
        countParams.push(`%${evento}%`);
      }

      if (conditions.length > 0) {
        const whereClause = " WHERE " + conditions.join(" AND ");
        query += whereClause;
        countQuery += whereClause;
      }

      // Aplicar LIMIT e OFFSET APENAS quando há limite definido (não é 'all')
      if (limit) {
        query += ` LIMIT ? OFFSET ?`;
        params.push(limit, offset);
      }
      // Quando limit=all, não adiciona LIMIT/OFFSET - traz TUDO

      const [results] = await pool.query(query, params);
      const [countResult] = await pool.query(countQuery, countParams);
      const total = countResult[0].total;

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
      const [result] = await pool.query(
        `SELECT custos.*, turmas.nome AS turma_nome, fornecedores.nome AS fornecedor_nome
         FROM custos
         LEFT JOIN turmas ON custos.turma_id = turmas.id
         LEFT JOIN fornecedores ON custos.fornecedor_id = fornecedores.id
         WHERE custos.id_custo = ?`,
        [id]
      );
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getTotalCustos(req, res) {
    try {
      const [totalResult] = await pool.query(
        `SELECT SUM(valor) AS total FROM custos`
      );

      const [totalByTypeResult] = await pool.query(
        `SELECT
        tipo_custo,
        SUM(valor) AS total
      FROM custos
      GROUP BY tipo_custo`
      );

      // Detalhamento por situação de pagamento
      const [paymentDetailsByType] = await pool.query(
        `SELECT
          tipo_custo,
          situacao,
          SUM(valor) AS total_valor,
          SUM(CASE WHEN situacao = 'Parcialmente Pago' THEN valor_pago_parcial ELSE 0 END) AS total_pago_parcial,
          SUM(CASE WHEN situacao = 'pago' THEN valor ELSE 0 END) AS total_pago_completo
        FROM custos
        GROUP BY tipo_custo, situacao`
      );

      // Totais gerais por situação
      const [paymentDetailsGeneral] = await pool.query(
        `SELECT
          situacao,
          SUM(valor) AS total_valor,
          SUM(CASE WHEN situacao = 'Parcialmente Pago' THEN valor_pago_parcial ELSE 0 END) AS total_pago_parcial,
          SUM(CASE WHEN situacao = 'pago' THEN valor ELSE 0 END) AS total_pago_completo
        FROM custos
        GROUP BY situacao`
      );

      const totalGeralCentavos = totalResult[0].total || 0;
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

      totalByTypeResult.forEach(row => {
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
          const valor = row.total_valor || 0;

          if (row.situacao === 'pago') {
            totalPago += valor;
          } else if (row.situacao === 'Pendente') {
            totalPendente += valor;
          } else if (row.situacao === 'Parcialmente Pago') {
            const valorPagoParcial = row.total_pago_parcial || 0;
            totalParcial += valor;
            totalPago += valorPagoParcial; // Soma o que foi pago parcialmente
            totalPendente += (valor - valorPagoParcial); // O restante é pendente
          } else if (row.situacao === 'Vencido') {
            totalVencido += valor;
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
        const valor = row.total_valor || 0;

        if (row.situacao === 'pago') {
          totalGeralPago += valor;
        } else if (row.situacao === 'Pendente') {
          totalGeralPendente += valor;
        } else if (row.situacao === 'Parcialmente Pago') {
          const valorPagoParcial = row.total_pago_parcial || 0;
          totalGeralParcial += valor; // Total dos valores marcados como parciais
          totalGeralPago += valorPagoParcial; // Soma o que foi pago dos parciais
          totalGeralPendente += (valor - valorPagoParcial); // Soma o que ainda falta pagar dos parciais
        } else if (row.situacao === 'Vencido') {
          totalGeralVencido += valor;
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
      const [totalResult] = await pool.query(
        `SELECT SUM(valor) AS total 
       FROM custos 
       WHERE turma_id = ?`,
        [turmaId]
      );

      const [totalByTypeResult] = await pool.query(
        `SELECT 
        tipo_custo,
        SUM(valor) AS total
       FROM custos 
       WHERE turma_id = ?
       GROUP BY tipo_custo`,
        [turmaId]
      );

      const totalGeralCentavos = totalResult[0].total || 0;
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

      totalByTypeResult.forEach(row => {
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
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    try {
      const [result] = await pool.query(query, [
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
      res.status(201).json(result);
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
      `UPDATE custos SET tipo_custo = ?, turma_id = ?, evento = ?, fornecedor_id = ?, beneficiario = ?, categoria = ?, valor = ?, valor_pago_parcial = ?, vencimento = ?, situacao = ?, chave_pix = ? WHERE id_custo = ?`;
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
      await pool.query("DELETE FROM custos WHERE id_custo = ?", [id]);
      res
        .status(200)
        .json({ message: "Custo deletado com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new CustosController();
