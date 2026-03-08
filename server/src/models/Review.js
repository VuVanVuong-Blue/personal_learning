import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
    roadmap: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Roadmap',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        trim: true,
        maxlength: 1000
    },
    reply: {
        text: {
            type: String,
            trim: true,
            maxlength: 1000
        },
        createdAt: {
            type: Date
        }
    }
}, { timestamps: true });

// Ensure a user can only review a roadmap once
reviewSchema.index({ roadmap: 1, user: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
