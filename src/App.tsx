import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import Home from '@/sections/Home';
import Login from '@/sections/Login';
import Register from '@/sections/Register';
import Terms from '@/sections/Terms';
import AdminDashboard from '@/sections/AdminDashboard';
import ClientDashboard from '@/sections/ClientDashboard';
import StoreDashboard from '@/sections/StoreDashboard';
import PublicStore from '@/sections/PublicStore';
import { Toaster } from '@/components/ui/sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LogOut, Clock, AlertTriangle, Crown, ShieldAlert, ShoppingCart, Store, Package, Heart, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Lista de emails autorizados para acceso admin
const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || 'dary775@gmail.com').split(',').map((e: string) => e.trim().toLowerCase());

function LoginWrapper() {
  const navigate = useNavigate();
  return (
    <Login
      onLogin={() => navigate('/dashboard')}
      onRegister={() => navigate('/register')}
      onBack={() => navigate('/')}
      onTerms={() => navigate('/terms')}
    />
  );
}

function RegisterWrapper() {
  const navigate = useNavigate();
  return (
    <Register
      onBack={() => navigate('/')}
      onSuccess={() => navigate('/login')}
    />
  );
}

function HomeWrapper() {
  const navigate = useNavigate();
  const { user } = useAuth();
  return (
    <Home
      onLogin={() => user ? navigate('/dashboard') : navigate('/login')}
      onRegister={() => navigate('/register')}
      onTerms={() => navigate('/terms')}
    />
  );
}

function TermsWrapper() {
  const navigate = useNavigate();
  return <Terms onBack={() => navigate(-1)} />;
}

function AdminRoute() {
  const { user, loginWithGoogle, isLoading, logout } = useAuth();

  if (isLoading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;

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

  const isAuthorizedAdmin = user && ADMIN_EMAILS.includes(user.email.toLowerCase());

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
          <div className="flex gap-3 mt-6">
            <Button onClick={logout} variant="outline" className="flex-1">Cerrar sesión</Button>
            <Button onClick={() => window.location.href = '/'} className="flex-1">Ir al inicio</Button>
          </div>
        </div>
      </div>
    );
  }

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

function DashboardLayout() {
  const { user, subscription, logout } = useAuth();
  const [clientTab, setClientTab] = useState('shop');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const handleCountChange = (e: any) => setCartCount(e.detail || 0);
    window.addEventListener('cart-count-changed', handleCountChange);
    return () => window.removeEventListener('cart-count-changed', handleCountChange);
  }, []);

  if (!user) return <Navigate to="/login" replace />;

  const trialDaysRemaining = subscription?.trialEndDate
    ? Math.max(0, Math.ceil((new Date(subscription.trialEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0;
  const isOnTrial = subscription?.status === 'trial';
  const isLimitReached = subscription?.status === 'limite_alcanzado';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Trial Banner */}
      {user.role === 'tienda' && (isOnTrial || isLimitReached) && (
        <div className={`px-4 py-2 text-center text-sm font-medium ${isLimitReached ? 'bg-red-500 text-white' : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'}`}>
          {isLimitReached ? 'Límite alcanzado' : `Prueba gratuita: ${trialDaysRemaining} días restantes`}
        </div>
      )}

      {/* Navbar */}
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 gap-2">
            <div className="flex items-center gap-2.5 shrink-0 group cursor-pointer" onClick={() => window.location.href = '/'}>
              {/* Logo simplified */}
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-bold">Y</div>
              <span className="font-black text-xl text-gray-900 dark:text-white">YUPAY</span>
            </div>

            {/* Client Nav */}
            {user.role === 'cliente' && (
              <div className="hidden sm:flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 rounded-full border border-gray-200 p-1">
                {[
                  { key: 'shop', icon: Store, label: 'Tienda' },
                  { key: 'orders', icon: Package, label: 'Pedidos' },
                  { key: 'favorites', icon: Heart, label: 'Favoritos' },
                  { key: 'profile', icon: User, label: 'Perfil' }
                ].map(tab => (
                  <button key={tab.key} onClick={() => setClientTab(tab.key)} className={`px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 ${clientTab === tab.key ? 'bg-violet-600 text-white' : 'text-gray-500'}`}>
                    <tab.icon className="h-3.5 w-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex items-center gap-2">
              {user.role === 'cliente' && (
                <Button variant="ghost" size="icon" className="relative" onClick={() => window.dispatchEvent(new CustomEvent('toggle-cart'))}>
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && <Badge className="absolute -top-1 -right-1 bg-red-500">{cartCount}</Badge>}
                </Button>
              )}
              <ThemeToggle />
              <Button onClick={logout} variant="ghost" size="sm">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pb-20 sm:pb-0">
        <ErrorBoundary>
          {user.role === 'admin' && <AdminDashboard />}
          {user.role === 'cliente' && <ClientDashboard activeTab={clientTab} />}
          {user.role === 'tienda' && <StoreDashboard />}
        </ErrorBoundary>
      </main>

      {/* Mobile Nav */}
      {user.role === 'cliente' && (
        <div className="sm:hidden fixed bottom-4 left-4 right-4 z-50">
          <div className="bg-white/90 backdrop-blur-lg border shadow-xl rounded-2xl p-2 flex justify-around">
            {[
              { key: 'shop', icon: Store },
              { key: 'orders', icon: Package },
              { key: 'favorites', icon: Heart },
              { key: 'profile', icon: User }
            ].map(tab => (
              <button key={tab.key} onClick={() => setClientTab(tab.key)} className={`p-2 rounded-xl ${clientTab === tab.key ? 'text-violet-600 bg-violet-50' : 'text-gray-400'}`}>
                <tab.icon className="h-6 w-6" strokeWidth={clientTab === tab.key ? 2.5 : 2} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div></div>;

  return (
    <Routes>
      <Route path="/" element={<HomeWrapper />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginWrapper />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterWrapper />} />
      <Route path="/terms" element={<TermsWrapper />} />
      <Route path="/store/:slug" element={<PublicStore />} />

      <Route path="/admin" element={<AdminRoute />} />

      <Route path="/dashboard/*" element={user ? <DashboardLayout /> : <Navigate to="/login" />} />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors closeButton />
      </AuthProvider>
    </ErrorBoundary>
  );
}
