import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    ShoppingBag,
    Package,
    MapPin,
    Search,
    ShoppingCart,
    Plus,
    Minus,
    X,
    Store,
    Filter,
    Zap,
    ArrowLeft,
    Loader2,
    Share2,
    MessageCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useClientData } from '@/hooks/useData';
import type { Product, Order } from '@/types';
import { generateWhatsAppLink, formatOrderMessage, formatProductShareMessage } from '@/utils/whatsapp';
import { formatPrice } from '@/utils/format';

function ProductCard({
    product,
    onAddToCart,
    onView,
    onShare
}: {
    product: Product;
    onAddToCart: (product: Product) => void;
    onView: (product: Product) => void;
    onShare: (product: Product) => void;
}) {
    const discountedPrice = product.isOnSale && product.discount
        ? product.price * (1 - product.discount / 100)
        : null;

    return (
        <Card className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all duration-500 rounded-[2rem] flex flex-col h-full">
            {/* Image Container with Glass Effects */}
            <div
                className="relative aspect-square sm:aspect-[4/3] bg-slate-50 dark:bg-slate-800/50 overflow-hidden cursor-pointer"
                onClick={() => onView(product)}
            >
                {product.images?.[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl font-black text-slate-200 dark:text-slate-700 uppercase">
                        {product.name.charAt(0)}
                    </div>
                )}

                {/* Sale Badge */}
                {product.isOnSale && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-rose-500 text-white text-[10px] font-black italic rounded-lg shadow-lg shadow-rose-500/30 animate-pulse">
                        -{product.discount}% OFF
                    </div>
                )}

                {/* Premium Share Button - High Visibility Emerald */}
                <button
                    onClick={(e) => { e.stopPropagation(); onShare(product); }}
                    className="absolute top-3 right-3 p-2.5 bg-emerald-500 text-white rounded-2xl shadow-xl shadow-emerald-500/30 hover:bg-emerald-600 hover:scale-110 transition-all duration-300 z-50 border border-emerald-400"
                    title="Compartir por WhatsApp"
                >
                    <MessageCircle className="h-4 w-4 fill-current" />
                </button>

                {/* Quick View Button on Hover */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black/60 to-transparent">
                    <p className="text-white text-[10px] font-bold text-center tracking-widest uppercase opacity-80">Ver Detalles</p>
                </div>
            </div>

            <CardContent className="p-4 flex flex-col flex-1 gap-3">
                <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">{product.category}</p>
                    </div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white line-clamp-2 leading-tight group-hover:text-violet-600 transition-colors uppercase tracking-tight">{product.name}</h3>
                </div>

                <div className="flex items-end justify-between pt-2">
                    <div className="flex flex-col">
                        {discountedPrice ? (
                            <>
                                <p className="text-lg font-black text-rose-600 dark:text-rose-400 leading-none">{formatPrice(discountedPrice)}</p>
                                <p className="text-[10px] text-slate-400 line-through font-bold mt-1">{formatPrice(product.price)}</p>
                            </>
                        ) : (
                            <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{formatPrice(product.price)}</p>
                        )}
                    </div>

                    <Button
                        size="sm"
                        className="h-9 px-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-violet-600 dark:hover:bg-violet-500 hover:text-white transition-all duration-300 rounded-xl font-black text-[10px] uppercase tracking-widest gap-2 shadow-lg shadow-black/5"
                        onClick={(e) => { e.stopPropagation(); onAddToCart({ ...product, price: discountedPrice || product.price } as Product); }}
                        disabled={product.stock === 0}
                    >
                        <Plus className="h-3 w-3 stroke-[3]" />
                        Agregar
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function PublicStore() {
    const { slug } = useParams(); // In MVP slug is just visual, we might fetch fixed store
    // Mock data fetching using the hook (in real app we'd fetch by slug)
    const { products, stores } = useClientData('public');
    // Mock store selection (just grabbing the first one for MVP)
    const store = stores[0];

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todos');
    const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const categories = ['Todos', ...new Set(products.map(p => p.category))];

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { product, quantity: 1 }];
        });
        toast.success(`${product.name} agregado al carrito`);
    };

    const updateQuantity = (productId: string, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.product.id === productId) {
                const newQuantity = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');

    const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

    const activePaymentMethods = store.paymentMethods?.filter(pm => pm.isActive) || [];

    const handleCheckout = () => {
        if (cart.length === 0) return;

        // Generate WhatsApp Message
        const customerName = "Invitado Web";
        // const orderId = Math.random().toString(36).substr(2, 6).toUpperCase();

        const paymentMethodName = activePaymentMethods.find(pm => pm.id === selectedPaymentMethod)?.name || 'A convenir';

        const message = `Hola *${store.name}*! 👋
Me gustaría realizar el siguiente pedido:

${cart.map(i => `• ${i.quantity}x ${i.product.name} (${formatPrice(i.product.price)})`).join('\n')}

*Total: ${formatPrice(cartTotal)}*

Cliente: ${customerName} (Web)
Entrega: Retiro en tienda
Pago: ${paymentMethodName}

Quedo a la espera de su confirmación. Gracias!`;

        // Mock store phone - Use store.phone if available
        const storePhone = store.phone || "5491112345678";
        const link = generateWhatsAppLink(storePhone, message);

        window.open(link, '_blank');
        toast.success('¡Pedido enviado por WhatsApp!');
        setCart([]);
        setIsCartOpen(false);
    };

    const handleShareProduct = (product: Product) => {
        const url = window.location.href; // In a real app we'd use a specific product link
        const message = formatProductShareMessage(product, store.name, url);
        // We use a general sharing if it's for friends, so no specific phone here usually
        // But for WhatsApp we can open wa.me/ without phone or just use the sharing API
        const link = `https://wa.me/?text=${encodeURIComponent(message)}`;
        window.open(link, '_blank');
        toast.info('Abriendo WhatsApp para compartir...');
    };

    if (!store) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
            {/* Public Header */}
            <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
                            <ArrowLeft className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold">
                                {store.name.charAt(0)}
                            </div>
                            <div>
                                <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{store.name}</h1>
                                <p className="text-[10px] text-emerald-600 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Abierto ahora
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={() => setIsCartOpen(true)}
                        className="relative bg-violet-600 hover:bg-violet-700 text-white rounded-full h-10 w-10 p-0"
                    >
                        <ShoppingCart className="h-5 w-5" />
                        {cartItemsCount > 0 && (
                            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 border-2 border-white dark:border-gray-900">
                                {cartItemsCount}
                            </Badge>
                        )}
                    </Button>
                </div>
            </nav>

            <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
                {/* Banner */}
                <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-8 mb-8">
                    <div className="relative z-10">
                        <h2 className="text-3xl font-bold mb-2">Bienvenido a {store.name}</h2>
                        <p className="text-violet-100 max-w-lg">{store.description || 'Encuentra los mejores productos aquí.'}</p>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap ${selectedCategory === cat
                                ? 'bg-violet-600 text-white shadow-lg shadow-violet-500/25'
                                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-100 dark:border-gray-800'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                    {filteredProducts.map(product => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onAddToCart={addToCart}
                            onView={setSelectedProduct}
                            onShare={(p) => handleShareProduct(p)}
                        />
                    ))}
                </div>
            </main>

            {/* Product Detail Dialog */}
            <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProduct(null)}>
                <DialogContent className="max-w-2xl w-[95vw] rounded-[2.5rem] p-0 overflow-hidden dark:bg-gray-950 border-0 shadow-2xl">
                    {selectedProduct && (
                        <div className="flex flex-col md:flex-row h-full">
                            {/* Image Section */}
                            <div className="md:w-1/2 relative aspect-square md:aspect-auto bg-slate-100 dark:bg-slate-900">
                                {selectedProduct.images?.[0] ? (
                                    <img src={selectedProduct.images[0]} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-6xl font-black text-slate-200 dark:text-slate-800 uppercase">
                                        {selectedProduct.name.charAt(0)}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute top-4 left-4 bg-white/20 hover:bg-white/40 backdrop-blur-xl text-white rounded-full z-10"
                                    onClick={() => setSelectedProduct(null)}
                                >
                                    <X className="h-5 w-5" />
                                </Button>
                            </div>

                            {/* Info Section */}
                            <div className="md:w-1/2 p-8 flex flex-col justify-between bg-white dark:bg-gray-950">
                                <div>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Badge className="bg-violet-600 text-white border-0 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                            {selectedProduct.category}
                                        </Badge>
                                        {selectedProduct.stock > 0 && (
                                            <Badge variant="outline" className="text-emerald-500 border-emerald-500/30 text-[10px] font-black uppercase tracking-widest">
                                                En Stock
                                            </Badge>
                                        )}
                                    </div>

                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-4 leading-tight tracking-tighter uppercase italic">{selectedProduct.name}</h3>

                                    <div className="space-y-4 mb-8">
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                            {selectedProduct.description || 'Este producto es parte de nuestra selección premium. Calidad garantizada y estilo único para tu día a día.'}
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-white/5">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Precio Final</p>
                                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{formatPrice(selectedProduct.price)}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600">
                                            <Zap className="h-6 w-6 fill-current" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <Button
                                            onClick={() => handleShareProduct(selectedProduct)}
                                            variant="outline"
                                            className="h-14 rounded-2xl border-2 border-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-500/10 font-black gap-3 text-xs uppercase tracking-widest group transition-all"
                                        >
                                            <div className="p-1.5 bg-green-500 text-white rounded-lg group-hover:scale-110 transition-transform">
                                                <MessageCircle className="h-4 w-4 fill-current" />
                                            </div>
                                            Compartir
                                        </Button>
                                        <Button
                                            onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                                            disabled={selectedProduct.stock === 0}
                                            className="h-14 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-violet-600 dark:hover:bg-violet-500 hover:text-white font-black gap-3 text-xs uppercase tracking-widest shadow-xl shadow-black/10"
                                        >
                                            <Plus className="h-5 w-5 stroke-[3]" />
                                            Lo quiero
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Cart Dialog */}
            <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
                <DialogContent className="max-w-md w-[95vw] rounded-[2.5rem] p-0 overflow-hidden dark:bg-gray-950 border-0 shadow-2xl">
                    <div className="p-8 bg-gradient-to-br from-violet-600 to-indigo-700">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-2xl font-black text-white flex items-center gap-3 italic uppercase tracking-tighter">
                                <ShoppingBag className="h-6 w-6" />
                                Tu Carrito
                            </h3>
                            <Button variant="ghost" size="icon" className="text-white/60 hover:text-white" onClick={() => setIsCartOpen(false)}>
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                        <p className="text-violet-100 text-xs font-bold opacity-80 uppercase tracking-widest">{cartItemsCount} artículos seleccionados</p>
                    </div>

                    <div className="p-8 bg-white dark:bg-gray-950">
                        <ScrollArea className="max-h-[40vh] pr-4">
                            {cart.length === 0 ? (
                                <div className="text-center py-16 text-slate-300 dark:text-slate-700">
                                    <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white dark:border-gray-900 shadow-inner">
                                        <ShoppingCart className="h-8 w-8 opacity-20" />
                                    </div>
                                    <p className="text-sm font-black uppercase tracking-widest">Tu carrito está vacío</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {cart.map(({ product, quantity }) => (
                                        <div key={product.id} className="flex items-center gap-4 group">
                                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-2xl overflow-hidden flex-shrink-0 border border-slate-100 dark:border-white/5 transition-transform group-hover:scale-105">
                                                {product.images?.[0] ? <img src={product.images[0]} className="w-full h-full object-cover" /> : (
                                                    <div className="w-full h-full flex items-center justify-center font-bold text-slate-300 uppercase">{product.name.charAt(0)}</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-[11px] font-black text-slate-900 dark:text-white truncate uppercase tracking-tight">{product.name}</h4>
                                                <p className="text-violet-600 dark:text-violet-400 font-black text-base">{formatPrice(product.price)}</p>
                                            </div>
                                            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/80 rounded-2xl px-3 py-2 border border-slate-100 dark:border-white/5">
                                                <button onClick={() => updateQuantity(product.id, -1)} className="p-1 hover:text-rose-500 transition-colors"><Minus className="h-3 w-3 stroke-[3]" /></button>
                                                <span className="text-xs font-black min-w-[20px] text-center">{quantity}</span>
                                                <button onClick={() => updateQuantity(product.id, 1)} className="p-1 hover:text-emerald-500 transition-colors"><Plus className="h-3 w-3 stroke-[3]" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>

                        {cart.length > 0 && (
                            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/5">
                                {/* Payment Method Selector */}
                                {activePaymentMethods.length > 0 && (
                                    <div className="mb-6 space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">¿Cómo preferís pagar?</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {activePaymentMethods.map(pm => (
                                                <button
                                                    key={pm.id}
                                                    onClick={() => setSelectedPaymentMethod(pm.id)}
                                                    className={`px-4 py-3 rounded-2xl border-2 text-[10px] font-black uppercase tracking-widest transition-all ${selectedPaymentMethod === pm.id
                                                        ? 'border-violet-600 bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400 dark:border-violet-500'
                                                        : 'border-slate-100 dark:border-white/5 text-slate-500 dark:text-slate-400 hover:border-slate-200 dark:hover:border-white/10'
                                                        }`}
                                                >
                                                    {pm.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-end mb-8 px-2">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mb-1">Total del Pedido</span>
                                        <span className="text-sm text-slate-500 italic">Precios incluyen IVA</span>
                                    </div>
                                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">{formatPrice(cartTotal)}</span>
                                </div>
                                <Button onClick={handleCheckout} className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-green-600 dark:hover:bg-green-500 hover:text-white font-black h-16 rounded-[1.5rem] shadow-2xl shadow-black/10 transition-all duration-300 text-xs uppercase tracking-[0.2em] group gap-4">
                                    Confirmar Pedido WhatsApp
                                    <div className="p-1.5 bg-white/20 dark:bg-black/10 rounded-lg group-hover:scale-110 transition-transform">
                                        <MessageCircle className="h-4 w-4 fill-current" />
                                    </div>
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
