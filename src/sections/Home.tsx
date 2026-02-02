import React from 'react';
import PricingSection from '@/components/ui/pricing-section';

interface HomeProps {
    onLogin: () => void;
    onRegister: () => void;
    onTerms: () => void;
}

export default function Home({ onLogin, onRegister, onTerms }: HomeProps) {
    return (
        <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-sans selection:bg-primary/30 min-h-screen transition-colors duration-300">
            {/* Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="glow-orb bg-indigo-600 top-[-10%] left-[-10%] animate-pulse-slow"></div>
                <div className="glow-orb bg-purple-600 bottom-[-10%] right-[-10%] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 px-6 py-4">
                <div className="max-w-7xl mx-auto glass bg-white/70 dark:bg-slate-900/70 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <span className="material-symbols-outlined">rocket_launch</span>
                        </div>
                        <span className="text-xl font-extrabold font-display tracking-tight text-slate-900 dark:text-white">MiniSaaS</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 font-medium text-sm text-slate-600 dark:text-slate-300">
                        <a className="hover:text-primary transition-colors hover:cursor-pointer" href="#features">Funcionalidades</a>
                        <a className="hover:text-primary transition-colors hover:cursor-pointer" href="#pricing">Precios</a>
                        <a className="hover:text-primary transition-colors hover:cursor-pointer" href="#solutions">Soluciones</a>
                        <a className="hover:text-primary transition-colors hover:cursor-pointer" href="#resources">Recursos</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onLogin}
                            className="hidden sm:block text-sm font-semibold hover:text-primary transition-colors"
                        >
                            Iniciar sesión
                        </button>
                        <button
                            onClick={onRegister}
                            className="bg-primary hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-primary/20 transition-all transform hover:-translate-y-0.5 active:scale-95"
                        >
                            Empezar ahora
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <div className="relative z-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            Ahora con Creación de Tiendas con IA
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-extrabold font-display tracking-tight leading-[1.1] mb-6">
                            Impulsa tu Negocio con la plataforma <span className="gradient-text">Definitiva</span> de E-commerce
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-xl leading-relaxed">
                            El espacio de trabajo todo en uno para construir, gestionar y escalar tu tienda online. Obtén analíticas potentes, gestión de inventario y pagos globales en un solo lugar.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center gap-4 mb-10">
                            <button
                                onClick={onRegister}
                                className="w-full sm:w-auto bg-primary hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-primary/30"
                            >
                                Prueba Gratuita
                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                            </button>
                            <button className="w-full sm:w-auto glass bg-white/10 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-white/20">
                                <span className="material-symbols-outlined text-indigo-500">play_circle</span>
                                Ver Demo
                            </button>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-3">
                                <img alt="User" className="w-10 h-10 rounded-full border-2 border-background-light dark:border-background-dark shadow-md" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&auto=format&fit=crop" />
                                <img alt="User" className="w-10 h-10 rounded-full border-2 border-background-light dark:border-background-dark shadow-md" src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=256&h=256&auto=format&fit=crop" />
                                <img alt="User" className="w-10 h-10 rounded-full border-2 border-background-light dark:border-background-dark shadow-md" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop" />
                                <div className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-background-light dark:border-background-dark shadow-md flex items-center justify-center text-[10px] text-white font-bold">
                                    +1k
                                </div>
                            </div>
                            <div className="text-sm">
                                <div className="flex gap-0.5 text-yellow-400">
                                    <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                                    <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                                    <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                                    <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                                    <span className="material-symbols-outlined text-[16px] fill-current">star</span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Con la confianza de +10,000 negocios</p>
                            </div>
                        </div>
                    </div>
                    <div className="relative lg:block animate-float">
                        <div className="glass bg-white/80 dark:bg-slate-800/40 border border-white/20 dark:border-slate-700/50 rounded-3xl shadow-2xl p-6 relative overflow-hidden">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="font-bold text-lg">Rendimiento de Ventas</h3>
                                    <p className="text-xs text-slate-500">Resumen últimos 30 días</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[18px]">search</span>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[18px]">notifications</span>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">
                                    <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold mb-1">Ingresos Totales</p>
                                    <h4 className="text-2xl font-black">$84,232</h4>
                                    <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                                        <span className="material-symbols-outlined text-[14px]">trending_up</span>
                                        +12.5%
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                                    <p className="text-xs text-purple-600 dark:text-purple-400 font-bold mb-1">Pedidos Activos</p>
                                    <h4 className="text-2xl font-black">1,429</h4>
                                    <div className="mt-2 flex items-center gap-1 text-[10px] text-emerald-500 font-bold">
                                        <span className="material-symbols-outlined text-[14px]">trending_up</span>
                                        +4.2%
                                    </div>
                                </div>
                            </div>
                            <div className="relative h-48 w-full bg-slate-100/50 dark:bg-slate-900/50 rounded-2xl flex items-end justify-between px-6 pb-4">
                                <div className="w-6 bg-indigo-500/40 rounded-t-lg h-[40%]"></div>
                                <div className="w-6 bg-indigo-500/60 rounded-t-lg h-[60%]"></div>
                                <div className="w-6 bg-indigo-500/40 rounded-t-lg h-[45%]"></div>
                                <div className="w-6 bg-indigo-500/80 rounded-t-lg h-[80%]"></div>
                                <div className="w-6 bg-indigo-500/40 rounded-t-lg h-[55%]"></div>
                                <div className="w-6 bg-indigo-600 rounded-t-lg h-[100%]"></div>
                                <div className="w-6 bg-indigo-500/50 rounded-t-lg h-[70%]"></div>
                            </div>
                            <div className="absolute -bottom-4 -left-4 glass bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl shadow-xl flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-500 flex items-center justify-center">
                                    <span className="material-symbols-outlined">payments</span>
                                </div>
                                <div>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase">Pago recibido</p>
                                    <p className="font-bold">+$12,450.00</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Trust Section */}
            <section className="py-12 border-y border-slate-200/50 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-center text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-10">Líderes de la industria confían en nosotros</p>
                    <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        <span className="text-2xl font-black font-display text-slate-800 dark:text-white">QUANTUM</span>
                        <span className="text-2xl font-black font-display text-slate-800 dark:text-white">CYBER</span>
                        <span className="text-2xl font-black font-display text-slate-800 dark:text-white">VERTEX</span>
                        <span className="text-2xl font-black font-display text-slate-800 dark:text-white">NEXUS</span>
                        <span className="text-2xl font-black font-display text-slate-800 dark:text-white">APEX</span>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-24 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-extrabold font-display mb-4">Funciones Potentes para el Retail Moderno</h2>
                        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Todo lo que necesitas para operar una tienda online de alto rendimiento, impulsada por tecnología de vanguardia.</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="group p-8 rounded-3xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:border-indigo-500/50 transition-all hover:shadow-2xl hover:shadow-indigo-500/10">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[28px]">bolt</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Configuración Ultra Rápida</h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">Empieza a vender en minutos. Nuestro asistente intuitivo y constructor drag-and-drop lo hace fácil.</p>
                            <a className="text-primary font-bold inline-flex items-center gap-2 group/link" href="#">
                                Saber más
                                <span className="material-symbols-outlined text-[18px] group-hover/link:translate-x-1 transition-transform">chevron_right</span>
                            </a>
                        </div>
                        <div className="group p-8 rounded-3xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:border-purple-500/50 transition-all hover:shadow-2xl hover:shadow-purple-500/10">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500 to-purple-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-purple-500/20 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[28px]">psychology</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Insights Impulsados por IA</h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">Recomendaciones inteligentes para optimizar tu embudo de ventas y retención de clientes.</p>
                            <a className="text-primary font-bold inline-flex items-center gap-2 group/link" href="#">
                                Saber más
                                <span className="material-symbols-outlined text-[18px] group-hover/link:translate-x-1 transition-transform">chevron_right</span>
                            </a>
                        </div>
                        <div className="group p-8 rounded-3xl bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-500/10">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-[28px]">public</span>
                            </div>
                            <h3 className="text-xl font-bold mb-3">Escalabilidad Global</h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">Vende en cualquier lugar con soporte multi-moneda, CDN global y cumplimiento fiscal automatizado.</p>
                            <a className="text-primary font-bold inline-flex items-center gap-2 group/link" href="#">
                                Saber más
                                <span className="material-symbols-outlined text-[18px] group-hover/link:translate-x-1 transition-transform">chevron_right</span>
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing">
                <PricingSection />
            </section>

            {/* CTA Section */}
            <section className="py-24 px-6">
                <div className="max-w-7xl mx-auto rounded-[3rem] bg-gradient-to-tr from-indigo-900 via-indigo-800 to-purple-900 p-12 lg:p-20 relative overflow-hidden text-center">
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.4),transparent)]"></div>
                        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_50%,rgba(192,132,252,0.4),transparent)]"></div>
                    </div>
                    <h2 className="text-4xl lg:text-5xl font-extrabold font-display text-white mb-6 relative z-10">¿Listo para transformar tu negocio?</h2>
                    <p className="text-indigo-100 text-lg mb-10 max-w-2xl mx-auto relative z-10 opacity-90">Únete a miles de comerciantes que están haciendo crecer su marca con MiniSaaS. No requiere tarjeta para empezar.</p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
                        <button
                            onClick={onRegister}
                            className="w-full sm:w-auto bg-white text-indigo-900 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-50 transition-colors shadow-2xl"
                        >
                            Empezar Ahora
                        </button>
                        <button className="w-full sm:w-auto bg-white/10 text-white border border-white/20 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white/20 transition-colors">
                            Hablar con Ventas
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-slate-200 dark:border-slate-800 px-6">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-[18px]">rocket_launch</span>
                        </div>
                        <span className="text-lg font-bold font-display text-slate-900 dark:text-white">MiniSaaS</span>
                    </div>
                    <div className="flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <a className="hover:text-primary cursor-pointer" onClick={(e) => { e.preventDefault(); }} href="#">Privacidad</a>
                        <button className="hover:text-primary cursor-pointer" onClick={onTerms}>Términos</button>
                        <a className="hover:text-primary cursor-pointer" onClick={(e) => { e.preventDefault(); }} href="#">Estado</a>
                        <a className="hover:text-primary cursor-pointer" onClick={(e) => { e.preventDefault(); }} href="#">Soporte</a>
                    </div>
                    <p className="text-sm text-slate-400">© 2024 MiniSaaS Inc. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}
