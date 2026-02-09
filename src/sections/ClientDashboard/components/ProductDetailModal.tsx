
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Heart, MessageCircle, Star, X, ChevronLeft, ChevronRight, ZoomIn, Share2 } from 'lucide-react';
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
    onShare: (product: Product) => void;
}

export function ProductDetailModal({
    product,
    onClose,
    addToCart,
    toggleFavorite,
    isFavorite,
    stores,
    onShare
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
            <DialogContent className="w-[95vw] md:w-[85vw] max-w-4xl p-0 border-0 rounded-3xl shadow-2xl bg-white dark:bg-gray-950 overflow-hidden outline-none">
                <div className="flex flex-col md:flex-row max-h-[85vh]">
                    {/* Image Section */}
                    <div
                        ref={imgContainerRef}
                        className="w-full md:w-[45%] bg-slate-50 dark:bg-slate-900 relative flex items-center justify-center aspect-square md:aspect-auto border-b md:border-b-0 md:border-r border-slate-100 dark:border-slate-800"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/80 dark:bg-black/40 backdrop-blur-md text-slate-800 dark:text-white shadow-lg hover:scale-110 transition-transform md:hidden"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        {(product as any).flashOffer && (
                            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                                <Badge className="bg-rose-500 text-white text-[10px] font-black italic px-3 py-1 rounded-lg shadow-lg shadow-rose-500/30 animate-pulse border-0">
                                    ⚡ OFERTA FLASH
                                </Badge>
                            </div>
                        )}

                        {currentImage ? (
                            <div className="relative w-full h-full flex items-center justify-center p-6 md:p-12 overflow-hidden">
                                <img
                                    src={currentImage}
                                    alt={product.name}
                                    className={`max-w-full max-h-full object-contain transition-all duration-300 ${isZooming ? 'opacity-0 scale-110' : 'opacity-100 scale-100'}`}
                                />

                                {/* Interactive Zoom Zone */}
                                <div
                                    className="absolute inset-[15%] cursor-zoom-in z-20 touch-none"
                                    onMouseEnter={() => setIsZooming(true)}
                                    onMouseLeave={() => setIsZooming(false)}
                                    onMouseMove={handleMouseMove}
                                    onTouchStart={handleTouchStart}
                                    onTouchMove={handleTouchMove}
                                    onTouchEnd={handleTouchEnd}
                                />

                                {/* High-Performance Zoom View */}
                                {isZooming && (
                                    <div
                                        className="absolute inset-0 bg-no-repeat transition-all duration-100 pointer-events-none z-30 ring-1 ring-inset ring-white/10"
                                        style={{
                                            backgroundImage: `url(${currentImage})`,
                                            backgroundSize: '300%',
                                            backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`
                                        }}
                                    />
                                )}

                                {/* Zoom Help Tag */}
                                {!isZooming && (
                                    <div className="absolute bottom-6 right-6 bg-slate-900/10 dark:bg-white/10 backdrop-blur-md text-slate-600 dark:text-slate-400 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-2 pointer-events-none border border-slate-900/5 dark:border-white/5 uppercase tracking-widest">
                                        <ZoomIn className="h-3 w-3" /> Pasar para ampliar
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-8xl font-black text-slate-200 dark:text-slate-800 uppercase">
                                {product.name[0]}
                            </div>
                        )}

                        {hasMultipleImages && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); prevImage(); }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/10 hover:bg-black/30 text-slate-800 dark:text-white backdrop-blur-sm rounded-full transition-all z-40 hover:scale-110 active:scale-95 border border-white/10"
                                >
                                    <ChevronLeft className="h-5 w-5 stroke-[3]" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); nextImage(); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-black/10 hover:bg-black/30 text-slate-800 dark:text-white backdrop-blur-sm rounded-full transition-all z-40 hover:scale-110 active:scale-95 border border-white/10"
                                >
                                    <ChevronRight className="h-5 w-5 stroke-[3]" />
                                </button>
                                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-40 bg-slate-900/40 backdrop-blur-md px-3 py-1.5 rounded-full">
                                    {product.images?.map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
                                            className={`w-2 h-2 rounded-full transition-all duration-300 ${i === imgIdx ? 'bg-white scale-125 w-4' : 'bg-white/40 hover:bg-white/60'}`}
                                        />
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    {/* Info Section */}
                    <div className="w-full md:w-[55%] p-6 md:p-8 flex flex-col bg-white dark:bg-gray-950 overflow-y-auto">
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-3">
                                <Badge className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md border-0">
                                    {product.category}
                                </Badge>
                                <div className="flex items-center gap-1">
                                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-current" />
                                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">4.9</span>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 ml-auto rounded-full hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                                    onClick={() => onShare(product)}
                                    title="Compartir producto"
                                >
                                    <Share2 className="h-5 w-5 stroke-[1.5]" />
                                </Button>
                            </div>

                            <h2 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white leading-tight mb-3">
                                {product.name}
                            </h2>

                            <div className="space-y-3">
                                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                    {product.description || 'Este producto es parte de nuestra colección premium. Calidad garantizada y estilo único para tu día a día.'}
                                </p>
                            </div>
                        </div>

                        <div className="mt-auto space-y-4">
                            {/* Price & Status Area - Compact */}
                            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-800">
                                <div>
                                    <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider block mb-0.5">Precio</span>
                                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatPrice(product.price)}</p>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider block mb-0.5">Stock</span>
                                    <div className="flex items-center justify-end gap-1.5">
                                        <div className={`w-2 h-2 rounded-full ${product.stock > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                                        <p className={`text-xs font-bold ${product.stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                                            {product.stock > 0 ? 'Disponible' : 'Agotado'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons Group */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => { addToCart(product); onClose(); }}
                                    disabled={product.stock === 0}
                                    className="flex-[2] h-12 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-violet-600 dark:hover:bg-violet-500 hover:text-white font-bold rounded-xl text-sm transition-all shadow-md gap-2"
                                >
                                    <ShoppingCart className="h-4 w-4" />
                                    Agregar
                                </Button>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12 rounded-xl border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 active:scale-95 transition-all"
                                    onClick={() => toggleFavorite(product.id)}
                                    title="Guardar en favoritos"
                                >
                                    <Heart className={`h-6 w-6 transition-transform hover:scale-110 ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                                </Button>

                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-12 w-12 border-emerald-200 dark:border-emerald-800/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 rounded-xl active:scale-95 transition-all"
                                    onClick={() => {
                                        const store = stores.find(s => s.id === product.storeId);
                                        if (store?.phone) {
                                            window.open(generateWhatsAppLink(store.phone, `Hola, me interesa comprar: ${product.name}`), '_blank');
                                        }
                                    }}
                                    title="Consultar por WhatsApp a la tienda"
                                >
                                    <MessageCircle className="h-6 w-6" />
                                </Button>
                            </div>

                            <p className="text-[10px] text-center text-slate-400 dark:text-slate-500 font-medium">
                                Envío gestionado por la tienda
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
