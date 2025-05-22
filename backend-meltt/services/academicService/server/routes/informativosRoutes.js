import express from "express";
import informativoController from "../controllers/informativoController.js";
import authMiddleware from "../middlewares/auth/index.js";

const router = express.Router();

router.get("/", authMiddleware, informativoController.getAllInformativos);
router.get("/:id", authMiddleware, informativoController.getInformativoById);
router.get("/turma/:id", authMiddleware, informativoController.getInformativosByTurmaId);
router.post("/", authMiddleware, informativoController.createInformativo);
router.put("/:id", authMiddleware, informativoController.updateInformativo);
router.delete("/:id", authMiddleware, informativoController.deleteInformativo);

export default router;