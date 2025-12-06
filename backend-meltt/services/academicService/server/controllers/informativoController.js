import pool from "../db.js";

class InformativosController {
  async getAllInformativos(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
  
    try {
      const [dataResult, totalResult] = await Promise.all([
        pool.query("SELECT * FROM informativos LIMIT $1 OFFSET $2", [limit, offset]),
        pool.query("SELECT COUNT(*) AS total FROM informativos"),
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
  

  async getInformativoById(req, res) {
    try {
      const result = await pool.query("SELECT * FROM informativos WHERE id = $1", [req.params.id]);
      res.status(result.rows.length ? 200 : 404).json(result.rows[0] || { error: "Informativo não encontrado" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getInformativosByTurmaId(req, res) {
    try {
      const result = await pool.query("SELECT * FROM informativos WHERE turma_id = $1", [req.params.id]);
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createInformativo(req, res) {
    try {
      const { url_arquivo, file_name, turma_id } = req.body;
      const result = await pool.query(
        "INSERT INTO informativos (url_arquivo, file_name, turma_id) VALUES ($1, $2, $3) RETURNING id", 
        [url_arquivo, file_name, turma_id]
      );
      res.status(201).json({ id: result.rows[0].id, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateInformativo(req, res) {
    try {
      const { url_arquivo, file_name, turma_id } = req.body;
      const updateResult = await pool.query(
        "UPDATE informativos SET url_arquivo = $1, file_name = $2, turma_id = $3 WHERE id = $4",
        [url_arquivo, file_name, turma_id, req.params.id]
      );

      if (updateResult.rowCount === 0) {
        return res.status(404).json({ error: "Informativo não encontrado" });
      }
      const result = await pool.query("SELECT * FROM informativos WHERE id = $1", [req.params.id]);
      res.status(200).json({ message: "Atualizado com sucesso", value: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  
  }

  async deleteInformativo(req, res) {
    try {
      const result = await pool.query("DELETE FROM informativos WHERE id = $1", [req.params.id]);
      
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Informativo não encontrada" });
      }
      
      res.status(200).json({ message: "Deletada com sucesso", id: req.params.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new InformativosController();