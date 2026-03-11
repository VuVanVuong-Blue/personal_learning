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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {roadmaps.map(roadmap => (
                        <div key={roadmap._id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200 group flex flex-col">
                            <div className="relative w-full aspect-video bg-gray-100 overflow-hidden">
                                {roadmap.coverImage ? (
                                    <img src={roadmap.coverImage} alt={roadmap.title} className="w-full h-full object-cover group-hover:opacity-90 transition-opacity" onError={(e) => { e.target.style.display = 'none'; }} />
                                ) : (
                                    <div className={`w-full h-full flex justify-center items-center bg-${roadmap.themeColor || 'indigo'}-50`}>
                                        <BookOpen className={`w-12 h-12 text-${roadmap.themeColor || 'indigo'}-300`} />
                                    </div>
                                )}
                            </div>

                            <div className="p-4 flex flex-col flex-1">
                                <h3 className="font-bold text-base text-gray-900 leading-tight mb-1 line-clamp-2">
                                    {roadmap.title}
                                </h3>

                                <div className="text-xs text-gray-500 mb-2 truncate">
                                    {roadmap.author.username} {roadmap.description ? `• ${roadmap.description}` : ''}
                                </div>

                                <div className="flex items-center gap-2 mb-3">
                                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#5624d0] text-white text-[10px] font-bold rounded-sm uppercase tracking-wide">
                                        <CheckCircle2 className="w-3 h-3" />
                                        {roadmap.category || 'Tổng hợp'}
                                    </span>
                                    <div className="flex items-center text-xs">
                                        <span className="font-bold text-[#b4690e] mr-1">
                                            {roadmap.averageRating > 0 ? roadmap.averageRating : '4.5'}
                                        </span>
                                        <Star className="w-3 h-3 text-[#e59819] fill-[#e59819]" />
                                        <span className="text-[#6a6f73] ml-1">
                                            ({roadmap.totalReviews > 0 ? roadmap.totalReviews : 600} đánh giá)
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 text-xs font-medium text-[#6a6f73] mb-4">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {roadmap.milestones?.length || 0} chặng
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Users className="w-3.5 h-3.5" />
                                        {roadmap.clonesCount || 0} bản sao
                                    </div>
                                    {roadmap.isPublic && activeTab === 'my_roadmaps' && (
                                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-sm ml-auto">
                                            Công khai
                                        </span>
                                    )}
                                </div>

                                <div className="mt-auto flex gap-2">
                                    {activeTab === 'community' ? (
                                        <>
                                            <Link
                                                to={`/roadmaps/${roadmap._id}`}
                                                className="flex-1 py-1.5 text-center text-sm font-bold text-gray-900 border border-gray-900 hover:bg-gray-100 rounded-sm transition-colors"
                                            >
                                                Xem chi tiết
                                            </Link>
                                            <button
                                                onClick={() => handleClone(roadmap._id)}
                                                className="px-3 py-1.5 text-gray-900 border border-gray-900 hover:bg-gray-100 rounded-sm transition-colors flex items-center justify-center"
                                                title="Clone về bộ sưu tập"
                                            >
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : activeTab === 'my_roadmaps' ? (
                                        <>
                                            <Link
                                                to={`/roadmaps/${roadmap._id}`}
                                                className="flex-1 py-1.5 text-center text-sm font-bold text-white bg-[#5624d0] hover:bg-[#401b9c] rounded-sm transition-colors"
                                            >
                                                Mở không gian
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(roadmap._id)}
                                                className="px-3 py-1.5 text-[#6a6f73] hover:text-red-600 hover:bg-red-50 rounded-sm transition-colors border border-gray-300"
                                                title="Xóa"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleRestore(roadmap._id)}
                                                className="flex-1 py-1.5 text-center text-sm font-bold text-[#1c1d1f] hover:bg-gray-100 border border-[#1c1d1f] rounded-sm transition-colors"
                                            >
                                                Khôi phục
                                            </button>
                                            <button
                                                onClick={() => handleHardDelete(roadmap._id)}
                                                className="px-3 py-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-sm transition-colors flex items-center justify-center"
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
