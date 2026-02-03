import { useState } from 'react';
import {
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  DollarSign,
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  BarChart3,
  Clock,
  CheckCircle,
  Truck,
  Home,
  Upload,
  Download,
  AlertTriangle,
  RefreshCw,
  Archive,
  ArrowUpDown,
  X,
  CreditCard,
  Banknote,
  Wallet,
  Settings,
  MessageCircle,
  MapPin,
  Loader2,
  Zap
} from 'lucide-react';
import { searchAddresses, getCurrentPosition, reverseGeocode } from '@/lib/geo';
import type { GeoLocation } from '@/types';
import LocationMap from '@/components/ui/LocationMap';
import FlashOffersManager from '@/components/FlashOffersManager';
import StorePreview from '@/components/StorePreview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useStoreData } from '@/hooks/useData';
import { useAuth } from '@/hooks/useAuth';
import type { Product, Order, OrderStatus } from '@/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { exportToCSV } from '@/utils/export';
import { toast } from 'sonner';
import { formatStatusUpdateMessage, generateWhatsAppLink } from '@/utils/whatsapp';
import { formatPrice } from '@/utils/format';

// Datos demo para gráficos
const salesData = [
  { month: 'Ene', ventas: 1200 },
  { month: 'Feb', ventas: 1800 },
  { month: 'Mar', ventas: 2200 },
  { month: 'Abr', ventas: 1900 },
  { month: 'May', ventas: 2800 },
  { month: 'Jun', ventas: 3500 },
];

const categoryData = [
  { name: 'Audio', value: 40, color: '#3b82f6' },
  { name: 'Periféricos', value: 35, color: '#8b5cf6' },
  { name: 'Accesorios', value: 25, color: '#10b981' },
];

function OrderStatusBadge({ status }: { status: Order['status'] }) {
  const styles = {
    pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    procesando: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    enviado: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    entregado: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    cancelado: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };
  const icons = { pendiente: Clock, procesando: RefreshCw, enviado: Truck, entregado: CheckCircle, cancelado: X };
  const Icon = icons[status];
  return (
    <Badge className={`${styles[status]} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

function StatCard({ title, value, icon: Icon, trend, color, alert }: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  color: string;
  alert?: boolean;
}) {
  const isNegativeTrend = trend?.startsWith('-');

  return (
    <Card className={`relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300 ${alert ? 'border-red-500/50 dark:border-red-500/50' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
              {trend && (
                <span className={`text-[10px] font-bold ${alert || isNegativeTrend ? 'text-red-500' : 'text-emerald-500'}`}>
                  {trend}
                </span>
              )}
            </div>
          </div>
          <div className={`p-2 rounded-lg ${alert ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400'}`}>
            <Icon className="h-4 w-4" style={!alert ? { color } : undefined} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function StoreDashboard() {
  const { user } = useAuth();
  const {
    stats, products, orders, pendingOrders, lowStockProducts, subscription,
    addProduct, updateProduct, deleteProduct, updateOrderStatus, updateStock,
    shippingMethods, addShippingMethod, updateShippingMethod, deleteShippingMethod,
    paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod,
    store, updateStoreInfo,
    // Flash Offers
    flashOffers, activeFlashOffers, canCreateFlashOffer, flashOffersRemaining,
    maxFlashOfferRadius, createFlashOffer, cancelFlashOffer
  } = useStoreData('store1');

  const [searchTerm, setSearchTerm] = useState('');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockProduct, setStockProduct] = useState<Product | null>(null);
  const [stockQuantity, setStockQuantity] = useState('');
  const [filterStatus, setFilterStatus] = useState<OrderStatus | 'all'>('all');

  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: '', stock: '', category: '',
    discount: '', isOnSale: false, cost: '', sku: '', minStock: ''
  });

  // Estado para métodos de envío
  const [showNewShipping, setShowNewShipping] = useState(false);
  const [newShipping, setNewShipping] = useState({ name: '', price: '', estimatedDays: '', description: '' });
  const [editingShipping, setEditingShipping] = useState<typeof shippingMethods[0] | null>(null);

  // Estado para métodos de pago
  const [showNewPayment, setShowNewPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({ type: 'transferencia' as const, name: '', description: '', instructions: '' });
  const [editingPayment, setEditingPayment] = useState<typeof paymentMethods[0] | null>(null);

  // Estado para ubicación
  const [locationQuery, setLocationQuery] = useState(store?.address || '');
  const [locationSuggestions, setLocationSuggestions] = useState<GeoLocation[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Sync location query with store address
  // useEffect(() => { if (store?.address) setLocationQuery(store.address); }, [store?.address]);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      toast.error('Completa los campos requeridos');
      return;
    }
    const price = parseFloat(newProduct.price);
    const discount = newProduct.discount ? parseFloat(newProduct.discount) : 0;
    const originalPrice = discount > 0 ? price : undefined;
    const finalPrice = discount > 0 ? price * (1 - discount / 100) : price;

    addProduct({
      storeId: 'store1',
      name: newProduct.name,
      description: newProduct.description,
      price: finalPrice,
      originalPrice: originalPrice,
      stock: parseInt(newProduct.stock),
      category: newProduct.category || 'General',
      images: [],
      isActive: true,
      discount: discount || undefined,
      isOnSale: newProduct.isOnSale,
      cost: newProduct.cost ? parseFloat(newProduct.cost) : undefined,
      sku: newProduct.sku || undefined,
      minStock: newProduct.minStock ? parseInt(newProduct.minStock) : undefined,
    });
    toast.success('Producto agregado exitosamente');
    setNewProduct({
      name: '', description: '', price: '', stock: '', category: '',
      discount: '', isOnSale: false, cost: '', sku: '', minStock: ''
    });
    setIsAddProductOpen(false);
  };

  const handleUpdateProduct = () => {
    if (!editingProduct) return;
    updateProduct(editingProduct.id, editingProduct);
    toast.success('Producto actualizado');
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
    toast.success('Producto eliminado');
  };

  const handleToggleActive = (product: Product) => {
    updateProduct(product.id, { isActive: !product.isActive });
    toast.success(product.isActive ? 'Producto desactivado' : 'Producto activado');
  };

  const handleUpdateStock = () => {
    if (!stockProduct || !stockQuantity) return;
    updateStock(stockProduct.id, parseInt(stockQuantity));
    toast.success('Stock actualizado');
    setShowStockModal(false);
    setStockProduct(null);
    setStockQuantity('');
  };

  const handleExportProducts = () => {
    exportToCSV(products.map(p => ({
      nombre: p.name, categoria: p.category, precio: `$${p.price.toFixed(2)}`,
      stock: p.stock, estado: p.isActive ? 'Activo' : 'Inactivo', fecha: p.createdAt.toLocaleDateString(),
    })), 'productos', [
      { key: 'nombre', label: 'Nombre' }, { key: 'categoria', label: 'Categoría' },
      { key: 'precio', label: 'Precio' }, { key: 'stock', label: 'Stock' },
      { key: 'estado', label: 'Estado' }, { key: 'fecha', label: 'Fecha' },
    ]);
    toast.success('Productos exportados');
  };

  const handleExportOrders = () => {
    exportToCSV(orders.map(o => ({
      id: o.id, estado: o.status, total: `$${o.total.toFixed(2)}`,
      productos: o.items.length, fecha: o.createdAt.toLocaleDateString(), direccion: o.shippingAddress,
    })), 'pedidos', [
      { key: 'id', label: 'ID' }, { key: 'estado', label: 'Estado' },
      { key: 'total', label: 'Total' }, { key: 'productos', label: 'Productos' },
      { key: 'fecha', label: 'Fecha' }, { key: 'direccion', label: 'Dirección' },
    ]);
    toast.success('Pedidos exportados');
  };

  // Cálculos financieros demo (en un entorno real vendrían de orders/backend)
  const estimatedDiscounts = products.filter(p => p.discount).length * 125.50; // Mock de descuentos totales

  const handleSearchLocation = async (query: string) => {
    setLocationQuery(query);
    if (query.length > 2) {
      const results = await searchAddresses(query);
      setLocationSuggestions(results);
      setShowSuggestions(true);
    } else {
      setLocationSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectLocation = (location: GeoLocation) => {
    setLocationQuery(location.address);
    updateStoreInfo({
      address: location.address,
      location: location
    });
    setShowSuggestions(false);
    toast.success('Ubicación actualizada');
  };

  const handleCurrentLocation = async () => {
    setIsLocating(true);
    try {
      const { lat, lng } = await getCurrentPosition();
      const location = await reverseGeocode(lat, lng);
      if (location) {
        handleSelectLocation(location);
      } else {
        toast.error('No se pudo obtener la dirección exacta');
      }
    } catch (error) {
      console.error(error);
      toast.error('Error al obtener tu ubicación. Verifica los permisos.');
    } finally {
      setIsLocating(false);
    }
  };

  const handleMapLocationChange = async (lat: number, lng: number) => {
    // Actualizar coordenadas inmediatamente
    const currentLocation = store?.location || { address: '', lat, lng };
    updateStoreInfo({
      location: { ...currentLocation, lat, lng }
    });

    // Obtener dirección legible (reverse geocoding)
    const newLocation = await reverseGeocode(lat, lng);
    if (newLocation) {
      setLocationQuery(newLocation.address);
      updateStoreInfo({
        address: newLocation.address,
        location: newLocation
      });
    }
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
            <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">Mi Tienda</h1>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Badge variant="outline" className="h-4 text-[8px] border-emerald-500/50 text-emerald-600 dark:text-emerald-400 px-1 py-0 uppercase">Online</Badge>
              Gestionando pedidos y catálogo
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-[10px] gap-1 px-2"
            onClick={() => setIsPreviewOpen(true)}
          >
            <Eye className="h-3 w-3" />Ver tienda
          </Button>
          <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 font-bold text-xs ring-2 ring-white dark:ring-gray-800">T</div>
        </div>
      </div>

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
          <TabsTrigger value="shipping" className="flex-none sm:flex-1 text-[10px] sm:text-xs py-2 px-3 sm:px-0"><Truck className="h-3 w-3 mr-1.5" />Envíos</TabsTrigger>
          <TabsTrigger value="payments" className="flex-none sm:flex-1 text-[10px] sm:text-xs py-2 px-3 sm:px-0"><CreditCard className="h-3 w-3 mr-1.5" />Cobros</TabsTrigger>
          <TabsTrigger value="analytics" className="flex-none sm:flex-1 text-[10px] sm:text-xs py-2 px-3 sm:px-0"><BarChart3 className="h-3 w-3 mr-1.5" />Stats</TabsTrigger>
          <TabsTrigger value="settings" className="flex-none sm:flex-1 text-[10px] sm:text-xs py-2 px-3 sm:px-0"><Home className="h-3 w-3 mr-1.5" />Ajustes</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <CardHeader className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-gray-800">
              <div>
                <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                  <Package className="h-4 w-4 text-violet-500" />
                  Catálogo
                </CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400">{filteredProducts.length} productos</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input placeholder="Buscar..." className="pl-9 h-9 w-full md:w-48 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={handleExportProducts} className="h-9 w-9"><Download className="h-4 w-4" /></Button>
                  <Button onClick={() => setIsAddProductOpen(true)} className="h-9 gap-1.5 text-sm bg-violet-600 hover:bg-violet-700 text-white"><Plus className="h-4 w-4" />Nuevo</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-800 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <th className="px-6 py-3">Producto</th>
                      <th className="px-6 py-3">Categoría</th>
                      <th className="px-6 py-3">Precio</th>
                      <th className="px-6 py-3">Stock</th>
                      <th className="px-6 py-3">Estado</th>
                      <th className="px-6 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors text-sm">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-400 overflow-hidden border dark:border-gray-700">
                              {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" /> : product.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900 dark:text-white leading-tight">{product.name}</p>
                              <p className="text-[10px] text-gray-500 line-clamp-1">{product.sku || 'Sin SKU'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{product.category}</td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-bold text-gray-900 dark:text-white">${product.price.toFixed(2)}</span>
                            {product.discount && <span className="text-[10px] text-green-600">-{product.discount}% OFF</span>}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`flex items-center gap-1.5 ${product.stock <= (product.minStock || 5) ? 'text-red-600 font-bold' : 'text-gray-600 dark:text-gray-300'}`}>
                            {product.stock}
                            {product.stock <= (product.minStock || 5) && <AlertTriangle className="h-3 w-3" />}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Switch checked={product.isActive} onCheckedChange={() => handleToggleActive(product)} className="scale-75 origin-left" />
                        </td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedProduct(product)}>Ver</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setEditingProduct(product)}>Editar</DropdownMenuItem>
                              <DropdownMenuItem onClick={() => { setStockProduct(product); setShowStockModal(true); }}>Stock</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteProduct(product.id)}>Eliminar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden divide-y dark:divide-gray-800">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="p-4 space-y-3 active:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-400 overflow-hidden border dark:border-gray-700">
                          {product.images?.[0] ? <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" /> : product.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white uppercase leading-tight">{product.name}</p>
                          <p className="text-[10px] text-gray-500">{product.category}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingProduct(product)}>Editar</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => { setStockProduct(product); setShowStockModal(true); }}>Stock</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteProduct(product.id)}>Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">${product.price.toFixed(2)}</p>
                        <Badge variant={product.stock <= (product.minStock || 5) ? 'destructive' : 'outline'} className="text-[8px] px-1.5 h-4">
                          Stock: {product.stock}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-500">{product.isActive ? 'Activo' : 'Pausado'}</span>
                        <Switch checked={product.isActive} onCheckedChange={() => handleToggleActive(product)} className="scale-75" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders">
          <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <CardHeader className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-gray-800">
              <div>
                <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                  <ShoppingCart className="h-4 w-4 text-violet-500" />
                  Ventas
                </CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400">{filteredOrders.length} pedidos hoy</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input placeholder="Buscar..." className="pl-9 h-9 w-full md:w-48 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <Button variant="outline" size="sm" onClick={handleExportOrders} className="h-9 gap-1.5 text-xs px-3"><Download className="h-3.5 w-3.5" />Exportar</Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Archive className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Sin pedidos registrados</p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div key={order.id} className="p-4 rounded-xl border dark:border-gray-800 hover:shadow-sm transition-all bg-gray-50/50 dark:bg-gray-800/20">
                    <div className="flex justify-between items-start mb-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-gray-400">#{order.id}</span>
                          <OrderStatusBadge status={order.status} />
                        </div>
                        <p className="text-xs font-bold text-gray-900 dark:text-white">{order.createdAt.toLocaleDateString()} • {order.items.length} productos</p>
                      </div>
                      <span className="text-sm font-bold text-gray-900 dark:text-white">${order.total.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t dark:border-gray-800">
                      <p className="text-[10px] text-gray-500 line-clamp-1 max-w-[150px]">{order.shippingAddress}</p>
                      <div className="flex gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="h-7 text-[10px] px-2">Estado</Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'procesando')}>Procesando</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'enviado')}>Enviado</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateOrderStatus(order.id, 'entregado')}>Entregado</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => updateOrderStatus(order.id, 'cancelado')}>Cancelar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2" onClick={() => setSelectedOrder(order)}>Detalles</Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Flash Offers Tab */}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <CardHeader className="p-4 sm:p-6 pb-2"><CardTitle className="text-sm font-bold dark:text-white">Ventas por Mes</CardTitle></CardHeader>
              <CardContent className="h-60 sm:h-72 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs><linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.1} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-100 dark:stroke-gray-800" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} /><YAxis stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="ventas" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorVentas)" name="Ventas" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <CardHeader className="p-4 sm:p-6 pb-2"><CardTitle className="text-sm font-bold dark:text-white">Ventas por Categoría</CardTitle></CardHeader>
              <CardContent className="h-60 sm:h-72 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                      {categoryData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <CardHeader className="p-4 sm:p-6 pb-2"><CardTitle className="text-sm font-bold dark:text-white">Top Productos</CardTitle></CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {stats.topProducts.map((product, idx) => (
                    <div key={product.id} className="flex items-center gap-3 p-3 rounded-lg border dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                      <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-gray-900 dark:text-white uppercase truncate">{product.name}</p>
                        <p className="text-[10px] text-gray-500">{product.category}</p>
                      </div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white">${product.price}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <CardHeader className="p-4 sm:p-6 border-b dark:border-gray-800">
              <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                <Settings className="h-4 w-4 text-violet-500" />
                Configuración
              </CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400">Gestiona los datos de tu tienda</p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nombre de la tienda</Label>
                  <Input
                    value={store?.name || ''}
                    onChange={(e) => updateStoreInfo({ name: e.target.value })}
                    className="h-9 text-sm bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Categoría</Label>
                  <Input
                    value={store?.category || ''}
                    onChange={(e) => updateStoreInfo({ category: e.target.value })}
                    className="h-9 text-sm bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Descripción</Label>
                  <Textarea
                    value={store?.description || ''}
                    onChange={(e) => updateStoreInfo({ description: e.target.value })}
                    rows={3}
                    className="text-sm bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800"
                  />
                </div>

                {/* Location Input with Autocomplete */}
                <div className="space-y-1.5 sm:col-span-2 relative">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Ubicación / Dirección</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        value={locationQuery}
                        onChange={(e) => handleSearchLocation(e.target.value)}
                        placeholder="Buscar dirección..."
                        className="pl-9 h-9 text-sm bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800"
                      />
                      {showSuggestions && locationSuggestions.length > 0 && (
                        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {locationSuggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSelectLocation(suggestion)}
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 transition-colors border-b dark:border-gray-700 last:border-0"
                            >
                              <p className="font-medium text-xs sm:text-sm">{suggestion.address}</p>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCurrentLocation}
                      disabled={isLocating}
                      className="h-9 w-9 shrink-0 bg-white dark:bg-gray-800"
                      title="Usar mi ubicación actual"
                    >
                      {isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4 text-violet-500" />}
                    </Button>
                  </div>
                  {store?.location && (
                    <div className="space-y-2 mt-2">
                      <p className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" /> Ubicación verificada: {store.location.locality}, {store.location.province}
                      </p>
                      <div className="h-48 w-full rounded-lg overflow-hidden border dark:border-gray-700">
                        <LocationMap
                          lat={store.location.lat}
                          lng={store.location.lng}
                          onLocationChange={handleMapLocationChange}
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 text-center">
                        Arrastra el pin para ajustar la ubicación exacta
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Teléfono</Label>
                  <Input
                    value={store?.phone || ''}
                    onChange={(e) => updateStoreInfo({ phone: e.target.value })}
                    className="h-9 text-sm bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Email</Label>
                  <Input
                    value={store?.email || ''}
                    onChange={(e) => updateStoreInfo({ email: e.target.value })}
                    className="h-9 text-sm bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800"
                  />
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={() => toast.success('Configuración guardada')} className="bg-violet-600 hover:bg-violet-700 text-white text-sm h-9 px-6">Guardar cambios</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Shipping Tab */}
        <TabsContent value="shipping">
          <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <CardHeader className="p-4 sm:p-6 flex flex-row items-center justify-between border-b dark:border-gray-800">
              <div>
                <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                  <Truck className="h-4 w-4 text-violet-500" />
                  Envíos
                </CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400">{shippingMethods.length} opciones</p>
              </div>
              <Button onClick={() => setShowNewShipping(true)} className="h-9 gap-1.5 text-sm bg-violet-600 hover:bg-violet-700 text-white"><Plus className="h-4 w-4" />Nuevo</Button>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3">
              {shippingMethods.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Truck className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Sin métodos de envío</p>
                </div>
              ) : (
                shippingMethods.map(method => (
                  <div key={method.id} className="flex items-center justify-between p-3 rounded-xl border dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500">
                        <Truck className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-gray-900 dark:text-white">{method.name}</h4>
                        <p className="text-[10px] text-gray-500">{method.estimatedDays} • {method.price === 0 ? 'Gratis' : formatPrice(method.price)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={method.isActive} onCheckedChange={() => updateShippingMethod(method.id, { isActive: !method.isActive })} className="scale-75" />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setEditingShipping(method)}>Editar</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => deleteShippingMethod(method.id)}>Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Modal Nuevo Método de Envío */}
          <Dialog open={showNewShipping} onOpenChange={setShowNewShipping}>
            <DialogContent className="dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="dark:text-white">Nuevo Método de Envío</DialogTitle>
                <DialogDescription>Configura una nueva opción de envío</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2"><Label>Nombre *</Label><Input value={newShipping.name} onChange={(e) => setNewShipping({ ...newShipping, name: e.target.value })} placeholder="Ej: Envío express" className="dark:bg-gray-700" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2"><Label>Precio ($)</Label><Input type="number" value={newShipping.price} onChange={(e) => setNewShipping({ ...newShipping, price: e.target.value })} placeholder="0 = Gratis" className="dark:bg-gray-700" /></div>
                  <div className="space-y-2"><Label>Tiempo estimado *</Label><Input value={newShipping.estimatedDays} onChange={(e) => setNewShipping({ ...newShipping, estimatedDays: e.target.value })} placeholder="Ej: 3-5 días" className="dark:bg-gray-700" /></div>
                </div>
                <div className="space-y-2"><Label>Descripción (opcional)</Label><Input value={newShipping.description} onChange={(e) => setNewShipping({ ...newShipping, description: e.target.value })} placeholder="Detalles adicionales" className="dark:bg-gray-700" /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewShipping(false)}>Cancelar</Button>
                <Button onClick={() => {
                  if (!newShipping.name || !newShipping.estimatedDays) { toast.error('Completa los campos requeridos'); return; }
                  addShippingMethod({ name: newShipping.name, price: parseFloat(newShipping.price) || 0, estimatedDays: newShipping.estimatedDays, description: newShipping.description || undefined, isActive: true });
                  toast.success('Método de envío creado');
                  setNewShipping({ name: '', price: '', estimatedDays: '', description: '' });
                  setShowNewShipping(false);
                }}>Crear Método</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal Editar Método de Envío */}
          <Dialog open={!!editingShipping} onOpenChange={() => setEditingShipping(null)}>
            <DialogContent className="dark:bg-gray-800">
              <DialogHeader><DialogTitle className="dark:text-white">Editar Método de Envío</DialogTitle></DialogHeader>
              {editingShipping && (
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Nombre</Label><Input value={editingShipping.name} onChange={(e) => setEditingShipping({ ...editingShipping, name: e.target.value })} className="dark:bg-gray-700" /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><Label>Precio ($)</Label><Input type="number" value={editingShipping.price} onChange={(e) => setEditingShipping({ ...editingShipping, price: parseFloat(e.target.value) || 0 })} className="dark:bg-gray-700" /></div>
                    <div className="space-y-2"><Label>Tiempo estimado</Label><Input value={editingShipping.estimatedDays} onChange={(e) => setEditingShipping({ ...editingShipping, estimatedDays: e.target.value })} className="dark:bg-gray-700" /></div>
                  </div>
                  <div className="space-y-2"><Label>Descripción</Label><Input value={editingShipping.description || ''} onChange={(e) => setEditingShipping({ ...editingShipping, description: e.target.value })} className="dark:bg-gray-700" /></div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingShipping(null)}>Cancelar</Button>
                <Button onClick={() => {
                  if (editingShipping) {
                    updateShippingMethod(editingShipping.id, editingShipping);
                    toast.success('Método actualizado');
                    setEditingShipping(null);
                  }
                }}>Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments">
          <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <CardHeader className="p-4 sm:p-6 flex flex-row items-center justify-between border-b dark:border-gray-800">
              <div>
                <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                  <CreditCard className="h-4 w-4 text-violet-500" />
                  Cobros
                </CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400">{paymentMethods.length} métodos</p>
              </div>
              <Button onClick={() => setShowNewPayment(true)} className="h-9 gap-1.5 text-sm bg-violet-600 hover:bg-violet-700 text-white"><Plus className="h-4 w-4" />Nuevo</Button>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-3">
              {paymentMethods.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <CreditCard className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">Sin métodos de pago</p>
                </div>
              ) : (
                paymentMethods.map(method => {
                  const Icon = method.type === 'mercadopago' ? Wallet : method.type === 'efectivo' ? Banknote : CreditCard;
                  return (
                    <div key={method.id} className="flex items-center justify-between p-3 rounded-xl border dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white">{method.name}</h4>
                          <p className="text-[10px] text-gray-500 line-clamp-1">{method.description || 'Sin datos'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch checked={method.isActive} onCheckedChange={() => updatePaymentMethod(method.id, { isActive: !method.isActive })} className="scale-75" />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setEditingPayment(method)}>Editar</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => deletePaymentMethod(method.id)}>Eliminar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Modal Nuevo Método de Pago */}
          <Dialog open={showNewPayment} onOpenChange={setShowNewPayment}>
            <DialogContent className="dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="dark:text-white">Nuevo Método de Pago</DialogTitle>
                <DialogDescription>Configura una nueva forma de pago</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de pago</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'transferencia', label: 'Transferencia', icon: CreditCard },
                      { value: 'mercadopago', label: 'MercadoPago', icon: Wallet },
                      { value: 'efectivo', label: 'Efectivo', icon: Banknote },
                      { value: 'tarjeta', label: 'Tarjeta', icon: CreditCard },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setNewPayment({ ...newPayment, type: opt.value as any, name: opt.label })}
                        className={`flex items-center gap-2 p-3 rounded-lg border transition-all ${newPayment.type === opt.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'}`}
                      >
                        <opt.icon className={`h-4 w-4 ${newPayment.type === opt.value ? 'text-blue-600' : 'text-gray-500'}`} />
                        <span className={`text-sm ${newPayment.type === opt.value ? 'text-blue-700 dark:text-blue-300 font-medium' : 'text-gray-600 dark:text-gray-300'}`}>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2"><Label>Nombre personalizado</Label><Input value={newPayment.name} onChange={(e) => setNewPayment({ ...newPayment, name: e.target.value })} placeholder="Ej: MercadoPago cuotas" className="dark:bg-gray-700" /></div>
                <div className="space-y-2"><Label>Datos (CBU, Alias, etc.)</Label><Input value={newPayment.description} onChange={(e) => setNewPayment({ ...newPayment, description: e.target.value })} placeholder="CBU: 123... o Alias: mitienda.mp" className="dark:bg-gray-700" /></div>
                <div className="space-y-2"><Label>Instrucciones adicionales</Label><Input value={newPayment.instructions} onChange={(e) => setNewPayment({ ...newPayment, instructions: e.target.value })} placeholder="Enviar comprobante por WhatsApp" className="dark:bg-gray-700" /></div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowNewPayment(false)}>Cancelar</Button>
                <Button onClick={() => {
                  if (!newPayment.name) { toast.error('Ingresa un nombre'); return; }
                  addPaymentMethod({ type: newPayment.type, name: newPayment.name, description: newPayment.description || undefined, instructions: newPayment.instructions || undefined, isActive: true });
                  toast.success('Método de pago creado');
                  setNewPayment({ type: 'transferencia', name: '', description: '', instructions: '' });
                  setShowNewPayment(false);
                }}>Crear Método</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Modal Editar Método de Pago */}
          <Dialog open={!!editingPayment} onOpenChange={() => setEditingPayment(null)}>
            <DialogContent className="dark:bg-gray-800">
              <DialogHeader><DialogTitle className="dark:text-white">Editar Método de Pago</DialogTitle></DialogHeader>
              {editingPayment && (
                <div className="space-y-4">
                  <div className="space-y-2"><Label>Nombre</Label><Input value={editingPayment.name} onChange={(e) => setEditingPayment({ ...editingPayment, name: e.target.value })} className="dark:bg-gray-700" /></div>
                  <div className="space-y-2"><Label>Datos</Label><Input value={editingPayment.description || ''} onChange={(e) => setEditingPayment({ ...editingPayment, description: e.target.value })} className="dark:bg-gray-700" /></div>
                  <div className="space-y-2"><Label>Instrucciones</Label><Input value={editingPayment.instructions || ''} onChange={(e) => setEditingPayment({ ...editingPayment, instructions: e.target.value })} className="dark:bg-gray-700" /></div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingPayment(null)}>Cancelar</Button>
                <Button onClick={() => {
                  if (editingPayment) {
                    updatePaymentMethod(editingPayment.id, editingPayment);
                    toast.success('Método actualizado');
                    setEditingPayment(null);
                  }
                }}>Guardar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>

      {/* Add Product Dialog */}
      <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
        <DialogContent className="max-w-lg dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Agregar Nuevo Producto</DialogTitle>
            <DialogDescription>Completa la información del producto</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Nombre del Producto *</Label><Input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Nombre del producto" className="dark:bg-gray-700" /></div>
            <div className="space-y-2"><Label>Descripción</Label><Textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Descripción del producto" rows={3} className="dark:bg-gray-700" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Precio de Venta ($) *</Label><Input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} placeholder="0.00" className="dark:bg-gray-700" /></div>
              <div className="space-y-2"><Label>Precio de Costo ($)</Label><Input type="number" value={newProduct.cost} onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })} placeholder="0.00" className="dark:bg-gray-700" /></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Stock *</Label><Input type="number" value={newProduct.stock} onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })} placeholder="0" className="dark:bg-gray-700" /></div>
              <div className="space-y-2"><Label>Stock Mín. (Alerta)</Label><Input type="number" value={newProduct.minStock} onChange={(e) => setNewProduct({ ...newProduct, minStock: e.target.value })} placeholder="10" className="dark:bg-gray-700" /></div>
              <div className="space-y-2"><Label>SKU / Código</Label><Input value={newProduct.sku} onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })} placeholder="ABC-123" className="dark:bg-gray-700" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Categoría</Label><Input value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} placeholder="Categoría" className="dark:bg-gray-700" /></div>
              <div className="space-y-2"><Label>% Descuento</Label><Input type="number" value={newProduct.discount} onChange={(e) => setNewProduct({ ...newProduct, discount: e.target.value })} placeholder="0" className="dark:bg-gray-700" /></div>
            </div>
            <div className="flex items-center gap-2 pt-2">
              <Switch checked={newProduct.isOnSale} onCheckedChange={(checked) => setNewProduct({ ...newProduct, isOnSale: checked })} />
              <Label>Marcar como Oferta Especial</Label>
            </div>
            <div className="space-y-2">
              <Label>Imágenes</Label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <Upload className="h-6 w-6 text-gray-400 mx-auto mb-1" /><p className="text-xs text-gray-500 dark:text-gray-400">Subir imágenes</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>Cancelar</Button>
            <Button onClick={handleAddProduct}>Agregar Producto</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
        <DialogContent className="max-w-lg dark:bg-gray-800">
          <DialogHeader><DialogTitle className="dark:text-white">Editar Producto</DialogTitle></DialogHeader>
          {editingProduct && (
            <div className="space-y-4">
              <div className="space-y-2"><Label>Nombre</Label><Input value={editingProduct.name} onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })} className="dark:bg-gray-700" /></div>
              <div className="space-y-2"><Label>Descripción</Label><Textarea value={editingProduct.description} onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })} rows={3} className="dark:bg-gray-700" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Precio de Venta ($)</Label><Input type="number" value={editingProduct.price} onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })} className="dark:bg-gray-700" /></div>
                <div className="space-y-2"><Label>Precio de Costo ($)</Label><Input type="number" value={editingProduct.cost || ''} onChange={(e) => setEditingProduct({ ...editingProduct, cost: parseFloat(e.target.value) })} className="dark:bg-gray-700" /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label>Stock</Label><Input type="number" value={editingProduct.stock} onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) })} className="dark:bg-gray-700" /></div>
                <div className="space-y-2"><Label>Stock Mín.</Label><Input type="number" value={editingProduct.minStock || ''} onChange={(e) => setEditingProduct({ ...editingProduct, minStock: parseInt(e.target.value) })} className="dark:bg-gray-700" /></div>
                <div className="space-y-2"><Label>SKU</Label><Input value={editingProduct.sku || ''} onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })} className="dark:bg-gray-700" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Categoría</Label><Input value={editingProduct.category} onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })} className="dark:bg-gray-700" /></div>
                <div className="space-y-2"><Label>% Descuento</Label><Input type="number" value={editingProduct.discount || ''} onChange={(e) => setEditingProduct({ ...editingProduct, discount: parseFloat(e.target.value) })} className="dark:bg-gray-700" /></div>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <Switch checked={editingProduct.isOnSale || false} onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, isOnSale: checked })} />
                <Label>Marcar como Oferta Especial</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingProduct(null)}>Cancelar</Button>
            <Button onClick={handleUpdateProduct}>Guardar cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Modal */}
      <Dialog open={showStockModal} onOpenChange={setShowStockModal}>
        <DialogContent className="max-w-sm dark:bg-gray-800">
          <DialogHeader><DialogTitle className="dark:text-white">Ajustar Stock</DialogTitle><DialogDescription>{stockProduct?.name}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">Stock actual: <span className="font-bold dark:text-white">{stockProduct?.stock}</span></p>
            <div className="space-y-2"><Label>Cantidad a agregar/restar</Label><Input type="number" value={stockQuantity} onChange={(e) => setStockQuantity(e.target.value)} placeholder="ej: 10 o -5" className="dark:bg-gray-700" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStockModal(false)}>Cancelar</Button>
            <Button onClick={handleUpdateStock}>Aplicar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product Detail Dialog */}
      <Dialog open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
        <DialogContent className="max-w-lg dark:bg-gray-800">
          <DialogHeader><DialogTitle className="dark:text-white">{selectedProduct?.name}</DialogTitle><DialogDescription>{selectedProduct?.description}</DialogDescription></DialogHeader>
          {selectedProduct && (
            <div className="space-y-4">
              <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 rounded-lg flex items-center justify-center text-6xl font-bold text-gray-500 dark:text-gray-400 overflow-hidden">
                {selectedProduct.images?.[0] ? <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover" /> : selectedProduct.name.charAt(0)}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm text-gray-500 dark:text-gray-400">Categoría</label><p className="font-medium dark:text-white">{selectedProduct.category}</p></div>
                <div><label className="text-sm text-gray-500 dark:text-gray-400">Precio</label><p className="font-medium text-xl dark:text-white">{formatPrice(selectedProduct.price)}</p></div>
                <div><label className="text-sm text-gray-500 dark:text-gray-400">Stock</label><p className="font-medium dark:text-white">{selectedProduct.stock} unidades</p></div>
                <div><label className="text-sm text-gray-500 dark:text-gray-400">Estado</label><p><Badge variant={selectedProduct.isActive ? 'default' : 'secondary'}>{selectedProduct.isActive ? 'Activo' : 'Inactivo'}</Badge></p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg dark:bg-gray-800">
          <DialogHeader><DialogTitle className="dark:text-white">Detalles del Pedido</DialogTitle><DialogDescription>Pedido #{selectedOrder?.id}</DialogDescription></DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex items-center justify-between"><OrderStatusBadge status={selectedOrder.status} /><span className="text-sm text-gray-500 dark:text-gray-400">{selectedOrder.createdAt.toLocaleDateString()}</span></div>
              <div><h4 className="font-medium mb-2 dark:text-white">Productos</h4>
                <div className="space-y-2">{selectedOrder.items.map((item, idx) => (<div key={idx} className="flex justify-between text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded"><span className="dark:text-gray-300">{item.quantity}x {item.productName}</span><span className="font-medium dark:text-white">{formatPrice(item.total)}</span></div>))}</div>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t dark:border-gray-700 pt-3"><span className="dark:text-white">Total</span><span className="dark:text-white">{formatPrice(selectedOrder.total)}</span></div>
              <div className="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400"><Home className="h-4 w-4 mt-0.5" /><span>{selectedOrder.shippingAddress}</span></div>

              <Button
                variant="outline"
                className="w-full mt-4 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                onClick={() => {
                  // Mock user data for now since order doesn't have phone
                  const mockPhone = '5491112345678';
                  const customerName = 'Cliente';
                  const msg = formatStatusUpdateMessage(customerName, selectedOrder.id, selectedOrder.status, 'Mi Tienda');
                  window.open(generateWhatsAppLink(mockPhone, msg), '_blank');
                }}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Notificar Estado por WhatsApp
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Vista Previa de Tienda */}
      <StorePreview
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        store={store}
        products={products}
        shippingMethods={shippingMethods}
        paymentMethods={paymentMethods}
        activeFlashOffers={activeFlashOffers}
      />
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
          <button onClick={() => setActiveTab('analytics')} className={`p-2 rounded-xl transition-all ${activeTab === 'analytics' ? 'text-violet-600 bg-violet-50 dark:bg-violet-900/20' : 'text-gray-400'}`}>
            <BarChart3 className="h-6 w-6" strokeWidth={activeTab === 'analytics' ? 2.5 : 2} />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={`p-2 rounded-xl transition-all ${['shipping', 'payments', 'settings'].includes(activeTab) ? 'text-violet-600 bg-violet-50 dark:bg-violet-900/20' : 'text-gray-400'}`}>
                <MoreHorizontal className="h-6 w-6" strokeWidth={['shipping', 'payments', 'settings'].includes(activeTab) ? 2.5 : 2} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="mb-2 w-48">
              <DropdownMenuItem onClick={() => setActiveTab('shipping')} className="gap-2 p-3">
                <Truck className="h-4 w-4" /> Envíos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setActiveTab('payments')} className="gap-2 p-3">
                <CreditCard className="h-4 w-4" /> Cobros
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setActiveTab('settings')} className="gap-2 p-3">
                <Home className="h-4 w-4" /> Ajustes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
