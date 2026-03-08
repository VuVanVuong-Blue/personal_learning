import express from 'express';
import { analyzeTopic, generateMilestones, researchWebContext, generateTasks, formatAndSaveRoadmap, chatWithMentor } from '../controllers/ai.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

// Apply auth middleware to all AI routes
router.use(verifyToken);

router.post('/roadmap/step1-analyze', analyzeTopic);
router.post('/roadmap/step2-architect', generateMilestones);
router.post('/roadmap/step3-research', researchWebContext);
router.post('/roadmap/step4-teacher', generateTasks);
router.post('/roadmap/step5-format', formatAndSaveRoadmap);

router.post('/mentor/chat', chatWithMentor);

export default router;
