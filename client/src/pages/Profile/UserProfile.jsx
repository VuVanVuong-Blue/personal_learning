import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
dayjs.locale('vi');
import { User, Map, Star, Users, Edit2, Key, Camera, Loader2, Save, X, BookOpen, Clock, Activity, Settings } from 'lucide-react';

const UserProfile = () => {
    const { id } = useParams();
    const { user: currentUser, updateUser } = useAuth();

    const [profileData, setProfileData] = useState(null);
    const [roadmaps, setRoadmaps] = useState([]);
    const [stats, setStats] = useState(null);
    const [productivity, setProductivity] = useState(null);
    const [loading, setLoading] = useState(true);

    const isOwnProfile = (currentUser?._id === id) || (currentUser?.id === id);

    // Edit Mode States
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ username: '', bio: '' });
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState('');
    const [saving, setSaving] = useState(false);
    const fileInputRef = useRef(null);

    // Password Modal
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

    useEffect(() => {
        fetchProfile();
    }, [id]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await axiosClient.get(`/users/${id}/profile`);
            setProfileData(res.data.user);
            setStats(res.data.stats);
            setRoadmaps(res.data.roadmaps);

            // Prefill edit form
            setEditForm({
                username: res.data.user.username,
                bio: res.data.user.bio || ''
            });
            setAvatarPreview(res.data.user.avatar || '');

            if (currentUser?._id === id || currentUser?.id === id) {
                try {
                    const prodRes = await axiosClient.get('/analytics/productivity');
                    setProductivity(prodRes.data);
                } catch (e) { }
            }
        } catch (error) {
            toast.error("Không thể tải thông tin người dùng");
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarClick = () => {
        if (!isEditing) return;

        const option = prompt("Nhập URL ảnh trực tiếp, hoặc gõ 'file' để tải ảnh từ máy tính:");
        if (option === 'file') {
            fileInputRef.current.click();
        } else if (option && option.startsWith('http')) {
            setAvatarPreview(option);
            setAvatarFile(null);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                toast.error("File ảnh không được vượt quá 2MB");
                return;
            }
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            let finalAvatarUrl = avatarPreview;

            // 1. Upload File (if replacing via file)
            if (avatarFile) {
                const formData = new FormData();
                formData.append('avatar', avatarFile);
                const uploadRes = await axiosClient.post('/users/profile/avatar', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                finalAvatarUrl = uploadRes.data.avatar;
            }

            // 2. Update Basic Info
            const res = await axiosClient.put('/users/profile', {
                username: editForm.username,
                bio: editForm.bio,
                avatar: finalAvatarUrl // explicitly pass the URL
            });

            toast.success("Đã cập nhật hồ sơ");
            setProfileData(res.data);

            if (isOwnProfile) {
                updateUser(res.data);
            }
            setIsEditing(false);
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi lưu thông tin");
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return toast.error("Mật khẩu xác nhận không khớp");
        }

        try {
            await axiosClient.put('/users/change-password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            toast.success("Thay đổi mật khẩu thành công");
            setShowPasswordModal(false);
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || "Lỗi khi đổi mật khẩu");
        }
    };

    const getAvatarSrc = (src) => {
        if (!src) return '';
        if (src.startsWith('http') || src.startsWith('blob:')) return src;
        return `http://localhost:5001${src}`;
    };

    if (loading) return <div className="flex justify-center items-center h-[calc(100vh-64px)]"><Loader2 className="w-8 h-8 animate-spin text-indigo-600" /></div>;
    if (!profileData) return <div className="text-center py-20 text-slate-500 font-medium">Không tìm thấy hồ sơ người dùng.</div>;

    return (
        <div className="w-full max-w-3xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Zen Tube Top */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden border border-slate-100 shadow-sm mb-8 text-center flex flex-col items-center">
                {/* Minimalist Decoration */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none"></div>

                {isOwnProfile && !isEditing && (
                    <button onClick={() => setIsEditing(true)} className="absolute top-6 right-6 p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors group" title="Chỉnh sửa hồ sơ">
                        <Edit2 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </button>
                )}
                {isOwnProfile && isEditing && (
                    <button onClick={() => { setIsEditing(false); setAvatarPreview(profileData.avatar); setAvatarFile(null); }} className="absolute top-6 right-6 p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors" title="Hủy">
                        <X className="w-5 h-5" />
                    </button>
                )}

                {/* Avatar */}
                <div className="relative group mb-6 z-10">
                    <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-[6px] border-white shadow-xl shadow-indigo-100/50 bg-slate-50 flex items-center justify-center transition-transform ${isEditing ? 'cursor-pointer hover:scale-105 ring-4 ring-indigo-100' : ''}`} onClick={handleAvatarClick}>
                        {getAvatarSrc(isEditing ? avatarPreview : profileData.avatar) ? (
                            <img src={getAvatarSrc(isEditing ? avatarPreview : profileData.avatar)} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-16 h-16 text-slate-300" />
                        )}
                    </div>
                    {isEditing && (
                        <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none border-[6px] border-transparent">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                </div>

                {/* Profile Info */}
                <div className="z-10 w-full max-w-sm">
                    {isEditing ? (
                        <div className="space-y-4 text-left">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5 min-w-0">Tên hiển thị</label>
                                <input
                                    type="text"
                                    value={editForm.username}
                                    onChange={e => setEditForm({ ...editForm, username: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none font-bold text-slate-900 transition-all text-center"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tiểu sử (Triết lý học tập)</label>
                                <textarea
                                    value={editForm.bio}
                                    onChange={e => setEditForm({ ...editForm, bio: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-base focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none resize-none transition-all text-center"
                                    rows="2"
                                    placeholder="Một chút về bản thân..."
                                ></textarea>
                            </div>
                            <div className="pt-2">
                                <button onClick={handleSaveProfile} disabled={saving} className="w-full bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 shadow-sm active:scale-[0.98]">
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Lưu Hồ Sơ
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{profileData.username}</h1>
                            <p className="text-base text-slate-500 mt-1 font-medium">{profileData.email}</p>

                            {profileData.bio ? (
                                <p className="mt-6 text-lg text-slate-700 italic font-serif leading-relaxed px-4">
                                    "{profileData.bio}"
                                </p>
                            ) : (
                                <p className="mt-6 text-sm text-slate-400 font-medium">Người dùng này khá kín tiếng (Chưa có tiểu sử)</p>
                            )}

                            <div className="flex items-center justify-center gap-4 mt-8">
                                <span className="text-sm font-semibold text-slate-400 bg-slate-50 px-4 py-1.5 rounded-full">
                                    Tham gia: {dayjs(profileData.createdAt).format('MM/YYYY')}
                                </span>
                                {isOwnProfile && profileData.authProvider === 'local' && (
                                    <button
                                        onClick={() => setShowPasswordModal(true)}
                                        className="text-sm font-semibold text-slate-600 hover:text-indigo-600 bg-slate-50 hover:bg-indigo-50 px-4 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
                                    >
                                        <Key className="w-4 h-4" /> Đổi mật khẩu
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Stats Grid - Minimalist approach */}
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">Hoạt động nền tảng</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all flex flex-col justify-between h-32">
                    <Map className="w-6 h-6 text-indigo-500" />
                    <div>
                        <p className="text-3xl font-black text-slate-900">{stats?.createdCount || 0}</p>
                        <p className="text-sm font-medium text-slate-500">Người sáng tạo</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-violet-100 hover:shadow-sm transition-all flex flex-col justify-between h-32">
                    <BookOpen className="w-6 h-6 text-violet-500" />
                    <div>
                        <p className="text-3xl font-black text-slate-900">{stats?.learningCount || 0}</p>
                        <p className="text-sm font-medium text-slate-500">Đang theo học</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-amber-100 hover:shadow-sm transition-all flex flex-col justify-between h-32">
                    <Star className="w-6 h-6 text-amber-500" />
                    <div>
                        <p className="text-3xl font-black text-slate-900">{stats?.averageRating ? stats.averageRating : 'N/A'}</p>
                        <p className="text-sm font-medium text-slate-500">Điểm Đánh giá</p>
                    </div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-100 hover:border-emerald-100 hover:shadow-sm transition-all flex flex-col justify-between h-32">
                    <Users className="w-6 h-6 text-emerald-500" />
                    <div>
                        <p className="text-3xl font-black text-slate-900">{stats?.clonesCount || 0}</p>
                        <p className="text-sm font-medium text-slate-500">Đã lan tỏa (Clone)</p>
                    </div>
                </div>
            </div>

            {/* Published Roadmaps Showcase */}
            <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Lộ trình nổi bật</h3>
            </div>

            <div className="space-y-4">
                {roadmaps.length === 0 ? (
                    <div className="bg-white border border-slate-100 border-dashed rounded-2xl p-12 text-center">
                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Map className="w-5 h-5 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">{isOwnProfile ? 'Bạn chưa xuất bản lộ trình nào.' : 'Người dùng này chưa có lộ trình công khai.'}</p>
                    </div>
                ) : (
                    roadmaps.map(roadmap => (
                        <Link key={roadmap._id} to={`/roadmaps/${roadmap._id}`} className="group block bg-white border border-slate-100 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all">
                            <div className="flex gap-5">
                                <div className={`w-20 h-20 rounded-xl bg-${roadmap.themeColor || 'indigo'}-50 flex items-center justify-center shrink-0 overflow-hidden`}>
                                    {roadmap.coverImage ? (
                                        <img src={roadmap.coverImage} className="w-full h-full object-cover rounded-xl" alt="" />
                                    ) : (
                                        <Map className={`w-8 h-8 text-${roadmap.themeColor || 'indigo'}-400 opacity-50`} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <h3 className="font-bold text-lg text-slate-900 truncate group-hover:text-indigo-600 transition-colors tracking-tight">
                                        {roadmap.title}
                                    </h3>
                                    <p className="text-sm text-slate-500 line-clamp-1 mt-0.5">{roadmap.description || 'Hành trình học tập không giới hạn'}</p>
                                    <div className="flex items-center gap-4 mt-2.5 text-xs font-semibold text-slate-400">
                                        <div className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {roadmap.averageRating > 0 ? roadmap.averageRating : 'Mới'}</div>
                                        <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {roadmap.clonesCount || 0} Followers</div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Change Password Modal */}
            {showPasswordModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowPasswordModal(false)}></div>

                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
                            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2"><Key className="w-5 h-5 text-indigo-600" /> Đổi mật khẩu</h2>
                            <button onClick={() => setShowPasswordModal(false)} className="p-1.5 hover:bg-slate-200 rounded-full transition-colors text-slate-400"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleChangePassword} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu hiện tại</label>
                                <input id="currentPassword" type="password" required value={passwordForm.currentPassword} onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:bg-white focus:ring-indigo-600 outline-none" placeholder="Nhập mật khẩu cũ" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu mới</label>
                                <input id="newPassword" type="password" required minLength="6" value={passwordForm.newPassword} onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:bg-white focus:ring-indigo-600 outline-none" placeholder="Tối thiểu 6 ký tự" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Xác nhận mật khẩu mới</label>
                                <input id="confirmPassword" type="password" required minLength="6" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:bg-white focus:ring-indigo-600 outline-none" placeholder="Nhập lại mật khẩu mới" />
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button type="submit" className="w-full py-3.5 bg-indigo-600 text-white font-bold hover:bg-indigo-700 rounded-xl shadow-sm active:scale-[0.98] transition-all">Xác nhận thay đổi</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
