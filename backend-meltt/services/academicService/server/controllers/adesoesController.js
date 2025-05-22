import db from "../db.js";

class AdesaoController {
  async getAllAdesoes(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
  
    try {
      const [data, total, status] = await Promise.all([
        db.query("SELECT * FROM adesoes LIMIT ? OFFSET ?", [limit, offset]),
        db.query("SELECT COUNT(*) AS total FROM adesoes"),
        db.query(`
          SELECT 
            SUM(status = 'concluida') AS totalConcluidas,
            SUM(status = 'pendente') AS totalPendentes,
            SUM(status = 'cancelado') AS totalCancelado 
          FROM adesoes
        `)
      ]);
  
      const dataRows = data[0]; // Retorna um array de objetos
      const totalRows = total[0]; // Retorna um array [{ total: 10 }]
      const statusRows = status[0]; // Retorna um array [{ totalConcluidas: 5, totalPendentes: 5 }]
  
      const totalCount = totalRows.length > 0 ? totalRows[0].total : 0;
  
      res.status(200).json({
        page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
        totalConcluidas: statusRows.length > 0 ? statusRows[0].totalConcluidas || 0 : 0,
        totalPendentes: statusRows.length > 0 ? statusRows[0].totalPendentes || 0 : 0,
        totalCancelado: statusRows.length > 0 ? statusRows[0].totalCancelado || 0 : 0,
        data: dataRows
      });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  

  async getAdesaoById(req, res) {
    try {
      const [rows] = await db.query("SELECT * FROM adesoes WHERE id = ?", [req.params.id]);
      res.status(rows.length ? 200 : 404).json(rows[0] || { error: "Adesão não encontrada" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getAdesoesByTurmaId(req, res) {
    try {
      const [rows] = await db.query("SELECT * FROM adesoes WHERE turma_id = ?", [req.params.id]);
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getAdesoesByAlunoId(req, res) {
    try {
      const [rows] = await db.query("SELECT * FROM adesoes WHERE aluno_id = ?", [req.params.id]);
      res.status(200).json(rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createAdesao(req, res) {
    try {
      const { usuario_id, turma_id, status, data_assinatura, faculdade, observacoes } = req.body;
      const [result] = await db.query(
        "INSERT INTO adesoes SET ?", 
        { usuario_id, turma_id, status, data_assinatura, faculdade, observacoes }
      );
      res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateAdesao(req, res) {
    try {
      const { affectedRows } = await db.query(
        "UPDATE adesoes SET ? WHERE id = ?",
        [req.body, req.params.id]
      );

      if (!affectedRows) {
        return res.status(404).json({ error: "Adesão não encontrada" });
      }
      const [rows] = await db.query("SELECT * FROM adesoes WHERE id = ?", [req.params.id]);
      res.status(200).json({ message: "Atualizado com sucesso", value: rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  
  }

  async deleteAdesao(req, res) {
    try {
      const [result] = await db.query("DELETE FROM adesoes WHERE id = ?", [req.params.id]);
      
      if (!result.affectedRows) {
        return res.status(404).json({ error: "Adesão não encontrada" });
      }
      
      res.status(200).json({ message: "Deletado com sucesso", id: req.params.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new AdesaoController();