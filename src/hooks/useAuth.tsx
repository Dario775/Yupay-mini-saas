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

// Lista de emails autorizados como admin (sincronizada con App.tsx)
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || 'dary775@gmail.com').split(',').map((e: string) => e.trim().toLowerCase());

// Detectar si un email es de admin
const isAdminEmail = (email: string) => ADMIN_EMAILS.includes(email.toLowerCase());

// Usuarios demo para pruebas locales (sin Supabase)
const DEMO_USERS: Record<string, { user: User; store?: Store; subscription?: Subscription }> = {
  'admin@demo.com': {
    user: { id: 'admin-1', email: 'admin@demo.com', name: 'Administrador', role: 'admin', createdAt: new Date(), isActive: true },
  },
  'cliente@demo.com': {
    user: { id: 'cliente-1', email: 'cliente@demo.com', name: 'Cliente Demo', role: 'cliente', createdAt: new Date(), isActive: true },
  },
  'tienda@demo.com': {
    user: { id: 'tienda-1', email: 'tienda@demo.com', name: 'Tienda Demo', role: 'tienda', createdAt: new Date(), isActive: true },
    store: {
      id: 'store-demo-1',
      ownerId: 'tienda-1',
      name: 'Mi Tienda',
      description: 'Tienda de prueba',
      category: 'General',
      address: 'Dirección Demo',
      phone: '+54 11 1234',
      email: 'tienda@demo.com',
      isActive: true,
      rating: 0,
      createdAt: new Date(),
      shippingMethods: [],
      paymentMethods: []
    },
    subscription: {
      id: 'sub-demo-1',
      userId: 'tienda-1',
      storeId: 'store-demo-1',
      plan: 'profesional',
      status: 'trial',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      trialEndDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      price: 0,
      autoRenew: true,
      salesThisMonth: 0,
      lastResetDate: new Date()
    },
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
    if (isDemoMode) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Listener de cambios de autenticación con manejo de errores robusto
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;

        console.log('🔔 Auth Event:', event, newSession?.user?.email);
        setSession(newSession);

        try {
          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
            if (newSession?.user) {
              setIsLoading(true);
              await loadUserProfile(newSession.user.id);
            }
          } else if (event === 'SIGNED_OUT') {
            setUser(null);
            setStore(null);
            setSubscription(null);
          }
        } catch (err) {
          console.error('❌ Error in auth state change:', err);
        } finally {
          // Garantizar que isLoading siempre termine en false
          if (isMounted) {
            setTimeout(() => {
              if (isMounted) setIsLoading(false);
            }, 500); // Pequeño buffer para evitar flickering
          }
        }
      }
    );

    // Fail-safe: Si pasan 5 segundos y sigue cargando, forzar el apagado
    const timer = setTimeout(() => {
      if (isMounted && isLoading) {
        console.warn('⚠️ Auth timeout reached, forcing isLoading to false');
        setIsLoading(false);
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      authSubscription.unsubscribe();
    };
  }, [isDemoMode]);

  // Cargar perfil, tienda y suscripción del usuario
  const loadUserProfile = async (userId: string) => {
    console.log('🔍 Loading profile for userId:', userId);
    try {
      // 1. Cargar perfil básico
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.warn('⚠️ No profile found in DB, creating fallback user');
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const fallbackUser: User = {
          id: session.user.id,
          email: session.user.email!,
          name: session.user.user_metadata?.full_name || session.user.email?.split('@')[0],
          role: isAdminEmail(session.user.email!) ? 'admin' : 'cliente',
          createdAt: new Date(),
          isActive: true
        };
        setUser(fallbackUser);
        console.log('✅ Fallback user set:', fallbackUser.role);
        return;
      }

      console.log('✅ Profile loaded:', profile.email, 'Role from DB:', profile.role);

      // 2. Determinar el rol inicial
      const isGlobalAdmin = isAdminEmail(profile.email);
      let effectiveRole = isGlobalAdmin ? 'admin' : (profile.role as UserRole);

      // 3. SIEMPRE intentar cargar tienda del dueño
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', userId)
        .maybeSingle();

      if (storeData) {
        console.log('🏠 Store found for user:', storeData.name);
        // Si tiene tienda, forzar rol de tienda aunque el perfil diga cliente
        effectiveRole = 'tienda';
      } else {
        console.log('ℹ️ No core store found for this user ID');
      }

      const loadedUser: User = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        role: effectiveRole,
        avatar: profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.email}`,
        phone: profile.phone,
        createdAt: new Date(profile.created_at),
        isActive: profile.is_active,
      };

      console.log('🚀 Setting final user role:', loadedUser.role);
      setUser(loadedUser);

      // 4. Si tiene tienda, cargar datos completos
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
          .maybeSingle();

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
    } catch (error) {
      console.error('❌ Critical error in loadUserProfile:', error);
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
      const baseUrl = import.meta.env.PROD
        ? 'https://www.yupay.com.ar'
        : window.location.origin;

      const redirectUrl = `${baseUrl}/dashboard`;

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

      // Limpiar estado local inmediatamente
      setUser(null);
      setStore(null);
      setSubscription(null);
      setSession(null);

      // Forzar una redirección limpia
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
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
