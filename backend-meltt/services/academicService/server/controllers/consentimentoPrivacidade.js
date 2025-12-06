import pool from "../db.js";

class ConsentimentoPrivacidadeController {
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
        conditions.push(`custos.situacao = $${params.length + 1}`);
        params.push(situacao);
        countParams.push(situacao);
      }

      if (tipoCusto && tiposValidos.includes(tipoCusto)) {
        conditions.push(`custos.tipo_custo = $${params.length + 1}`);
        params.push(tipoCusto);
        countParams.push(tipoCusto);
      }

      if (evento) {
        conditions.push(`custos.evento LIKE $${params.length + 1}`);
        params.push(`%${evento}%`);
        countParams.push(`%${evento}%`);
      }

      if (conditions.length > 0) {
        const whereClause = " WHERE " + conditions.join(" AND ");
        query += whereClause;
        const countConditions = [];
        countParams.forEach((param, index) => {
          if (situacao && param === situacao) {
            countConditions.push(`custos.situacao = $${index + 1}`);
          } else if (tipoCusto && param === tipoCusto) {
            countConditions.push(`custos.tipo_custo = $${index + 1}`);
          } else if (evento && param === `%${evento}%`) {
            countConditions.push(`custos.evento LIKE $${index + 1}`);
          }
        });
        countQuery += " WHERE " + countConditions.join(" AND ");
      }

      const limitParam = params.length + 1;
      const offsetParam = params.length + 2;
      query += ` LIMIT $${limitParam} OFFSET $${offsetParam}`;
      params.push(limit, offset);

      const resultsResult = await pool.query(query, params);
      const results = resultsResult.rows;
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
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getCustosById(req, res) {
    const id = req.params.id;
    try {
      const result = await pool.query(
        `SELECT custos.*, turmas.nome AS turma_nome, fornecedores.nome AS fornecedor_nome
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
      const result = await pool.query(
        `SELECT SUM(valor) AS total FROM custos`
      );

      const totalCentavos = parseFloat(result.rows[0]?.total) || 0;

      const totalReais = totalCentavos / 100;

      const formattedTotal = totalReais.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      });

      res.status(200).json({ total: formattedTotal });
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
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`;
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
        situacao
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
      situacao
    } = req.body;
    const query =
      `UPDATE custos SET tipo_custo = $1, turma_id = $2, evento = $3, fornecedor_id = $4, beneficiario = $5, categoria = $6, valor = $7, valor_pago_parcial = $8, vencimento = $9, situacao = $10 WHERE id_custo = $11`;
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
