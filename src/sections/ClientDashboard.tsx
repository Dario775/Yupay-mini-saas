import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Package,
  Clock,
  MapPin,
  Search,
  Star,
  Heart,
  ShoppingCart,
  CheckCircle,
  Truck,
  CreditCard,
  ChevronRight,
  Minus,
  Plus,
  X,
  User,
  Settings,
  Bell,
  Eye,
  Store,
  RefreshCw,
  XCircle,
  Filter,
  Wallet,
  Banknote,
  Zap,
  Shield,
  Gift,
  Headphones,
  Sparkles,
  TrendingUp,
  ArrowRight,
  Navigation,
  Loader2,
  MessageCircle,
  Timer,
  ShieldCheck,
  Headset,
  History
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useClientData } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import type { Product, Order, GeoLocation, FlashOffer } from '@/types';
import { toast } from 'sonner';
import { searchAddresses, getCurrentPosition, reverseGeocode, formatDistance, calculateDistance } from '@/lib/geo';
import { generateWhatsAppLink, formatOrderMessage } from '@/utils/whatsapp';

function OrderStatusBadge({ status }: { status: Order['status'] }) {
  const styles = {
    pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    procesando: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    enviado: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    entregado: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  const icons = { pendiente: Clock, procesando: RefreshCw, enviado: Truck, entregado: CheckCircle, cancelado: XCircle };
  const Icon = icons[status];
  return (
    <Badge className={`${styles[status]} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

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

function ProductTimer({ endDate }: { endDate: Date }) {
  const [time, setTime] = useState(getTimeRemaining(endDate));
  useEffect(() => {
    const interval = setInterval(() => setTime(getTimeRemaining(endDate)), 1000);
    return () => clearInterval(interval);
  }, [endDate]);

  return (
    <div className="absolute top-2 left-2 z-10 px-2 py-1 rounded-lg bg-yellow-500 text-white text-[10px] font-bold flex items-center gap-1 shadow-lg animate-pulse">
      <Timer className="h-3 w-3" />
      {time}
    </div>
  );
}

function ProductCard({
  product,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
  onView,
  distance,
  flashOffer
}: {
  product: Product;
  onAddToCart: (product: Product) => void;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onView: (product: Product) => void;
  distance?: number;
  flashOffer?: FlashOffer;
}) {
  const hasFlash = !!flashOffer;
  const discountedPrice = hasFlash
    ? flashOffer.discountType === 'percentage'
      ? product.price * (1 - flashOffer.discountValue / 100)
      : product.price - flashOffer.discountValue
    : product.isOnSale && product.discount
      ? product.price * (1 - product.discount / 100)
      : null;

  return (
    <Card className={`group relative overflow-hidden bg-white dark:bg-gray-900 border ${hasFlash ? 'border-yellow-400 shadow-yellow-100 dark:shadow-yellow-900/10' : 'border-gray-100 dark:border-gray-800'} shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl`}>
      {/* Favorite Button */}
      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(product.id); }}
        className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm transition-all hover:scale-110 shadow-sm"
      >
        <Heart className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
      </button>

      {/* Flash Timer */}
      {hasFlash && <ProductTimer endDate={flashOffer.endDate} />}

      {/* Image Area */}
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

        {/* Badges Overlay */}
        <div className="absolute bottom-2 left-2 flex flex-col gap-1">
          {distance !== undefined && (
            <div className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-md text-[9px] font-bold text-white flex items-center gap-1">
              <MapPin className="h-2.5 w-2.5" />
              {formatDistance(distance)}
            </div>
          )}
          {hasFlash && (
            <Badge className="bg-yellow-500 text-white text-[9px] border-none shadow-sm">
              <Zap className="h-2.5 w-2.5 mr-1" />
              OFERTA FLASH
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-3 space-y-2">
        <div>
          <h3 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1 leading-tight">{product.name}</h3>
          <p className="text-[10px] text-gray-500 dark:text-gray-400">{product.category}</p>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {discountedPrice ? (
              <>
                <p className="text-sm font-bold text-violet-600 dark:text-violet-400">${discountedPrice.toFixed(0)}</p>
                <p className="text-[10px] text-gray-400 line-through">${product.price}</p>
              </>
            ) : (
              <p className="text-sm font-bold text-gray-900 dark:text-white">${product.price}</p>
            )}
          </div>
          <Button
            size="sm"
            className={`h-7 px-3 ${hasFlash ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-violet-600 hover:bg-violet-700'} text-white text-[10px] font-bold rounded-full gap-1`}
            onClick={(e) => { e.stopPropagation(); onAddToCart({ ...product, price: discountedPrice || product.price } as Product); }}
            disabled={product.stock === 0}
          >
            {hasFlash ? <Zap className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
            Añadir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ClientDashboardProps {
  activeTab?: string;
}

export default function ClientDashboard({ activeTab = 'shop' }: ClientDashboardProps) {
  const { user } = useAuth();
  const {
    orders, products, stores, favorites, flashOffers,
    createOrder, cancelOrder, toggleFavorite, isFavorite
  } = useClientData(user?.id || '2');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);

  // Escuchar evento para abrir el carrito desde la barra de navegación superior
  useEffect(() => {
    const handleToggleCart = () => setIsCartOpen(prev => !prev);
    window.addEventListener('toggle-cart', handleToggleCart);
    return () => window.removeEventListener('toggle-cart', handleToggleCart);
  }, []);

  // Estados para ubicación
  const [userLocation, setUserLocation] = useState<GeoLocation | null>(user?.location || null);
  const [searchRadius, setSearchRadius] = useState<number>(user?.searchRadius ?? 100);
  const [addressSearch, setAddressSearch] = useState('');
  const [addressResults, setAddressResults] = useState<GeoLocation[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Categorías únicas
  const categories = ['Todos', ...new Set(products.map(p => p.category))];

  // Filtrar productos por búsqueda, categoría y ubicación
  const filteredProducts = products
    .map(product => {
      // Calcular distancia si hay ubicación del usuario y de la tienda
      const productStore = stores.find(s => s.id === product.storeId);
      let distance: number | undefined;

      if (userLocation && productStore?.location) {
        distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          productStore.location.lat,
          productStore.location.lng
        );
      }

      // Buscar oferta flash activa para este producto
      const flashOffer = flashOffers?.find(o => o.status === 'active' && o.productIds.includes(product.id));

      return { ...product, distance, storeLocation: productStore?.location, flashOffer };
    })
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || product.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;

      // Filtro por ubicación
      let matchesLocation = true;
      if (userLocation) {
        const productStore = stores.find(s => s.id === product.storeId);
        if (productStore?.location) {
          if (searchRadius === 0) {
            // Solo misma localidad
            matchesLocation = productStore.location.locality?.toLowerCase() === userLocation.locality?.toLowerCase();
          } else {
            // Dentro del radio
            matchesLocation = product.distance !== undefined && product.distance <= searchRadius;
          }
        } else {
          // Tiendas sin ubicación no se muestran si hay filtro activo
          matchesLocation = false;
        }
      }

      return matchesSearch && matchesCategory && matchesLocation;
    })
    .sort((a, b) => {
      // Ordenar por distancia si hay ubicación
      if (a.distance !== undefined && b.distance !== undefined) {
        return a.distance - b.distance;
      }
      return 0;
    });

  const favoriteProducts = products.filter(p => favorites.includes(p.id));

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

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Sincronizar conteo de carrito con la UI global (App.tsx)
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('cart-count-changed', { detail: cartItemsCount }));
  }, [cartItemsCount]);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const storeId = cart[0].product.storeId;
    const items = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.quantity,
      unitPrice: item.product.price,
      total: item.product.price * item.quantity,
    }));
    createOrder(storeId, items, 'Calle Cliente 789, Ciudad');
    toast.success('¡Pedido realizado exitosamente!');
    setCart([]);
    setIsCartOpen(false);
  };

  const handleCancelOrder = (orderId: string) => {
    cancelOrder(orderId);
    toast.success('Pedido cancelado');
    setShowCancelConfirm(null);
  };

  const handleToggleFavorite = (productId: string) => {
    toggleFavorite(productId);
    toast.success(isFavorite(productId) ? 'Eliminado de favoritos' : 'Agregado a favoritos');
  };

  // Buscar direcciones mientras el usuario escribe
  const handleAddressSearch = useCallback(async (query: string) => {
    setAddressSearch(query);
    if (query.length < 3) {
      setAddressResults([]);
      return;
    }
    setIsSearchingAddress(true);
    try {
      const results = await searchAddresses(query, 'ar');
      setAddressResults(results);
    } catch (error) {
      console.error('Error searching addresses:', error);
    } finally {
      setIsSearchingAddress(false);
    }
  }, []);

  // Seleccionar una dirección de los resultados
  const selectAddress = (location: GeoLocation) => {
    setUserLocation(location);
    setAddressSearch('');
    setAddressResults([]);
    toast.success('Ubicación actualizada');
  };

  // Obtener ubicación actual del navegador
  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const coords = await getCurrentPosition();
      const location = await reverseGeocode(coords.lat, coords.lng);
      if (location) {
        setUserLocation(location);
        toast.success('Ubicación detectada');
      } else {
        toast.error('No se pudo obtener la dirección');
      }
    } catch (error: any) {
      toast.error(error.message || 'Error al obtener ubicación');
    } finally {
      setIsGettingLocation(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 transition-colors duration-300">
      <Tabs value={activeTab} className="w-full">
        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

          {/* Shop Tab */}
          <TabsContent value="shop">
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

            {/* Active Flash Offers Section */}
            {flashOffers?.filter(o => o.status === 'active').length > 0 && (
              <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-yellow-500 text-white shadow-lg shadow-yellow-500/20">
                      <Zap className="h-5 w-5 fill-current" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Ofertas Flash</h2>
                      <p className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">¡Solo por tiempo limitado!</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-yellow-500 text-yellow-600 dark:text-yellow-400 animate-pulse">
                    En Directo
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products
                    .filter(p => flashOffers.some(o => o.status === 'active' && o.productIds.includes(p.id)))
                    .map(product => {
                      const offer = flashOffers.find(o => o.status === 'active' && o.productIds.includes(product.id));
                      const productStore = stores.find(s => s.id === product.storeId);
                      let distance: number | undefined;
                      if (userLocation && productStore?.location) {
                        distance = calculateDistance(userLocation.lat, userLocation.lng, productStore.location.lat, productStore.location.lng);
                      }

                      return (
                        <ProductCard
                          key={`flash-${product.id}`}
                          product={product}
                          onAddToCart={addToCart}
                          isFavorite={isFavorite(product.id)}
                          onToggleFavorite={handleToggleFavorite}
                          onView={setSelectedProduct}
                          distance={distance}
                          flashOffer={offer}
                        />
                      );
                    })}
                </div>
                <Separator className="mt-10" />
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
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                  isFavorite={isFavorite(product.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onView={setSelectedProduct}
                  distance={product.distance}
                  flashOffer={product.flashOffer}
                />
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No se encontraron productos</h3>
                <p className="text-gray-500 dark:text-gray-400">Intenta con otra búsqueda o categoría</p>
              </div>
            )}

            {/* Benefits Section - Premium Refactor */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-12 mb-16">
              {[
                {
                  icon: ShieldCheck,
                  title: 'Compra Protegida',
                  desc: 'Garantía oficial en todos los productos',
                  color: 'from-emerald-400 to-cyan-500',
                  bg: 'bg-emerald-500/10'
                },
                {
                  icon: History,
                  title: 'Cambios Sin Vueltas',
                  desc: '30 días para devoluciones gratuitas',
                  color: 'from-violet-400 to-purple-600',
                  bg: 'bg-violet-500/10'
                },
                {
                  icon: Headset,
                  title: 'Soporte VIP 24/7',
                  desc: 'Asistencia inmediata por expertos',
                  color: 'from-amber-400 to-orange-600',
                  bg: 'bg-amber-500/10'
                },
              ].map((benefit, i) => (
                <div
                  key={i}
                  className="relative group bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 hover:border-violet-200 dark:hover:border-violet-900/50 hover:shadow-2xl hover:shadow-violet-500/5 transition-all duration-500 overflow-hidden"
                >
                  <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full ${benefit.bg} blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>

                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${benefit.color} flex items-center justify-center mb-6 shadow-lg shadow-current/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}>
                    <benefit.icon className="h-7 w-7 text-white" />
                  </div>

                  <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {benefit.title}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {benefit.desc}
                  </p>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 dark:text-white">Mis Pedidos</h2>
              <p className="text-gray-600 dark:text-gray-400">Seguimiento de tus compras</p>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-16">
                <Package className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No tienes pedidos</h3>
                <p className="text-gray-500 dark:text-gray-400">Cuando realices una compra, aparecerá aquí</p>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((order) => (
                  <Card key={order.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden rounded-2xl transition-all active:scale-[0.98]">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-[10px] font-mono text-gray-400">#{order.id}</p>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">{order.createdAt.toLocaleDateString()}</p>
                        </div>
                        <OrderStatusBadge status={order.status} />
                      </div>

                      <div className="flex gap-1.5 overflow-x-auto py-1 scrollbar-hide mb-3">
                        {order.items.map((item, idx) => (
                          <span key={idx} className="flex-shrink-0 text-[10px] bg-gray-50 dark:bg-gray-800 px-2 py-0.5 rounded-full text-gray-500 border dark:border-gray-700">
                            {item.productName}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t dark:border-gray-800">
                        <p className="text-sm font-bold text-violet-600">${order.total.toFixed(2)}</p>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-gray-500" onClick={() => setSelectedOrder(order)}>Detalles</Button>
                          {order.status === 'pendiente' && (
                            <Button variant="ghost" size="sm" className="h-8 text-xs font-bold text-red-500" onClick={() => setShowCancelConfirm(order.id)}>Cancelar</Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2 dark:text-white">Mis Favoritos</h2>
              <p className="text-gray-600 dark:text-gray-400">Productos que te gustan</p>
            </div>

            {favoriteProducts.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">No tienes favoritos</h3>
                <p className="text-gray-500 dark:text-gray-400">Guarda productos que te gusten para verlos aquí</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {favoriteProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={addToCart}
                    isFavorite={true}
                    onToggleFavorite={handleToggleFavorite}
                    onView={setSelectedProduct}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Profile Tab - Minimalist Refactor */}
          <TabsContent value="profile">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Mi Perfil</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Gestiona tu información y preferencias</p>
              </div>

              <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden rounded-2xl">
                <CardHeader className="p-4 sm:p-6 pb-0">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative">
                      <img src={user?.avatar} alt={user?.name} className="w-16 h-16 rounded-full border-2 border-violet-100 dark:border-violet-900" />
                      <div className="absolute -bottom-1 -right-1 p-1 bg-violet-600 rounded-full border-2 border-white dark:border-gray-900">
                        <Star className="h-2.5 w-2.5 text-white fill-white" />
                      </div>
                    </div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-lg font-bold dark:text-white">{user?.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nombre</Label>
                      <Input defaultValue={user?.name} className="h-9 text-sm bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800" />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Teléfono</Label>
                      <Input placeholder="+54 11 1234 5678" className="h-9 text-sm bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800" />
                    </div>
                  </div>
                  <Button className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white font-bold h-9 px-6 rounded-xl" onClick={() => toast.success('Perfil actualizado')}>
                    Guardar Cambios
                  </Button>
                </CardContent>
              </Card>

              {/* Location Card - More Compact */}
              <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden rounded-2xl">
                <CardHeader className="p-4 sm:p-6 border-b dark:border-gray-800">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 dark:text-white">
                    <MapPin className="h-4 w-4 text-violet-500" /> Mi Ubicación
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  {userLocation && (
                    <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/30 flex items-center gap-3">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                        <MapPin className="h-4 w-4 text-violet-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold dark:text-white truncate">{userLocation.locality || 'Seleccionada'}</p>
                        <p className="text-[10px] text-gray-500 truncate">{userLocation.address}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setUserLocation(null)} className="h-8 w-8 text-gray-400">
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Buscar dirección..."
                      value={addressSearch}
                      onChange={(e) => handleAddressSearch(e.target.value)}
                      className="pl-10 h-10 text-sm bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl"
                    />
                  </div>

                  <Button
                    variant="outline"
                    className="w-full h-10 gap-2 border-gray-100 dark:border-gray-800 rounded-xl text-xs font-bold"
                    onClick={handleGetCurrentLocation}
                    disabled={isGettingLocation}
                  >
                    {isGettingLocation ? <Loader2 className="h-4 w-4 animate-spin text-violet-600" /> : <Navigation className="h-4 w-4 text-violet-600" />}
                    Usar ubicación actual
                  </Button>
                </CardContent>
              </Card>

              {/* Preferences */}
              <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden rounded-2xl">
                <CardHeader className="p-4 sm:p-6 border-b dark:border-gray-800">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 dark:text-white">
                    <Settings className="h-4 w-4 text-violet-500" /> Preferencias
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold dark:text-white">Notificaciones por email</p>
                      <p className="text-[10px] text-gray-500">Actualizaciones de pedidos</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold dark:text-white">Ofertas y promociones</p>
                      <p className="text-[10px] text-gray-500">Descuentos exclusivos</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </main>
      </Tabs>

      {/* Cart Dialog - Refined for Minimalism */}
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="max-w-md w-[95vw] rounded-3xl p-0 overflow-hidden dark:bg-gray-900 border-0 shadow-2xl">
          <div className="p-6 bg-violet-600">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Tu Carrito
            </h3>
            <p className="text-violet-100 text-xs mt-1">{cartItemsCount} productos seleccionados</p>
          </div>

          <div className="p-4 sm:p-6 bg-white dark:bg-gray-900">
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
                        {product.images?.[0] ? <img src={product.images[0]} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-gray-300">{product.name[0]}</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate">{product.name}</h4>
                        <p className="text-[10px] text-violet-600 font-bold">${product.price}</p>
                      </div>
                      <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-full px-2 py-1 gap-3">
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
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center text-sm font-bold border-t dark:border-gray-800 pt-4">
                  <span className="text-gray-500 uppercase tracking-widest text-[10px]">Total</span>
                  <span className="text-xl text-violet-600">${cartTotal.toFixed(2)}</span>
                </div>
                <Button onClick={handleCheckout} className="w-full h-12 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl shadow-lg shadow-violet-500/20">
                  Realizar Pedido
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-12 border-green-500 text-green-600 hover:bg-green-50 font-bold rounded-2xl gap-2"
                  onClick={() => {
                    const storeId = cart[0]?.product.storeId;
                    const store = stores.find(s => s.id === storeId);
                    if (store?.phone) {
                      const orderMock: any = {
                        items: cart.map(i => ({ quantity: i.quantity, productName: i.product.name, unitPrice: i.product.price })),
                        total: cartTotal,
                        shippingAddress: userLocation?.address || 'Mi dirección'
                      };
                      const msg = formatOrderMessage(orderMock, store.name);
                      window.open(generateWhatsAppLink(store.phone, msg), '_blank');
                    } else {
                      toast.error('La tienda no tiene WhatsApp configurado');
                    }
                  }}
                >
                  <MessageCircle className="h-5 w-5" />
                  Pedir por WhatsApp
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-lg dark:bg-gray-900 border-0 rounded-3xl overflow-hidden p-0">
          {selectedProduct && (() => {
            const productStore = stores.find(s => s.id === selectedProduct.storeId);
            const storeShipping = productStore?.shippingMethods?.filter(m => m.isActive) || [];
            return (
              <div className="space-y-0">
                <div className="relative aspect-video bg-gray-50 dark:bg-gray-800 overflow-hidden">
                  <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 backdrop-blur-md text-white">
                    <X className="h-4 w-4" />
                  </button>
                  {selectedProduct.images?.[0] ? <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-gray-300">{selectedProduct.name[0]}</div>}
                </div>

                <div className="p-6 space-y-4">
                  <div>
                    <Badge className="bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border-0 text-[10px] uppercase font-bold mb-2">
                      {selectedProduct.category}
                    </Badge>
                    <h3 className="text-xl font-bold dark:text-white leading-tight">{selectedProduct.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{selectedProduct.description}</p>
                  </div>

                  <Separator className="dark:border-gray-800" />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Precio</p>
                      <p className="text-2xl font-bold text-violet-600">${selectedProduct.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Stock</p>
                      <p className={`text-sm font-bold ${selectedProduct.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {selectedProduct.stock > 0 ? `${selectedProduct.stock} unidades` : 'Agotado'}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => { addToCart(selectedProduct); setSelectedProduct(null); }}
                      disabled={selectedProduct.stock === 0}
                      className="flex-1 h-12 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl"
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Agregar
                    </Button>
                    <Button
                      variant="outline"
                      className="h-12 px-4 border-green-500 text-green-600 hover:bg-green-50 rounded-2xl"
                      onClick={() => {
                        const store = stores.find(s => s.id === selectedProduct.storeId);
                        if (store?.phone) {
                          const msg = `Hola ${store.name}, estoy interesado en *${selectedProduct.name}*. ¿Tienen stock?`;
                          window.open(generateWhatsAppLink(store.phone, msg), '_blank');
                        }
                      }}
                    >
                      <MessageCircle className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleToggleFavorite(selectedProduct.id)}
                      className="h-12 w-12 rounded-2xl border-gray-100 dark:border-gray-800"
                    >
                      <Heart className={`h-5 w-5 ${isFavorite(selectedProduct.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-md dark:bg-gray-900 border-0 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold dark:text-white">Detalles del Pedido</DialogTitle>
            <DialogDescription className="text-xs">Identificador: #{selectedOrder?.id}</DialogDescription>
          </DialogHeader>
          {selectedOrder && (
            <div className="mt-4 space-y-6">
              <div className="flex items-center justify-between">
                <OrderStatusBadge status={selectedOrder.status} />
                <p className="text-xs font-bold text-gray-500">{selectedOrder.createdAt.toLocaleDateString()}</p>
              </div>

              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Productos</p>
                <div className="space-y-2">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 dark:text-gray-300">{item.quantity}x {item.productName}</span>
                      <span className="font-bold dark:text-white">${item.total.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t dark:border-gray-800 flex justify-between items-center font-bold">
                <span className="text-gray-500 text-xs">TOTAL PAGADO</span>
                <span className="text-xl text-violet-600">${selectedOrder.total.toFixed(2)}</span>
              </div>

              <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                <p className="text-[11px] text-gray-500 leading-relaxed">{selectedOrder.shippingAddress}</p>
              </div>

              {selectedOrder.status === 'pendiente' && (
                <Button variant="destructive" className="w-full h-11 rounded-xl font-bold text-xs" onClick={() => { handleCancelOrder(selectedOrder.id); setSelectedOrder(null); }}>
                  CANCELAR PEDIDO
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Confirm Dialog */}
      <Dialog open={!!showCancelConfirm} onOpenChange={() => setShowCancelConfirm(null)}>
        <DialogContent className="max-w-sm dark:bg-gray-900 border-0 rounded-3xl p-6">
          <DialogHeader>
            <DialogTitle className="text-center font-bold dark:text-white">¿Cancelar pedido?</DialogTitle>
            <DialogDescription className="text-center text-xs">
              Esta acción no se puede deshacer y el pedido será marcado como cancelado.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1 h-11 rounded-xl font-bold text-xs" onClick={() => setShowCancelConfirm(null)}>NO, MANTENER</Button>
            <Button variant="destructive" className="flex-1 h-11 rounded-xl font-bold text-xs" onClick={() => showCancelConfirm && handleCancelOrder(showCancelConfirm)}>SÍ, CANCELAR</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
