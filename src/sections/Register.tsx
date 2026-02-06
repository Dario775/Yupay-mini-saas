import { useState } from 'react';
import {
    Store,
    Rocket,
    Check,
    Crown,
    Zap,
    Building2,
    ArrowRight,
    ArrowLeft,
    Eye,
    EyeOff,
    Loader2,
    Gift,
    Clock,
    User,
    ShoppingBag
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import type { RegisterStoreData, SubscriptionPlan } from '@/types';
import { toast } from 'sonner';

const PLAN_FEATURES = {
    free: {
        name: 'Gratis',
        icon: Gift,
        price: 0,
        color: 'from-gray-500 to-gray-600',
        features: ['5 ventas por mes', '10 productos', '1 tienda', 'Soporte por email'],
    },
    basico: {
        name: 'Básico',
        icon: Zap,
        price: 9.99,
        color: 'from-blue-500 to-blue-600',
        features: ['50 ventas por mes', '100 productos', '1 tienda', 'Reportes básicos', 'Soporte prioritario'],
    },
    profesional: {
        name: 'Profesional',
        icon: Crown,
        price: 29.99,
        color: 'from-purple-500 to-purple-600',
        popular: true,
        features: ['500 ventas por mes', '1000 productos', '3 tiendas', 'Reportes avanzados', 'Soporte 24/7'],
    },
    empresarial: {
        name: 'Empresarial',
        icon: Building2,
        price: 99.99,
        color: 'from-orange-500 to-orange-600',
        features: ['Ventas ilimitadas', 'Productos ilimitados', '10 tiendas', 'API access', 'Gerente de cuenta'],
    },
};

interface RegisterProps {
    onBack: () => void;
    onSuccess: () => void;
}

export default function Register({ onBack, onSuccess }: RegisterProps) {
    const { register, isLoading } = useAuth();
    const [step, setStep] = useState(0); // 0: Tipo de cuenta, 1: Datos, 2: Plan, 3: Confirmación
    const [accountType, setAccountType] = useState<'tienda' | 'cliente' | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('profesional');

    const [formData, setFormData] = useState<RegisterStoreData>({
        storeName: '',
        ownerName: '',
        email: '',
        password: '',
        category: '',
        phone: '',
    });

    const [errors, setErrors] = useState<Partial<Record<keyof RegisterStoreData, string>>>({});

    const validateStep1 = () => {
        const newErrors: typeof errors = {};
        if (!formData.storeName.trim()) newErrors.storeName = 'Nombre de tienda requerido';
        if (!formData.ownerName.trim()) newErrors.ownerName = 'Tu nombre es requerido';
        if (!formData.email.trim()) newErrors.email = 'Email requerido';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email inválido';
        if (!formData.password) newErrors.password = 'Contraseña requerida';
        else if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';
        if (!formData.category.trim()) newErrors.category = 'Categoría requerida';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNext = () => {
        if (step === 1 && validateStep1()) {
            setStep(2);
        } else if (step === 2) {
            setStep(3);
        }
    };

    const handleRegister = async () => {
        try {
            const result = await register(formData);

            if (result.emailConfirmationRequired) {
                toast.success('¡Registro exitoso! Por favor revisa tu email para confirmar tu cuenta.', {
                    duration: 6000,
                    icon: <Check className="h-5 w-5 text-green-500" />
                });
                // Podríamos redirigir al login o reiniciar el form
                onBack(); // Volver al inicio
                return;
            }

            toast.success('¡Cuenta creada exitosamente!');
            onSuccess();
        } catch (error) {
            // El error ya lo maneja el hook useAuth y lo muestra en el estado authError si es necesario,
            // pero aquí mostramos u feedback visual inmediato.
            // toast.error('Error al crear la cuenta'); 
        }
    };

    // Registro simplificado para clientes
    const handleSubmit = async () => {
        const newErrors: Partial<Record<keyof RegisterStoreData, string>> = {};
        if (!formData.ownerName.trim()) newErrors.ownerName = 'Tu nombre es requerido';
        if (!formData.email.trim()) newErrors.email = 'El email es requerido';
        if (!formData.email.includes('@')) newErrors.email = 'Email inválido';
        if (formData.password.length < 6) newErrors.password = 'Mínimo 6 caracteres';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const clientData: RegisterStoreData = { ...formData, storeName: '', category: '' };
            const result = await register(clientData, 'cliente');

            if (result.emailConfirmationRequired) {
                toast.success('¡Registro exitoso! Revisa tu email para confirmar.', { duration: 6000 });
                onBack();
                return;
            }
            toast.success('¡Cuenta creada exitosamente!');
            onSuccess();
        } catch (error) {
            // Error handled by useAuth
        }
    };

    const categories = ['Tecnología', 'Moda', 'Gastronomía', 'Hogar', 'Deportes', 'Salud y Belleza', 'Otro'];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
            <div className="w-full max-w-4xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4 group">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-violet-500/20 group-hover:scale-110 transition-transform duration-500 ring-4 ring-white dark:ring-gray-800">
                            <span className="text-2xl font-black font-outfit">Y</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent font-outfit">YUPAY</h1>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 font-bold">Crea tu tienda online GRATIS, FÁCIL y RÁPIDO YA</p>
                </div>

                {/* Progress Steps */}
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-2">
                        {(accountType === 'tienda' ? [0, 1, 2, 3] : [0, 1]).map((s, idx, arr) => (
                            <div key={s} className="flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${step >= s
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                                    }`}>
                                    {step > s ? <Check className="h-5 w-5" /> : idx + 1}
                                </div>
                                {idx < arr.length - 1 && <div className={`w-12 h-1 mx-1 rounded ${step > s ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step 0: Tipo de cuenta */}
                {step === 0 && (
                    <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-xl">
                        <CardHeader className="text-center">
                            <CardTitle className="dark:text-white text-2xl">¿Cómo quieres usar Yupay?</CardTitle>
                            <CardDescription>Elige el tipo de cuenta que necesitas</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Opción Tienda */}
                                <button
                                    onClick={() => { setAccountType('tienda'); setStep(1); }}
                                    className="group p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-violet-500 dark:hover:border-violet-500 transition-all hover:shadow-lg hover:shadow-violet-500/10 text-left"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Store className="h-7 w-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold dark:text-white mb-2">Quiero vender</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        Crea tu tienda, sube productos y empieza a vender online.
                                    </p>
                                    <div className="flex items-center text-violet-600 dark:text-violet-400 font-medium text-sm">
                                        Crear mi tienda <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </button>

                                {/* Opción Cliente */}
                                <button
                                    onClick={() => { setAccountType('cliente'); setStep(1); }}
                                    className="group p-6 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-emerald-500 dark:hover:border-emerald-500 transition-all hover:shadow-lg hover:shadow-emerald-500/10 text-left"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <ShoppingBag className="h-7 w-7 text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold dark:text-white mb-2">Quiero comprar</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                        Explora productos, guarda favoritos y haz pedidos fácilmente.
                                    </p>
                                    <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                                        Crear cuenta de cliente <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </button>
                            </div>

                            <div className="mt-6 text-center">
                                <Button variant="ghost" onClick={onBack} className="text-gray-500">
                                    <ArrowLeft className="h-4 w-4 mr-2" /> Volver al inicio
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 1: Datos del usuario/tienda */}
                {step === 1 && (
                    <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-xl">
                        <CardHeader>
                            <CardTitle className="dark:text-white flex items-center gap-2">
                                {accountType === 'tienda' ? (
                                    <><Store className="h-5 w-5 text-violet-500" /> ¡Súper! Empecemos con tu tienda</>
                                ) : (
                                    <><User className="h-5 w-5 text-emerald-500" /> Crear tu cuenta de cliente</>
                                )}
                            </CardTitle>
                            <CardDescription>
                                {accountType === 'tienda'
                                    ? 'Cuéntanos un poquito sobre tu gran idea para empezar YA'
                                    : 'Solo necesitamos algunos datos para crearte una cuenta'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Nombre de tienda - solo para tiendas */}
                                {accountType === 'tienda' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="storeName">Nombre de la tienda *</Label>
                                        <Input
                                            id="storeName"
                                            value={formData.storeName}
                                            onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                                            placeholder="Mi Super Tienda"
                                            className={errors.storeName ? 'border-red-500' : ''}
                                        />
                                        {errors.storeName && <p className="text-xs text-red-500">{errors.storeName}</p>}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="ownerName">Tu nombre *</Label>
                                    <Input
                                        id="ownerName"
                                        value={formData.ownerName}
                                        onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                        placeholder="Juan Pérez"
                                        className={errors.ownerName ? 'border-red-500' : ''}
                                    />
                                    {errors.ownerName && <p className="text-xs text-red-500">{errors.ownerName}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email *</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        placeholder="tu@email.com"
                                        className={errors.email ? 'border-red-500' : ''}
                                    />
                                    {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="password">Contraseña *</Label>
                                    <div className="relative">
                                        <Input
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={formData.password}
                                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            placeholder="Mínimo 6 caracteres"
                                            className={errors.password ? 'border-red-500 pr-10' : 'pr-10'}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        >
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                                </div>
                                {/* Categoría y teléfono - solo para tiendas */}
                                {accountType === 'tienda' && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Categoría *</Label>
                                            <select
                                                id="category"
                                                value={formData.category}
                                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                className={`w-full h-10 px-3 rounded-md border bg-white dark:bg-gray-700 dark:border-gray-600 ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
                                            >
                                                <option value="">Selecciona una categoría</option>
                                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                            {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">Teléfono (opcional)</Label>
                                            <Input
                                                id="phone"
                                                value={formData.phone}
                                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                placeholder="+54 11 1234 5678"
                                            />
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="flex justify-between pt-4">
                                <Button variant="ghost" onClick={() => setStep(0)}><ArrowLeft className="h-4 w-4 mr-2" />Volver</Button>
                                {accountType === 'tienda' ? (
                                    <Button onClick={handleNext}>Siguiente<ArrowRight className="h-4 w-4 ml-2" /></Button>
                                ) : (
                                    <Button onClick={handleSubmit} disabled={isLoading}>
                                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Crear cuenta
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Step 2: Selección de plan */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold dark:text-white">Elige tu plan</h2>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400 text-lg">🎁 ¡Te regalamos 14 días GRATIS YA!</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {(Object.entries(PLAN_FEATURES) as [SubscriptionPlan, typeof PLAN_FEATURES.free][]).map(([key, plan]) => {
                                const Icon = plan.icon;
                                const isSelected = selectedPlan === key;
                                return (
                                    <Card
                                        key={key}
                                        onClick={() => setSelectedPlan(key)}
                                        className={`cursor-pointer transition-all duration-300 hover:shadow-lg relative ${isSelected
                                            ? 'ring-2 ring-purple-500 scale-105'
                                            : 'dark:bg-gray-800 dark:border-gray-700 hover:scale-102'
                                            } ${'popular' in plan && plan.popular ? 'border-purple-500' : ''}`}
                                    >
                                        {'popular' in plan && (plan as any).popular && (
                                            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500">
                                                Más popular
                                            </Badge>
                                        )}
                                        <CardHeader className="text-center pb-2">
                                            <div className={`w-12 h-12 mx-auto rounded-xl bg-gradient-to-r ${plan.color} flex items-center justify-center text-white mb-2`}>
                                                <Icon className="h-6 w-6" />
                                            </div>
                                            <CardTitle className="dark:text-white">{plan.name}</CardTitle>
                                            <div className="text-3xl font-bold dark:text-white">
                                                ${plan.price}<span className="text-sm font-normal text-gray-500">/mes</span>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="space-y-2 text-sm">
                                                {plan.features.map((feature, idx) => (
                                                    <li key={idx} className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                                                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />{feature}
                                                    </li>
                                                ))}
                                            </ul>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>

                        <div className="flex justify-between pt-4">
                            <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft className="h-4 w-4 mr-2" />Atrás</Button>
                            <Button onClick={handleNext}>Continuar<ArrowRight className="h-4 w-4 ml-2" /></Button>
                        </div>
                    </div>
                )}

                {/* Step 3: Confirmación */}
                {step === 3 && (
                    <Card className="dark:bg-gray-800 dark:border-gray-700 shadow-xl max-w-lg mx-auto">
                        <CardHeader className="text-center">
                            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white mb-4">
                                <Check className="h-8 w-8" />
                            </div>
                            <CardTitle className="dark:text-white text-2xl">¡Vas a triunfar YA!</CardTitle>
                            <CardDescription>Confirma los datos de tu tienda</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Tienda:</span>
                                    <span className="font-medium dark:text-white">{formData.storeName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Propietario:</span>
                                    <span className="font-medium dark:text-white">{formData.ownerName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Email:</span>
                                    <span className="font-medium dark:text-white">{formData.email}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Categoría:</span>
                                    <span className="font-medium dark:text-white">{formData.category}</span>
                                </div>
                            </div>

                            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium dark:text-white">Plan seleccionado</span>
                                    <Badge className="bg-gradient-to-r from-purple-500 to-pink-500">{PLAN_FEATURES[selectedPlan].name}</Badge>
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    {selectedPlan !== 'free'
                                        ? '🎉 Tendrás 14 días de prueba gratis del plan Profesional'
                                        : 'Podrás hacer upgrade en cualquier momento'
                                    }
                                </p>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="outline" onClick={() => setStep(2)} className="flex-1"><ArrowLeft className="h-4 w-4 mr-2" />Atrás</Button>
                                <Button onClick={handleRegister} disabled={isLoading} className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 font-bold shadow-lg shadow-violet-500/20">
                                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Rocket className="h-4 w-4 mr-2" />}
                                    EMPEZAR GRATIS YA
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
