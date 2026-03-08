import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  // --- 1. ĐỊNH DANH & BẢO MẬT ---
  username: {
    type: String,
    required: true,
    unique: true, // Lưu ý: Cần xử lý logic random username ở Controller nếu trùng
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    // Validate định dạng Email (Tránh nhập rác)
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
  },
  password: {
    type: String,
    select: false,
    // LOGIC CAO CẤP: Chỉ bắt buộc nhập pass nếu là tài khoản Local
    required: function () { return this.authProvider === 'local'; }
  },

  // --- 2. OAUTH ---
  authProvider: {
    type: String,
    enum: ['local', 'google', 'facebook'],
    default: 'local'
  },
  googleId: { type: String },
  facebookId: { type: String },

  // --- 3. PROFILE ---
  avatar: { type: String, default: "" },
  bio: { type: String, maxlength: 200 },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },

  // --- 4. GAMIFICATION (GOM GỌN VÀO ĐÂY) ---
  // Để riêng 1 cục object thế này, nhìn schema rất sạch
  gameStats: {
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    lastActiveAt: { type: Date, default: Date.now }, // Để tính streak
    badges: [{
      id: String,
      name: String,
      earnedAt: { type: Date, default: Date.now }
    }]
  },

  // --- 5. SYSTEM & SECURITY ---
  isVerified: { type: Boolean, default: false }, // Xác thực email (nên có)
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Middleware update timestamp
userSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('User', userSchema);