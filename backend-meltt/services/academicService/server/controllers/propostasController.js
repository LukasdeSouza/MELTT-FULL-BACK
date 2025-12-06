import pool from "../db.js";

class PropostaController {
  async getAllPropostas(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    try {
      const [dataResult, totalResult] = await Promise.all([
        pool.query("SELECT * FROM propostas LIMIT $1 OFFSET $2", [limit, offset]),
        pool.query("SELECT COUNT(*) AS total FROM propostas")
      ]);

      const dataRows = dataResult.rows;
      const totalRows = totalResult.rows;

      const totalCount = totalRows.length > 0 ? parseInt(totalRows[0].total) : 0;

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
      const result = await pool.query("SELECT * FROM propostas WHERE id = $1", [req.params.id]);
      res.status(result.rows.length ? 200 : 404).json(result.rows[0] || { error: "Proposta não encontrada" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getPropostasByTurmaId(req, res) {
    try {
      const result = await pool.query("SELECT * FROM propostas WHERE turma_id = $1", [req.params.id]);
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createProposta(req, res) {
    try {
      const { nome_proposta, turma_id, enviado_por, valor_proposta, file_uuid, observacoes } = req.body;
      const result = await pool.query(
        "INSERT INTO propostas (nome_proposta, turma_id, enviado_por, valor_proposta, file_uuid, observacoes) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id", 
        [nome_proposta, turma_id, enviado_por, valor_proposta, file_uuid, observacoes]
      );
      res.status(201).json({ id: result.rows[0].id, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateProposta(req, res) {
    try {
      const { nome_proposta, turma_id, enviado_por, valor_proposta, file_uuid, observacoes } = req.body;
      const updateResult = await pool.query(
        "UPDATE propostas SET nome_proposta = $1, turma_id = $2, enviado_por = $3, valor_proposta = $4, file_uuid = $5, observacoes = $6 WHERE id = $7",
        [nome_proposta, turma_id, enviado_por, valor_proposta, file_uuid, observacoes, req.params.id]
      );

      if (updateResult.rowCount === 0) {
        return res.status(404).json({ error: "Proposta não encontrada" });
      }
      const result = await pool.query("SELECT * FROM propostas WHERE id = $1", [req.params.id]);
      res.status(200).json({ message: "Atualizado com sucesso", value: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteProposta(req, res) {
    try {
      const result = await pool.query("DELETE FROM propostas WHERE id = $1", [req.params.id]);
      
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Proposta não encontrada" });
      }
      
      res.status(200).json({ message: "Deletado com sucesso", id: req.params.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new PropostaController();