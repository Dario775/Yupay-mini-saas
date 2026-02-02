
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Shield, FileText, Lock } from 'lucide-react';

export default function Terms({ onBack }: { onBack: () => void }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
                <div className="container flex h-14 items-center max-w-4xl mx-auto px-4">
                    <Button variant="ghost" size="sm" className="gap-2 mr-6" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4" />
                        Volver
                    </Button>
                    <div className="mr-4 hidden md:flex">
                        <h1 className="text-lg font-bold">Kimi Mini SaaS</h1>
                    </div>
                </div>
            </header>

            <main className="container max-w-4xl mx-auto py-10 px-4">
                <div className="space-y-4 mb-10 text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl dark:text-white">Relaciones Legales</h1>
                    <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
                        Por favor, lee atentamente nuestros términos y condiciones y nuestra política de privacidad.
                        El uso de nuestra plataforma implica la aceptación de estos términos.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-[1fr_250px]">
                    <div className="space-y-10">
                        {/* Terms Section */}
                        <section id="terms" className="scroll-mt-20">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-lg">
                                    <FileText className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                                </div>
                                <h2 className="text-2xl font-bold dark:text-white">Términos y Condiciones</h2>
                            </div>

                            <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-300 space-y-4">
                                <p>
                                    Bienvenido a Kimi Mini SaaS. Estos términos y condiciones describen las reglas y regulaciones para el uso de nuestro sitio web y servicios.
                                </p>

                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-6">1. Aceptación de los Términos</h3>
                                <p>
                                    Al acceder a este sitio web, asumimos que aceptas estos términos y condiciones. No continúes usando Kimi Mini SaaS si no estás de acuerdo con todos los términos y condiciones establecidos en esta página.
                                </p>

                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-6">2. Servicios Ofrecidos</h3>
                                <p>
                                    Kimi Mini SaaS proporciona una plataforma para que las pequeñas y medianas empresas (PYMES) gestionen sus tiendas en línea, productos, pedidos e interactúen con sus clientes. Nos reservamos el derecho de retirar o enmendar nuestros servicios sin previo aviso.
                                </p>

                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-6">3. Cuentas de Usuario</h3>
                                <p>
                                    Para acceder a algunas funciones, deberás registrarte. Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. Te comprometes a aceptar la responsabilidad de todas las actividades que ocurran bajo tu cuenta.
                                </p>

                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-6">4. Propiedad Intelectual</h3>
                                <p>
                                    El servicio y sus contenidos originales, características y funcionalidad son y seguirán siendo propiedad exclusiva de Kimi Mini SaaS y sus licenciantes.
                                </p>
                            </div>
                        </section>

                        <div className="h-px bg-gray-200 dark:bg-gray-800" />

                        {/* Privacy Section */}
                        <section id="privacy" className="scroll-mt-20">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
                                    <Lock className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <h2 className="text-2xl font-bold dark:text-white">Política de Privacidad</h2>
                            </div>

                            <div className="prose dark:prose-invert max-w-none text-sm text-gray-600 dark:text-gray-300 space-y-4">
                                <p>
                                    Tu privacidad es importante para nosotros. Es política de Kimi Mini SaaS respetar tu privacidad con respecto a cualquier información que podamos recopilar mientras operamos nuestro sitio web.
                                </p>

                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-6">1. Información que Recopilamos</h3>
                                <p>
                                    Recopilamos información personal que nos proporcionas directamente, como tu nombre, dirección de correo electrónico y detalles de la tienda cuando te registras. También recopilamos datos de uso y ubicación para mejorar nuestros servicios.
                                </p>

                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-6">2. Uso de la Información</h3>
                                <p>
                                    Utilizamos la información recopilada para operar y mantener nuestro servicio, notificarte sobre cambios, y proporcionar soporte al cliente. No vendemos tu información personal a terceros.
                                </p>

                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-6">3. Seguridad de los Datos</h3>
                                <p>
                                    Valoramos tu confianza al proporcionarnos tu información personal, por lo que nos esforzamos por utilizar medios comercialmente aceptables para protegerla. Pero recuerda que ningún método de transmisión a través de Internet es 100% seguro.
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Navigation */}
                    <div className="hidden md:block">
                        <div className="sticky top-24 space-y-2">
                            <p className="font-bold text-sm mb-4 dark:text-white">En esta página</p>
                            <nav className="flex flex-col space-y-1">
                                <a href="#terms" className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors py-1">
                                    Términos y Condiciones
                                </a>
                                <a href="#privacy" className="text-sm text-gray-600 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors py-1">
                                    Política de Privacidad
                                </a>
                            </nav>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-10 mt-10">
                <div className="container max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
                    <p>&copy; 2024 Kimi Mini SaaS. Todos los derechos reservados.</p>
                </div>
            </footer>
        </div>
    );
}
