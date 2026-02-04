
import { Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/utils/format';
import type { SubscriptionPlan } from '@/types';
import { toast } from 'sonner';

interface PlanConfigViewProps {
    planLimits: Record<SubscriptionPlan, any>;
    updatePlanLimits: (plan: SubscriptionPlan, updates: any) => void;
}

export function PlanConfigView({ planLimits, updatePlanLimits }: PlanConfigViewProps) {
    return (
        <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <CardHeader className="p-4 sm:p-6 border-b dark:border-gray-800">
                <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                    <Filter className="h-4 w-4 text-violet-500" />
                    Configuración de Planes
                </CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400">Modifica precios y límites globales del sistema</p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {(Object.keys(planLimits) as Array<SubscriptionPlan>).map((planKey) => (
                        <div key={planKey} className="p-4 rounded-xl border dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs text-white font-bold ${planKey === 'free' ? 'bg-gray-400' :
                                        planKey === 'basico' ? 'bg-blue-500' :
                                            planKey === 'profesional' ? 'bg-purple-500' : 'bg-amber-500'
                                        }`}>
                                        {planKey.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="font-bold text-sm capitalize dark:text-white">{planKey}</span>
                                </div>
                                <Badge variant="outline" className="text-[10px] h-5">{formatPrice(planLimits[planKey].price)}/mes</Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-gray-400">Precio ($)</Label>
                                    <Input
                                        type="text"
                                        value={planLimits[planKey].price.toLocaleString('es-AR')}
                                        className="h-8 text-xs bg-white dark:bg-gray-900"
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '');
                                            updatePlanLimits(planKey, { price: parseInt(val) || 0 });
                                        }}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-gray-400">Ventas/mes</Label>
                                    <Input
                                        type="number"
                                        value={planLimits[planKey].maxSalesPerMonth}
                                        className="h-8 text-xs bg-white dark:bg-gray-900"
                                        onChange={(e) => updatePlanLimits(planKey, { maxSalesPerMonth: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-gray-400">Max Prod.</Label>
                                    <Input
                                        type="number"
                                        value={planLimits[planKey].maxProducts}
                                        className="h-8 text-xs bg-white dark:bg-gray-900"
                                        onChange={(e) => updatePlanLimits(planKey, { maxProducts: parseInt(e.target.value) || 0 })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-gray-400">Max Tiendas</Label>
                                    <Input
                                        type="number"
                                        value={planLimits[planKey].maxStores}
                                        className="h-8 text-xs bg-white dark:bg-gray-900"
                                        onChange={(e) => updatePlanLimits(planKey, { maxStores: parseInt(e.target.value) || 1 })}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end pt-4">
                    <Button onClick={() => toast.success('Configuración de planes guardada')} className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-9">
                        Guardar Cambios
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
