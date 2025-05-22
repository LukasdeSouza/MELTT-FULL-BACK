import express from "express";
import topicosController from "../controllers/topicosController.js";
import authMiddleware from "../middlewares/auth/index.js";

const router = express.Router();

router.get("/", authMiddleware, topicosController.getAllTopicos);
router.get("/:id", authMiddleware, topicosController.getTopicoById);
router.get("/turma/:id", authMiddleware, topicosController.getTopicoByTurmaId);
router.post("/", authMiddleware, topicosController.createTopico);
router.patch("/:id", authMiddleware, topicosController.updateTopico);
router.delete("/:id", authMiddleware, topicosController.deleteTopico);

export default router;