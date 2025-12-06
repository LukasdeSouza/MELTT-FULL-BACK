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
        whereConditions.push(`turma_id = $${queryParams.length + 1}`);
        queryParams.push(turma_id);
        countParams.push(turma_id);
      }

      if (tipo) {
        whereConditions.push(`tipo = $${queryParams.length + 1}`);
        queryParams.push(tipo);
        countParams.push(tipo);
      }

      if (whereConditions.length > 0) {
        const whereClause = " WHERE " + whereConditions.join(" AND ");
        query += whereClause;
        // Construir countQuery com placeholders corretos
        const countConditions = [];
        countParams.forEach((param, index) => {
          if (turma_id && param === turma_id) {
            countConditions.push(`turma_id = $${index + 1}`);
          } else if (tipo && param === tipo) {
            countConditions.push(`tipo = $${index + 1}`);
          }
        });
        countQuery += " WHERE " + countConditions.join(" AND ");
      }

      if (!noPagination) {
        const limitParam = queryParams.length + 1;
        const offsetParam = queryParams.length + 2;
        query += ` LIMIT $${limitParam} OFFSET $${offsetParam}`;
        queryParams.push(limit, offset);
      }

      const result = await pool.query(query, queryParams);
      const results = result.rows;

      if (noPagination) {
        res.status(200).json({
          totalItems: results.length,
          data: results,
        });
      } else {
        const countResult = await pool.query(countQuery, countParams);
        const total = parseInt(countResult.rows[0].total);
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
      const result = await pool.query("SELECT * FROM custos_turma WHERE turma_id = $1", [id]);
      res.status(200).json({ data: result.rows });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getTotalEntradasSaidasByTurma(req, res) {
    const id = req.params.id;

    try {
      const totalByTipoResult = await pool.query(
        `SELECT 
          tipo,
          SUM(valor) AS total
       FROM custos_turma
       WHERE turma_id = $1
       GROUP BY tipo`,
        [id]
      );

      const formatToCurrency = (valor) => {
        return Number(valor).toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });
      };

      const totais = {
        entrada: 0,
        saida: 0
      };

      totalByTipoResult.rows.forEach(row => {
        if (row.tipo === 'entrada') {
          totais.entrada = row.total || 0;
        } else if (row.tipo === 'saida') {
          totais.saida = row.total || 0;
        }
      });

      const response = {
        id,
        entradas: {
          valor: totais.entrada,
          formatado: formatToCurrency(totais.entrada)
        },
        saidas: {
          valor: totais.saida,
          formatado: formatToCurrency(totais.saida)
        }
      };

      res.status(200).json(response);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createCustoTurma(req, res) {
    const { valor, tipo, data, descricao, categoria, turma_id } = req.body;
    console.log(req.body);
    const query = "INSERT INTO custos_turma (valor, tipo, data, descrição, categoria, turma_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id";
    try {
      const result = await pool.query(query, [valor, tipo, data, descricao, categoria, turma_id]);
      console.log(result);
      res.status(201).json({ id: result.rows[0].id, ...req.body });
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
      await pool.query("DELETE FROM custos_turma WHERE id = $1", [id]);
      res.status(200).json({ message: "Custo da turma deletado com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new CustosTurmaController();