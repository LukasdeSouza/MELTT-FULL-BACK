import pool from "../db.js";

class ContratosController {
  async getAllContratos(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      const [results] = await pool.query("SELECT * FROM contratos LIMIT ? OFFSET ?", [limit, offset]);
      const [[{ total }]] = await pool.query("SELECT COUNT(*) AS total FROM contratos");

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
      const [result] = await pool.query("SELECT * FROM contratos WHERE id = ?", [req.params.id]);
      if (result.length === 0) return res.status(404).json({ error: "Contrato não encontrado." });

      res.status(200).json(result[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getContratosByAssociacaoId(req, res) {
    try {
      const [result] = await pool.query("SELECT * FROM contratos WHERE user_id = ?", [req.params.id]);
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createContrato(req, res) {
    try {
      const { user_id, assinado, contrato_pdf, associacao } = req.body;
      const [result] = await pool.query(
        "INSERT INTO contratos (user_id, assinado, contrato_pdf, associacao) VALUES (?, ?, ?, ?)",
        [user_id, assinado, contrato_pdf, associacao]
      );
      res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateContratos(req, res) {
    try {
      const { user_id, assinado } = req.body;
      const id = req.params.id;

      const [updateResult] = await pool.query(
        "UPDATE contratos SET user_id = ?, assinado = ? WHERE id = ?",
        [user_id, assinado, id]
      );

      if (updateResult.affectedRows === 0) {
        return res.status(404).json({ error: "Contrato não encontrado." });
      }

      const [updatedContrato] = await pool.query("SELECT * FROM contratos WHERE id = ?", [id]);
      res.status(200).json({
        message: "Contrato atualizado com sucesso!",
        value: updatedContrato[0],
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteContratos(req, res) {
    try {
      const id = req.params.id;
      const [result] = await pool.query("DELETE FROM contratos WHERE id = ?", [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Contrato não encontrado." });
      }

      res.status(200).json({ message: "Contrato deletado com sucesso!", id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new ContratosController();
