import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['link', 'pdf', 'youtube'], default: 'link' }
});

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, default: '' }, // HTML string from rich text editor
    resources: [resourceSchema],
    isCompleted: { type: Boolean, default: false },
    confidenceLevel: { type: String, enum: ['low', 'medium', 'high'] },
    nextReviewDate: { type: Date },
    timeSpent: { type: Number, default: 0 }, // in seconds
    reflectionNote: { type: String, default: '' }
}, { timestamps: true });

const milestoneSchema = new mongoose.Schema({
    title: { type: String, required: true },
    deadline: { type: Date },
    tasks: [taskSchema]
}, { timestamps: true });

const roadmapSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String },
    category: { type: String },
    coverImage: { type: String, default: '' },
    themeColor: { type: String, default: 'indigo' },
    deadline: { type: Date },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPublic: { type: Boolean, default: false },
    clonesCount: { type: Number, default: 0 },
    originalRoadmap: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', default: null },

    // Rating & Reviews
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

    // Soft Delete Fields
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },

    // Nested Documents
    milestones: [milestoneSchema]
}, { timestamps: true });

export default mongoose.model('Roadmap', roadmapSchema);
