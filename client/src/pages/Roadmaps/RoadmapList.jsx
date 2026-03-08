import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import { Plus, Search, BookOpen, Clock, Users, Copy, Trash2, Library, ShieldAlert, RefreshCw, Star, Flag, CalendarCheck, ArrowRight, CheckCircle2, Smile, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import CreateRoadmapModal from '../../components/Roadmaps/CreateRoadmapModal';
import CreateRoadmapAIModal from '../../components/Roadmaps/CreateRoadmapAIModal';

const RoadmapList = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('my_roadmaps'); // my_roadmaps, community, trash
    const [roadmaps, setRoadmaps] = useState([]);
    const [loading, setLoading] = useState(true);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreateAIModalOpen, setIsCreateAIModalOpen] = useState(false);

    useEffect(() => {
        fetchRoadmaps();
    }, [activeTab]);

    const fetchRoadmaps = async () => {
        try {
            setLoading(true);

            const res = await axiosClient.get('/roadmaps');

            let filtered = [];
            if (activeTab === 'my_roadmaps') {
                filtered = res.data.filter(r => r.author._id === user._id && !r.isDeleted);
            } else if (activeTab === 'community') {
                filtered = res.data.filter(r => r.isPublic === true && !r.isDeleted);
            } else if (activeTab === 'trash') {
                filtered = res.data.filter(r => r.author._id === user._id && r.isDeleted);
            }

            setRoadmaps(filtered);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
            toast.error("Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const handleClone = async (id) => {
        try {
            await axiosClient.post(`/roadmaps/${id}/clone`);
            toast.success("Đã phân bản lộ trình thành công!");
            setActiveTab('my_roadmaps'); // Redirect to my roadmaps
            fetchRoadmaps();
        } catch (error) {
            toast.error("Lỗi khi sao chép lộ trình");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Bỏ lộ trình này vào thùng rác?")) return;
        try {
            await axiosClient.delete(`/roadmaps/${id}`);
            toast.success("Đã xóa lộ trình mềm");
            fetchRoadmaps();
        } catch (error) {
            toast.error("Xóa thất bại");
        }
    };

    const handleRestore = async (id) => {
        try {
            await axiosClient.post(`/roadmaps/${id}/restore`);
            toast.success("Đã khôi phục lộ trình!");
            fetchRoadmaps();
        } catch (error) {
            toast.error("Khôi phục thất bại");
        }
    };

    const handleHardDelete = async (id) => {
        if (!window.confirm("CẢNH BÁO: Xóa vĩnh viễn lộ trình này? Bạn không thể khôi phục lại được!")) return;
        try {
            await axiosClient.delete(`/roadmaps/${id}/hard`);
            toast.success("Đã xóa vĩnh viễn");
            fetchRoadmaps();
        } catch (error) {
            toast.error("Lỗi khi xóa vĩnh viễn");
        }
    };

    const handleCreateSuccess = (newRoadmap) => {
        // Option 1: fetch again or Option 2: push to list
        fetchRoadmaps();
    };

    const handleReportRoadmap = async (id) => {
        const reason = prompt("Lý do báo cáo lộ trình này (Spam/Quảng cáo, Ngôn từ thù ghét, Khác...):");
        if (!reason) return;

        try {
            await axiosClient.post('/reports', {
                targetType: 'Roadmap',
                targetId: id,
                reason: ['Spam/Quảng cáo', 'Ngôn từ thù ghét', 'Nội dung phản cảm', 'Chất lượng kém', 'Khác'].includes(reason) ? reason : 'Khác',
                description: reason
            });
            toast.success("Đã gửi báo cáo đến Admin. Cảm ơn bạn!");
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi báo cáo");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-6 py-8">
            {/* Modal */}
            <CreateRoadmapModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />
            <CreateRoadmapAIModal
                isOpen={isCreateAIModalOpen}
                onClose={() => setIsCreateAIModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Không Gian Học Tập</h1>
                    <p className="text-gray-500 mt-2">Quản lý và khám phá các lộ trình kiến thức</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCreateAIModalOpen(true)}
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-md hover:shadow-lg hover:shadow-indigo-500/30 transition-all transform hover:-translate-y-0.5"
                    >
                        <Sparkles className="w-5 h-5" />
                        Tạo bằng AI
                    </button>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 shadow-sm transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Tạo thủ công
                    </button>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 mb-8 overflow-x-auto">

                <button
                    onClick={() => setActiveTab('my_roadmaps')}
                    className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'my_roadmaps' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Library className="w-4 h-4" /> Lộ trình của tôi
                </button>
                <button
                    onClick={() => setActiveTab('community')}
                    className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'community' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Users className="w-4 h-4" /> Cộng đồng
                </button>
                <button
                    onClick={() => setActiveTab('trash')}
                    className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 whitespace-nowrap transition-colors ${activeTab === 'trash' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Trash2 className="w-4 h-4" /> Thùng rác
                </button>
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="text-center py-20 text-gray-500">Đang tải dữ liệu...</div>
            ) : roadmaps.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 rounded-2xl border border-gray-100 border-dashed">
                    <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Không có lộ trình nào</h3>
                    <p className="text-gray-500 mt-1">Hãy tạo một lộ trình mới hoặc khám phá từ cộng đồng.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {roadmaps.map(roadmap => (
                        <div key={roadmap._id} className={`bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col shadow-sm ${!roadmap.coverImage ? `border-t-4 border-t-${roadmap.themeColor || 'indigo'}-500` : ''}`}>
                            {roadmap.coverImage && (
                                <div className="h-36 w-full shrink-0 relative overflow-hidden bg-gray-100">
                                    <img src={roadmap.coverImage} alt={roadmap.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => { e.target.style.display = 'none'; }} />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                </div>
                            )}
                            <div className="p-6 flex-1">
                                <div className="flex justify-between items-start mb-4">
                                    <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-semibold rounded-full">
                                        {roadmap.category || 'Tổng hợp'}
                                    </span>
                                    {roadmap.isPublic && activeTab === 'my_roadmaps' && (
                                        <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">Công khai</span>
                                    )}
                                </div>
                                <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2">
                                    {roadmap.title}
                                </h3>
                                <p className="text-gray-500 text-sm line-clamp-3 mb-6">
                                    {roadmap.description || 'Không có mô tả chi tiết.'}
                                </p>

                                <div className="flex items-center gap-4 text-xs font-medium text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-4 h-4" />
                                        {roadmap.milestones?.length || 0} chặng
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        {roadmap.averageRating > 0 ? roadmap.averageRating : 'Chưa có'} ({roadmap.totalReviews || 0})
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Users className="w-4 h-4" />
                                        {roadmap.clonesCount || 0} bản sao
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <img
                                        src={roadmap.author.avatar || `https://ui-avatars.com/api/?name=${roadmap.author.username}`}
                                        alt=""
                                        className="w-6 h-6 rounded-full"
                                    />
                                    <span className="text-xs font-medium text-gray-600">{roadmap.author.username}</span>
                                </div>

                                <div className="flex gap-2">
                                    {activeTab === 'community' ? (
                                        <>
                                            <Link
                                                to={`/roadmaps/${roadmap._id}`}
                                                className="px-3 py-1.5 flex items-center gap-1.5 text-blue-600 hover:bg-blue-50 hover:border-blue-200 border border-transparent rounded-lg transition-colors text-sm font-medium"
                                                title="Xem chi tiết & Đánh giá"
                                            >
                                                <BookOpen className="w-4 h-4" /> Xem
                                            </Link>
                                            <button
                                                onClick={() => handleReportRoadmap(roadmap._id)}
                                                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                                                title="Báo cáo vi phạm"
                                            >
                                                <Flag className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleClone(roadmap._id)}
                                                className="p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors border border-indigo-200"
                                                title="Clone về bộ sưu tập"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : activeTab === 'my_roadmaps' ? (
                                        <>
                                            <Link
                                                to={`/roadmaps/${roadmap._id}`}
                                                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                                            >
                                                Mở không gian
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(roadmap._id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Xóa mềm"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleRestore(roadmap._id)}
                                                className="px-4 py-2 flex items-center gap-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                                title="Khôi phục"
                                            >
                                                <RefreshCw className="w-4 h-4" /> Khôi phục
                                            </button>
                                            <button
                                                onClick={() => handleHardDelete(roadmap._id)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                                                title="Xóa vĩnh viễn"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RoadmapList;
