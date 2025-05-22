import express from "express";
import preContratoController from "../controllers/preContratoController.js";
import authMiddleware from "../middlewares/auth/index.js";

const router = express.Router();

router.get("/", authMiddleware, preContratoController.getAllPreContratos);
router.get("/:id", authMiddleware, preContratoController.getPreContratoById);
router.post("/", authMiddleware, preContratoController.createPreContrato);
router.put("/:id", authMiddleware, preContratoController.updatePreContrato);
router.delete("/:id", authMiddleware, preContratoController.deletePreContrato);

export default router;