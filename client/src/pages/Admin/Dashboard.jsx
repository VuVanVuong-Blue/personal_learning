import { Users, BookOpen, Activity, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { toast } from 'sonner';

const Dashboard = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalRoadmaps: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Fetch actual total users from backend
                const usersRes = await axiosClient.get('/users');
                const totalUsers = usersRes.data.length;

                // Tricking active stats for now
                setStats({
                    totalUsers,
                    activeUsers: Math.floor(totalUsers * 0.7),
                    totalRoadmaps: 15 // Mock data
                });
            } catch (error) {
                console.error("Error fetching admin stats:", error);
                toast.error("Không thể tải dữ liệu thống kê");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const statCards = [
        {
            title: 'Tổng Người Dùng',
            value: stats.totalUsers,
            icon: Users,
            color: 'bg-blue-500',
        },
        {
            title: 'Đang Hoạt Động',
            value: stats.activeUsers,
            icon: Activity,
            color: 'bg-green-500',
        },
        {
            title: 'Lộ Trình Học',
            value: stats.totalRoadmaps,
            icon: BookOpen,
            color: 'bg-purple-500',
        },
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-800">Thống Kê Tổng Quan</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center space-x-4">
                            <div className={`p-4 rounded-lg text-white ${stat.color}`}>
                                <Icon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mt-8">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Hoạt động gần đây</h2>
                <div className="text-gray-500 text-sm italic">Tính năng này đang được phát triển...</div>
            </div>
        </div>
    );
};

export default Dashboard;
