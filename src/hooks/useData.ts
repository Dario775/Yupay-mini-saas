import { useState, useCallback } from 'react';
import type {
  Subscription,
  Store,
  Product,
  Order,
  DashboardStats,
  StoreStats,
  SubscriptionPlan,
  OrderStatus,
  User,
  PLAN_CONFIG
} from '@/types';

// Configuración de planes
const PLAN_LIMITS = {
  free: { maxSalesPerMonth: 5, maxProducts: 10, maxStores: 1, price: 0 },
  basico: { maxSalesPerMonth: 50, maxProducts: 100, maxStores: 1, price: 9.99 },
  profesional: { maxSalesPerMonth: 500, maxProducts: 1000, maxStores: 3, price: 29.99 },
  empresarial: { maxSalesPerMonth: -1, maxProducts: -1, maxStores: 10, price: 99.99 },
};

// Datos de demostración - Usuarios
const DEMO_USERS: User[] = [
  { id: '1', email: 'admin@minisaas.com', name: 'Administrador General', role: 'admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', createdAt: new Date('2024-01-01'), isActive: true },
  {
    id: '2', email: 'cliente@demo.com', name: 'Juan Perez', role: 'cliente',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cliente', createdAt: new Date('2024-06-15'), isActive: true,
    location: { lat: -34.6037, lng: -58.3816, address: 'Microcentro, CABA', locality: 'Buenos Aires', province: 'CABA' },
    searchRadius: 100 // 100km
  },
  { id: '3', email: 'tienda@demo.com', name: 'Maria Garcia', role: 'tienda', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tienda', createdAt: new Date('2024-03-20'), isActive: true },
  {
    id: '4', email: 'carlos@example.com', name: 'Carlos Rodriguez', role: 'cliente',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=carlos', createdAt: new Date('2024-07-10'), isActive: true,
    location: { lat: -34.9205, lng: -57.9536, address: 'Centro, La Plata', locality: 'La Plata', province: 'Buenos Aires' },
    searchRadius: 50 // 50km
  },
  { id: '5', email: 'ana@tienda.com', name: 'Ana Martinez', role: 'tienda', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ana', createdAt: new Date('2024-05-05'), isActive: false },
  { id: '6', email: 'pedro@tienda.com', name: 'Pedro Lopez', role: 'tienda', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=pedro', createdAt: new Date('2024-08-01'), isActive: true },
];

// Datos de demostración - Suscripciones (con datos freemium)
const DEMO_SUBSCRIPTIONS: Subscription[] = [
  { id: 'sub1', userId: '3', storeId: 'store1', plan: 'profesional', status: 'trial', startDate: new Date('2024-01-01'), endDate: new Date('2025-01-01'), trialEndDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), price: 0, autoRenew: true, salesThisMonth: 3, lastResetDate: new Date() },
  { id: 'sub2', userId: '5', storeId: 'store3', plan: 'basico', status: 'activa', startDate: new Date('2024-06-01'), endDate: new Date('2024-12-01'), price: 9.99, autoRenew: true, salesThisMonth: 42, lastResetDate: new Date() },
  { id: 'sub3', userId: '4', storeId: 'store2', plan: 'empresarial', status: 'activa', startDate: new Date('2024-08-01'), endDate: new Date('2025-08-01'), price: 99.99, autoRenew: true, salesThisMonth: 234, lastResetDate: new Date() },
  { id: 'sub4', userId: '6', plan: 'free', status: 'limite_alcanzado', startDate: new Date('2024-09-01'), endDate: new Date('2025-09-01'), price: 0, autoRenew: false, salesThisMonth: 5, lastResetDate: new Date() },
];

// Datos de demostración - Tiendas
const DEMO_STORES: Store[] = [
  {
    id: 'store1', ownerId: '3', name: 'TechStore', description: 'Los mejores productos tecnológicos',
    category: 'Tecnología', address: 'Av. Corrientes 1234, CABA', phone: '+54 11 1234 5678',
    email: 'contacto@techstore.com', isActive: true, rating: 4.5, createdAt: new Date('2024-03-20'),
    subscriptionId: 'sub1',
    location: {
      lat: -34.6037,
      lng: -58.3816,
      address: 'Av. Corrientes 1234, CABA, Argentina',
      locality: 'Buenos Aires',
      province: 'Ciudad Autónoma de Buenos Aires'
    },
    shippingMethods: [
      { id: 'ship1', name: 'Envío estándar', price: 500, estimatedDays: '5-7 días hábiles', isActive: true },
      { id: 'ship2', name: 'Envío express', price: 1200, estimatedDays: '24-48hs', description: 'Entrega prioritaria', isActive: true },
      { id: 'ship3', name: 'Retiro en sucursal', price: 0, estimatedDays: 'Inmediato', description: 'Retirá gratis en nuestro local', isActive: true },
    ],
    paymentMethods: [
      { id: 'pay1', type: 'transferencia', name: 'Transferencia bancaria', description: 'CBU: 0000003100012345678901', instructions: 'Enviar comprobante por WhatsApp', isActive: true },
      { id: 'pay2', type: 'mercadopago', name: 'MercadoPago', description: 'Alias: techstore.mp', instructions: 'Aceptamos todas las tarjetas', isActive: true },
      { id: 'pay3', type: 'efectivo', name: 'Efectivo', description: 'Al retirar en sucursal', isActive: true },
    ]
  },
  {
    id: 'store2', ownerId: '4', name: 'Moda Express', description: 'Ropa de moda al mejor precio',
    category: 'Moda', address: 'Calle 7 N° 456, La Plata', phone: '+54 11 9876 5432',
    email: 'ventas@modaexpress.com', isActive: true, rating: 4.2, createdAt: new Date('2024-04-15'),
    subscriptionId: 'sub3',
    location: {
      lat: -34.9205,
      lng: -57.9536,
      address: 'Calle 7 N° 456, La Plata, Argentina',
      locality: 'La Plata',
      province: 'Buenos Aires'
    },
    shippingMethods: [
      { id: 'ship4', name: 'Envío a todo el país', price: 800, estimatedDays: '7-10 días', isActive: true },
      { id: 'ship5', name: 'Envío CABA/GBA', price: 400, estimatedDays: '2-3 días', isActive: true },
    ],
    paymentMethods: [
      { id: 'pay4', type: 'mercadopago', name: 'MercadoPago', description: 'Pagá en cuotas sin interés', isActive: true },
      { id: 'pay5', type: 'tarjeta', name: 'Tarjeta de crédito/débito', description: 'Visa, Mastercard, Amex', isActive: true },
    ]
  },
  {
    id: 'store3', ownerId: '5', name: 'Gourmet Delicias', description: 'Comida gourmet y especialidades',
    category: 'Gastronomía', address: 'Av. Colón 789, Córdoba Capital', phone: '+54 11 5555 1234',
    email: 'info@gourmetdelicias.com', isActive: false, rating: 4.8, createdAt: new Date('2024-05-20'),
    subscriptionId: 'sub2',
    location: {
      lat: -31.4201,
      lng: -64.1888,
      address: 'Av. Colón 789, Córdoba Capital, Argentina',
      locality: 'Córdoba',
      province: 'Córdoba'
    },
    shippingMethods: [
      { id: 'ship6', name: 'Delivery zona', price: 300, estimatedDays: '30-60 min', isActive: true },
    ],
    paymentMethods: [
      { id: 'pay6', type: 'efectivo', name: 'Efectivo contra entrega', isActive: true },
      { id: 'pay7', type: 'transferencia', name: 'Transferencia', description: 'Alias: gourmet.ok', isActive: true },
    ]
  },
];

// Datos de demostración - Productos
const DEMO_PRODUCTS: Product[] = [
  { id: 'prod1', storeId: 'store1', name: 'Auriculares Bluetooth', description: 'Auriculares inalámbricos con cancelación de ruido', price: 899, stock: 50, category: 'Audio', images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200'], isActive: true, createdAt: new Date('2024-05-01') },
  { id: 'prod2', storeId: 'store1', name: 'Mouse Gamer', description: 'Mouse gaming RGB 16000 DPI', price: 599, stock: 30, category: 'Periféricos', images: ['https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200'], isActive: true, createdAt: new Date('2024-05-15') },
  { id: 'prod3', storeId: 'store1', name: 'Teclado Mecánico', description: 'Teclado mecánico RGB switches blue', price: 1299, stock: 8, category: 'Periféricos', images: ['https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=200'], isActive: true, createdAt: new Date('2024-06-01') },
  { id: 'prod4', storeId: 'store2', name: 'Camisa Casual', description: 'Camisa de algodón 100%', price: 349, stock: 100, category: 'Ropa', images: ['https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=200'], isActive: true, createdAt: new Date('2024-06-01') },
  { id: 'prod5', storeId: 'store2', name: 'Jeans Premium', description: 'Jeans de alta calidad', price: 899, stock: 75, category: 'Ropa', images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=200'], isActive: true, createdAt: new Date('2024-06-15') },
];

// Datos de demostración - Órdenes
const DEMO_ORDERS: Order[] = [
  { id: 'ord1', customerId: '2', storeId: 'store1', items: [{ productId: 'prod1', productName: 'Auriculares Bluetooth', quantity: 1, unitPrice: 899, total: 899 }], total: 899, status: 'entregado', createdAt: new Date('2024-06-15'), shippingAddress: 'Calle Cliente 789' },
  { id: 'ord2', customerId: '2', storeId: 'store2', items: [{ productId: 'prod4', productName: 'Camisa Casual', quantity: 2, unitPrice: 349, total: 698 }], total: 698, status: 'enviado', createdAt: new Date('2024-06-20'), shippingAddress: 'Calle Cliente 789' },
  { id: 'ord3', customerId: '4', storeId: 'store1', items: [{ productId: 'prod2', productName: 'Mouse Gamer', quantity: 1, unitPrice: 599, total: 599 }, { productId: 'prod3', productName: 'Teclado Mecánico', quantity: 1, unitPrice: 1299, total: 1299 }], total: 1898, status: 'procesando', createdAt: new Date('2024-07-01'), shippingAddress: 'Av. Carlos 123' },
  { id: 'ord4', customerId: '2', storeId: 'store1', items: [{ productId: 'prod3', productName: 'Teclado Mecánico', quantity: 1, unitPrice: 1299, total: 1299 }], total: 1299, status: 'pendiente', createdAt: new Date('2024-07-10'), shippingAddress: 'Calle Cliente 789' },
];

// Hook para Admin - Mejorado con métricas freemium
export function useAdminData() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(DEMO_SUBSCRIPTIONS);
  const [stores, setStores] = useState<Store[]>(DEMO_STORES);
  const [users, setUsers] = useState<User[]>(DEMO_USERS);
  const [orders] = useState<Order[]>(DEMO_ORDERS);
  const [planLimits, setPlanLimits] = useState(PLAN_LIMITS);

  // Métricas freemium
  const freeUsers = subscriptions.filter(s => s.plan === 'free').length;
  const trialUsers = subscriptions.filter(s => s.status === 'trial').length;
  const paidUsers = subscriptions.filter(s => s.status === 'activa' && s.plan !== 'free').length;
  const limitReached = subscriptions.filter(s => s.status === 'limite_alcanzado').length;
  const conversionRate = (freeUsers + trialUsers) > 0 ? (paidUsers / (freeUsers + trialUsers + paidUsers)) * 100 : 0;

  const stats: DashboardStats = {
    totalUsers: users.length,
    totalStores: stores.length,
    totalOrders: orders.length,
    totalRevenue: subscriptions.filter(s => s.status === 'activa').reduce((acc, s) => acc + s.price, 0),
    activeSubscriptions: subscriptions.filter(s => s.status === 'activa' || s.status === 'trial').length,
    freeUsers,
    paidUsers,
    trialUsers,
    conversionRate,
  };

  const updatePlanLimits = useCallback((plan: SubscriptionPlan, updates: Partial<typeof PLAN_LIMITS['basico']>) => {
    setPlanLimits(prev => ({
      ...prev,
      [plan]: { ...prev[plan], ...updates }
    }));
  }, []);

  // CRUD Suscripciones
  const addSubscription = useCallback((data: { userId: string; storeId?: string; plan: SubscriptionPlan; months: number }) => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + data.months);

    const newSub: Subscription = {
      id: `sub${Date.now()}`,
      userId: data.userId,
      storeId: data.storeId,
      plan: data.plan,
      status: data.plan === 'free' ? 'activa' : 'trial',
      startDate,
      endDate,
      trialEndDate: data.plan !== 'free' ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) : undefined,
      price: planLimits[data.plan].price,
      autoRenew: true,
      salesThisMonth: 0,
      lastResetDate: new Date(),
    };
    setSubscriptions(prev => [newSub, ...prev]);
    return newSub;
  }, [planLimits]);

  const updateSubscription = useCallback((id: string, updates: Partial<Subscription>) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const updateSubscriptionStatus = useCallback((id: string, status: Subscription['status']) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  }, []);

  const upgradePlan = useCallback((id: string, newPlan: SubscriptionPlan) => {
    setSubscriptions(prev => prev.map(s => s.id === id ? {
      ...s,
      plan: newPlan,
      status: 'activa',
      price: planLimits[newPlan].price,
    } : s));
  }, [planLimits]);

  const deleteSubscription = useCallback((id: string) => {
    setSubscriptions(prev => prev.filter(s => s.id !== id));
  }, []);

  // CRUD Tiendas
  const addStore = useCallback((data: Omit<Store, 'id' | 'createdAt' | 'rating'>) => {
    const newStore: Store = { ...data, id: `store${Date.now()}`, rating: 0, createdAt: new Date() };
    setStores(prev => [newStore, ...prev]);
    return newStore;
  }, []);

  const updateStore = useCallback((id: string, updates: Partial<Store>) => {
    setStores(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const updateStoreStatus = useCallback((id: string, isActive: boolean) => {
    setStores(prev => prev.map(s => s.id === id ? { ...s, isActive } : s));
  }, []);

  const deleteStore = useCallback((id: string) => {
    setStores(prev => prev.filter(s => s.id !== id));
  }, []);

  // CRUD Usuarios
  const addUser = useCallback((data: Omit<User, 'id' | 'createdAt' | 'avatar'>) => {
    const newUser: User = { ...data, id: `user${Date.now()}`, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`, createdAt: new Date() };
    setUsers(prev => [newUser, ...prev]);
    return newUser;
  }, []);

  const updateUser = useCallback((id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
  }, []);

  const updateUserStatus = useCallback((id: string, isActive: boolean) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive } : u));
  }, []);

  const deleteUser = useCallback((id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setSubscriptions(prev => prev.filter(s => s.userId !== id));
  }, []);

  return {
    stats, subscriptions, stores, users, orders, planLimits,
    updatePlanLimits,
    addSubscription, updateSubscription, updateSubscriptionStatus, upgradePlan, deleteSubscription,
    addStore, updateStore, updateStoreStatus, deleteStore,
    addUser, updateUser, updateUserStatus, deleteUser,
  };
}

// Hook para Cliente
export function useClientData(userId: string) {
  // Solo cargar datos demo para usuarios demo existentes
  // Usuarios nuevos empiezan sin órdenes
  const isDemoUser = ['2', '4'].includes(userId); // IDs de usuarios demo tipo cliente

  const [orders, setOrders] = useState<Order[]>(
    isDemoUser ? DEMO_ORDERS.filter(o => o.customerId === userId) : []
  );
  const [products] = useState<Product[]>(DEMO_PRODUCTS);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [stores] = useState<Store[]>(DEMO_STORES.filter(s => s.isActive));

  const createOrder = useCallback((storeId: string, items: Order['items'], shippingAddress: string) => {
    const newOrder: Order = { id: `ord${Date.now()}`, customerId: userId, storeId, items, total: items.reduce((acc, item) => acc + item.total, 0), status: 'pendiente', createdAt: new Date(), shippingAddress };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder;
  }, [userId]);

  const cancelOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.map(o => o.id === orderId && o.status === 'pendiente' ? { ...o, status: 'cancelado' as OrderStatus } : o));
  }, []);

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  }, []);

  const isFavorite = useCallback((productId: string) => favorites.includes(productId), [favorites]);

  return { orders, products, stores, favorites, createOrder, cancelOrder, toggleFavorite, isFavorite };
}

// Hook para Tienda - Con lógica de límites
export function useStoreData(storeId: string) {
  // Solo cargar datos demo para las tiendas demo existentes (store1, store2, store3)
  // Tiendas nuevas empiezan vacías
  const isDemoStore = ['store1', 'store2', 'store3'].includes(storeId);

  const [products, setProducts] = useState<Product[]>(
    isDemoStore ? DEMO_PRODUCTS.filter(p => p.storeId === storeId) : []
  );
  const [orders, setOrders] = useState<Order[]>(
    isDemoStore ? DEMO_ORDERS.filter(o => o.storeId === storeId) : []
  );
  const [subscription, setSubscription] = useState<Subscription | null>(
    DEMO_SUBSCRIPTIONS.find(s => s.storeId === storeId) || null
  );

  // Store State
  const demoStore = DEMO_STORES.find(s => s.id === storeId);
  const [store, setStore] = useState<Store | undefined>(demoStore);

  // Tiendas nuevas empiezan sin métodos de envío/pago configurados
  const [shippingMethods, setShippingMethods] = useState(store?.shippingMethods || []);
  const [paymentMethods, setPaymentMethods] = useState(store?.paymentMethods || []);

  const updateStoreInfo = useCallback((updates: Partial<Store>) => {
    setStore(prev => prev ? { ...prev, ...updates } : prev);
  }, []);

  // Límites del plan actual
  const currentPlan = subscription?.plan || 'free';
  const limits = PLAN_LIMITS[currentPlan];
  const salesThisMonth = subscription?.salesThisMonth || 0;
  const isLimitReached = limits.maxSalesPerMonth !== -1 && salesThisMonth >= limits.maxSalesPerMonth;
  const productsLimit = limits.maxProducts;
  const canAddProduct = productsLimit === -1 || products.length < productsLimit;

  // Calcular días restantes de trial
  const trialDaysRemaining = subscription?.trialEndDate
    ? Math.max(0, Math.ceil((subscription.trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const isOnTrial = subscription?.status === 'trial';

  const stats: StoreStats = {
    totalSales: orders.reduce((acc, o) => acc + o.total, 0),
    totalOrders: orders.length,
    averageOrderValue: orders.length > 0 ? orders.reduce((acc, o) => acc + o.total, 0) / orders.length : 0,
    topProducts: products.slice(0, 3),
    salesThisMonth,
    salesLimit: limits.maxSalesPerMonth,
    productsCount: products.length,
    productsLimit,
    isLimitReached,
  };

  const pendingOrders = orders.filter(o => o.status === 'pendiente' || o.status === 'procesando').length;
  const lowStockProducts = products.filter(p => p.stock < 10).length;

  const addProduct = useCallback((product: Omit<Product, 'id' | 'createdAt'>) => {
    if (!canAddProduct) return null;
    const newProduct: Product = { ...product, id: `prod${Date.now()}`, createdAt: new Date() };
    setProducts(prev => [newProduct, ...prev]);
    return newProduct;
  }, [canAddProduct]);

  const updateProduct = useCallback((id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
  }, []);

  const updateStock = useCallback((productId: string, quantity: number) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: Math.max(0, p.stock + quantity) } : p));
  }, []);

  // Registrar una venta (incrementar contador)
  const recordSale = useCallback(() => {
    if (isLimitReached) return false;
    if (subscription) {
      setSubscription(prev => prev ? { ...prev, salesThisMonth: prev.salesThisMonth + 1 } : prev);
    }
    return true;
  }, [isLimitReached, subscription]);

  // Upgrade de plan
  const upgradePlan = useCallback((newPlan: SubscriptionPlan) => {
    setSubscription(prev => prev ? {
      ...prev,
      plan: newPlan,
      status: 'activa',
      price: PLAN_LIMITS[newPlan].price,
    } : prev);
  }, []);

  // CRUD Métodos de envío
  const addShippingMethod = useCallback((method: Omit<typeof shippingMethods[0], 'id'>) => {
    const newMethod = { ...method, id: `ship${Date.now()}` };
    setShippingMethods(prev => [...prev, newMethod]);
    return newMethod;
  }, []);

  const updateShippingMethod = useCallback((id: string, updates: Partial<typeof shippingMethods[0]>) => {
    setShippingMethods(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const deleteShippingMethod = useCallback((id: string) => {
    setShippingMethods(prev => prev.filter(m => m.id !== id));
  }, []);

  // CRUD Métodos de pago
  const addPaymentMethod = useCallback((method: Omit<typeof paymentMethods[0], 'id'>) => {
    const newMethod = { ...method, id: `pay${Date.now()}` };
    setPaymentMethods(prev => [...prev, newMethod]);
    return newMethod;
  }, []);

  const updatePaymentMethod = useCallback((id: string, updates: Partial<typeof paymentMethods[0]>) => {
    setPaymentMethods(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, []);

  const deletePaymentMethod = useCallback((id: string) => {
    setPaymentMethods(prev => prev.filter(m => m.id !== id));
  }, []);

  return {
    store, updateStoreInfo,
    stats, products, orders, subscription, pendingOrders, lowStockProducts, planLimits: PLAN_LIMITS,
    isLimitReached, canAddProduct, isOnTrial, trialDaysRemaining,
    addProduct, updateProduct, deleteProduct, updateOrderStatus, updateStock, recordSale, upgradePlan,
    // Métodos de envío
    shippingMethods, addShippingMethod, updateShippingMethod, deleteShippingMethod,
    // Métodos de pago
    paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod,
  };
}
