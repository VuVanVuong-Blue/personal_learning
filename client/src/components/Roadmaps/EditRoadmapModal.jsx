import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { toast } from 'sonner';
import { X, Image as ImageIcon, Sparkles, Palette } from 'lucide-react';

const COLORS = [
    { name: 'Chàm (Indigo)', value: 'indigo', hex: '#4f46e5', bg: 'bg-indigo-600' },
    { name: 'Hồng (Pink)', value: 'pink', hex: '#db2777', bg: 'bg-pink-600' },
    { name: 'Tím (Purple)', value: 'purple', hex: '#9333ea', bg: 'bg-purple-600' },
    { name: 'Xanh dương (Blue)', value: 'blue', hex: '#2563eb', bg: 'bg-blue-600' },
    { name: 'Lục bảo (Emerald)', value: 'emerald', hex: '#059669', bg: 'bg-emerald-600' },
    { name: 'Cam (Orange)', value: 'orange', hex: '#ea580c', bg: 'bg-orange-600' },
];

const EditRoadmapModal = ({ isOpen, onClose, roadmap, onUpdate }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        coverImage: '',
        themeColor: 'indigo'
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (roadmap) {
            setFormData({
                title: roadmap.title || '',
                description: roadmap.description || '',
                category: roadmap.category || '',
                coverImage: roadmap.coverImage || '',
                themeColor: roadmap.themeColor || 'indigo'
            });
        }
    }, [roadmap]);

    if (!isOpen || !roadmap) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await axiosClient.put(`/roadmaps/${roadmap._id}`, formData);
            onUpdate(res.data);
            toast.success("Cập nhật thông tin Lộ trình thành công!");
            onClose();
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi cập nhật Lộ trình");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-indigo-500" /> Cài đặt Lộ trình
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">Cá nhân hóa không gian học tập của bạn</p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    {formData.coverImage && (
                        <div className="mb-6 rounded-xl overflow-hidden h-40 bg-gray-100 border border-gray-200 relative group">
                            <img src={formData.coverImage} alt="Cover Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-sm font-medium">Bản xem trước ảnh bìa</span>
                            </div>
                        </div>
                    )}

                    <form id="edit-roadmap-form" onSubmit={handleSubmit} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 focus-within:text-indigo-600 transition-colors">Tên Lộ trình *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:bg-white transition-all outline-none font-medium"
                                    placeholder="VD: Trở thành Frontend Developer 2026"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 focus-within:text-indigo-600 transition-colors">Mô tả Lộ trình</label>
                                <textarea
                                    rows="3"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:bg-white transition-all outline-none resize-none"
                                    placeholder="Giới thiệu tóm tắt mục tiêu của lộ trình này..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5 focus-within:text-indigo-600 transition-colors">
                                    <ImageIcon className="w-4 h-4" /> Link Ảnh bìa (Cover Image URL)
                                </label>
                                <input
                                    type="url"
                                    value={formData.coverImage}
                                    onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 focus:bg-white transition-all outline-none"
                                    placeholder="https://images.unsplash.com/..."
                                />
                                <p className="text-xs text-gray-500 mt-1.5">Mẹo: Thêm ảnh bìa giúp Lộ trình nhìn xịn xò hơn (Dùng link ảnh từ Unsplash, Imgur...)</p>
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                                    <Palette className="w-4 h-4" /> Màu chủ đạo (Theme Color)
                                </label>
                                <div className="flex flex-wrap gap-3">
                                    {COLORS.map(color => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, themeColor: color.value })}
                                            className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 focus:outline-none ${formData.themeColor === color.value ? 'ring-2 ring-offset-2 scale-110' : ''}`}
                                            style={{ backgroundColor: color.hex, '--tw-ring-color': color.hex }}
                                            title={color.name}
                                        >
                                            {formData.themeColor === color.value && <div className="w-3 h-3 bg-white rounded-full"></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 rounded-xl transition-colors"
                    >
                        Đóng
                    </button>
                    <button
                        type="submit"
                        form="edit-roadmap-form"
                        disabled={isLoading || !formData.title}
                        className="px-6 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm hover:shadow transition-all disabled:bg-indigo-400 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditRoadmapModal;
