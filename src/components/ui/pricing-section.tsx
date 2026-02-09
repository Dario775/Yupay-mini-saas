"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { TimelineContent } from "@/components/ui/timeline-animation";
import NumberFlow from "@number-flow/react";
import { Briefcase, CheckCheck, Database, Server } from "lucide-react";
import { motion } from "motion/react";
import { useRef, useState } from "react";

import { useAdminData } from "@/hooks/useData";

const PLAN_FEATURES_MAP: Record<string, {
    name: string;
    description: string;
    buttonText: string;
    buttonVariant: "outline" | "default";
    popular?: boolean;
    features: { text: string; icon: React.ReactNode }[];
    includes: string[];
}> = {
    free: {
        name: "Gratis",
        description: "Ideal si estás probando. ¡Es 100% GRATIS para siempre y ridículamente FÁCIL!",
        buttonText: "¡SÍ, LO QUIERO GRATIS YA!",
        buttonVariant: "outline",
        features: [
            { text: "Hasta 10 productos", icon: <Briefcase size={20} /> },
            { text: "5 ventas por mes", icon: <Database size={20} /> },
            { text: "Soporte por email", icon: <Server size={20} /> },
        ],
        includes: [
            "Incluye Gratis:",
            "Tienda única",
            "Fondos personalizados",
            "SSL Seguro",
        ],
    },
    basico: {
        name: "Básico",
        description: "Para los que quieren dar el salto. RÁPIDO y sin complicaciones.",
        buttonText: "¡LO QUIERO YA!",
        buttonVariant: "default",
        features: [
            { text: "Hasta 100 productos", icon: <Briefcase size={20} /> },
            { text: "50 ventas por mes", icon: <Database size={20} /> },
            { text: "Soporte prioritario", icon: <Server size={20} /> },
        ],
        includes: [
            "Todo en Gratis, más:",
            "Dominio propio",
            "Analíticas básicas",
            "App móvil",
        ],
    },
    profesional: {
        name: "Profesional",
        description: "Nuestra opción favorita. Todo incluido para que vendas como un pro.",
        buttonText: "¡PROBAR GRATIS YA!",
        buttonVariant: "default",
        popular: true,
        features: [
            { text: "Hasta 1000 productos", icon: <Briefcase size={20} /> },
            { text: "500 ventas por mes", icon: <Database size={20} /> },
            { text: "Soporte 24/7", icon: <Server size={20} /> },
        ],
        includes: [
            "Todo en Básico, más:",
            "3 tiendas incluidas",
            "Campos personalizados",
            "IA para productos",
        ],
    },
    empresarial: {
        name: "Empresarial",
        description: "Seguridad mejorada y acceso ilimitado para grandes equipos.",
        buttonText: "Contactar ventas",
        buttonVariant: "outline",
        features: [
            { text: "Productos ilimitados", icon: <Briefcase size={20} /> },
            { text: "Ventas ilimitadas", icon: <Database size={20} /> },
            { text: "Hasta 10 tiendas", icon: <Server size={20} /> },
        ],
        includes: [
            "Todo en Profesional, más:",
            "API access",
            "Gerente de cuenta",
            "SLA Garantizado",
        ],
    },
};

const PricingSwitch = ({ onSwitch }: { onSwitch: (value: string) => void }) => {
    const [selected, setSelected] = useState("0");

    const handleSwitch = (value: string) => {
        setSelected(value);
        onSwitch(value);
    };

    return (
        <div className="flex justify-center">
            <div className="relative z-50 mx-auto flex w-fit rounded-full bg-neutral-50 border border-gray-200 p-1 dark:bg-gray-800 dark:border-gray-700">
                <button
                    onClick={() => handleSwitch("0")}
                    className={`relative z-10 w-fit sm:h-12 h-10 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors ${selected === "0"
                        ? "text-white"
                        : "text-muted-foreground hover:text-black dark:hover:text-white"
                        }`}
                >
                    {selected === "0" && (
                        <motion.span
                            layoutId={"switch"}
                            className="absolute top-0 left-0 sm:h-12 h-10 w-full rounded-full border-4 shadow-sm shadow-blue-600 border-blue-600 bg-gradient-to-t from-blue-500 via-blue-400 to-blue-600"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                    <span className="relative">Mensual</span>
                </button>

                <button
                    onClick={() => handleSwitch("1")}
                    className={`relative z-10 w-fit sm:h-12 h-8 flex-shrink-0 rounded-full sm:px-6 px-3 sm:py-2 py-1 font-medium transition-colors ${selected === "1"
                        ? "text-white"
                        : "text-muted-foreground hover:text-black dark:hover:text-white"
                        }`}
                >
                    {selected === "1" && (
                        <motion.span
                            layoutId={"switch"}
                            className="absolute top-0 left-0 sm:h-12 h-10 w-full rounded-full border-4 shadow-sm shadow-blue-600 border-blue-600 bg-gradient-to-t from-blue-500 via-blue-400 to-blue-600"
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                    )}
                    <span className="relative flex items-center gap-2">
                        Anual
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-black">
                            Ahorra 20%
                        </span>
                    </span>
                </button>
            </div>
        </div>
    );
};

export default function PricingSection() {
    const { planLimits } = useAdminData();
    const [isYearly, setIsYearly] = useState(false);
    const pricingRef = useRef<HTMLDivElement>(null);

    const revealVariants = {
        visible: (i: number) => ({
            y: 0,
            opacity: 1,
            filter: "blur(0px)",
            transition: {
                delay: i * 0.4,
                duration: 0.5,
            },
        }),
        hidden: {
            filter: "blur(10px)",
            y: -20,
            opacity: 0,
        },
    };

    const togglePricingPeriod = (value: string) =>
        setIsYearly(Number.parseInt(value) === 1);

    // Generar lista de planes combinando límites y configuración visual
    const plans = (Object.keys(planLimits) as Array<keyof typeof planLimits>).map((key) => {
        const limits = planLimits[key];
        const visual = PLAN_FEATURES_MAP[key as string] || PLAN_FEATURES_MAP.basico;
        const monthlyPrice = Math.round(limits.price);
        const yearlyPrice = Math.round(limits.price * 12 * 0.8);

        // Actualizar features dinámicamente según los límites actuales
        const dynamicFeatures = [
            {
                text: limits.maxProducts === -1 ? "Productos ilimitados" : `Hasta ${limits.maxProducts} productos`,
                icon: <Briefcase size={20} />
            },
            {
                text: limits.maxSalesPerMonth === -1 ? "Ventas ilimitadas" : `${limits.maxSalesPerMonth} ventas por mes`,
                icon: <Database size={20} />
            },
            {
                text: limits.maxStores === 1 ? "Tienda única" : `Hasta ${limits.maxStores} tiendas`,
                icon: <Server size={20} />
            },
        ];

        // Actualizar sub-features (includes) según capacidades
        const dynamicIncludes = [...visual.includes];
        if (limits.hasFlashOffers) {
            const index = dynamicIncludes.findIndex(item => item.toLowerCase().includes('ia') || item.toLowerCase().includes('app'));
            if (index !== -1) {
                dynamicIncludes.splice(index + 1, 0, `Ofertas Relámpago (${limits.maxFlashOfferRadius}km)`);
            } else {
                dynamicIncludes.push(`Ofertas Relámpago (${limits.maxFlashOfferRadius}km)`);
            }
        }

        return {
            ...visual,
            key,
            price: monthlyPrice,
            yearlyPrice: yearlyPrice,
            features: dynamicFeatures,
            includes: dynamicIncludes
        };
    });

    return (
        <div className="px-4 py-32 min-h-screen mx-auto relative bg-slate-50 dark:bg-[#020617] overflow-hidden transition-colors duration-500" ref={pricingRef}>
            <div
                className="absolute top-0 left-[10%] right-[10%] w-[80%] h-full z-0 pointer-events-none"
                style={{
                    backgroundImage: `
        radial-gradient(circle at center, #4f46e5 0%, transparent 70%)
      `,
                    opacity: 0.05,
                }}
            />

            <div className="text-center mb-16 max-w-3xl mx-auto relative z-10">
                <TimelineContent
                    as="h2"
                    animationNum={0}
                    timelineRef={pricingRef}
                    customVariants={revealVariants}
                    className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white mb-6 tracking-tight"
                >
                    Ingeniería de Costos para la <br />{" "}
                    <TimelineContent
                        as="span"
                        animationNum={1}
                        timelineRef={pricingRef}
                        customVariants={revealVariants}
                        className="px-6 py-2 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white capitalize inline-block italic shadow-2xl shadow-violet-500/20"
                    >
                        Expansión
                    </TimelineContent>
                </TimelineContent>

                <TimelineContent
                    as="p"
                    animationNum={2}
                    timelineRef={pricingRef}
                    customVariants={revealVariants}
                    className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto"
                >
                    Modelos de suscripción diseñados para escalar sin fricciones.
                    Desde emprendedores solitarios hasta corporaciones dinámicas.
                </TimelineContent>
            </div>

            <TimelineContent
                as="div"
                animationNum={3}
                timelineRef={pricingRef}
                customVariants={revealVariants}
                className="relative z-10"
            >
                <PricingSwitch onSwitch={togglePricingPeriod} />
            </TimelineContent>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 max-w-7xl gap-8 py-16 mx-auto relative z-10">
                {plans.map((plan, index) => (
                    <TimelineContent
                        key={plan.name}
                        as="div"
                        animationNum={4 + index}
                        timelineRef={pricingRef}
                        customVariants={revealVariants}
                        className="h-full"
                    >
                        <Card
                            className={`relative h-full flex flex-col group transition-all duration-500 rounded-[2.5rem] overflow-hidden ${plan.popular
                                ? "ring-2 ring-violet-500 bg-white dark:bg-white/[0.05] shadow-[0_30px_60px_rgba(0,0,0,0.1)] dark:shadow-[0_30px_60px_rgba(0,0,0,0.5)] scale-105 z-10 backdrop-blur-3xl border-transparent"
                                : "bg-white dark:bg-white/[0.02] border-slate-200 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/[0.04] backdrop-blur-xl"
                                }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-violet-500 to-transparent" />
                            )}

                            <CardHeader className="text-left p-8">
                                <div className="flex justify-between items-start mb-6">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                                        {plan.name}
                                    </h3>
                                    {plan.popular && (
                                        <span className="bg-violet-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                                            Elite Choice
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-8 leading-relaxed">{plan.description}</p>
                                <div className="flex items-baseline mb-4 text-slate-900 dark:text-white">
                                    <span className="text-4xl font-black tracking-tighter">
                                        $
                                        <NumberFlow
                                            value={isYearly ? plan.yearlyPrice : plan.price}
                                            className="text-4xl font-black tracking-tighter"
                                            locales="es-AR"
                                            format={{ useGrouping: true, minimumFractionDigits: 0, maximumFractionDigits: 0 }}
                                        />
                                    </span>
                                    <span className="text-slate-500 ml-1 font-black text-[10px] uppercase tracking-widest">
                                        /{isYearly ? "Año" : "Mes"}
                                    </span>
                                </div>
                            </CardHeader>

                            <CardContent className="px-8 pb-8 flex-1 flex flex-col">
                                <button
                                    className={`w-full mb-10 py-5 text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all duration-300 active:scale-95 ${plan.popular
                                        ? "bg-violet-600 dark:bg-white text-white dark:text-indigo-950 shadow-2xl shadow-violet-500/20 dark:shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:bg-violet-700 dark:hover:bg-violet-50 font-black"
                                        : "bg-slate-900 dark:bg-white/5 text-white dark:text-white border border-transparent dark:border-white/10 hover:bg-slate-800 dark:hover:bg-white/10"
                                        }`}
                                >
                                    {plan.buttonText}
                                </button>
                                <ul className="space-y-4 mb-10">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-center gap-4">
                                            <div className="w-5 h-5 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-600 dark:text-violet-400">
                                                {feature.icon}
                                            </div>
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="space-y-5 pt-8 border-t border-slate-100 dark:border-white/5 mt-auto">
                                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
                                        {plan.includes[0]}
                                    </h4>
                                    <ul className="space-y-4">
                                        {plan.includes.slice(1).map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-center gap-4 group/item">
                                                <div className="h-6 w-6 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover/item:border-violet-500/50 transition-colors">
                                                    <CheckCheck className="h-3 w-3 text-violet-600 dark:text-violet-400" />
                                                </div>
                                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold tracking-tight">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </TimelineContent>
                ))}
            </div>
        </div>
    );
}
