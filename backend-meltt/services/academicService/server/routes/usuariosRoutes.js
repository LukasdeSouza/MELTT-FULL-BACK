import express from "express";
import usuariosController from "../controllers/usuariosController.js";
import authMiddleware from "../middlewares/auth/index.js";

const router = express.Router();

router.get("/", authMiddleware, usuariosController.getAllUsuarios);
router.get("/:id", authMiddleware, usuariosController.getUsuarioById);
router.post("/", authMiddleware, usuariosController.createUsuario);
router.put("/:id/inativar", authMiddleware, usuariosController.updateUsuarioStatus);
router.put("/:id", authMiddleware, usuariosController.updateUsuario);

export default router;