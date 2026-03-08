import { useState, useEffect } from 'react';
import { Play, Square, Timer, Loader2 } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { toast } from 'sonner';

const PomodoroTimer = ({ roadmapId, taskId }) => {
    const [isRunning, setIsRunning] = useState(false);
    const [seconds, setSeconds] = useState(0);
    const [sessionId, setSessionId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

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
        <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isMinimized ? 'w-14 items-center' : 'w-64'} bg-white border border-gray-200 rounded-2xl shadow-xl flex flex-col overflow-hidden group`}>
            {/* Header / Draggable zone */}
            <div
                className={`bg-indigo-600 text-white p-3 flex items-center justify-between cursor-pointer transition-colors ${isRunning ? 'bg-red-500' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                onClick={() => setIsMinimized(!isMinimized)}
            >
                <div className="flex items-center gap-2">
                    <Timer className={`w-4 h-4 ${isRunning ? 'animate-pulse' : ''}`} />
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
