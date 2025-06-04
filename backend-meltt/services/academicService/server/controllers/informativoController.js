import db from "../db.js";

class InformativosController {
  async getAllInformativos(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
  
    try {
      const [data, total, status] = await Promise.all([
        db.query("SELECT * FROM informativos LIMIT ? OFFSET ?", [limit, offset]),
        db.query("SELECT COUNT(*) AS total FROM informativos"),
      ]);
  
      const dataRows = data[0]; // Retorna um array de objetos
      const totalRows = total[0]; // Retorna um array [{ total: 10 }]
  
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
  

  async getInformativoById(req, res) {
    try {
      const [rows] = await db.query("SELECT * FROM informativos WHERE id = ?", [req.params.id]);
      res.status(rows.length ? 200 : 404).json(rows[0] || { error: "Informativo não encontrado" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getInformativosByTurmaId(req, res) {
    try {
      const [rows] = await db.query("SELECT * FROM informativos WHERE turma_id = ?", [req.params.id]);
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createInformativo(req, res) {
    try {
      const { url_arquivo, file_name, turma_id } = req.body;
      const [result] = await db.query(
        "INSERT INTO informativos SET ?", 
        { url_arquivo, file_name, turma_id }
      );
      res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateInformativo(req, res) {
    try {
      const { affectedRows } = await db.query(
        "UPDATE informativos SET ? WHERE id = ?",
        [req.body, req.params.id]
      );

      if (!affectedRows) {
        return res.status(404).json({ error: "Informativo não encontrado" });
      }
      const [rows] = await db.query("SELECT * FROM informativos WHERE id = ?", [req.params.id]);
      res.status(200).json({ message: "Atualizado com sucesso", value: rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  
  }

  async deleteInformativo(req, res) {
    try {
      const [result] = await db.query("DELETE FROM informativos WHERE id = ?", [req.params.id]);
      
      if (!result.affectedRows) {
        return res.status(404).json({ error: "Informativo não encontrada" });
      }
      
      res.status(200).json({ message: "Deletada com sucesso", id: req.params.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new InformativosController();