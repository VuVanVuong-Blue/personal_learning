import User from '../models/User.js';

export const verifyAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ message: 'Bạn không có quyền truy cập (Admin only)' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: 'Lỗi xác thực quyền' });
    }
};
