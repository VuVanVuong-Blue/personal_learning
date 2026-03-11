import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { User, Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../../components/Layout/AuthLayout';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, loginWithGoogle, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            alert('Mật khẩu nhập lại không khớp');
            return;
        }
        setIsSubmitting(true);
        const success = await register(username, email, password);
        setIsSubmitting(false);
        if (success) navigate('/');
    };

    return (
        <AuthLayout>
            <div className="text-left mb-8 border-b border-transparent">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Tạo tài khoản</h2>
                <p className="text-slate-500 mt-2 text-base">Bắt đầu hành trình học tập tối giản ngay hôm nay.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Tên hiển thị</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <User className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            required
                            className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium sm:text-sm"
                            placeholder="Tên của bạn"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="email"
                            required
                            className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium sm:text-sm"
                            placeholder="name@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mật khẩu</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type={showPassword ? "text" : "password"}
                            required
                            className="block w-full pl-11 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium sm:text-sm"
                            placeholder="Ít nhất 6 ký tự"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Nhập lại mật khẩu</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            required
                            className="block w-full pl-11 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium sm:text-sm"
                            placeholder="Nhập lại mật khẩu"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                        >
                            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div className="pt-3">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            'Đăng ký tài khoản'
                        )}
                    </button>
                </div>
            </form>

            <div className="mt-6">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase font-medium">
                        <span className="px-3 bg-white text-slate-400 tracking-wider">Hoặc tiếp tục với</span>
                    </div>
                </div>

                <div className="mt-5">
                    <GoogleLogin
                        onSuccess={loginWithGoogle}
                        onError={() => {
                            console.log('Login Failed');
                        }}
                        containerProps={{
                            style: { width: '100%', display: 'flex', justifyContent: 'center' }
                        }}
                    />
                </div>
            </div>

            <div className="mt-8 text-center text-sm font-medium">
                <span className="text-slate-500">Đã có tài khoản? </span>
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 transition-colors font-bold ml-1">
                    Đăng nhập
                </Link>
            </div>
        </AuthLayout>
    );
};

export default Register;
