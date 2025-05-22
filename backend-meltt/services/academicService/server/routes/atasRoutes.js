import express from "express";
import atasController from "../controllers/atasController.js";
import authMiddleware from "../middlewares/auth/index.js";

const router = express.Router();

router.get("/", authMiddleware, atasController.getAllAtas);
router.get("/:id", authMiddleware, atasController.getAtaById);
router.get("/turma/:id", authMiddleware, atasController.getAtasByTurmaId);
router.post("/", authMiddleware, atasController.createAta);
router.put("/:id", authMiddleware, atasController.updateAta);
router.delete("/:id", authMiddleware, atasController.deleteAta);

export default router;