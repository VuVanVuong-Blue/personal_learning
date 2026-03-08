import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle2, Circle, ChevronDown, ChevronRight, Edit2, Plus, GripVertical, Save, X, Link as LinkIcon, FileText, Youtube, Trash2, Smile, Meh, Frown, Globe, Lock, Settings, Star } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import EditRoadmapModal from '../../components/Roadmaps/EditRoadmapModal';
import ReviewList from '../../components/Roadmaps/ReviewList';
import PomodoroTimer from '../../components/Roadmaps/PomodoroTimer';
import AIChatbot from '../../components/Roadmaps/AIChatbot';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableTask = ({ task, milestoneId, activeTaskId, setActiveTaskId, handleToggleComplete, handleEditTask, handleDeleteTask }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: `task-${milestoneId}-${task._id}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="w-full flex items-start flex-col bg-white">
            <div className={`group w-full flex items-start gap-3 p-3 text-left transition-colors hover:bg-indigo-50/50 ${activeTaskId === task._id ? 'bg-indigo-50 border-l-2 border-indigo-600' : 'border-l-2 border-transparent'}`}>
                <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 p-0.5 mt-0.5 shrink-0">
                    <GripVertical className="w-3 h-3" />
                </div>
                <div className="mt-0.5 shrink-0 cursor-pointer" onClick={(e) => handleToggleComplete(e, task._id, milestoneId, task.isCompleted)}>
                    {task.isCompleted ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500 hover:text-green-600" />
                    ) : (
                        <Circle className="w-4 h-4 text-gray-300 hover:text-indigo-400" />
                    )}
                </div>
                <span onClick={() => setActiveTaskId(task._id)} className={`text-sm flex-1 cursor-pointer ${task.isCompleted ? 'text-gray-500 line-through' : 'text-gray-700'}`}>{task.title}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); handleEditTask(milestoneId, task._id, task.title); }} className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-100 rounded" title="Sửa tên bài học"><Edit2 className="w-3.5 h-3.5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteTask(milestoneId, task._id); }} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded" title="Xóa bài học"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
            </div>
        </div>
    );
};

const SortableMilestone = ({ milestone, idx, expanded, toggleMilestone, activeTaskId, setActiveTaskId, handleToggleComplete, handleAddTask, handleEditMilestone, handleDeleteMilestone, handleEditTask, handleDeleteTask }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: `milestone-${milestone._id}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="group w-full flex items-center justify-between p-3 bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                <div className="flex items-center gap-2 text-left flex-1">
                    <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 p-1">
                        <GripVertical className="w-4 h-4" />
                    </div>
                    <div className="w-6 h-6 rounded bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                    </div>
                    <span onClick={() => toggleMilestone(milestone._id)} className="font-medium text-sm text-gray-900 line-clamp-2 cursor-pointer flex-1">{milestone.title}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={(e) => { e.stopPropagation(); handleEditMilestone(milestone._id, milestone.title); }} className="p-1 text-gray-500 hover:text-indigo-600 hover:bg-indigo-100 rounded transition-colors" title="Sửa tên chặng"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteMilestone(milestone._id); }} className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded transition-colors" title="Xóa chặng"><Trash2 className="w-4 h-4" /></button>
                    </div>
                    <button onClick={() => toggleMilestone(milestone._id)}>
                        {expanded ? <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />}
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="divide-y divide-gray-100">
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
                            />
                        ))}
                    </SortableContext>
                    <button
                        onClick={() => handleAddTask(milestone._id)}
                        className="w-full p-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 flex items-center justify-center gap-1 transition-colors"
                    >
                        <Plus className="w-3 h-3" /> Thêm bài học
                    </button>
                </div>
            )}
        </div>
    );
};

const RoadmapWorkspace = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const urlTaskId = searchParams.get('taskId');
    const { user } = useAuth();
    const [roadmap, setRoadmap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTaskId, setActiveTaskId] = useState(null);
    const [expandedMilestones, setExpandedMilestones] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState('');
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        const fetchRoadmap = async () => {
            try {
                const res = await axiosClient.get(`/roadmaps/${id}`);
                setRoadmap(res.data);

                // Expand all milestones by default and select first task
                const expanded = {};
                let firstTask = null;
                let foundTask = null;

                res.data.milestones?.forEach(m => {
                    expanded[m._id] = true;
                    if (!firstTask && m.tasks && m.tasks.length > 0) {
                        firstTask = m.tasks[0]._id;
                    }
                    if (urlTaskId && m.tasks?.find(t => t._id === urlTaskId)) {
                        foundTask = urlTaskId;
                    }
                });

                setExpandedMilestones(expanded);

                if (foundTask) {
                    setActiveTaskId(foundTask);
                } else if (firstTask) {
                    setActiveTaskId(firstTask);
                }
            } catch (error) {
                toast.error("Không thể tải lộ trình");
                navigate('/roadmaps');
            } finally {
                setLoading(false);
            }
        };
        fetchRoadmap();
    }, [id, navigate]);

    // Update edited content when active task changes
    useEffect(() => {
        setIsEditing(false);
        let currentTask = null;
        roadmap?.milestones?.forEach(m => {
            const found = m.tasks?.find(t => t._id === activeTaskId);
            if (found) currentTask = found;
        });
        setEditedContent(currentTask?.content || '');
    }, [activeTaskId, roadmap]);

    const toggleMilestone = (milestoneId) => {
        setExpandedMilestones(prev => ({ ...prev, [milestoneId]: !prev[milestoneId] }));
    };

    const handleAddMilestone = async () => {
        const title = prompt("Nhập tên chặng (Milestone):");
        if (!title) return;
        try {
            const newMilestones = [...(roadmap.milestones || []), { title, tasks: [] }];
            const res = await axiosClient.put(`/roadmaps/${id}`, { milestones: newMilestones });
            setRoadmap(res.data);
            setExpandedMilestones(prev => ({ ...prev, [res.data.milestones[res.data.milestones.length - 1]._id]: true }));
            toast.success("Đã thêm chặng mới");
        } catch (error) {
            toast.error("Lỗi khi thêm chặng");
        }
    };

    const handleAddTask = async (milestoneId) => {
        const title = prompt("Nhập tên bài học (Task):");
        if (!title) return;
        try {
            const newMilestones = roadmap.milestones.map(m => {
                if (m._id === milestoneId) {
                    return { ...m, tasks: [...m.tasks, { title, content: '', resources: [] }] };
                }
                return m;
            });
            const res = await axiosClient.put(`/roadmaps/${id}`, { milestones: newMilestones });
            setRoadmap(res.data);

            // Auto select new task
            const updatedMilestone = res.data.milestones.find(m => m._id === milestoneId);
            const newTask = updatedMilestone.tasks[updatedMilestone.tasks.length - 1];
            setActiveTaskId(newTask._id);
            toast.success("Đã thêm bài học mới");
        } catch (error) {
            toast.error("Lỗi khi thêm bài học");
        }
    };

    const handleEditMilestone = async (milestoneId, currentTitle) => {
        const title = prompt("Nhập tên chặng mới:", currentTitle);
        if (!title || title === currentTitle) return;
        try {
            const newMilestones = roadmap.milestones.map(m => m._id === milestoneId ? { ...m, title } : m);
            const res = await axiosClient.put(`/roadmaps/${id}`, { milestones: newMilestones });
            setRoadmap(res.data);
            toast.success("Đã cập nhật tên chặng");
        } catch (error) {
            toast.error("Lỗi khi cập nhật");
        }
    };

    const handleDeleteMilestone = async (milestoneId) => {
        if (!window.confirm("Bạn có chắc muốn xóa chặng này và toàn bộ bài học bên trong?")) return;
        try {
            const newMilestones = roadmap.milestones.filter(m => m._id !== milestoneId);
            const res = await axiosClient.put(`/roadmaps/${id}`, { milestones: newMilestones });
            setRoadmap(res.data);
            toast.success("Đã xóa chặng");
            // If active task was in this milestone, unset it
            if (activeTaskId) {
                const stillExists = res.data.milestones.some(m => m.tasks.some(t => t._id === activeTaskId));
                if (!stillExists) setActiveTaskId(null);
            }
        } catch (error) {
            toast.error("Lỗi khi xóa chặng");
        }
    };

    const handleEditTask = async (milestoneId, taskId, currentTitle) => {
        const title = prompt("Nhập tên bài học mới:", currentTitle);
        if (!title || title === currentTitle) return;
        try {
            const newMilestones = roadmap.milestones.map(m => {
                if (m._id === milestoneId) {
                    return { ...m, tasks: m.tasks.map(t => t._id === taskId ? { ...t, title } : t) };
                }
                return m;
            });
            const res = await axiosClient.put(`/roadmaps/${id}`, { milestones: newMilestones });
            setRoadmap(res.data);
            toast.success("Đã cập nhật tên bài học");
        } catch (error) {
            toast.error("Lỗi khi cập nhật");
        }
    };

    const handleDeleteTask = async (milestoneId, taskId) => {
        if (!window.confirm("Bạn có chắc muốn xóa bài học này?")) return;
        try {
            const newMilestones = roadmap.milestones.map(m => {
                if (m._id === milestoneId) {
                    return { ...m, tasks: m.tasks.filter(t => t._id !== taskId) };
                }
                return m;
            });
            const res = await axiosClient.put(`/roadmaps/${id}`, { milestones: newMilestones });
            setRoadmap(res.data);
            toast.success("Đã xóa bài học");
            if (activeTaskId === taskId) setActiveTaskId(null);
        } catch (error) {
            toast.error("Lỗi khi xóa bài học");
        }
    };

    const handleSaveContent = async () => {
        try {
            const newMilestones = roadmap.milestones.map(m => {
                return {
                    ...m,
                    tasks: m.tasks.map(t => t._id === activeTaskId ? { ...t, content: editedContent } : t)
                };
            });
            const res = await axiosClient.put(`/roadmaps/${id}`, { milestones: newMilestones });
            setRoadmap(res.data);
            setIsEditing(false);
            toast.success("Đã lưu nội dung!");
        } catch (err) {
            toast.error("Lỗi khi lưu nội dung");
        }
    };

    // New States for Resources and Assessment
    const [isAddingResource, setIsAddingResource] = useState(false);
    const [resourceForm, setResourceForm] = useState({ name: '', url: '', type: 'link' });
    const [localReflection, setLocalReflection] = useState('');

    useEffect(() => {
        // Reset local reflection when task changes
        let currentTask = null;
        roadmap?.milestones?.forEach(m => {
            const found = m.tasks?.find(t => t._id === activeTaskId);
            if (found) currentTask = found;
        });
        setLocalReflection(currentTask?.reflectionNote || '');
    }, [activeTaskId, roadmap]);

    const handleTogglePublic = async () => {
        try {
            const res = await axiosClient.put(`/roadmaps/${id}`, { isPublic: !roadmap.isPublic });
            setRoadmap(res.data);
            toast.success(res.data.isPublic ? "Đã công khai lộ trình lên cộng đồng" : "Đã chuyển về chế độ riêng tư");
        } catch (error) {
            toast.error("Lỗi khi thay đổi trạng thái");
        }
    };

    const handleToggleComplete = async (e, taskId, milestoneId, currentVal) => {
        e.stopPropagation();
        try {
            const newVal = !currentVal;
            const res = await axiosClient.put(`/roadmaps/${id}/tasks/${taskId}/progress`, {
                isCompleted: newVal
            });

            // Fast local state update
            const newMilestones = roadmap.milestones.map(m => {
                if (m._id === milestoneId) {
                    return {
                        ...m,
                        tasks: m.tasks.map(t => {
                            if (t._id === taskId) {
                                return { ...t, ...res.data.task };
                            }
                            return t;
                        })
                    };
                }
                return m;
            });
            setRoadmap({ ...roadmap, milestones: newMilestones });

            if (newVal) toast.success('Chúc mừng! Đã hoàn thành bài học 🚀');
        } catch (err) {
            toast.error("Lỗi khi cập nhật trạng thái");
        }
    };

    const handleAddResource = async (milestoneId) => {
        if (!resourceForm.name || !resourceForm.url) return;
        try {
            const newMilestones = roadmap.milestones.map(m => {
                if (m._id === milestoneId) {
                    return {
                        ...m,
                        tasks: m.tasks.map(t => {
                            if (t._id === activeTaskId) {
                                return { ...t, resources: [...(t.resources || []), resourceForm] };
                            }
                            return t;
                        })
                    };
                }
                return m;
            });
            const res = await axiosClient.put(`/roadmaps/${id}`, { milestones: newMilestones });
            setRoadmap(res.data);
            setIsAddingResource(false);
            setResourceForm({ name: '', url: '', type: 'link' });
            toast.success("Đã thêm tài liệu chèn thêm");
        } catch (err) {
            toast.error("Lỗi khi thêm tài liệu");
        }
    };

    const handleDeleteResource = async (milestoneId, resourceId) => {
        try {
            const newMilestones = roadmap.milestones.map(m => {
                if (m._id === milestoneId) {
                    return {
                        ...m,
                        tasks: m.tasks.map(t => {
                            if (t._id === activeTaskId) {
                                return { ...t, resources: t.resources.filter(r => r._id !== resourceId) };
                            }
                            return t;
                        })
                    };
                }
                return m;
            });
            const res = await axiosClient.put(`/roadmaps/${id}`, { milestones: newMilestones });
            setRoadmap(res.data);
            toast.success("Đã xóa tài liệu");
        } catch (err) {
            toast.error("Lỗi khi xóa tài liệu");
        }
    };

    const handleUpdateAssessment = async (milestoneId, confidenceLevel) => {
        try {
            const res = await axiosClient.put(`/roadmaps/${id}/tasks/${activeTaskId}/progress`, {
                confidenceLevel
            });

            const newMilestones = roadmap.milestones.map(m => {
                if (m._id === milestoneId) {
                    return {
                        ...m,
                        tasks: m.tasks.map(t => {
                            if (t._id === activeTaskId) {
                                return { ...t, ...res.data.task, reflectionNote: localReflection };
                            }
                            return t;
                        })
                    };
                }
                return m;
            });

            // Still need to save the reflection note separately if using the main PUT roadmap
            // For simplicity, we just save the local UI state and wait for the user to click Save Reflection
            // Wait, the progress API doesn't take reflection note. Let's fire the roadmap update for the note.
            await axiosClient.put(`/roadmaps/${id}`, { milestones: newMilestones });
            setRoadmap({ ...roadmap, milestones: newMilestones });

            // toast.success("Đã ghi nhận độ hiểu bài");
        } catch (err) {
            toast.error("Lỗi khi lưu đánh giá");
        }
    };

    const handleSaveReflection = async (milestoneId) => {
        const currentTask = roadmap.milestones.find(m => m._id === milestoneId)?.tasks.find(t => t._id === activeTaskId);
        await handleUpdateAssessment(milestoneId, currentTask?.confidenceLevel);
        toast.success("Đã lưu nhật ký!");
    };

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const quillModules = {
        toolbar: [
            [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['clean']
        ],
    };

    if (loading) return <div className="flex h-[calc(100vh-64px)] items-center justify-center text-gray-500">Đang tải không gian làm việc...</div>;
    if (!roadmap) return null;

    // Calculate progress
    const totalTasks = roadmap.milestones?.reduce((acc, m) => acc + (m.tasks?.length || 0), 0) || 0;
    const completedTasks = roadmap.milestones?.reduce((acc, m) => acc + (m.tasks?.filter(t => t.isCompleted)?.length || 0), 0) || 0;
    const progressPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over) return;
        if (active.id === over.id) return;

        const activeIdStr = String(active.id);
        const overIdStr = String(over.id);

        if (activeIdStr.startsWith('milestone-') && overIdStr.startsWith('milestone-')) {
            const activeId = activeIdStr.replace('milestone-', '');
            const overId = overIdStr.replace('milestone-', '');

            const oldIndex = roadmap.milestones.findIndex(m => m._id === activeId);
            const newIndex = roadmap.milestones.findIndex(m => m._id === overId);

            if (oldIndex !== -1 && newIndex !== -1) {
                const newMilestones = arrayMove(roadmap.milestones, oldIndex, newIndex);
                setRoadmap({ ...roadmap, milestones: newMilestones });

                try {
                    await axiosClient.put(`/roadmaps/${id}`, { milestones: newMilestones });
                } catch (err) {
                    toast.error("Lỗi khi lưu vị trí chặng");
                }
            }
        }
        else if (activeIdStr.startsWith('task-') && overIdStr.startsWith('task-')) {
            const [, activeMId, activeTId] = activeIdStr.split('-');
            const [, overMId, overTId] = overIdStr.split('-');

            if (activeMId === overMId) {
                const milestoneIndex = roadmap.milestones.findIndex(m => m._id === activeMId);
                if (milestoneIndex === -1) return;

                const milestone = roadmap.milestones[milestoneIndex];
                const oldIndex = milestone.tasks.findIndex(t => t._id === activeTId);
                const newIndex = milestone.tasks.findIndex(t => t._id === overTId);

                if (oldIndex !== -1 && newIndex !== -1) {
                    const newTasks = arrayMove(milestone.tasks, oldIndex, newIndex);
                    const newMilestones = [...roadmap.milestones];
                    newMilestones[milestoneIndex] = { ...milestone, tasks: newTasks };

                    setRoadmap({ ...roadmap, milestones: newMilestones });
                    try {
                        await axiosClient.put(`/roadmaps/${id}`, { milestones: newMilestones });
                    } catch (err) {
                        toast.error("Lỗi khi lưu vị trí bài học");
                    }
                }
            }
        }
    };

    // Find active task
    let activeTask = null;
    let parentMilestone = null;
    roadmap.milestones?.forEach(m => {
        const found = m.tasks?.find(t => t._id === activeTaskId);
        if (found) {
            activeTask = found;
            parentMilestone = m;
        }
    });

    return (
        <div className="flex flex-col h-[calc(100vh-64px)] bg-white overflow-hidden">
            {/* Header */}
            <div className="h-16 border-b border-gray-200 px-6 flex items-center justify-between shrink-0 bg-white z-10 w-full shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/roadmaps')} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="font-bold text-lg text-gray-900 leading-tight truncate max-w-[300px] md:max-w-md">{roadmap.title}</h1>
                        <p className="text-xs text-gray-500">{roadmap.milestones?.length || 0} chặng • {totalTasks} bài học</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
                        title="Cài đặt Lộ trình"
                    >
                        <Settings className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Cài đặt</span>
                    </button>
                    <button
                        onClick={handleTogglePublic}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${roadmap.isPublic ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-gray-100'}`}
                        title="Thay đổi quyền riêng tư"
                    >
                        {roadmap.isPublic ? <Globe className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                        <span className="hidden sm:inline">{roadmap.isPublic ? 'Công khai' : 'Riêng tư'}</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-24 md:w-48 bg-gray-100 rounded-full h-2.5 overflow-hidden hidden sm:block">
                            <div className={`h-2.5 rounded-full transition-all duration-500 bg-${roadmap.themeColor || 'indigo'}-600`} style={{ width: `${progressPercent}%` }}></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-700">{progressPercent}%</span>
                    </div>
                </div>
            </div>

            {/* Split Workspace */}
            <div className="flex flex-1 overflow-hidden h-full">
                {/* Left Pane - Timeline (30%) */}
                <div className="w-80 lg:w-96 border-r border-gray-200 bg-gray-50 flex flex-col shrink-0 h-full">
                    <div className="p-4 border-b border-gray-200 bg-white shrink-0 flex flex-col gap-3">
                        <h2 className="font-semibold text-gray-900">Nội dung lộ trình</h2>
                        <button
                            onClick={() => setActiveTaskId(null)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border w-full text-left ${!activeTaskId ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm' : 'text-gray-600 border-transparent hover:bg-gray-100'}`}
                        >
                            <Star className={`w-4 h-4 ${!activeTaskId ? 'fill-indigo-700' : ''}`} />
                            Tổng quan & Đánh giá
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {roadmap.milestones?.length === 0 ? (
                            <div className="text-sm text-gray-500 text-center py-8">Chưa có bài học nào</div>
                        ) : (
                            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                                <SortableContext items={roadmap.milestones.map(m => m._id)} strategy={verticalListSortingStrategy}>
                                    {roadmap.milestones?.map((milestone, idx) => (
                                        <SortableMilestone
                                            key={milestone._id}
                                            milestone={milestone}
                                            idx={idx}
                                            expanded={expandedMilestones[milestone._id]}
                                            toggleMilestone={toggleMilestone}
                                            activeTaskId={activeTaskId}
                                            setActiveTaskId={setActiveTaskId}
                                            handleToggleComplete={handleToggleComplete}
                                            handleAddTask={handleAddTask}
                                            handleEditMilestone={handleEditMilestone}
                                            handleDeleteMilestone={handleDeleteMilestone}
                                            handleEditTask={handleEditTask}
                                            handleDeleteTask={handleDeleteTask}
                                        />
                                    ))}
                                </SortableContext>
                            </DndContext>
                        )}

                        <button
                            onClick={handleAddMilestone}
                            className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:text-indigo-600 hover:border-indigo-300 hover:bg-indigo-50 transition-all font-medium text-sm flex items-center justify-center gap-2"
                        >
                            <Plus className="w-4 h-4" /> Thêm chặng mới
                        </button>
                    </div>
                </div>

                {/* Right Pane - Content (70%) */}
                <div className="flex-1 bg-white overflow-y-auto h-full">
                    {activeTask ? (
                        <div className="max-w-4xl mx-auto p-8 pb-32">
                            <div className="mb-8 pb-6 border-b border-gray-100 flex items-start justify-between">
                                <div>
                                    <div className="text-xs font-semibold text-indigo-600 tracking-wider uppercase mb-2">
                                        {parentMilestone?.title}
                                    </div>
                                    <h1 className="text-3xl font-bold text-gray-900">{activeTask.title}</h1>
                                </div>
                                <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent shadow-sm hover:border-indigo-100"
                                    title={isEditing ? "Hủy chỉnh sửa" : "Chỉnh sửa bài học"}
                                >
                                    {isEditing ? <X className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Rich Content Area */}
                            {isEditing ? (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="bg-white rounded-xl overflow-hidden border border-gray-200">
                                        <ReactQuill
                                            theme="snow"
                                            value={editedContent}
                                            onChange={setEditedContent}
                                            modules={quillModules}
                                            className="h-96 pb-12"
                                            placeholder="Viết nội dung bài học ở đây..."
                                        />
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button
                                            onClick={handleSaveContent}
                                            className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
                                        >
                                            <Save className="w-4 h-4" /> Lưu nội dung
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="prose prose-indigo max-w-none animate-in fade-in duration-300"
                                    onDoubleClick={() => setIsEditing(true)}>
                                    {activeTask.content ? (
                                        <div dangerouslySetInnerHTML={{ __html: activeTask.content }} />
                                    ) : (
                                        <div
                                            onClick={() => setIsEditing(true)}
                                            className="bg-gray-50 border border-gray-200 border-dashed rounded-xl p-12 text-center text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors"
                                        >
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-3">
                                                <Edit2 className="w-5 h-5 text-gray-400" />
                                            </div>
                                            <p className="font-medium text-gray-600">Nội dung bài học hiện đang trống</p>
                                            <p className="text-sm mt-1">Nhấp đúp chuột hoặc bấm vào đây để viết nội dung chia sẻ kiến thức ngay!</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Resources Section */}
                            <div className="mt-12 pt-8 border-t border-gray-100">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <LinkIcon className="w-5 h-5 text-indigo-600" /> Tài liệu đính kèm
                                </h3>

                                {activeTask.resources && activeTask.resources.length > 0 ? (
                                    <div className="grid gap-3 mb-6">
                                        {activeTask.resources.map(res => (
                                            <div key={res._id || res.url} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors group">
                                                <div className="flex items-center gap-3 overflow-hidden">
                                                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shrink-0 border border-gray-100 shadow-sm text-indigo-500">
                                                        {res.type === 'pdf' ? <FileText className="w-5 h-5" /> : res.type === 'youtube' ? <Youtube className="w-5 h-5 text-red-500" /> : <LinkIcon className="w-5 h-5" />}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="font-medium text-sm text-gray-900 truncate">{res.name}</span>
                                                        <a href={res.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline truncate">{res.url}</a>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleDeleteResource(parentMilestone._id, res._id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-sm text-gray-500 mb-6 italic">Chưa có tài liệu đính kèm.</div>
                                )}

                                {isAddingResource ? (
                                    <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 space-y-3 animate-in fade-in duration-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">Tên tài liệu</label>
                                                <input type="text" value={resourceForm.name} onChange={e => setResourceForm({ ...resourceForm, name: e.target.value })} className="w-full text-sm p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all" placeholder="VD: Sách hướng dẫn React" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">Loại file</label>
                                                <select value={resourceForm.type} onChange={e => setResourceForm({ ...resourceForm, type: e.target.value })} className="w-full text-sm p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all">
                                                    <option value="link">Link Web chung</option>
                                                    <option value="pdf">Tài liệu PDF</option>
                                                    <option value="youtube">Video YouTube</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-gray-700 mb-1">Đường dẫn (URL)</label>
                                            <input type="url" value={resourceForm.url} onChange={e => setResourceForm({ ...resourceForm, url: e.target.value })} className="w-full text-sm p-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all" placeholder="https://" />
                                        </div>
                                        <div className="flex justify-end gap-2 pt-2">
                                            <button onClick={() => setIsAddingResource(false)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">Hủy</button>
                                            <button onClick={() => handleAddResource(parentMilestone._id)} disabled={!resourceForm.name || !resourceForm.url} className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${resourceForm.name && resourceForm.url ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-300 cursor-not-allowed'}`}>Lưu tài liệu</button>
                                        </div>
                                    </div>
                                ) : (
                                    <button onClick={() => setIsAddingResource(true)} className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition-colors">
                                        <Plus className="w-4 h-4" /> Thêm tài liệu mới
                                    </button>
                                )}
                            </div>

                            {/* Self Assessment Section */}
                            {activeTask.isCompleted && (
                                <div className="mt-12 pt-8 border-t border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-green-500" /> Đánh giá bản thân
                                    </h3>

                                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                                        <div className="mb-6">
                                            <p className="text-sm font-medium text-gray-700 mb-3">Bạn cảm thấy mức độ hiểu bài của mình hôm nay thế nào?</p>
                                            <div className="grid grid-cols-3 gap-3">
                                                <button
                                                    onClick={() => handleUpdateAssessment(parentMilestone._id, 'high')}
                                                    className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${activeTask.confidenceLevel === 'high' ? 'bg-green-50 border-green-500 text-green-700 shadow-sm ring-2 ring-green-100' : 'bg-white border-gray-200 hover:border-green-300 hover:bg-green-50/50 text-gray-500'}`}
                                                >
                                                    <Smile className={`w-8 h-8 ${activeTask.confidenceLevel === 'high' ? 'text-green-500' : 'text-gray-400'}`} />
                                                    <span className="text-sm font-semibold">Cực kỳ tự tin</span>
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateAssessment(parentMilestone._id, 'medium')}
                                                    className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${activeTask.confidenceLevel === 'medium' ? 'bg-yellow-50 border-yellow-500 text-yellow-700 shadow-sm ring-2 ring-yellow-100' : 'bg-white border-gray-200 hover:border-yellow-300 hover:bg-yellow-50/50 text-gray-500'}`}
                                                >
                                                    <Meh className={`w-8 h-8 ${activeTask.confidenceLevel === 'medium' ? 'text-yellow-500' : 'text-gray-400'}`} />
                                                    <span className="text-sm font-semibold">Cũng bình thường</span>
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateAssessment(parentMilestone._id, 'low')}
                                                    className={`p-3 border rounded-xl flex flex-col items-center justify-center gap-2 transition-all ${activeTask.confidenceLevel === 'low' ? 'bg-red-50 border-red-500 text-red-700 shadow-sm ring-2 ring-red-100' : 'bg-white border-gray-200 hover:border-red-300 hover:bg-red-50/50 text-gray-500'}`}
                                                >
                                                    <Frown className={`w-8 h-8 ${activeTask.confidenceLevel === 'low' ? 'text-red-500' : 'text-gray-400'}`} />
                                                    <span className="text-sm font-semibold">Còn lơ mơ lắm</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-sm font-medium text-gray-700 mb-2">Nhật ký tóm tắt (Không bắt buộc)</p>
                                            <textarea
                                                value={localReflection}
                                                onChange={(e) => setLocalReflection(e.target.value)}
                                                placeholder="Ghi chú lại những keyword chính, hoặc điều cần xem lại sau này..."
                                                className="w-full text-sm p-4 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none h-24 resize-none mb-3 transition-colors placeholder:text-gray-400"
                                            ></textarea>
                                            <div className="flex justify-end relative">
                                                <button
                                                    onClick={() => handleSaveReflection(parentMilestone._id)}
                                                    className="px-5 py-2.5 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-lg transition-all flex items-center gap-2 shadow-sm active:scale-95"
                                                >
                                                    <Save className="w-4 h-4" /> Lưu đánh giá
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-full flex flex-col pt-8">
                            <div className="max-w-4xl mx-auto w-full px-8 pb-20">
                                <ReviewList
                                    roadmapId={roadmap.originalRoadmap || roadmap._id}
                                    isAuthor={roadmap.originalRoadmap ? false : (roadmap?.author?._id === user?._id)}
                                    roadmapTitle={roadmap.title}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <EditRoadmapModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                roadmap={roadmap}
                onUpdate={(updatedRoadmap) => setRoadmap(updatedRoadmap)}
            />
            {activeTaskId && (
                <PomodoroTimer roadmapId={roadmap._id} taskId={activeTaskId} />
            )}
            <AIChatbot currentTask={activeTask} />
        </div>
    );
};

export default RoadmapWorkspace;
