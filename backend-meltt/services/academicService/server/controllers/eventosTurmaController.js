import pool from "../db.js";

const STATUS_EVENTO = ["REALIZADO", "EM_AGUARDO", "NAO_REALIZADO"];

const normaliseStatus = (value) => {
  if (!value) {
    return "EM_AGUARDO";
  }

  const status = String(value).trim().toUpperCase();
  if (!STATUS_EVENTO.includes(status)) {
    throw new Error(
      `Status inválido. Valores permitidos: ${STATUS_EVENTO.join(", ")}`
    );
  }

  return status;
};

class EventosTurmaController {
  async getAllEventosTurma(req, res) {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const turmaId = req.query.turma_id || req.query.turmaId || null;
    const statusFilter = req.query.status || null;
    const noPagination =
      req.query.all === "true" || req.query.noPagination === "true";

    try {
      const conditions = [];
      const params = [];

      if (turmaId) {
        params.push(turmaId);
        conditions.push(`turma_id = $${params.length}`);
      }

      if (statusFilter) {
        params.push(statusFilter);
        conditions.push(`status = $${params.length}`);
      }

      const whereClause = conditions.length
        ? `WHERE ${conditions.join(" AND ")}`
        : "";

      const baseQuery = `FROM eventos_turma ${whereClause}`;

      let dataQuery = `SELECT * ${baseQuery} ORDER BY data_evento DESC, created_at DESC`;

      if (!noPagination) {
        params.push(limit);
        params.push(offset);
        dataQuery += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;
      }

      const eventsResult = await pool.query(dataQuery, params);

      if (noPagination) {
        return res.status(200).json({
          totalItems: eventsResult.rowCount,
          data: eventsResult.rows,
        });
      }

      const countResult = await pool.query(
        `SELECT COUNT(*) AS total ${baseQuery}`,
        params.slice(0, params.length - 2)
      );
      const totalItems = parseInt(countResult.rows[0].total, 10) || 0;

      return res.status(200).json({
        page,
        totalPages: Math.ceil(totalItems / limit) || 1,
        totalItems,
        itemsPerPage: limit,
        data: eventsResult.rows,
      });
    } catch (error) {
      console.error("Erro ao listar eventos_turma:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  async getEventoTurmaById(req, res) {
    try {
      const { id } = req.params;
      const result = await pool.query(
        "SELECT * FROM eventos_turma WHERE id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Evento de turma não encontrado." });
      }

      return res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error("Erro ao buscar eventos_turma por id:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  async getEventosTurmaByTurmaId(req, res) {
    try {
      const { turmaId } = req.params;
      const result = await pool.query(
        "SELECT * FROM eventos_turma WHERE turma_id = $1 ORDER BY data_evento DESC, created_at DESC",
        [turmaId]
      );

      return res.status(200).json(result.rows);
    } catch (error) {
      console.error("Erro ao buscar eventos_turma por turma_id:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  async createEventoTurma(req, res) {
    try {
      const {
        nome,
        descricao,
        data_evento,
        status,
        turma_id,
        criado_por,
      } = req.body;

      if (!nome || !turma_id || !criado_por || !data_evento) {
        return res.status(400).json({
          error:
            "Campos obrigatórios: nome, data_evento, turma_id e criado_por precisam ser informados.",
        });
      }

      let resolvedStatus;
      try {
        resolvedStatus = normaliseStatus(status);
      } catch (statusError) {
        return res.status(400).json({ error: statusError.message });
      }

      const insertQuery = `
        INSERT INTO eventos_turma (nome, descricao, data_evento, status, turma_id, criado_por)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;

      const insertResult = await pool.query(insertQuery, [
        nome,
        descricao ?? null,
        data_evento,
        resolvedStatus,
        turma_id,
        criado_por,
      ]);

      return res.status(201).json({
        message: "Evento de turma criado com sucesso!",
        value: insertResult.rows[0],
      });
    } catch (error) {
      console.error("Erro ao criar eventos_turma:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  async updateEventoTurma(req, res) {
    try {
      const { id } = req.params;
      const {
        nome,
        descricao,
        data_evento,
        status,
        turma_id,
        criado_por,
      } = req.body;

      const existingResult = await pool.query(
        "SELECT * FROM eventos_turma WHERE id = $1",
        [id]
      );

      if (existingResult.rows.length === 0) {
        return res.status(404).json({ error: "Evento de turma não encontrado." });
      }

      const current = existingResult.rows[0];

      let resolvedStatus = current.status;
      if (status !== undefined) {
        try {
          resolvedStatus = normaliseStatus(status);
        } catch (statusError) {
          return res.status(400).json({ error: statusError.message });
        }
      }

      const updateQuery = `
        UPDATE eventos_turma
        SET nome = $1,
            descricao = $2,
            data_evento = $3,
            status = $4,
            turma_id = $5,
            criado_por = $6,
            updated_at = NOW()
        WHERE id = $7
        RETURNING *
      `;

      const updateResult = await pool.query(updateQuery, [
        nome ?? current.nome,
        descricao ?? current.descricao,
        data_evento ?? current.data_evento,
        resolvedStatus,
        turma_id ?? current.turma_id,
        criado_por ?? current.criado_por,
        id,
      ]);

      return res.status(200).json({
        message: "Evento de turma atualizado com sucesso!",
        value: updateResult.rows[0],
      });
    } catch (error) {
      console.error("Erro ao atualizar eventos_turma:", error);
      return res.status(500).json({ error: error.message });
    }
  }

  async deleteEventoTurma(req, res) {
    try {
      const { id } = req.params;
      const deleteResult = await pool.query(
        "DELETE FROM eventos_turma WHERE id = $1",
        [id]
      );

      if (deleteResult.rowCount === 0) {
        return res.status(404).json({ error: "Evento de turma não encontrado." });
      }

      return res
        .status(200)
        .json({ message: "Evento de turma deletado com sucesso!", id });
    } catch (error) {
      console.error("Erro ao deletar eventos_turma:", error);
      return res.status(500).json({ error: error.message });
    }
  }
}

export default new EventosTurmaController();
