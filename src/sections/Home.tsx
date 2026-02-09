import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
    ArrowRight, PlayCircle, Star, ShieldCheck,
    Zap, Sparkles, ShoppingBag, Globe,
    ArrowUpRight, BarChart3, Clock, Layout,
    MessageCircle, Heart, CheckCircle2,
    Twitter, Linkedin, Instagram, Github,
    Mail, MapPin, ExternalLink, ChevronRight
} from 'lucide-react';
import PricingSection from '@/components/ui/pricing-section';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LandingNavbar } from '@/components/LandingNavbar';
import { Footer } from '@/components/Footer';

interface HomeProps {
    onLogin: () => void;
    onRegister: () => void;
}

export default function Home({ onLogin, onRegister }: HomeProps) {
    const fadeIn = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.6 }
    };

    const staggerContainer = {
        animate: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans selection:bg-violet-500/30 min-h-screen selection:text-white overflow-x-hidden transition-colors duration-500">
            {/* Clean Professional Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-slate-50 dark:bg-[#020617]" />
                <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-violet-100/40 dark:bg-violet-900/10 blur-[100px] rounded-full" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-100/40 dark:bg-blue-900/10 blur-[100px] rounded-full" />
            </div>

            {/* Premium Navigation */}
            <LandingNavbar onLogin={onLogin} onRegister={onRegister} />

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 px-6 overflow-visible z-10">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial="initial"
                        animate="animate"
                        variants={staggerContainer}
                        className="relative z-10"
                    >
                        <motion.div
                            variants={fadeIn}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-50 dark:bg-violet-500/10 border border-violet-100 dark:border-violet-500/20 text-violet-600 dark:text-violet-300 text-xs font-bold uppercase tracking-wide mb-8"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500"></span>
                            </span>
                            Diseñado para Comercios Locales y Vecinos
                        </motion.div>

                        <motion.h1
                            variants={fadeIn}
                            className="text-5xl lg:text-7xl font-bold tracking-tight leading-[1.1] mb-6 text-slate-900 dark:text-white"
                        >
                            Conecta tu negocio <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">con tu comunidad.</span>
                        </motion.h1>

                        <motion.p
                            variants={fadeIn}
                            className="text-lg text-slate-600 dark:text-slate-300 mb-8 max-w-lg leading-relaxed"
                        >
                            Tu vitrina digital en el barrio. Hazte visible para tus vecinos, recibe pedidos por WhatsApp y gestiona tu stock, todo desde una plataforma <strong>simple y comunitaria</strong>.
                        </motion.p>

                        <motion.div
                            variants={fadeIn}
                            className="flex flex-col sm:flex-row items-center gap-6 mb-12"
                        >
                            <button
                                onClick={onRegister}
                                className="group w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/20 hover:-translate-y-0.5"
                            >
                                Crear Cuenta Gratis
                                <ArrowRight className="h-4 w-4" />
                            </button>
                            <button className="w-full sm:w-auto bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-slate-50 dark:hover:bg-white/10 shadow-sm">
                                <PlayCircle className="h-4 w-4 text-slate-400" />
                                Ver Demo
                            </button>
                        </motion.div>

                        <motion.div variants={fadeIn} className="flex items-center gap-6">
                            <div className="flex -space-x-4">
                                {[1, 2, 3].map(i => (
                                    <img
                                        key={i}
                                        alt="User"
                                        className="w-12 h-12 rounded-2xl border-4 border-white dark:border-[#020617] shadow-2xl object-cover"
                                        src={`https://images.unsplash.com/photo-${1500000000000 + i * 100000}?q=80&w=256&h=256&auto=format&fit=crop`}
                                    />
                                ))}
                                <div className="w-12 h-12 rounded-2xl bg-violet-600 border-4 border-white dark:border-[#020617] shadow-2xl flex items-center justify-center text-xs text-white font-black">
                                    +12k
                                </div>
                            </div>
                            <div className="space-y-1">
                                <div className="flex gap-1 text-amber-500">
                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-4 w-4 fill-current" />)}
                                </div>
                                <p className="text-slate-400 dark:text-slate-500 text-xs font-black uppercase tracking-widest">Confianza nivel elite</p>
                            </div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, rotateY: -20 }}
                        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="relative perspective-1000 hidden lg:block"
                    >
                        <div className="bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[3rem] shadow-[0_50px_100px_rgba(0,0,0,0.1)] dark:shadow-[0_50px_100px_rgba(0,0,0,0.5)] p-8 relative overflow-hidden backdrop-blur-3xl group transition-all duration-500">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 dark:from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <div className="flex items-center justify-between mb-10">
                                <div className="space-y-1">
                                    <h3 className="font-black text-xl tracking-tight text-slate-900 dark:text-white">Intelligence Dashboard</h3>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Live Analytics Engine</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-white transition-colors">
                                        <BarChart3 className="h-5 w-5" />
                                    </div>
                                    <div className="w-10 h-10 rounded-2xl bg-violet-100 dark:bg-violet-500/20 border border-violet-200 dark:border-violet-500/30 text-violet-600 dark:text-violet-400 flex items-center justify-center shadow-lg">
                                        <Sparkles className="h-5 w-5" />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 mb-10">
                                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 relative group/card shadow-sm">
                                    <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mb-3">Ventas Netas</p>
                                    <h4 className="text-3xl font-black text-slate-900 dark:text-white">$142,500</h4>
                                    <div className="mt-4 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-black px-2 py-1 bg-emerald-500/10 w-fit rounded-lg">
                                        <ArrowUpRight className="h-3 w-3" />
                                        +28.4%
                                    </div>
                                </div>
                                <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 relative shadow-sm">
                                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest mb-3">Retención</p>
                                    <h4 className="text-3xl font-black text-slate-900 dark:text-white">94.8%</h4>
                                    <div className="mt-4 flex items-center gap-1.5 text-[10px] text-violet-600 dark:text-violet-400 font-black px-2 py-1 bg-violet-500/10 w-fit rounded-lg">
                                        <Heart className="h-3 w-3 fill-current" />
                                        High Peak
                                    </div>
                                </div>
                            </div>

                            <div className="relative h-56 w-full bg-slate-100/50 dark:bg-indigo-950/30 rounded-[2rem] flex items-end justify-between px-8 pb-6 border border-slate-200 dark:border-white/5 overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.1),transparent)]" />
                                {[40, 65, 45, 80, 55, 100, 75].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 0 }}
                                        animate={{ height: `${h}%` }}
                                        transition={{ delay: 0.5 + i * 0.1, duration: 1, ease: "circOut" }}
                                        className={`w-7 rounded-t-xl shadow-2xl ${i === 5 ? 'bg-gradient-to-t from-violet-600 to-indigo-600' : 'bg-slate-300 dark:bg-white/10'}`}
                                    />
                                ))}
                            </div>

                            <motion.div
                                initial={{ x: -50, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 1 }}
                                className="absolute bottom-10 -left-12 bg-white/95 dark:bg-[#020617]/90 border border-slate-200 dark:border-white/10 p-5 rounded-[2rem] shadow-2xl flex items-center gap-4 backdrop-blur-3xl ring-1 ring-white/10"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                                    <ShoppingBag className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Auto-Fulfillment</p>
                                    <p className="font-bold text-slate-900 dark:text-white tracking-tight">Nueva Orden #8241</p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Client Categories (SaaS Friendly) */}
            <section className="py-16 border-y border-slate-100 dark:border-white/5 bg-white dark:bg-white/[0.02]">
                <div className="max-w-7xl mx-auto px-6 text-center">
                    <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-10">Confían en nosotros cientos de negocios</p>
                    <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                        {/* Replace fake brands with business types to be relatable */}
                        {['Moda & Retail', 'Gastronomía', 'Servicios', 'Tecnología', 'Artesanía'].map(category => (
                            <span key={category} className="text-lg md:text-xl font-bold text-slate-400 dark:text-slate-500 cursor-default px-4 py-2 bg-slate-50 dark:bg-white/5 rounded-lg border border-slate-100 dark:border-white/5">{category}</span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 px-6 relative overflow-hidden bg-slate-50/50 dark:bg-transparent">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-200/20 dark:bg-violet-600/5 blur-[150px] rounded-full pointer-events-none" />

                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-20 space-y-4">
                        <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">Tu tienda en el centro de la comunidad</h2>
                        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
                            Olvídate de buscar clientes lejos. Yupay te conecta automáticamente con las personas cerca de ti que buscan lo que ofreces. <span className="font-semibold text-violet-600">Vende local, crece real.</span>
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: 'Gestión Simple',
                                desc: 'Controla tu inventario y pedidos desde un solo lugar. Sin manuales complicados.',
                                icon: Zap,
                                color: 'from-violet-500 to-indigo-600'
                            },
                            {
                                title: 'Reportes Claros',
                                desc: 'Entiende qué estás vendiendo y cuánto estás ganando con gráficos fáciles de leer.',
                                icon: BarChart3,
                                color: 'from-blue-500 to-indigo-600'
                            },
                            {
                                title: 'Visibilidad Local',
                                desc: 'Aparece en el mapa de tu barrio. Tus vecinos verán tus productos cuando busquen cerca.',
                                icon: Globe,
                                color: 'from-emerald-500 to-teal-600'
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="group p-10 rounded-[2.5rem] bg-white dark:bg-white/[0.03] border border-slate-100 dark:border-white/5 hover:border-violet-300 dark:hover:border-white/10 transition-all hover:bg-slate-50 dark:hover:bg-white/[0.05] relative overflow-hidden shadow-sm dark:shadow-none"
                            >
                                <div className={`w-16 h-16 rounded-[1.5rem] bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-8 shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                                    <feature.icon className="h-8 w-8" />
                                </div>
                                <h3 className="text-2xl font-black mb-4 tracking-tight text-slate-900 dark:text-white">{feature.title}</h3>
                                <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed mb-8">{feature.desc}</p>
                                <a className="text-xs font-black uppercase tracking-widest inline-flex items-center gap-2 group/link text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors" href="#">
                                    Explorar Tech Stack
                                    <ArrowUpRight className="h-4 w-4 group-hover/link:-translate-y-1 group-hover/link:translate-x-1 transition-transform" />
                                </a>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works / Ecosystem Section */}
            <section className="py-32 px-6 bg-white dark:bg-[#020617] relative overflow-hidden transition-colors duration-500">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="grid lg:grid-cols-2 gap-20 items-center mb-32">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="space-y-8"
                        >
                            <h2 className="text-4xl lg:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.1]">
                                Únete al Mercado Local <br />
                                <span className="text-violet-600">Fácil y GRATIS.</span>
                            </h2>
                            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-lg">
                                Hemos destilado años de complejidad e-commerce en un flujo de trabajo <strong>super intuitivo</strong> y potente.
                            </p>

                            <div className="space-y-6">
                                {[
                                    { step: '01', title: 'Crea tu Perfil', desc: 'Regístrate y ubica tu negocio en el mapa. Tus vecinos recibirán una alerta de "Nuevo en el barrio".' },
                                    { step: '02', title: 'Publica Productos', desc: 'Sube fotos desde tu celular. Se mostrarán automáticamente a los usuarios cercanos.' },
                                    { step: '03', title: 'Vende y Fideliza', desc: 'Recibe pedidos directos y crea una comunidad de clientes leales en tu zona.' }
                                ].map((item, i) => (
                                    <div key={i} className="flex gap-6 group">
                                        <span className="text-4xl font-black text-violet-100 dark:text-violet-900/40 group-hover:text-violet-600 transition-colors duration-300">{item.step}</span>
                                        <div className="space-y-1">
                                            <h4 className="font-black text-lg text-slate-800 dark:text-white tracking-tight">{item.title}</h4>
                                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{item.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/20 to-indigo-600/20 blur-3xl rounded-full" />
                            <div className="relative bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[3rem] p-4 shadow-2xl overflow-hidden aspect-square flex items-center justify-center">
                                <div className="grid grid-cols-2 gap-4 w-full h-full p-6">
                                    <div className="col-span-2 bg-white dark:bg-white/5 rounded-3xl border border-slate-100 dark:border-white/5 p-6 flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                                                <CheckCircle2 className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estado de Operación</p>
                                                <p className="font-bold text-slate-900 dark:text-white">Pagos Procesados: 100%</p>
                                            </div>
                                        </div>
                                        <div className="h-2 w-24 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                            <div className="h-full w-full bg-emerald-500" />
                                        </div>
                                    </div>
                                    <div className="bg-violet-600 rounded-3xl p-6 flex flex-col justify-between text-white shadow-xl shadow-violet-500/30">
                                        <ShoppingBag className="h-8 w-8 opacity-50" />
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest opacity-70">Ventas Hoy</p>
                                            <p className="text-2xl font-black italic">+24.8%</p>
                                        </div>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-white/5 flex flex-col justify-between shadow-sm">
                                        <Globe className="h-8 w-8 text-blue-500" />
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Alcance</p>
                                            <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Barrio</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Buy vs Sell Dynamics */}
                    <div className="grid md:grid-cols-2 gap-8 relative">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-slate-50 dark:bg-slate-900/50 rounded-[3rem] p-12 border border-slate-200 dark:border-white/5"
                        >
                            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 mb-8">
                                <Layout className="h-7 w-7" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-6">Para el Comprador</h3>
                            <ul className="space-y-4">
                                {[
                                    'Descubre productos únicos cerca de ti.',
                                    'Apoya a los comercios de tu barrio.',
                                    'Recibe tus pedidos en minutos, no días.',
                                    'Acceso a ofertas exclusivas para vecinos.'
                                ].map((benefit, i) => (
                                    <li key={i} className="flex gap-4 items-start">
                                        <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                                        <span className="text-slate-600 dark:text-slate-400 font-medium">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="bg-violet-600 rounded-[3rem] p-12 text-white shadow-2xl shadow-violet-500/20"
                        >
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-8">
                                <Zap className="h-7 w-7" />
                            </div>
                            <h3 className="text-3xl font-black mb-6">Para el Vendedor</h3>
                            <ul className="space-y-4">
                                {[
                                    'Automatización de procesos de venta y facturación.',
                                    'Gestión de inventario con alertas de stock inteligente.',
                                    'Herramientas de marketing y fidelización por IA.',
                                    'Dashboard de analíticas para decisiones basadas en datos.'
                                ].map((benefit, i) => (
                                    <li key={i} className="flex gap-4 items-start">
                                        <CheckCircle2 className="h-5 w-5 text-violet-200 shrink-0 mt-0.5" />
                                        <span className="text-violet-50 font-medium">{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>

                    {/* Fast Benefits Row */}
                    <div className="mt-24 grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: ShieldCheck, title: 'Seguridad Total', desc: 'Protección nivel bancario en cada pago.' },
                            { icon: Clock, title: 'Soporte 24/7', desc: 'Estamos contigo en cada paso del camino.' },
                            { icon: Sparkles, title: 'IA Generativa', desc: 'Crea contenido para tus productos en segundos.' },
                            { icon: MessageCircle, title: 'Multicanal', desc: 'WhatsApp, Web y App móvil sincronizados.' }
                        ].map((item, i) => (
                            <div key={i} className="text-center space-y-3">
                                <div className="mx-auto w-12 h-12 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-slate-500 dark:text-slate-400">
                                    <item.icon className="h-6 w-6" />
                                </div>
                                <h5 className="font-black text-sm text-slate-800 dark:text-white tracking-tight">{item.title}</h5>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-32 bg-white dark:bg-white/[0.01] border-y border-slate-100 dark:border-white/5 relative">
                <div className="absolute inset-0 bg-violet-600/[0.02] dark:bg-violet-600/5 opacity-50" />
                <PricingSection />
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    className="max-w-7xl mx-auto rounded-[4rem] bg-gradient-to-br from-indigo-50 via-slate-50 to-violet-50 dark:from-indigo-950 dark:via-slate-950 dark:to-violet-950 p-16 lg:p-24 relative overflow-hidden text-center border border-slate-200 dark:border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.05)] dark:shadow-[0_50px_100px_rgba(0,0,0,0.5)] transition-all duration-500"
                >
                    <div className="absolute inset-0 opacity-40 pointer-events-none">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,rgba(139,92,246,0.1),transparent)] dark:bg-[radial-gradient(circle_at_20%_30%,rgba(139,92,246,0.3),transparent)]" />
                        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,rgba(79,70,229,0.1),transparent)] dark:bg-[radial-gradient(circle_at_80%_70%,rgba(79,70,229,0.3),transparent)]" />
                    </div>

                    <div className="relative z-10 space-y-8">
                        <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">Empieza a vender hoy mismo.</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
                            Únete a cientos de emprendedores que ya simplificaron su negocio con Yupay. Sin tarjetas de crédito, sin complicaciones.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={onRegister}
                                className="w-full sm:w-auto bg-violet-600 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/20"
                            >
                                Crear Cuenta Gratis
                            </button>
                            <button className="w-full sm:w-auto bg-white dark:bg-white/5 text-slate-700 dark:text-white border border-slate-200 dark:border-white/10 px-8 py-4 rounded-xl font-bold text-base hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm">
                                Hablar con Ventas
                            </button>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* Premium Footer */}
            <Footer />
        </div>
    );
}
