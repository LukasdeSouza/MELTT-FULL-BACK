import express from "express";
import eventosController from "../controllers/eventosController.js";
import authMiddleware from "../middlewares/auth/index.js";

const router = express.Router();

router.get("/", authMiddleware, eventosController.getAllEventos);
router.get("/:id", authMiddleware, eventosController.getEventosById);
router.get("/turma/:id", authMiddleware, eventosController.getEventosByTurmaId);
router.post("/", authMiddleware, eventosController.createEventos);
router.put("/:id", authMiddleware, eventosController.updateEventos);
router.delete("/:id", authMiddleware, eventosController.deleteEventos);

export default router;