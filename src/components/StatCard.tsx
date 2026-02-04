
import type { LucideIcon } from 'lucide-react';
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
        <Card className={`relative overflow-hidden border ${alert ? 'border-red-500/50 bg-red-50 dark:bg-red-900/10' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'} shadow-sm hover:shadow-md transition-all duration-300`}>
            {gradient && <div className={`absolute inset-0 opacity-[0.03] ${gradient}`} />}
            <CardContent className="p-4">
                <div className="flex items-start justify-between">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{title}</p>
                        <div className="flex items-baseline gap-2">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-0.5">{value}</h3>
                            {trend && (
                                <div className={`flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isPositiveTrend ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' :
                                    isNegativeTrend ? 'text-red-600 bg-red-50 dark:bg-red-900/20' :
                                        'text-gray-600 bg-gray-100 dark:bg-gray-800'
                                    }`}>
                                    {isPositiveTrend ? <TrendingUp className="h-3 w-3 mr-1" /> : isNegativeTrend ? <TrendingDown className="h-3 w-3 mr-1" /> : <Minus className="h-3 w-3 mr-1" />}
                                    {trend}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                        <Icon className="h-4 w-4" style={{ color: color }} />
                    </div>
                </div>
                {alert && <p className="text-[10px] text-red-500 font-medium mt-1">Requiere atención</p>}
            </CardContent>
        </Card>
    );
}
