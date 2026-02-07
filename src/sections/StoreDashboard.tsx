
import { useState } from 'react';
import {
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  BarChart3,
  AlertTriangle,
  Zap
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

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 font-medium">Cargando tu tienda...</p>
        </div>
      </div>
    );
  }

  // Si no hay tienda, mostrar error y opción de recargar
  if (!authStore && isSupabaseConfigured) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No se encontró tu tienda</h1>
        <p className="text-gray-500 text-center mb-6 max-w-md">
          Parece que tu usuario no tiene una tienda asociada o hubo un error al cargarla.
        </p>
        <Button onClick={() => window.location.reload()}>Recargar página</Button>
        <p className="text-xs text-gray-400 mt-8">ID de Usuario: {user?.id}</p>
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
      {/* Header Compacto */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-violet-600 text-white shadow-md">
            <Store className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
              {store?.name || authStore?.name || 'Mi Tienda'}
            </h1>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
              {(store?.isActive !== false && authStore?.isActive !== false) ? (
                <Badge variant="outline" className="h-4 text-[8px] border-emerald-500/50 text-emerald-600 dark:text-emerald-400 px-1 py-0 uppercase">Online</Badge>
              ) : (
                <Badge variant="outline" className="h-4 text-[8px] border-red-500/50 text-red-600 dark:text-red-400 px-1 py-0 uppercase">Suspendida</Badge>
              )}
              Gestionando pedidos y catálogo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold text-xs ring-2 ring-white dark:ring-gray-800">T</div>
        </div>
      </div>

      {/* Banner de tienda suspendida */}
      {(store?.isActive === false || authStore?.isActive === false) && (
        <div className="mb-6 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/50">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-red-800 dark:text-red-300">Tu tienda está suspendida</h3>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
              Tu tienda no es visible para los clientes. Los productos no aparecen en el catálogo público.
              Contacta al administrador para reactivar tu cuenta.
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid Minimalist */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        <StatCard title="Ventas" value={`$${stats.totalSales.toFixed(0)}`} icon={DollarSign} trend="+12%" color="#8b5cf6" />
        <StatCard title="Margen" value="38%" icon={TrendingUp} trend="+2%" color="#10b981" />
        <StatCard title="Pedidos" value={orders.length.toString()} icon={ShoppingCart} trend="+5" color="#3b82f6" />
        <StatCard title="Ticket" value={`$${stats.averageOrderValue.toFixed(0)}`} icon={BarChart3} color="#f59e0b" />
        <StatCard title="Stock" value={lowStockProducts.toString()} icon={AlertTriangle} alert={lowStockProducts > 0} color="#ef4444" />
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="hidden md:flex w-full overflow-x-auto scrollbar-hide bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-lg justify-start sm:justify-center">
          <TabsTrigger value="products" className="flex-none sm:flex-1 text-[10px] sm:text-xs py-2 px-3 sm:px-0"><Package className="h-3 w-3 mr-1.5" />Stock</TabsTrigger>
          <TabsTrigger value="orders" className="flex-none sm:flex-1 text-[10px] sm:text-xs py-2 px-3 sm:px-0"><ShoppingCart className="h-3 w-3 mr-1.5" />Ventas</TabsTrigger>
          <TabsTrigger value="flash" className="flex-none sm:flex-1 text-[10px] sm:text-xs py-2 px-3 sm:px-0 relative">
            <Zap className="h-3 w-3 mr-1.5 text-yellow-500" />Flash
            {activeFlashOffers.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 text-white text-[8px] rounded-full flex items-center justify-center">
                {activeFlashOffers.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-none sm:flex-1 text-[10px] sm:text-xs py-2 px-3 sm:px-0"><Store className="h-3 w-3 mr-1.5" />Configuración</TabsTrigger>
          <TabsTrigger value="analytics" className="flex-none sm:flex-1 text-[10px] sm:text-xs py-2 px-3 sm:px-0"><BarChart3 className="h-3 w-3 mr-1.5" />Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
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
          <button onClick={() => setActiveTab('settings')} className={`p-2 rounded-xl transition-all ${activeTab === 'settings' ? 'text-violet-600 bg-violet-50 dark:bg-violet-900/20' : 'text-gray-400'}`}>
            <Store className="h-6 w-6" strokeWidth={activeTab === 'settings' ? 2.5 : 2} />
          </button>
        </div>
      </div>

    </div>
  );
}
