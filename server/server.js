import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './src/config/db.js';
import { startTrashCleaner } from './src/cron/trashCleaner.js';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import roadmapRoutes from './src/routes/roadmap.routes.js';
import reviewRoutes from './src/routes/review.routes.js';
import reportRoutes from './src/routes/report.routes.js';
import analyticsRoutes from './src/routes/analytics.routes.js';
import aiRoutes from './src/routes/ai.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
import path from 'path';

// Middlewares
app.use(express.json());
app.use(cors({
    origin: '*', // Allow all origins for dev
    credentials: true
}));

// Phục vụ các file tĩnh (Hình ảnh upload)
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Connect Database & Services (Kết nối Cơ sở dữ liệu & Các dịch vụ chạy ngầm)
connectDB();

// Khởi động trình dọn dẹp rác tự động (Start the automatic trash cleaner)
// Lệnh này sẽ kích hoạt file trashCleaner.js chạy ngầm bằng 'node-cron'
startTrashCleaner();

// Routes (Định tuyến API)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/roadmaps/:roadmapId/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
