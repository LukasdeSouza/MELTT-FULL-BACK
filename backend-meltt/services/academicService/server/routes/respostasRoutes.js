import express from "express";
import respostasController from "../controllers/respostasController.js";
import authMiddleware from "../middlewares/auth/index.js";

const router = express.Router();

router.get("/", authMiddleware, respostasController.getAllRespostas);
router.get("/:id", authMiddleware, respostasController.getRespostaById);
router.get("/topico/:id", authMiddleware, respostasController.getRespostaByTopicoId);
router.post("/", authMiddleware, respostasController.createResposta);
router.patch("/:id", authMiddleware, respostasController.updateResposta);
router.delete("/:id", authMiddleware, respostasController.deleteResposta);

export default router;