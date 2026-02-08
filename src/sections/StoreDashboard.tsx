
import { useState } from 'react';
import {
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  BarChart3,
  AlertTriangle,
  Zap,
  ArrowRight,
  Plus
} from 'lucide-react';
import FlashOffersManager from '@/components/FlashOffersManager';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { useStoreData } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { OrderStatus } from '@/types';
import { StatCard } from '@/components/StatCard';
import { InventoryView } from './StoreDashboard/InventoryView';
import { StoreOrdersView } from './StoreDashboard/StoreOrdersView';
import { SalesView } from './StoreDashboard/SalesView';
import { SettingsView } from './StoreDashboard/SettingsView';

export default function StoreDashboard() {
  const { user, store: authStore, isLoading } = useAuth();

  // Usar el ID de la tienda del usuario autenticado o un string vacío si no hay
  const storeId = authStore?.id || '';

  // Todos los hooks deben ir AQUÍ arriba, no después de ifs
  const {
    stats, products, orders, lowStockProducts, subscription,
    addProduct, updateProduct, deleteProduct, updateOrderStatus, updateStock,
    shippingMethods, addShippingMethod, updateShippingMethod, deleteShippingMethod,
    paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod,
    store, updateStoreInfo,
    // Flash Offers
    flashOffers, activeFlashOffers, canCreateFlashOffer, flashOffersRemaining,
    maxFlashOfferRadius, createFlashOffer, cancelFlashOffer
  } = useStoreData(storeId);

  const [activeTab, setActiveTab] = useState('products');
  const [settingsTab, setSettingsTab] = useState('general');

  const handleFlashUpgrade = () => {
    setSettingsTab('subscription');
    setActiveTab('settings');
  };

  // Show loading state while auth or store data is initializing
  if (isLoading || (!authStore && isSupabaseConfigured)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center">
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Preparando tu panel</h2>
            <p className="text-[10px] text-gray-500 font-medium">Sincronizando datos de la tienda...</p>
          </div>
        </div>
      </div>
    );
  }


  // Logic to calculate estimated financial data (demo)
  // const estimatedDiscounts = products.filter(p => p.discount).length * 125.50;

  const handleExportProducts = () => {
    // Re-implemented inside InventoryView? No, passed as prop.
    // Ideally this logic should be hoisted or replicated.
    // For now, I'll pass a handler that performs the export using the data locally,
    // NO, InventoryView already has 'products' prop so it can handle export locally if I pass the logic or the function.
    // But export logic relies on utils.
    // I will implement export logic inside InventoryView if possible, or pass it.
    // Better to keep logic here if it uses complex dependencies, but InventoryView has products.
    // Let's check InventoryView props: 'handleExportProducts'.
    // So I need to define it here.
  };

  const handleExportProductsLogic = () => {
    // Dynamic import or just import utility and run it on 'products'.
    // Since 'products' is in scope here, I can define it.
    import('@/utils/export').then(({ exportToCSV }) => {
      exportToCSV(products.map(p => ({
        nombre: p.name, categoria: p.category, precio: `$${p.price.toFixed(2)}`,
        stock: p.stock, estado: p.isActive ? 'Activo' : 'Inactivo', fecha: p.createdAt.toLocaleDateString(),
      })), 'productos', [
        { key: 'nombre', label: 'Nombre' }, { key: 'categoria', label: 'Categoría' },
        { key: 'precio', label: 'Precio' }, { key: 'stock', label: 'Stock' },
        { key: 'estado', label: 'Estado' }, { key: 'fecha', label: 'Fecha' },
      ]);
    });
  };

  const handleExportOrdersLogic = () => {
    import('@/utils/export').then(({ exportToCSV }) => {
      exportToCSV(orders.map(o => ({
        id: o.id, estado: o.status, total: `$${o.total.toFixed(2)}`,
        productos: o.items.length, fecha: o.createdAt.toLocaleDateString(), direccion: o.shippingAddress,
      })), 'pedidos', [
        { key: 'id', label: 'ID' }, { key: 'estado', label: 'Estado' },
        { key: 'total', label: 'Total' }, { key: 'productos', label: 'Productos' },
        { key: 'fecha', label: 'Fecha' }, { key: 'direccion', label: 'Dirección' },
      ]);
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 p-2 sm:p-4 md:p-6 transition-colors duration-300">
      {/* Header Premium */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/40 dark:bg-gray-800/20 p-4 rounded-2xl backdrop-blur-md border border-white/20 dark:border-gray-800/50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-white shadow-lg transform group-hover:scale-105 transition-transform duration-300">
              <Store className="h-6 w-6" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-white dark:border-gray-900 rounded-full shadow-sm animate-pulse"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                {store?.name || authStore?.name || 'Mi Tienda'}
              </h1>
              <Badge variant="outline" className="h-4 text-[8px] bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 px-1 py-0 uppercase font-black">Online</Badge>
            </div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">
              Gestionando pedidos y catálogo en tiempo real
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-black text-sm ring-2 ring-white dark:ring-gray-800 shadow-sm">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Main Content & Consolidated Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between bg-gray-100/40 dark:bg-gray-800/20 p-1.5 rounded-2xl backdrop-blur-md border border-gray-200/50 dark:border-gray-700/50 shadow-sm overflow-x-auto scrollbar-hide">
          <TabsList className="bg-transparent border-0 gap-1.5">
            <TabsTrigger
              value="products"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-md data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700 border border-transparent hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl px-5 py-2.5 text-xs font-bold transition-all"
            >
              <Package className="h-3.5 w-3.5 mr-2" />Stock
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-md data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700 border border-transparent hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl px-5 py-2.5 text-xs font-bold transition-all"
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-2" />Ventas
            </TabsTrigger>
            <TabsTrigger
              value="flash"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-md data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700 border border-transparent hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl px-5 py-2.5 text-xs font-bold transition-all"
            >
              <Zap className="h-3.5 w-3.5 mr-2 text-yellow-500" />Flash
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-md data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700 border border-transparent hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl px-5 py-2.5 text-xs font-bold transition-all"
            >
              <BarChart3 className="h-3.5 w-3.5 mr-2" />Stats
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              onClick={() => setSettingsTab('general')}
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-900 data-[state=active]:shadow-md data-[state=active]:border-gray-200 dark:data-[state=active]:border-gray-700 border border-transparent hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-xl px-5 py-2.5 text-xs font-bold transition-all"
            >
              <Store className="h-3.5 w-3.5 mr-2" />Ajustes
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="products" className="mt-0">
          <InventoryView
            products={products}
            addProduct={addProduct}
            updateProduct={updateProduct}
            deleteProduct={deleteProduct}
            updateStock={updateStock}
            handleExportProducts={handleExportProductsLogic}
          />
        </TabsContent>

        <TabsContent value="orders">
          <StoreOrdersView
            orders={orders}
            updateOrderStatus={updateOrderStatus}
            handleExportOrders={handleExportOrdersLogic}
          />
        </TabsContent>

        <TabsContent value="flash">
          <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <FlashOffersManager
                products={products}
                flashOffers={flashOffers}
                activeFlashOffers={activeFlashOffers}
                canCreateFlashOffer={canCreateFlashOffer}
                flashOffersRemaining={flashOffersRemaining}
                maxFlashOfferRadius={maxFlashOfferRadius}
                createFlashOffer={createFlashOffer}
                cancelFlashOffer={cancelFlashOffer}
                currentPlan={subscription?.plan || 'free'}
                onUpgradePrompt={handleFlashUpgrade}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <SalesView topProducts={stats.topProducts} />
        </TabsContent>

        <TabsContent value="settings">
          <SettingsView
            store={store}
            updateStoreInfo={updateStoreInfo}
            shippingMethods={shippingMethods}
            addShippingMethod={addShippingMethod}
            updateShippingMethod={updateShippingMethod}
            deleteShippingMethod={deleteShippingMethod}
            paymentMethods={paymentMethods}
            addPaymentMethod={addPaymentMethod}
            updatePaymentMethod={updatePaymentMethod}
            deletePaymentMethod={deletePaymentMethod}
            subscription={subscription}
            salesThisMonth={subscription?.salesThisMonth || 0}
            productsCount={products.length}
            defaultTab={settingsTab}
            key={`settings-${settingsTab}`} // Force re-render/re-init if tab changes
          />
        </TabsContent>
      </Tabs>



      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-4 left-4 right-4 z-50">
        <div className="bg-white/90 backdrop-blur-lg border dark:border-gray-800 shadow-xl rounded-2xl p-2 flex justify-around items-center">
          <button onClick={() => setActiveTab('products')} className={`p-2 rounded-xl transition-all ${activeTab === 'products' ? 'text-violet-600 bg-violet-50 dark:bg-violet-900/20' : 'text-gray-400'}`}>
            <Package className="h-6 w-6" strokeWidth={activeTab === 'products' ? 2.5 : 2} />
          </button>
          <button onClick={() => setActiveTab('orders')} className={`p-2 rounded-xl transition-all ${activeTab === 'orders' ? 'text-violet-600 bg-violet-50 dark:bg-violet-900/20' : 'text-gray-400'}`}>
            <ShoppingCart className="h-6 w-6" strokeWidth={activeTab === 'orders' ? 2.5 : 2} />
          </button>
          <button onClick={() => setActiveTab('flash')} className={`p-2 rounded-xl transition-all ${activeTab === 'flash' ? 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' : 'text-gray-400'}`}>
            <div className="relative">
              <Zap className="h-6 w-6" strokeWidth={activeTab === 'flash' ? 2.5 : 2} />
              {activeFlashOffers.length > 0 && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>}
            </div>
          </button>
          <button onClick={() => { setSettingsTab('general'); setActiveTab('settings'); }} className={`p-2 rounded-xl transition-all ${activeTab === 'settings' ? 'text-violet-600 bg-violet-50 dark:bg-violet-900/20' : 'text-gray-400'}`}>
            <Store className="h-6 w-6" strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
          </button>
        </div>
      </div>

    </div>
  );
}
