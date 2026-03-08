import User from '../models/User.js';

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude password
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng' });
        }

        await user.deleteOne();
        res.json({ message: 'Đã xóa người dùng thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

import Roadmap from '../models/Roadmap.js';
import bcrypt from 'bcryptjs';

// Lấy thông tin Public Profile (Bao gồm người khác xem)
export const getPublicProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password -email -resetPasswordToken -resetPasswordExpire');
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        // Lấy danh sách lộ trình public của user này
        const roadmaps = await Roadmap.find({ author: user._id, isPublic: true, isDeleted: false })
            .sort({ createdAt: -1 });

        // Tính toán thống kê
        let totalClones = 0;
        let totalStars = 0;
        let roadmapsWithStars = 0;

        roadmaps.forEach(r => {
            totalClones += (r.clonesCount || 0);
            if (r.averageRating > 0) {
                totalStars += r.averageRating;
                roadmapsWithStars++;
            }
        });

        const averageRating = roadmapsWithStars > 0 ? (totalStars / roadmapsWithStars).toFixed(1) : 0;

        // Đếm số lộ trình user đang học (đã clone)
        const learningCount = await Roadmap.countDocuments({
            author: user._id,
            originalRoadmap: { $ne: null },
            isDeleted: false
        });

        res.json({
            user,
            stats: {
                createdCount: roadmaps.length,
                clonesCount: totalClones,
                averageRating: Number(averageRating),
                learningCount
            },
            roadmaps
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Cập nhật thông tin cơ bản (Tên, Bio, Avatar URL)
export const updateProfile = async (req, res) => {
    try {
        const { username, bio, avatar } = req.body;

        // Kiểm tra xem username có bị trùng không
        if (username) {
            const existingUser = await User.findOne({ username, _id: { $ne: req.user.id } });
            if (existingUser) return res.status(400).json({ message: 'Tên người dùng đã tồn tại' });
        }

        const updateFields = {};
        if (username) updateFields.username = username;
        if (bio !== undefined) updateFields.bio = bio;
        if (avatar) updateFields.avatar = avatar; // Avatar can be URL or filepath

        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            { $set: updateFields },
            { new: true }
        ).select('-password');

        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Đổi mật khẩu
export const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select('+password');

        if (user.authProvider !== 'local') {
            return res.status(400).json({ message: 'Tài khoản đăng nhập qua Mạng xã hội không thể đổi mật khẩu tại đây.' });
        }

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Vui lòng nhập đủ Mật khẩu hiện tại và Mật khẩu mới' });
        }

        // Kiểm tra mật khẩu cũ
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
        }

        // Hash password mới
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);
        await user.save();

        res.json({ message: 'Đổi mật khẩu thành công' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

