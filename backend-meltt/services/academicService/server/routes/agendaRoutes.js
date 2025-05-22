import express from "express";
import agendaController from "../controllers/agendaController.js";
import authMiddleware from "../middlewares/auth/index.js";

const router = express.Router();

router.get("/", authMiddleware, agendaController.getAllAgenda);
router.get("/:id", authMiddleware, agendaController.getAgenda);
router.post("/", authMiddleware, agendaController.createAgenda);
router.put("/:id", authMiddleware, agendaController.updateAgenda);
router.delete("/:id", authMiddleware, agendaController.deleteAgenda);

export default router;