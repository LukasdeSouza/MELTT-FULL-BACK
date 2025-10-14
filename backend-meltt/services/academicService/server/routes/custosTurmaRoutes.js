import express from "express";
import custosTurmaController from "../controllers/custosTurmaController.js";
import authMiddleware from "../middlewares/auth/index.js";

const router = express.Router();

router.post("/", authMiddleware, custosTurmaController.createCustoTurma);
router.get("/", authMiddleware, custosTurmaController.getAllCustosTurma);
router.get("/:id", authMiddleware, custosTurmaController.getCustoTurmaById);
router.get("/valor-total/:id", authMiddleware, custosTurmaController.getTotalEntradasSaidasByTurma);
router.patch("/:id", authMiddleware, custosTurmaController.updateCustoTurma);
router.delete("/:id", authMiddleware, custosTurmaController.deleteCustoTurma);

export default router;