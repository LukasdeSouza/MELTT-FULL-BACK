import pool from "../db.js";

class ContratosController {
  async getAllContratos(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const resultsResult = await pool.query("SELECT * FROM contratos LIMIT $1 OFFSET $2", [limit, offset]);
      const results = resultsResult.rows;
      const countResult = await pool.query("SELECT COUNT(*) AS total FROM contratos");
      const total = parseInt(countResult.rows[0].total);

      res.status(200).json({
        page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        data: results,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getContratosById(req, res) {
    try {
      const result = await pool.query("SELECT * FROM contratos WHERE id = $1", [req.params.id]);
      if (result.rows.length === 0) return res.status(404).json({ error: "Contrato não encontrado." });

      res.status(200).json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getContratosByAssociacaoId(req, res) {
    try {
      const result = await pool.query("SELECT * FROM contratos WHERE user_id = $1", [req.params.id]);
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createContrato(req, res) {
    try {
      const { user_id, assinado, contrato_pdf, associacao } = req.body;
      const result = await pool.query(
        "INSERT INTO contratos (user_id, assinado, contrato_pdf, associacao) VALUES ($1, $2, $3, $4) RETURNING id",
        [user_id, assinado, contrato_pdf, associacao]
      );
      res.status(201).json({ id: result.rows[0].id, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateContratos(req, res) {
    try {
      const { user_id, assinado } = req.body;
      const id = req.params.id;

      const updateResult = await pool.query(
        "UPDATE contratos SET user_id = $1, assinado = $2 WHERE id = $3",
        [user_id, assinado, id]
      );

      if (updateResult.rowCount === 0) {
        return res.status(404).json({ error: "Contrato não encontrado." });
      }

      const updatedContratoResult = await pool.query("SELECT * FROM contratos WHERE id = $1", [id]);
      res.status(200).json({
        message: "Contrato atualizado com sucesso!",
        value: updatedContratoResult.rows[0],
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteContratos(req, res) {
    try {
      const id = req.params.id;
      const result = await pool.query("DELETE FROM contratos WHERE id = $1", [id]);

      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Contrato não encontrado." });
      }

      res.status(200).json({ message: "Contrato deletado com sucesso!", id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new ContratosController();
