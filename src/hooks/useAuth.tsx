import { useState, useCallback, useEffect, createContext, useContext, useRef } from 'react';
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
  register: (data: RegisterStoreData, roleOverride?: 'tienda' | 'cliente') => Promise<{ user: User | null; store: Store | null; subscription: Subscription | null; emailConfirmationRequired?: boolean }>;
  clearAuthSession: () => void;
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

  // Use refs to track state across async cycles without dependency baggage
  const userRef = useRef<User | null>(null);
  const loadingRef = useRef(false);

  const clearAuthSession = useCallback(() => {
    console.log('🧹 Clearing auth session and localStorage...');
    // Limpiar claves de Supabase y Yupay
    Object.keys(localStorage).forEach(key => {
      if (key.includes('sb-') || key.includes('yupay-')) {
        localStorage.removeItem(key);
      }
    });
    setUser(null);
    setStore(null);
    setSubscription(null);
    setSession(null);
  }, []);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Cargar sesión existente al iniciar
  useEffect(() => {
    if (isDemoMode) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    // Listener de cambios de autenticación
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!isMounted) return;

        console.log('🔔 Auth Event:', event, 'User:', newSession?.user?.email);
        setSession(newSession);

        try {
          if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
            if (newSession?.user) {
              const currentUserId = userRef.current?.id;
              const newUserId = newSession.user.id;

              // Si ya estamos cargando, no reentrar
              if (loadingRef.current) {
                console.log('⏳ Already loading profile, skipping duplicate event.');
                return;
              }

              // Si es INITIAL_SESSION y ya tenemos usuario (mismo ID), no recargamos todo
              if (event === 'INITIAL_SESSION' && currentUserId === newUserId) {
                console.log('🔄 Session persistent for same user, skipping profile reload.');
                setIsLoading(false);
                return;
              }

              console.log(`🚀 ${event}: Loading user profile...`);
              loadingRef.current = true;
              setIsLoading(true);

              // Add safety timeout (Stuck Detector)
              const timer = setTimeout(() => {
                if (loadingRef.current) {
                  console.warn("⚠️ Auth loading STUCK (8s). Clearing local storage for recovery...");
                  loadingRef.current = false;
                  clearAuthSession();
                  setIsLoading(false);
                }
              }, 8000);

              try {
                // Pasamos el objeto de usuario directamente para evitar llamadas extras
                await loadUserProfile(newUserId, newSession.user);
              } catch (err) {
                console.error('❌ Critical error loading profile:', err);
                // Si falla críticamente, limpiamos para evitar bucles infinitos
                clearAuthSession();
              } finally {
                clearTimeout(timer);
                loadingRef.current = false;
                setIsLoading(false);
              }
            } else {
              setIsLoading(false);
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('🚪 User signed out, clearing context');
            loadingRef.current = false;
            setUser(null);
            setStore(null);
            setSubscription(null);
            setIsLoading(false);
          }
        } catch (err) {
          console.error('❌ Error in auth state change:', err);
          loadingRef.current = false;
          setIsLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      authSubscription.unsubscribe();
    };
  }, [isDemoMode]);

  // Cargar perfil, tienda y suscripción del usuario
  const loadUserProfile = async (userId: string, authUser?: any) => {
    try {
      // 1. Cargar perfil básico
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      let profile = profileData;

      if (profileError) {
        console.warn('⚠️ No profile found in DB. Constructing fallback user context...');

        // Use authUser if provided, otherwise fetch
        let activeUser = authUser;
        if (!activeUser) {
          const { data: { session } } = await supabase.auth.getSession();
          activeUser = session?.user;
        }

        if (!activeUser) return;

        // Creamos un perfil temporal basado en metadata para no bloquear la UI
        const meta = activeUser.user_metadata;
        profile = {
          id: activeUser.id,
          email: activeUser.email!,
          name: meta?.name || activeUser.email?.split('@')[0],
          role: meta?.role || (isAdminEmail(activeUser.email!) ? 'admin' : 'cliente'),
          created_at: new Date().toISOString(),
          is_active: true
        };
      }

      // 2. Determinar el rol inicial
      const isGlobalAdmin = isAdminEmail(profile.email);
      let effectiveRole = isGlobalAdmin ? 'admin' : (profile.role as UserRole);

      // 3. SIEMPRE intentar cargar tienda del dueño
      // Intentamos obtener todas las tiendas del dueño para evitar errores de duplicidad con maybeSingle()
      const { data: allStores, error: allStoresError } = await supabase
        .from('stores')
        .select('*')
        .eq('owner_id', userId);

      // Si hay error de red o permisos, lo logueamos
      if (allStoresError) {
        console.error('❌ loadUserProfile: Error fetching stores:', allStoresError);
      }

      // Tomamos la primera tienda disponible
      let storeData = allStores && allStores.length > 0 ? allStores[0] : null;

      if (allStores && allStores.length > 1) {
        console.warn(`⚠️ loadUserProfile: User ${userId} has ${allStores.length} stores. Using the first one found.`);
      }

      if (storeData && effectiveRole !== 'admin') {
        effectiveRole = 'tienda';
      } else if (effectiveRole === 'tienda' && !storeData && !isGlobalAdmin) {
        // C. RECUPERACIÓN DE TIENDA:
        // Solo si REALMENTE no hay ninguna tienda en la base de datos
        const { data: { user: authUserObj } } = await supabase.auth.getUser();
        const metadata = authUserObj?.user_metadata;

        if (metadata?.store_name) {
          try {
            // Crear tienda tardía
            const { data: newStore, error: newStoreErr } = await supabase.from('stores').insert({
              owner_id: userId,
              name: metadata.store_name,
              category: metadata.store_category || 'General',
              email: authUserObj?.email,
              phone: metadata.phone || null,
              is_active: true,
            }).select().single();

            if (newStore && !newStoreErr) {
              // Crear suscripción tardía
              const trialEnd = new Date(); trialEnd.setDate(trialEnd.getDate() + 14);
              const endDate = new Date(); endDate.setFullYear(endDate.getFullYear() + 1);

              await supabase.from('subscriptions').insert({
                user_id: userId,
                store_id: newStore.id,
                plan: 'profesional',
                status: 'trial',
                price: 0,
                start_date: new Date().toISOString(),
                end_date: endDate.toISOString(),
                trial_end_date: trialEnd.toISOString(),
                auto_renew: false,
                sales_this_month: 0,
                last_reset_date: new Date().toISOString(),
              });

              // Actualizar variables locales para que la UI se refresque inmediatamente
              storeData = newStore;
            }
          } catch (recoveryErr) {
            console.error('❌ Error in deferred store creation:', recoveryErr);
          }
        }
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

      setUser(loadedUser);

      // 4. Si tiene tienda (o la acabamos de crear), cargar datos completos
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
        // Cargar suscripción de forma segura (usamos limit(1) por si hay duplicados residuales)
        try {
          const { data: subsData, error: subsError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('store_id', storeData.id)
            .limit(1);

          if (subsError) {
            console.error('⚠️ Error fetching subscription:', subsError);
          } else if (subsData && subsData.length > 0) {
            const subData = subsData[0];
            setSubscription({
              id: subData.id,
              userId: subData.user_id,
              storeId: subData.store_id,
              plan: subData.plan,
              status: subData.status,
              startDate: new Date(subData.start_date),
              endDate: subData.end_date ? new Date(subData.end_date) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Default 1 year if missing
              trialEndDate: subData.trial_end_date ? new Date(subData.trial_end_date) : undefined,
              price: parseFloat(subData.price) || 0,
              autoRenew: subData.auto_renew,
              salesThisMonth: subData.sales_this_month || 0,
              lastResetDate: new Date(subData.last_reset_date),
              createdAt: new Date(subData.created_at),
            });
          }
        } catch (subErr) {
          console.error('❌ Failed to process subscription data:', subErr);
        }
      }
      console.log('✅ loadUserProfile completed successfully');
    } catch (error) {
      console.error('❌ Critical error in loadUserProfile:', error);
    } finally {
      // Garantizamos que isLoading termine en false
      setIsLoading(false);
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

  const register = useCallback(async (data: RegisterStoreData, roleOverride?: 'tienda' | 'cliente'): Promise<{ user: User | null; store: Store | null; subscription: Subscription | null; emailConfirmationRequired?: boolean }> => {
    setIsLoading(true);
    setAuthError(null);

    const effectiveRole = roleOverride || 'tienda';

    try {
      // 1. Crear usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.ownerName,
            role: effectiveRole,
            // Solo guardar datos de tienda si es rol tienda
            ...(effectiveRole === 'tienda' && {
              store_name: data.storeName,
              store_category: data.category,
              phone: data.phone,
            }),
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error('No se pudo crear el usuario');
      }

      // Si Supabase requiere confirmación de email, no tendremos sesión aún.
      // Los datos quedan en metadata y se procesarán en el primer login.
      if (!authData.session) {
        return {
          user: null,
          store: null,
          subscription: null,
          emailConfirmationRequired: true
        };
      }

      const userId = authData.user.id;

      // 2. Actualizar el perfil con datos adicionales
      try {
        await supabase
          .from('profiles')
          .update({
            name: data.ownerName,
            role: 'tienda',
            phone: data.phone || null,
          })
          .eq('id', userId);
      } catch (err) {
        console.warn('Error updating profile immediately:', err);
      }

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
        // Si falla la suscripción, podríamos querer borrar la tienda para evitar inconsistencias,
        // pero por ahora solo lanzamos el error.
        console.error('Error creating subscription:', subError);
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

      // Recargar el perfil completo desde la BD para asegurar consistencia
      // y evitar condiciones de carrera con onAuthStateChange
      await loadUserProfile(userId);

      // Obtenemos el estado actualizado para devolverlo (aunque loadUserProfile ya actualizó el contexto)
      // Nota: Como loadUserProfile es async y actualiza el estado, aquí podríamos devolver los objetos construidos
      // o confiar en el estado. Para cumplir con la firma, devolvemos lo construido localmente
      // pero sabiendo que el estado ya se refrescó con la verdad de la BD.

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
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
      clearAuthSession();
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
      // Fallback: al menos limpiar el estado local y redirigir
      clearAuthSession();
      window.location.href = '/';
    } finally {
      setIsLoading(false);
    }
  }, [clearAuthSession]);

  const value = {
    user,
    subscription,
    store,
    session,
    login,
    loginWithGoogle,
    logout,
    register,
    clearAuthSession,
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
