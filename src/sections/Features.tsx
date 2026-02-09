import { LandingNavbar } from '@/components/LandingNavbar';
import { Footer } from '@/components/Footer';
import { MapPin, Store, Users, MessageSquare, Zap, BarChart3, Search, Smartphone } from 'lucide-react';

export default function Features({ onLogin, onRegister }: { onLogin?: () => void, onRegister?: () => void }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-500">
            <LandingNavbar onLogin={onLogin} onRegister={onRegister} />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-24">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-bold uppercase tracking-wide mb-6">
                            <span className="w-2 h-2 rounded-full bg-orange-600 dark:bg-orange-400 animate-pulse"></span>
                            Todo lo que necesitas
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 text-slate-900 dark:text-white">
                            Tu negocio en el centro <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">de tu ciudad.</span>
                        </h1>
                        <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            Más que una tienda online, Yupay es tu vitrina digital local. Conecta con clientes cercanos, gestiona pedidos y haz crecer tu negocio donde estés.
                        </p>
                    </div>

                    {/* Feature 1: Marketplace / Community */}
                    <div className="mb-32 grid lg:grid-cols-2 gap-12 items-center">
                        <div className="order-2 lg:order-1 relative group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-pink-500/20 rounded-[2.5rem] blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                            <div className="relative bg-white dark:bg-[#0B1120] rounded-[2rem] border border-slate-200 dark:border-white/10 p-2 overflow-hidden shadow-2xl shadow-orange-500/5">
                                <div className="aspect-[4/3] bg-slate-100 dark:bg-white/5 rounded-[1.5rem] relative overflow-hidden flex items-center justify-center">
                                    {/* Abstract Map UI */}
                                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-10 grayscale"></div>
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/90 dark:to-[#0B1120]/90"></div>

                                    {/* Location Pins */}
                                    <div className="relative z-10 w-full h-full p-8 flex flex-col items-center justify-center gap-4">
                                        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-3 animate-bounce">
                                            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center text-orange-600">
                                                <Store className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-slate-900 dark:text-white">Tu Tienda</p>
                                                <p className="text-[10px] text-slate-500">Visible aquí</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-12 opacity-50 scale-75">
                                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center shadow-lg text-white"><Users className="w-4 h-4" /></div>
                                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg text-white"><Users className="w-4 h-4" /></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2 space-y-8">
                            <div className="w-14 h-14 bg-orange-100 dark:bg-orange-900/10 rounded-2xl flex items-center justify-center text-orange-600 dark:text-orange-400">
                                <MapPin className="w-7 h-7" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                                Tus clientes te están buscando. <br /> Haz que te encuentren.
                            </h2>
                            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                                Yupay muestra tus productos a los usuarios según su ubicación actual. Si alguien camina cerca de tu negocio y busca lo que vendes, ¡apareces primero!
                            </p>
                            <ul className="space-y-4">
                                {['Visibilidad dinámica por geolocalización', 'Atrae a clientes que ya están cerca', 'Tu catálogo viaja con el usuario'].map(item => (
                                    <li key={item} className="flex items-center gap-3 font-medium text-slate-700 dark:text-slate-300">
                                        <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 shrink-0">
                                            <Zap className="w-3.5 h-3.5" strokeWidth={3} />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Feature 2: Mobile Management */}
                    <div className="mb-32 grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/10 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400">
                                <Smartphone className="w-7 h-7" />
                            </div>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                                Tu negocio en tu bolsillo. <br /> Sin computadoras complejas.
                            </h2>
                            <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                                Diseñamos todo pensando en el celular. Carga productos, responde pedidos y mira tus ganancias mientras atiendes el mostrador. Gestión simple para gente ocupada.
                            </p>
                            <ul className="space-y-4">
                                {['Sube fotos de productos al instante', 'Notificaciones de pedidos en tiempo real', 'Panel de control 100% móvil'].map(item => (
                                    <li key={item} className="flex items-center gap-3 font-medium text-slate-700 dark:text-slate-300">
                                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                            <Zap className="w-3.5 h-3.5" strokeWidth={3} />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-bl from-blue-500/20 to-indigo-500/20 rounded-[2.5rem] blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                            <div className="relative bg-white dark:bg-[#0B1120] rounded-[2rem] border border-slate-200 dark:border-white/10 p-2 overflow-hidden shadow-2xl shadow-blue-500/5">
                                <div className="aspect-[4/3] bg-slate-100 dark:bg-white/5 rounded-[1.5rem] relative overflow-hidden flex items-center justify-center">
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-48 h-80 bg-slate-900 rounded-[2rem] border-4 border-slate-700 shadow-2xl flex flex-col overflow-hidden">
                                            {/* Mock Mobile Screen */}
                                            <div className="h-full bg-white dark:bg-slate-900 w-full relative p-3 space-y-3">
                                                <div className="w-12 h-1 bg-slate-200 dark:bg-white/10 mx-auto rounded-full mb-2"></div>
                                                <div className="h-24 bg-blue-500/10 rounded-xl w-full"></div>
                                                <div className="flex gap-2">
                                                    <div className="h-20 bg-slate-100 dark:bg-white/5 rounded-xl w-1/2"></div>
                                                    <div className="h-20 bg-slate-100 dark:bg-white/5 rounded-xl w-1/2"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Feature Cards Grid */}
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { title: 'Catálogo Digital', desc: 'Olvídate de los PDFs pesados. Tu catálogo está siempre actualizado y es fácil de compartir.', icon: Search, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/20' },
                            { title: 'Gestión de Pedidos', desc: 'Centraliza todos tus pedidos en un solo lugar. De "Nuevo" a "Entregado" en pocos pasos.', icon: MessageSquare, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
                            { title: 'Reportes Simples', desc: 'Entiende qué se vende más y cuándo. Toma decisiones basadas en datos, no en intuición.', icon: BarChart3, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/20' },
                        ].map((feature, i) => (
                            <div key={i} className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 p-8 rounded-[2rem] hover:-translate-y-1 transition-transform duration-300">
                                <div className={`w-12 h-12 ${feature.bg} ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                                    <feature.icon className="w-6 h-6" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
                            </div>
                        ))}
                    </div>



                    {/* How It Works - Dual Flow */}
                    <div className="mt-32 mb-32">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-6">
                                Así funciona el ecosistema
                            </h2>
                            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
                                Conectamos oferta y demanda en tiempo real. Simple para el que vende, mágico para el que compra.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-12 relative">
                            {/* Connector Line (Desktop) */}
                            <div className="hidden md:block absolute left-1/2 top-10 bottom-10 w-px bg-gradient-to-b from-transparent via-slate-200 dark:via-white/10 to-transparent -translate-x-1/2"></div>

                            {/* For Stores */}
                            <div className="relative">
                                <div className="bg-orange-50 dark:bg-orange-900/10 rounded-[2rem] p-8 border border-orange-100 dark:border-orange-500/20 mb-8 text-center">
                                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-500/20 rounded-full flex items-center justify-center text-orange-600 dark:text-orange-400 mx-auto mb-4">
                                        <Store className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Para Tiendas</h3>
                                    <p className="text-slate-600 dark:text-slate-400">Publica y espera las ventas</p>
                                </div>
                                <div className="space-y-12 relative px-4">
                                    {[
                                        { title: "Regístrate en 1 min", desc: "Crea tu cuenta de comercio. Solo necesitas tu nombre y ubicación." },
                                        { title: "Sube tus Productos", desc: "Saca fotos con tu celular, ponles precio y listo. Tu catálogo está vivo." },
                                        { title: "Recibe Pedidos", desc: "Cuando alguien cercano compra, te llega una alerta directa a WhatsApp." }
                                    ].map((step, i) => (
                                        <div key={i} className="flex gap-4 text-left relative z-10 bg-white dark:bg-[#020617] p-4 rounded-xl shadow-sm border border-slate-100 dark:border-white/5">
                                            <div className="font-black text-4xl text-orange-200 dark:text-orange-900/50 relative top-1">{i + 1}</div>
                                            <div>
                                                <h4 className="font-bold text-lg text-slate-900 dark:text-white">{step.title}</h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* For Clients */}
                            <div className="relative">
                                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-[2rem] p-8 border border-blue-100 dark:border-blue-500/20 mb-8 text-center">
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-500/20 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-4">
                                        <Users className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Para Clientes</h3>
                                    <p className="text-slate-600 dark:text-slate-400">Explora y compra local</p>
                                </div>
                                <div className="space-y-12 relative px-4">
                                    {[
                                        { title: "Define tu Radio", desc: "Elige qué tan lejos quieres comprar. ¿500 metros? ¿2 kilómetros?" },
                                        { title: "Descubre Ofertas", desc: "Mira productos y ofertas flash de tiendas que están realmente cerca de ti." },
                                        { title: "Compra al Instante", desc: "Envía tu pedido y coordina el retiro o delivery en minutos." }
                                    ].map((step, i) => (
                                        <div key={i} className="flex gap-4 text-left relative z-10 bg-white dark:bg-[#020617] p-4 rounded-xl shadow-sm border border-slate-100 dark:border-white/5">
                                            <div className="font-black text-4xl text-blue-200 dark:text-blue-900/50 relative top-1">{i + 1}</div>
                                            <div>
                                                <h4 className="font-bold text-lg text-slate-900 dark:text-white">{step.title}</h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{step.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
