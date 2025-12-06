import pool from "../db.js";

class PreContratoController {
  static instance;

  constructor() {
    if (!PreContratoController.instance) {
      PreContratoController.instance = this;
    }
    return PreContratoController.instance;
  }

  async getAllPreContratos(req, res) {
    const page = parseInt(req.query.page) || 1; // Página atual (default: 1)
    const limit = parseInt(req.query.limit) || 10; // Itens por página (default: 10)
    const offset = (page - 1) * limit; // Calcula o deslocamento

    try {
      const resultsResult = await pool.query(
        "SELECT * FROM pre_contratos LIMIT $1 OFFSET $2",
        [limit, offset]
      );
      const results = resultsResult.rows;

      const countResult = await pool.query(
        "SELECT COUNT(*) AS total FROM pre_contratos"
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

  async getPreContratoById(req, res) {
    const id = req.params.id;
    try {
      const result = await pool.query(
        "SELECT * FROM pre_contratos WHERE id = $1",
        [id]
      );
      res.status(200).json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createPreContrato(req, res) {
    const {
      content,
      createdBy,
      contactedBy,
      turmaName,
      studentName,
      agreedValue,
      packageInterest,
      status,
    } = req.body;
    const query =
      "INSERT INTO pre_contratos (content, createdBy, contactedBy, turmaName, studentName, agreedValue, packageInterest, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id";
    try {
      const result = await pool.query(query, [
        content,
        createdBy,
        contactedBy,
        turmaName,
        studentName,
        agreedValue,
        packageInterest,
        status,
      ]);
      res.status(201).json({ id: result.rows[0].id, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updatePreContrato(req, res) {
    const id = req.params.id;
    const {
      content,
      createdBy,
      contactedBy,
      turmaName,
      studentName,
      agreedValue,
      packageInterest,
      status,
    } = req.body;
    const updateQuery =
      "UPDATE pre_contratos SET content = $1, createdBy = $2, contactedBy = $3, turmaName = $4, studentName = $5, agreedValue = $6, packageInterest = $7, status = $8 WHERE id = $9";
    try {
      await pool.query(updateQuery, [
        content,
        createdBy,
        contactedBy,
        turmaName,
        studentName,
        agreedValue,
        packageInterest,
        status,
        id,
      ]);

      const result = await pool.query(
        "SELECT * FROM pre_contratos WHERE id = $1",
        [id]
      );
      if (result.rows.length === 0) {
        return res
          .status(404)
          .json({ error: "Pré-contrato não encontrado." });
      }
      res.status(200).json({
        message: "Pré-contrato atualizado com sucesso!",
        value: result.rows[0],
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deletePreContrato(req, res) {
    const id = req.params.id;
    try {
      await pool.query("DELETE FROM pre_contratos WHERE id = $1", [id]);
      res
        .status(200)
        .json({ message: "Pré-contrato deletado com sucesso!", id });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new PreContratoController();
