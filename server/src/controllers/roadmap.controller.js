import Roadmap from '../models/Roadmap.js';
import StudySession from '../models/StudySession.js';

// Get all roadmaps (public + user's own)
export const getRoadmaps = async (req, res) => {
    try {
        const roadmaps = await Roadmap.find({
            $or: [
                { author: req.user.id }, // Retrieve all of user's roadmaps (including deleted)
                { isPublic: true, isDeleted: false } // Only retrieve public roadmaps that aren't deleted
            ]
        }).populate('author', 'username avatar').sort({ createdAt: -1 });

        res.json(roadmaps);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new roadmap
export const createRoadmap = async (req, res) => {
    try {
        const newRoadmap = new Roadmap({
            ...req.body,
            author: req.user.id
        });

        const savedRoadmap = await newRoadmap.save();
        res.status(201).json(savedRoadmap);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Get a single roadmap
export const getRoadmapById = async (req, res) => {
    try {
        const roadmap = await Roadmap.findById(req.params.id)
            .populate('author', 'username avatar');

        if (!roadmap) return res.status(404).json({ message: 'Không tìm thấy lộ trình' });

        // If it's deleted, only the author can see it
        if (roadmap.isDeleted && roadmap.author._id.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Không tìm thấy lộ trình' });
        }

        // If it's private, only the author can see it
        if (!roadmap.isPublic && roadmap.author._id.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Bạn không có quyền xem lộ trình này' });
        }

        res.json(roadmap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update a roadmap (including drag and drop reordering)
export const updateRoadmap = async (req, res) => {
    try {
        const roadmap = await Roadmap.findOne({ _id: req.params.id, author: req.user.id, isDeleted: false });
        if (!roadmap) return res.status(404).json({ message: 'Không tìm thấy lộ trình hoặc không có quyền sửa' });

        const updatedRoadmap = await Roadmap.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        res.json(updatedRoadmap);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Soft delete a roadmap
export const deleteRoadmap = async (req, res) => {
    try {
        const roadmap = await Roadmap.findOne({ _id: req.params.id, author: req.user.id });
        if (!roadmap) return res.status(404).json({ message: 'Không tìm thấy lộ trình hoặc không có quyền xóa' });

        roadmap.isDeleted = true;
        roadmap.deletedAt = Date.now();
        await roadmap.save();

        res.json({ message: 'Đã đưa lộ trình vào thùng rác' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Clone a public roadmap
export const cloneRoadmap = async (req, res) => {
    try {
        const originalRoadmap = await Roadmap.findOne({ _id: req.params.id, isPublic: true, isDeleted: false });
        if (!originalRoadmap) return res.status(404).json({ message: 'Không tìm thấy lộ trình public' });

        if (originalRoadmap.author.toString() === req.user.id) {
            return res.status(400).json({ message: 'Bạn không thể clone lộ trình của chính mình' });
        }

        // Update clones count on original
        originalRoadmap.clonesCount += 1;
        await originalRoadmap.save();

        // Deep copy the object and remove specific user data
        const roadmapData = originalRoadmap.toObject();
        delete roadmapData._id;
        delete roadmapData.createdAt;
        delete roadmapData.updatedAt;

        roadmapData.author = req.user.id;
        roadmapData.isPublic = false; // Cloned roadmaps start as private
        roadmapData.clonesCount = 0;
        roadmapData.originalRoadmap = originalRoadmap._id;
        roadmapData.title = roadmapData.title + ' (Bản sao)';

        // Reset isCompleted and confidenceLevel for all tasks
        if (roadmapData.milestones) {
            roadmapData.milestones.forEach(m => {
                delete m._id;
                if (m.tasks) {
                    m.tasks.forEach(t => {
                        delete t._id;
                        t.isCompleted = false;
                        t.confidenceLevel = undefined;
                        t.nextReviewDate = undefined;
                        t.timeSpent = 0;
                        t.reflectionNote = '';
                    });
                }
            });
        }

        const newRoadmap = new Roadmap(roadmapData);
        const savedRoadmap = await newRoadmap.save();

        res.status(201).json(savedRoadmap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Restore a soft-deleted roadmap
export const restoreRoadmap = async (req, res) => {
    try {
        const roadmap = await Roadmap.findOne({ _id: req.params.id, author: req.user.id, isDeleted: true });
        if (!roadmap) return res.status(404).json({ message: 'Không tìm thấy lộ trình trong thùng rác' });

        roadmap.isDeleted = false;
        roadmap.deletedAt = undefined;
        await roadmap.save();

        res.json(roadmap);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Check if a roadmap is cloned by the current user
export const checkCloneStatus = async (req, res) => {
    try {
        const originalId = req.params.id;
        const userId = req.user.id;

        const clone = await Roadmap.findOne({
            author: userId,
            originalRoadmap: originalId,
            isDeleted: false
        });

        res.json({ hasCloned: !!clone });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Hard delete a roadmap (permanently)
export const hardDeleteRoadmap = async (req, res) => {
    try {
        const roadmap = await Roadmap.findOneAndDelete({ _id: req.params.id, author: req.user.id });
        if (!roadmap) return res.status(404).json({ message: 'Không tìm thấy lộ trình hoặc không có quyền xóa' });

        res.json({ message: 'Đã xóa vĩnh viễn lộ trình' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Permanently delete all roadmaps in trash
export const clearAllTrash = async (req, res) => {
    try {
        const result = await Roadmap.deleteMany({ author: req.user.id, isDeleted: true });
        res.json({ message: `Đã dọn sạch thùng rác (${result.deletedCount} lộ trình)` });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update task progress and calculate SRS next review date
export const updateTaskProgress = async (req, res) => {
    try {
        const { id: roadmapId, taskId } = req.params;
        const { isCompleted, confidenceLevel, timeSpent } = req.body;
        const userId = req.user.id;

        const roadmap = await Roadmap.findOne({ _id: roadmapId, author: userId });
        if (!roadmap) {
            return res.status(404).json({ message: 'Không tìm thấy lộ trình hoặc không có quyền sở hữu' });
        }

        let taskFound = null;

        // Tìm task trong các milestone
        for (const milestone of roadmap.milestones) {
            const task = milestone.tasks.id(taskId);
            if (task) {
                taskFound = task;

                // Update basic info
                const wasCompleted = task.isCompleted;
                if (isCompleted !== undefined) task.isCompleted = isCompleted;
                if (timeSpent !== undefined) task.timeSpent += timeSpent; // Accumulate time

                // If task just became completed, record an activity session for analytics
                if (isCompleted === true && !wasCompleted) {
                    const activitySession = new StudySession({
                        user: userId,
                        roadmap: roadmapId,
                        taskId: taskId,
                        startTime: new Date(new Date().getTime() - (timeSpent || 600) * 1000), // Default to 10 mins ago if only timeSpent is given
                        endTime: new Date(),
                        duration: timeSpent || 600, // Default 10 mins
                        isCompleted: true
                    });
                    await activitySession.save();
                }

                // Update SRS logic
                if (confidenceLevel !== undefined) {
                    task.confidenceLevel = confidenceLevel;

                    const now = new Date();
                    let nextDate = new Date();

                    if (confidenceLevel === 'low') {
                        nextDate.setDate(now.getDate() + 1); // Tomorrow
                    } else if (confidenceLevel === 'medium') {
                        nextDate.setDate(now.getDate() + 3); // 3 days
                    } else if (confidenceLevel === 'high') {
                        nextDate.setDate(now.getDate() + 7); // 7 days (can expand to 1 month later dynamically)
                    }

                    task.nextReviewDate = nextDate;
                }

                break;
            }
        }

        if (!taskFound) {
            return res.status(404).json({ message: 'Không tìm thấy bài học (Task)' });
        }

        await roadmap.save();
        res.json({ message: 'Đã cập nhật tiến độ', task: taskFound });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get tasks that are due for daily review (SRS)
export const getDailyReviewTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();

        // Tìm tất cả roadmaps của user này
        const roadmaps = await Roadmap.find({ author: userId, isDeleted: false });

        const reviewTasks = [];

        roadmaps.forEach(roadmap => {
            if (roadmap.milestones) {
                roadmap.milestones.forEach(milestone => {
                    if (milestone.tasks) {
                        milestone.tasks.forEach(task => {
                            // Nếu task đã có nextReviewDate và đã đến hạn (nhỏ hơn hoặc bằng hiện tại)
                            if (task.nextReviewDate && task.nextReviewDate <= now) {
                                reviewTasks.push({
                                    roadmapId: roadmap._id,
                                    roadmapTitle: roadmap.title,
                                    milestoneId: milestone._id,
                                    milestoneTitle: milestone.title,
                                    task: task
                                });
                            }
                        });
                    }
                });
            }
        });

        // Optional: Sort by nextReviewDate ascending (most overdue first)
        reviewTasks.sort((a, b) => new Date(a.task.nextReviewDate) - new Date(b.task.nextReviewDate));

        res.json(reviewTasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
