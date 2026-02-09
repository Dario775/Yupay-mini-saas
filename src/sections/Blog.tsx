import { LandingNavbar } from '@/components/LandingNavbar';
import { Footer } from '@/components/Footer';
import { ArrowRight, Clock, Tag, User, Search, ChevronRight } from 'lucide-react';

const CATEGORIES = ['Todos', 'Ventas', 'Gestión', 'Tutoriales', 'Historias de Éxito'];

const POSTS = [
    {
        id: 1,
        slug: '5-errores-inventario',
        title: '5 Errores comunes al manejar tu inventario (y cómo evitarlos)',
        excerpt: 'Descubre por qué pierdes dinero con stock detenido y aprende las mejores prácticas para mantener tu almacén optimizado sin dolores de cabeza.',
        category: 'Gestión',
        author: 'Sofía Martínez',
        role: 'Esp. en Logística',
        date: '8 Feb, 2026',
        readTime: '5 min',
        imageGradient: 'from-violet-500 to-purple-600'
    },
    {
        id: 2,
        slug: 'vender-whatsapp',
        title: 'Guía definitiva para vender por WhatsApp en 2026',
        excerpt: 'WhatsApp no es solo para chatear. Convierte tus conversaciones en ventas reales con estas estrategias de cierre y herramientas de automatización.',
        category: 'Ventas',
        author: 'Carlos Ruiz',
        role: 'Growth Marketing',
        date: '5 Feb, 2026',
        readTime: '8 min',
        imageGradient: 'from-blue-500 to-cyan-600'
    },
    {
        id: 3,
        slug: 'historia-maria-artesana',
        title: 'De la feria local a vender en todo el país: La historia de María',
        excerpt: 'Cómo una artesana de cerámica duplicó sus ingresos digitalizando su catálogo y simplificando sus cobros con Yupay.',
        category: 'Historias de Éxito',
        author: 'Equipo Yupay',
        role: 'Editorial',
        date: '1 Feb, 2026',
        readTime: '4 min',
        imageGradient: 'from-emerald-500 to-teal-600'
    },
    {
        id: 4,
        slug: 'impuestos-pymes',
        title: 'Lo que nadie te cuenta sobre los impuestos para PYMES',
        excerpt: 'Una guía simple y sin tecnicismos para entender tus obligaciones fiscales y aprovechar beneficios que quizás estás ignorando.',
        category: 'Gestión',
        author: 'Ana López',
        role: 'Contadora',
        date: '28 Ene, 2026',
        readTime: '6 min',
        imageGradient: 'from-orange-500 to-amber-600'
    },
    {
        id: 5,
        slug: 'fidelizar-clientes',
        title: '3 Estrategias para que tus clientes vuelvan una y otra vez',
        excerpt: 'Captar un cliente nuevo es 5 veces más caro que retener a uno existente. Aprende a crear un programa de lealtad simple.',
        category: 'Ventas',
        author: 'Carlos Ruiz',
        role: 'Growth Marketing',
        date: '20 Ene, 2026',
        readTime: '5 min',
        imageGradient: 'from-pink-500 to-rose-600'
    },
    {
        id: 6,
        slug: 'tutorial-primeros-pasos',
        title: 'Primeros pasos en Yupay: Configura tu tienda en 15 minutos',
        excerpt: 'Un tutorial paso a paso con capturas de pantalla para que tengas tu negocio digital funcionando hoy mismo.',
        category: 'Tutoriales',
        author: 'Soporte Yupay',
        role: 'Customer Success',
        date: '15 Ene, 2026',
        readTime: '10 min',
        imageGradient: 'from-indigo-500 to-violet-600'
    }
];

export default function Blog({ onLogin, onRegister }: { onLogin?: () => void, onRegister?: () => void }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-500">
            <LandingNavbar onLogin={onLogin} onRegister={onRegister} />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-16 md:mb-24 text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-bold uppercase tracking-wide mb-6">
                            <span className="w-2 h-2 rounded-full bg-violet-600 dark:bg-violet-400 animate-pulse"></span>
                            Blog & Recursos
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6 text-slate-900 dark:text-white leading-[1.1]">
                            Aprende a escalar tu negocio.
                        </h1>
                        <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            Consejos prácticos, guías de gestión y estrategias de venta para emprendedores que quieren ir al siguiente nivel.
                        </p>
                    </div>

                    {/* Featured Post */}
                    <div className="mb-20 relative group cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-30 transition-opacity duration-500"></div>
                        <div className="relative bg-white dark:bg-[#0B1120] rounded-[2rem] border border-slate-200 dark:border-white/10 overflow-hidden grid lg:grid-cols-2 shadow-2xl shadow-slate-200/50 dark:shadow-black/20 hover:shadow-violet-500/10 transition-all duration-500 group-hover:-translate-y-1">
                            <div className="h-64 lg:h-auto bg-gradient-to-br from-violet-600 to-indigo-600 relative overflow-hidden group-hover:scale-[1.02] transition-transform duration-700">
                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay opacity-40"></div>
                                <div className="absolute bottom-6 left-6">
                                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-white text-xs font-bold uppercase tracking-wider border border-white/20">
                                        Destacado
                                    </span>
                                </div>
                            </div>
                            <div className="p-8 md:p-12 flex flex-col justify-center">
                                <div className="flex items-center gap-3 text-xs font-bold text-violet-600 dark:text-violet-400 uppercase tracking-widest mb-4">
                                    <Tag className="w-3 h-3" />
                                    <span>Estrategia</span>
                                </div>
                                <h2 className="text-2xl md:text-4xl font-black mb-6 text-slate-900 dark:text-white leading-tight">
                                    Cómo digitalizar tu tienda física sin perder clientes en el proceso
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed text-lg">
                                    La transición al mundo digital puede dar miedo. Te mostramos el plan exacto de 4 semanas para comenzar a vender online manteniendo tu esencia.
                                </p>
                                <div className="flex items-center justify-between mt-auto pt-8 border-t border-slate-100 dark:border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold">
                                            DR
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">Diego Rojas</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-500">CEO Fundador</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                                        <Clock className="w-3 h-3" />
                                        <span>7 min lectura</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filter & Search */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div className="flex overflow-x-auto pb-4 md:pb-0 gap-2 no-scrollbar">
                            {CATEGORIES.map((cat, i) => (
                                <button
                                    key={cat}
                                    className={`px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${i === 0
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-indigo-950 shadow-lg shadow-slate-900/10 dark:shadow-white/5'
                                            : 'bg-white dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div className="relative w-full md:w-72">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar artículos..."
                                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-violet-500/20 text-slate-900 dark:text-white placeholder:text-slate-400 transition-all"
                            />
                        </div>
                    </div>

                    {/* Posts Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {POSTS.map(post => (
                            <article key={post.id} className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-3xl overflow-hidden hover:border-violet-300 dark:hover:border-violet-500/30 transition-all duration-300 group flex flex-col hover:-translate-y-1 hover:shadow-xl hover:shadow-violet-500/5">
                                {/* Thumbnail */}
                                <div className={`aspect-video bg-gradient-to-br ${post.imageGradient} relative overflow-hidden group-hover:brightness-110 transition-all`}>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-30 text-white font-black text-6xl tracking-tighter mix-blend-overlay">
                                        YUPAY
                                    </div>
                                    <div className="absolute top-4 left-4">
                                        <span className="px-3 py-1 bg-black/20 backdrop-blur-md rounded-lg text-white text-[10px] font-bold uppercase tracking-wider border border-white/10">
                                            {post.category}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-6 md:p-8 flex flex-col flex-1">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 line-clamp-2 leading-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                                        {post.title}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 line-clamp-3">
                                        {post.excerpt}
                                    </p>

                                    <div className="mt-auto pt-6 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-white/20 flex items-center justify-center overflow-hidden">
                                                <User className="h-3 w-3 text-slate-500 dark:text-slate-400" />
                                            </div>
                                            <div className="text-xs">
                                                <p className="font-bold text-slate-900 dark:text-white">{post.author}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            <Clock className="w-3 h-3" />
                                            {post.readTime}
                                        </div>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Pagination / Load More */}
                    <div className="mt-20 text-center">
                        <button className="px-8 py-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/10 transition-all shadow-sm flex items-center gap-2 mx-auto">
                            Cargar más artículos
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Newsletter in Blog */}
                    <div className="mt-32 relative rounded-[2.5rem] bg-slate-900 dark:bg-white/[0.02] border border-transparent dark:border-white/10 overflow-hidden px-6 py-20 text-center">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 blur-[100px] rounded-full"></div>
                        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 blur-[100px] rounded-full"></div>

                        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
                            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight">
                                Recibe estos consejos en tu email cada semana
                            </h2>
                            <p className="text-slate-400 text-lg">
                                Únete a más de 5,000 emprendedores que están haciendo crecer sus negocios con nuestros tips. Cero spam, 100% valor.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
                                <input
                                    type="email"
                                    placeholder="tu@email.com"
                                    className="flex-1 bg-white/10 border border-white/10 rounded-xl px-6 py-4 text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-violet-500/50"
                                />
                                <button className="bg-white text-slate-900 font-bold px-8 py-4 rounded-xl hover:bg-slate-200 transition-all">
                                    Suscribirme
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
