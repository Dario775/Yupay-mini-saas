
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Zap, Filter, Package, ShieldCheck, History, Headset } from 'lucide-react';
import { ProductCard } from './components/ProductCard';
import { FlashOfferCard } from './components/FlashOfferCard';
import type { Product, FlashOffer, Store, GeoLocation } from '@/types';
import { calculateDistance } from '@/lib/geo';

interface ShopViewProps {
    products: Product[];
    flashOffers: FlashOffer[];
    stores: Store[];
    filteredProducts: Product[];
    categories: string[];
    selectedCategory: string;
    setSelectedCategory: (category: string) => void;
    favorites: string[];
    addToCart: (product: Product) => void;
    handleToggleFavorite: (id: string) => void;
    setSelectedProduct: (product: Product | null) => void;
    userLocation: GeoLocation | null;
    className?: string;
}

export function ShopView({
    products,
    flashOffers,
    stores,
    filteredProducts,
    categories,
    selectedCategory,
    setSelectedCategory,
    favorites,
    addToCart,
    handleToggleFavorite,
    setSelectedProduct,
    userLocation,
    className
}: ShopViewProps) {

    const isFavorite = (id: string) => favorites.includes(id);

    return (
        <div className={className}>
            {/* Hero Banner - More Minimalist */}
            <div className="relative overflow-hidden rounded-3xl bg-violet-600 p-6 sm:p-8 mb-6">
                <div className="relative z-10">
                    <Badge className="bg-white/20 text-white border-0 mb-3 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider">
                        Ofertas
                    </Badge>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Hasta 50% OFF</h2>
                    <p className="text-white/80 text-sm mb-4 max-w-xs">En productos seleccionados. ¡No te lo pierdas!</p>
                    <Button size="sm" className="bg-white text-violet-600 hover:bg-gray-100 rounded-full font-bold">
                        Ver Todo
                    </Button>
                </div>
                <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute -top-8 -left-8 w-40 h-40 bg-violet-400/20 rounded-full blur-3xl"></div>
            </div>

            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Descubre Productos</h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Explora los mejores productos de nuestras tiendas</p>
                </div>
                <Button variant="outline" className="rounded-full gap-2">
                    <Filter className="h-4 w-4" /> Filtros
                </Button>
            </div>

            {/* Active Flash Offers Section - Compact Horizontal Scroll */}
            {flashOffers?.filter(o => o.status === 'active').length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-yellow-500 fill-current animate-pulse" />
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Ofertas Flash</h2>
                        </div>
                        <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 px-2 py-0.5 rounded-full">
                            Tiempo Limitado
                        </span>
                    </div>

                    <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide snap-x">
                        {products
                            .filter(p => flashOffers.some(o => o.status === 'active' && o.productIds.includes(p.id)))
                            .map(product => {
                                const offer = flashOffers.find(o => o.status === 'active' && o.productIds.includes(product.id));

                                return (
                                    <FlashOfferCard
                                        key={`flash-${product.id}`}
                                        product={product}
                                        offer={offer}
                                        onAddToCart={addToCart}
                                        onView={setSelectedProduct}
                                    />
                                );
                            })}
                    </div>
                </div>
            )}

            {/* Categories - Minimalist Pill Design */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${selectedCategory === cat
                            ? 'bg-violet-600 text-white shadow-sm'
                            : 'bg-white dark:bg-gray-900 text-gray-500 border border-gray-100 dark:border-gray-800'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                {filteredProducts.map((product) => {
                    const productStore = stores.find(s => s.id === product.storeId);
                    let distance: number | undefined;
                    if (userLocation && productStore?.location) {
                        distance = calculateDistance(userLocation.lat, userLocation.lng, productStore.location.lat, productStore.location.lng);
                    }

                    return (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={addToCart}
                            isFavorite={isFavorite(product.id)}
                            onToggleFavorite={handleToggleFavorite}
                            onView={setSelectedProduct}
                            distance={distance}
                        />
                    );
                })}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-16">
                    <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">No se encontraron productos</h3>
                    <p className="text-gray-500 dark:text-gray-400">Intenta con otra búsqueda o categoría</p>
                </div>
            )}

            {/* Benefits Section - Discrete/Minimalist */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mt-8 mb-12 py-6 border-t border-dashed border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <ShieldCheck className="h-4 w-4" />
                    <span className="text-xs font-medium">Compra Protegida</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <History className="h-4 w-4" />
                    <span className="text-xs font-medium">Devoluciones Gratuitas</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                    <Headset className="h-4 w-4" />
                    <span className="text-xs font-medium">Soporte 24/7</span>
                </div>
            </div>
        </div>
    );
}
