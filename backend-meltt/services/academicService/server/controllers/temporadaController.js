import pool from "../db.js";

class TemporadaController {
    async create(req, res) {
        try {
            const { ano, status } = req.body;

            if (!ano) {
                return res.status(400).json({ error: "O campo 'ano' é obrigatório." });
            }

            // Verifica se já existe uma temporada com o mesmo ano
            const [rows] = await pool.query(
                `SELECT id FROM temporadas WHERE ano = ? LIMIT 1`,
                [ano]
            );

            if (rows.length > 0) {
                return res.status(409).json({ error: "Já existe uma temporada para este ano." });
            }


            const [result] = await pool.query(
                `INSERT INTO temporadas (ano, status) VALUES (?, ?)`,
                [ano, status || "planejamento"]
            );

            return res.status(201).json({
                message: "Temporada criada com sucesso",
                id: result.insertId,
                status: 201
            });
        } catch (error) {
            console.error("Erro ao criar temporada:", error);
            return res.status(500).json({ error: "Erro interno ao criar temporada" });
        }
    }

    async getAll(req, res) {
        try {
            const [rows] = await pool.query(`SELECT * FROM temporadas ORDER BY ano DESC`);

            return res.json(rows);
        } catch (error) {
            console.error("Erro ao buscar temporadas:", error);
            return res.status(500).json({ error: "Erro interno ao buscar temporadas" });
        }
    }

    async updateStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            if (!status) {
                return res.status(400).json({ error: "O campo 'status' é obrigatório." });
            }

            const [result] = await pool.query(
                `UPDATE temporadas SET status = ? WHERE id = ?`,
                [status, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Temporada não encontrada." });
            }

            return res.json({ message: "Status atualizado com sucesso" });
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            return res.status(500).json({ error: "Erro interno ao atualizar status" });
        }
    }

    async getTemporadasDetalhadas(req, res) {
        try {
            // 1. Buscar todas as temporadas
            const [temporadas] = await pool.query(`
        SELECT id, ano, status
        FROM temporadas
        ORDER BY ano DESC
      `);

            console.log('[Temporadas] Total de temporadas encontradas:', temporadas.length);

            const resultado = [];

            for (const temporada of temporadas) {
                console.log(`\n[Temporadas] Processando temporada ${temporada.id} (${temporada.ano}) com status '${temporada.status}'`);

                // 2. Buscar as turmas da temporada
                const [turmas] = await pool.query(`
          SELECT id, nome
          FROM turmas
          WHERE temporada_id = ?
        `, [temporada.id]);

                console.log(`[Temporadas] Turmas encontradas para a temporada ${temporada.id}:`, turmas.length);

                // 3. Para cada turma, calcular receita total
                const turmasDetalhadas = [];

                for (const turma of turmas) {
                    console.log(`  [Temporadas] Calculando dados da turma ${turma.id} (${turma.nome})`);

                    const [receitaRows] = await pool.query(`
            SELECT SUM(valor) AS receita
            FROM custos
            WHERE turma_id = ?
              AND situacao IN ('pago', 'Parcialmente Pago')
          `, [turma.id]);

                    const receita = Number(receitaRows[0]?.receita) || 0;

                    if (!receitaRows[0] || receitaRows[0].receita === null) {
                        console.log(`    [Temporadas] Nenhum custo pago/parcial localizado para a turma ${turma.id}.`);
                    } else {
                        console.log(`    [Temporadas] Receita agregada para a turma ${turma.id}:`, receita);
                    }

                    turmasDetalhadas.push({
                        nome: turma.nome,
                        receita,
                        alunos: 0
                    });
                }

                if (!turmas.length) {
                    console.log(`[Temporadas] Temporada ${temporada.id} não possui turmas vinculadas.`);
                }

                // 4. Adiciona ao resultado final
                resultado.push({
                    ano: temporada.ano,
                    status: temporada.status,
                    turmas: turmasDetalhadas
                });
            }

            console.log('\n[Temporadas] Resposta final montada com', resultado.length, 'temporadas.');

            res.json(resultado);
        } catch (error) {
            console.error('[Temporadas] Erro ao buscar temporadas detalhadas:', error);
            res.status(500).json({ error: "Erro ao buscar temporadas" });
        }
    }
}

export default new TemporadaController();
