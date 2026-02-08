import { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { useLocalStorage } from './useLocalStorage';
import { isSupabaseConfigured } from '@/lib/supabase';
import { adminApi, storeApi, clientApi } from '@/lib/api';
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
  FlashOffer,
  FlashOfferStatus,
  ShippingMethod,
  PaymentMethod,
  PLAN_CONFIG
} from '@/types';

// Configuración de planes (con flash offers)
const PLAN_LIMITS = {
  free: { maxSalesPerMonth: 5, maxProducts: 10, maxStores: 1, hasFlashOffers: false, maxFlashOffersPerMonth: 0, maxFlashOfferRadius: 0, price: 0 },
  basico: { maxSalesPerMonth: 50, maxProducts: 100, maxStores: 1, hasFlashOffers: false, maxFlashOffersPerMonth: 0, maxFlashOfferRadius: 0, price: 5000 },
  profesional: { maxSalesPerMonth: 500, maxProducts: 1000, maxStores: 3, hasFlashOffers: true, maxFlashOffersPerMonth: 2, maxFlashOfferRadius: 5, price: 15000 },
  empresarial: { maxSalesPerMonth: -1, maxProducts: -1, maxStores: 10, hasFlashOffers: true, maxFlashOffersPerMonth: -1, maxFlashOfferRadius: 20, price: 45000 },
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

// Client Demo Data
const DEMO_CLIENT_PRODUCTS: Product[] = [
  {
    id: 'p1',
    storeId: 'store1',
    name: 'Auriculares Pro Wireless',
    description: 'Auriculares con cancelación de ruido de alta fidelidad.',
    price: 15000,
    stock: 15,
    category: 'Audio',
    images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'],
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'p2',
    storeId: 'store1',
    name: 'Smartwatch Serie X',
    description: 'Reloj inteligente con monitor de ritmo cardíaco y GPS.',
    price: 25000,
    stock: 8,
    category: 'Electrónica',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'],
    isActive: true,
    createdAt: new Date()
  },
  {
    id: 'p3',
    storeId: 'store2',
    name: 'Cámara Reflex Nikon',
    description: 'Cámara profesional para fotografía de alta calidad.',
    price: 85000,
    stock: 3,
    category: 'Fotografía',
    images: ['https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80'],
    isActive: true,
    createdAt: new Date()
  }
];

const DEMO_CLIENT_STORES: Store[] = [
  {
    id: 'store1',
    ownerId: 'u1',
    name: 'Mi Tienda Tech',
    description: 'La mejor tecnología a tu alcance.',
    category: 'Electrónica',
    address: 'Av. Corrientes 1234, CABA',
    phone: '1122334455',
    email: 'tienda@demo.com',
    isActive: true,
    rating: 4.8,
    createdAt: new Date(),
    location: { lat: -34.6037, lng: -58.3816, address: 'Av. Corrientes 1234, CABA', locality: 'CABA' }
  },
  {
    id: 'store2',
    ownerId: 'u2',
    name: 'Foto Center',
    description: 'Expertos en fotografía y video.',
    category: 'Fotografía',
    address: 'Florida 500, CABA',
    phone: '1199887766',
    email: 'foto@demo.com',
    isActive: true,
    rating: 4.5,
    createdAt: new Date(),
    location: { lat: -34.6015, lng: -58.3750, address: 'Florida 500, CABA', locality: 'CABA' }
  }
];

// Hook para Admin - Mejorado con métricas freemium
export function useAdminData() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders] = useState<Order[]>([]);
  const [planLimits, setPlanLimits] = useLocalStorage('admin_plan_limits', PLAN_LIMITS);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  // Sync with Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const fetchData = async () => {
      setIsLoading(true);
      console.log('🔄 Admin: Starting data fetch...');

      // Fetch plan configs
      try {
        const dbPlans = await adminApi.getPlanConfigs();
        if (dbPlans) {
          console.log('✅ Admin: Plan configs loaded');
          setPlanLimits(dbPlans);
        }
      } catch (err) {
        console.error('❌ Admin: Error loading plan configs:', err);
      }

      // Fetch subscriptions
      try {
        const dbSubs = await adminApi.getSubscriptions();
        if (dbSubs) {
          console.log('✅ Admin: Loaded subscriptions:', dbSubs.length);
          setSubscriptions(dbSubs.map((s: any) => ({
            id: s.id,
            userId: s.user_id,
            storeId: s.store_id,
            plan: s.plan,
            status: s.status,
            startDate: new Date(s.start_date),
            endDate: new Date(s.end_date),
            trialEndDate: s.trial_end_date ? new Date(s.trial_end_date) : undefined,
            price: Number(s.price),
            autoRenew: s.auto_renew,
            salesThisMonth: s.sales_this_month || 0,
            lastResetDate: s.last_reset_date ? new Date(s.last_reset_date) : new Date()
          })));
        }
      } catch (err) {
        console.error('❌ Admin: Error loading subscriptions:', err);
      }

      // Fetch users
      try {
        const dbUsers = await adminApi.getUsers();
        if (dbUsers) {
          console.log('✅ Admin: Loaded users:', dbUsers.length);
          setUsers(dbUsers.map((u: any) => ({
            id: u.id,
            email: u.email,
            name: u.name || u.email?.split('@')[0] || 'Usuario',
            role: u.role || 'cliente',
            avatar: u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.email}`,
            phone: u.phone,
            createdAt: new Date(u.created_at),
            isActive: u.is_active ?? true
          })));
        }
      } catch (err) {
        console.error('❌ Admin: Error loading users:', err);
      }

      // Fetch stores
      try {
        const dbStores = await adminApi.getAllStores();
        if (dbStores) {
          console.log('📦 Admin: Loaded stores:', dbStores.length);
          setStores(dbStores.map((s: any) => ({
            id: s.id,
            ownerId: s.owner_id,
            name: s.name,
            description: s.description || '',
            category: s.category || 'General',
            address: s.address || '',
            phone: s.phone || '',
            email: s.email || '',
            isActive: s.is_active ?? true,
            rating: s.rating || 0,
            createdAt: new Date(s.created_at),
            location: s.location
          })));
        }
      } catch (err) {
        console.error('❌ Admin: Error loading stores:', err);
      }

      setIsLoading(false);
      console.log('🏁 Admin: Data fetch completed');
    };

    fetchData();
  }, []);

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

  const updatePlanLimits = useCallback(async (plan: SubscriptionPlan, updates: Partial<typeof PLAN_LIMITS['basico']>) => {
    // 1. Update local state
    setPlanLimits(prev => ({
      ...prev,
      [plan]: { ...prev[plan], ...updates }
    }));

    // 2. Update Supabase if configured
    if (isSupabaseConfigured) {
      try {
        await adminApi.updatePlanLimit(plan, updates);
      } catch (err) {
        console.error('Error updating plan in Supabase:', err);
      }
    }
  }, [setPlanLimits]);

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

  const updateSubscription = useCallback(async (id: string, updates: Partial<Subscription>) => {
    // 1. Local
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));

    // 2. Supabase
    if (isSupabaseConfigured) {
      try {
        await adminApi.updateSubscription(id, updates);
      } catch (err) {
        console.error('Error updating subscription in Supabase:', err);
      }
    }
  }, [setSubscriptions]);

  const updateSubscriptionStatus = useCallback(async (id: string, status: Subscription['status']) => {
    // 1. Local
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, status } : s));

    // 2. Supabase
    if (isSupabaseConfigured) {
      try {
        await adminApi.updateSubscription(id, { status });
      } catch (err) {
        console.error('Error updating subscription status in Supabase:', err);
      }
    }
  }, [setSubscriptions]);

  const upgradePlan = useCallback(async (id: string, newPlan: SubscriptionPlan) => {
    const updates = {
      plan: newPlan,
      status: 'activa' as const,
      price: planLimits[newPlan].price,
    };

    // 1. Local
    setSubscriptions(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));

    // 2. Supabase
    if (isSupabaseConfigured) {
      try {
        await adminApi.updateSubscription(id, updates);
      } catch (err) {
        console.error('Error upgrading plan in Supabase:', err);
      }
    }
  }, [planLimits, setSubscriptions]);

  const deleteSubscription = useCallback(async (id: string) => {
    // 1. Local optimistic update
    setSubscriptions(prev => prev.filter(s => s.id !== id));

    // 2. Supabase
    if (isSupabaseConfigured) {
      try {
        await adminApi.deleteSubscription(id);
        toast.success('Suscripción eliminada');
      } catch (err) {
        console.error('Error deleting subscription in Supabase:', err);
        toast.error('Error al eliminar la suscripción');
      }
    }
  }, []);

  // CRUD Tiendas
  const addStore = useCallback(async (data: Omit<Store, 'id' | 'createdAt' | 'rating'>) => {
    // 1. Optimistic update (with temporary ID)
    const tempId = `store_${Date.now()}`;
    const newStore: Store = { ...data, id: tempId, rating: 0, createdAt: new Date() };
    setStores(prev => [newStore, ...prev]);

    // 2. Persist to Supabase
    if (isSupabaseConfigured) {
      try {
        const dbStore = await adminApi.createStore({
          owner_id: data.ownerId,
          name: data.name,
          description: data.description,
          category: data.category,
          address: data.address,
          phone: data.phone,
          email: data.email,
          is_active: data.isActive
        });

        if (dbStore) {
          // Update temp ID with real ID
          setStores(prev => prev.map(s => s.id === tempId ? {
            ...s,
            id: dbStore.id,
            createdAt: new Date(dbStore.created_at)
          } : s));

          toast.success('Tienda creada exitosamente');
          return { ...newStore, id: dbStore.id };
        }
      } catch (err) {
        console.error('Error creating store in Supabase:', err);
        toast.error('Error al crear la tienda');
        // Rollback
        setStores(prev => prev.filter(s => s.id !== tempId));
        return null;
      }
    }

    return newStore;
  }, []);

  const updateStore = useCallback(async (id: string, updates: Partial<Store>) => {
    setStores(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));

    if (isSupabaseConfigured) {
      try {
        await storeApi.updateStore(id, updates);
      } catch (err) {
        console.error('Error updating store in Supabase:', err);
      }
    }
  }, [setStores]);

  const updateStoreStatus = useCallback(async (id: string, isActive: boolean) => {
    setStores(prev => prev.map(s => s.id === id ? { ...s, isActive } : s));

    if (isSupabaseConfigured) {
      try {
        await storeApi.updateStore(id, { isActive });
        toast.success(isActive ? 'Tienda activada' : 'Tienda desactivada');
      } catch (err) {
        console.error('Error updating store status in Supabase:', err);
        toast.error('Error al actualizar el estado de la tienda');
        // Rollback
        setStores(prev => prev.map(s => s.id === id ? { ...s, isActive: !isActive } : s));
      }
    }
  }, [setStores]);

  const deleteStore = useCallback(async (id: string) => {
    // 1. Local optimistic update
    setStores(prev => prev.filter(s => s.id !== id));

    // 2. Supabase
    if (isSupabaseConfigured) {
      try {
        await adminApi.deleteStore(id);
        toast.success('Tienda eliminada');
      } catch (err) {
        console.error('Error deleting store in Supabase:', err);
        toast.error('Error al eliminar la tienda');
        // TODO: Rollback if needed
      }
    }
  }, [setStores]);

  // CRUD Usuarios
  const addUser = useCallback((data: Omit<User, 'id' | 'createdAt' | 'avatar'>) => {
    const newUser: User = { ...data, id: `user${Date.now()}`, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`, createdAt: new Date() };
    setUsers(prev => [newUser, ...prev]);
    return newUser;
  }, [setUsers]);

  const updateUser = useCallback(async (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));

    if (isSupabaseConfigured) {
      try {
        await adminApi.updateUser(id, updates);
      } catch (err) {
        console.error('Error updating user in Supabase:', err);
      }
    }
  }, [setUsers]);

  const updateUserStatus = useCallback(async (id: string, isActive: boolean) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive } : u));

    if (isSupabaseConfigured) {
      try {
        await adminApi.updateUser(id, { isActive });
      } catch (err) {
        console.error('Error updating user status in Supabase:', err);
      }
    }
  }, [setUsers]);

  const deleteUser = useCallback(async (id: string) => {
    // 1. Local optimistic update
    setUsers(prev => prev.filter(u => u.id !== id));
    setSubscriptions(prev => prev.filter(s => s.userId !== id));

    // 2. Supabase
    if (isSupabaseConfigured) {
      try {
        await adminApi.deleteUser(id);
        toast.success('Usuario eliminado');
      } catch (err) {
        console.error('Error deleting user in Supabase:', err);
        toast.error('Error al eliminar el usuario');
      }
    }
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
  const [products, setProducts] = useState<Product[]>(isSupabaseConfigured ? [] : DEMO_CLIENT_PRODUCTS);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [stores, setStores] = useState<Store[]>(isSupabaseConfigured ? [] : DEMO_CLIENT_STORES);

  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const fetchClientData = async () => {
      try {
        const [dbProducts, dbStores, dbOrders] = await Promise.all([
          clientApi.getAllProducts(),
          clientApi.getAllStores(),
          userId ? clientApi.getMyOrders(userId) : Promise.resolve([])
        ]);

        if (dbProducts) {
          setProducts(dbProducts.map((p: any) => ({
            ...p,
            storeId: p.store_id,
            isActive: p.is_active,
            createdAt: new Date(p.created_at),
            isOnSale: p.is_on_sale,
            originalPrice: p.original_price,
            saleEndDate: p.sale_end_date ? new Date(p.sale_end_date) : undefined,
            minStock: p.min_stock
          })));
        }

        if (dbStores) {
          setStores(dbStores.map((s: any) => ({
            ...s,
            ownerId: s.owner_id,
            isActive: s.is_active,
            createdAt: new Date(s.created_at)
          })));
        }

        if (dbOrders) {
          setOrders(dbOrders.map((o: any) => ({
            ...o,
            customerId: o.customer_id,
            storeId: o.store_id,
            shippingAddress: o.shipping_address,
            createdAt: new Date(o.created_at)
          })));
        }
      } catch (error) {
        console.error('Error fetching client data:', error);
        toast.error('Error al cargar datos del cliente.');
      }
    };

    fetchClientData();
  }, [userId]);

  const [flashOffers, setFlashOffers] = useState<FlashOffer[]>([
    {
      id: 'f1',
      storeId: 'store1',
      productIds: ['p1'],
      discountType: 'percentage',
      discountValue: 30,
      startDate: new Date(),
      endDate: new Date(Date.now() + 2 * 60 * 60 * 1000),
      duration: 2,
      radiusKm: 5,
      currentRedemptions: 3,
      maxRedemptions: 50,
      status: 'active',
      title: '30% OFF en Auriculares Pro',
      description: 'Oferta relámpago exclusiva para clientes cercanos.',
      createdAt: new Date(),
      notificationsSent: 15
    }
  ]);

  const createOrder = useCallback(async (storeId: string, items: Order['items'], shippingAddress: string) => {
    const total = items.reduce((acc, item) => acc + item.total, 0);

    // Crear orden optimistamente en local
    const tempId = `ord${Date.now()}`;
    const newOrder: Order = {
      id: tempId,
      customerId: userId,
      storeId,
      items,
      total,
      status: 'pendiente',
      createdAt: new Date(),
      shippingAddress
    };
    setOrders(prev => [newOrder, ...prev]);

    // Persistir en Supabase
    if (isSupabaseConfigured) {
      try {
        // Mapear items al formato de la API
        const apiItems = items.map(item => ({
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          price: item.unitPrice,  // unitPrice -> price
          total: item.total
        }));

        const savedOrder = await clientApi.createOrder({
          customer_id: userId,
          store_id: storeId,
          items: apiItems,
          total,
          shipping_address: shippingAddress
        });

        // Actualizar con el ID real de Supabase
        if (savedOrder) {
          setOrders(prev => prev.map(o =>
            o.id === tempId
              ? { ...o, id: savedOrder.id }
              : o
          ));
          toast.success('¡Pedido realizado con éxito!');
        }
      } catch (err) {
        console.error('Error creating order in Supabase:', err);
        toast.error('Error al guardar el pedido.');
        // Remover orden fallida
        setOrders(prev => prev.filter(o => o.id !== tempId));
        return null;
      }
    }

    return newOrder;
  }, [userId]);

  const cancelOrder = useCallback(async (orderId: string) => {
    // Actualizar optimistamente
    setOrders(prev => prev.map(o =>
      o.id === orderId && o.status === 'pendiente'
        ? { ...o, status: 'cancelado' as OrderStatus }
        : o
    ));

    // Persistir en Supabase
    if (isSupabaseConfigured) {
      try {
        await clientApi.cancelOrder(orderId);
        toast.success('Pedido cancelado');
      } catch (err) {
        console.error('Error canceling order in Supabase:', err);
        toast.error('Error al cancelar el pedido.');
        // Revertir el estado
        setOrders(prev => prev.map(o =>
          o.id === orderId ? { ...o, status: 'pendiente' as OrderStatus } : o
        ));
      }
    }
  }, []);

  const toggleFavorite = useCallback((productId: string) => {
    setFavorites(prev => prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]);
  }, []);

  const isFavorite = useCallback((productId: string) => favorites.includes(productId), [favorites]);

  // Función para refrescar pedidos desde Supabase
  const refreshOrders = useCallback(async () => {
    if (!isSupabaseConfigured || !userId) return;

    try {
      const dbOrders = await clientApi.getMyOrders(userId);
      if (dbOrders) {
        setOrders(dbOrders.map((o: any) => ({
          ...o,
          customerId: o.customer_id,
          storeId: o.store_id,
          shippingAddress: o.shipping_address,
          createdAt: new Date(o.created_at)
        })));
      }
    } catch (error) {
      console.error('Error refreshing orders:', error);
    }
  }, [userId]);

  return { orders, products, stores, favorites, flashOffers, createOrder, cancelOrder, toggleFavorite, isFavorite, refreshOrders };
}

// Hook para Tienda - Con lógica de límites
export function useStoreData(storeId: string) {
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured);

  // Sync with Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Demo initial data
      if (storeId === 'store1') {
        setProducts([
          {
            id: 'p1',
            storeId: 'store1',
            name: 'Auriculares Pro Wireless',
            description: 'Auriculares con cancelación de ruido de alta fidelidad.',
            price: 15000,
            stock: 15,
            category: 'Audio',
            images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80'],
            isActive: true,
            createdAt: new Date()
          },
          {
            id: 'p2',
            storeId: 'store1',
            name: 'Smartwatch Serie X',
            description: 'Reloj inteligente con monitor de ritmo cardíaco y GPS.',
            price: 25000,
            stock: 8,
            category: 'Electrónica',
            images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80'],
            isActive: true,
            createdAt: new Date()
          }
        ]);
        setStore({
          id: 'store1',
          ownerId: 'u1',
          name: 'Mi Tienda Tech',
          description: 'La mejor tecnología a tu alcance.',
          category: 'Electrónica',
          address: 'Av. Corrientes 1234, CABA',
          phone: '1122334455',
          email: 'tienda@demo.com',
          isActive: true,
          rating: 4.8,
          createdAt: new Date(),
          location: { lat: -34.6037, lng: -58.3816, address: 'Av. Corrientes 1234, CABA', locality: 'CABA' }
        });
        setSubscription({
          id: 'sub1',
          userId: 'u1',
          plan: 'profesional',
          status: 'activa',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          price: 15000,
          autoRenew: true,
          salesThisMonth: 0,
          lastResetDate: new Date()
        });
      }
      return;
    }

    const fetchStoreData = async () => {
      setIsLoading(true);
      try {
        const [dbStore, dbProducts, dbOrders] = await Promise.all([
          storeApi.getStore(storeId),
          storeApi.getProducts(storeId),
          storeApi.getOrders(storeId)
        ]);

        if (dbStore) {
          setStore({
            ...dbStore,
            ownerId: dbStore.owner_id,
            isActive: dbStore.is_active,
            createdAt: new Date(dbStore.created_at)
          });
        }
        if (dbProducts) {
          setProducts(dbProducts.map((p: any) => ({
            ...p,
            storeId: p.store_id,
            isActive: p.is_active,
            createdAt: new Date(p.created_at)
          })));
        }
        if (dbOrders) {
          setOrders(dbOrders.map((o: any) => ({
            ...o,
            customerId: o.customer_id,
            storeId: o.store_id,
            shippingAddress: o.shipping_address,
            createdAt: new Date(o.created_at)
          })));
        }
      } catch (err) {
        console.error('Error fetching store data from Supabase:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();
  }, [storeId]);

  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([
    { id: 's1', name: 'Envío Express', price: 500, estimatedDays: '24-48hs', isActive: true },
    { id: 's2', name: 'Retiro en Local', price: 0, estimatedDays: 'Hoy mismo', isActive: true }
  ]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: 'm1', type: 'mercadopago', name: 'Mercado Pago', isActive: true },
    { id: 'm2', type: 'transferencia', name: 'Transferencia', isActive: true }
  ]);

  const [planLimits] = useLocalStorage('admin_plan_limits', PLAN_LIMITS);

  const updateStoreInfo = useCallback((updates: Partial<Store>) => {
    setStore(prev => prev ? { ...prev, ...updates } : prev);
  }, []);

  // Límites del plan actual
  const currentPlan = subscription?.plan || 'free';
  const limits = planLimits[currentPlan as keyof typeof planLimits] || PLAN_LIMITS.free;
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

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'createdAt'>) => {
    if (!canAddProduct) return null;

    // 1. Optimistic update
    const tempId = `prod${Date.now()}`;
    const newProduct: Product = { ...product, id: tempId, createdAt: new Date() };
    setProducts(prev => [newProduct, ...prev]);

    // 2. Persist to Supabase
    if (isSupabaseConfigured) {
      if (!storeId) {
        console.error('❌ addProduct failed: No storeId provided');
        toast.error('Error crítico: No se identificó la tienda. Recarga la página.');
        return;
      }

      try {
        const dbProduct = await storeApi.addProduct({
          store_id: storeId,
          name: product.name,
          description: product.description,
          price: product.price,
          stock: product.stock,
          category: product.category,
          images: product.images,
          is_on_sale: product.isOnSale,
          cost: product.cost,
          sku: product.sku,
          min_stock: product.minStock
          // attributes: product.attributes // Column does not exist in DB yet
        });

        // Update temp ID with real ID
        if (dbProduct) {
          setProducts(prev => prev.map(p => p.id === tempId ? {
            ...p,
            id: dbProduct.id,
            createdAt: new Date(dbProduct.created_at)
          } : p));
          return { ...newProduct, id: dbProduct.id };
        }
      } catch (err: any) {
        console.error('Error adding product to Supabase:', err);
        toast.error(`Error: ${err.message || 'Error al guardar el producto'}`);
        // Rollback optimistic update? Or show error
      }
    }
    return newProduct;
  }, [canAddProduct, storeId]);

  const updateProduct = useCallback(async (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));

    if (isSupabaseConfigured) {
      try {
        await storeApi.updateProduct(id, updates);
      } catch (err) {
        console.error('Error updating product in Supabase:', err);
      }
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));

    if (isSupabaseConfigured) {
      try {
        await storeApi.deleteProduct(id);
      } catch (err) {
        console.error('Error deleting product in Supabase:', err);
      }
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string, status: OrderStatus) => {
    // Actualizar optimistamente
    const previousStatus = orders.find(o => o.id === orderId)?.status;
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));

    // Persistir en Supabase
    if (isSupabaseConfigured) {
      try {
        await storeApi.updateOrderStatus(orderId, status);
        toast.success(`Pedido marcado como ${status}`);
      } catch (err) {
        console.error('Error updating order status in Supabase:', err);
        toast.error('Error al actualizar el estado del pedido');
        // Revertir el estado si falla
        if (previousStatus) {
          setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: previousStatus } : o));
        }
      }
    }
  }, [orders]);

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
      price: planLimits[newPlan].price,
    } : prev);
  }, [planLimits]);

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

  // ================================
  // OFERTAS FLASH (Feature Premium)
  // ================================
  const [flashOffers, setFlashOffers] = useState<FlashOffer[]>([
    {
      id: 'f1',
      storeId: 'store1',
      productIds: ['p1'],
      discountType: 'percentage',
      discountValue: 30,
      startDate: new Date(),
      endDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 horas
      duration: 2,
      radiusKm: 5,
      currentRedemptions: 3,
      maxRedemptions: 50,
      status: 'active',
      title: '30% OFF en Auriculares Pro',
      description: 'Oferta relámpago exclusiva para clientes cercanos.',
      createdAt: new Date(),
      notificationsSent: 15
    }
  ]);

  // Verificar si puede crear ofertas flash
  const canCreateFlashOffer = limits.hasFlashOffers;
  const flashOffersThisMonth = flashOffers.filter(o => {
    const offerMonth = new Date(o.createdAt).getMonth();
    const currentMonth = new Date().getMonth();
    return offerMonth === currentMonth;
  }).length;
  const flashOffersRemaining = limits.maxFlashOffersPerMonth === -1
    ? -1
    : limits.maxFlashOffersPerMonth - flashOffersThisMonth;
  const maxFlashOfferRadius = limits.maxFlashOfferRadius;

  // Actualizar estado de ofertas (expiradas -> expired, programadas -> active)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setFlashOffers(prev => prev.map(offer => {
        if (offer.status === 'scheduled' && new Date(offer.startDate) <= now) {
          return { ...offer, status: 'active' as FlashOfferStatus };
        }
        if (offer.status === 'active' && new Date(offer.endDate) <= now) {
          return { ...offer, status: 'expired' as FlashOfferStatus };
        }
        return offer;
      }));
    }, 60000); // Revisar cada minuto

    return () => clearInterval(interval);
  }, []);

  // Crear oferta flash
  const createFlashOffer = useCallback((data: {
    productIds: string[];
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    durationHours: number;
    radiusKm: number;
    title: string;
    description?: string;
    maxRedemptions?: number;
    startImmediately?: boolean;
  }) => {
    if (!canCreateFlashOffer) return null;
    if (flashOffersRemaining !== -1 && flashOffersRemaining <= 0) return null;
    if (data.radiusKm > maxFlashOfferRadius) return null;

    const now = new Date();
    const startDate = data.startImmediately ? now : new Date(now.getTime() + 5 * 60000); // 5 min para programar
    const endDate = new Date(startDate.getTime() + data.durationHours * 60 * 60 * 1000);

    const newOffer: FlashOffer = {
      id: `flash${Date.now()}`,
      storeId,
      productIds: data.productIds,
      discountType: data.discountType,
      discountValue: data.discountValue,
      startDate,
      endDate,
      duration: data.durationHours,
      radiusKm: data.radiusKm,
      maxRedemptions: data.maxRedemptions,
      currentRedemptions: 0,
      status: data.startImmediately ? 'active' : 'scheduled',
      title: data.title,
      description: data.description,
      createdAt: now,
      notificationsSent: 0,
    };

    setFlashOffers(prev => [newOffer, ...prev]);
    return newOffer;
  }, [canCreateFlashOffer, flashOffersRemaining, maxFlashOfferRadius, storeId]);

  // Cancelar oferta flash
  const cancelFlashOffer = useCallback((offerId: string) => {
    setFlashOffers(prev => prev.map(o =>
      o.id === offerId && (o.status === 'scheduled' || o.status === 'active')
        ? { ...o, status: 'cancelled' as FlashOfferStatus }
        : o
    ));
  }, []);

  // Obtener ofertas activas
  const activeFlashOffers = flashOffers.filter(o => o.status === 'active');

  return {
    store, updateStoreInfo,
    stats, products, orders, subscription, pendingOrders, lowStockProducts, planLimits,
    isLimitReached, canAddProduct, isOnTrial, trialDaysRemaining,
    addProduct, updateProduct, deleteProduct, updateOrderStatus, updateStock, recordSale, upgradePlan,
    // Métodos de envío
    shippingMethods, addShippingMethod, updateShippingMethod, deleteShippingMethod,
    // Métodos de pago
    paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod,
    // Ofertas Flash
    flashOffers, activeFlashOffers,
    canCreateFlashOffer, flashOffersRemaining, maxFlashOfferRadius,
    createFlashOffer, cancelFlashOffer,
  };
}
