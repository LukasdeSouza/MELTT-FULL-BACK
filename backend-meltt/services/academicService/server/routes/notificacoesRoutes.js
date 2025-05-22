import express from "express";
import notificacoesController from "../controllers/notificacoesController.js";
import authMiddleware from "../middlewares/auth/index.js";

const router = express.Router();

router.get("/", authMiddleware, notificacoesController.getAllNotificacoes);
router.patch("/:id", authMiddleware, notificacoesController.updateNotificacao);

export default router;

