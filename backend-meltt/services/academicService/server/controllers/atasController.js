import db from "../db.js";

class AtasController {
  async getAllAtas(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
  
    try {
      const [data, total, status] = await Promise.all([
        db.query("SELECT * FROM atas LIMIT ? OFFSET ?", [limit, offset]),
        db.query("SELECT COUNT(*) AS total FROM atas"),
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
  

  async getAtaById(req, res) {
    try {
      const [rows] = await db.query("SELECT * FROM atas WHERE id = ?", [req.params.id]);
      res.status(rows.length ? 200 : 404).json(rows[0] || { error: "Ata não encontrada" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getAtasByTurmaId(req, res) {
    try {
      const [rows] = await db.query("SELECT * FROM atas WHERE turma_id = ?", [req.params.id]);
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createAta(req, res) {
    try {
      const { url_arquivo, turma_id } = req.body;
      const [result] = await db.query(
        "INSERT INTO atas SET ?", 
        { url_arquivo, turma_id }
      );
      res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateAta(req, res) {
    try {
      const { affectedRows } = await db.query(
        "UPDATE atas SET ? WHERE id = ?",
        [req.body, req.params.id]
      );

      if (!affectedRows) {
        return res.status(404).json({ error: "Adesão não encontrada" });
      }
      const [rows] = await db.query("SELECT * FROM atas WHERE id = ?", [req.params.id]);
      res.status(200).json({ message: "Atualizado com sucesso", value: rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  
  }

  async deleteAta(req, res) {
    try {
      const [result] = await db.query("DELETE FROM atas WHERE id = ?", [req.params.id]);
      
      if (!result.affectedRows) {
        return res.status(404).json({ error: "Ata não encontrada" });
      }
      
      res.status(200).json({ message: "Deletada com sucesso", id: req.params.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new AtasController();