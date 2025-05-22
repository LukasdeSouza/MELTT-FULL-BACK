import express from "express";
import fornecedoresController from "../controllers/fornecedoresController.js";
import authMiddleware from "../middlewares/auth/index.js";

const router = express.Router();

router.get("/", authMiddleware, fornecedoresController.getAllFornecedores);
router.get("/:id", authMiddleware, fornecedoresController.getFornecedoresById);
router.post("/", authMiddleware, fornecedoresController.createFornecedores);
router.put("/:id", authMiddleware, fornecedoresController.updateFornecedores);
router.delete("/:id", authMiddleware, fornecedoresController.deleteFornecedores);

export default router;