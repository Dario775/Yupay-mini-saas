import { useState } from 'react';
import {
    Zap,
    Plus,
    Clock,
    MapPin,
    Package,
    Percent,
    DollarSign,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Timer,
    Bell,
    Crown,
    ChevronRight,
    Gift
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import type { FlashOffer, Product } from '@/types';

interface FlashOffersManagerProps {
    products: Product[];
    flashOffers: FlashOffer[];
    activeFlashOffers: FlashOffer[];
    canCreateFlashOffer: boolean;
    flashOffersRemaining: number;
    maxFlashOfferRadius: number;
    createFlashOffer: (data: {
        productIds: string[];
        discountType: 'percentage' | 'fixed';
        discountValue: number;
        durationHours: number;
        radiusKm: number;
        title: string;
        description?: string;
        maxRedemptions?: number;
        startImmediately?: boolean;
    }) => FlashOffer | null;
    cancelFlashOffer: (offerId: string) => void;
    currentPlan: string;
    onUpgradePrompt: () => void;
}

export default function FlashOffersManager({
    products,
    flashOffers,
    activeFlashOffers,
    canCreateFlashOffer,
    flashOffersRemaining,
    maxFlashOfferRadius,
    createFlashOffer,
    cancelFlashOffer,
    currentPlan,
    onUpgradePrompt
}: FlashOffersManagerProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
    const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
    const [discountValue, setDiscountValue] = useState('');
    const [durationHours, setDurationHours] = useState('2');
    const [radiusKm, setRadiusKm] = useState('5');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [maxRedemptions, setMaxRedemptions] = useState('');
    const [startImmediately, setStartImmediately] = useState(true);

    const handleCreateOffer = () => {
        if (!title || !discountValue || selectedProducts.length === 0) return;

        const offer = createFlashOffer({
            productIds: selectedProducts,
            discountType,
            discountValue: parseFloat(discountValue),
            durationHours: parseInt(durationHours),
            radiusKm: parseInt(radiusKm),
            title,
            description: description || undefined,
            maxRedemptions: maxRedemptions ? parseInt(maxRedemptions) : undefined,
            startImmediately,
        });

        if (offer) {
            // Reset form
            setSelectedProducts([]);
            setDiscountValue('');
            setTitle('');
            setDescription('');
            setMaxRedemptions('');
            setIsDialogOpen(false);
        }
    };

    const toggleProduct = (productId: string) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const getStatusBadge = (status: FlashOffer['status']) => {
        switch (status) {
            case 'active':
                return <Badge className="bg-green-500/20 text-green-600 border-green-500/30"><Zap className="w-3 h-3 mr-1" />Activa</Badge>;
            case 'scheduled':
                return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30"><Clock className="w-3 h-3 mr-1" />Programada</Badge>;
            case 'expired':
                return <Badge className="bg-gray-500/20 text-gray-600 border-gray-500/30"><CheckCircle className="w-3 h-3 mr-1" />Finalizada</Badge>;
            case 'cancelled':
                return <Badge className="bg-red-500/20 text-red-600 border-red-500/30"><XCircle className="w-3 h-3 mr-1" />Cancelada</Badge>;
        }
    };

    const getTimeRemaining = (endDate: Date) => {
        const now = new Date();
        const diff = new Date(endDate).getTime() - now.getTime();
        if (diff <= 0) return 'Expirada';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    // Si no puede crear ofertas, mostrar upgrade prompt
    if (!canCreateFlashOffer) {
        return (
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200 dark:border-purple-800 p-6">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                        <Crown className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                            ⚡ Ofertas Flash - Feature Premium
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Envía notificaciones a clientes cercanos cuando actives una oferta por tiempo limitado.
                            Aumenta tus ventas con urgencia y geolocalización.
                        </p>
                        <ul className="space-y-2 mb-4 text-sm">
                            <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <Bell className="w-4 h-4 text-purple-500" />
                                Notificaciones push a clientes cercanos
                            </li>
                            <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <Timer className="w-4 h-4 text-purple-500" />
                                Countdown de tiempo para crear urgencia
                            </li>
                            <li className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                <MapPin className="w-4 h-4 text-purple-500" />
                                Radio de alcance configurable
                            </li>
                        </ul>
                        <Button
                            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
                            onClick={onUpgradePrompt}
                        >
                            <Crown className="w-4 h-4 mr-2" />
                            Actualizar a Plan Profesional
                            <ChevronRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Zap className="w-6 h-6 text-yellow-500" />
                        Ofertas Flash
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ofertas por tiempo limitado con notificaciones a clientes cercanos
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-sm">
                        {flashOffersRemaining === -1 ? '∞' : flashOffersRemaining} ofertas restantes este mes
                    </Badge>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                                disabled={flashOffersRemaining === 0}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Nueva Oferta Flash
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-yellow-500" />
                                    Crear Oferta Flash
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                {/* Título */}
                                <div className="space-y-2">
                                    <Label>Título de la oferta *</Label>
                                    <Input
                                        placeholder="Ej: 30% OFF en Auriculares por 2 horas"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                    />
                                </div>

                                {/* Descripción */}
                                <div className="space-y-2">
                                    <Label>Descripción (opcional)</Label>
                                    <Textarea
                                        placeholder="Agrega detalles adicionales sobre la oferta..."
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={2}
                                    />
                                </div>

                                {/* Selección de productos */}
                                <div className="space-y-2">
                                    <Label>Productos en oferta *</Label>
                                    <div className="border rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                                        {products.length === 0 ? (
                                            <p className="text-sm text-gray-500 text-center py-4">
                                                No tienes productos. Agrega productos primero.
                                            </p>
                                        ) : (
                                            products.map(product => (
                                                <label
                                                    key={product.id}
                                                    className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                                                >
                                                    <Checkbox
                                                        checked={selectedProducts.includes(product.id)}
                                                        onCheckedChange={() => toggleProduct(product.id)}
                                                    />
                                                    <span className="flex-1 text-sm">{product.name}</span>
                                                    <span className="text-sm text-gray-500">${product.price}</span>
                                                </label>
                                            ))
                                        )}
                                    </div>
                                    {selectedProducts.length > 0 && (
                                        <p className="text-xs text-gray-500">
                                            {selectedProducts.length} producto(s) seleccionado(s)
                                        </p>
                                    )}
                                </div>

                                {/* Descuento */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Tipo de descuento</Label>
                                        <Select value={discountType} onValueChange={(v: 'percentage' | 'fixed') => setDiscountType(v)}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="percentage">
                                                    <div className="flex items-center gap-2">
                                                        <Percent className="w-4 h-4" />
                                                        Porcentaje
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="fixed">
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4" />
                                                        Monto fijo
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Valor del descuento *</Label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                placeholder={discountType === 'percentage' ? '20' : '500'}
                                                value={discountValue}
                                                onChange={(e) => setDiscountValue(e.target.value)}
                                                className="pr-8"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                                                {discountType === 'percentage' ? '%' : '$'}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Duración y Radio */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <Timer className="w-4 h-4" />
                                            Duración
                                        </Label>
                                        <Select value={durationHours} onValueChange={setDurationHours}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">1 hora</SelectItem>
                                                <SelectItem value="2">2 horas</SelectItem>
                                                <SelectItem value="4">4 horas</SelectItem>
                                                <SelectItem value="8">8 horas</SelectItem>
                                                <SelectItem value="12">12 horas</SelectItem>
                                                <SelectItem value="24">24 horas</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            Radio de alcance
                                        </Label>
                                        <Select value={radiusKm} onValueChange={setRadiusKm}>
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">1 km</SelectItem>
                                                <SelectItem value="2">2 km</SelectItem>
                                                <SelectItem value="5" disabled={maxFlashOfferRadius < 5}>5 km</SelectItem>
                                                <SelectItem value="10" disabled={maxFlashOfferRadius < 10}>10 km</SelectItem>
                                                <SelectItem value="20" disabled={maxFlashOfferRadius < 20}>20 km</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <p className="text-xs text-gray-500">
                                            Máximo según tu plan: {maxFlashOfferRadius} km
                                        </p>
                                    </div>
                                </div>

                                {/* Límite de usos */}
                                <div className="space-y-2">
                                    <Label>Límite de usos (opcional)</Label>
                                    <Input
                                        type="number"
                                        placeholder="Sin límite"
                                        value={maxRedemptions}
                                        onChange={(e) => setMaxRedemptions(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-500">
                                        La oferta se desactivará automáticamente al alcanzar este número de usos
                                    </p>
                                </div>

                                {/* Iniciar inmediatamente */}
                                <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <Checkbox
                                        checked={startImmediately}
                                        onCheckedChange={(checked) => setStartImmediately(checked as boolean)}
                                    />
                                    <div>
                                        <p className="font-medium text-sm">Iniciar inmediatamente</p>
                                        <p className="text-xs text-gray-500">
                                            {startImmediately
                                                ? 'La oferta se activará al crearla'
                                                : 'La oferta se programará para iniciarse en 5 minutos'}
                                        </p>
                                    </div>
                                </label>

                                {/* Preview */}
                                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 p-4">
                                    <p className="text-xs text-yellow-700 dark:text-yellow-400 font-medium mb-2">Vista previa de notificación:</p>
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm">
                                        <div className="flex items-start gap-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                                                <Zap className="w-5 h-5 text-white" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-sm">{title || '¡Oferta Flash!'}</p>
                                                <p className="text-xs text-gray-500">
                                                    {discountValue ? (
                                                        discountType === 'percentage'
                                                            ? `${discountValue}% OFF`
                                                            : `$${discountValue} de descuento`
                                                    ) : 'Descuento especial'} •
                                                    Válido por {durationHours}h •
                                                    A {radiusKm}km de ti
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Cancelar
                                    </Button>
                                    <Button
                                        onClick={handleCreateOffer}
                                        disabled={!title || !discountValue || selectedProducts.length === 0}
                                        className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                                    >
                                        <Zap className="w-4 h-4 mr-2" />
                                        {startImmediately ? 'Activar Oferta' : 'Programar Oferta'}
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Active Offers */}
            {activeFlashOffers.length > 0 && (
                <div className="space-y-3">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        Ofertas Activas ({activeFlashOffers.length})
                    </h3>
                    <div className="grid gap-4">
                        {activeFlashOffers.map(offer => (
                            <div
                                key={offer.id}
                                className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            {getStatusBadge(offer.status)}
                                            <span className="text-xs text-gray-500">
                                                {offer.notificationsSent} notificaciones enviadas
                                            </span>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 dark:text-white">{offer.title}</h4>
                                        {offer.description && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{offer.description}</p>
                                        )}
                                        <div className="flex flex-wrap items-center gap-3 mt-3 text-sm">
                                            <span className="flex items-center gap-1 text-green-600">
                                                <Gift className="w-4 h-4" />
                                                {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `$${offer.discountValue}`} OFF
                                            </span>
                                            <span className="flex items-center gap-1 text-blue-600">
                                                <Timer className="w-4 h-4" />
                                                {getTimeRemaining(offer.endDate)}
                                            </span>
                                            <span className="flex items-center gap-1 text-purple-600">
                                                <MapPin className="w-4 h-4" />
                                                {offer.radiusKm} km
                                            </span>
                                            <span className="flex items-center gap-1 text-gray-600">
                                                <Package className="w-4 h-4" />
                                                {offer.productIds.length} producto(s)
                                            </span>
                                            {offer.maxRedemptions && (
                                                <span className="flex items-center gap-1 text-orange-600">
                                                    {offer.currentRedemptions}/{offer.maxRedemptions} usos
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => cancelFlashOffer(offer.id)}
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                        <XCircle className="w-4 h-4 mr-1" />
                                        Cancelar
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* All Offers History */}
            <div className="space-y-3">
                <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                    Historial de Ofertas
                </h3>
                {flashOffers.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                        <Zap className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                        <h4 className="font-medium text-gray-600 dark:text-gray-400 mb-2">
                            No hay ofertas flash todavía
                        </h4>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                            Crea tu primera oferta flash para atraer clientes cercanos
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {flashOffers.filter(o => o.status !== 'active').map(offer => (
                            <div
                                key={offer.id}
                                className="flex items-center justify-between gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                                <div className="flex items-center gap-3">
                                    {getStatusBadge(offer.status)}
                                    <div>
                                        <p className="font-medium text-sm text-gray-900 dark:text-white">{offer.title}</p>
                                        <p className="text-xs text-gray-500">
                                            {offer.discountType === 'percentage' ? `${offer.discountValue}%` : `$${offer.discountValue}`} OFF •
                                            {new Date(offer.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right text-sm text-gray-500">
                                    <p>{offer.currentRedemptions} usos</p>
                                    <p>{offer.notificationsSent} notif.</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
