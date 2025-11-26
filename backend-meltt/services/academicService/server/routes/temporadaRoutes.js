import express from "express";
import authMiddleware from "../middlewares/auth/index.js";
import TemporadaController from "../controllers/temporadaController.js";

const router = express.Router();

router.post("/", authMiddleware, TemporadaController.create);
router.get("/", authMiddleware, TemporadaController.getAll);
router.get("/details", authMiddleware, TemporadaController.getTemporadasDetalhadas);
router.put("/:id/status", authMiddleware, TemporadaController.updateStatus);

export default router;