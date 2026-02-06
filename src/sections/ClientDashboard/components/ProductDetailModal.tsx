
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, MessageCircle, Star, X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import { formatPrice } from '@/utils/format';
import { generateWhatsAppLink } from '@/utils/whatsapp';
import type { Product, Store } from '@/types';

interface ProductDetailModalProps {
    product: Product | null;
    onClose: () => void;
    addToCart: (product: Product) => void;
    toggleFavorite: (id: string) => void;
    isFavorite: boolean;
    stores: Store[];
}

export function ProductDetailModal({
    product,
    onClose,
    addToCart,
    toggleFavorite,
    isFavorite,
    stores
}: ProductDetailModalProps) {
    const [imgIdx, setImgIdx] = useState(0);
    const [isZooming, setIsZooming] = useState(false);
    const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
    const imgContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (product) setImgIdx(0);
    }, [product]);

    if (!product) return null;

    const hasMultipleImages = product.images && product.images.length > 1;
    const currentImage = product.images?.[imgIdx] || null;

    const nextImage = () => setImgIdx(prev => (prev + 1) % (product.images?.length || 1));
    const prevImage = () => setImgIdx(prev => (prev - 1 + (product.images?.length || 1)) % (product.images?.length || 1));

    const updateZoomPosition = (clientX: number, clientY: number) => {
        if (!imgContainerRef.current || !currentImage) return;
        const rect = imgContainerRef.current.getBoundingClientRect();
        const x = ((clientX - rect.left) / rect.width) * 100;
        const y = ((clientY - rect.top) / rect.height) * 100;
        setZoomPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        updateZoomPosition(e.clientX, e.clientY);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsZooming(true);
        if (e.touches[0]) {
            updateZoomPosition(e.touches[0].clientX, e.touches[0].clientY);
        }
    };

    const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.touches[0]) {
            updateZoomPosition(e.touches[0].clientX, e.touches[0].clientY);
        }
    };

    const handleTouchEnd = () => {
        setIsZooming(false);
    };

    return (
        <Dialog open={!!product} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="w-[95vw] max-w-5xl p-0 border-0 rounded-2xl shadow-2xl bg-white dark:bg-gray-900 overflow-hidden">
                <div className="flex flex-col md:flex-row">
                    {/* Image with Zoom */}
                    <div
                        ref={imgContainerRef}
                        className="w-full md:w-[45%] bg-gray-100 dark:bg-gray-800 relative flex items-center justify-center aspect-square md:aspect-auto md:min-h-[400px] overflow-hidden"
                    >
                        <button onClick={onClose} className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/30 text-white md:hidden">
                            <X className="h-4 w-4" />
                        </button>

                        {(product as any).flashOffer && (
                            <Badge className="absolute top-3 left-3 z-10 bg-red-500 text-white text-xs font-bold px-2 py-0.5 animate-pulse">⚡ FLASH</Badge>
                        )}

                        {currentImage ? (
                            <>
                                <img
                                    src={currentImage}
                                    alt={product.name}
                                    className={`max-w-[85%] max-h-[85%] object-contain transition-opacity duration-200 ${isZooming ? 'opacity-0' : 'opacity-100'}`}
                                />

                                {/* Center Zoom Trigger Zone - Only activates in center 60% */}
                                <div
                                    className="absolute inset-[20%] cursor-zoom-in z-5 touch-none"
                                    onMouseEnter={() => setIsZooming(true)}
                                    onMouseLeave={() => setIsZooming(false)}
                                    onMouseMove={handleMouseMove}
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                />

                                {/* Zoomed Background */}
                                {isZooming && (
                                    <div
                                        className="absolute inset-0 bg-no-repeat transition-all duration-75 pointer-events-none z-10"
                                        style={{
                                            backgroundImage: `url(${currentImage})`,
                                            backgroundSize: '250%',
                                            backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`
                                        }}
                                    />
                                )}
                                {/* Zoom indicator */}
                                {!isZooming && (
                                    <div className="absolute bottom-3 right-3 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full flex items-center gap-1 pointer-events-none">
                                        <ZoomIn className="h-3 w-3" /> Zoom
                                    </div>
                                )}
                            </>
                        ) : (
                            <span className="text-5xl font-bold text-gray-300">{product.name[0]}</span>
                        )}

                        {hasMultipleImages && (
                            <>
                                <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 dark:bg-black/60 rounded-full shadow-lg z-20 hover:bg-white transition-colors">
                                    <ChevronLeft className="h-5 w-5" />
                                </button>
                                <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-white/90 dark:bg-black/60 rounded-full shadow-lg z-20 hover:bg-white transition-colors">
                                    <ChevronRight className="h-5 w-5" />
                                </button>
                                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                                    {product.images?.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setImgIdx(i)}
                                            className={`w-2.5 h-2.5 rounded-full transition-all ${i === imgIdx ? 'bg-violet-600 scale-125' : 'bg-gray-400 hover:bg-gray-600'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Details - All visible */}
                    <div className="w-full md:w-[55%] p-5 md:p-6 flex flex-col justify-between">
                        {/* Header */}
                        <div>
                            <div className="flex justify-between items-start">
                                <Badge className="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-[10px] uppercase font-bold mb-1">{product.category}</Badge>
                            </div>
                            <h2 className="text-xl md:text-2xl font-bold dark:text-white leading-tight">{product.name}</h2>
                            <div className="flex items-center gap-1 mt-1 mb-2">
                                {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />)}
                                <span className="text-[10px] text-gray-500 ml-1">(4.8)</span>
                            </div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">{product.description}</p>
                        </div>

                        {/* Price & Stock */}
                        <div className="flex items-end justify-between my-4 py-3 px-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                            <div>
                                <span className="text-[10px] uppercase text-gray-400 font-bold">Precio</span>
                                <p className="text-2xl md:text-3xl font-bold text-violet-600">{formatPrice(product.price)}</p>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] uppercase text-gray-400 font-bold">Stock</span>
                                <p className={`text-sm font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                    {product.stock > 0 ? 'Disponible' : 'Agotado'}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <Button
                                onClick={() => { addToCart(product); onClose(); }}
                                disabled={product.stock === 0}
                                className="flex-1 h-11 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-xl"
                            >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Agregar
                            </Button>
                            <Button variant="outline" className="h-11 w-11 p-0 rounded-xl" onClick={() => toggleFavorite(product.id)}>
                                <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                            </Button>
                            <Button
                                variant="ghost"
                                className="h-11 w-11 p-0 rounded-xl text-green-600"
                                onClick={() => {
                                    const store = stores.find(s => s.id === product.storeId);
                                    if (store?.phone) {
                                        window.open(generateWhatsAppLink(store.phone, `Hola, me interesa ${product.name}`), '_blank');
                                    }
                                }}
                            >
                                <MessageCircle className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
