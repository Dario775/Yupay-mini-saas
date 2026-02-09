import { motion } from 'motion/react';
import { ThemeToggle } from '@/components/ThemeToggle';

interface LandingNavbarProps {
    onLogin?: () => void;
    onRegister?: () => void;
}

export function LandingNavbar({ onLogin, onRegister }: LandingNavbarProps) {
    const navItems = [
        { label: 'Cómo Funciona', href: '/features' },
        { label: 'Precios', href: '/pricing' },
        { label: 'Integraciones', href: '/integrations' }
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="fixed top-0 w-full z-50 px-6 py-6 font-sans"
        >
            <div className="max-w-7xl mx-auto backdrop-blur-xl bg-white/70 dark:bg-[#020617]/70 border border-slate-200/50 dark:border-white/10 rounded-2xl px-6 py-4 flex items-center justify-between shadow-xl shadow-slate-200/20 dark:shadow-black/20 transition-all duration-500">
                <a href="/" className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-violet-600 dark:bg-white text-white dark:text-indigo-950 rounded-xl flex items-center justify-center font-black italic text-xl shadow-lg shadow-violet-500/30">Y</div>
                    <span className="text-xl font-black tracking-tighter text-slate-900 dark:text-white">YUPAY</span>
                </a>

                <div className="hidden md:flex items-center gap-8">
                    {navItems.map((item) => (
                        <a key={item.label} href={item.href} className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-white transition-colors relative group">
                            {item.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-violet-600 dark:bg-white transition-all group-hover:w-full" />
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-6">
                    <ThemeToggle />
                    <button onClick={onLogin} className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white hover:text-violet-600 transition-colors hidden sm:block">
                        Ingresar
                    </button>
                    <button
                        onClick={onRegister}
                        className="bg-slate-900 dark:bg-white text-white dark:text-indigo-950 px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-slate-900/20 dark:shadow-white/10"
                    >
                        Comenzar Ya
                    </button>
                </div>
            </div>
        </motion.nav>
    );
}
