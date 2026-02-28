import { Outlet, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

export default function PublicLayout() {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <span className="font-bold text-xl tracking-tight text-slate-900">Rakshak AI</span>
                        </div>
                        <nav className="flex gap-4">
                            <Link to="/public" className="text-sm font-medium text-slate-600 hover:text-slate-900">Public Shield</Link>
                            <Link to="/govt" className="text-sm font-medium text-slate-600 hover:text-slate-900">Govt</Link>
                            <Link to="/enterprise" className="text-sm font-medium text-slate-600 hover:text-slate-900">Enterprise</Link>
                        </nav>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <Outlet />
            </main>
        </div>
    );
}
