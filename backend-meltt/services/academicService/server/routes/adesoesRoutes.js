import express from "express";
import adesoesController from "../controllers/adesoesController.js";
import authMiddleware from "../middlewares/auth/index.js";

const router = express.Router();

router.get("/", authMiddleware, adesoesController.getAllAdesoes);
router.get("/:id", authMiddleware, adesoesController.getAdesaoById);
router.get("/turma/:id", authMiddleware, adesoesController.getAdesoesByTurmaId);
router.get("/aluno/:id", authMiddleware, adesoesController.getAdesoesByTurmaId);
router.post("/", authMiddleware, adesoesController.createAdesao);
router.put("/:id", authMiddleware, adesoesController.updateAdesao);
router.delete("/:id", authMiddleware, adesoesController.deleteAdesao);

export default router;