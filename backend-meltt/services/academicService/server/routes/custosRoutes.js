import express from "express";
import custosController from "../controllers/custosController.js";
import authMiddleware from "../middlewares/auth/index.js";

const router = express.Router();

router.get("/valor-total", authMiddleware, custosController.getTotalCustos);
router.get("/", authMiddleware, custosController.getAllCustos);
router.get("/:id", authMiddleware, custosController.getCustosById);
router.post("/", authMiddleware, custosController.createCustos);
router.put("/:id", authMiddleware, custosController.updateCustos);
router.delete("/:id", authMiddleware, custosController.deleteCustos);

export default router;