import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Search, Bell, Flame, User, LogOut, Shield, BookOpen, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';

const TopNavbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    // Search Logic
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchDropdown, setShowSearchDropdown] = useState(false);
    const [roadmaps, setRoadmaps] = useState([]);

    useEffect(() => {
        const fetchSearchData = async () => {
            try {
                const res = await axiosClient.get('/roadmaps');
                setRoadmaps(res.data);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu tìm kiếm", error);
            }
        };
        if (user) fetchSearchData();
    }, [user]);

    if (!user) return null;

    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const linkClasses = (path) => `text-sm font-semibold transition-colors duration-200 ${isActive(path)
            ? 'text-indigo-600'
            : 'text-slate-600 hover:text-slate-900'
        }`;

    return (
        <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
            <div className="max-w-[1440px] mx-auto px-6 h-16 flex items-center justify-between">
                
                {/* Left: Logo & Nav Links */}
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">PL</span>
                        </div>
                        <span className="font-bold text-xl text-slate-900 tracking-tight hidden sm:block">Platform</span>
                    </Link>

                    <nav className="hidden md:flex items-center gap-6 border-l border-slate-200 pl-8">
                        <Link to="/" className={linkClasses('/')}>Khám phá</Link>
                        <Link to="/roadmaps" className={linkClasses('/roadmaps')}>Lộ trình của tôi</Link>
                        <Link to="/activity" className={linkClasses('/activity')}>Hoạt động</Link>
                        {user?.role === 'admin' && (
                            <Link to="/admin" className="text-sm font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1">
                                <Shield className="w-4 h-4" /> Quản trị
                            </Link>
                        )}
                    </nav>
                </div>

                {/* Center: Search Bar with Dropdown */}
                <div className="hidden lg:flex flex-1 max-w-xl mx-8 relative group">
                    <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-indigo-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Tìm kiếm khóa học, kỹ năng..." 
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setShowSearchDropdown(e.target.value.length > 0);
                        }}
                        onFocus={() => searchQuery.length > 0 && setShowSearchDropdown(true)}
                        onBlur={() => setTimeout(() => setShowSearchDropdown(false), 200)}
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-full pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 transition-all hover:bg-white"
                    />

                    {/* Global Search Dropdown */}
                    {showSearchDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 z-[60]">
                            <div className="max-h-[350px] overflow-y-auto p-2">
                                {roadmaps.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase())).length > 0 ? (
                                    roadmaps
                                        .filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()))
                                        .slice(0, 6)
                                        .map(r => (
                                            <Link
                                                key={r._id}
                                                to={`/roadmaps/${r._id}`}
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    setShowSearchDropdown(false);
                                                }}
                                                className="flex items-center gap-3 p-3 hover:bg-slate-50 rounded-xl transition-colors group/item"
                                            >
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-indigo-50 text-indigo-500 shrink-0`}>
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1 min-w-0 text-left">
                                                    <p className="text-sm font-bold text-slate-900 truncate group-hover/item:text-indigo-600">{r.title}</p>
                                                    <p className="text-[11px] text-slate-500 truncate">
                                                        {r.author?.username} • {r.milestones?.length || 0} chặng
                                                    </p>
                                                </div>
                                                <ArrowRight className="w-4 h-4 text-slate-300 group-hover/item:text-indigo-400 group-hover/item:translate-x-1 transition-all" />
                                            </Link>
                                        ))
                                ) : (
                                    <div className="p-8 text-center">
                                        <p className="text-sm text-slate-400">Không tìm thấy lộ trình phù hợp</p>
                                    </div>
                                )}
                            </div>
                            {searchQuery.length > 0 && (
                                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Gợi ý tìm kiếm nhanh</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Right: Actions & Profile */}
                <div className="flex items-center gap-4 sm:gap-6">
                    {/* Streak */}
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 rounded-full border border-orange-100 font-bold text-sm">
                        <Flame className="w-4 h-4 fill-current" />
                        <span>12</span>
                    </div>

                    {/* Notifications */}
                    <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-50">
                        <Bell className="w-5 h-5" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                    </button>

                    {/* Profile Dropdown Trigger */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 focus:outline-none"
                        >
                            <div className="w-9 h-9 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold overflow-hidden hover:ring-2 hover:ring-indigo-300 transition-all">
                                {user.avatar ? (
                                    <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5001${user.avatar}`} alt="avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-sm">{user.username.charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                        </button>

                        {/* Dropdown Menu */}
                        {isProfileOpen && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 transform origin-top-right transition-all">
                                    <div className="px-4 py-3 border-b border-slate-100 mb-2">
                                        <p className="font-bold text-slate-900 truncate">{user.username}</p>
                                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                    </div>
                                    <Link to={`/profile/${user._id}`} onClick={() => setIsProfileOpen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors">
                                        <User className="w-4 h-4" /> Hồ sơ cá nhân
                                    </Link>
                                    <button onClick={() => { setIsProfileOpen(false); logout(); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors">
                                        <LogOut className="w-4 h-4" /> Đăng xuất
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopNavbar;
