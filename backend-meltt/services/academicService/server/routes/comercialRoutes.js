import express from 'express';
import {
  addTurmaToPipeline,
  getPipelineTurmas,
  updateTurmaStatus,
  getPipelineStats,
} from '../controllers/comercialController.js';
// import { protect, admin } from '../middleware/authMiddleware.js'; // Assuming you have auth middleware

const router = express.Router();

// All routes here are prefixed with /api/comercial

router.route('/stats').get(getPipelineStats); // Add protect middleware later

router
  .route('/turmas')
  .post(addTurmaToPipeline) // Add protect middleware later
  .get(getPipelineTurmas); // Add protect middleware later

router
  .route('/turmas/:id')
  .patch(updateTurmaStatus); // Add protect middleware later

export default router;