import express from "express";
import contratosController from "../controllers/contratosController.js";
import authMiddleware from "../middlewares/auth/index.js";

const router = express.Router();

router.get("/", authMiddleware, contratosController.getAllContratos);
router.get("/:id", authMiddleware, contratosController.getContratosById);
router.get("/associacao/:id", authMiddleware, contratosController.getContratosByAssociacaoId);
router.post("/", authMiddleware, contratosController.createContrato);
router.put("/:id", authMiddleware, contratosController.updateContratos);
router.delete("/:id", authMiddleware, contratosController.deleteContratos);

export default router;