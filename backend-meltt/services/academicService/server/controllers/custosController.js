import pool from "../db.js";

class CustosController {
  async getAllCustos(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const situacao = req.query.situacao;
    const tipoCusto = req.query.tipo_custo;
    const evento = req.query.evento;

    const situacoesValidas = ["Pendente", "Pago", "Parcialmente Pago", "Vencido"];
    const tiposValidos = ["Fixo", "Pre-evento", "Temporada"];

    try {
      let query = "SELECT * FROM custos";

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

      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const [results] = await pool.query(query, params);
      const [countResult] = await pool.query(countQuery, countParams);
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
      situacao
    } = req.body;
    console.log(req.body, "req.body custos");
    const query =
      `INSERT INTO custos (tipo_custo, turma_id, evento, fornecedor_id, beneficiario, categoria, valor, valor_pago_parcial, vencimento, situacao)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
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
        situacao
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
      situacao
    } = req.body;
    const query =
      `UPDATE custos SET tipo_custo = ?, turma_id = ?, evento = ?, fornecedor_id = ?, beneficiario = ?, categoria = ?, valor = ?, valor_pago_parcial = ?, vencimento = ?, situacao = ? WHERE id_custo = ?`;
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
