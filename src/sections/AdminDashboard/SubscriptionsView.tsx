
import { useState } from 'react';
import { CreditCard, Search, Download, Plus, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { formatPrice } from '@/utils/format';
import type { Subscription, User, SubscriptionPlan, SubscriptionStatus } from '@/types';
import { CheckCircle, Clock, XCircle } from 'lucide-react';

interface SubscriptionsViewProps {
    subscriptions: Subscription[];
    users: User[];
    planLimits: Record<SubscriptionPlan, any>;
    addSubscription: (data: { userId: string; plan: SubscriptionPlan; months: number }) => void;
    updateSubscriptionStatus: (id: string, status: SubscriptionStatus) => void;
    deleteSubscription: (id: string) => void;
    handleExportSubscriptions: () => void;
}

export function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
    const styles: Record<string, string> = {
        activa: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
        trial: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
        pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
        cancelada: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
        vencida: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600',
        limite_alcanzado: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    };
    const icons: Record<string, React.ElementType> = { activa: CheckCircle, trial: Clock, pendiente: Clock, cancelada: XCircle, vencida: Clock, limite_alcanzado: XCircle };
    const Icon = icons[status] || Clock;
    const labels: Record<string, string> = { activa: 'Activa', trial: 'Trial', pendiente: 'Pendiente', cancelada: 'Cancelada', vencida: 'Vencida', limite_alcanzado: 'Límite' };
    return (
        <Badge variant="outline" className={`${styles[status] || styles.pendiente} flex items-center gap-1`}>
            <Icon className="h-3 w-3" />
            {labels[status] || status}
        </Badge>
    );
}

export function PlanBadge({ plan }: { plan: SubscriptionPlan }) {
    const styles: Record<string, string> = {
        free: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
        basico: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        profesional: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        empresarial: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    };
    const labels: Record<string, string> = { free: 'Gratis', basico: 'Básico', profesional: 'Profesional', empresarial: 'Empresarial' };
    return <Badge className={styles[plan] || styles.basico}>{labels[plan] || plan}</Badge>;
}

export function SubscriptionsView({
    subscriptions,
    users,
    planLimits,
    addSubscription,
    updateSubscriptionStatus,
    deleteSubscription,
    handleExportSubscriptions
}: SubscriptionsViewProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewSubscription, setShowNewSubscription] = useState(false);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [newSubForm, setNewSubForm] = useState({ userId: '', plan: 'basico' as SubscriptionPlan, months: 12 });

    const filteredSubscriptions = subscriptions.filter(sub =>
        sub.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.plan.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateSubscription = () => {
        if (!newSubForm.userId) return;
        addSubscription(newSubForm);
        setShowNewSubscription(false);
        setNewSubForm({ userId: '', plan: 'basico', months: 12 });
    };

    return (
        <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <CardHeader className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-gray-800">
                <div>
                    <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                        <CreditCard className="h-4 w-4 text-violet-500" />
                        Suscripciones
                    </CardTitle>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{filteredSubscriptions.length} registros</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                        <Input placeholder="Buscar..." className="pl-9 h-9 w-full md:w-48 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={handleExportSubscriptions} className="h-9 w-9"><Download className="h-4 w-4" /></Button>
                        <Button onClick={() => setShowNewSubscription(true)} className="h-9 gap-1.5 text-sm bg-violet-600 hover:bg-violet-700 text-white"><Plus className="h-4 w-4" />Nueva</Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b dark:border-gray-800 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                <th className="px-6 py-3">ID</th>
                                <th className="px-6 py-3">Usuario</th>
                                <th className="px-6 py-3">Plan</th>
                                <th className="px-6 py-3">Estado</th>
                                <th className="px-6 py-3">Precio</th>
                                <th className="px-6 py-3">Vencimiento</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {filteredSubscriptions.map((sub) => {
                                const subscriber = users.find(u => u.id === sub.userId);
                                return (
                                    <tr key={sub.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors text-sm">
                                        <td className="px-6 py-4 font-mono text-xs text-gray-400">{sub.id}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{subscriber?.name || 'N/A'}</td>
                                        <td className="px-6 py-4"><PlanBadge plan={sub.plan} /></td>
                                        <td className="px-6 py-4"><SubscriptionStatusBadge status={sub.status} /></td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">{formatPrice(sub.price)}</td>
                                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{sub.endDate.toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setSelectedSubscription(sub)}>Detalles</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateSubscriptionStatus(sub.id, 'activa')}>Activar</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => updateSubscriptionStatus(sub.id, 'cancelada')}>Cancelar</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600" onClick={() => deleteSubscription(sub.id)}>Eliminar</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                <div className="md:hidden divide-y dark:divide-gray-800">
                    {filteredSubscriptions.map((sub) => {
                        const subscriber = users.find(u => u.id === sub.userId);
                        return (
                            <div key={sub.id} className="p-4 space-y-3 active:bg-gray-50 dark:active:bg-gray-800 transition-colors">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-xs font-bold text-gray-900 dark:text-white uppercase">{subscriber?.name || 'N/A'}</p>
                                        <p className="text-[10px] font-mono text-gray-400">ID: {sub.id}</p>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => setSelectedSubscription(sub)}>Detalles</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => updateSubscriptionStatus(sub.id, 'activa')}>Activar</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => updateSubscriptionStatus(sub.id, 'cancelada')}>Cancelar</DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-red-600" onClick={() => deleteSubscription(sub.id)}>Eliminar</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="flex flex-wrap gap-2 text-xs">
                                    <PlanBadge plan={sub.plan} />
                                    <SubscriptionStatusBadge status={sub.status} />
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-gray-500">Vence: {sub.endDate.toLocaleDateString()}</span>
                                    <span className="text-2xl font-bold dark:text-white">{formatPrice(sub.price)}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>

            <Dialog open={showNewSubscription} onOpenChange={setShowNewSubscription}>
                <DialogContent className="dark:bg-gray-800">
                    <DialogHeader><DialogTitle className="dark:text-white">Nueva Suscripción</DialogTitle><DialogDescription>Crea una nueva suscripción para un usuario</DialogDescription></DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label>Usuario</Label>
                            <Select value={newSubForm.userId} onValueChange={(v) => setNewSubForm(p => ({ ...p, userId: v }))}>
                                <SelectTrigger className="dark:bg-gray-700"><SelectValue placeholder="Seleccionar usuario" /></SelectTrigger>
                                <SelectContent className="dark:bg-gray-800">
                                    {users.filter(u => u.role !== 'admin').map(u => (<SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Plan</Label>
                            <Select value={newSubForm.plan} onValueChange={(v: SubscriptionPlan) => setNewSubForm(p => ({ ...p, plan: v }))}>
                                <SelectTrigger className="dark:bg-gray-700"><SelectValue /></SelectTrigger>
                                <SelectContent className="dark:bg-gray-800">
                                    <SelectItem value="free">Gratis - {formatPrice(0)}/mes</SelectItem>
                                    <SelectItem value="basico">Básico - {formatPrice(planLimits.basico.price)}/mes</SelectItem>
                                    <SelectItem value="profesional">Profesional - {formatPrice(planLimits.profesional.price)}/mes</SelectItem>
                                    <SelectItem value="empresarial">Empresarial - {formatPrice(planLimits.empresarial.price)}/mes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label>Duración (meses)</Label>
                            <Select value={newSubForm.months.toString()} onValueChange={(v) => setNewSubForm(p => ({ ...p, months: parseInt(v) }))}>
                                <SelectTrigger className="dark:bg-gray-700"><SelectValue /></SelectTrigger>
                                <SelectContent className="dark:bg-gray-800">
                                    <SelectItem value="1">1 mes</SelectItem><SelectItem value="3">3 meses</SelectItem>
                                    <SelectItem value="6">6 meses</SelectItem><SelectItem value="12">12 meses</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowNewSubscription(false)}>Cancelar</Button>
                        <Button onClick={handleCreateSubscription} disabled={!newSubForm.userId}>Crear</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
