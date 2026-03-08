import express from 'express';
import { createReport, getAllReports, resolveReport } from '../controllers/report.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';

const router = express.Router();

// User sends a report
router.post('/', verifyToken, createReport);

// Admin routes
router.get('/', verifyToken, verifyAdmin, getAllReports);
router.put('/:id/resolve', verifyToken, verifyAdmin, resolveReport);

export default router;
