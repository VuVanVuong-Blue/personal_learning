import { useState, useEffect, useRef } from 'react';
import { Play, Square, Timer, Loader2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { toast } from 'sonner';

const PomodoroTimer = ({ roadmapId, taskId }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    // ── Drag-to-snap state ──────────────────────────────────────────────────
    const containerRef = useRef(null);
    const dragRef = useRef({ active: false, moved: false, offsetX: 0, offsetY: 0 });
    const [snapSide, setSnapSide] = useState('right');
    const [posY, setPosY] = useState(null); // null → use CSS bottom default
    const [liveXY, setLiveXY] = useState(null); // {x,y} while dragging

    const handleDragStart = (e) => {
        // Only allow dragging from the header strip (not buttons inside)
        if (e.target.closest('button')) return;
        e.preventDefault();
        const rect = containerRef.current.getBoundingClientRect();
        dragRef.current = {
            active: true,
            moved: false,
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top,
        };
        setLiveXY({ x: rect.left, y: rect.top });
        document.body.style.userSelect = 'none';
    };

    useEffect(() => {
        if (!liveXY) return;

        const onMove = (e) => {
            if (!dragRef.current.active) return;
            dragRef.current.moved = true;
            setLiveXY({ x: e.clientX - dragRef.current.offsetX, y: e.clientY - dragRef.current.offsetY });
        };

        const onUp = () => {
            dragRef.current.active = false;
            document.body.style.userSelect = '';
            if (!containerRef.current) { setLiveXY(null); return; }

            const rect = containerRef.current.getBoundingClientRect();
            const side = (rect.left + rect.width / 2) > window.innerWidth / 2 ? 'right' : 'left';
            const clampedY = Math.max(16, Math.min(rect.top, window.innerHeight - rect.height - 16));

            setSnapSide(side);
            setPosY(clampedY);
            setLiveXY(null);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        return () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };
    }, [liveXY]);

    // Build position style
    const posStyle = liveXY
        ? { left: liveXY.x, top: liveXY.y, right: 'auto', bottom: 'auto', transition: 'none' }
        : posY !== null
            ? {
                left: snapSide === 'left' ? 24 : 'auto',
                right: snapSide === 'right' ? 24 : 'auto',
                top: posY,
                bottom: 'auto',
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            }
            : {
                left: snapSide === 'left' ? 24 : 'auto',
                right: snapSide === 'right' ? 24 : 'auto',
                bottom: 24,
                top: 'auto',
                transition: 'all 0.3s cubic-bezier(0.4,0,0.2,1)',
            };
    // ───────────────────────────────────────────────────────────────────────

    // Load active session from localStorage if user refreshed
    useEffect(() => {
        const activeSession = localStorage.getItem('activeStudySession');
        if (activeSession) {
            try {
                const parsed = JSON.parse(activeSession);
                // Check if it's the same task (or we can just keep tracking globally for the roadmap)
                if (parsed.roadmapId === roadmapId && parsed.taskId === taskId) {
                    const elapsed = Math.floor((new Date().getTime() - new Date(parsed.startTime).getTime()) / 1000);
                    setSeconds(elapsed >= 0 ? elapsed : 0);
                    setSessionId(parsed.sessionId);
                    setIsRunning(true);
                } else {
                    // Different task, we might want to prompt them to stop the other one, but for simplicity:
                    // we'll just leave it or let them stop it.
                }
            } catch (e) {
                localStorage.removeItem('activeStudySession');
            }
        }
    }, [roadmapId, taskId]);

    // Timer Interval
    useEffect(() => {
        let interval = null;
        if (isRunning) {
            interval = setInterval(() => {
                setSeconds(sec => sec + 1);
            }, 1000);
        } else if (!isRunning && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isRunning, seconds]);

    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleStart = async () => {
        if (!roadmapId || !taskId) return toast.error("Vui lòng chọn một bài học để bắt đầu đếm giờ");

        setLoading(true);
        try {
            const res = await axiosClient.post('/analytics/sessions/start', {
                roadmapId,
                taskId
            });
            setSessionId(res.data._id);
            setSeconds(0);
            setIsRunning(true);

            localStorage.setItem('activeStudySession', JSON.stringify({
                sessionId: res.data._id,
                roadmapId,
                taskId,
                startTime: new Date().toISOString()
            }));

            toast.success("Bắt đầu tính giờ học!");
        } catch (error) {
            toast.error("Không thể bắt đầu phiên học");
        } finally {
            setLoading(false);
        }
    };

    const handleStop = async () => {
        if (!sessionId) return;

        setLoading(true);
        try {
            const res = await axiosClient.put(`/analytics/sessions/${sessionId}/stop`);
            setIsRunning(false);
            setSessionId(null);
            localStorage.removeItem('activeStudySession');

            // Sync timeSpend back to the Task via roadmap API
            await axiosClient.put(`/roadmaps/${roadmapId}/tasks/${taskId}/progress`, {
                timeSpent: res.data.duration
            });

            toast.success(`Đã lưu ${formatTime(res.data.duration)} phút tập trung!`);
            setSeconds(0);
        } catch (error) {
            toast.error("Lỗi khi kết thúc phiên học");
        } finally {
            setLoading(false);
        }
    };

    if (!taskId) return null; // Only show when a task is selected

    return (
        <div
            ref={containerRef}
            className={`fixed z-50 bg-white border border-gray-200 shadow-xl flex flex-col overflow-hidden
                ${isMinimized ? 'w-14 h-14 rounded-full' : 'w-64 rounded-2xl'}`}
            style={{ ...posStyle, touchAction: 'none' }}
        >
            {/* Header / Draggable zone — hold to drag, click to collapse */}
            <div
                className={`text-white flex items-center justify-between cursor-grab active:cursor-grabbing transition-all
                    ${isMinimized ? 'p-0 w-full h-full rounded-full items-center justify-center' : 'p-3'}
                    ${isRunning ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                onPointerDown={handleDragStart}
                onClick={(e) => { if (!dragRef.current.moved) setIsMinimized(v => !v); }}
            >
                <div className={`flex items-center pointer-events-none ${isMinimized ? 'justify-center' : 'gap-2'}`}>
                    <Timer className={`w-5 h-5 ${isRunning ? 'animate-pulse' : ''}`} />
                    {!isMinimized && <span className="font-semibold text-sm">Thời gian tập trung</span>}
                </div>
            </div>

            {/* Content */}
            {!isMinimized && (
                <div className="p-5 flex flex-col items-center">
                    <div className="text-4xl font-mono font-bold text-gray-800 mb-4 tracking-wider">
                        {formatTime(seconds)}
                    </div>

                    <div className="flex gap-3 w-full">
                        {!isRunning ? (
                            <button
                                onClick={handleStart}
                                disabled={loading}
                                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
                                Bắt đầu
                            </button>
                        ) : (
                            <button
                                onClick={handleStop}
                                disabled={loading}
                                className="flex-1 bg-red-100 text-red-600 hover:bg-red-200 py-2 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Square className="w-4 h-4 fill-red-600" />}
                                Kết thúc
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PomodoroTimer;
