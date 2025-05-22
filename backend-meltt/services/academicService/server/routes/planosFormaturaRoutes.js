import express from "express";
import planosFormaturaController from "../controllers/planosFormaturaController.js";
import authMiddleware from "../middlewares/auth/index.js";

const router = express.Router();

router.get("/turma/:id", authMiddleware, planosFormaturaController.getPlanosFormatura);
router.get("/", authMiddleware, planosFormaturaController.getAllPlanosFormatura);
router.get("/:id", authMiddleware, planosFormaturaController.getPlanoFormatura);
router.post("/", authMiddleware, planosFormaturaController.createPlanoFormatura);
router.patch("/:id", authMiddleware, planosFormaturaController.updatePlanoFormatura);
router.delete("/:id", authMiddleware, planosFormaturaController.deletePlanoFormatura);

export default router;