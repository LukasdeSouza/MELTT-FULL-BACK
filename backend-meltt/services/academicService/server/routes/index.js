import express from "express";

import turmasRoutes from "./turmasRoutes.js";
import faculdadesRoutes from "./faculdadesRoutes.js";
import contratosRoutes from "./contratosRoutes.js";
import fornecedoresRoutes from "./fornecedoresRoutes.js";
import topicosRoutes from "./topicosRoutes.js";
import respostasRoutes from "./respostasRoutes.js";
import eventosRoutes from "./eventosRoutes.js";
import preContratosRoutes from "./preContratoRoutes.js";
import notificacoesRoutes from "./notificacoesRoutes.js";
import blingRoutes from "./blingRoutes.js";
import uniticketRoutes from "./uniticketRoutes.js";
import s3Routes from "./s3Routes.js";
import planosFormaturaRoutes from "./planosFormaturaRoutes.js";
import tarefasRoutes from "./tarefasRoutes.js"
import adesoesRoutes from "./adesoesRoutes.js"
import usuariosRoutes from "./usuariosRoutes.js";
import pagamentosRoutes from "./pagamentosRoutes.js";
import assinaturaEstatutoRoutes from "./assinaturaEstatuto.js"
import agendaRoutes from './agendaRoutes.js';
import propostasRoutes from './propostasRoutes.js';
import atasRoutes from './atasRoutes.js';
import informativosRoutes from './informativosRoutes.js';
import d4SignRoutes from './d4SignRoutes.js';


const router = express.Router();

router.use("/turmas", turmasRoutes);
router.use("/faculdades", faculdadesRoutes);
router.use("/contratos", contratosRoutes);
router.use("/fornecedores", fornecedoresRoutes);
router.use("/topicos", topicosRoutes);
router.use("/respostas", respostasRoutes);
router.use("/eventos", eventosRoutes);
router.use("/pre-contrato", preContratosRoutes);
router.use("/notificacoes", notificacoesRoutes);
router.use("/bling", blingRoutes);
router.use("/uniticket", uniticketRoutes);
router.use("/s3/uploads", s3Routes)
router.use("/planos-formatura", planosFormaturaRoutes);
router.use("/tarefas", tarefasRoutes )
router.use("/adesoes", adesoesRoutes)
router.use("/usuarios", usuariosRoutes);
router.use("/pagamentos", pagamentosRoutes);
router.use("/assinatura-estatuto", assinaturaEstatutoRoutes);
router.use("/agenda", agendaRoutes);
router.use("/propostas", propostasRoutes);
router.use("/atas", atasRoutes);
router.use("/informativos", informativosRoutes);
router.use("/d4sign", d4SignRoutes);


export default router;