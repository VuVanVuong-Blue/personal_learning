import express from 'express';
import {
    getRoadmaps,
    createRoadmap,
    getRoadmapById,
    updateRoadmap,
    deleteRoadmap,
    cloneRoadmap,
    restoreRoadmap,
    hardDeleteRoadmap,
    clearAllTrash,
    checkCloneStatus,
    updateTaskProgress,
    getDailyReviewTasks
} from '../controllers/roadmap.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

router.use(verifyToken); // All roadmap routes require login right now

router.get('/daily-review', getDailyReviewTasks);
router.get('/', getRoadmaps);
router.post('/', createRoadmap);
router.delete('/trash/all', clearAllTrash);
router.get('/:id', getRoadmapById);
router.put('/:id', updateRoadmap);
router.put('/:id/tasks/:taskId/progress', updateTaskProgress);
router.delete('/:id', deleteRoadmap);
router.get('/:id/check-clone', checkCloneStatus);
router.post('/:id/clone', cloneRoadmap);
router.post('/:id/restore', restoreRoadmap);
router.delete('/:id/hard', hardDeleteRoadmap);

export default router;
