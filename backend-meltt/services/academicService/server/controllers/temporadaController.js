import pool from "../db.js";

class TemporadaController {
    async create(req, res) {
        try {
            const { ano, status } = req.body;

            if (!ano) {
                return res.status(400).json({ error: "O campo 'ano' é obrigatório." });
            }

            // Verifica se já existe uma temporada com o mesmo ano
            const rowsResult = await pool.query(
                `SELECT id FROM temporadas WHERE ano = $1 LIMIT 1`,
                [ano]
            );

            if (rowsResult.rows.length > 0) {
                return res.status(409).json({ error: "Já existe uma temporada para este ano." });
            }


            const result = await pool.query(
                `INSERT INTO temporadas (ano, status) VALUES ($1, $2) RETURNING id`,
                [ano, status || "planejamento"]
            );

            return res.status(201).json({
                message: "Temporada criada com sucesso",
                id: result.rows[0].id,
                status: 201
            });
        } catch (error) {
            console.error("Erro ao criar temporada:", error);
            return res.status(500).json({ error: "Erro interno ao criar temporada" });
        }
    }

    async getAll(req, res) {
        try {
            const result = await pool.query(`SELECT * FROM temporadas ORDER BY ano DESC`);

            return res.json(result.rows);
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

            const result = await pool.query(
                `UPDATE temporadas SET status = $1 WHERE id = $2`,
                [status, id]
            );

            if (result.rowCount === 0) {
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
            const temporadasResult = await pool.query(`
        SELECT id, ano, status
        FROM temporadas
        ORDER BY ano DESC
      `);
            const temporadas = temporadasResult.rows;

            console.log('[Temporadas] Total de temporadas encontradas:', temporadas.length);

            const resultado = [];

            for (const temporada of temporadas) {
                console.log(`\n[Temporadas] Processando temporada ${temporada.id} (${temporada.ano}) com status '${temporada.status}'`);

                // 2. Buscar as turmas da temporada
                const turmasResult = await pool.query(
                    `SELECT id, nome
                     FROM turmas
                     WHERE temporada_id = $1
                     ORDER BY nome ASC`,
                    [temporada.id]
                );
                const turmas = turmasResult.rows;

                console.log(`[Temporadas] Turmas encontradas para a temporada ${temporada.id}:`, turmas.length);

                // 3. Para cada turma, calcular receita total
                const turmasDetalhadas = [];

                for (const turma of turmas) {
                    console.log(`  [Temporadas] Calculando dados da turma ${turma.id} (${turma.nome})`);

                    const alunosRowsResult = await pool.query(
                        `SELECT COUNT(*) AS total_alunos
                         FROM usuarios
                         WHERE tipo = 'ALUNO' AND turma_id = $1`,
                        [turma.id]
                    );

                    const totalAlunos = Number(alunosRowsResult.rows[0]?.total_alunos) || 0;

                    const custosRowsResult = await pool.query(
                        `SELECT
                            SUM(CASE WHEN situacao = 'Pago' THEN valor ELSE 0 END) AS total_pago,
                            SUM(CASE WHEN situacao = 'Parcialmente Pago' THEN valor ELSE 0 END) AS total_parcial
                         FROM custos
                         WHERE turma_id = $1
                           AND situacao IN ('Pago', 'Parcialmente Pago')`,
                        [turma.id]
                    );

                    const receitaPago = Number(custosRowsResult.rows[0]?.total_pago) || 0;
                    const receitaParcial = Number(custosRowsResult.rows[0]?.total_parcial) || 0;
                    const receitaTotal = receitaPago + receitaParcial;

                    console.log(`    [Temporadas] Totais calculados -> alunos: ${totalAlunos}, pago: ${receitaPago}, parcial: ${receitaParcial}, total: ${receitaTotal}`);

                    turmasDetalhadas.push({
                        id: turma.id,
                        nome: turma.nome,
                        totalAlunos,
                        receitaCentavos: receitaTotal,
                        receitaPagoCentavos: receitaPago,
                        receitaParcialCentavos: receitaParcial
                    });
                }

                if (!turmas.length) {
                    console.log(`[Temporadas] Temporada ${temporada.id} não possui turmas vinculadas.`);
                }

                const totalAlunosTemporada = turmasDetalhadas.reduce((acc, turma) => acc + turma.totalAlunos, 0);
                const totalReceitaTemporada = turmasDetalhadas.reduce((acc, turma) => acc + turma.receitaCentavos, 0);
                const totalReceitaPagoTemporada = turmasDetalhadas.reduce((acc, turma) => acc + (turma.receitaPagoCentavos ?? 0), 0);
                const totalReceitaParcialTemporada = turmasDetalhadas.reduce((acc, turma) => acc + (turma.receitaParcialCentavos ?? 0), 0);

                console.log(`  [Temporadas] Totais da temporada ${temporada.id} -> alunos: ${totalAlunosTemporada}, receita total: ${totalReceitaTemporada}`);

                // 4. Adiciona ao resultado final
                resultado.push({
                    id: temporada.id,
                    ano: temporada.ano,
                    status: temporada.status,
                    totais: {
                        alunos: totalAlunosTemporada,
                        receitaCentavos: totalReceitaTemporada,
                        receitaPagoCentavos: totalReceitaPagoTemporada,
                        receitaParcialCentavos: totalReceitaParcialTemporada
                    },
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
