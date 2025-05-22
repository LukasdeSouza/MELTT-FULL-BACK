import axios from "axios";
import { pool } from "../database.js";
import { format, subMonths, addMonths } from "date-fns";

class BlingSyncService {
  static async syncAllContasReceber(token) {
    let currentPage = 1;
    let hasMorePages = true;
    let insertedCount = 0;
    let duplicateCount = 0;

    while (hasMorePages) {
      try {
        const params = new URLSearchParams({
          limite: "100", // Use o máximo permitido pela API (ex: 100)
          pagina: currentPage.toString(),
          dataInicial: format(subMonths(new Date(), 2), "yyyy-MM-dd"),
          dataFinal: format(addMonths(new Date(), 3), "yyyy-MM-dd"),
        });

        const response = await axios.get(
          `https://www.bling.com.br/Api/v3/contas/receber?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const contasReceber = response.data.data;

        if (!contasReceber || contasReceber.length === 0) {
          hasMorePages = false;
          break;
        }

        for (const conta of contasReceber) {
          const {
            id: blingPaymentId,
            valor,
            vencimento,
            situacao,
            dataEmissao,
            linkBoleto,
          } = conta;
          const { id: blingContactId, numeroDocumento } = conta.contato;

          try {
            const [result] = await pool.promise().query(
              `INSERT INTO pagamentos (
                bling_payment_id, id_bling, valor, vencimento, situacao, dataEmissao, linkBoleto, numeroDocumento
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
              ON DUPLICATE KEY UPDATE 
                valor = VALUES(valor), vencimento = VALUES(vencimento), situacao = VALUES(situacao),
                dataEmissao = VALUES(dataEmissao), linkBoleto = VALUES(linkBoleto), numeroDocumento = VALUES(numeroDocumento)`,
              [
                blingPaymentId,
                blingContactId,
                valor,
                vencimento,
                situacao,
                dataEmissao,
                linkBoleto || null,
                numeroDocumento,
              ]
            );

            if (result.affectedRows === 1) insertedCount++;
            else duplicateCount++;
          } catch (queryErr) {
            console.error("Erro no banco:", queryErr);
          }
        }

        const totalPages = Math.ceil(response.data.pagination.totalItens / 100);
        hasMorePages = currentPage < totalPages;
        currentPage++;

      } catch (error) {
        console.error(`Erro na página ${currentPage}:`, error.response?.data || error.message);
        hasMorePages = false;
        throw error; 
      }
    }

    return { insertedCount, duplicateCount };
  }
}

export default BlingSyncService;