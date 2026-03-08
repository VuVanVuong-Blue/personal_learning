import { useAuth } from '../context/AuthContext';
import { Clock, CheckCircle2, Flame, Play, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 transition-all hover:border-indigo-200 hover:shadow-sm">
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 ${colorClass}`}>
            <Icon className="w-6 h-6" strokeWidth={2} />
        </div>
        <h3 className="text-sm font-semibold text-slate-500 mb-1">{title}</h3>
        <p className="text-3xl font-extrabold text-slate-900">{value}</p>
    </div>
);

const HeatmapCell = ({ intensity }) => {
    // intensity: 0 to 4
    const colors = [
        'bg-slate-100', // 0
        'bg-indigo-100', // 1
        'bg-indigo-300', // 2
        'bg-indigo-500', // 3
        'bg-indigo-700', // 4
    ];
    return <div className={`w-3 h-3 rounded-sm ${colors[intensity]} hover:ring-2 ring-slate-400 cursor-pointer transition-all`} />;
};

const Heatmap = () => {
    // Generate dummy data for a whole year (52 weeks * 7 days)
    const weeks = Array.from({ length: 52 }, () =>
        Array.from({ length: 7 }, () => Math.floor(Math.random() * 5))
    );

    return (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 mt-8">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">Hoạt động học tập</h2>
                    <p className="text-sm text-slate-500">Đóng góp của bạn trong năm nay</p>
                </div>
                <div className="text-sm font-medium text-slate-500 flex items-center gap-2">
                    Nhiều <HeatmapCell intensity={4} /> <HeatmapCell intensity={0} /> Ít
                </div>
            </div>

            <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-hide">
                {weeks.map((week, i) => (
                    <div key={i} className="flex flex-col gap-1">
                        {week.map((day, j) => (
                            <HeatmapCell key={`${i}-${j}`} intensity={day} />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
}

const Home = () => {
    const { user } = useAuth();

    // Dummy active roadmaps for now
    const dummyRoadmaps = [
        { _id: '1', title: 'React Hooks Masterclass', progress: 65, totalTasks: 20, completed: 13, category: 'Lập trình' },
        { _id: '2', title: 'IELTS Writing 7.0', progress: 30, totalTasks: 40, completed: 12, category: 'Ngoại ngữ' }
    ];

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[70vh] text-center max-w-2xl mx-auto">
                <h1 className="text-5xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
                    Mở khóa tiềm năng của bạn cùng <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">AI Mentor</span>
                </h1>
                <p className="text-lg text-slate-500 mb-10 leading-relaxed">
                    Personal Learning Platform là không gian học tập tối giản, không gây xao nhãng. Tự động sinh lộ trình bằng Trí Tuệ Nhân Tạo và theo dõi sự tiến bộ từng ngày.
                </p>
                <div className="flex gap-4">
                    <Link to="/register" className="bg-indigo-600 text-white px-8 py-3.5 rounded-full font-bold hover:bg-indigo-700 transition shadow-lg shadow-indigo-200">
                        Bắt đầu miễn phí
                    </Link>
                    <Link to="/login" className="bg-white text-slate-700 border border-slate-200 px-8 py-3.5 rounded-full font-bold hover:bg-slate-50 transition">
                        Đăng nhập
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Area */}
            <div className="mb-10">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-2">
                    Chào mừng trở lại, {user.username}.
                </h1>
                <p className="text-slate-500 text-lg">Sẵn sàng chinh phục mục tiêu hôm nay chưa?</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Giờ học tập"
                    value="124.5"
                    icon={Clock}
                    colorClass="bg-indigo-50 text-indigo-600"
                />
                <StatCard
                    title="Nhiệm vụ hoàn thành"
                    value="48"
                    icon={CheckCircle2}
                    colorClass="bg-emerald-50 text-emerald-600"
                />
                <StatCard
                    title="Chuỗi ngày liên tục"
                    value="12 🔥"
                    icon={Flame}
                    colorClass="bg-amber-50 text-amber-500"
                />
            </div>

            {/* Contribution Heatmap */}
            <Heatmap />

            {/* Active Roadmaps */}
            <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Lộ trình đang học</h2>
                    <Link to="/roadmaps" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 group">
                        Xem tất cả <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {dummyRoadmaps.map((roadmap) => (
                        <div key={roadmap._id} className="bg-white p-6 rounded-2xl border border-slate-200 group hover:border-indigo-300 transition-all cursor-pointer">
                            <div className="flex justify-between items-start mb-4">
                                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-full">
                                    {roadmap.category}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                                {roadmap.title}
                            </h3>
                            <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                                <span>{roadmap.completed} / {roadmap.totalTasks} bài học</span>
                                <span className="font-semibold text-slate-700">{roadmap.progress}%</span>
                            </div>

                            {/* Progress bar */}
                            <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6 overflow-hidden">
                                <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${roadmap.progress}%` }}></div>
                            </div>

                            <Link to={`/roadmaps/${roadmap._id}`} className="inline-flex items-center justify-center gap-2 w-full py-3 bg-slate-50 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-xl font-semibold transition-colors">
                                <Play className="w-4 h-4 fill-current" /> Tiếp tục học
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
