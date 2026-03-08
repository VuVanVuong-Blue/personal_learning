import mongoose from 'mongoose';

const studySessionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roadmap: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap' },
    taskId: { type: mongoose.Schema.Types.ObjectId }, // optional
    startTime: { type: Date, required: true },
    endTime: { type: Date },
    duration: { type: Number, default: 0 }, // in seconds
    isCompleted: { type: Boolean, default: false } // true when session explicitly stopped
}, { timestamps: true });

export default mongoose.model('StudySession', studySessionSchema);
