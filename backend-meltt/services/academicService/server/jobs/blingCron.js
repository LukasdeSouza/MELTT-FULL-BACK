import cron from "node-cron";
import BlingSyncService from "../services/BlingSyncService.js";
import dotenv from "dotenv";
import fs from 'fs';

dotenv.config();

const BLING_TOKEN = process.env.BLING_ADMIN_TOKEN;

const syncBlingData = async () => {
    try {
        const token = fs.readFileSync('.temp_bling_token', 'utf8');

        if (!token) {
            console.log("Nenhum token disponível. Aguardando ação de um admin...");
            return;
        }
        console.log("Iniciando sincronização com Bling...");
        const { insertedCount, duplicateCount } = await BlingSyncService.syncAllContasReceber(BLING_TOKEN);
        console.log(
            `Sincronização concluída! Inseridos: ${insertedCount}, Atualizados: ${duplicateCount}`
        );
    } catch (error) {
        console.error("Falha na sincronização:", error);
    }
};

cron.schedule("0 */6 * * *", syncBlingData);
