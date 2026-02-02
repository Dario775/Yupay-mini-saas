import { useState, useCallback, useEffect, createContext, useContext } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { User, UserRole, Subscription, Store, RegisterStoreData } from '@/types';
import type { Session, AuthError } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  subscription: Subscription | null;
  store: Store | null;
  session: Session | null;
  login: (email: string, password: string, role?: UserRole) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterStoreData) => Promise<{ user: User; store: Store; subscription: Subscription }>;
  isLoading: boolean;
  authError: string | null;
  isDemoMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuarios demo para cuando Supabase no está configurado
const DEMO_USERS: Record<string, { user: User; store?: Store; subscription?: Subscription }> = {
  'admin@minisaas.com': {
    user: { id: '1', email: 'admin@minisaas.com', name: 'Admin Demo', role: 'admin', createdAt: new Date(), isActive: true },
  },
  'cliente@demo.com': {
    user: { id: '2', email: 'cliente@demo.com', name: 'Cliente Demo', role: 'cliente', createdAt: new Date(), isActive: true },
  },
  'tienda@demo.com': {
    user: { id: '3', email: 'tienda@demo.com', name: 'Tienda Demo', role: 'tienda', createdAt: new Date(), isActive: true },
    store: { id: 'store1', ownerId: '3', name: 'TechStore Demo', description: 'Tienda de prueba', category: 'Tecnología', address: 'Demo 123', phone: '+54 11 1234', email: 'tienda@demo.com', isActive: true, rating: 4.5, createdAt: new Date() },
    subscription: { id: 'sub1', userId: '3', storeId: 'store1', plan: 'profesional', status: 'trial', startDate: new Date(), endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), price: 0, autoRenew: true, salesThisMonth: 0, lastResetDate: new Date() },
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [store, setStore] = useState<Store | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const isDemoMode = !isSupabaseConfigured;

  // Cargar sesión existente al iniciar
  useEffect(() => {
    const initAuth = async () => {
      // Si está en modo demo, no intentar cargar sesión de Supabase
      if (isDemoMode) {
        console.log('🎮 Modo DEMO activado - Supabase no configurado');
        setIsLoading(false);
        return;
      }

      try {
        // Obtener sesión actual
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        setSession(currentSession);

        if (currentSession?.user) {
          await loadUserProfile(currentSession.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Escuchar cambios de autenticación
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth event:', event);
        setSession(newSession);

        if (event === 'SIGNED_IN' && newSession?.user) {
          await loadUserProfile(newSession.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setStore(null);
          setSubscription(null);
        }
      }
    );

    return () => {
      authSubscription.unsubscribe();
    };
  }, []);

  // Cargar perfil, tienda y suscripción del usuario
  const loadUserProfile = async (userId: string) => {
    try {
      // Cargar perfil
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('Error loading profile:', profileError);
        return;
      }

      const loadedUser: User = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: profile.role as UserRole,
        avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`,
        phone: profile.phone,
        createdAt: new Date(profile.created_at),
        isActive: profile.is_active,
      };
      setUser(loadedUser);

      // Si es dueño de tienda, cargar tienda y suscripción
      if (loadedUser.role === 'tienda') {
        // Cargar tienda
        const { data: storeData } = await supabase
          .from('stores')
          .select('*')
          .eq('owner_id', userId)
          .single();

        if (storeData) {
          setStore({
            id: storeData.id,
            ownerId: storeData.owner_id,
            name: storeData.name,
            description: storeData.description,
            category: storeData.category,
            address: storeData.address,
            phone: storeData.phone,
            email: storeData.email,
            logo: storeData.logo,
            banner: storeData.banner,
            isActive: storeData.is_active,
            rating: parseFloat(storeData.rating) || 0,
            createdAt: new Date(storeData.created_at),
            location: storeData.latitude && storeData.longitude ? {
              lat: parseFloat(storeData.latitude),
              lng: parseFloat(storeData.longitude),
              address: storeData.address || '',
              locality: storeData.locality,
              province: storeData.province,
            } : undefined,
          });

          // Cargar suscripción
          const { data: subData } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('store_id', storeData.id)
            .single();

          if (subData) {
            setSubscription({
              id: subData.id,
              userId: subData.user_id,
              storeId: subData.store_id,
              plan: subData.plan,
              status: subData.status,
              startDate: new Date(subData.start_date),
              endDate: new Date(subData.end_date),
              trialEndDate: subData.trial_end_date ? new Date(subData.trial_end_date) : undefined,
              price: parseFloat(subData.price) || 0,
              autoRenew: subData.auto_renew,
              salesThisMonth: subData.sales_this_month || 0,
              lastResetDate: new Date(subData.last_reset_date),
            });
          }
        }
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  };

  const login = useCallback(async (email: string, password: string, role?: UserRole) => {
    setIsLoading(true);
    setAuthError(null);

    // Modo DEMO: usar usuarios locales
    if (isDemoMode) {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular delay

      const demoData = DEMO_USERS[email];
      if (demoData && (!role || demoData.user.role === role)) {
        setUser(demoData.user);
        setStore(demoData.store || null);
        setSubscription(demoData.subscription || null);
        setIsLoading(false);
        return;
      }

      // Crear usuario temporal para cualquier email en demo
      const tempUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        role: role || 'cliente',
        createdAt: new Date(),
        isActive: true,
      };
      setUser(tempUser);
      setIsLoading(false);
      return;
    }

    // Modo producción: usar Supabase
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await loadUserProfile(data.user.id);
      }
    } catch (error) {
      const authErr = error as AuthError;
      console.error('Login error:', authErr);

      // Mensajes amigables en español
      if (authErr.message.includes('Invalid login credentials')) {
        setAuthError('Email o contraseña incorrectos');
      } else if (authErr.message.includes('Email not confirmed')) {
        setAuthError('Por favor confirma tu email antes de iniciar sesión');
      } else {
        setAuthError(authErr.message || 'Error al iniciar sesión');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode]);

  const register = useCallback(async (data: RegisterStoreData): Promise<{ user: User; store: Store; subscription: Subscription }> => {
    setIsLoading(true);
    setAuthError(null);

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.ownerName,
            role: 'tienda',
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario');
      }

      const userId = authData.user.id;

      // 2. Actualizar el perfil con datos adicionales
      await supabase
        .from('profiles')
        .update({
          name: data.ownerName,
          role: 'tienda',
          phone: data.phone || null,
        })
        .eq('id', userId);

      // 3. Crear la tienda
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .insert({
          owner_id: userId,
          name: data.storeName,
          category: data.category,
          email: data.email,
          phone: data.phone || null,
          is_active: true,
        })
        .select()
        .single();

      if (storeError) {
        throw storeError;
      }

      // 4. Crear suscripción trial
      const trialEnd = new Date();
      trialEnd.setDate(trialEnd.getDate() + 14);

      const endDate = new Date();
      endDate.setFullYear(endDate.getFullYear() + 1);

      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          store_id: storeData.id,
          plan: 'profesional',
          status: 'trial',
          price: 0,
          start_date: new Date().toISOString(),
          end_date: endDate.toISOString(),
          trial_end_date: trialEnd.toISOString(),
          auto_renew: false,
          sales_this_month: 0,
          last_reset_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (subError) {
        throw subError;
      }

      // Construir objetos de respuesta
      const newUser: User = {
        id: userId,
        email: data.email,
        name: data.ownerName,
        role: 'tienda',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.email}`,
        createdAt: new Date(),
        isActive: true,
      };

      const newStore: Store = {
        id: storeData.id,
        ownerId: userId,
        name: data.storeName,
        description: '',
        category: data.category,
        address: '',
        phone: data.phone || '',
        email: data.email,
        isActive: true,
        rating: 0,
        createdAt: new Date(),
        subscriptionId: subData.id,
      };

      const newSubscription: Subscription = {
        id: subData.id,
        userId,
        storeId: storeData.id,
        plan: 'profesional',
        status: 'trial',
        startDate: new Date(),
        endDate,
        trialEndDate: trialEnd,
        price: 0,
        autoRenew: false,
        salesThisMonth: 0,
        lastResetDate: new Date(),
      };

      setUser(newUser);
      setStore(newStore);
      setSubscription(newSubscription);

      return { user: newUser, store: newStore, subscription: newSubscription };
    } catch (error) {
      const authErr = error as AuthError;
      console.error('Register error:', authErr);

      if (authErr.message.includes('already registered')) {
        setAuthError('Este email ya está registrado');
      } else {
        setAuthError(authErr.message || 'Error al registrar');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async () => {
    if (isDemoMode) {
      setAuthError('Login con Google no disponible en modo demo. Configura Supabase primero.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      // En producción usa el dominio personalizado, en desarrollo usa localhost
      const redirectUrl = import.meta.env.PROD
        ? 'https://www.yupay.com.ar'
        : window.location.origin;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
        },
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      const authErr = error as AuthError;
      console.error('Google login error:', authErr);
      setAuthError('Error al iniciar con Google. Verifica la configuración en Supabase.');
    } finally {
      setIsLoading(false);
    }
  }, [isDemoMode]);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setStore(null);
      setSubscription(null);
      setSession(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = {
    user,
    subscription,
    store,
    session,
    login,
    loginWithGoogle,
    logout,
    register,
    isLoading,
    authError,
    isDemoMode,
  };

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

// Mantener compatibilidad con código existente (deprecated)
export function saveDynamicUser() {
  console.warn('saveDynamicUser is deprecated. Users are now saved in Supabase.');
}
