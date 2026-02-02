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
        description: "Ideal para pequeños negocios y emprendedores que comienzan.",
        buttonText: "Comenzar gratis",
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
        description: "La mejor opción para negocios que están arrancando.",
        buttonText: "Elegir Básico",
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
        description: "Mejor valor para negocios en crecimiento con funciones avanzadas.",
        buttonText: "Comenzar ahora",
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
        const monthlyPrice = limits.price;
        const yearlyPrice = limits.price * 12 * 0.8; // 20% de descuento como dice el switch

        return {
            ...visual,
            key,
            price: monthlyPrice,
            yearlyPrice: yearlyPrice,
        };
    });

    return (
        <div className="px-4 py-20 min-h-screen mx-auto relative bg-neutral-100 dark:bg-gray-900 overflow-hidden" ref={pricingRef}>
            <div
                className="absolute top-0 left-[10%] right-[10%] w-[80%] h-full z-0 pointer-events-none"
                style={{
                    backgroundImage: `
        radial-gradient(circle at center, #206ce8 0%, transparent 70%)
      `,
                    opacity: 0.15,
                    mixBlendMode: "multiply",
                }}
            />

            <div className="text-center mb-6 max-w-3xl mx-auto relative z-10">
                <TimelineContent
                    as="h2"
                    animationNum={0}
                    timelineRef={pricingRef}
                    customVariants={revealVariants}
                    className="md:text-6xl sm:text-4xl text-3xl font-bold text-gray-900 dark:text-white mb-4"
                >
                    Planes que mejor se adaptan a tu{" "}
                    <TimelineContent
                        as="span"
                        animationNum={1}
                        timelineRef={pricingRef}
                        customVariants={revealVariants}
                        className="border border-dashed border-blue-500 px-3 py-1 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 capitalize inline-block"
                    >
                        negocio
                    </TimelineContent>
                </TimelineContent>

                <TimelineContent
                    as="p"
                    animationNum={2}
                    timelineRef={pricingRef}
                    customVariants={revealVariants}
                    className="sm:text-lg text-base text-gray-600 dark:text-gray-400 sm:w-[70%] w-[80%] mx-auto"
                >
                    Con la confianza de millones. Ayudamos a equipos en todo el mundo.
                    Explora qué opción es la adecuada para ti.
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

            <div className="grid md:grid-cols-2 lg:grid-cols-4 max-w-7xl gap-6 py-12 mx-auto relative z-10">
                {plans.map((plan, index) => (
                    <TimelineContent
                        key={plan.name}
                        as="div"
                        animationNum={4 + index}
                        timelineRef={pricingRef}
                        customVariants={revealVariants}
                    >
                        <Card
                            className={`relative border-neutral-200 dark:border-gray-700 h-full flex flex-col ${plan.popular
                                ? "ring-2 ring-blue-500 bg-blue-50/50 dark:bg-blue-900/10 shadow-xl scale-105 z-10"
                                : "bg-white dark:bg-gray-800"
                                }`}
                        >
                            <CardHeader className="text-left">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {plan.name}
                                    </h3>
                                    {plan.popular && (
                                        <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                            Popular
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-600 dark:text-gray-400 mb-6">{plan.description}</p>
                                <div className="flex items-baseline mb-4">
                                    <span className="text-4xl font-bold text-gray-900 dark:text-white">
                                        $
                                        <NumberFlow
                                            value={isYearly ? plan.yearlyPrice : plan.price}
                                            className="text-4xl font-bold"
                                        />
                                    </span>
                                    <span className="text-gray-600 dark:text-gray-400 ml-1 font-medium text-sm">
                                        /{isYearly ? "año" : "mes"}
                                    </span>
                                </div>
                            </CardHeader>

                            <CardContent className="pt-0 flex-1 flex flex-col">
                                <button
                                    className={`w-full mb-8 p-3 text-base font-bold rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98] ${plan.popular
                                        ? "bg-gradient-to-t from-blue-600 to-blue-500 shadow-lg shadow-blue-500/30 border border-blue-400 text-white"
                                        : "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg border border-gray-700 dark:border-gray-200"
                                        }`}
                                >
                                    {plan.buttonText}
                                </button>
                                <ul className="space-y-3 mb-8">
                                    {plan.features.map((feature, featureIndex) => (
                                        <li key={featureIndex} className="flex items-center gap-3">
                                            <span className="text-blue-500 dark:text-blue-400">
                                                {feature.icon}
                                            </span>
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                                {feature.text}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                <div className="space-y-4 pt-6 border-t border-neutral-200 dark:border-gray-700 mt-auto">
                                    <h4 className="font-bold text-xs text-gray-900 dark:text-white">
                                        {plan.includes[0]}
                                    </h4>
                                    <ul className="space-y-3">
                                        {plan.includes.slice(1).map((feature, featureIndex) => (
                                            <li key={featureIndex} className="flex items-center gap-3">
                                                <div className="h-5 w-5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-full flex items-center justify-center flex-shrink-0">
                                                    <CheckCheck className="h-3 w-3 text-blue-500" />
                                                </div>
                                                <span className="text-[10px] text-gray-600 dark:text-gray-400 font-medium">{feature}</span>
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
