import pool from "../db.js";

class PlanosFormaturaController {
  async getAllPlanosFormatura(req, res) {
    const page = parseInt(req.query.page) || 1; // Página atual (default: 1)
    const limit = parseInt(req.query.limit) || 10; // Itens por página (default: 10)
    const offset = (page - 1) * limit; // Calcula o deslocamento

    try {
      const [results] = await pool.query(
        "SELECT * FROM planos_formatura LIMIT ? OFFSET ?",
        [limit, offset]
      );

      const [countResult] = await pool.query(
        "SELECT COUNT(*) AS total FROM planos_formatura"
      );
      const total = countResult[0].total;
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
      const [result] = await pool.query(
        "SELECT * FROM planos_formatura WHERE id = ?",
        [id]
      );
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createPlanoFormatura(req, res) {
    const { nome, incluso, valor } = req.body;
    const query =
      "INSERT INTO planos_formatura (nome, incluso, valor) VALUES (?, ?, ?)";
    try {
      const [result] = await pool.query(query, [nome, incluso, valor]);
      res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updatePlanoFormatura(req, res) {
    const id = req.params.id;
    const { nome, incluso, valor } = req.body;
    const updateQuery =
      "UPDATE planos_formatura SET nome = ?, incluso = ?, valor = ? WHERE id = ?";
    try {
      await pool.query(updateQuery, [nome, incluso, valor, id]);
      const [results] = await pool.query(
        "SELECT * FROM planos_formatura WHERE id = ?",
        [id]
      );
      if (results.length === 0) {
        return res
          .status(404)
          .json({ error: "Plano de formatura não encontrado." });
      }
      res.status(200).json({
        message: "Plano de formatura atualizado com sucesso!",
        value: results[0],
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  getPlanosFormatura(req, res) {
    const id = req.params.id;

    const query = `
            SELECT pf.* 
            FROM turma_plano_formatura tpf
            INNER JOIN planos_formatura pf ON tpf.plano_id = pf.id
            WHERE tpf.turma_id = ?;
        `;

    pool.query(query, [id], (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(200).json(result);
    });
  }

  createPlanoFormatura(req, res) {
    const { nome, incluso, valor } = req.body;
    const query =
      "INSERT INTO planos_formatura (nome, incluso, valor ) VALUES (?, ?, ?)";
    pool.query(
      query,
      [nome, incluso, valor],
      (err, result) => {
        if (err) return res.status(500).json(err);
        res.status(201).json({ id: result.insertId, ...req.body });
      }
    );
  };

  async deletePlanoFormatura(req, res) {
    const id = req.params.id;
    try {
      await pool.query("DELETE FROM planos_formatura WHERE id = ?", [id]);
      res
        .status(200)
        .json({ message: "Plano de formatura deletado com sucesso!", id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new PlanosFormaturaController();
