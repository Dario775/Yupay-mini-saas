
import { useState } from 'react';
import {
    Settings, Truck, CreditCard, MapPin,
    Loader2, CheckCircle, Plus, MoreHorizontal,
    Wallet, Banknote, Home, User, Crown, Zap, Sparkles, Check, ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import LocationMap from '@/components/ui/LocationMap';
import { formatPrice } from '@/utils/format';
import { searchAddresses, getCurrentPosition, reverseGeocode } from '@/lib/geo';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import type { Store, ShippingMethod, PaymentMethod, GeoLocation, Subscription } from '@/types';

interface SettingsViewProps {
    store: Store | null;
    updateStoreInfo: (info: Partial<Store>) => void;
    shippingMethods: ShippingMethod[];
    addShippingMethod: (method: Omit<ShippingMethod, 'id'>) => void;
    updateShippingMethod: (id: string, updates: Partial<ShippingMethod>) => void;
    deleteShippingMethod: (id: string) => void;
    paymentMethods: PaymentMethod[];
    addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void;
    updatePaymentMethod: (id: string, updates: Partial<PaymentMethod>) => void;
    deletePaymentMethod: (id: string) => void;
    subscription?: Subscription | null;
    salesThisMonth?: number;
    productsCount?: number;
    defaultTab?: string;
}

// Plan definitions
const PLANS = [
    {
        id: 'free',
        name: 'Gratuito',
        price: 0,
        maxSales: 5,
        maxProducts: 10,
        features: ['5 ventas/mes', '10 productos', 'Soporte por email'],
        icon: Zap,
        color: 'gray'
    },
    {
        id: 'basico',
        name: 'Básico',
        price: 5000,
        maxSales: 50,
        maxProducts: 100,
        features: ['50 ventas/mes', '100 productos', 'Estadísticas básicas', 'Soporte prioritario'],
        icon: Sparkles,
        color: 'blue',
        popular: false
    },
    {
        id: 'profesional',
        name: 'Profesional',
        price: 15000,
        maxSales: 500,
        maxProducts: 1000,
        features: ['500 ventas/mes', '1000 productos', 'Ofertas Flash', '3 tiendas', 'Estadísticas avanzadas'],
        icon: Crown,
        color: 'violet',
        popular: true
    },
    {
        id: 'empresarial',
        name: 'Empresarial',
        price: 45000,
        maxSales: -1,
        maxProducts: -1,
        features: ['Ventas ilimitadas', 'Productos ilimitados', 'Hasta 10 tiendas', 'API access', 'Soporte dedicado'],
        icon: Crown,
        color: 'amber'
    }
];

export function SettingsView({
    store,
    updateStoreInfo,
    shippingMethods,
    addShippingMethod,
    updateShippingMethod,
    deleteShippingMethod,
    paymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    subscription,
    salesThisMonth = 0,
    productsCount = 0,
    defaultTab = 'general'
}: SettingsViewProps) {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState(defaultTab);

    // Profile State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        email: user?.email || '',
    });

    // Location State
    const [locationQuery, setLocationQuery] = useState(store?.address || '');
    const [locationSuggestions, setLocationSuggestions] = useState<GeoLocation[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isLocating, setIsLocating] = useState(false);

    // Shipping State
    const [showNewShipping, setShowNewShipping] = useState(false);
    const [newShipping, setNewShipping] = useState({ name: '', price: '', estimatedDays: '', description: '' });
    const [editingShipping, setEditingShipping] = useState<ShippingMethod | null>(null);

    // Payment State
    const [showNewPayment, setShowNewPayment] = useState(false);
    const [newPayment, setNewPayment] = useState({ type: 'transferencia' as const, name: '', description: '', instructions: '' });
    const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);

    // Plan Upgrade State
    const [isUpgrading, setIsUpgrading] = useState(false);
    const [selectedUpgradePlan, setSelectedUpgradePlan] = useState<string | null>(null);

    const currentPlan = subscription?.plan || 'free';
    const currentPlanIndex = PLANS.findIndex(p => p.id === currentPlan);

    // Handle plan upgrade with MercadoPago
    const handlePlanUpgrade = async (targetPlanId: string) => {
        const targetPlan = PLANS.find(p => p.id === targetPlanId);
        if (!targetPlan || !user || !store) {
            toast.error('Faltan datos de usuario o tienda. Recarga la página.');
            return;
        }

        setIsUpgrading(true);
        setSelectedUpgradePlan(targetPlanId);

        try {
            console.log('📋 Creating upgrade request...', { userId: user.id, storeId: store.id, subscriptionId: subscription?.id });

            // Build insert data - subscription_id can be null
            const insertData: Record<string, any> = {
                user_id: user.id,
                store_id: store.id,
                current_plan: currentPlan,
                target_plan: targetPlanId,
                amount: targetPlan.price,
                status: 'pending'
            };

            // Only add subscription_id if it exists
            if (subscription?.id) {
                insertData.subscription_id = subscription.id;
            }

            // Create upgrade request in database
            const { data: upgradeRequest, error: dbError } = await supabase
                .from('plan_upgrade_requests')
                .insert(insertData)
                .select()
                .single();

            if (dbError) {
                console.error('❌ DB Error:', dbError);
                throw new Error(`Error en base de datos: ${dbError.message}`);
            }

            console.log('✅ Upgrade request created:', upgradeRequest.id);

            // Call Edge Function to create MercadoPago preference
            console.log('🔗 Calling MercadoPago Edge Function...');
            const { data: mpData, error: mpError } = await supabase.functions.invoke('create-mp-preference', {
                body: {
                    upgradeRequestId: upgradeRequest.id,
                    planName: targetPlan.name,
                    amount: targetPlan.price,
                    userEmail: user.email
                }
            });

            if (mpError) {
                console.error('❌ MP Error:', mpError);
                const errorMsg = mpError.message || 'Error desconocido';
                throw new Error(`Error con MercadoPago: ${errorMsg}`);
            }

            console.log('✅ MercadoPago response:', mpData);

            // Check if mpData has error details from Edge Function
            if (mpData?.error) {
                console.error('❌ Edge Function returned error:', mpData);
                throw new Error(mpData.error + (mpData.details ? `\n${mpData.details}` : ''));
            }

            // Redirect to MercadoPago checkout
            if (mpData?.init_point) {
                toast.success('Redirigiendo a MercadoPago...');
                window.location.href = mpData.init_point;
            } else if (mpData?.sandbox_init_point) {
                // Use sandbox URL if available (for testing)
                toast.success('Redirigiendo a MercadoPago (sandbox)...');
                window.location.href = mpData.sandbox_init_point;
            } else {
                console.error('❌ No init_point in response:', mpData);
                throw new Error('No se recibió URL de pago de MercadoPago');
            }
        } catch (error: any) {
            console.error('❌ Error creating upgrade request:', error);
            toast.error(error.message || 'Error al procesar la solicitud de upgrade');
        } finally {
            setIsUpgrading(false);
            setSelectedUpgradePlan(null);
        }
    };

    // Location Handlers
    const handleSearchLocation = async (query: string) => {
        setLocationQuery(query);
        if (query.length > 2) {
            const results = await searchAddresses(query);
            setLocationSuggestions(results);
            setShowSuggestions(true);
        } else {
            setLocationSuggestions([]);
            setShowSuggestions(false);
        }
    };

    const handleSelectLocation = (location: GeoLocation) => {
        setLocationQuery(location.address);
        updateStoreInfo({
            address: location.address,
            location: location
        });
        setShowSuggestions(false);
        toast.success('Ubicación actualizada');
    };

    const handleCurrentLocation = async () => {
        setIsLocating(true);
        try {
            const { lat, lng } = await getCurrentPosition();
            const location = await reverseGeocode(lat, lng);
            if (location) {
                handleSelectLocation(location);
            } else {
                toast.error('No se pudo obtener la dirección exacta');
            }
        } catch (error) {
            console.error(error);
            toast.error('Error al obtener tu ubicación. Verifica los permisos.');
        } finally {
            setIsLocating(false);
        }
    };

    const handleMapLocationChange = async (lat: number, lng: number) => {
        const currentLocation = store?.location || { address: '', lat, lng, locality: '', province: '' };
        updateStoreInfo({
            location: { ...currentLocation, lat, lng }
        });

        const newLocation = await reverseGeocode(lat, lng);
        if (newLocation) {
            setLocationQuery(newLocation.address);
            updateStoreInfo({
                address: newLocation.address,
                location: newLocation
            });
        }
    };

    const handleUpdateProfile = async () => {
        if (!user) return;
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    name: profileData.name,
                    phone: profileData.phone,
                })
                .eq('id', user.id);

            if (error) throw error;
            toast.success('Perfil actualizado correctamente');
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error('Error al actualizar el perfil');
        }
    };

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="bg-white dark:bg-gray-800 p-1 rounded-lg border dark:border-gray-800">
                <TabsTrigger value="profile" className="text-xs"><User className="h-3 w-3 mr-1.5" />Perfil</TabsTrigger>
                <TabsTrigger value="subscription" className="text-xs"><Crown className="h-3 w-3 mr-1.5" />Mi Plan</TabsTrigger>
                <TabsTrigger value="general" className="text-xs"><Settings className="h-3 w-3 mr-1.5" />General</TabsTrigger>
                <TabsTrigger value="shipping" className="text-xs"><Truck className="h-3 w-3 mr-1.5" />Envíos</TabsTrigger>
                <TabsTrigger value="payments" className="text-xs"><CreditCard className="h-3 w-3 mr-1.5" />Cobros</TabsTrigger>
            </TabsList>


            <TabsContent value="profile">
                <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    <CardHeader className="p-4 sm:p-6 border-b dark:border-gray-800">
                        <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                            <User className="h-4 w-4 text-violet-500" />
                            Perfil del Dueño
                        </CardTitle>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Gestiona tus datos personales</p>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Nombre Completo</Label>
                                <Input
                                    value={profileData.name}
                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                    className="dark:bg-gray-800"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Email</Label>
                                <Input
                                    value={profileData.email}
                                    disabled
                                    className="bg-gray-100 dark:bg-gray-800 cursor-not-allowed text-gray-500"
                                />
                                <p className="text-[10px] text-gray-500">El email no se puede cambiar por seguridad.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Teléfono</Label>
                                <Input
                                    value={profileData.phone}
                                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                    className="dark:bg-gray-800"
                                    placeholder="+54 11 ..."
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4">
                            <Button onClick={handleUpdateProfile} className="bg-violet-600 hover:bg-violet-700 text-white">Guardar Cambios</Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            {/* Subscription Tab */}
            <TabsContent value="subscription" className="space-y-6">
                {/* Current Plan Card */}
                {(() => {
                    const activePlanData = PLANS.find(p => p.id === currentPlan) || PLANS[0];
                    const ActiveIcon = activePlanData.icon;
                    const colorClasses = {
                        gray: 'from-slate-600 to-slate-800 text-slate-50',
                        blue: 'from-blue-600 to-indigo-700 text-blue-50',
                        violet: 'from-violet-600 to-purple-700 text-violet-50',
                        amber: 'from-amber-500 to-orange-600 text-amber-50'
                    }[activePlanData.color || 'gray'];

                    const accentClasses = {
                        gray: 'bg-white/10 text-slate-200',
                        blue: 'bg-white/10 text-blue-100',
                        violet: 'bg-white/10 text-violet-100',
                        amber: 'bg-white/10 text-amber-100'
                    }[activePlanData.color || 'gray'];

                    return (
                        <Card className={`bg-gradient-to-br ${colorClasses} border-0 shadow-xl overflow-hidden relative`}>
                            {/* Decorative Background Icon */}
                            <div className="absolute -right-8 -bottom-8 opacity-10 rotate-12">
                                <ActiveIcon className="h-40 w-40" />
                            </div>

                            <CardContent className="p-6 relative z-10">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-md">
                                                <ActiveIcon className="h-4 w-4" />
                                            </div>
                                            <p className="opacity-80 text-[10px] font-black uppercase tracking-[0.2em]">Tu plan actual</p>
                                        </div>
                                        <h3 className="text-3xl font-black mt-1 capitalize tracking-tight">{activePlanData.name}</h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 text-[10px] font-bold py-0 h-5">
                                                {subscription?.status === 'trial' ? 'En Prueba' : subscription?.status === 'activa' ? 'Cuenta Activa' : 'Pendiente'}
                                            </Badge>
                                            {subscription?.status === 'trial' && (
                                                <span className="text-xs font-medium opacity-80">
                                                    Quedan {Math.max(0, Math.ceil(((subscription?.trialEndDate?.getTime() || 0) - Date.now()) / (1000 * 60 * 60 * 24)))} días
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 shadow-inner">
                                        <ActiveIcon className="h-10 w-10 text-white drop-shadow-lg" />
                                    </div>
                                </div>

                                {/* Usage Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 mt-8">
                                    <div className={`${accentClasses} backdrop-blur-md rounded-2xl p-4 border border-white/5`}>
                                        <p className="opacity-70 text-[10px] font-bold uppercase tracking-wider mb-1">Ventas este mes</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black">{salesThisMonth}</span>
                                            <span className="text-xs opacity-60">/ {activePlanData.maxSales === -1 ? '∞' : activePlanData.maxSales}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-black/10 rounded-full mt-2 overflow-hidden">
                                            <div
                                                className="h-full bg-white rounded-full transition-all duration-1000"
                                                style={{ width: `${activePlanData.maxSales === -1 ? 0 : Math.min(100, (salesThisMonth / activePlanData.maxSales) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className={`${accentClasses} backdrop-blur-md rounded-2xl p-4 border border-white/5`}>
                                        <p className="opacity-70 text-[10px] font-bold uppercase tracking-wider mb-1">Productos</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black">{productsCount}</span>
                                            <span className="text-xs opacity-60">/ {activePlanData.maxProducts === -1 ? '∞' : activePlanData.maxProducts}</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-black/10 rounded-full mt-2 overflow-hidden">
                                            <div
                                                className="h-full bg-white rounded-full transition-all duration-1000"
                                                style={{ width: `${activePlanData.maxProducts === -1 ? 0 : Math.min(100, (productsCount / activePlanData.maxProducts) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })()}

                {/* Available Plans */}
                <div>
                    <h3 className="text-lg font-semibold mb-4 dark:text-white">Planes disponibles</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {PLANS.map((plan, index) => {
                            const isCurrentPlan = plan.id === currentPlan;
                            const isDowngrade = index < currentPlanIndex;
                            const Icon = plan.icon;

                            return (
                                <Card
                                    key={plan.id}
                                    className={`relative overflow-hidden transition-all duration-300 ${isCurrentPlan
                                        ? 'ring-4 ring-violet-500 shadow-xl scale-[1.02] bg-violet-50/50 dark:bg-violet-900/20 z-10'
                                        : 'bg-white dark:bg-gray-900 hover:shadow-md border border-gray-200 dark:border-gray-800 opacity-90 hover:opacity-100'
                                        }`}
                                >
                                    {isCurrentPlan && (
                                        <div className="absolute top-0 left-0 bg-violet-600 text-white text-[10px] font-black px-3 py-1 rounded-br-lg shadow-lg flex items-center gap-1 z-20">
                                            <Check className="h-3 w-3 stroke-[4]" />
                                            TU PLAN
                                        </div>
                                    )}
                                    {plan.popular && !isCurrentPlan && (
                                        <div className={`absolute top-0 right-0 ${plan.color === 'blue' ? 'bg-blue-500' :
                                            plan.color === 'violet' ? 'bg-violet-500' :
                                                plan.color === 'amber' ? 'bg-amber-500' : 'bg-gray-500'
                                            } text-white text-[10px] font-black px-3 py-1 rounded-bl-lg shadow-sm uppercase tracking-tighter`}>
                                            MÁS POPULAR
                                        </div>
                                    )}
                                    <CardContent className="p-5 pt-8 flex flex-col h-full">
                                        <div className="flex-1">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-sm ${plan.color === 'gray' ? 'bg-gray-100 text-gray-600' :
                                                plan.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                                                    plan.color === 'violet' ? 'bg-violet-100 text-violet-600' :
                                                        'bg-amber-100 text-amber-600'
                                                }`}>
                                                <Icon className="h-6 w-6" />
                                            </div>

                                            <h4 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h4>
                                            <div className="mt-2 flex items-baseline gap-1">
                                                <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
                                                    {plan.price === 0 ? 'Gratis' : formatPrice(plan.price)}
                                                </span>
                                                {plan.price > 0 && <span className="text-gray-500 text-xs font-medium">/mes</span>}
                                            </div>

                                            <ul className="mt-6 space-y-3">
                                                {plan.features.map((feature, i) => (
                                                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 dark:text-gray-400">
                                                        <div className={`mt-0.5 rounded-full p-0.5 ${isCurrentPlan ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                                            <Check className={`h-3 w-3 ${isCurrentPlan ? 'text-green-600' : 'text-gray-500'}`} />
                                                        </div>
                                                        <span className="leading-tight">{feature}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="mt-8 flex justify-center">
                                            {isCurrentPlan ? (
                                                <Button disabled className="w-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 border-2 border-violet-200 dark:border-violet-800 font-bold opacity-100 cursor-default shadow-sm py-6">
                                                    <CheckCircle className="h-5 w-5 mr-2" />
                                                    Plan Activo
                                                </Button>
                                            ) : isDowngrade ? (
                                                <Button disabled variant="ghost" className="w-full text-gray-400 py-6">
                                                    Plan inferior
                                                </Button>
                                            ) : (
                                                <Button
                                                    className={`w-full py-6 font-bold shadow-md transition-all active:scale-95 ${plan.color === 'violet'
                                                        ? 'bg-violet-600 hover:bg-violet-700 shadow-violet-200 dark:shadow-none'
                                                        : plan.color === 'amber'
                                                            ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-200 dark:shadow-none'
                                                            : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200 dark:shadow-none'
                                                        } text-white flex items-center justify-center gap-2`}
                                                    onClick={() => handlePlanUpgrade(plan.id)}
                                                    disabled={isUpgrading}
                                                >
                                                    {isUpgrading && selectedUpgradePlan === plan.id ? (
                                                        <><Loader2 className="h-5 w-5 animate-spin" /> Procesando...</>
                                                    ) : (
                                                        <>Mejorar a {plan.name} <ArrowRight className="h-5 w-5" /></>
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </div>

                {/* Payment Info */}
                <Card className="bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                    <CardContent className="p-4 flex items-start gap-3">
                        <Wallet className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Pagos seguros con MercadoPago</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                                Al hacer clic en "Mejorar" serás redirigido a MercadoPago para completar el pago de forma segura.
                                El plan se activará automáticamente al confirmar el pago.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="general">
                <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    <CardHeader className="p-4 sm:p-6 border-b dark:border-gray-800">
                        <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                            <Settings className="h-4 w-4 text-violet-500" />
                            Configuración General
                        </CardTitle>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Gestiona los datos de tu tienda</p>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nombre de la tienda</Label>
                                <Input
                                    value={store?.name || ''}
                                    onChange={(e) => updateStoreInfo({ name: e.target.value })}
                                    className="h-9 text-sm bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Categoría</Label>
                                <Input
                                    value={store?.category || ''}
                                    onChange={(e) => updateStoreInfo({ category: e.target.value })}
                                    className="h-9 text-sm bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800"
                                />
                            </div>
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Descripción</Label>
                                <Textarea
                                    value={store?.description || ''}
                                    onChange={(e) => updateStoreInfo({ description: e.target.value })}
                                    rows={3}
                                    className="text-sm bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800"
                                />
                            </div>

                            {/* Location Input with Autocomplete */}
                            <div className="space-y-1.5 sm:col-span-2 relative">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Ubicación / Dirección</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <Input
                                            value={locationQuery}
                                            onChange={(e) => handleSearchLocation(e.target.value)}
                                            placeholder="Buscar dirección..."
                                            className="pl-9 h-9 text-sm bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800"
                                        />
                                        {showSuggestions && locationSuggestions.length > 0 && (
                                            <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                                {locationSuggestions.map((suggestion, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => handleSelectLocation(suggestion)}
                                                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 transition-colors border-b dark:border-gray-700 last:border-0"
                                                    >
                                                        <p className="font-medium text-xs sm:text-sm">{suggestion.address}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={handleCurrentLocation}
                                        disabled={isLocating}
                                        className="h-9 w-9 shrink-0 bg-white dark:bg-gray-800"
                                        title="Usar mi ubicación actual"
                                    >
                                        {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4 text-violet-500" />}
                                    </Button>
                                </div>
                                {store?.location && (
                                    <div className="space-y-2 mt-2">
                                        <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                            <CheckCircle className="h-3 w-3" /> Ubicación verificada: {store.location.locality}, {store.location.province}
                                        </p>
                                        <div className="h-48 w-full rounded-lg overflow-hidden border dark:border-gray-700">
                                            <LocationMap
                                                lat={store.location.lat}
                                                lng={store.location.lng}
                                                onLocationChange={handleMapLocationChange}
                                            />
                                        </div>
                                        <p className="text-[10px] text-gray-400 text-center">
                                            Arrastra el pin para ajustar la ubicación exacta
                                        </p>
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Teléfono</Label>
                                <Input
                                    value={store?.phone || ''}
                                    onChange={(e) => updateStoreInfo({ phone: e.target.value })}
                                    className="h-9 text-sm bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Email</Label>
                                <Input
                                    value={store?.email || ''}
                                    onChange={(e) => updateStoreInfo({ email: e.target.value })}
                                    className="h-9 text-sm bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end pt-2">
                            <Button onClick={() => toast.success('Configuración guardada')} className="bg-violet-600 hover:bg-violet-700 text-white text-sm h-9 px-6">Guardar cambios</Button>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="shipping">
                <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    <CardHeader className="p-4 sm:p-6 flex flex-row items-center justify-between border-b dark:border-gray-800">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                                <Truck className="h-4 w-4 text-violet-500" />
                                Métodos de Envío
                            </CardTitle>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{shippingMethods.length} opciones</p>
                        </div>
                        <Button onClick={() => setShowNewShipping(true)} className="h-9 gap-1.5 text-sm bg-violet-600 hover:bg-violet-700 text-white"><Plus className="h-4 w-4" />Nuevo</Button>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 space-y-3">
                        {shippingMethods.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <Truck className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">Sin métodos de envío</p>
                            </div>
                        ) : (
                            shippingMethods.map(method => (
                                <div key={method.id} className="flex items-center justify-between p-3 rounded-xl border dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500">
                                            <Truck className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-900 dark:text-white">{method.name}</h4>
                                            <p className="text-[10px] text-gray-500">{method.estimatedDays} • {method.price === 0 ? 'Gratis' : formatPrice(method.price)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Switch checked={method.isActive} onCheckedChange={() => updateShippingMethod(method.id, { isActive: !method.isActive })} className="scale-75" />
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setEditingShipping(method)}>Editar</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600" onClick={() => deleteShippingMethod(method.id)}>Eliminar</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))
                        )}
                    </CardContent>
                </Card>

                {/* Modal Nuevo Método de Envío */}
                <Dialog open={showNewShipping} onOpenChange={setShowNewShipping}>
                    <DialogContent className="dark:bg-gray-800">
                        <DialogHeader>
                            <DialogTitle className="dark:text-white">Nuevo Método de Envío</DialogTitle>
                            <DialogDescription>Configura una nueva opción de envío</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2"><Label>Nombre *</Label><Input value={newShipping.name} onChange={(e) => setNewShipping({ ...newShipping, name: e.target.value })} placeholder="Ej: Envío express" className="dark:bg-gray-700" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Precio ($)</Label><Input type="number" value={newShipping.price} onChange={(e) => setNewShipping({ ...newShipping, price: e.target.value })} placeholder="0 = Gratis" className="dark:bg-gray-700" /></div>
                                <div className="space-y-2"><Label>Tiempo estimado *</Label><Input value={newShipping.estimatedDays} onChange={(e) => setNewShipping({ ...newShipping, estimatedDays: e.target.value })} placeholder="Ej: 3-5 días" className="dark:bg-gray-700" /></div>
                            </div>
                            <div className="space-y-2"><Label>Descripción (opcional)</Label><Input value={newShipping.description} onChange={(e) => setNewShipping({ ...newShipping, description: e.target.value })} placeholder="Detalles adicionales" className="dark:bg-gray-700" /></div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowNewShipping(false)}>Cancelar</Button>
                            <Button onClick={() => {
                                if (!newShipping.name || !newShipping.estimatedDays) { toast.error('Completa los campos requeridos'); return; }
                                addShippingMethod({ name: newShipping.name, price: parseFloat(newShipping.price) || 0, estimatedDays: newShipping.estimatedDays, description: newShipping.description || undefined, isActive: true });
                                toast.success('Método de envío creado');
                                setNewShipping({ name: '', price: '', estimatedDays: '', description: '' });
                                setShowNewShipping(false);
                            }}>Crear Método</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Modal Editar Método de Envío */}
                <Dialog open={!!editingShipping} onOpenChange={() => setEditingShipping(null)}>
                    <DialogContent className="dark:bg-gray-800">
                        <DialogHeader><DialogTitle className="dark:text-white">Editar Método de Envío</DialogTitle></DialogHeader>
                        {editingShipping && (
                            <div className="space-y-4">
                                <div className="space-y-2"><Label>Nombre</Label><Input value={editingShipping.name} onChange={(e) => setEditingShipping({ ...editingShipping, name: e.target.value })} className="dark:bg-gray-700" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><Label>Precio ($)</Label><Input type="number" value={editingShipping.price} onChange={(e) => setEditingShipping({ ...editingShipping, price: parseFloat(e.target.value) || 0 })} className="dark:bg-gray-700" /></div>
                                    <div className="space-y-2"><Label>Tiempo estimado</Label><Input value={editingShipping.estimatedDays} onChange={(e) => setEditingShipping({ ...editingShipping, estimatedDays: e.target.value })} className="dark:bg-gray-700" /></div>
                                </div>
                                <div className="space-y-2"><Label>Descripción</Label><Input value={editingShipping.description || ''} onChange={(e) => setEditingShipping({ ...editingShipping, description: e.target.value })} className="dark:bg-gray-700" /></div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingShipping(null)}>Cancelar</Button>
                            <Button onClick={() => {
                                if (editingShipping) {
                                    updateShippingMethod(editingShipping.id, editingShipping);
                                    toast.success('Método actualizado');
                                    setEditingShipping(null);
                                }
                            }}>Guardar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </TabsContent>

            <TabsContent value="payments">
                <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    <CardHeader className="p-4 sm:p-6 flex flex-row items-center justify-between border-b dark:border-gray-800">
                        <div>
                            <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                                <CreditCard className="h-4 w-4 text-violet-500" />
                                Métodos de Pago
                            </CardTitle>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{paymentMethods.length} métodos</p>
                        </div>
                        <Button onClick={() => setShowNewPayment(true)} className="h-9 gap-1.5 text-sm bg-violet-600 hover:bg-violet-700 text-white"><Plus className="h-4 w-4" />Nuevo</Button>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 space-y-3">
                        {paymentMethods.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                <p className="text-sm">Sin métodos de pago</p>
                            </div>
                        ) : (
                            paymentMethods.map(method => {
                                const Icon = method.type === 'mercadopago' ? Wallet : method.type === 'efectivo' ? Banknote : CreditCard;
                                return (
                                    <div key={method.id} className="flex items-center justify-between p-3 rounded-xl border dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500">
                                                <Icon className="h-4 w-4" />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-gray-900 dark:text-white">{method.name}</h4>
                                                <p className="text-[10px] text-gray-500 line-clamp-1">{method.description || 'Sin datos'}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Switch checked={method.isActive} onCheckedChange={() => updatePaymentMethod(method.id, { isActive: !method.isActive })} className="scale-75" />
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => setEditingPayment(method)}>Editar</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-red-600" onClick={() => deletePaymentMethod(method.id)}>Eliminar</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>

                {/* Modal Nuevo Método de Pago */}
                <Dialog open={showNewPayment} onOpenChange={setShowNewPayment}>
                    <DialogContent className="dark:bg-gray-800">
                        <DialogHeader>
                            <DialogTitle className="dark:text-white">Nuevo Método de Pago</DialogTitle>
                            <DialogDescription>Configura una nueva forma de pago</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Tipo de pago</Label>
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { value: 'transferencia', label: 'Transferencia', icon: CreditCard },
                                        { value: 'mercadopago', label: 'MercadoPago', icon: Wallet },
                                        { value: 'efectivo', label: 'Efectivo', icon: Banknote },
                                        { value: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
                                    ].map(opt => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            onClick={() => setNewPayment({ ...newPayment, type: opt.value as any, name: opt.label })}
                                            className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${newPayment.type === opt.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'}`}
                                        >
                                            <opt.icon className={`h-4 w-4 ${newPayment.type === opt.value ? 'text-blue-600' : 'text-gray-500'}`} />
                                            <span className={`text-sm ${newPayment.type === opt.value ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-600 dark:text-gray-300'}`}>{opt.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2"><Label>Nombre personalizado</Label><Input value={newPayment.name} onChange={(e) => setNewPayment({ ...newPayment, name: e.target.value })} placeholder="Ej: MercadoPago cuotas" className="dark:bg-gray-700" /></div>
                            <div className="space-y-2"><Label>Datos (CBU, Alias, etc.)</Label><Input value={newPayment.description} onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })} placeholder="CBU: 123... o Alias: mitienda.mp" className="dark:bg-gray-700" /></div>
                            <div className="space-y-2"><Label>Instrucciones adicionales</Label><Input value={newPayment.instructions} onChange={(e) => setNewPayment({ ...newPayment, instructions: e.target.value })} placeholder="Enviar comprobante por WhatsApp" className="dark:bg-gray-700" /></div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setShowNewPayment(false)}>Cancelar</Button>
                            <Button onClick={() => {
                                if (!newPayment.name) { toast.error('Ingresa un nombre'); return; }
                                addPaymentMethod({ type: newPayment.type, name: newPayment.name, description: newPayment.description || undefined, instructions: newPayment.instructions || undefined, isActive: true });
                                toast.success('Método de pago creado');
                                setNewPayment({ type: 'transferencia', name: '', description: '', instructions: '' });
                                setShowNewPayment(false);
                            }}>Crear Método</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Modal Editar Método de Pago */}
                <Dialog open={!!editingPayment} onOpenChange={() => setEditingPayment(null)}>
                    <DialogContent className="dark:bg-gray-800">
                        <DialogHeader><DialogTitle className="dark:text-white">Editar Método de Pago</DialogTitle></DialogHeader>
                        {editingPayment && (
                            <div className="space-y-4">
                                <div className="space-y-2"><Label>Nombre</Label><Input value={editingPayment.name} onChange={(e) => setEditingPayment({ ...editingPayment, name: e.target.value })} className="dark:bg-gray-700" /></div>
                                <div className="space-y-2"><Label>Datos</Label><Input value={editingPayment.description || ''} onChange={(e) => setEditingPayment({ ...editingPayment, description: e.target.value })} className="dark:bg-gray-700" /></div>
                                <div className="space-y-2"><Label>Instrucciones</Label><Input value={editingPayment.instructions || ''} onChange={(e) => setEditingPayment({ ...editingPayment, instructions: e.target.value })} className="dark:bg-gray-700" /></div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setEditingPayment(null)}>Cancelar</Button>
                            <Button onClick={() => {
                                if (editingPayment) {
                                    updatePaymentMethod(editingPayment.id, editingPayment);
                                    toast.success('Método actualizado');
                                    setEditingPayment(null);
                                }
                            }}>Guardar</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </TabsContent>
        </Tabs>
    );
}
