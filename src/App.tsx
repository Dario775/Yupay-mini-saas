import { useState } from 'react';
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
import { LogOut, Clock, AlertTriangle, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function DashboardRouter() {
  const { user, subscription, logout } = useAuth();
  const [view, setView] = useState<'home' | 'login' | 'register' | 'terms'>('home');
  const [clientTab, setClientTab] = useState('shop');

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
          {user.role === 'admin' && <AdminDashboard />}
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
