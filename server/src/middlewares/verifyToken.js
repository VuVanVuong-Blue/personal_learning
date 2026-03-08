import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Không có token, từ chối truy cập' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // { id, iat, exp }
        next();
    } catch (error) {
        res.status(400).json({ message: 'Token không hợp lệ' });
    }
};
