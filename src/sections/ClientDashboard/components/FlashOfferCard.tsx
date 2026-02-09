
import { Zap, MessageCircle, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/utils/format';
import type { Product, FlashOffer } from '@/types';
import { ProductTimer } from './ProductTimer';

interface FlashOfferCardProps {
    product: Product;
    offer?: FlashOffer;
    onAddToCart: (product: Product) => void;
    onView?: (product: Product) => void;
    onShare?: (product: Product) => void;
}

export function FlashOfferCard({
    product,
    offer,
    onAddToCart,
    onView,
    onShare
}: FlashOfferCardProps) {
    const discountedPrice = product.price * (1 - (offer?.discountValue || 0) / 100);

    return (
        <div
            className="min-w-[240px] w-[240px] snap-center bg-white dark:bg-gray-900 border border-yellow-200 dark:border-yellow-900/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
            onClick={() => onView?.(product)}
        >
            {/* Image with Gradient & Overlay */}
            <div className="h-32 relative bg-gray-50 dark:bg-gray-800">
                {product.images?.[0] ?
                    <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                    :
                    <div className="w-full h-full flex items-center justify-center text-gray-300 font-bold">{product.name[0]}</div>
                }
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />

                {/* Timer Badge Overlay */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                    <ProductTimer endDate={offer?.endDate || new Date()} className="text-[10px] font-mono font-bold text-white tracking-wide" />
                </div>

                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                    <div className="bg-yellow-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-sm">
                        -{offer?.discountValue || 20}%
                    </div>
                    {/* Share Button for Flash Offer */}
                    <Button
                        size="icon"
                        className="h-7 w-7 rounded-full bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white shadow-sm border border-gray-100 dark:border-gray-700 z-50 transition-transform active:scale-90"
                        onClick={(e) => {
                            e.stopPropagation();
                            onShare?.(product);
                        }}
                    >
                        <Share2 className="h-3.5 w-3.5" />
                    </Button>
                </div>

                {/* Price Overlay */}
                <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
                    <div className="flex flex-col">
                        <span className="text-[10px] text-gray-300 line-through font-medium leading-none mb-0.5">{formatPrice(product.price)}</span>
                        <span className="text-xl font-black text-yellow-400 leading-none drop-shadow-md">
                            {formatPrice(discountedPrice)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-3">
                <h3 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 mb-1" title={product.name}>{product.name}</h3>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Zap className="h-3 w-3 text-yellow-500" />
                        <span>Quedan {product.stock}</span>
                    </p>
                    <Button
                        size="sm"
                        className="h-7 px-3 bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-bold rounded-full"
                        onClick={(e) => { e.stopPropagation(); onAddToCart({ ...product, price: discountedPrice }); }}
                    >
                        Lo quiero
                    </Button>
                </div>
            </div>
        </div>
    );
}
