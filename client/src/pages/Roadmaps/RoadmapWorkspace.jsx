import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { 
    ArrowLeft, CheckCircle2, Circle, ChevronDown, ChevronRight, Edit2, 
    Plus, GripVertical, Save, X, Link as LinkIcon, FileText, Youtube, 
    Trash2, Smile, Meh, Frown, Globe, Lock, Settings, PlayCircle, BookOpen, Star, Clock, Trophy
} from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import EditRoadmapModal from '../../components/Roadmaps/EditRoadmapModal';
import ReviewList from '../../components/Roadmaps/ReviewList';
import PomodoroTimer from '../../components/Roadmaps/PomodoroTimer';
import AIChatbot from '../../components/Roadmaps/AIChatbot';
import {
    DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core';
import {
    arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// --- Sub-components for DnD and Tasks ---

const SortableTask = ({ 
    task, milestoneId, activeTaskId, setActiveTaskId, handleToggleComplete, 
    handleEditTask, handleDeleteTask, isEditing, setIsEditing, editedContent, 
    setEditedContent, handleSaveContent, resources, handleDeleteResource, 
    isAddingResource, setIsAddingResource, resourceForm, setResourceForm, 
    handleAddResource, handleUpdateAssessment, localReflection, setLocalReflection, handleSaveReflection 
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: `task-${milestoneId}-${task._id}` });

    const style = { transform: CSS.Transform.toString(transform), transition };
    const isActive = activeTaskId === task._id;

    // Rich Text Editor Modules
    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'image', 'video'],
            ['clean']
        ],
    };

    return (
        <div ref={setNodeRef} style={style} className="w-full bg-white border-b last:border-0 border-gray-100 flex flex-col items-start transition-all">
            {/* Task Row (Click to Expand) */}
            <div 
                className={`group w-full flex items-start gap-4 p-4 text-left transition-colors cursor-pointer ${isActive ? 'bg-indigo-50/30' : 'hover:bg-slate-50'}`}
                onClick={() => setActiveTaskId(isActive ? null : task._id)}
            >
                {/* Drag Handle */}
                <div {...attributes} {...listeners} className="cursor-grab text-slate-300 hover:text-slate-500 p-1 mt-0.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <GripVertical className="w-4 h-4" />
                </div>
                
                {/* Checkbox */}
                <div className="mt-1 shrink-0 cursor-pointer" onClick={(e) => handleToggleComplete(e, task._id, milestoneId, task.isCompleted)}>
                    {task.isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 hover:text-emerald-600 transition-colors" />
                    ) : (
                        <Circle className="w-5 h-5 text-slate-300 hover:text-indigo-400 transition-colors" />
                    )}
                </div>

                {/* Title and Meta */}
                <div className="flex-1 flex flex-col mb-1 overflow-hidden">
                    <span className={`text-base font-semibold transition-colors ${task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-800 group-hover:text-indigo-700'}`}>
                        {task.title}
                    </span>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><BookOpen className="w-3.5 h-3.5" /> Bài học</span>
                        {task.content && <span className="flex items-center gap-1"><Star className="w-3.5 h-3.5" /> Có nội dung</span>}
                        {task.resources?.length > 0 && <span className="flex items-center gap-1"><LinkIcon className="w-3.5 h-3.5" /> {task.resources.length} Tài liệu</span>}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); handleEditTask(milestoneId, task._id, task.title); }} className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded" title="Sửa tên"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(milestoneId, task._id); }} className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded" title="Xóa"><Trash2 className="w-4 h-4" /></button>
                </div>

                {/* Arrow */}
                <div className="mt-1 shrink-0 pl-2">
                    {isActive ? <ChevronDown className="w-5 h-5 text-indigo-500" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                </div>
            </div>

            {/* Inline Expanded Content Space */}
            {isActive && (
                <div className="w-full bg-white px-10 py-6 border-t border-slate-100 shadow-inner cursor-default">
                    {/* Header Inline Actions */}
                    <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                        <h3 className="text-xl font-bold text-slate-900">{task.title}</h3>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors border ${isEditing ? 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200' : 'bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100'}`}
                        >
                            {isEditing ? <><X className="w-4 h-4"/> Hủy sửa</> : <><Edit2 className="w-4 h-4"/> Biên soạn nội dung</>}
                        </button>
                    </div>

                    {/* Content Body */}
                    {isEditing ? (
                        <div className="space-y-4 mb-10">
                            <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
                                <ReactQuill
                                    theme="snow"
                                    value={editedContent}
                                    onChange={setEditedContent}
                                    modules={quillModules}
                                    className="h-[400px] sm:h-96 pb-12"
                                    placeholder="Viết nội dung bài giảng..."
                                />
                            </div>
                            <div className="flex justify-end">
                                <button onClick={handleSaveContent} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-indigo-700 shadow-md">
                                    Lưu nội dung
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="prose prose-indigo max-w-none text-slate-800 mb-10">
                            {task.content ? (
                                <div dangerouslySetInnerHTML={{ __html: task.content }} />
                            ) : (
                                <div className="p-8 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                    <p className="text-slate-500 italic mb-4">Bài học này chưa có nội dung chi tiết.</p>
                                    <button onClick={() => setIsEditing(true)} className="text-indigo-600 font-semibold hover:underline">Thêm nội dung ngay</button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Resources */}
                    <div className="mb-10 p-6 bg-slate-50 rounded-2xl border border-slate-200">
                        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <LinkIcon className="w-4 h-4" /> Tài liệu Đính kèm
                        </h4>
                        {task.resources && task.resources.length > 0 ? (
                            <div className="grid gap-3 mb-4">
                                {task.resources.map(res => (
                                    <div key={res._id || res.url} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-200 shadow-sm group">
                                        <a href={res.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 font-medium text-indigo-700 hover:text-indigo-900">
                                            {res.type === 'pdf' ? <FileText className="w-5 h-5 text-rose-500" /> : res.type === 'youtube' ? <Youtube className="w-5 h-5 text-red-600" /> : <LinkIcon className="w-5 h-5" />}
                                            {res.name}
                                        </a>
                                        <button onClick={() => handleDeleteResource(milestoneId, res._id)} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                            <Trash2 className="w-4 h-4"/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-500 mb-4">Chưa có tài liệu nào.</p>
                        )}

                        {isAddingResource ? (
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mt-4 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <input type="text" placeholder="Tên tài liệu..." value={resourceForm.name} onChange={e => setResourceForm({ ...resourceForm, name: e.target.value })} className="p-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                                    <select value={resourceForm.type} onChange={e => setResourceForm({ ...resourceForm, type: e.target.value })} className="p-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 bg-white">
                                        <option value="link">Link Tham Khảo</option><option value="youtube">YouTube</option><option value="pdf">PDF File</option>
                                    </select>
                                </div>
                                <input type="url" placeholder="https://..." value={resourceForm.url} onChange={e => setResourceForm({ ...resourceForm, url: e.target.value })} className="w-full p-2.5 text-sm border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500" />
                                <div className="flex gap-2">
                                    <button onClick={() => handleAddResource(milestoneId)} disabled={!resourceForm.name || !resourceForm.url} className={`px-4 py-2 text-sm font-bold text-white rounded-lg transition-colors ${resourceForm.name && resourceForm.url ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-slate-300'}`}>Lưu</button>
                                    <button onClick={() => setIsAddingResource(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Hủy</button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setIsAddingResource(true)} className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1"><Plus className="w-4 h-4"/> Thêm tài liệu đính kèm</button>
                        )}
                    </div>

                    {/* Self Assessment Card */}
                    {task.isCompleted && (
                        <div className="p-6 bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl text-white shadow-xl">
                            <h4 className="font-extrabold text-lg flex items-center gap-2 mb-4 drop-shadow-sm"><Trophy className="w-5 h-5 text-yellow-400" /> Nhật ký tự đánh giá</h4>
                            <p className="text-indigo-200 mb-6 text-sm">Bạn vừa hoàn thành bài học này! Hãy dành 1 phút để ghi nhận lại mức độ tiếp thu để hệ thống AI hiểu bạn hơn.</p>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                {[
                                    { rank: 'high', label: 'Cực kỳ tự tin', icon: Smile, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-500/50' },
                                    { rank: 'medium', label: 'Cũng bình thường', icon: Meh, color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-500/50' },
                                    { rank: 'low', label: 'Còn lơ mơ lắm', icon: Frown, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-500/50' },
                                ].map(option => (
                                    <button
                                        key={option.rank}
                                        onClick={() => handleUpdateAssessment(milestoneId, option.rank)}
                                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${task.confidenceLevel === option.rank ? `${option.bg} ${option.border} ring-2 ring-white/20 scale-105` : 'border-white/10 hover:border-white/30 bg-white/5'}`}
                                    >
                                        <option.icon className={`w-10 h-10 mb-2 ${option.color}`} />
                                        <span className="font-bold text-sm">{option.label}</span>
                                    </button>
                                ))}
                            </div>
                            
                            <div>
                                <textarea value={localReflection} onChange={(e) => setLocalReflection(e.target.value)} placeholder="Tóm tắt một vài keyword cốt lõi ở đây (không bắt buộc)..." className="w-full h-24 p-4 rounded-xl bg-indigo-950/50 border border-white/10 text-white placeholder:text-indigo-300/50 outline-none focus:ring-2 focus:ring-indigo-400 text-sm resize-none mb-3" />
                                <button onClick={() => handleSaveReflection(milestoneId)} className="w-full py-3 bg-white text-indigo-900 rounded-xl font-extrabold hover:bg-slate-100 transition-colors shadow-lg active:scale-[0.98]">
                                    Lưu Phiếu Đánh Giá
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const SortableMilestone = ({ 
    milestone, idx, expanded, toggleMilestone, activeTaskId, setActiveTaskId, 
    handleToggleComplete, handleAddTask, handleEditMilestone, handleDeleteMilestone, 
    handleEditTask, handleDeleteTask, isEditing, setIsEditing, editedContent, 
    setEditedContent, handleSaveContent, resources, handleDeleteResource, 
    isAddingResource, setIsAddingResource, resourceForm, setResourceForm, 
    handleAddResource, handleUpdateAssessment, localReflection, setLocalReflection, handleSaveReflection 
}) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: `milestone-${milestone._id}` });

    const style = { transform: CSS.Transform.toString(transform), transition };

    return (
        <div ref={setNodeRef} style={style} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
            {/* Milestone Header */}
            <div 
                className="w-full flex items-center justify-between p-6 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors group"
                onClick={() => toggleMilestone(milestone._id)}
            >
                <div className="flex items-center gap-4 text-left flex-1">
                    <div {...attributes} {...listeners} className="cursor-grab text-slate-300 hover:text-slate-500 shrink-0" onClick={e => e.stopPropagation()}>
                        <GripVertical className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-indigo-600 tracking-widest uppercase mb-1">Chặng {idx + 1}</div>
                        <h2 className="text-xl font-extrabold text-slate-900">{milestone.title}</h2>
                        <div className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                            <span>{milestone.tasks?.length || 0} bài học</span> • 
                            <span>{milestone.tasks?.filter(t => t.isCompleted).length || 0} đã học</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleEditMilestone(milestone._id, milestone.title); }} className="p-2 bg-white shadow-sm border border-slate-200 text-slate-500 hover:text-indigo-600 rounded-lg transition-colors" title="Sửa tên chặng"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteMilestone(milestone._id); }} className="p-2 bg-white shadow-sm border border-slate-200 text-slate-500 hover:text-rose-600 rounded-lg transition-colors" title="Xóa chặng"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
                        {expanded ? <ChevronDown className="w-5 h-5 text-indigo-600" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
                    </div>
                </div>
            </div>

            {/* Task List Container */}
            {expanded && (
                <div className="border-t border-slate-200 bg-white p-2">
                    <SortableContext items={(milestone.tasks || []).map(t => `task-${milestone._id}-${t._id}`)} strategy={verticalListSortingStrategy}>
                        {milestone.tasks?.map((task) => (
                            <SortableTask
                                key={task._id}
                                task={task}
                                milestoneId={milestone._id}
                                activeTaskId={activeTaskId}
                                setActiveTaskId={setActiveTaskId}
                                handleToggleComplete={handleToggleComplete}
                                handleEditTask={handleEditTask}
                                handleDeleteTask={handleDeleteTask}
                                isEditing={isEditing} setIsEditing={setIsEditing} 
                                editedContent={editedContent} setEditedContent={setEditedContent} 
                                handleSaveContent={handleSaveContent} 
                                resources={task.resources} handleDeleteResource={handleDeleteResource} 
                                isAddingResource={isAddingResource} setIsAddingResource={setIsAddingResource} 
                                resourceForm={resourceForm} setResourceForm={setResourceForm} 
                                handleAddResource={handleAddResource} 
                                handleUpdateAssessment={handleUpdateAssessment} localReflection={localReflection} 
                                setLocalReflection={setLocalReflection} handleSaveReflection={handleSaveReflection}
                            />
                        ))}
                    </SortableContext>
                    
                    {/* Add Task Button */}
                    <button
                        onClick={() => handleAddTask(milestone._id)}
                        className="w-full mt-2 py-4 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-bold hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all flex justify-center items-center gap-2"
                    >
                        <Plus className="w-5 h-5" /> Thêm Bài Học Mới Vào Chặng Này
                    </button>
                </div>
            )}
        </div>
    );
};


// --- Main Page Component ---
const RoadmapWorkspace = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlTaskId = searchParams.get('taskId');
    const { user } = useAuth();
    
    // Core State
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedMilestones, setExpandedMilestones] = useState({});
    
    // Interaction State
    const [activeTaskId, setActiveTaskId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    
    // Resources & Assessment State
    const [isAddingResource, setIsAddingResource] = useState(false);
    const [resourceForm, setResourceForm] = useState({ name: '', url: '', type: 'link' });
    const [localReflection, setLocalReflection] = useState('');

    useEffect(() => {
        const fetchRoadmap = async () => {
            try {
                const res = await axiosClient.get(`/roadmaps/${id}`);
                setRoadmap(res.data);

                const expanded = {};
                if (res.data.milestones) {
                    res.data.milestones.forEach(m => { expanded[m._id] = true; });
                }
                setExpandedMilestones(expanded);

                if (urlTaskId) setActiveTaskId(urlTaskId);
            } catch (error) {
                toast.error("Không thể tải lộ trình");
                navigate('/roadmaps');
            } finally {
                setLoading(false);
            }
        };
        fetchRoadmap();
    }, [id, navigate, urlTaskId]);

    // Update reflection Note & Rich content on active task change
    useEffect(() => {
        setIsEditing(false);
        setIsAddingResource(false);
        let currentTask = null;
        roadmap?.milestones?.forEach(m => {
            const found = m.tasks?.find(t => t._id === activeTaskId);
            if (found) currentTask = found;
        });
        setEditedContent(currentTask?.content || '');
        setLocalReflection(currentTask?.reflectionNote || '');
    }, [activeTaskId, roadmap]);

    // ----- Core Handlers (Lifted from Original) -----
    // ... Copying all state mutation logic verbatim ...
    const toggleMilestone = (milestoneId) => setExpandedMilestones(prev => ({ ...prev, [milestoneId]: !prev[milestoneId] }));

    const handleAddMilestone = async () => {
        const title = prompt("Nhập tên chặng (Milestone):");
        if (!title) return;
        try {
            const newMilestones = [...(roadmap.milestones || []), { title, tasks: [] }];
            const res = await axiosClient.put(`/roadmaps/${id}`, { milestones: newMilestones });
            setRoadmap(res.data);
            setExpandedMilestones(prev => ({ ...prev, [res.data.milestones[res.data.milestones.length - 1]._id]: true }));
            toast.success("Đã thêm chặng mới");
        } catch (error) { toast.error("Lỗi khi thêm chặng"); }
    };

    const handleAddTask = async (milestoneId) => {
        const title = prompt("Nhập tên bài học (Task):");
        if (!title) return;
        try {
            const newMilestones = roadmap.milestones.map(m => m._id === milestoneId ? { ...m, tasks: [...m.tasks, { title, content: '', resources: [] }] } : m);
            const res = await axiosClient.put(`/roadmaps/${id}`, { milestones: newMilestones });
            setRoadmap(res.data);
            const updatedMilestone = res.data.milestones.find(m => m._id === milestoneId);
            setActiveTaskId(updatedMilestone.tasks[updatedMilestone.tasks.length - 1]._id);
            toast.success("Đã thêm bài học mới");
        } catch (error) { toast.error("Lỗi khi thêm bài học"); }
    };

    const handleEditMilestone = async (milestoneId, currentTitle) => {
        const title = prompt("Nhập tên chặng mới:", currentTitle);
        if (!title || title === currentTitle) return;
        try {
            const newMilestones = roadmap.milestones.map(m => m._id === milestoneId ? { ...m, title } : m);
            const res = await axiosClient.put(`/roadmaps/${id}`, { milestones: newMilestones });
            setRoadmap(res.data);
            toast.success("Đã cập nhật tên chặng");
        } catch (error) { toast.error("Lỗi"); }
    };

    const handleDeleteMilestone = async (milestoneId) => {
        if (!window.confirm("Xóa chặng và toàn bộ bài học?")) return;
        try {
            const newMilestones = roadmap.milestones.filter(m => m._id !== milestoneId);
            const res = await axiosClient.put(`/roadmaps/${id}`, { milestones: newMilestones });
            setRoadmap(res.data);
            toast.success("Đã xóa chặng");
        } catch (error) { toast.error("Lỗi"); }
    };

    const handleEditTask = async (milestoneId, taskId, currentTitle) => {
        const title = prompt("Nhập tên bài học mới:", currentTitle);
        if (!title || title === currentTitle) return;
        try {
            const newMilestones = roadmap.milestones.map(m => m._id === milestoneId ? { ...m, tasks: m.tasks.map(t => t._id === taskId ? { ...t, title } : t) } : m);
            const res = await axiosClient.put(`/roadmaps/${id}`, { milestones: newMilestones });
            setRoadmap(res.data);
            toast.success("Đã cập nhật bài học");
        } catch (error) { toast.error("Lỗi"); }
    };

    const handleDeleteTask = async (milestoneId, taskId) => {
        if (!window.confirm("Bạn có chắc muốn xóa bài học này?")) return;
        try {
            const newMilestones = roadmap.milestones.map(m => m._id === milestoneId ? { ...m, tasks: m.tasks.filter(t => t._id !== taskId) } : m);
            const res = await axiosClient.put(`/roadmaps/${id}`, { milestones: newMilestones });
            setRoadmap(res.data);
            toast.success("Đã xóa bài học");
            if (activeTaskId === taskId) setActiveTaskId(null);
        } catch (error) { toast.error("Lỗi"); }
    };

    const handleSaveContent = async () => {
        try {
            const newMilestones = roadmap.milestones.map(m => ({
                ...m, tasks: m.tasks.map(t => t._id === activeTaskId ? { ...t, content: editedContent } : t)
            }));
            const res = await axiosClient.put(`/roadmaps/${id}`, { milestones: newMilestones });
            setRoadmap(res.data);
            setIsEditing(false);
            toast.success("Đã lưu nội dung!");
        } catch (err) { toast.error("Lỗi"); }
    };

    const handleToggleComplete = async (e, taskId, milestoneId, currentVal) => {
        e.stopPropagation();
        try {
            const res = await axiosClient.put(`/roadmaps/${id}/tasks/${taskId}/progress`, { isCompleted: !currentVal });
            const newMilestones = roadmap.milestones.map(m => m._id === milestoneId ? { ...m, tasks: m.tasks.map(t => t._id === taskId ? { ...t, ...res.data.task } : t) } : m);
            setRoadmap({ ...roadmap, milestones: newMilestones });
            if (!currentVal) toast.success('Đã hoàn thành bài học 🚀');
        } catch (err) { toast.error("Lỗi cập nhật"); }
    };

    const handleAddResource = async (milestoneId) => {
        try {
            const newMilestones = roadmap.milestones.map(m => m._id === milestoneId ? { ...m, tasks: m.tasks.map(t => t._id === activeTaskId ? { ...t, resources: [...(t.resources || []), resourceForm] } : t) } : m);
            const res = await axiosClient.put(`/roadmaps/${id}`, { milestones: newMilestones });
            setRoadmap(res.data);
            setIsAddingResource(false);
            setResourceForm({ name: '', url: '', type: 'link' });
            toast.success("Đã lưu tài liệu");
        } catch (err) { toast.error("Lỗi"); }
    };

    const handleDeleteResource = async (milestoneId, resourceId) => {
        try {
            const newMilestones = roadmap.milestones.map(m => m._id === milestoneId ? { ...m, tasks: m.tasks.map(t => t._id === activeTaskId ? { ...t, resources: t.resources.filter(r => r._id !== resourceId) } : t) } : m);
            const res = await axiosClient.put(`/roadmaps/${id}`, { milestones: newMilestones });
            setRoadmap(res.data);
            toast.success("Đã xóa");
        } catch (err) { toast.error("Lỗi"); }
    };

    const handleUpdateAssessment = async (milestoneId, confidenceLevel) => {
        try {
            const res = await axiosClient.put(`/roadmaps/${id}/tasks/${activeTaskId}/progress`, { confidenceLevel });
            const newMilestones = roadmap.milestones.map(m => m._id === milestoneId ? { ...m, tasks: m.tasks.map(t => t._id === activeTaskId ? { ...t, ...res.data.task, reflectionNote: localReflection } : t) } : m);
            await axiosClient.put(`/roadmaps/${id}`, { milestones: newMilestones });
            setRoadmap({ ...roadmap, milestones: newMilestones });
            toast.success("Đã lưu tiến độ đánh giá");
        } catch (err) { toast.error("Lỗi"); }
    };

    const handleSaveReflection = async (milestoneId) => {
        const currentTask = roadmap.milestones.find(m => m._id === milestoneId)?.tasks.find(t => t._id === activeTaskId);
        await handleUpdateAssessment(milestoneId, currentTask?.confidenceLevel || 'medium');
        toast.success("Đã lưu nhật ký!");
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const [typeActive, am, at] = String(active.id).split('-');
        const [typeOver, om, ot] = String(over.id).split('-');

        if (typeActive === 'milestone' && typeOver === 'milestone') {
            const oldIndex = roadmap.milestones.findIndex(m => m._id === am);
            const newIndex = roadmap.milestones.findIndex(m => m._id === om);
            if (oldIndex !== -1 && newIndex !== -1) {
                const newMilestones = arrayMove(roadmap.milestones, oldIndex, newIndex);
                setRoadmap({ ...roadmap, milestones: newMilestones });
                await axiosClient.put(`/roadmaps/${id}`, { milestones: newMilestones });
            }
        } else if (typeActive === 'task' && typeOver === 'task' && am === om) {
            const mIndex = roadmap.milestones.findIndex(m => m._id === am);
            const m = roadmap.milestones[mIndex];
            const oldIndex = m.tasks.findIndex(t => t._id === at);
            const newIndex = m.tasks.findIndex(t => t._id === ot);
            if (oldIndex !== -1 && newIndex !== -1) {
                const newTasks = arrayMove(m.tasks, oldIndex, newIndex);
                const newMilestones = [...roadmap.milestones];
                newMilestones[mIndex] = { ...m, tasks: newTasks };
                setRoadmap({ ...roadmap, milestones: newMilestones });
                await axiosClient.put(`/roadmaps/${id}`, { milestones: newMilestones });
            }
        }
    };

    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

    if (loading) return <div className="flex h-screen items-center justify-center text-slate-500 font-bold mt-16">Đang tải cấu trúc lộ trình...</div>;
    if (!roadmap) return null;

    // Derived State
    const totalTasks = roadmap.milestones?.reduce((acc, m) => acc + (m.tasks?.length || 0), 0) || 0;
    const completedTasks = roadmap.milestones?.reduce((acc, m) => acc + (m.tasks?.filter(t => t.isCompleted)?.length || 0), 0) || 0;
    const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    let activeTask = null;
    let parentMilestone = null;
    let nextUnfinishedTask = null;

    roadmap.milestones?.forEach(m => {
        m.tasks?.forEach(t => {
            if (t._id === activeTaskId) { activeTask = t; parentMilestone = m; }
            if (!t.isCompleted && !nextUnfinishedTask) { nextUnfinishedTask = t; }
        });
    });

    return (
        <div className="min-h-[calc(100vh-64px)] bg-slate-50 flex flex-col font-sans mb-10">
            {/* Top Widescreen Dark Banner */}
            <div className="w-full bg-[#0F172A] relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3"></div>

                <div className="max-w-[1280px] mx-auto px-6 pt-12 pb-32 relative z-10 w-full">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-3 mb-8 text-sm font-semibold tracking-wide">
                        <Link to="/roadmaps" className="text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-2">
                            <ArrowLeft className="w-4 h-4" /> Bàn làm việc
                        </Link>
                        <span className="text-slate-600">/</span>
                        <span className="text-slate-300 px-3 py-1 bg-white/10 rounded-full">{roadmap.category || 'Roadmap'}</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-[1.15] mb-6 max-w-4xl tracking-tight">
                        {roadmap.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-6 text-slate-300 font-medium">
                        <span className="flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" /> {roadmap.milestones?.length || 0} Chặng lớn</span>
                        <span className="flex items-center gap-2"><BookOpen className="w-5 h-5 text-emerald-400" /> {totalTasks} Bài học</span>
                        <span className="flex items-center gap-2"><Star className="w-5 h-5 text-indigo-400" /> Được tạo bởi: {roadmap?.author?.username || 'Bạn'}</span>
                    </div>
                </div>
            </div>

            {/* Main Content Layout (70% - 30% Split) */}
            <div className="max-w-[1280px] mx-auto w-full px-6 -mt-20 relative z-20 flex flex-col lg:flex-row gap-8 items-start">
                
                {/* Left Column - 70% Accordion List */}
                <div className="w-full lg:flex-[2.5] flex flex-col gap-6">
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-4 md:p-8 border border-slate-100">
                        <div className="flex items-center justify-between mb-8 px-4">
                            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Syllabus Lộ trình</h2>
                            <button
                                onClick={handleAddMilestone}
                                className="flex items-center gap-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-xl font-bold transition-all text-sm"
                            >
                                <Plus className="w-5 h-5" /> Thêm chặng (Chương)
                            </button>
                        </div>

                        {roadmap.milestones?.length === 0 ? (
                            <div className="text-center py-20 px-8 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                                <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-slate-700 mb-2">Chưa có nội dung nào</h3>
                                <p className="text-slate-500 mb-6 font-medium max-w-sm mx-auto">Thiết kế con đường học tập của bạn bằng cách thêm Chặng (Milestones) đầu tiên.</p>
                                <button onClick={handleAddMilestone} className="bg-indigo-600 text-white px-8 py-3.5 rounded-full font-bold shadow-lg shadow-indigo-200 hover:scale-105 transition-all">Bắt đầu xây dựng lộ trình</button>
                            </div>
                        ) : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={roadmap.milestones.map(m => m._id)} strategy={verticalListSortingStrategy}>
                                    {roadmap.milestones?.map((milestone, idx) => (
                                        <SortableMilestone
                                            key={milestone._id} milestone={milestone} idx={idx} expanded={expandedMilestones[milestone._id] !== false}
                                            toggleMilestone={toggleMilestone} activeTaskId={activeTaskId} setActiveTaskId={setActiveTaskId}
                                            handleToggleComplete={handleToggleComplete} handleAddTask={handleAddTask} handleEditMilestone={handleEditMilestone}
                                            handleDeleteMilestone={handleDeleteMilestone} handleEditTask={handleEditTask} handleDeleteTask={handleDeleteTask}
                                            isEditing={isEditing} setIsEditing={setIsEditing} editedContent={editedContent} setEditedContent={setEditedContent}
                                            handleSaveContent={handleSaveContent} handleDeleteResource={handleDeleteResource} isAddingResource={isAddingResource}
                                            setIsAddingResource={setIsAddingResource} resourceForm={resourceForm} setResourceForm={setResourceForm}
                                            handleAddResource={handleAddResource} handleUpdateAssessment={handleUpdateAssessment} localReflection={localReflection}
                                            setLocalReflection={setLocalReflection} handleSaveReflection={handleSaveReflection}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        )}
                    </div>
                </div>

                {/* Right Column - 30% Sticky Side Widget */}
                <div className="w-full lg:flex-[1] sticky top-24 shrink-0 flex flex-col gap-6">
                    {/* Widget 1: Progress & Action */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100 flex flex-col items-center">
                        <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle cx="64" cy="64" r="56" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                                <circle cx="64" cy="64" r="56" fill="transparent" stroke="#4f46e5" strokeWidth="12" strokeDasharray="351.858" strokeDashoffset={351.858 - (351.858 * progressPercent) / 100} className="transition-all duration-1000 ease-out drop-shadow-md" strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-black text-slate-800 tracking-tighter">{progressPercent}%</span>
                            </div>
                        </div>
                        
                        <p className="text-slate-600 font-medium mb-8 text-center text-sm">
                            Đã hoàn thành <strong className="text-slate-900">{completedTasks}</strong> trên tổng <strong className="text-slate-900">{totalTasks}</strong> bài học.
                        </p>

                        <button 
                            onClick={() => {
                                if (nextUnfinishedTask) {
                                    setActiveTaskId(nextUnfinishedTask._id);
                                    // Make sure its milestone is expanded
                                    roadmap.milestones.forEach(m => {
                                        if (m.tasks.find(t => t._id === nextUnfinishedTask._id)) {
                                            setExpandedMilestones(prev => ({...prev, [m._id]: true}));
                                        }
                                    });
                                    toast("Đã chuyển đến bài học tiếp theo!");
                                } else {
                                    toast("Bạn đã hoàn thành toàn bộ lộ trình!");
                                }
                            }}
                            className="w-full bg-indigo-600 text-white rounded-2xl py-4 font-bold text-lg hover:bg-indigo-700 active:scale-95 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 group"
                        >
                            <PlayCircle className="w-6 h-6 group-hover:scale-110 transition-transform" /> 
                            {progressPercent === 100 ? 'Ôn tập lại' : 'Học tiếp ngay'}
                        </button>
                    </div>

                    {/* Widget 2: Roadmap Controls */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 border border-slate-100">
                        <h3 className="font-extrabold text-slate-900 mb-6 uppercase tracking-wider text-sm flex items-center gap-2">
                            <Settings className="w-5 h-5 text-indigo-600" /> Bảng điều khiển
                        </h3>
                        <div className="flex flex-col gap-3">
                            <button onClick={() => setIsEditModalOpen(true)} className="flex items-center justify-between w-full p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 rounded-xl transition-all font-semibold text-slate-700 hover:text-indigo-700">
                                <span className="flex items-center gap-3"><Edit2 className="w-5 h-5" /> Cài đặt chung</span>
                                <ChevronRight className="w-4 h-4 opacity-50" />
                            </button>
                            <button className="flex items-center justify-between w-full p-3 bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl transition-all font-semibold text-slate-700 hover:text-emerald-700">
                                <span className="flex items-center gap-3"><Globe className="w-5 h-5" /> Trạng thái xuất bản</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs px-2 py-1 bg-white rounded-md shadow-sm border border-slate-200">{roadmap.isPublic ? 'Public' : 'Private'}</span>
                                    <ChevronRight className="w-4 h-4 opacity-50" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals & Add-ons */}
            <EditRoadmapModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} roadmap={roadmap} onUpdate={(updated) => setRoadmap(updated)} />
            {activeTaskId && <PomodoroTimer roadmapId={roadmap._id} taskId={activeTaskId} />}
            <AIChatbot currentTask={activeTask} />
        </div>
    );
};

export default RoadmapWorkspace;
