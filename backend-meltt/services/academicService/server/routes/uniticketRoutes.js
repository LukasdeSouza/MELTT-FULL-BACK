import express from "express";
import uniticketController from "../controllers/uniticketController.js";

const router = express.Router();

router.get("/buyers", uniticketController.getBuyers);
router.get("/checkins", uniticketController.getCheckins);
router.get("/tickets", uniticketController.getTickets);
router.get("/participants", uniticketController.getParticipants);

export default router;