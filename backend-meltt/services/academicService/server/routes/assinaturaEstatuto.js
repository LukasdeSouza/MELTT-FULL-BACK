import express from "express";
import assinaturaEstatutoController from "../controllers/assinaturaEstatuto.js";
import authMiddleware from "../middlewares/auth/index.js";

const router = express.Router();

router.get("/", authMiddleware, assinaturaEstatutoController.getAllEstatutosAssinados);
router.get("/:id", authMiddleware, assinaturaEstatutoController.getEstatutoAssinadosById);
router.get("/usuario/:id", authMiddleware, assinaturaEstatutoController.getEstatutoAssinadosByUser);
router.post("/", authMiddleware, assinaturaEstatutoController.assinaturEstatuto);

export default router;