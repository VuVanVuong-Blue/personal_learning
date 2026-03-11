import TopNavbar from './TopNavbar';
import { Toaster } from 'sonner';

const MainLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900 flex flex-col relative w-full overflow-x-hidden">
            <TopNavbar />

            <main className="flex-1 w-full flex flex-col items-center">
                {/* Dashboard-level container */}
                <div className="w-full flex-1">
                    {children}
                </div>
            </main>

            <Toaster position="top-right" richColors toastOptions={{
                className: 'rounded-xl border border-slate-200 shadow-xl font-sans text-sm'
            }} />
        </div>
    );
};

export default MainLayout;
