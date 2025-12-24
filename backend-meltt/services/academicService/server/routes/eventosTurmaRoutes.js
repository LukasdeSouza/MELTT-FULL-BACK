import express from "express";
import eventosTurmaController from "../controllers/eventosTurmaController.js";
import authMiddleware from "../middlewares/auth/index.js";

const router = express.Router();

router.get("/", authMiddleware, eventosTurmaController.getAllEventosTurma);
router.get(
  "/turma/:turmaId",
  authMiddleware,
  eventosTurmaController.getEventosTurmaByTurmaId
);
router.get(
  "/:id",
  authMiddleware,
  eventosTurmaController.getEventoTurmaById
);
router.post("/", authMiddleware, eventosTurmaController.createEventoTurma);
router.put(
  "/:id",
  authMiddleware,
  eventosTurmaController.updateEventoTurma
);
router.delete(
  "/:id",
  authMiddleware,
  eventosTurmaController.deleteEventoTurma
);

export default router;
