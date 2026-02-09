
import { ShoppingCart, Heart, MapPin, Zap, MessageCircle, Share2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/utils/format';
import type { Product, FlashOffer } from '@/types';
import { ProductTimer } from './ProductTimer';

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
    isFavorite?: boolean;
    onToggleFavorite?: (id: string) => void;
    onView?: (product: Product) => void;
    onShare?: (product: Product) => void;
    distance?: number;
    flashOffer?: FlashOffer;
    compact?: boolean;
}

export function ProductCard({
    product,
    onAddToCart,
    isFavorite = false,
    onToggleFavorite,
    onView,
    onShare,
    distance,
    flashOffer,
    compact = false
}: ProductCardProps) {
    const discountedPrice = flashOffer
        ? product.price * (1 - flashOffer.discountValue / 100)
        : product.isOnSale && product.discount
            ? product.price * (1 - product.discount / 100)
            : null;

    return (
        <Card className={`group relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl ${compact ? 'max-w-[200px]' : ''}`}>
            {/* Discount Badge */}
            {(flashOffer || (product.isOnSale && product.discount)) && (
                <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    {flashOffer && (
                        <div className="px-2 py-1 rounded-lg bg-yellow-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm">
                            <ProductTimer endDate={flashOffer.endDate} />
                        </div>
                    )}
                    <Badge className={`${flashOffer ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-red-500 hover:bg-red-600'} text-white border-0 text-[10px] font-bold px-2 py-0.5 shadow-sm`}>
                        {flashOffer ? <Zap className="w-3 h-3 mr-1 fill-current" /> : null}
                        -{flashOffer ? flashOffer.discountValue : product.discount}%
                    </Badge>
                </div>
            )}

            {/* Content / Image Container */}
            <div
                className="relative aspect-square bg-gray-50 dark:bg-gray-800 overflow-hidden cursor-pointer p-4"
                onClick={() => onView?.(product)}
            >
                {/* Actions Overlay - Moved inside and increased Z-index */}
                <div className="absolute top-2 right-2 z-50 flex flex-col gap-2">
                    {onToggleFavorite && (
                        <Button
                            size="icon"
                            className="h-8 w-8 rounded-full bg-white dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 shadow-md border border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300"
                            onClick={(e) => { e.stopPropagation(); onToggleFavorite(product.id); }}
                        >
                            <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                        </Button>
                    )}
                    {/* Share Button - Minimalist */}
                    <Button
                        size="icon"
                        className="h-8 w-8 rounded-full bg-white dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 shadow-md border border-gray-100 dark:border-gray-700 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0"
                        onClick={(e) => {
                            e.stopPropagation();
                            onShare?.(product);
                        }}
                        title="Compartir producto"
                    >
                        <Share2 className="h-4 w-4 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" />
                    </Button>
                </div>

                {/* Secondary Image (Hover) */}
                {product.images?.[1] && (
                    <img
                        src={product.images[1]}
                        alt={`${product.name} alternate`}
                        className="absolute inset-0 w-full h-full object-contain p-4 transition-opacity duration-500 opacity-0 group-hover:opacity-100 z-10"
                    />
                )}

                {/* Main Image */}
                {product.images?.[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-105 ${product.images?.[1] ? 'group-hover:opacity-0' : ''}`}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-200 dark:text-gray-700">
                        {product.name.charAt(0)}
                    </div>
                )}

                {/* Distance Badge */}
                {distance !== undefined && (
                    <div className="absolute bottom-2 right-2 z-20 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {distance < 1 ? `${(distance * 1000).toFixed(0)}m` : `${distance.toFixed(1)}km`}
                    </div>
                )}
            </div>

            <CardContent className="p-3 space-y-2">
                <div>
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 leading-tight">{product.name}</h3>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400">{product.category}</p>
                </div>

                <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                        {discountedPrice ? (
                            <>
                                <p className={`text-sm font-bold ${flashOffer ? 'text-yellow-600 dark:text-yellow-500' : 'text-violet-600 dark:text-violet-400'}`}>
                                    {formatPrice(discountedPrice)}
                                </p>
                                <p className="text-[10px] text-gray-400 line-through">{formatPrice(product.price)}</p>
                            </>
                        ) : (
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</p>
                        )}
                    </div>
                    <Button
                        size="sm"
                        className={`h-7 px-3 text-white text-[10px] font-bold rounded-full gap-1 shadow-sm ${flashOffer
                            ? 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/20'
                            : 'bg-violet-600 hover:bg-violet-700 shadow-violet-500/20'
                            }`}
                        onClick={(e) => { e.stopPropagation(); onAddToCart({ ...product, price: discountedPrice || product.price } as Product); }}
                        disabled={product.stock === 0}
                    >
                        {flashOffer ? <Zap className="h-3 w-3 fill-current" /> : <ShoppingCart className="h-3 w-3" />}
                        {compact ? '' : 'Añadir'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
