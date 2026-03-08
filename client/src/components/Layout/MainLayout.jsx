import Sidebar from './Sidebar';
import { Toaster } from 'sonner';

const MainLayout = ({ children }) => {
    return (
        <div className="flex min-h-screen bg-[#FAFAFA] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 relative">
            {/* The Left Vertical Sidebar */}
            <Sidebar />

            {/* The Right Content "Tube" */}
            <main className="flex-1 w-full flex flex-col items-center">
                <div className="w-full max-w-[1280px] px-8 py-10 flex-1">
                    {children}
                </div>
            </main>

            <Toaster position="top-right" richColors toastOptions={{
                className: 'rounded-xl border border-slate-200 shadow-xl font-sans'
            }} />
        </div>
    );
};

export default MainLayout;
