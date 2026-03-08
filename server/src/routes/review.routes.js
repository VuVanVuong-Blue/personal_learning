import express from 'express';
import { createReview, getRoadmapReviews, replyToReview } from '../controllers/review.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router({ mergeParams: true });

// Route endpoints
// Base URL from server.js will be: /api/roadmaps/:roadmapId/reviews
router.post('/', verifyToken, createReview);
router.get('/', getRoadmapReviews);
router.post('/:reviewId/reply', verifyToken, replyToReview);

export default router;
