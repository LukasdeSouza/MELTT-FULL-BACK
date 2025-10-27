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
        whereClauses.push(`situacao IN (${situacoesList.map(() => "?").join(",")})`);
        params.push(...situacoesList);
      }

      if (dataInicial) {
        whereClauses.push("vencimento >= ?");
        params.push(dataInicial);
      }

      if (dataFinal) {
        whereClauses.push("vencimento <= ?");
        params.push(dataFinal);
      }

      if (whereClauses.length > 0) {
        query += ` WHERE ${whereClauses.join(" AND ")}`;
      }

      query += " ORDER BY vencimento DESC LIMIT ? OFFSET ?";
      params.push(parseInt(limit), parseInt(offset));

      const [rows] = await pool.promise().query(query, params);

      let countQuery = "SELECT COUNT(*) as count FROM pagamentos";
      if (whereClauses.length > 0) {
        countQuery += ` WHERE ${whereClauses.join(" AND ")}`;
        const [countRows] = await pool.promise().query(countQuery, params.slice(0, params.length - 2));
        res.json({ data: rows, total: countRows[0].count });
      } else {
        const [countRows] = await pool.promise().query(countQuery);
        res.json({ data: rows, total: countRows[0].count });
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
