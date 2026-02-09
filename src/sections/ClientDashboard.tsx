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
import { Separator } from '@/components/ui/separator';
import { useClientData } from '@/hooks/useData';
import { ShopView } from './ClientDashboard/ShopView';
import { CartDrawer } from './ClientDashboard/CartDrawer';
import { OrdersView } from './ClientDashboard/OrdersView';
import { FavoritesView } from './ClientDashboard/FavoritesView';
import { ProfileView } from './ClientDashboard/ProfileView';
import { ProductDetailModal } from './ClientDashboard/components/ProductDetailModal';

import { useAuth } from '@/hooks/useAuth';
import type { Product, Order, GeoLocation, FlashOffer } from '@/types';
import { toast } from 'sonner';
import { searchAddresses, getCurrentPosition, reverseGeocode, formatDistance, calculateDistance } from '@/lib/geo';
import { generateWhatsAppLink, formatOrderMessage, formatProductShareMessage } from '@/utils/whatsapp';
import { formatPrice } from '@/utils/format';





interface ClientDashboardProps {
  activeTab?: string;
}

export default function ClientDashboard({ activeTab = 'shop' }: ClientDashboardProps) {
  const { user } = useAuth();
  const {
    orders, products, stores, favorites, flashOffers,
    createOrder, cancelOrder, toggleFavorite, isFavorite, refreshOrders
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

  // Refrescar pedidos cuando se accede a la pestaña de pedidos
  useEffect(() => {
    if (activeTab === 'orders') {
      refreshOrders();
    }
  }, [activeTab, refreshOrders]);

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

      // Filtro por ubicación (DESACTIVADO TEMPORALMENTE PARA PRUEBAS)
      // let matchesLocation = true;
      /* if (userLocation) {
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
      } */
      const matchesLocation = true;

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

  const handleShareProduct = (product: Product) => {
    const store = stores.find(s => s.id === product.storeId);
    if (!store) return;

    // In local dev we use the current URL
    const url = window.location.href;
    const message = formatProductShareMessage({ name: product.name, price: product.price }, store.name, url);
    const link = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(link, '_blank');
    toast.info('Abriendo WhatsApp para compartir...');
  };

  // Attach to window just in case for deep components
  useEffect(() => {
    (window as any).handleGlobalShare = handleShareProduct;
  }, [stores]);

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
              onShareProduct={handleShareProduct}
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
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        addToCart={addToCart}
        toggleFavorite={handleToggleFavorite}
        isFavorite={selectedProduct ? isFavorite(selectedProduct.id) : false}
        stores={stores}
        onShare={handleShareProduct}
      />

    </div>
  );
}
