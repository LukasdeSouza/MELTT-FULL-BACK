import axios from "axios";
import pool from "../db.js";
import fs from 'fs';
import { format, subMonths, addMonths } from "date-fns";

class BlingController {
  async getAllContasReceber(req, res) {
    try {
      const { authorization } = req.headers;
      const { pagina = 1, situacoes, dataInicial, dataFinal } = req.query;
      const token = authorization.replace(/^Bearer\s+/i, "");
      fs.writeFileSync('.temp_bling_token', token);

      const params = new URLSearchParams();
      params.append("limite", "20");
      params.append("pagina", String(pagina));
      params.append("tipoFiltroData", "V");

      const isValidDate = (dateStr) => /^\d{4}-\d{2}-\d{2}$/.test(dateStr);

      const finalDataInicial = isValidDate(dataInicial)
        ? dataInicial
        : format(subMonths(new Date(), 1), 'yyyy-MM-dd');

      const finalDataFinal = isValidDate(dataFinal)
        ? dataFinal
        : format(addMonths(new Date(), 1), 'yyyy-MM-dd');

      params.append("dataInicial", finalDataInicial);
      params.append("dataFinal", finalDataFinal);

      if (situacoes) {
        if (typeof situacoes === 'string') {
          params.append("situacoes[]", situacoes);
        }

        if (Array.isArray(situacoes)) {
          situacoes.forEach((sit) => params.append("situacoes[]", sit));
        }
      }

      const response = await axios.get(
        `https://www.bling.com.br/Api/v3/contas/receber?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      const contasReceber = response.data.data;
      let insertedCount = 0;
      let duplicateCount = 0;

      for (const conta of contasReceber) {
        const { id: blingPaymentId, valor, vencimento, situacao, dataEmissao, linkBoleto } = conta;
        const { id: blingContactId, numeroDocumento } = conta.contato;

        try {
          const [result] = await pool.promise().query(
            `INSERT INTO pagamentos (
            bling_payment_id, id_bling, valor, vencimento, situacao, dataEmissao, linkBoleto, numeroDocumento
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?) 
          ON DUPLICATE KEY UPDATE 
            valor = VALUES(valor), vencimento = VALUES(vencimento), situacao = VALUES(situacao),
            dataEmissao = VALUES(dataEmissao), linkBoleto = VALUES(linkBoleto), numeroDocumento = VALUES(numeroDocumento)`,
            [blingPaymentId, blingContactId, valor, vencimento, situacao, dataEmissao, linkBoleto || null, numeroDocumento]
          );

          if (result.affectedRows === 1) insertedCount++;
          else duplicateCount++;

        } catch (queryErr) {
          console.error("Erro no banco:", queryErr);
        }
      }

      res.json({
        message: "Dados salvos com sucesso",
        data: contasReceber,
        inserted: insertedCount,
        duplicates: duplicateCount,
        success: true
      });

    } catch (error) {
      console.error("Erro ao comunicar com Bling:", error.response?.data || error.message);
      res.status(500).json({ message: error.message, status: error.status });
    }
  }

  async getAllContatos(req, res) {
    try {
      const { authorization } = req.headers;
      const { pagina = 1 } = req.query;
      const token = authorization.replace(/^Bearer\s+/i, "");

      const params = new URLSearchParams();
      params.append("limite", "100");
      params.append("pagina", String(pagina));

      const response = await axios.get(
        `https://www.bling.com.br/Api/v3/contatos?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return res.json({
        message: "Requisição realizada com sucesso",
        data: response.data.data,
        success: true
      });
    } catch (error) {
      console.error("Erro ao comunicar com Bling:", error.response?.data || error.message);
      return res.status(500).json({
        message: error.message,
        status: error.status
      });
    }
  }
}

export default new BlingController();
