import { LandingNavbar } from '@/components/LandingNavbar';
import { Footer } from '@/components/Footer';
import { Target, Users, Zap } from 'lucide-react';

export default function About({ onLogin, onRegister }: { onLogin?: () => void, onRegister?: () => void }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-500">
            <LandingNavbar onLogin={onLogin} onRegister={onRegister} />

            <main className="max-w-7xl mx-auto px-6 py-40">
                <div className="text-center mb-32 max-w-3xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-8 text-slate-900 dark:text-white">Nuestra Misión</h1>
                    <p className="text-2xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        Democratizar el acceso a herramientas de gestión empresarial de clase mundial para cada PYME y emprendedor en Latinoamérica.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 mb-40">
                    <div className="bg-white dark:bg-white/5 p-10 rounded-3xl border border-slate-200 dark:border-white/10 hover:border-violet-500/50 transition-all duration-500 group">
                        <div className="w-16 h-16 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center text-violet-600 dark:text-violet-400 mb-8 group-hover:scale-110 transition-transform">
                            <Zap className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black mb-4 text-slate-900 dark:text-white">Simplicidad Radical</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            Creemos que el software empresarial no debe ser complicado. Diseñamos para la claridad y la eficiencia.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-white/5 p-10 rounded-3xl border border-slate-200 dark:border-white/10 hover:border-blue-500/50 transition-all duration-500 group">
                        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 mb-8 group-hover:scale-110 transition-transform">
                            <Target className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black mb-4 text-slate-900 dark:text-white">Enfoque en Resultados</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            Ayudamos a nuestros usuarios a vender más y gestionar mejor. Medimos nuestro éxito por el tuyo.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-white/5 p-10 rounded-3xl border border-slate-200 dark:border-white/10 hover:border-emerald-500/50 transition-all duration-500 group">
                        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-8 group-hover:scale-110 transition-transform">
                            <Users className="w-8 h-8" />
                        </div>
                        <h3 className="text-2xl font-black mb-4 text-slate-900 dark:text-white">Comunidad Primero</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            Construimos junto a nuestros usuarios. Escuchamos, iteramos y mejoramos cada día basándonos en feedback real.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
