import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { toast } from 'sonner';
import { Flag, Trash2, CheckCircle, ShieldAlert, XCircle, ExternalLink } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
dayjs.extend(relativeTime);
dayjs.locale('vi');
import { Link } from 'react-router-dom';

const ReportManagement = () => {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await axiosClient.get('/reports');
            setReports(res.data);
        } catch (error) {
            toast.error("Lỗi khi lấy danh sách tố cáo");
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async (id, action) => {
        const confirmMsg = action === 'delete_target'
            ? "Bạn chắc chắn muốn XÓA nội dung bị tố cáo này chứ?"
            : "Bạn muốn TỪ CHỐI (bỏ qua) tố cáo này?";

        if (!window.confirm(confirmMsg)) return;

        let adminActionNote = '';
        if (action === 'delete_target') {
            adminActionNote = prompt("Ghi chú quyết định (Ví dụ: Nội dung vi phạm quy tắc cộng đồng):", "Nội dung vi phạm quy định cộng đồng.");
            if (adminActionNote === null) return;
        }

        try {
            await axiosClient.put(`/reports/${id}/resolve`, {
                action,
                adminActionNote
            });
            toast.success("Đã xử lý tố cáo");
            fetchReports();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi xử lý");
        }
    };

    if (loading) return <div className="text-center py-20">Đang tải dữ liệu...</div>;

    const pendingReports = reports.filter(r => r.status === 'pending');
    const resolvedReports = reports.filter(r => r.status !== 'pending');

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 text-red-500" />
                Quản lý Tố Cáo ({pendingReports.length} chờ xử lý)
            </h1>

            {pendingReports.length === 0 ? (
                <div className="bg-green-50 text-green-700 p-6 rounded-xl border border-green-200 text-center">
                    <CheckCircle className="w-10 h-10 mx-auto mb-2 text-green-500" />
                    Không có tố cáo nào cần xử lý. Cộng đồng đang rất an toàn!
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-red-50 px-6 py-3 border-b border-red-100">
                        <h2 className="font-semibold text-red-700">Tố cáo cần xử lý ngay</h2>
                    </div>
                    <ul className="divide-y divide-gray-100">
                        {pendingReports.map(report => (
                            <li key={report._id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <span className="px-2.5 py-1 text-xs font-bold bg-red-100 text-red-700 rounded text-uppercase">
                                                {report.targetType === 'Review' ? 'Bình luận' : 'Lộ trình'}
                                            </span>
                                            <span className="text-sm font-semibold text-gray-900 border-l-2 pl-2 border-gray-300">
                                                Vi phạm: {report.reason}
                                            </span>
                                        </div>

                                        <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 text-sm">
                                            <p className="text-gray-500 mb-1 text-xs font-medium uppercase">Nội dung bị tố cáo:</p>
                                            {report.targetType === 'Review' ? (
                                                <p className="text-gray-800 italic">"{report.target?.comment || '(Nội dung không còn tồn tại)'}"</p>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold">{report.target?.title || '(Lộ trình đã bị xóa)'}</span>
                                                    {report.target && (
                                                        <Link to={`/roadmaps/${report.target._id}`} target="_blank" className="text-indigo-600 hover:text-indigo-800" title="Xem nội dung">
                                                            <ExternalLink className="w-4 h-4" />
                                                        </Link>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <p className="text-sm text-gray-700"><strong>Chi tiết từ người tố cáo:</strong> {report.description}</p>

                                        <div className="text-xs text-gray-500 flex flex-wrap gap-4">
                                            <span><strong>Người báo cáo:</strong> {report.reporter?.username}</span>
                                            <span><strong>Tác giả vi phạm:</strong> {report.reportedUser?.username}</span>
                                            <span><strong>Thời gian:</strong> {dayjs(report.createdAt).format('HH:mm DD/MM/YYYY')}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col justify-start gap-2 shrink-0">
                                        <button
                                            onClick={() => handleResolve(report._id, 'delete_target')}
                                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center justify-center gap-2 text-sm font-medium shadow-sm transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" /> Xóa nội dung
                                        </button>
                                        <button
                                            onClick={() => handleResolve(report._id, 'reject_report')}
                                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                                        >
                                            <XCircle className="w-4 h-4" /> Bỏ qua
                                        </button>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Resolved Reports History (Optional) */}
            {resolvedReports.length > 0 && (
                <div className="mt-8">
                    <h3 className="font-medium text-gray-700 mb-4">Lịch sử xử lý</h3>
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <ul className="divide-y divide-gray-100">
                            {resolvedReports.map(report => (
                                <li key={report._id} className="p-4 opacity-70 flex justify-between items-center text-sm hover:opacity-100 transition-opacity">
                                    <div>
                                        <span className="font-medium">{report.targetType}</span> - {report.reason}
                                        {report.status === 'resolved' ? (
                                            <span className="ml-2 text-red-600 font-medium">(Đã Xóa)</span>
                                        ) : (
                                            <span className="ml-2 text-gray-500">(Đã bỏ qua)</span>
                                        )}
                                    </div>
                                    <span className="text-xs text-gray-400">{dayjs(report.updatedAt).fromNow()}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportManagement;
