import pool from "../db.js";

class FornecedoresController {
  async getAllFornecedores(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
  
    try {
      const [results] = await pool.query(`
        SELECT 
          fornecedores.*,
          turmas.nome AS turma_nome,
          turmas.identificador AS turma_identificador
          -- Adicione mais campos conforme necessário (sem vírgula no último campo!)
        FROM fornecedores
        LEFT JOIN turmas 
          ON fornecedores.turma_id = turmas.id
        LIMIT ? OFFSET ?
      `, [limit, offset]);
  
      const [countResult] = await pool.query("SELECT COUNT(*) AS total FROM fornecedores");
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

  async getFornecedoresById(req, res) {
    const id = req.params.id;
    try {
      const [result] = await pool.query(
        "SELECT * FROM fornecedores WHERE id = ?",
        [id]
      );
      res.status(200).json(result);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createFornecedores(req, res) {
    const {
      nome,
      tipo_servico,
      status,
      telefone,
      valor_cotado,
      cnpj,
      turma_id,
      responsavel,
    } = req.body;
    const query =
      "INSERT INTO fornecedores (nome, tipo_servico, status, telefone, valor_cotado, cnpj, turma_id, responsavel) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    try {
      const [result] = await pool.query(query, [
        nome,
        tipo_servico,
        status,
        telefone,
        valor_cotado,
        cnpj,
        turma_id,
        responsavel,
      ]);
      res.status(201).json({ id: result.insertId, ...req.body });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async updateFornecedores(req, res) {
    const id = req.params.id;
    const {
      nome,
      tipo_servico,
      status,
      telefone,
      valor_cotado,
      cnpj,
      turma_id,
      responsavel,
    } = req.body;
    const query =
      "UPDATE fornecedores SET nome = ?, tipo_servico = ?, status = ?, telefone = ?, valor_cotado = ?, cnpj = ?, turma_id = ?, responsavel = ? WHERE id = ?";
    try {
      await pool.query(query, [
        nome,
        tipo_servico,
        status,
        telefone,
        valor_cotado,
        cnpj,
        turma_id,
        responsavel,
        id,
      ]);
      res.status(200).json({
        message: "Fornecedor atualizado com sucesso!",
        result: req.body,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async deleteFornecedores(req, res) {
    const id = req.params.id;
    try {
      await pool.query("DELETE FROM fornecedores WHERE id = ?", [id]);
      res
        .status(200)
        .json({ message: "Fornecedor deletado com sucesso!" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

export default new FornecedoresController();
