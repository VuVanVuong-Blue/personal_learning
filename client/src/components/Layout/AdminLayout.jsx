import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, LogOut, Loader2, Home, ShieldAlert } from 'lucide-react';

const AdminLayout = () => {
    const { user, logout, loading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/admin', icon: LayoutDashboard, label: 'Tổng quan' },
        { path: '/admin/users', icon: Users, label: 'Người dùng' },
        { path: '/admin/reports', icon: ShieldAlert, label: 'Tố cáo' },
        { path: '/', icon: Home, label: 'Về trang chủ' },
    ];

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white flex flex-col">
                <div className="h-16 flex items-center justify-center border-b border-slate-800">
                    <h1 className="text-xl font-bold tracking-wider">Admin Panel</h1>
                </div>

                <div className="flex flex-col flex-1 py-4">
                    <nav className="flex-1 px-4 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                        }`}
                                >
                                    <Icon className="h-5 w-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="px-4 mt-auto">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center space-x-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                        >
                            <LogOut className="h-5 w-5" />
                            <span className="font-medium">Đăng xuất</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-white shadow-sm flex items-center justify-between px-8 z-10">
                    <h2 className="text-xl font-semibold text-gray-800">Quản trị hệ thống</h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">Xin chào,</span>
                        <div className="flex items-center space-x-2">
                            <img
                                src={user?.avatar || "https://ui-avatars.com/api/?name=" + user?.username}
                                alt="Admin avatar"
                                className="h-8 w-8 rounded-full border border-gray-200"
                            />
                            <span className="font-semibold text-gray-700">{user?.username}</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-auto bg-gray-50 p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
