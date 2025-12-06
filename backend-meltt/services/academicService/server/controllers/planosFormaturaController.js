import pool from "../db.js";

class PlanosFormaturaController {
  async getAllPlanosFormatura(req, res) {
    const page = parseInt(req.query.page) || 1; // Página atual (default: 1)
    const limit = parseInt(req.query.limit) || 10; // Itens por página (default: 10)
    const offset = (page - 1) * limit; // Calcula o deslocamento

    try {
      const resultsResult = await pool.query(
        "SELECT * FROM planos_formatura LIMIT $1 OFFSET $2",
        [limit, offset]
      );
      const results = resultsResult.rows;

      const countResult = await pool.query(
        "SELECT COUNT(*) AS total FROM planos_formatura"
      );
      const total = parseInt(countResult.rows[0].total);
      const totalPages = Math.ceil(total / limit);

      res.status(200).json({
        page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        data: results,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getPlanoFormatura(req, res) {
    const id = req.params.id;
    try {
      const result = await pool.query(
        "SELECT * FROM planos_formatura WHERE id = $1",
        [id]
      );
      res.status(200).json(result.rows[0] || {});
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createPlanoFormatura(req, res) {
    const { nome, incluso, valor } = req.body;
    const query =
      "INSERT INTO planos_formatura (nome, incluso, valor) VALUES ($1, $2, $3) RETURNING id";
    try {
      const result = await pool.query(query, [nome, incluso, valor]);
      res.status(201).json({ id: result.rows[0].id, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updatePlanoFormatura(req, res) {
    const id = req.params.id;
    const { nome, incluso, valor } = req.body;
    const updateQuery =
      "UPDATE planos_formatura SET nome = $1, incluso = $2, valor = $3 WHERE id = $4";
    try {
      await pool.query(updateQuery, [nome, incluso, valor, id]);
      const result = await pool.query(
        "SELECT * FROM planos_formatura WHERE id = $1",
        [id]
      );
      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Plano de formatura não encontrado." });
      }
      res.status(200).json({
        message: "Plano de formatura atualizado com sucesso!",
        value: result.rows[0],
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async getPlanosFormatura(req, res) {
    const id = req.params.id;

    const query = `
            SELECT pf.* 
            FROM turma_plano_formatura tpf
            INNER JOIN planos_formatura pf ON tpf.plano_id = pf.id
            WHERE tpf.turma_id = $1;
        `;

    try {
      const result = await pool.query(query, [id]);
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deletePlanoFormatura(req, res) {
    const id = req.params.id;
    try {
      await pool.query("DELETE FROM planos_formatura WHERE id = $1", [id]);
      res
        .status(200)
        .json({ message: "Plano de formatura deletado com sucesso!", id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new PlanosFormaturaController();
