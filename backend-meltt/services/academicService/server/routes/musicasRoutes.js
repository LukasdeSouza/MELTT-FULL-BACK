import express from "express";
import MusicasController from "../controllers/musicasController.js";
import authMiddleware from "../middlewares/auth/index.js";

const router = express.Router();

router.get("/", authMiddleware, MusicasController.getAllMusicas);
router.get("/:id", authMiddleware, MusicasController.getMusicaById);
router.get("/turma/:id", authMiddleware, MusicasController.getMusicasByTurmaId);
router.post("/", authMiddleware, MusicasController.createMusica);
router.put("/:id", authMiddleware, MusicasController.updateMusica);
router.delete("/:id", authMiddleware, MusicasController.deleteMusica);

export default router;
