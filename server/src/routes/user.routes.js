import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
    getAllUsers,
    deleteUser,
    getPublicProfile,
    updateProfile,
    changePassword
} from '../controllers/user.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { verifyAdmin } from '../middlewares/verifyAdmin.js';

const router = express.Router();

// ----------------------------------------------------
// 1. MULTER CONFIGURATION FOR AVATAR UPLOADS
// ----------------------------------------------------
const uploadDir = path.join(process.cwd(), 'uploads', 'avatars');

// Đảm bảo thư mục lưu trữ tồn tại
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Tên file: avatar-userId-timestamp.ext
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `avatar-${req.user.id}-${uniqueSuffix}${ext}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Chỉ chấp nhận file ảnh
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Vui lòng chỉ tải lên file hình ảnh (jpg, jpeg, png, webp)'), false);
    }
};

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 2 * 1024 * 1024 // Giới hạn 2MB
    },
    fileFilter: fileFilter
});

// ----------------------------------------------------
// 2. USER ROUTES
// ----------------------------------------------------

// Public Profile (Không cần token để xem thông tin người khác)
router.get('/:id/profile', getPublicProfile);

// Cập nhật Profile (Yêu cầu đăng nhập)
router.put('/profile', verifyToken, updateProfile);

// Upload Avatar File (Yêu cầu đăng nhập)
router.post('/profile/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn một file ảnh' });
        }

        // Host tĩnh thư mục uploads trong server.js -> Đường dẫn public: /uploads/avatars/filename
        const avatarUrl = `/uploads/avatars/${req.file.filename}`;

        // Import User model trực tiếp để update (hoặc chuyển logic sang controller tùy ý, ở đây viết gọn)
        const User = (await import('../models/User.js')).default;

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: { avatar: avatarUrl } },
            { new: true }
        ).select('-password');

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Đổi mật khẩu (Yêu cầu đăng nhập)
router.put('/change-password', verifyToken, changePassword);

// ----------------------------------------------------
// 3. ADMIN ROUTES
// ----------------------------------------------------
router.get('/', verifyToken, verifyAdmin, getAllUsers);
router.delete('/:id', verifyToken, verifyAdmin, deleteUser);

export default router;
