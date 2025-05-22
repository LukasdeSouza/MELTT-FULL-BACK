import express from "express";
import faculdadeController from "../controllers/faculdadeController.js";
import authMiddleware from "../middlewares/auth/index.js";

const router = express.Router();

router.get("/", authMiddleware, faculdadeController.getAllFaculdade);
router.get("/:id", authMiddleware, faculdadeController.getFaculdadeById);
router.post("/", authMiddleware, faculdadeController.createFaculdade);
router.put("/:id", authMiddleware, faculdadeController.updateFaculdade);
router.delete("/:id", authMiddleware, faculdadeController.deleteFaculdade);

export default router;