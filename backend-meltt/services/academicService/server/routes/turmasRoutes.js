import express from "express";
import turmaController from "../controllers/turmaController.js";
import authMiddleware from "../middlewares/auth/index.js";

const router = express.Router();

router.get("/faculdade/:id", authMiddleware, turmaController.getTurmaByFaculdadeId);
router.put("/atualizar-planos", authMiddleware, turmaController.atualizarPlanosFormatura);
router.post("/vincular-planos", authMiddleware, turmaController.vincularPlanoFormatura);
router.delete("/desvincular-planos", authMiddleware, turmaController.desvincularPlanoFormatura);
router.post("/", authMiddleware, turmaController.createTurma);
router.get("/", authMiddleware, turmaController.getAllTurmas);
router.get("/:id", authMiddleware, turmaController.getTurmaById);
router.patch("/:id", authMiddleware, turmaController.updateTurma);
router.delete("/:id", authMiddleware, turmaController.deleteTurma);


export default router;