import pool from "../db.js"


class PagamentosController {
  async getAllPagamentos(req, res) {
    const page = parseInt(req.query.page) || 1; // Página atual (default: 1)
    const limit = parseInt(req.query.limit) || 10; // Itens por página (default: 10)
    const offset = (page - 1) * limit; // Calcula o deslocamento

    try {
      const resultsResult = await pool.query(
        "SELECT * FROM pagamentos LIMIT $1 OFFSET $2",
        [limit, offset]
      );
      const results = resultsResult.rows;

      const countResult = await pool.query(
        "SELECT COUNT(*) AS total FROM pagamentos"
      );
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

  async getPagamentosBySituacao(req, res) {
    const situacao = req.params.id;
    const { periodo } = req.query;

    let query = "SELECT * FROM pagamentos WHERE situacao = $1";
    let params = [situacao];
    let paramIndex = 2;

    if (periodo) {
      const dataAtual = new Date().toISOString().split("T")[0];
      query += ` AND vencimento BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
      params.push(periodo, dataAtual);
    }

    try {
      const result = await pool.query(query, params);
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getPagamentosByIdBling(req, res) {
    const id_bling = req.params.id;

    try {
      const result = await pool.query("SELECT * FROM pagamentos WHERE id_bling = $1", [id_bling]);
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getPagamentosByNumeroDocumento(req, res) {
    const { numeroDocumento } = req.query;

    try {
      const result = await pool.query(
        "SELECT * FROM pagamentos WHERE numeroDocumento = $1 ORDER BY dataEmissao DESC LIMIT 1",
        [numeroDocumento]
      );
      res.status(200).json(result.rows[0] || null);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

}

export default new PagamentosController();
