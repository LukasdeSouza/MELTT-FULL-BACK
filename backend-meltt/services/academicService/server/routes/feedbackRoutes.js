import express from "express";
import feedbackController from "../controllers/feedbackController.js";
import authMiddleware from "../middlewares/auth/index.js";

const router = express.Router();

router.get("/", authMiddleware, feedbackController.getAllFeedbacks);
router.get("/:id", authMiddleware, feedbackController.getFeedbackById);
router.post("/", authMiddleware, feedbackController.createFeedback);
router.delete("/:id", authMiddleware, feedbackController.deleteFeedback);

export default router;

