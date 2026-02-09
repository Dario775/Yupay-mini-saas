import {
    MessageCircle, Globe, Heart, CheckCircle2,
    Twitter, Linkedin, Instagram, Github,
    Mail, MapPin, ExternalLink, ChevronRight
} from 'lucide-react';

export function Footer() {
    return (
        <footer className="py-32 border-t border-slate-200 dark:border-white/5 px-6 relative overflow-hidden bg-white dark:bg-[#020617] transition-colors duration-500">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-violet-500/50 to-transparent" />

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-8 mb-24">
                    {/* Brand Column */}
                    <div className="lg:col-span-4 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-violet-600 dark:bg-white text-white dark:text-indigo-950 rounded-2xl flex items-center justify-center font-black italic text-2xl shadow-2xl shadow-violet-500/20">Y</div>
                            <span className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white">YUPAY</span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed max-w-sm">
                            La plataforma simple para gestionar tu negocio. Sin complicaciones, todo lo que necesitas en un solo lugar.
                        </p>
                        <div className="flex gap-4">
                            {[
                                { icon: Twitter, href: '#' },
                                { icon: Linkedin, href: '#' },
                                { icon: Instagram, href: '#' },
                                { icon: Github, href: '#' }
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.href}
                                    className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-white hover:border-violet-300 dark:hover:border-white/20 transition-all duration-300"
                                >
                                    <social.icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="lg:col-span-2 space-y-8">
                        <h5 className="font-black text-xs uppercase tracking-[0.2em] text-slate-900 dark:text-white">Producto</h5>
                        <ul className="space-y-4">
                            {[
                                { label: 'Funcionalidades', href: '/features' },
                                { label: 'Inteligencia IA', href: '/ia-intelligence' },
                                { label: 'Integraciones', href: '/integrations' },
                                { label: 'Precios', href: '/pricing' }
                            ].map(link => (
                                <li key={link.label}>
                                    <a href={link.href} className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-white transition-colors flex items-center gap-2 group/link">
                                        <ChevronRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-2 space-y-8">
                        <h5 className="font-black text-xs uppercase tracking-[0.2em] text-slate-900 dark:text-white">Compañía</h5>
                        <ul className="space-y-4">
                            {[
                                { label: 'Sobre Nosotros', href: '/about' },
                                { label: 'Contacto', href: '/contact' }
                            ].map(link => (
                                <li key={link.label}>
                                    <a href={link.href} className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-white transition-colors flex items-center gap-2 group/link">
                                        <ChevronRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                                        {link.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <h5 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider">Boletín para Pymes</h5>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Tips, noticias y consejos para hacer crecer tu tienda.</p>
                        <div className="flex flex-col gap-3">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                                <input
                                    type="email"
                                    placeholder="Tu correo electrónico"
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-10 pr-4 outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                                />
                            </div>
                            <button className="w-full bg-violet-600 text-white font-bold text-sm py-3 rounded-xl hover:bg-violet-700 transition-all shadow-lg shadow-violet-500/10">
                                Suscribirme
                            </button>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center pt-12 border-t border-slate-100 dark:border-white/5 gap-8">
                    <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4">
                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">© 2024 YUPAY UNIVERSAL TECHNOLOGY. TODOS LOS DERECHOS RESERVADOS.</p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                        {[
                            { label: 'Privacidad', href: '/privacy' },
                            { label: 'Términos', href: '/terms' },
                            { label: 'Cookies', href: '/cookies' }
                        ].map(link => (
                            <a key={link.label} href={link.href} className="hover:text-violet-600 dark:hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 group">
                                {link.label}
                                <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
