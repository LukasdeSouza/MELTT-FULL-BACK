import cron from "node-cron";
import axios from "axios";
import pool from "../db.js";
import fs from 'fs';
import path from 'path';

const syncBlingContas = async () => {
  console.log("Iniciando sincronização com Bling...");
  try {
    const tokenPath = path.resolve(process.cwd(), '.temp_bling_token');
    if (!fs.existsSync(tokenPath)) {
      console.log("Token do Bling não encontrado. Pulando sincronização.");
      return;
    }
    const token = fs.readFileSync(tokenPath, 'utf8');

    const response = await axios.get(
      `https://www.bling.com.br/Api/v3/contas/receber`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    const contasReceber = response.data.data;
    if (!contasReceber || contasReceber.length === 0) {
      console.log("Nenhuma conta a receber encontrada no Bling para sincronizar.");
      return;
    }

    let insertedCount = 0;
    let duplicateCount = 0;

    for (const conta of contasReceber) {
      const { id: blingPaymentId, valor, vencimento, situacao, dataEmissao, linkBoleto } = conta;
      const { id: blingContactId, numeroDocumento } = conta.contato;

      try {
        const result = await pool.query(
          `INSERT INTO pagamentos (
          bling_payment_id, id_bling, valor, vencimento, situacao, dataEmissao, linkBoleto, numeroDocumento
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (bling_payment_id) DO UPDATE SET
          valor = EXCLUDED.valor, 
          vencimento = EXCLUDED.vencimento, 
          situacao = EXCLUDED.situacao,
          dataEmissao = EXCLUDED.dataEmissao, 
          linkBoleto = EXCLUDED.linkBoleto, 
          numeroDocumento = EXCLUDED.numeroDocumento`,
          [blingPaymentId, blingContactId, valor, vencimento, situacao, dataEmissao, linkBoleto || null, numeroDocumento]
        );

        if (result.rowCount === 1) insertedCount++;
        else duplicateCount++;

      } catch (queryErr) {
        console.error("Erro ao inserir/atualizar pagamento no banco:", queryErr);
      }
    }
    console.log(`Sincronização com Bling concluída. Inseridos: ${insertedCount}, Atualizados: ${duplicateCount}`);

  } catch (error) {
    console.error("Erro ao sincronizar com Bling:", error.response?.data || error.message);
  }
};

// Agenda a tarefa para rodar a cada hora
cron.schedule('0 * * * *', syncBlingContas);

console.log("Job de sincronização com Bling agendado para rodar a cada hora.");

export { syncBlingContas };
