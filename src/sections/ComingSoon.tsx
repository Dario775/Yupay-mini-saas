import { LandingNavbar } from '@/components/LandingNavbar';
import { Footer } from '@/components/Footer';
import { Construction } from 'lucide-react';

interface ComingSoonProps {
    title: string;
    description: string;
    onLogin?: () => void;
    onRegister?: () => void;
}

export default function ComingSoon({ title, description, onLogin, onRegister }: ComingSoonProps) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-500">
            <LandingNavbar onLogin={onLogin} onRegister={onRegister} />

            <main className="max-w-7xl mx-auto px-6 py-40 flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="w-24 h-24 bg-violet-100 dark:bg-violet-900/30 rounded-full flex items-center justify-center text-violet-600 dark:text-violet-400 mb-8 animate-pulse">
                    <Construction className="w-12 h-12" />
                </div>
                <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-slate-900 dark:text-white">{title}</h1>
                <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium mb-12">
                    {description}
                </p>
                <div className="flex gap-4">
                    <button onClick={() => window.history.back()} className="px-8 py-4 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 font-bold transition-all">
                        Volver
                    </button>
                    <a href="/" className="px-8 py-4 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold transition-all shadow-lg shadow-violet-500/20">
                        Ir al Inicio
                    </a>
                </div>
            </main>

            <Footer />
        </div>
    );
}
