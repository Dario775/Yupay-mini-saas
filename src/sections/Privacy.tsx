import { LandingNavbar } from '@/components/LandingNavbar';
import { Footer } from '@/components/Footer';

export default function Privacy({ onLogin, onRegister }: { onLogin?: () => void, onRegister?: () => void }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-500">
            <LandingNavbar onLogin={onLogin} onRegister={onRegister} />

            <main className="max-w-4xl mx-auto px-6 py-40">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8 text-slate-900 dark:text-white">Política de Privacidad</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 mb-12 leading-relaxed">Última actualización: 8 de Febrero, 2026</p>

                <div className="space-y-12 prose prose-slate dark:prose-invert max-w-none">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">1. Recopilación de Información</h2>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            Recopilamos información que nos proporcionas directamente, como nombre, correo electrónico y datos de facturación al crear una cuenta.
                            También recopilamos datos de uso y análisis mediante cookies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">2. Uso de la Información</h2>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            Utilizamos tu información para proporcionar, mantener y mejorar nuestros servicios, procesar transacciones y enviarte notificaciones importantes y actualizaciones.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">3. Compartir Información</h2>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            No vendemos tu información personal a terceros. Podemos compartir información con proveedores de servicios que nos ayudan a operar nuestro negocio (ej: procesadores de pago).
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">4. Seguridad de Datos</h2>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            Implementamos medidas de seguridad para proteger tu información contra acceso no autorizado, alteración o divulgación.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
