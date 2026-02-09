import { LandingNavbar } from '@/components/LandingNavbar';
import { Footer } from '@/components/Footer';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

export default function Contact({ onLogin, onRegister }: { onLogin?: () => void, onRegister?: () => void }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-500">
            <LandingNavbar onLogin={onLogin} onRegister={onRegister} />

            <main className="max-w-7xl mx-auto px-6 py-40">
                <div className="text-center mb-24 max-w-2xl mx-auto">
                    <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-8 text-slate-900 dark:text-white">Habla con Nosotros</h1>
                    <p className="text-xl text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        Estamos aquí para ayudarte a crecer. Ya sea una duda técnica o una propuesta comercial, nos encantaría escucharte.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
                    {/* Contact Info */}
                    <div className="space-y-12">
                        <div className="bg-white dark:bg-white/5 p-8 rounded-3xl border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-none">
                            <h3 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white">Información de Contacto</h3>
                            <div className="space-y-8">
                                <div className="flex items-start gap-6">
                                    <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0">
                                        <Mail className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1 text-slate-900 dark:text-white">Email</h4>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">hola@yupay.app</p>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">soporte@yupay.app</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-6">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                                        <Phone className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1 text-slate-900 dark:text-white">Teléfono</h4>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">+54 11 1234 5678</p>
                                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Lunes a Viernes, 9am - 6pm</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-6">
                                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-1 text-slate-900 dark:text-white">Oficinas</h4>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">Avenida Libertador 1000, Piso 5</p>
                                        <p className="text-slate-500 dark:text-slate-400 font-medium">Buenos Aires, Argentina</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-white dark:bg-white/5 p-8 md:p-12 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-2xl dark:shadow-none">
                        <form className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold ml-1 text-slate-900 dark:text-white">Nombre</label>
                                    <input type="text" placeholder="Tu nombre" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold ml-1 text-slate-900 dark:text-white">Apellido</label>
                                    <input type="text" placeholder="Tu apellido" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold ml-1 text-slate-900 dark:text-white">Email</label>
                                <input type="email" placeholder="tu@email.com" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold ml-1 text-slate-900 dark:text-white">Mensaje</label>
                                <textarea rows={4} placeholder="¿En qué podemos ayudarte?" className="w-full bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-violet-500/50 transition-all font-medium resize-none"></textarea>
                            </div>

                            <button type="submit" className="w-full bg-violet-600 hover:bg-violet-700 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/20 active:scale-[0.98]">
                                Enviar Mensaje
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
