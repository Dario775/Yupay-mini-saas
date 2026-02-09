import { LandingNavbar } from '@/components/LandingNavbar';
import { Footer } from '@/components/Footer';
import { MessageCircle, CreditCard, Sparkles, Share2, Mail, ArrowRight, Check } from 'lucide-react';

export default function Integrations({ onLogin, onRegister }: { onLogin?: () => void, onRegister?: () => void }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-500">
            <LandingNavbar onLogin={onLogin} onRegister={onRegister} />

            <main className="pt-40 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center max-w-3xl mx-auto mb-24">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold uppercase tracking-wide mb-6">
                            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse"></span>
                            Ecosistema Conectado
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-6 text-slate-900 dark:text-white">
                            Tus herramientas favoritas, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-blue-600">ahora trabajan juntas.</span>
                        </h1>
                        <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                            Yupay conecta tus productos con los clientes de tu zona a través de las herramientas que ya usas.
                        </p>
                    </div>

                    {/* WhatsApp Feature - The Big One */}
                    <div className="mb-32 relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-[3rem] blur-3xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                        <div className="relative bg-white dark:bg-[#0B1120] rounded-[2.5rem] border border-slate-200 dark:border-white/10 overflow-hidden grid lg:grid-cols-2 shadow-2xl shadow-emerald-500/5 items-center">
                            <div className="p-10 md:p-16 space-y-8">
                                <div className="w-16 h-16 bg-[#25D366]/10 rounded-2xl flex items-center justify-center text-[#25D366]">
                                    <MessageCircle className="w-8 h-8" />
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">
                                    Vende por WhatsApp en piloto automático
                                </h2>
                                <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Recibe pedidos de tus vecinos directamente a tu WhatsApp. Sin intermediarios, pero con un formato profesional y fácil de leer.
                                </p>
                                <ul className="space-y-4">
                                    {['Pedidos detallados al chat', 'Comparte tu perfil de vendedor', 'Gestiona clientes de tu zona'].map(item => (
                                        <li key={item} className="flex items-center gap-3 font-medium text-slate-700 dark:text-slate-300">
                                            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                                <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                            </div>
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="h-full bg-slate-50 dark:bg-white/5 relative flex items-center justify-center p-12 overflow-hidden">
                                {/* Abstract representation of WhatsApp Chat */}
                                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent opacity-50"></div>
                                <div className="relative w-72 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 shadow-2xl p-4 space-y-4 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                    <div className="flex items-center gap-3 border-b border-slate-100 dark:border-white/5 pb-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-white/10"></div>
                                        <div>
                                            <div className="w-32 h-3 bg-slate-200 dark:bg-white/10 rounded-full mb-1"></div>
                                            <div className="w-20 h-2 bg-slate-100 dark:bg-white/5 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-2xl rounded-tl-none self-start w-[85%]">
                                            <p className="text-xs text-emerald-800 dark:text-emerald-200 font-medium pb-2">¡Hola! Quiero confirmar mi pedido:</p>
                                            <div className="bg-white dark:bg-black/20 p-2 rounded-lg text-[10px] text-slate-500 mb-1">
                                                1x Zapatillas Urbanas - $45.000
                                            </div>
                                            <div className="bg-white dark:bg-black/20 p-2 rounded-lg text-[10px] text-slate-500">
                                                2x Remeras Básicas - $20.000
                                            </div>
                                        </div>
                                        <div className="bg-white dark:bg-white/10 border border-slate-100 dark:border-white/5 p-3 rounded-2xl rounded-tr-none self-end ml-auto w-[80%]">
                                            <p className="text-xs text-slate-600 dark:text-slate-300">¡Genial! Te paso el link de pago 👇</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Grid of other integrations */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

                        {/* Mercado Pago */}
                        <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 hover:border-[#009EE3]/50 transition-all duration-300 group hover:-translate-y-1">
                            <div className="w-14 h-14 bg-[#009EE3]/10 rounded-2xl flex items-center justify-center text-[#009EE3] mb-6 group-hover:scale-110 transition-transform">
                                <CreditCard className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Mercado Pago</h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm mb-6">
                                Cobra con QR, tarjetas de crédito y débito. El dinero se acredita en tu cuenta al instante y de forma segura.
                            </p>
                            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#009EE3] uppercase tracking-wider">
                                <span>Integración Nativa</span>
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>

                        {/* Google Gemini AI */}
                        <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 hover:border-violet-500/50 transition-all duration-300 group hover:-translate-y-1">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500/10 to-violet-500/10 rounded-2xl flex items-center justify-center text-violet-600 mb-6 group-hover:scale-110 transition-transform">
                                <Sparkles className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Google AI (Gemini)</h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm mb-6">
                                Tu redactor personal. Crea descripciones de productos persuasivas y profesionales en segundos con Inteligencia Artificial.
                            </p>
                            <div className="inline-flex items-center gap-2 text-xs font-bold text-violet-600 uppercase tracking-wider">
                                <span>Potenciado por IA</span>
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>

                        {/* Social Media */}
                        <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-[2rem] p-8 hover:border-pink-500/50 transition-all duration-300 group hover:-translate-y-1">
                            <div className="w-14 h-14 bg-gradient-to-br from-pink-500/10 to-orange-500/10 rounded-2xl flex items-center justify-center text-pink-600 mb-6 group-hover:scale-110 transition-transform">
                                <Share2 className="w-7 h-7" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Redes Sociales</h3>
                            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-sm mb-6">
                                Comparte tu perfil o productos específicos en Instagram y TikTok para atraer compradores locales a tu catálogo en Yupay.
                            </p>
                            <div className="inline-flex items-center gap-2 text-xs font-bold text-pink-600 uppercase tracking-wider">
                                <span>Social Selling</span>
                                <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
