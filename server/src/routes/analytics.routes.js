import express from 'express';
import {
    startStudySession,
    stopStudySession,
    getProductivityStats,
    getContributionHeatmap
} from '../controllers/analytics.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

router.use(verifyToken);

// Start Pomodoro / Study session
router.post('/sessions/start', startStudySession);

// Stop Pomodoro / Study session
router.put('/sessions/:id/stop', stopStudySession);

// Get Focus Hours, Gold Hour, and Burndown Data
router.get('/productivity', getProductivityStats);

// Get Contribution Heatmap Data for a User (Yearly)
router.get('/heatmap/:userId', getContributionHeatmap);

export default router;
