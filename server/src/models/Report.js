import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    reporter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // ID of the user who owns the reported content (to notify or ban them)
    reportedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // What is being reported? A 'roadmap' or a 'review'
    targetType: {
        type: String,
        enum: ['Roadmap', 'Review'],
        required: true
    },
    targetId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    reason: {
        type: String,
        enum: ['Spam/Quảng cáo', 'Ngôn từ thù ghét', 'Nội dung phản cảm', 'Chất lượng kém', 'Khác'],
        required: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    status: {
        type: String,
        enum: ['pending', 'resolved', 'rejected'],
        default: 'pending'
    },
    adminAction: {
        type: String,
        default: ''
    }
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);
