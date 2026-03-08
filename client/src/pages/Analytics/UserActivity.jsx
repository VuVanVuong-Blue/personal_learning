import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import { Loader2, Activity, Clock, Star } from 'lucide-react';
import ContributionHeatmap from '../../components/Analytics/ContributionHeatmap';
import { toast } from 'sonner';

const UserActivity = () => {
    const { user } = useAuth();
    const [productivity, setProductivity] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        const fetchAnalytics = async () => {
            try {
                setLoading(true);
                const res = await axiosClient.get('/analytics/productivity');
                setProductivity(res.data);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu năng suất:", error);
                toast.error("Không thể tải báo cáo năng suất.");
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [user]);

    if (!user) {
        return <div className="text-center py-20">Vui lòng đăng nhập để xem thông tin hoạt động.</div>;
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 whitespace-nowrap overflow-hidden text-ellipsis">Hoạt động của bạn</h1>
            <p className="text-gray-500 mb-8 whitespace-nowrap overflow-hidden text-ellipsis">Theo dõi quá trình học tập và năng suất cá nhân</p>

            <div className="space-y-8">
                {/* Contribution Heatmap */}
                <div className="w-full">
                    <ContributionHeatmap userId={user._id} />
                </div>

                {/* Productivity Dashboard */}
                {loading ? (
                    <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-indigo-600" /></div>
                ) : productivity && (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
                            <Activity className="w-6 h-6 text-indigo-600" /> Báo cáo Năng Suất (Tuần này)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mb-3">
                                    <Clock className="w-6 h-6 text-indigo-600" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Giờ Tập Trung</h3>
                                <p className="text-3xl font-bold text-indigo-700 mt-2">{productivity.focusHoursThisWeek} <span className="text-base font-normal text-indigo-500">giờ</span></p>
                            </div>
                            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-3">
                                    <Star className="w-6 h-6 text-amber-600" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Khung Giờ Vàng</h3>
                                <p className="text-2xl font-bold text-amber-700 mt-2">{productivity.goldHourFormatted}</p>
                                <p className="text-sm text-amber-600 mt-1 font-medium">Năng suất cao nhất</p>
                            </div>
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex flex-col justify-center items-center text-center">
                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                                    <Activity className="w-6 h-6 text-emerald-600" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">Phiên Học (Pomodoro)</h3>
                                <p className="text-3xl font-bold text-emerald-700 mt-2">{productivity.totalSessionsRecent} <span className="text-base font-normal text-emerald-500">phiên</span></p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserActivity;
