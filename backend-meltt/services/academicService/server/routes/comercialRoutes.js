import express from 'express';
import {
  addTurmaToPipeline,
  getPipelineTurmas,
  updateTurmaStatus,
  getPipelineStats,
} from '../controllers/comercialController.js';

const router = express.Router();

router.get('/stats', getPipelineStats);

router.post('/turmas', addTurmaToPipeline)
router.get('/turmas', getPipelineTurmas)
router.patch('/turmas/:id', updateTurmaStatus)

export default router;