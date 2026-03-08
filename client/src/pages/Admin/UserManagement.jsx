import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { toast } from 'sonner';
import { Loader2, Trash2, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get('/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Lỗi khi tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleDelete = async (id, role) => {
        if (role === 'admin') {
            toast.error("Không thể xóa tài khoản Admin!");
            return;
        }

        if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
            try {
                await axiosClient.delete(`/users/${id}`);
                toast.success("Đã xóa người dùng thành công");
                fetchUsers(); // Refresh list
            } catch (error) {
                console.error("Error deleting user:", error);
                toast.error("Lỗi khi xóa người dùng");
            }
        }
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-800">Quản Lý Người Dùng</h1>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="py-4 px-6 font-semibold text-sm text-gray-600">ID</th>
                                <th className="py-4 px-6 font-semibold text-sm text-gray-600">Người dùng</th>
                                <th className="py-4 px-6 font-semibold text-sm text-gray-600">Vai trò</th>
                                <th className="py-4 px-6 font-semibold text-sm text-gray-600">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                            {users.map((u) => (
                                <tr key={u._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6 font-mono text-xs text-gray-500">{u._id}</td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-3">
                                            <img
                                                src={u.avatar || "https://ui-avatars.com/api/?name=" + u.username}
                                                alt={u.username}
                                                className="h-8 w-8 rounded-full border border-gray-200"
                                            />
                                            <div>
                                                <p className="font-medium text-gray-900">{u.username}</p>
                                                <p className="text-gray-500 text-xs">{u.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.role === 'admin'
                                                ? 'bg-purple-100 text-purple-700'
                                                : 'bg-green-100 text-green-700'
                                            }`}>
                                            {u.role.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        {u.role !== 'admin' ? (
                                            <button
                                                onClick={() => handleDelete(u._id, u.role)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                                title="Xóa người dùng"
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </button>
                                        ) : (
                                            <span title="Không thể xóa Admin" className="p-2 inline-block text-gray-300">
                                                <ShieldAlert className="h-5 w-5" />
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {users.length === 0 && (
                    <div className="text-center py-10 text-gray-500">
                        Không có dữ liệu người dùng
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
