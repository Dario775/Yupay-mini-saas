
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Product } from '@/types';

// Mock data for charts
const salesData = [
    { month: 'Ene', ventas: 1200 },
    { month: 'Feb', ventas: 1800 },
    { month: 'Mar', ventas: 2200 },
    { month: 'Abr', ventas: 1900 },
    { month: 'May', ventas: 2800 },
    { month: 'Jun', ventas: 3500 },
];

const categoryData = [
    { name: 'Audio', value: 40, color: '#3b82f6' },
    { name: 'Periféricos', value: 35, color: '#8b5cf6' },
    { name: 'Accesorios', value: 25, color: '#10b981' },
];

interface SalesViewProps {
    topProducts: Product[];
}

export function SalesView({ topProducts }: SalesViewProps) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                <CardHeader className="p-4 sm:p-6 pb-2"><CardTitle className="text-sm font-bold dark:text-white">Ventas por Mes</CardTitle></CardHeader>
                <CardContent className="h-60 sm:h-72 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs><linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-100 dark:stroke-gray-800" />
                            <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} /><YAxis stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                            <Area type="monotone" dataKey="ventas" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorVentas)" name="Ventas" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                <CardHeader className="p-4 sm:p-6 pb-2"><CardTitle className="text-sm font-bold dark:text-white">Ventas por Categoría</CardTitle></CardHeader>
                <CardContent className="h-60 sm:h-72 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                                {categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                <CardHeader className="p-4 sm:p-6 pb-2"><CardTitle className="text-sm font-bold dark:text-white">Top Productos</CardTitle></CardHeader>
                <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {topProducts.map((product, idx) => (
                            <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg border dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                                <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase truncate">{product.name}</p>
                                    <p className="text-[10px] text-gray-500">{product.category}</p>
                                </div>
                                <span className="text-xs font-bold text-gray-900 dark:text-white">${product.price}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
