
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Datos demo para los gráficos (Generalmente vendrían de una API o Props en el futuro)
const monthlyRevenueData = [
    { month: 'Ene', ingresos: 1200, usuarios: 45 },
    { month: 'Feb', ingresos: 1900, usuarios: 52 },
    { month: 'Mar', ingresos: 2400, usuarios: 63 },
    { month: 'Abr', ingresos: 2100, usuarios: 58 },
    { month: 'May', ingresos: 2800, usuarios: 72 },
    { month: 'Jun', ingresos: 3200, usuarios: 85 },
];

const planDistributionData = [
    { name: 'Básico', value: 35, color: '#3b82f6' },
    { name: 'Profesional', value: 45, color: '#8b5cf6' },
    { name: 'Empresarial', value: 20, color: '#f59e0b' },
];

const weeklyOrdersData = [
    { day: 'Lun', ordenes: 12 },
    { day: 'Mar', ordenes: 19 },
    { day: 'Mié', ordenes: 15 },
    { day: 'Jue', ordenes: 22 },
    { day: 'Vie', ordenes: 28 },
    { day: 'Sáb', ordenes: 35 },
    { day: 'Dom', ordenes: 18 },
];

export function SystemAnalyticsView() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                <CardHeader className="p-4 sm:p-6 pb-2"><CardTitle className="text-sm font-bold dark:text-white">Ingresos Mensuales</CardTitle></CardHeader>
                <CardContent className="h-60 sm:h-72 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <defs><linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-100 dark:stroke-gray-800" />
                            <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} /><YAxis stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                            <Area type="monotone" dataKey="ingresos" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorIngresos)" name="Ingresos" />
                        </AreaChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                <CardHeader className="p-4 sm:p-6 pb-2"><CardTitle className="text-sm font-bold dark:text-white">Distribución por Plan</CardTitle></CardHeader>
                <CardContent className="h-60 sm:h-72 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie data={planDistributionData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                                {planDistributionData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                            <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            <Card className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
                <CardHeader className="p-4 sm:p-6 pb-2"><CardTitle className="text-sm font-bold dark:text-white">Órdenes Esta Semana</CardTitle></CardHeader>
                <CardContent className="h-60 sm:h-72 p-2">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={weeklyOrdersData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-100 dark:stroke-gray-800" />
                            <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} /><YAxis stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                            <Bar dataKey="ordenes" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={32} name="Órdenes" />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
