import express from "express";
import propostasController from "../controllers/propostasController.js";
import authMiddleware from "../middlewares/auth/index.js";

const router = express.Router();

router.get("/", authMiddleware, propostasController.getAllPropostas);
router.get("/:id", authMiddleware, propostasController.getPropostaById);
router.get("/turma/:id", authMiddleware, propostasController.getPropostasByTurmaId);
router.post("/", authMiddleware, propostasController.createProposta);
router.put("/:id", authMiddleware, propostasController.updateProposta);
router.delete("/:id", authMiddleware, propostasController.deleteProposta);

export default router;