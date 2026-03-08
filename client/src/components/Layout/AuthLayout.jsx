import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children }) => {
    return (
        <div className="min-h-screen flex bg-white font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
            {/* Left Side - Brand & Presentation (Hidden on mobile) */}
            <div className="hidden lg:flex lg:w-1/2 bg-indigo-600 relative overflow-hidden flex-col justify-between p-12 lg:p-16">
                {/* Background Pattern / Glow */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
                    <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-white blur-3xl" />
                    <div className="absolute bottom-[10%] -right-[20%] w-[60%] h-[60%] rounded-full bg-indigo-400 blur-3xl" />
                </div>

                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-2 font-extrabold text-2xl text-white tracking-tight hover:opacity-90 transition-opacity w-fit">
                        <BookOpen className="w-8 h-8" strokeWidth={2.5} />
                        <span>LearningPath</span>
                    </Link>
                </div>

                <div className="relative z-10 max-w-xl">
                    <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight mb-6">
                        Kiến tạo con đường <br />học tập của riêng bạn.
                    </h1>
                    <p className="text-indigo-100 text-lg leading-relaxed">
                        Nền tảng học tập cá nhân hóa được hỗ trợ bởi Trí Tuệ Nhân Tạo. Quản lý lộ trình, theo dõi tiến độ và duy trì thói quen học tập mỗi ngày một cách tối giản và hiệu quả nhất.
                    </p>
                </div>

                <div className="relative z-10 flex items-center gap-4 text-indigo-200 text-sm font-medium">
                    <span>© {new Date().getFullYear()} LearningPath</span>
                    <span className="w-1 h-1 rounded-full bg-indigo-400"></span>
                    <span>Minimalist Design</span>
                </div>
            </div>

            {/* Right Side - Auth Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative bg-[#FAFAFA] lg:bg-white">
                {/* Mobile Logo */}
                <Link
                    to="/"
                    className="lg:hidden absolute top-8 left-6 sm:left-12 flex items-center gap-2 font-extrabold text-xl text-indigo-600 tracking-tight"
                >
                    <BookOpen className="w-6 h-6" strokeWidth={2.5} />
                    <span>LearningPath</span>
                </Link>

                <div className="max-w-[420px] w-full mt-12 lg:mt-0">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
