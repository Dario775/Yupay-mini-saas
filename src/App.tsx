import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Home from '@/sections/Home';
import Login from '@/sections/Login';
import Register from '@/sections/Register';
import Terms from '@/sections/Terms';
import AdminDashboard from '@/sections/AdminDashboard';
import ClientDashboard from '@/sections/ClientDashboard';
import StoreDashboard from '@/sections/StoreDashboard';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LogOut, Clock, AlertTriangle, Crown, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Lista de emails autorizados para acceso admin
// Puedes agregar más emails separados por coma en la variable de entorno
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || 'dario775@gmail.com').split(',').map((e: string) => e.trim().toLowerCase());

function DashboardRouter() {
  const { user, subscription, logout, loginWithGoogle, isLoading } = useAuth();
  const [view, setView] = useState<'home' | 'login' | 'register' | 'terms'>('home');
  const [clientTab, setClientTab] = useState('shop');

  // Detectar si estamos en la ruta /admin
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  useEffect(() => {
    const checkRoute = () => {
      setIsAdminRoute(window.location.pathname === '/admin' || window.location.hash === '#/admin');
    };
    checkRoute();
    window.addEventListener('popstate', checkRoute);
    return () => window.removeEventListener('popstate', checkRoute);
  }, []);

  // Verificar si el usuario está autorizado como admin
  const isAuthorizedAdmin = user && ADMIN_EMAILS.includes(user.email.toLowerCase());

  // Ruta /admin - Acceso especial para administradores
  if (isAdminRoute) {
    // Si no hay usuario, mostrar login con Google
    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-violet-900 to-indigo-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Panel de Administración
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
              Acceso restringido. Inicia sesión con tu cuenta autorizada.
            </p>
            <Button
              onClick={loginWithGoogle}
              disabled={isLoading}
              className="w-full h-12 bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 rounded-xl font-medium flex items-center justify-center gap-3"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {isLoading ? 'Verificando...' : 'Continuar con Google'}
            </Button>
            <button
              onClick={() => { window.location.href = '/'; }}
              className="mt-4 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Volver al inicio
            </button>
          </div>
        </div>
      );
    }

    // Usuario logueado pero no autorizado
    if (!isAuthorizedAdmin) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-900 via-red-800 to-rose-900 p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-red-500" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Acceso Denegado
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-2 text-sm">
              El email <span className="font-medium text-gray-700 dark:text-gray-300">{user.email}</span> no tiene permisos de administrador.
            </p>
            <p className="text-gray-400 dark:text-gray-500 mb-6 text-xs">
              Contacta al propietario del sistema para solicitar acceso.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={logout}
                variant="outline"
                className="flex-1"
              >
                Cerrar sesión
              </Button>
              <Button
                onClick={() => { window.location.href = '/'; }}
                className="flex-1"
              >
                Ir al inicio
              </Button>
            </div>
          </div>
        </div>
      );
    }

    // Usuario autorizado - mostrar panel admin
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <nav className="bg-gradient-to-r from-purple-600 to-violet-600 text-white sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <span className="font-bold">Panel de Administración</span>
                <Badge className="bg-white/20 text-white text-xs">Super Admin</Badge>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-white/80 hidden sm:inline">{user.email}</span>
                <ThemeToggle />
                <Button onClick={logout} variant="ghost" size="sm" className="text-white hover:bg-white/20">
                  <LogOut className="w-4 h-4 mr-1" /> Salir
                </Button>
              </div>
            </div>
          </div>
        </nav>
        <ErrorBoundary>
          <AdminDashboard />
        </ErrorBoundary>
      </div>
    );
  }

  // Vistas públicas (sin sesión)
  if (!user) {
    if (view === 'terms') {
      return <Terms onBack={() => setView('home')} />;
    }

    if (view === 'register') {
      return (
        <Register
          onBack={() => setView('home')}
          onSuccess={() => setView('login')}
        />
      );
    }

    if (view === 'login') {
      return (
        <Login
          onLogin={() => { }}
          onRegister={() => setView('register')}
          onBack={() => setView('home')}
          onTerms={() => setView('terms')}
        />
      );
    }

    return <Home onLogin={() => setView('login')} onRegister={() => setView('register')} onTerms={() => setView('terms')} />;
  }

  // Calcular días de trial restantes
  const trialDaysRemaining = subscription?.trialEndDate
    ? Math.max(0, Math.ceil((subscription.trialEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const isOnTrial = subscription?.status === 'trial';
  const isLimitReached = subscription?.status === 'limite_alcanzado';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Trial/Limit Banner */}
      {user.role === 'tienda' && (isOnTrial || isLimitReached) && (
        <div className={`px-4 py-2 text-center text-sm font-medium ${isLimitReached
          ? 'bg-red-500 text-white'
          : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
          }`}>
          {isLimitReached ? (
            <span className="flex items-center justify-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Has alcanzado el límite de ventas de tu plan.
              <Button size="sm" variant="secondary" className="ml-2 h-6">Actualizar plan</Button>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Clock className="h-4 w-4" />
              Prueba gratuita: {trialDaysRemaining} días restantes
              <Crown className="h-4 w-4 ml-2" />
              Plan Profesional activo
            </span>
          )}
        </div>
      )}

      {/* Navigation Bar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-2">
            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xs">M</span>
              </div>
              <span className="font-bold text-lg text-gray-900 dark:text-white hidden sm:inline">MiniSaaS</span>
              <Badge className={`capitalize text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                user.role === 'tienda' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                {user.role}
              </Badge>
            </div>

            {/* Navegación Cliente - Centro */}
            {user.role === 'cliente' && (
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-0.5 rounded-full">
                {[
                  { key: 'shop', icon: '🏪', label: 'Tienda' },
                  { key: 'orders', icon: '📦', label: 'Pedidos' },
                  { key: 'favorites', icon: '❤️', label: 'Favoritos' },
                  { key: 'profile', icon: '👤', label: 'Perfil' }
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setClientTab(tab.key)}
                    className={`px-2.5 py-1 rounded-full text-xs sm:text-sm transition-all ${clientTab === tab.key
                      ? 'bg-white dark:bg-gray-600 shadow-sm font-medium'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                  >
                    <span className="sm:mr-1">{tab.icon}</span>
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Derecha: Usuario y acciones */}
            <div className="flex items-center gap-1 sm:gap-2 shrink-0">
              <ThemeToggle />
              <div className="hidden md:flex items-center gap-2">
                {user.avatar && (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 ring-2 ring-gray-100 dark:ring-gray-600"
                  />
                )}
                <div className="text-right">
                  <p className="text-[10px] font-bold text-gray-900 dark:text-white leading-tight">{user.name}</p>
                  <p className="text-[9px] text-gray-500 dark:text-gray-400 leading-tight">{user.email}</p>
                </div>
              </div>
              <Button
                onClick={logout}
                variant="ghost"
                size="sm"
                className="gap-1 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 h-8 px-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline text-xs">Salir</span>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Dashboard Content based on Role */}
      <main className="transition-colors duration-300 pb-20 sm:pb-0">
        <ErrorBoundary>
          {user.role === 'cliente' && <ClientDashboard activeTab={clientTab} />}
          {user.role === 'tienda' && <StoreDashboard />}
        </ErrorBoundary>
      </main>

      {/* Mobile Bottom Navigation (Client only for now) */}
      {user.role === 'cliente' && (
        <div className="sm:hidden fixed bottom-6 left-4 right-4 z-50">
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-gray-100 dark:border-white/10 shadow-2xl rounded-2xl p-1.5 flex items-center justify-around">
            {[
              { key: 'shop', icon: '🏪', label: 'Tienda' },
              { key: 'orders', icon: '📦', label: 'Pedidos' },
              { key: 'favorites', icon: '❤️', label: 'Favoritos' },
              { key: 'profile', icon: '👤', label: 'Perfil' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setClientTab(tab.key)}
                className={`flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all duration-300 ${clientTab === tab.key
                  ? 'bg-violet-600 text-white shadow-lg'
                  : 'text-gray-500 dark:text-gray-400 active:scale-95'
                  }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <DashboardRouter />
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
