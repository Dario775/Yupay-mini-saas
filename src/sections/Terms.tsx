import { LandingNavbar } from '@/components/LandingNavbar';
import { Footer } from '@/components/Footer';

export default function Terms({ onLogin, onRegister }: { onLogin?: () => void, onRegister?: () => void }) {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] text-slate-900 dark:text-slate-200 font-sans transition-colors duration-500">
            <LandingNavbar onLogin={onLogin} onRegister={onRegister} />

            <main className="max-w-4xl mx-auto px-6 py-40">
                <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-8 text-slate-900 dark:text-white">Términos y Condiciones</h1>
                <p className="text-lg text-slate-500 dark:text-slate-400 mb-12 leading-relaxed">Última actualización: 8 de Febrero, 2026</p>

                <div className="space-y-12 prose prose-slate dark:prose-invert max-w-none">
                    <section>
                        <h2 className="text-2xl font-bold mb-4">1. Aceptación de los Términos</h2>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            Al acceder y utilizar YUPAY, aceptas cumplir y estar sujeto a estos términos y condiciones. Si no estás de acuerdo con alguna parte de estos términos, no podrás utilizar nuestros servicios.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">2. Descripción del Servicio</h2>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            YUPAY proporciona una plataforma de gestión para PYMES que incluye herramientas de inventario, ventas y análisis. Nos reservamos el derecho de modificar, suspender o discontinuar el servicio en cualquier momento.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">3. Cuentas de Usuario</h2>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. Aceptas notificar inmediatamente cualquier uso no autorizado de tu cuenta.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold mb-4">4. Pagos y Suscripciones</h2>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                            Algunos servicios de YUPAY son de pago. Al seleccionar un plan de suscripción, aceptas pagar las tarifas indicadas. Las tarifas no son reembolsables salvo disposición legal contraria.
                        </p>
                    </section>
                </div>
            </main>

            <Footer />
        </div>
    );
}
