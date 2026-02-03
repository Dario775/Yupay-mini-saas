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
    Loader2
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
import { generateWhatsAppLink, formatOrderMessage } from '@/utils/whatsapp';
import { formatPrice } from '@/utils/format';

// Reusing ProductCard component logic but simplified for this file
function ProductCard({
    product,
    onAddToCart,
    onView
}: {
    product: Product;
    onAddToCart: (product: Product) => void;
    onView: (product: Product) => void;
}) {
    const discountedPrice = product.isOnSale && product.discount
        ? product.price * (1 - product.discount / 100)
        : null;

    return (
        <Card className="group relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
            <div
                className="relative aspect-[4/3] bg-gray-50 dark:bg-gray-800 overflow-hidden cursor-pointer"
                onClick={() => onView(product)}
            >
                {product.images?.[0] ? (
                    <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-gray-200 dark:text-gray-700">
                        {product.name.charAt(0)}
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
                                <p className="text-sm font-bold text-violet-600 dark:text-violet-400">{formatPrice(discountedPrice)}</p>
                                <p className="text-[10px] text-gray-400 line-through">{formatPrice(product.price)}</p>
                            </>
                        ) : (
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{formatPrice(product.price)}</p>
                        )}
                    </div>
                    <Button
                        size="sm"
                        className="h-7 px-3 bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-bold rounded-full gap-1"
                        onClick={(e) => { e.stopPropagation(); onAddToCart({ ...product, price: discountedPrice || product.price } as Product); }}
                        disabled={product.stock === 0}
                    >
                        <Plus className="h-3 w-3" />
                        Añadir
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
                        />
                    ))}
                </div>
            </main>

            {/* Cart Dialog */}
            <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
                <DialogContent className="max-w-md w-[95vw] rounded-3xl p-0 overflow-hidden dark:bg-gray-900 border-0">
                    <div className="p-6 bg-violet-600">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <ShoppingCart className="h-5 w-5" />
                            Tu Pedido
                        </h3>
                        <p className="text-violet-100 text-xs mt-1">{cartItemsCount} productos</p>
                    </div>

                    <div className="p-6 bg-white dark:bg-gray-900">
                        <ScrollArea className="max-h-[50vh] pr-4">
                            {cart.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">
                                    <ShoppingCart className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">Tu carrito está vacío</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {cart.map(({ product, quantity }) => (
                                        <div key={product.id} className="flex items-center gap-3">
                                            <div className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden flex-shrink-0">
                                                {product.images?.[0] ? <img src={product.images[0]} className="w-full h-full object-cover" /> : null}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{product.name}</h4>
                                                <p className="text-violet-600 font-bold text-sm">{formatPrice(product.price)}</p>
                                            </div>
                                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-full px-2 py-1">
                                                <button onClick={() => updateQuantity(product.id, -1)} className="p-1 hover:text-red-500 transition-colors"><Minus className="h-3 w-3" /></button>
                                                <span className="text-xs font-bold w-4 text-center">{quantity}</span>
                                                <button onClick={() => updateQuantity(product.id, 1)} className="p-1 hover:text-green-500 transition-colors"><Plus className="h-3 w-3" /></button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>

                        {cart.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
                                {/* Payment Method Selector */}
                                {activePaymentMethods.length > 0 && (
                                    <div className="mb-4 space-y-2">
                                        <label className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase">Método de Pago</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {activePaymentMethods.map(pm => (
                                                <button
                                                    key={pm.id}
                                                    onClick={() => setSelectedPaymentMethod(pm.id)}
                                                    className={`p-2 rounded-lg border text-xs font-medium transition-all ${selectedPaymentMethod === pm.id
                                                        ? 'border-violet-600 bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300 dark:border-violet-500'
                                                        : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300'
                                                        }`}
                                                >
                                                    {pm.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-gray-500">Total a pagar</span>
                                    <span className="text-2xl font-black text-gray-900 dark:text-white">{formatPrice(cartTotal)}</span>
                                </div>
                                <Button onClick={handleCheckout} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-xl shadow-lg shadow-green-500/20">
                                    Enviar Pedido por WhatsApp
                                    <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
