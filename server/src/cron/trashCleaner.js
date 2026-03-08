import cron from 'node-cron';
import Roadmap from '../models/Roadmap.js';

export const startTrashCleaner = () => {
    // Run every day at 00:00 (midnight)
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log('[CRON] Bắt đầu dọn dẹp các Lộ trình trong thùng rác quá 30 ngày...');

            const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

            const result = await Roadmap.deleteMany({
                isDeleted: true,
                deletedAt: { $lte: thirtyDaysAgo }
            });

            if (result.deletedCount > 0) {
                console.log(`[CRON] Đã dọn dẹp vĩnh viễn ${result.deletedCount} lộ trình.`);
            } else {
                console.log('[CRON] Không có lộ trình nào cần dọn dẹp.');
            }
        } catch (error) {
            console.error('[CRON] Lỗi khi dọn dẹp thùng rác:', error);
        }
    });
};
