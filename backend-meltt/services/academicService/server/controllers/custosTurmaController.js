import pool from "../db.js";

class CustosTurmaController {
  async getAllCustosTurma(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const turma_id = req.query.turma_id || null;
    const tipo = req.query.tipo || null;
    const noPagination = req.query.all === 'true' || req.query.noPagination === 'true';

    try {
      let query = "SELECT * FROM custos_turma";
      let countQuery = "SELECT COUNT(*) AS total FROM custos_turma";
      let queryParams = [];
      let countParams = [];
      let whereConditions = [];

      if (turma_id) {
        whereConditions.push("turma_id = ?");
        queryParams.push(turma_id);
        countParams.push(turma_id);
      }

      if (tipo) {
        whereConditions.push("tipo = ?");
        queryParams.push(tipo);
        countParams.push(tipo);
      }

      if (whereConditions.length > 0) {
        const whereClause = " WHERE " + whereConditions.join(" AND ");
        query += whereClause;
        countQuery += whereClause;
      }

      if (!noPagination) {
        query += " LIMIT ? OFFSET ?";
        queryParams.push(limit, offset);
      }

      const [results] = await pool.query(query, queryParams);

      if (noPagination) {
        res.status(200).json({
          totalItems: results.length,
          data: results,
        });
      } else {
        const [countResult] = await pool.query(countQuery, countParams);
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        res.status(200).json({
          page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          data: results,
        });
      }
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getCustoTurmaById(req, res) {
    const id = req.params.id;
    try {
      const [result] = await pool.query("SELECT * FROM custos_turma WHERE id = ?", [id]);
      res.status(200).json({ data: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createCustoTurma(req, res) {
    const { valor, tipo, data, turma_id } = req.body;
    const query = "INSERT INTO custos_turma (valor, tipo, data, turma_id) VALUES (?, ?, ?, ?)";
    try {
      const [result] = await pool.query(query, [valor, tipo, data, turma_id]);
      res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateCustoTurma(req, res) {
    const id = req.params.id;
    const { valor, tipo, data, turma_id } = req.body;
    const query = "UPDATE custos_turma SET valor = ?, tipo = ?, data = ?, turma_id = ? WHERE id = ?";
    try {
      await pool.query(query, [valor, tipo, data, turma_id, id]);
      res.status(200).json({ message: "Custo da turma atualizado com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteCustoTurma(req, res) {
    const id = req.params.id;
    try {
      await pool.query("DELETE FROM custos_turma WHERE id = ?", [id]);
      res.status(200).json({ message: "Custo da turma deletado com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new CustosTurmaController();