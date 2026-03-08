import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

export const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'Email đã tồn tại' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            username,
            email,
            password: hashedPassword
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                token: generateToken(user.id)
            });
        } else {
            res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');

        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                role: user.role,
                avatar: user.avatar,
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ message: 'Thông tin đăng nhập không đúng' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const googleLogin = async (req, res) => {
    try {
        const { googleId, email, username, avatar } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });

        if (user) {
            // Update existing user with new info from Google (fixes name/avatar issues)
            user.username = username;
            user.avatar = avatar;
            if (!user.googleId) {
                user.googleId = googleId;
            }
            await user.save();
        } else {
            // Create new user
            // Generate random password for OAuth user
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPassword, salt);

            user = await User.create({
                username: username || email.split('@')[0],
                email,
                password: hashedPassword,
                googleId,
                avatar,
                authProvider: 'google',
                isVerified: true
            });
        }

        res.json({
            _id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            token: generateToken(user.id)
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getMe = async (req, res) => {
    // Middleware verify token sẽ gán req.user
    res.status(200).json(req.user);
};

// Forgot Password Stub
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy email' });
        }
        // Logic gửi email reset password sẽ ở đây
        // Tạo reset token và lưu vào db

        res.status(200).json({ message: 'Đã gửi email khôi phục mật khẩu (Giả lập)' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
