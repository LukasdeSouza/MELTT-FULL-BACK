import db from "../db.js";

class PropostaController {
  async getAllPropostas(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
      const [data, total] = await Promise.all([
        db.query("SELECT * FROM propostas LIMIT ? OFFSET ?", [limit, offset]),
        db.query("SELECT COUNT(*) AS total FROM propostas")
      ]);

      const dataRows = data[0];
      const totalRows = total[0];

      const totalCount = totalRows.length > 0 ? totalRows[0].total : 0;

      res.status(200).json({
        page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
        data: dataRows
      });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getPropostaById(req, res) {
    try {
      const [rows] = await db.query("SELECT * FROM propostas WHERE id = ?", [req.params.id]);
      res.status(rows.length ? 200 : 404).json(rows[0] || { error: "Proposta não encontrada" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getPropostasByTurmaId(req, res) {
    try {
      const [rows] = await db.query("SELECT * FROM propostas WHERE turma_id = ?", [req.params.id]);
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createProposta(req, res) {
    try {
      const { nome_proposta, turma_id, enviado_por, valor_proposta, file_uuid, observacoes } = req.body;
      const [result] = await db.query(
        "INSERT INTO propostas SET ?", 
        { nome_proposta, turma_id, enviado_por, valor_proposta, file_uuid, observacoes }
      );
      res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateProposta(req, res) {
    try {
      const { affectedRows } = await db.query(
        "UPDATE propostas SET ? WHERE id = ?",
        [req.body, req.params.id]
      );

      if (!affectedRows) {
        return res.status(404).json({ error: "Proposta não encontrada" });
      }
      const [rows] = await db.query("SELECT * FROM propostas WHERE id = ?", [req.params.id]);
      res.status(200).json({ message: "Atualizado com sucesso", value: rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteProposta(req, res) {
    try {
      const [result] = await db.query("DELETE FROM propostas WHERE id = ?", [req.params.id]);
      
      if (!result.affectedRows) {
        return res.status(404).json({ error: "Proposta não encontrada" });
      }
      
      res.status(200).json({ message: "Deletado com sucesso", id: req.params.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new PropostaController();