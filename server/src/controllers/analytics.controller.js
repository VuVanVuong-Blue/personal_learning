import StudySession from '../models/StudySession.js';
import Roadmap from '../models/Roadmap.js';

// Start a new study session (Pomodoro timer start)
export const startStudySession = async (req, res) => {
    try {
        const { roadmapId, taskId } = req.body;
        const userId = req.user.id;

        const session = new StudySession({
            user: userId,
            roadmap: roadmapId,
            taskId: taskId,
            startTime: new Date()
        });

        await session.save();
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Stop a study session and calculate duration
export const stopStudySession = async (req, res) => {
    try {
        const sessionId = req.params.id;
        const userId = req.user.id;

        const session = await StudySession.findOne({ _id: sessionId, user: userId });
        if (!session) {
            return res.status(404).json({ message: 'Không tìm thấy phiên học' });
        }

        if (session.isCompleted) {
            return res.status(400).json({ message: 'Phiên học này đã kết thúc' });
        }

        session.endTime = new Date();
        // Calculate duration in seconds
        session.duration = Math.floor((session.endTime.getTime() - session.startTime.getTime()) / 1000);
        session.isCompleted = true;

        await session.save();
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Productivity Stats (Focus hours, Gold hour, Burndown data)
export const getProductivityStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const { roadmapId } = req.query; // optional for burndown

        // Calculate Focus Hours for the current week (let's say last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentSessions = await StudySession.find({
            user: userId,
            isCompleted: true,
            startTime: { $gte: sevenDaysAgo }
        });

        let totalDurationSeconds = 0;
        const startHoursCount = {};

        recentSessions.forEach(s => {
            totalDurationSeconds += s.duration;
            // Get the hour (0-23) the session started
            const hour = s.startTime.getHours();
            startHoursCount[hour] = (startHoursCount[hour] || 0) + 1;
        });

        const focusHoursThisWeek = +(totalDurationSeconds / 3600).toFixed(1);

        // Find Gold Hour (Most frequent starting hour)
        let goldHour = null;
        let maxCount = 0;
        for (const [hourStr, count] of Object.entries(startHoursCount)) {
            if (count > maxCount) {
                maxCount = count;
                goldHour = parseInt(hourStr);
            }
        }

        // Format Gold hour clearly: "20h - 21h"
        const goldHourFormatted = goldHour !== null ? `${goldHour}h - ${goldHour + 1}h` : 'Chưa đủ dữ liệu';

        const totalFocusMinutes = Math.floor(totalDurationSeconds / 60);

        let burndownData = null;

        // If a specific roadmap is requested, return burndown data
        if (roadmapId) {
            const roadmap = await Roadmap.findOne({ _id: roadmapId, author: userId });
            if (roadmap) {
                let totalTasks = 0;
                let completedTasks = 0;

                roadmap.milestones.forEach(m => {
                    if (m.tasks) {
                        totalTasks += m.tasks.length;
                        completedTasks += m.tasks.filter(t => t.isCompleted).length;
                    }
                });

                burndownData = {
                    totalTasks,
                    completedTasks,
                    startDate: roadmap.createdAt,
                    deadline: roadmap.deadline || new Date(roadmap.createdAt.getTime() + 30 * 24 * 60 * 60 * 1000) // Default deadline 30 days
                };
            }
        }

        res.json({
            focusHoursThisWeek: +(totalDurationSeconds / 3600).toFixed(1),
            totalFocusSeconds: totalDurationSeconds,
            totalFocusMinutes,
            goldHourFormatted,
            burndownData,
            totalSessionsRecent: recentSessions.length
        });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Contribution Heatmap Data for a User (Yearly)
export const getContributionHeatmap = async (req, res) => {
    try {
        const userId = req.params.userId;
        let year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();

        // Ensure year is valid
        if (isNaN(year) || year < 2000 || year > 2100) {
            year = new Date().getFullYear();
        }

        const startDate = new Date(year, 0, 1); // Jan 1st of year
        const endDate = new Date(year, 11, 31, 23, 59, 59, 999); // Dec 31st of year

        // 1. Get study sessions within the year
        const sessions = await StudySession.find({
            user: userId,
            isCompleted: true,
            startTime: { $gte: startDate, $lte: endDate }
        });

        // Use a map to aggregate counts per day (YYYY-MM-DD string as key)
        const dailyCounts = new Map();

        const addContribution = (dateObj, count = 1) => {
            if (!dateObj || isNaN(dateObj.getTime())) return;

            // Format to YYYY-MM-DD
            const yearStr = dateObj.getFullYear();
            const monthStr = String(dateObj.getMonth() + 1).padStart(2, '0');
            const dayStr = String(dateObj.getDate()).padStart(2, '0');
            const dateStr = `${yearStr}-${monthStr}-${dayStr}`;

            dailyCounts.set(dateStr, (dailyCounts.get(dateStr) || 0) + count);
        };

        // Add sessions
        sessions.forEach(session => {
            addContribution(session.startTime, 1);
        });

        // Format to array for frontend
        const heatmapData = Array.from(dailyCounts.entries()).map(([date, count]) => ({
            date,
            count
        }));

        res.json(heatmapData);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
