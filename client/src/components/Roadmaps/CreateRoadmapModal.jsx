import { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { X, Calendar, Type, Folder, FileText } from 'lucide-react';
import { toast } from 'sonner';

const CreateRoadmapModal = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        deadline: ''
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            return toast.error("Vui lòng nhập tên lộ trình");
        }

        try {
            setLoading(true);
            const res = await axiosClient.post('/roadmaps', formData);
            toast.success("Tạo lộ trình thành công!");
            onSuccess(res.data);
            onClose();
            // Reset form
            setFormData({ title: '', description: '', category: '', deadline: '' });
        } catch (error) {
            console.error("Lỗi khi tạo lộ trình:", error);
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tạo lộ trình");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Tạo Lộ Trình Mới</h2>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên lộ trình <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Type className="h-4 w-4 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                className="pl-10 w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all font-medium text-gray-900"
                                placeholder="VD: Trở thành Frontend Developer 2026"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả ngắn</label>
                        <div className="relative">
                            <div className="absolute top-3 left-3 pointer-events-none">
                                <FileText className="h-4 w-4 text-gray-400" />
                            </div>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="pl-10 w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm resize-none"
                                placeholder="Lộ trình này giúp bạn đạt được gì?"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thể loại</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Folder className="h-4 w-4 text-gray-400" />
                                </div>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    className="pl-10 w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm bg-white"
                                >
                                    <option value="">Chọn thể loại</option>
                                    <option value="IT & Phần mềm">IT & Phần mềm</option>
                                    <option value="Kinh doanh">Kinh doanh</option>
                                    <option value="Ngoại ngữ">Ngoại ngữ</option>
                                    <option value="Thiết kế">Thiết kế</option>
                                    <option value="Khác">Khác</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Hạn chót</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                </div>
                                <input
                                    type="date"
                                    name="deadline"
                                    value={formData.deadline}
                                    onChange={handleChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className="pl-10 w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-colors flex items-center justify-center disabled:opacity-70"
                        >
                            {loading ? "Đang tạo..." : "Khởi tạo lộ trình"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateRoadmapModal;
