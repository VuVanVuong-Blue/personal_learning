import React, { useState } from 'react';
import axiosClient from '../../api/axiosClient';
import { X, Sparkles, Loader2, CheckCircle2, Bot } from 'lucide-react';
import { toast } from 'sonner';

const STEPS = [
    { id: 1, name: 'Phân tích yêu cầu', desc: 'Master Agent đang đánh giá trình độ và mục tiêu...' },
    { id: 2, name: 'Lên dàn ý', desc: 'Architect Agent đang thiết kế cấu trúc AI...' },
    { id: 3, name: 'Thu thập tài nguyên', desc: 'Web Researcher đang cào tài liệu từ Internet...' },
    { id: 4, name: 'Biên soạn nội dung', desc: 'Teacher Agent đang viết chi tiết bài học...' },
    { id: 5, name: 'Chuẩn hóa định dạng', desc: 'Formatter Agent đang đóng gói dữ liệu JSON...' }
];

const CreateRoadmapAIModal = ({ isOpen, onClose, onSuccess }) => {
    const [topic, setTopic] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);

    if (!isOpen) return null;

    const handleCreateAI = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return toast.error("Vui lòng nhập mục tiêu học tập chi tiết.");

        setLoading(true);
        setCurrentStep(1);

        try {
            // Step 1
            const res1 = await axiosClient.post('/ai/roadmap/step1-analyze', { topic });
            const masterOutput = res1.data.data;
            setCurrentStep(2);

            // Step 2
            const res2 = await axiosClient.post('/ai/roadmap/step2-architect', { topic, masterOutput });
            const architectOutput = res2.data.data;
            setCurrentStep(3);

            // Step 3
            const res3 = await axiosClient.post('/ai/roadmap/step3-research', { topic, architectOutput });
            const researchData = res3.data.data;
            setCurrentStep(4);

            // Step 4
            const res4 = await axiosClient.post('/ai/roadmap/step4-teacher', { topic, architectOutput, masterOutput, researchData });
            const teacherOutput = res4.data.data;
            setCurrentStep(5);

            // Step 5
            const res5 = await axiosClient.post('/ai/roadmap/step5-format', {
                topic,
                description,
                teacherOutput,
                researchData
            });

            toast.success("Tạo lộ trình AI thành công!");
            onSuccess(res5.data.data);
            handleClose();
        } catch (error) {
            console.error("Lỗi AI:", error);
            const detailMsg = error.response?.data?.errorDetail;
            toast.error(detailMsg ? `Lỗi AI: ${detailMsg}` : (error.response?.data?.message || "Có lỗi xảy ra"));
            setLoading(false);
            setCurrentStep(0);
        }
    };

    const handleClose = () => {
        setTopic('');
        setDescription('');
        setLoading(false);
        setCurrentStep(0);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop Blur */}
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={handleClose}></div>

            {/* Modal Body */}
            <div className="relative bg-white rounded-3xl shadow-2xl shadow-indigo-500/10 w-full max-w-2xl overflow-hidden flex flex-col transform transition-all animate-in fade-in zoom-in-95 duration-200 border border-slate-100">

                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                            <Bot className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-slate-900">
                                AI Roadmap Generator
                            </h2>
                            <p className="text-sm font-medium text-slate-500">Mô tả mục tiêu, AI sẽ lo phần còn lại.</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors disabled:opacity-50"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-8">
                    {!loading ? (
                        <form onSubmit={handleCreateAI} className="space-y-6">
                            <div>
                                <textarea
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-6 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium text-slate-900 resize-none text-lg placeholder:text-slate-400"
                                    placeholder="Tôi muốn học ReactJS để đi làm Frontend trong 3 tháng tới. Tôi mới chỉ biết HTML CSS cơ bản..."
                                    rows="4"
                                    required
                                    autoFocus
                                />
                                <p className="text-sm font-medium text-slate-500 mt-3 flex items-center gap-1.5">
                                    <Sparkles className="w-4 h-4 text-amber-500" /> Hãy cung cấp trình độ hiện tại, định hướng và thời gian rảnh.
                                </p>
                            </div>

                            <div className="pt-2 border-t border-slate-100">
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Tên Lộ trình (Tùy chọn)</label>
                                <input
                                    type="text"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3.5 outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 transition-all text-sm font-medium placeholder:text-slate-400"
                                    placeholder="VD: Hành trình ReactJS Fullstack Frontend"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-4 mt-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-[0.99] flex items-center justify-center gap-2 text-base"
                            >
                                <Sparkles className="w-5 h-5" /> Khởi tạo lộ trình
                            </button>
                        </form>
                    ) : (
                        <div className="py-2">
                            <div className="text-center mb-8">
                                <div className="relative inline-flex items-center justify-center mb-6">
                                    <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center shadow-inner">
                                        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                                    </div>
                                    {/* Subtly Glowing Ring */}
                                    <div className="absolute inset-0 border-2 border-indigo-500/20 rounded-2xl animate-pulse"></div>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-1">
                                    Hệ thống AI đang xử lý...
                                </h3>
                                <p className="text-slate-500 text-sm font-medium">Bản giao hưởng 3 liên minh đang được soạn thảo. Vui lòng chờ.</p>
                            </div>

                            <div className="space-y-3">
                                {STEPS.map((step) => {
                                    const isCompleted = currentStep > step.id;
                                    const isCurrent = currentStep === step.id;
                                    const isWaiting = currentStep < step.id;

                                    return (
                                        <div key={step.id} className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-300 ${isCurrent ? 'bg-indigo-50 ring-1 ring-indigo-100 scale-[1.02]' : isCompleted ? 'bg-slate-50' : 'opacity-60'}`}>
                                            <div className="mt-0.5 shrink-0">
                                                {isCompleted ? (
                                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                                ) : isCurrent ? (
                                                    <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
                                                ) : (
                                                    <div className="w-6 h-6 rounded-full border-2 border-slate-300" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className={`text-sm font-bold truncate ${isCurrent ? 'text-indigo-900' : isCompleted ? 'text-slate-700' : 'text-slate-500'}`}>
                                                    Bước {step.id}: {step.name}
                                                </h4>
                                                <p className={`text-xs mt-0.5 truncate ${isCurrent ? 'text-indigo-600 font-medium' : 'text-slate-500'}`}>
                                                    {isWaiting ? 'Đang đợi...' : step.desc}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreateRoadmapAIModal;
