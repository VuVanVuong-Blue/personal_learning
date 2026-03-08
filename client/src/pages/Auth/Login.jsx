import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import { Mail, Lock, Loader2 } from 'lucide-react';
import AuthLayout from '../../components/Layout/AuthLayout';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, loginWithGoogle, user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const success = await login(email, password);
        setIsSubmitting(false);
        if (success) navigate('/');
    };

    return (
        <AuthLayout>
            <div className="text-left mb-10 border-b border-transparent">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Đăng nhập</h2>
                <p className="text-slate-500 mt-2 text-base">Chào mừng bạn quay trở lại nền tảng.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
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
                    <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-sm font-semibold text-slate-700">Mật khẩu</label>
                        <Link to="/forgot-password" className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
                            Quên mật khẩu?
                        </Link>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="password"
                            required
                            className="block w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all font-medium sm:text-sm"
                            placeholder="Mật khẩu của bạn"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex justify-center items-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            'Đăng nhập'
                        )}
                    </button>
                </div>
            </form>

            <div className="mt-8">
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase font-medium">
                        <span className="px-3 bg-white text-slate-400 tracking-wider">Hoặc tiếp tục với</span>
                    </div>
                </div>

                <div className="mt-6">
                    <GoogleLogin
                        onSuccess={loginWithGoogle}
                        onError={() => {
                            console.log('Login Failed');
                        }}
                        useOneTap
                        containerProps={{
                            style: { width: '100%', display: 'flex', justifyContent: 'center' }
                        }}
                    />
                </div>
            </div>

            <div className="mt-10 text-center text-sm font-medium">
                <span className="text-slate-500">Chưa có tài khoản? </span>
                <Link to="/register" className="text-indigo-600 hover:text-indigo-700 transition-colors font-bold ml-1">
                    Đăng ký ngay
                </Link>
            </div>
        </AuthLayout>
    );
};

export default Login;
