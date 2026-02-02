import { useState, useCallback, createContext, useContext } from 'react';
import type { User, UserRole, Subscription, Store, RegisterStoreData } from '@/types';

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  store: Store | null;
  login: (email: string, password: string, role: UserRole, rememberMe?: boolean) => Promise<void>;
  logout: () => void;
  register: (data: RegisterStoreData) => Promise<{ user: User; store: Store; subscription: Subscription }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USERS: Record<string, User> = {
  'admin@minisaas.com': {
    id: '1', email: 'admin@minisaas.com', name: 'Administrador General', role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin', createdAt: new Date('2024-01-01'), isActive: true,
  },
  'cliente@demo.com': {
    id: '2', email: 'cliente@demo.com', name: 'Juan Perez', role: 'cliente',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cliente', createdAt: new Date('2024-06-15'), isActive: true,
  },
  'tienda@demo.com': {
    id: '3', email: 'tienda@demo.com', name: 'Maria Garcia', role: 'tienda',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=tienda', createdAt: new Date('2024-03-20'), isActive: true,
  },
};

const DEMO_STORE_SUBSCRIPTION: Subscription = {
  id: 'sub_demo', userId: '3', storeId: 'store1', plan: 'profesional', status: 'trial',
  startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
  price: 0, autoRenew: true, salesThisMonth: 3, lastResetDate: new Date(),
};

const DEMO_STORE: Store = {
  id: 'store1', ownerId: '3', name: 'TechStore', description: 'Los mejores productos tecnológicos',
  category: 'Tecnología', address: 'Calle Principal 123', phone: '+54 11 1234 5678',
  email: 'contacto@techstore.com', isActive: true, rating: 4.5, createdAt: new Date('2024-03-20'),
  subscriptionId: 'sub_demo',
};

const AUTH_STORAGE_KEY = 'minisaas_auth';
const STORE_STORAGE_KEY = 'minisaas_store';
const SUB_STORAGE_KEY = 'minisaas_subscription';
const DYNAMIC_USERS_KEY = 'minisaas_dynamic_users';
const DYNAMIC_STORES_KEY = 'minisaas_dynamic_stores';
const DYNAMIC_SUBS_KEY = 'minisaas_dynamic_subs';

function deserializeUser(data: string | null): User | null {
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    return { ...parsed, createdAt: new Date(parsed.createdAt) };
  } catch { return null; }
}

function deserializeSubscription(data: string | null): Subscription | null {
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    return {
      ...parsed,
      startDate: new Date(parsed.startDate),
      endDate: new Date(parsed.endDate),
      trialEndDate: parsed.trialEndDate ? new Date(parsed.trialEndDate) : undefined,
      lastResetDate: new Date(parsed.lastResetDate),
    };
  } catch { return null; }
}

function deserializeStore(data: string | null): Store | null {
  if (!data) return null;
  try {
    const parsed = JSON.parse(data);
    return { ...parsed, createdAt: new Date(parsed.createdAt) };
  } catch { return null; }
}

function serializeUser(user: User): string {
  return JSON.stringify({ ...user, createdAt: user.createdAt.toISOString() });
}

function serializeSubscription(sub: Subscription): string {
  return JSON.stringify({
    ...sub,
    startDate: sub.startDate.toISOString(),
    endDate: sub.endDate.toISOString(),
    trialEndDate: sub.trialEndDate?.toISOString(),
    lastResetDate: sub.lastResetDate.toISOString(),
  });
}

function serializeStore(store: Store): string {
  return JSON.stringify({ ...store, createdAt: store.createdAt.toISOString() });
}

// Funciones para usuarios dinámicos (creados por admin)
function getDynamicUsers(): Record<string, { user: User; store?: Store; sub?: Subscription }> {
  try {
    const data = localStorage.getItem(DYNAMIC_USERS_KEY);
    if (!data) return {};
    const parsed = JSON.parse(data);
    Object.keys(parsed).forEach(key => {
      parsed[key].user.createdAt = new Date(parsed[key].user.createdAt);
      if (parsed[key].store) parsed[key].store.createdAt = new Date(parsed[key].store.createdAt);
      if (parsed[key].sub) {
        parsed[key].sub.startDate = new Date(parsed[key].sub.startDate);
        parsed[key].sub.endDate = new Date(parsed[key].sub.endDate);
        parsed[key].sub.lastResetDate = new Date(parsed[key].sub.lastResetDate);
        if (parsed[key].sub.trialEndDate) parsed[key].sub.trialEndDate = new Date(parsed[key].sub.trialEndDate);
      }
    });
    return parsed;
  } catch { return {}; }
}

// Exportar para que AdminDashboard pueda guardar usuarios
export function saveDynamicUser(user: User, store?: Store, sub?: Subscription) {
  const users = getDynamicUsers();
  users[user.email] = { user, store, sub };
  localStorage.setItem(DYNAMIC_USERS_KEY, JSON.stringify(users));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const storedSession = localStorage.getItem(AUTH_STORAGE_KEY) || sessionStorage.getItem(AUTH_STORAGE_KEY);
    return deserializeUser(storedSession);
  });
  const [subscription, setSubscription] = useState<Subscription | null>(() => {
    const stored = localStorage.getItem(SUB_STORAGE_KEY) || sessionStorage.getItem(SUB_STORAGE_KEY);
    return deserializeSubscription(stored);
  });
  const [store, setStore] = useState<Store | null>(() => {
    const stored = localStorage.getItem(STORE_STORAGE_KEY) || sessionStorage.getItem(STORE_STORAGE_KEY);
    return deserializeStore(stored);
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string, password: string, role: UserRole, rememberMe: boolean = false) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    let loggedInUser: User;
    let userSubscription: Subscription | null = null;
    let userStore: Store | null = null;

    // 1. Buscar en usuarios demo
    const demoUser = DEMO_USERS[email];
    if (demoUser && demoUser.role === role) {
      loggedInUser = demoUser;
      if (role === 'tienda') {
        userSubscription = DEMO_STORE_SUBSCRIPTION;
        userStore = DEMO_STORE;
      }
    } else {
      // 2. Buscar en usuarios dinámicos (creados por admin)
      const dynamicUsers = getDynamicUsers();
      const dynamicEntry = dynamicUsers[email];

      if (dynamicEntry && dynamicEntry.user.role === role) {
        loggedInUser = dynamicEntry.user;
        userStore = dynamicEntry.store || null;
        userSubscription = dynamicEntry.sub || null;
      } else {
        // 3. Crear usuario temporal para cualquier login
        loggedInUser = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
          role,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
          createdAt: new Date(),
          isActive: true,
        };
      }
    }

    const storage = rememberMe ? localStorage : sessionStorage;
    const otherStorage = rememberMe ? sessionStorage : localStorage;

    storage.setItem(AUTH_STORAGE_KEY, serializeUser(loggedInUser));
    otherStorage.removeItem(AUTH_STORAGE_KEY);

    if (userSubscription) {
      storage.setItem(SUB_STORAGE_KEY, serializeSubscription(userSubscription));
    } else {
      storage.removeItem(SUB_STORAGE_KEY);
    }
    otherStorage.removeItem(SUB_STORAGE_KEY);

    if (userStore) {
      storage.setItem(STORE_STORAGE_KEY, serializeStore(userStore));
    } else {
      storage.removeItem(STORE_STORAGE_KEY);
    }
    otherStorage.removeItem(STORE_STORAGE_KEY);

    setUser(loggedInUser);
    setSubscription(userSubscription);
    setStore(userStore);
    setIsLoading(false);
  }, []);

  const register = useCallback(async (data: RegisterStoreData): Promise<{ user: User; store: Store; subscription: Subscription }> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    const now = new Date();
    const userId = `user_${Date.now()}`;
    const storeId = `store_${Date.now()}`;
    const subId = `sub_${Date.now()}`;

    const newUser: User = {
      id: userId, email: data.email, name: data.ownerName, role: 'tienda',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
      createdAt: now, isActive: true,
    };

    const newStore: Store = {
      id: storeId, ownerId: userId, name: data.storeName, description: '',
      category: data.category, address: '', phone: data.phone || '', email: data.email,
      isActive: true, rating: 0, createdAt: now, subscriptionId: subId,
    };

    const trialEnd = new Date(now);
    trialEnd.setDate(trialEnd.getDate() + 14);

    const newSubscription: Subscription = {
      id: subId, userId, storeId, plan: 'profesional', status: 'trial',
      startDate: now, endDate: new Date(now.getFullYear() + 1, now.getMonth(), now.getDate()),
      trialEndDate: trialEnd, price: 0, autoRenew: false, salesThisMonth: 0, lastResetDate: now,
    };

    // Guardar en dynamic users para que pueda loguearse después
    saveDynamicUser(newUser, newStore, newSubscription);

    // Guardar sesión actual
    localStorage.setItem(AUTH_STORAGE_KEY, serializeUser(newUser));
    localStorage.setItem(STORE_STORAGE_KEY, serializeStore(newStore));
    localStorage.setItem(SUB_STORAGE_KEY, serializeSubscription(newSubscription));

    setUser(newUser);
    setStore(newStore);
    setSubscription(newSubscription);
    setIsLoading(false);

    return { user: newUser, store: newStore, subscription: newSubscription };
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(STORE_STORAGE_KEY);
    localStorage.removeItem(SUB_STORAGE_KEY);
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.removeItem(STORE_STORAGE_KEY);
    sessionStorage.removeItem(SUB_STORAGE_KEY);
    setUser(null);
    setStore(null);
    setSubscription(null);
  }, []);

  const value = { user, subscription, store, login, logout, register, isLoading };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
