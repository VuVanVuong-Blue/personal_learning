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
            <div className="w-full flex flex-col items-center">
                {/* Global Header */}
                <header className="w-full sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
                    {/* Top Tier */}
                    <div className="bg-slate-900 text-slate-300 text-xs py-2 px-6 flex justify-end gap-6 w-full">
                        <span className="hover:text-white cursor-pointer transition-colors font-medium">Học sinh</span>
                        <span className="hover:text-white cursor-pointer transition-colors font-medium">Sinh viên</span>
                        <span className="hover:text-white cursor-pointer transition-colors font-medium">Người đi làm</span>
                    </div>
                    {/* Bottom Tier */}
                    <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between w-full">
                        <div className="flex items-center gap-8">
                            {/* Logo Match App Theme */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                                    <span className="text-white font-bold text-lg">PL</span>
                                </div>
                                <span className="font-bold text-xl text-slate-900 tracking-tight">Platform</span>
                            </div>

                            {/* Center Search Bar */}
                            <div className="hidden md:flex relative group">
                                <input 
                                    type="text" 
                                    placeholder="Bạn muốn học gì hôm nay?" 
                                    className="w-[400px] pl-5 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all shadow-sm group-hover:bg-white"
                                />
                                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                                </button>
                            </div>
                        </div>

                        {/* CTA Buttons */}
                        <div className="flex items-center gap-4">
                            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">
                                Đăng nhập
                            </Link>
                            <Link to="/register" className="bg-indigo-600 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-indigo-700 transition shadow-md shadow-indigo-200/50">
                                Tham gia miễn phí
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="w-full flex flex-col items-center">
                    {/* Hero Section (Widescreen Bento) */}
                    <section className="w-full max-w-[1440px] px-6 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 min-h-[500px]">
                            {/* Left Card: Value Proposition */}
                            <div className="bg-indigo-50/50 rounded-[40px] p-12 lg:p-20 flex flex-col justify-center border border-indigo-100/50 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-700 -translate-y-1/2 translate-x-1/2"></div>
                                <h1 className="text-5xl lg:text-[64px] font-black text-slate-900 tracking-tight leading-[1.1] mb-6 relative z-10">
                                    Hành trình học tập <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">cá nhân hóa</span>, <br />
                                    định hướng rõ ràng.
                                </h1>
                                <p className="text-xl text-slate-600 mb-10 max-w-lg leading-relaxed relative z-10 font-medium">
                                    Mở khóa tiềm năng của bạn cùng hệ thống tư vấn AI. Xây dựng lộ trình bài bản, không xao nhãng.
                                </p>
                                <div className="flex gap-4 relative z-10">
                                    <Link to="/register" className="bg-indigo-600 text-white px-10 py-4 rounded-full text-lg font-bold hover:bg-indigo-700 transition shadow-xl shadow-indigo-200 hover:-translate-y-0.5">
                                        Bắt đầu học ngay
                                    </Link>
                                </div>
                            </div>
                            
                            {/* Right Card: Visual/Illustration */}
                            <div className="bg-slate-50 rounded-[40px] border border-slate-200/60 flex items-center justify-center p-12 overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                                {/* Placeholder for a 3D graphic. Simulated with CSS shapes for now */}
                                <div className="relative w-full aspect-square max-w-md">
                                    <div className="absolute inset-4 bg-white shadow-2xl rounded-3xl border border-slate-100 rotate-[-6deg] transition-transform duration-700 group-hover:rotate-[-2deg]"></div>
                                    <div className="absolute inset-0 bg-indigo-600 shadow-xl rounded-3xl rotate-[6deg] transition-transform duration-700 group-hover:rotate-[2deg] flex items-center justify-center z-10 overflow-hidden">
                                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff1a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff1a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
                                        <svg className="w-32 h-32 text-white/90 drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                                    </div>
                                    
                                    {/* Floating stats badges */}
                                    <div className="absolute -left-6 top-1/4 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 z-20 flex items-center gap-3 animate-bounce" style={{animationDuration: '3s'}}>
                                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600"><CheckCircle2 className="w-5 h-5"/></div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-semibold">Tỉ lệ hoàn thành</p>
                                            <p className="text-sm font-bold text-slate-900">92%</p>
                                        </div>
                                    </div>
                                    <div className="absolute -right-8 bottom-1/4 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 z-20 flex items-center gap-3 animate-bounce" style={{animationDuration: '4s'}}>
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600"><Flame className="w-5 h-5"/></div>
                                        <div>
                                            <p className="text-xs text-slate-500 font-semibold">Ngày liên tiếp</p>
                                            <p className="text-sm font-bold text-slate-900">14 ngày</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Social Proof (Grayscale Logos) */}
                    <section className="w-full bg-white border-y border-slate-100 py-12">
                        <div className="max-w-[1440px] mx-auto px-6 text-center">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-8">Nền tảng được xây dựng bằng các công nghệ cốt lõi</p>
                            <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                {/* SVG Logos for React, Node, etc. (using simple text/icons for demo) */}
                                <div className="text-xl font-bold flex items-center gap-2"><div className="w-8 h-8 rounded bg-cyan-500 text-white flex items-center justify-center text-sm">⚛</div> React</div>
                                <div className="text-xl font-bold flex items-center gap-2"><div className="w-8 h-8 rounded bg-green-600 text-white flex items-center justify-center text-sm">⬢</div> Node.js</div>
                                <div className="text-xl font-bold flex items-center gap-2"><div className="w-8 h-8 rounded bg-blue-500 text-white flex items-center justify-center text-sm">🐍</div> Python</div>
                                <div className="text-xl font-bold flex items-center gap-2"><div className="w-8 h-8 rounded bg-green-500 text-white flex items-center justify-center text-sm">🍃</div> MongoDB</div>
                                <div className="text-xl font-bold flex items-center gap-2"><div className="w-8 h-8 rounded bg-sky-400 text-white flex items-center justify-center text-sm">🌊</div> Tailwind</div>
                            </div>
                        </div>
                    </section>

                    {/* Features (Zig-zag) */}
                    <section className="w-full max-w-[1440px] px-6 py-24 md:py-32 flex flex-col gap-32">
                        {/* Feature 1 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                            <div className="order-2 lg:order-1 relative group">
                                <div className="absolute inset-0 bg-indigo-100 rounded-3xl transform -rotate-3 transition-transform group-hover:rotate-0"></div>
                                <div className="aspect-[4/3] bg-white rounded-3xl border border-slate-200 shadow-2xl relative z-10 flex items-center justify-center overflow-hidden">
                                     <div className="absolute top-0 w-full h-12 bg-slate-100 border-b border-slate-200 flex items-center px-4 gap-2">
                                        <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                                     </div>
                                     <div className="mt-8 p-8 w-full max-w-sm">
                                         <div className="h-4 w-1/3 bg-slate-200 rounded mb-6"></div>
                                         <div className="space-y-4">
                                            <div className="h-12 w-full bg-indigo-50 rounded-xl border border-indigo-100"></div>
                                            <div className="h-12 w-full bg-slate-50 rounded-xl border border-slate-100"></div>
                                            <div className="h-12 w-3/4 bg-slate-50 rounded-xl border border-slate-100"></div>
                                         </div>
                                     </div>
                                </div>
                            </div>
                            <div className="order-1 lg:order-2">
                                <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Lộ trình học tập do <span className="text-indigo-600">AI gợi ý</span></h2>
                                <p className="text-xl text-slate-600 mb-8 leading-relaxed font-medium">Thay vì tự mày mò trong biển kiến thức, Trí tuệ nhân tạo sẽ thiết kế một con đường dành riêng cho bạn dựa trên mục tiêu và năng lực cá nhân. Tối ưu thời gian, đi thẳng đến đích.</p>
                                <button className="inline-flex items-center gap-2 text-indigo-600 font-bold text-lg hover:text-indigo-700 group">
                                    Khám phá thêm tính năng 
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>

                        {/* Feature 2 */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                            <div>
                                <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight">Phân tích và theo dõi <span className="text-indigo-600">tiến độ thực tế</span></h2>
                                <p className="text-xl text-slate-600 mb-8 leading-relaxed font-medium">Số liệu hóa quá trình nỗ lực của bạn thông qua bản đồ nhiệt (Heatmap) và biểu đồ trực quan. Nhìn thấy sự tiến bộ mỗi ngày chính là động lực mạnh mẽ nhất để không bỏ cuộc.</p>
                                <button className="inline-flex items-center gap-2 text-indigo-600 font-bold text-lg hover:text-indigo-700 group">
                                    Xem báo cáo mẫu
                                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-slate-200 rounded-3xl transform rotate-3 transition-transform group-hover:rotate-0"></div>
                                <div className="aspect-[4/3] bg-white rounded-3xl border border-slate-200 shadow-2xl relative z-10 p-8 flex flex-col pt-12">
                                    <div className="flex justify-between items-end mb-8">
                                        <div className="h-8 w-1/3 bg-slate-200 rounded"></div>
                                        <div className="h-6 w-16 bg-emerald-100 rounded text-emerald-600 text-xs font-bold flex items-center justify-center">+12%</div>
                                    </div>
                                    <div className="flex-1 flex items-end gap-4 justify-between pt-8 border-b border-l border-slate-200 pl-4 pb-0">
                                        {[40, 65, 30, 80, 55, 95, 75].map((h, i) => (
                                            <div key={i} className="w-full bg-indigo-500 rounded-t-sm transition-all duration-1000 origin-bottom hover:bg-indigo-600" style={{height: `${h}%`}}></div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Testimonials */}
                    <section className="w-full max-w-[1440px] px-6 py-24 border-t border-slate-100">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Cùng hàng ngàn học viên chinh phục mục tiêu</h2>
                            <p className="text-xl text-slate-500 font-medium">Bắt đầu hành trình của bạn ngay hôm nay cùng Cộng đồng</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Testimonial 1 */}
                            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-1 mb-6 text-amber-400">
                                    {[1,2,3,4,5].map(i => <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>)}
                                </div>
                                <p className="text-slate-700 italic mb-8 leading-relaxed">"Nhờ Lộ trình do AI sinh ra, tôi đã lấy lại gốc Tiếng Anh căn bản chỉ sau 2 tháng. Các nhiệm vụ chia nhỏ rất dễ thực hiện."</p>
                                <div className="flex items-center gap-4 mt-auto">
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">M</div>
                                    <div>
                                        <p className="font-bold text-slate-900">Minh Tuấn</p>
                                        <p className="text-sm text-slate-500">Sinh viên Bách Khoa</p>
                                    </div>
                                </div>
                            </div>
                            {/* Testimonial 2 */}
                            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-1 mb-6 text-amber-400">
                                    {[1,2,3,4,5].map(i => <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>)}
                                </div>
                                <p className="text-slate-700 italic mb-8 leading-relaxed">"Giao diện vô cùng sạch sẽ, tập trung 100% vào việc học. Tính năng Heatmap khiến tôi không muốn phá vỡ chuỗi ngày học tập của mình."</p>
                                <div className="flex items-center gap-4 mt-auto">
                                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">H</div>
                                    <div>
                                        <p className="font-bold text-slate-900">Hải Anh</p>
                                        <p className="text-sm text-slate-500">Frontend Developer</p>
                                    </div>
                                </div>
                            </div>
                            {/* Testimonial 3 */}
                            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-1 mb-6 text-amber-400">
                                    {[1,2,3,4,5].map(i => <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>)}
                                </div>
                                <p className="text-slate-700 italic mb-8 leading-relaxed">"Nền tảng tuyệt vời cho việc tự học chứng chỉ AWS. Nó giúp tôi chia khối lượng khổng lồ ra từng mảnh nhỏ xử lý mỗi ngày."</p>
                                <div className="flex items-center gap-4 mt-auto">
                                    <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold">L</div>
                                    <div>
                                        <p className="font-bold text-slate-900">Long Trần</p>
                                        <p className="text-sm text-slate-500">SysAdmin</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Pre-footer Call to Action */}
                    <section className="w-full bg-indigo-900 py-24">
                        <div className="max-w-4xl mx-auto px-6 text-center">
                            <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-8 tracking-tight">Sẵn sàng nâng cấp bản thân?</h2>
                            <p className="text-xl text-indigo-200 mb-10">Đăng ký thành viên ngay lập tức để nhận lộ trình AI cá nhân hóa thiết kế riêng cho mục tiêu nghề nghiệp của bạn.</p>
                            <Link to="/register" className="inline-block bg-white text-indigo-900 px-10 py-5 rounded-full text-xl font-bold hover:bg-indigo-50 transition shadow-2xl hover:scale-105 duration-300">
                                Tham gia miễn phí ngay
                            </Link>
                        </div>
                    </section>
                </main>
            </div>
        );
    }

    return (
        <div className="w-full bg-slate-50 min-h-[calc(100vh-64px)] animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="max-w-[1200px] mx-auto px-6 py-12">
                {/* Header Area */}
                <div className="mb-12">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-800 tracking-tight mb-2">
                        Chào mừng trở lại, {user.username}.
                    </h1>
                    <p className="text-slate-500 text-lg">Sẵn sàng chinh phục mục tiêu hôm nay chưa?</p>
                </div>

                {/* Resume Learning Banner */}
                <div className="bg-white rounded-3xl p-8 mb-12 shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8 hover:border-indigo-200 transition-colors">
                    <div className="flex-1 w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">Đang học</span>
                            <span className="text-sm font-semibold text-slate-500">12 / 18 bài học</span>
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-900 mb-6">Fullstack React & Node.js Masterclass</h2>
                        
                        <div className="flex items-center gap-4 w-full max-w-xl">
                            <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden">
                                <div className="bg-indigo-600 h-full rounded-full transition-all duration-1000 ease-out" style={{ width: '65%' }}></div>
                            </div>
                            <span className="font-bold text-slate-700">65%</span>
                        </div>
                    </div>
                    
                    <Link to="/roadmaps/resume" className="shrink-0 bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 flex items-center gap-2 group">
                        Tiếp tục bài học #12
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {/* My Roadmaps Grid */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-2xl font-bold text-slate-900">Lộ trình của tôi</h3>
                        <Link to="/roadmaps" className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Xem tất cả</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {dummyRoadmaps.map((roadmap) => (
                            <Link key={roadmap._id} to={`/roadmaps/${roadmap._id}`} className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all group">
                                <span className="inline-block px-3 py-1 bg-slate-50 text-slate-600 text-xs font-semibold rounded-full mb-4">
                                    {roadmap.category}
                                </span>
                                <h4 className="text-lg font-bold text-slate-900 mb-8 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                    {roadmap.title}
                                </h4>
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-slate-500 font-medium">{roadmap.completed}/{roadmap.totalTasks} bài học</span>
                                    <span className="font-bold text-indigo-600">{roadmap.progress}%</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
                                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-1000" style={{ width: `${roadmap.progress}%` }}></div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Contribution Heatmap */}
                <Heatmap />
             </div>
        </div>
    );
};

export default Home;
