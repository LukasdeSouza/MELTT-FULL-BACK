import express from "express";
import d4SignController from "../controllers/d4signController.js";
import authMiddleware from "../middlewares/auth/index.js";

const router = express.Router();

router.post("/create-signature-list", authMiddleware, d4SignController.createSignatureList);
router.post("/send-to-signer", authMiddleware, d4SignController.sendDocumentToSigner);
router.post("/download", authMiddleware, d4SignController.documentDownload);

export default router;