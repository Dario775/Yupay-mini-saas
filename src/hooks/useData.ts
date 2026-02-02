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

// Datos de demostración - Usuarios (vacío para producción)
const DEMO_USERS: User[] = [];

// Datos de demostración - Suscripciones (vacío para producción)
const DEMO_SUBSCRIPTIONS: Subscription[] = [];

// Datos de demostración - Tiendas (vacío para producción)
const DEMO_STORES: Store[] = [];

// Datos de demostración - Productos (vacío para producción)
const DEMO_PRODUCTS: Product[] = [];

// Datos de demostración - Órdenes (vacío para producción)
const DEMO_ORDERS: Order[] = [];

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
  // Todos los usuarios empiezan sin órdenes (datos reales vendrán de Supabase)
  const [orders, setOrders] = useState<Order[]>([]);
  const [products] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [stores] = useState<Store[]>([]);

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
  // Todas las tiendas empiezan vacías (datos reales vendrán de Supabase)
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);

  // Store State - undefined hasta que se cargue de Supabase
  const [store, setStore] = useState<Store | undefined>(undefined);

  // Métodos de envío/pago vacíos inicialmente
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
