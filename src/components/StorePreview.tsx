import { useState, useEffect } from 'react';
import {
    X,
    MapPin,
    Phone,
    Mail,
    Clock,
    Star,
    ShoppingCart,
    Heart,
    Share2,
    ChevronLeft,
    ChevronRight,
    Package,
    Truck,
    CreditCard,
    Zap,
    Gift,
    Timer
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Store, Product, ShippingMethod, PaymentMethod, FlashOffer } from '@/types';
import { formatPrice } from '@/utils/format';

interface StorePreviewProps {
    isOpen: boolean;
    onClose: () => void;
    store: Store | undefined;
    products: Product[];
    shippingMethods: ShippingMethod[];
    paymentMethods: PaymentMethod[];
    activeFlashOffers: FlashOffer[];
}

export default function StorePreview({
    isOpen,
    onClose,
    store,
    products,
    shippingMethods,
    paymentMethods,
    activeFlashOffers
}: StorePreviewProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [cartCount, setCartCount] = useState(0);

    if (!store) return null;

    const getTimeRemaining = (endDate: Date) => {
        const now = new Date();
        const diff = new Date(endDate).getTime() - now.getTime();
        if (diff <= 0) return 'Expirada';

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
        return `${minutes}m ${seconds}s`;
    };

    // Componente interno para el timer individual
    const ProductTimer = ({ endDate }: { endDate: Date }) => {
        const [time, setTime] = useState(getTimeRemaining(endDate));

        useEffect(() => {
            const interval = setInterval(() => {
                setTime(getTimeRemaining(endDate));
            }, 1000);
            return () => clearInterval(interval);
        }, [endDate]);

        return (
            <div className="flex items-center gap-1 text-[10px] font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 px-1.5 py-0.5 rounded-md">
                <Timer className="w-3 h-3" />
                {time}
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
                <DialogHeader className="sr-only">
                    <DialogTitle>Vista previa de la tienda</DialogTitle>
                </DialogHeader>

                {/* Mobile Frame Container */}
                <div className="relative bg-gray-100 dark:bg-gray-900">
                    {/* Preview Badge */}
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50">
                        <Badge className="bg-violet-600 text-white text-[10px] px-3">
                            Vista Previa - Así ven tus clientes tu tienda
                        </Badge>
                    </div>

                    {/* Scrollable Content */}
                    <div className="h-[80vh] overflow-y-auto">
                        {/* Store Header/Banner */}
                        <div className="relative h-40 bg-gradient-to-br from-violet-600 to-purple-700">
                            {store.banner && (
                                <img src={store.banner} alt="Banner" className="w-full h-full object-cover opacity-50" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                            {/* Store Info */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                                <div className="flex items-end gap-4">
                                    {/* Logo */}
                                    <div className="w-20 h-20 rounded-xl bg-white shadow-lg flex items-center justify-center text-3xl font-bold text-violet-600 shrink-0">
                                        {store.logo ? (
                                            <img src={store.logo} alt={store.name} className="w-full h-full rounded-xl object-cover" />
                                        ) : (
                                            store.name.charAt(0)
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 pb-1">
                                        <h1 className="text-xl font-bold truncate">{store.name}</h1>
                                        <p className="text-sm text-white/80 truncate">{store.category}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-white/70">
                                            <span className="flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                {store.rating.toFixed(1)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Package className="w-3 h-3" />
                                                {products.filter(p => p.isActive).length} productos
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Info Bar */}
                        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 px-4 py-3">
                            <div className="flex items-center justify-between gap-4 text-xs">
                                <div className="flex items-center gap-4 overflow-x-auto">
                                    {store.location && (
                                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                            <MapPin className="w-3 h-3 text-violet-500" />
                                            {store.location.locality}
                                        </span>
                                    )}
                                    {store.phone && (
                                        <span className="flex items-center gap-1 text-gray-600 dark:text-gray-400 whitespace-nowrap">
                                            <Phone className="w-3 h-3 text-violet-500" />
                                            {store.phone}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Heart className="w-4 h-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Share2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Flash Offers Banner */}
                        {activeFlashOffers.length > 0 && (
                            <div className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-3">
                                <div className="flex items-center gap-3 overflow-x-auto">
                                    <Zap className="w-5 h-5 text-white shrink-0" />
                                    {activeFlashOffers.map(offer => (
                                        <div key={offer.id} className="flex items-center gap-2 bg-white/20 backdrop-blur rounded-lg px-3 py-1.5 whitespace-nowrap">
                                            <span className="text-white font-bold text-sm">
                                                {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `${formatPrice(offer.discountValue)} OFF`}
                                            </span>
                                            <span className="text-white/80 text-xs flex items-center gap-1">
                                                <Timer className="w-3 h-3" />
                                                {getTimeRemaining(offer.endDate)}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Description */}
                        {store.description && (
                            <div className="bg-white dark:bg-gray-800 px-4 py-3 border-b dark:border-gray-700">
                                <p className="text-sm text-gray-600 dark:text-gray-400">{store.description}</p>
                            </div>
                        )}

                        {/* Products Grid */}
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="font-bold text-gray-900 dark:text-white">Productos</h2>
                                <span className="text-xs text-gray-500">{products.filter(p => p.isActive).length} disponibles</span>
                            </div>

                            {products.filter(p => p.isActive).length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                    <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">No hay productos disponibles</p>
                                    <p className="text-xs text-gray-400 mt-1">Agrega productos desde el panel de administración</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {products.filter(p => p.isActive).map(product => {
                                        // Check if product is in a flash offer
                                        const flashOffer = activeFlashOffers.find(o => o.productIds.includes(product.id));
                                        const hasFlashDiscount = !!flashOffer;
                                        const discountedPrice = hasFlashDiscount
                                            ? flashOffer.discountType === 'percentage'
                                                ? product.price * (1 - flashOffer.discountValue / 100)
                                                : product.price - flashOffer.discountValue
                                            : product.isOnSale && product.discount
                                                ? product.price * (1 - product.discount / 100)
                                                : null;

                                        return (
                                            <div
                                                key={product.id}
                                                className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
                                                onClick={() => setSelectedProduct(product)}
                                            >
                                                {/* Image */}
                                                <div className="relative aspect-square bg-gray-100 dark:bg-gray-700">
                                                    {product.images[0] ? (
                                                        <img
                                                            src={product.images[0]}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="w-8 h-8 text-gray-300" />
                                                        </div>
                                                    )}

                                                    {/* Discount Badge */}
                                                    {(hasFlashDiscount || (product.isOnSale && product.discount)) && (
                                                        <Badge className={`absolute top-2 left-2 ${hasFlashDiscount ? 'bg-yellow-500' : 'bg-red-500'} text-white text-[10px]`}>
                                                            {hasFlashDiscount ? (
                                                                <><Zap className="w-3 h-3 mr-1" />{flashOffer!.discountValue}% OFF</>
                                                            ) : (
                                                                `-${product.discount}%`
                                                            )}
                                                        </Badge>
                                                    )}

                                                    {/* Quick add button */}
                                                    <Button
                                                        size="icon"
                                                        className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-violet-600 hover:bg-violet-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCartCount(prev => prev + 1);
                                                        }}
                                                    >
                                                        <ShoppingCart className="w-4 h-4 text-white" />
                                                    </Button>
                                                </div>

                                                {/* Info */}
                                                <div className="p-3">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{product.category}</p>
                                                        {hasFlashDiscount && <ProductTimer endDate={flashOffer!.endDate} />}
                                                    </div>
                                                    <h3 className="font-medium text-sm text-gray-900 dark:text-white truncate mt-0.5">{product.name}</h3>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        {discountedPrice ? (
                                                            <>
                                                                <span className="text-sm font-bold text-violet-600">{formatPrice(discountedPrice)}</span>
                                                                <span className="text-xs text-gray-400 line-through">{formatPrice(product.price)}</span>
                                                            </>
                                                        ) : (
                                                            <span className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Shipping & Payment Info */}
                        <div className="p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
                            {/* Shipping Methods */}
                            {shippingMethods.filter(m => m.isActive).length > 0 && (
                                <div>
                                    <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-violet-500" />
                                        Métodos de envío
                                    </h3>
                                    <div className="space-y-2">
                                        {shippingMethods.filter(m => m.isActive).map(method => (
                                            <div key={method.id} className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-lg">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">{method.name}</p>
                                                    <p className="text-xs text-gray-500">{method.estimatedDays}</p>
                                                </div>
                                                <span className="text-sm font-bold text-violet-600">
                                                    {method.price === 0 ? 'Gratis' : formatPrice(method.price)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Payment Methods */}
                            {paymentMethods.filter(m => m.isActive).length > 0 && (
                                <div>
                                    <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                        <CreditCard className="w-4 h-4 text-violet-500" />
                                        Métodos de pago
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {paymentMethods.filter(m => m.isActive).map(method => (
                                            <Badge key={method.id} variant="outline" className="text-xs">
                                                {method.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Floating Cart Button */}
                    {cartCount > 0 && (
                        <div className="absolute bottom-4 left-4 right-4">
                            <Button className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-lg">
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                Ver carrito ({cartCount} productos)
                            </Button>
                        </div>
                    )}
                </div>

                {/* Product Detail Modal */}
                {selectedProduct && (
                    <div className="absolute inset-0 bg-white dark:bg-gray-900 z-50 overflow-y-auto">
                        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b dark:border-gray-800 p-4 flex items-center gap-3">
                            <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(null)}>
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <span className="font-medium">Detalle del producto</span>
                        </div>

                        <div className="aspect-square bg-gray-100 dark:bg-gray-800">
                            {selectedProduct.images[0] ? (
                                <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Package className="w-16 h-16 text-gray-300" />
                                </div>
                            )}
                        </div>

                        <div className="p-4 space-y-4">
                            <div>
                                <p className="text-sm text-gray-500">{selectedProduct.category}</p>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedProduct.name}</h2>
                                <p className="text-2xl font-bold text-violet-600 mt-2">{formatPrice(selectedProduct.price)}</p>
                            </div>

                            <p className="text-gray-600 dark:text-gray-400">{selectedProduct.description}</p>

                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Package className="w-4 h-4" />
                                {selectedProduct.stock > 0 ? (
                                    <span className="text-green-600">En stock ({selectedProduct.stock} disponibles)</span>
                                ) : (
                                    <span className="text-red-600">Sin stock</span>
                                )}
                            </div>

                            <Button
                                className="w-full h-12 bg-violet-600 hover:bg-violet-700"
                                disabled={selectedProduct.stock === 0}
                                onClick={() => {
                                    setCartCount(prev => prev + 1);
                                    setSelectedProduct(null);
                                }}
                            >
                                <ShoppingCart className="w-5 h-5 mr-2" />
                                Agregar al carrito
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
