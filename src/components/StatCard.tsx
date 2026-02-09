import { motion } from 'motion/react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ElementType;
    trend?: string;
    color?: string;
    alert?: boolean;
    gradient?: string;
}

export function StatCard({ title, value, icon: Icon, trend, color, alert, gradient }: StatCardProps) {
    const isNegativeTrend = trend?.includes('-') || (trend?.startsWith('-'));
    const isPositiveTrend = trend?.includes('+') || (trend?.startsWith('+'));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -4 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        >
            <Card className={`relative overflow-hidden border ${alert ? 'border-red-500/50 bg-red-50 dark:bg-red-900/10' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'} shadow-xl shadow-gray-500/5 transition-all duration-300`}>
                {/* Visual Depth Accents */}
                <div
                    className="absolute top-0 right-0 w-32 h-32 blur-[40px] rounded-full pointer-events-none opacity-[0.08]"
                    style={{ backgroundColor: color || '#8b5cf6' }}
                />

                {gradient && <div className={`absolute inset-0 opacity-[0.03] ${gradient}`} />}

                <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                        <div className="space-y-2">
                            <p className="text-[10px] font-black uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">{title}</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{value}</h3>
                                {trend && (
                                    <div className={`flex items-center text-[10px] font-black px-2 py-0.5 rounded-lg border ${isPositiveTrend ? 'text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/30' :
                                        isNegativeTrend ? 'text-red-600 bg-red-50 border-red-100 dark:bg-red-900/20 dark:border-red-800/30' :
                                            'text-gray-600 bg-gray-100 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                                        }`}>
                                        {isPositiveTrend ? <TrendingUp className="h-3 w-3 mr-1" /> : isNegativeTrend ? <TrendingDown className="h-3 w-3 mr-1" /> : <Minus className="h-3 w-3 mr-1" />}
                                        {trend}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100/50 dark:border-gray-700/50 text-gray-500 dark:text-gray-400 shadow-sm">
                            <Icon className="h-5 w-5" style={{ color: color }} />
                        </div>
                    </div>
                    {alert && (
                        <div className="mt-3 flex items-center gap-1.5 px-2 py-1 bg-red-100/50 dark:bg-red-900/20 rounded-md w-fit">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <p className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">Acción requerida</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
