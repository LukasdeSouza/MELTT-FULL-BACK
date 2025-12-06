import pool from "../db.js";

class AdesaoController {
  async getAllAdesoes(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
  
    try {
      const [dataResult, totalResult, statusResult] = await Promise.all([
        pool.query("SELECT * FROM adesoes LIMIT $1 OFFSET $2", [limit, offset]),
        pool.query("SELECT COUNT(*) AS total FROM adesoes"),
        pool.query(`
          SELECT 
            SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END) AS totalConcluidas,
            SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) AS totalPendentes,
            SUM(CASE WHEN status = 'cancelado' THEN 1 ELSE 0 END) AS totalCancelado 
          FROM adesoes
        `)
      ]);
  
      const dataRows = dataResult.rows;
      const totalRows = totalResult.rows;
      const statusRows = statusResult.rows;
  
      const totalCount = totalRows.length > 0 ? parseInt(totalRows[0].total) : 0;
  
      res.status(200).json({
        page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
        totalConcluidas: statusRows.length > 0 ? parseInt(statusRows[0].totalConcluidas) || 0 : 0,
        totalPendentes: statusRows.length > 0 ? parseInt(statusRows[0].totalPendentes) || 0 : 0,
        totalCancelado: statusRows.length > 0 ? parseInt(statusRows[0].totalCancelado) || 0 : 0,
        data: dataRows
      });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
  

  async getAdesaoById(req, res) {
    try {
      const result = await pool.query("SELECT * FROM adesoes WHERE id = $1", [req.params.id]);
      res.status(result.rows.length ? 200 : 404).json(result.rows[0] || { error: "Adesão não encontrada" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getAdesoesByTurmaId(req, res) {
    try {
      const result = await pool.query("SELECT * FROM adesoes WHERE turma_id = $1", [req.params.id]);
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getAdesoesByAlunoId(req, res) {
    try {
      const result = await pool.query("SELECT * FROM adesoes WHERE aluno_id = $1", [req.params.id]);
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createAdesao(req, res) {
    try {
      const { usuario_id, turma_id, status, data_assinatura, faculdade, file_uuid, observacoes } = req.body;
      const result = await pool.query(
        "INSERT INTO adesoes (usuario_id, turma_id, status, data_assinatura, faculdade, file_uuid, observacoes) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id", 
        [usuario_id, turma_id, status, data_assinatura, faculdade, file_uuid, observacoes]
      );
      res.status(201).json({ id: result.rows[0].id, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateAdesao(req, res) {
    try {
      const { usuario_id, turma_id, status, data_assinatura, faculdade, file_uuid, observacoes } = req.body;
      const updateResult = await pool.query(
        "UPDATE adesoes SET usuario_id = $1, turma_id = $2, status = $3, data_assinatura = $4, faculdade = $5, file_uuid = $6, observacoes = $7 WHERE id = $8",
        [usuario_id, turma_id, status, data_assinatura, faculdade, file_uuid, observacoes, req.params.id]
      );

      if (updateResult.rowCount === 0) {
        return res.status(404).json({ error: "Adesão não encontrada" });
      }
      const result = await pool.query("SELECT * FROM adesoes WHERE id = $1", [req.params.id]);
      res.status(200).json({ message: "Atualizado com sucesso", value: result.rows[0] });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  
  }

  async deleteAdesao(req, res) {
    try {
      const result = await pool.query("DELETE FROM adesoes WHERE id = $1", [req.params.id]);
      
      if (result.rowCount === 0) {
        return res.status(404).json({ error: "Adesão não encontrada" });
      }
      
      res.status(200).json({ message: "Deletado com sucesso", id: req.params.id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new AdesaoController();