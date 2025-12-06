import axios from "axios";
import pool from "../db.js";

class BlingController {
  async getAllContasReceber(req, res) {
    try {
      const { pagina = 1, limit = 20, situacoes, dataInicial, dataFinal } = req.query;
      const offset = (pagina - 1) * limit;

      let query = "SELECT * FROM pagamentos";
      const params = [];
      const whereClauses = [];

      if (situacoes) {
        const situacoesList = Array.isArray(situacoes) ? situacoes : [situacoes];
        const placeholders = situacoesList.map((_, i) => `$${params.length + i + 1}`).join(',');
        whereClauses.push(`situacao IN (${placeholders})`);
        params.push(...situacoesList);
      }

      if (dataInicial) {
        whereClauses.push(`vencimento >= $${params.length + 1}`);
        params.push(dataInicial);
      }

      if (dataFinal) {
        whereClauses.push(`vencimento <= $${params.length + 1}`);
        params.push(dataFinal);
      }

      if (whereClauses.length > 0) {
        query += ` WHERE ${whereClauses.join(" AND ")}`;
      }

      const limitParam = params.length + 1;
      const offsetParam = params.length + 2;
      query += ` ORDER BY vencimento DESC LIMIT $${limitParam} OFFSET $${offsetParam}`;
      params.push(parseInt(limit), parseInt(offset));

      const rowsResult = await pool.query(query, params);
      const rows = rowsResult.rows;

      let countQuery = "SELECT COUNT(*) as count FROM pagamentos";
      const countParams = [];
      if (whereClauses.length > 0) {
        const countWhereClauses = [];
        let countParamIndex = 1;
        if (situacoes) {
          const situacoesList = Array.isArray(situacoes) ? situacoes : [situacoes];
          const placeholders = situacoesList.map(() => `$${countParamIndex++}`).join(',');
          countWhereClauses.push(`situacao IN (${placeholders})`);
          countParams.push(...situacoesList);
        }
        if (dataInicial) {
          countWhereClauses.push(`vencimento >= $${countParamIndex++}`);
          countParams.push(dataInicial);
        }
        if (dataFinal) {
          countWhereClauses.push(`vencimento <= $${countParamIndex++}`);
          countParams.push(dataFinal);
        }
        countQuery += ` WHERE ${countWhereClauses.join(" AND ")}`;
        const countRowsResult = await pool.query(countQuery, countParams);
        res.json({ data: rows, total: parseInt(countRowsResult.rows[0].count) });
      } else {
        const countRowsResult = await pool.query(countQuery);
        res.json({ data: rows, total: parseInt(countRowsResult.rows[0].count) });
      }

    } catch (error) {
      console.error("Erro ao buscar pagamentos:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  }

  async getAllContatos(req, res) {
    try {
      const { authorization } = req.headers;
      const { pagina = 1 } = req.query;
      const token = authorization.replace(/^Bearer\s+/i, "");

      const params = new URLSearchParams();
      params.append("limite", "100");
      params.append("pagina", String(pagina));

      const response = await axios.get(
        `https://www.bling.com.br/Api/v3/contatos?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return res.json({
        message: "Requisição realizada com sucesso",
        data: response.data.data,
        success: true
      });
    } catch (error) {
      console.error("Erro ao comunicar com Bling:", error.response?.data || error.message);
      return res.status(500).json({
        message: error.message,
        status: error.status
      });
    }
  }
}

export default new BlingController();
