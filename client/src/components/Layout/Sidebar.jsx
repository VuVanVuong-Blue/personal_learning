import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, BookOpen, Shield, Library, Activity, LayoutDashboard } from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => {
        if (path === '/' && location.pathname === '/') return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const linkClasses = (path) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm my-1 ${isActive(path)
            ? 'bg-indigo-50 text-indigo-700 font-semibold'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        }`;

    return (
        <aside className="w-64 bg-white border-r border-slate-200 min-h-screen flex flex-col sticky top-0 shrink-0">
            {/* Logo Area */}
            <div className="h-20 flex items-center px-6 border-b border-white justify-start"> {/* Kept border-white to remove line but keep padding if needed */}
                <Link to="/" className="flex items-center gap-2 font-extrabold text-xl text-indigo-600 tracking-tight">
                    <BookOpen className="w-7 h-7" strokeWidth={2.5} />
                    <span>LearningPath</span>
                </Link>
            </div>

            {/* Navigation Links */}
            <div className="flex-1 px-4 py-6 overflow-y-auto">
                <nav className="flex flex-col gap-1">
                    <Link to="/" className={linkClasses('/')}>
                        <LayoutDashboard className="w-5 h-5" strokeWidth={isActive('/') ? 2.5 : 2} />
                        Dashboard
                    </Link>

                    {user && (
                        <>
                            <Link to="/roadmaps" className={linkClasses('/roadmaps')}>
                                <Library className="w-5 h-5" strokeWidth={isActive('/roadmaps') ? 2.5 : 2} />
                                Lộ trình của tôi
                            </Link>
                            <Link to="/activity" className={linkClasses('/activity')}>
                                <Activity className="w-5 h-5" strokeWidth={isActive('/activity') ? 2.5 : 2} />
                                Hoạt động
                            </Link>
                        </>
                    )}

                    {user?.role === 'admin' && (
                        <div className="mt-6">
                            <h4 className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Quản trị</h4>
                            <Link to="/admin" className={linkClasses('/admin')}>
                                <Shield className="w-5 h-5" strokeWidth={isActive('/admin') ? 2.5 : 2} />
                                Trạm Quản Lý
                            </Link>
                        </div>
                    )}
                </nav>
            </div>

            {/* User Profile / Auth Area (Bottom) */}
            <div className="p-4 border-t border-slate-100">
                {user ? (
                    <div className="flex items-center gap-3 px-2 py-2">
                        <Link to={`/profile/${user._id}`} className="shrink-0 group">
                            <div className="h-10 w-10 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold overflow-hidden cursor-pointer group-hover:ring-2 group-hover:ring-indigo-300 transition-all">
                                {user.avatar ? (
                                    <img src={user.avatar.startsWith('http') ? user.avatar : `http://localhost:5001${user.avatar}`} alt="avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <User className="w-5 h-5" />
                                )}
                            </div>
                        </Link>
                        <div className="flex-1 min-w-0 pr-2">
                            <p className="text-sm font-semibold text-slate-900 truncate">{user.username}</p>
                            <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Đăng xuất"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        <Link to="/login" className="w-full text-center px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl transition-all">
                            Đăng nhập
                        </Link>
                        <Link to="/register" className="w-full text-center px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm">
                            Đăng ký
                        </Link>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;
