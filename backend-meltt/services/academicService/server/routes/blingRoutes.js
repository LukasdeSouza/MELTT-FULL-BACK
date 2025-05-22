import express from "express";
import blingController from "../controllers/blingController.js";

const router = express.Router();

router.get("/contas/receber", blingController.getAllContasReceber);
router.get("/contatos", blingController.getAllContatos);

export default router;