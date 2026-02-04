import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingBag,
  Package,
  MapPin,
  Search,
  Star,
  Heart,
  ShoppingCart,
  CreditCard,
  ChevronRight,
  Minus,
  Plus,
  X,
  User,
  Bell,
  Eye,
  Store,
  Wallet,
  Banknote,
  Shield,
  Gift,
  Headphones,
  Sparkles,
  TrendingUp,
  ArrowRight,
  MessageCircle,
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
import { ShopView } from './ClientDashboard/ShopView';
import { CartDrawer } from './ClientDashboard/CartDrawer';
import { OrdersView } from './ClientDashboard/OrdersView';
import { FavoritesView } from './ClientDashboard/FavoritesView';
import { ProfileView } from './ClientDashboard/ProfileView';

import { useAuth } from '@/hooks/useAuth';
import type { Product, Order, GeoLocation, FlashOffer } from '@/types';
import { toast } from 'sonner';
import { searchAddresses, getCurrentPosition, reverseGeocode, formatDistance, calculateDistance } from '@/lib/geo';
import { generateWhatsAppLink, formatOrderMessage } from '@/utils/whatsapp';
import { formatPrice } from '@/utils/format';





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
            <ShopView
              products={products}
              flashOffers={flashOffers}
              stores={stores}
              filteredProducts={filteredProducts}
              categories={categories}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              favorites={favorites}
              addToCart={addToCart}
              handleToggleFavorite={handleToggleFavorite}
              setSelectedProduct={setSelectedProduct}
              userLocation={userLocation}
            />

          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <OrdersView orders={orders} onCancelOrder={handleCancelOrder} />
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <FavoritesView
              favoriteProducts={favoriteProducts}
              addToCart={addToCart}
              isFavorite={isFavorite}
              onToggleFavorite={handleToggleFavorite}
              setSelectedProduct={setSelectedProduct}
            />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <ProfileView
              user={user}
              userLocation={userLocation}
              onUpdateLocation={setUserLocation}
            />
          </TabsContent>
        </main>
      </Tabs>

      {/* Cart Drawer - Modular Component */}
      <CartDrawer
        isOpen={isCartOpen}
        onOpenChange={setIsCartOpen}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onCheckout={handleCheckout}
        stores={stores}
        userLocation={userLocation}
        cartTotal={cartTotal}
        cartItemsCount={cartItemsCount}
      />

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


    </div>
  );
}
