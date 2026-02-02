import { useState } from 'react';
import {
  Shield,
  User,
  Store,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import { ThemeToggle } from '@/components/ThemeToggle';
import type { UserRole } from '@/types';

const ROLES = [
  {
    id: 'cliente' as UserRole,
    title: 'Cliente',
    description: 'Compra productos y gestiona pedidos',
    icon: User,
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'bg-blue-50 dark:bg-blue-900/10',
    borderColor: 'border-blue-100 dark:border-blue-900/50',
    demoEmail: 'cliente@demo.com',
  },
  {
    id: 'tienda' as UserRole,
    title: 'Dueño de Tienda',
    description: 'Administra tu negocio y productos',
    icon: Store,
    color: 'from-emerald-500 to-teal-600',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/10',
    borderColor: 'border-emerald-100 dark:border-emerald-900/50',
    demoEmail: 'tienda@demo.com',
  },
];

export default function Login({ onLogin, onRegister, onBack, onTerms }: { onLogin: () => void; onRegister?: () => void; onBack?: () => void; onTerms?: () => void }) {
  const { login, isLoading, authError, loginWithGoogle } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'role' | 'credentials'>('role');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    const roleConfig = ROLES.find(r => r.id === role);
    if (roleConfig) {
      setEmail(roleConfig.demoEmail);
    }
    setStep('credentials');
    setErrors({});
  };

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = 'El email es requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Email inválido';

    if (!password) newErrors.password = 'La contraseña es requerida';
    else if (password.length < 4) newErrors.password = 'Mínimo 4 caracteres';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    if (!validateForm()) return;

    try {
      await login(email, password, selectedRole);
      onLogin();
    } catch (error) {
      // Error ya manejado en useAuth, se muestra via authError
      console.error('Login failed:', error);
    }
  };

  const handleBackToRole = () => {
    setStep('role');
    setSelectedRole(null);
    setEmail('');
    setPassword('');
    setErrors({});
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 transition-colors duration-300">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 relative transition-all duration-300">
        {/* Background Accent */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-blue-100 via-blue-50 to-transparent dark:from-blue-900/20 dark:via-blue-900/5 dark:to-transparent opacity-40 blur-3xl -mt-20"></div>

        <div className="p-8 relative z-10">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-lg mb-6 border border-gray-100 dark:border-gray-700">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-xl">M</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white text-center">
              {step === 'role' ? 'Bienvenido' : 'Iniciar Sesión'}
            </h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mt-2 text-sm">
              {step === 'role'
                ? 'Selecciona cómo quieres acceder a tu cuenta'
                : `Accediendo como ${ROLES.find(r => r.id === selectedRole)?.title}`}
            </p>
          </div>

          {step === 'role' ? (
            /* Step 1: Role Selection */
            <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {ROLES.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className={`w-full p-4 rounded-xl border transition-all duration-200 text-left group hover:shadow-md ${role.bgColor} ${role.borderColor} hover:scale-[1.01] active:scale-[0.99]`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${role.color} flex items-center justify-center shadow-sm text-white`}>
                      <role.icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{role.title}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{role.description}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}

              <div className="pt-4 flex flex-col items-center gap-4">
                <p className="text-xs text-center text-gray-400">
                  ¿No tienes cuenta?{" "}
                  <button onClick={onRegister} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                    Regístrate gratis
                  </button>
                </p>
                {onBack && (
                  <button onClick={onBack} className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1">
                    <ArrowLeft className="h-3 w-3" /> Volver al inicio
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Step 2: Credentials */
            <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <button
                type="button"
                onClick={handleBackToRole}
                className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1 mb-2 transition-colors"
              >
                <ArrowLeft className="h-3 w-3" /> Cambiar de rol
              </button>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-gray-700 dark:text-gray-300 ml-1">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white h-11 rounded-xl focus:ring-blue-500/20 ${errors.email ? 'border-red-500 ring-red-500/20' : ''}`}
                    placeholder="ejemplo@minisaas.com"
                  />
                  {errors.email && (
                    <div className="flex items-center gap-1 mt-1.5 text-red-500 text-[10px] uppercase font-bold tracking-wider ml-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.email}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    Contraseña
                  </Label>
                  <button type="button" className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline uppercase font-bold tracking-wider">
                    ¿Olvidaste la clave?
                  </button>
                </div>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white h-11 pr-10 rounded-xl focus:ring-blue-500/20 ${errors.password ? 'border-red-500 ring-red-500/20' : ''}`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  {errors.password && (
                    <div className="flex items-center gap-1 mt-1.5 text-red-500 text-[10px] uppercase font-bold tracking-wider ml-1">
                      <AlertCircle className="h-3 w-3" />
                      <span>{errors.password}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 ml-1">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="rounded-md border-gray-300 dark:border-gray-700 data-[state=checked]:bg-blue-600"
                />
                <label htmlFor="remember" className="text-xs text-gray-500 dark:text-gray-400 cursor-pointer">
                  Mantenerme conectado
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gradient-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98] border-0"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>Iniciar Sesión <ArrowRight className="ml-2 h-4 w-4" /></>
                )}
              </Button>

              {/* Error Message */}
              {authError && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/50 rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <p className="text-xs text-red-600 dark:text-red-400">{authError}</p>
                </div>
              )}

              {/* Demo Account Box */}
              <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50 rounded-xl p-4 mt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-1">Demo</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      Email: <span className="font-medium underline decoration-blue-200">{email}</span><br />
                      Clave: <span className="font-medium">cualquier-cosa</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800"></div>
                <span className="px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Social Login
                </span>
                <div className="flex-1 h-px bg-gray-100 dark:bg-gray-800"></div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={loginWithGoogle}
                  disabled={isLoading}
                  className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  <span className="ml-2 text-sm">Google</span>
                </Button>

                <Button type="button" variant="outline" className="h-11 rounded-xl border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                  <span className="ml-2 text-sm">GitHub</span>
                </Button>
              </div>
            </form>
          )}

          {/* Footer Terms */}
          <div className="mt-8 text-center">
            <p className="text-[10px] text-gray-400">
              Al iniciar sesión, aceptas nuestros{' '}
              <button onClick={onTerms} className="underline hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                Términos y Condiciones
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
