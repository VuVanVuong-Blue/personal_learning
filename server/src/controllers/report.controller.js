import Report from '../models/Report.js';
import Review from '../models/Review.js';
import Roadmap from '../models/Roadmap.js';

// Send a report
export const createReport = async (req, res) => {
    try {
        const { targetType, targetId, reason, description } = req.body;
        const reporterId = req.user.id;

        // Ensure user hasn't already reported this specific item
        const existingReport = await Report.findOne({ reporter: reporterId, targetId });
        if (existingReport) {
            return res.status(400).json({ message: 'Bạn đã báo cáo nội dung này rồi' });
        }

        let reportedUser = null;

        if (targetType === 'Review') {
            const review = await Review.findById(targetId);
            if (!review) return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
            reportedUser = review.user;
        } else if (targetType === 'Roadmap') {
            const roadmap = await Roadmap.findById(targetId);
            if (!roadmap) return res.status(404).json({ message: 'Không tìm thấy lộ trình' });
            reportedUser = roadmap.author;
        } else {
            return res.status(400).json({ message: 'Loại báo cáo không hợp lệ' });
        }

        const report = new Report({
            reporter: reporterId,
            reportedUser,
            targetType,
            targetId,
            reason,
            description
        });

        await report.save();
        res.status(201).json({ message: 'Đã gửi báo cáo thành công. Cảm ơn bạn!' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get all reports
export const getAllReports = async (req, res) => {
    try {
        const reports = await Report.find()
            .populate('reporter', 'username avatar email')
            .populate('reportedUser', 'username avatar email')
            .sort({ createdAt: -1 });

        // Populate specific targets dynamically since targetId could be Roadmap or Review
        // A more advanced approach would use virtuals, but for simplicity we map them here
        const populatedReports = await Promise.all(reports.map(async (report) => {
            const r = report.toObject();
            if (r.targetType === 'Review') {
                r.target = await Review.findById(r.targetId);
            } else if (r.targetType === 'Roadmap') {
                r.target = await Roadmap.findById(r.targetId).select('title isPublic');
            }
            return r;
        }));

        res.json(populatedReports);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Resolve a report
export const resolveReport = async (req, res) => {
    try {
        const { action, adminActionNote } = req.body; // action: 'delete_target', 'reject_report'
        const report = await Report.findById(req.params.id);

        if (!report) return res.status(404).json({ message: 'Không tìm thấy báo cáo' });

        if (action === 'delete_target') {
            if (report.targetType === 'Review') {
                await Review.findByIdAndDelete(report.targetId);
                // Also need to recalculate avg rating theoretically, but for simplicity keep it light
            } else if (report.targetType === 'Roadmap') {
                await Roadmap.findByIdAndUpdate(report.targetId, { isDeleted: true });
            }
            report.status = 'resolved';
        } else if (action === 'reject_report') {
            report.status = 'rejected';
        }

        report.adminAction = adminActionNote || '';
        await report.save();

        // Also update all other pending reports for the same targetId
        if (action === 'delete_target') {
            await Report.updateMany(
                { targetId: report.targetId, status: 'pending' },
                { status: 'resolved', adminAction: 'Đã xóa bởi Admin' }
            );
        }

        res.json({ message: 'Đã xử lý báo cáo', report });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
