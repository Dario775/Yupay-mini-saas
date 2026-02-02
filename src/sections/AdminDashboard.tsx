import { useState } from 'react';
import {
  Users,
  Store,
  CreditCard,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  Search,
  Filter,
  Download,
  DollarSign,
  ShoppingBag,
  Plus,
  Edit,
  Trash2,
  UserPlus,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAdminData } from '@/hooks/useData';
import { saveDynamicUser } from '@/hooks/useAuth';
import type { Subscription, Store as StoreType, User, SubscriptionPlan, UserRole } from '@/types';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { exportToCSV } from '@/utils/export';
import { toast } from 'sonner';

// Datos demo para los gráficos
const monthlyRevenueData = [
  { month: 'Ene', ingresos: 1200, usuarios: 45 },
  { month: 'Feb', ingresos: 1900, usuarios: 52 },
  { month: 'Mar', ingresos: 2400, usuarios: 63 },
  { month: 'Abr', ingresos: 2100, usuarios: 58 },
  { month: 'May', ingresos: 2800, usuarios: 72 },
  { month: 'Jun', ingresos: 3200, usuarios: 85 },
];

const planDistributionData = [
  { name: 'Básico', value: 35, color: '#3b82f6' },
  { name: 'Profesional', value: 45, color: '#8b5cf6' },
  { name: 'Empresarial', value: 20, color: '#f59e0b' },
];

const weeklyOrdersData = [
  { day: 'Lun', ordenes: 12 },
  { day: 'Mar', ordenes: 19 },
  { day: 'Mié', ordenes: 15 },
  { day: 'Jue', ordenes: 22 },
  { day: 'Vie', ordenes: 28 },
  { day: 'Sáb', ordenes: 35 },
  { day: 'Dom', ordenes: 18 },
];

function StatCard({ title, value, icon: Icon, trend, color, gradient }: {
  title: string;
  value: string;
  icon: React.ElementType;
  trend?: string;
  color: string;
  gradient?: string;
}) {
  const isNegativeTrend = trend?.startsWith('-');

  return (
    <Card className={`relative overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-300`}>
      {gradient && <div className={`absolute inset-0 opacity-[0.03] ${gradient}`} />}
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">{title}</p>
            <div className="flex items-baseline gap-2">
              <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
              {trend && (
                <span className={`text-[10px] font-bold ${isNegativeTrend ? 'text-red-500' : 'text-emerald-500'}`}>
                  {trend}
                </span>
              )}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
            <Icon className="h-4 w-4" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SubscriptionStatusBadge({ status }: { status: Subscription['status'] }) {
  const styles: Record<string, string> = {
    activa: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    trial: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
    pendiente: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
    cancelada: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
    vencida: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600',
    limite_alcanzado: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
  };
  const icons: Record<string, React.ElementType> = { activa: CheckCircle, trial: Clock, pendiente: Clock, cancelada: XCircle, vencida: Clock, limite_alcanzado: XCircle };
  const Icon = icons[status] || Clock;
  const labels: Record<string, string> = { activa: 'Activa', trial: 'Trial', pendiente: 'Pendiente', cancelada: 'Cancelada', vencida: 'Vencida', limite_alcanzado: 'Límite' };
  return (
    <Badge variant="outline" className={`${styles[status] || styles.pendiente} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {labels[status] || status}
    </Badge>
  );
}

function PlanBadge({ plan }: { plan: Subscription['plan'] }) {
  const styles: Record<string, string> = {
    free: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400',
    basico: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    profesional: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    empresarial: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  };
  const labels: Record<string, string> = { free: 'Gratis', basico: 'Básico', profesional: 'Profesional', empresarial: 'Empresarial' };
  return <Badge className={styles[plan] || styles.basico}>{labels[plan] || plan}</Badge>;
}

function RoleBadge({ role }: { role: UserRole }) {
  const styles = {
    admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    cliente: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    tienda: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  };
  const labels = { admin: 'Admin', cliente: 'Cliente', tienda: 'Tienda' };
  return <Badge className={styles[role]}>{labels[role]}</Badge>;
}

export default function AdminDashboard() {
  const {
    stats, subscriptions, stores, users, planLimits,
    addSubscription, updateSubscriptionStatus, deleteSubscription,
    addStore, updateStore, updateStoreStatus, deleteStore,
    addUser, updateUserStatus, deleteUser,
    updatePlanLimits
  } = useAdminData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);

  // Modal states
  const [showNewSubscription, setShowNewSubscription] = useState(false);
  const [showNewStore, setShowNewStore] = useState(false);
  const [showNewUser, setShowNewUser] = useState(false);
  const [showEditStore, setShowEditStore] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreType | null>(null);

  // Form states
  const [newSubForm, setNewSubForm] = useState({ userId: '', plan: 'basico' as SubscriptionPlan, months: 12 });
  const [newStoreForm, setNewStoreForm] = useState({
    name: '', description: '', category: '', address: '', phone: '', email: '', ownerId: '', isActive: true,
    // Nuevos campos para crear usuario
    createNewUser: true,
    ownerName: '',
    password: '',
    plan: 'profesional' as SubscriptionPlan,
  });
  const [newUserForm, setNewUserForm] = useState({ name: '', email: '', role: 'cliente' as UserRole, isActive: true });

  const filteredSubscriptions = subscriptions.filter(sub =>
    sub.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sub.plan.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportSubscriptions = () => {
    exportToCSV(subscriptions.map(s => ({
      id: s.id, plan: s.plan, estado: s.status, precio: `$${s.price.toFixed(2)}`,
      inicio: s.startDate.toLocaleDateString(), vencimiento: s.endDate.toLocaleDateString(),
      autoRenov: s.autoRenew ? 'Sí' : 'No',
    })), 'suscripciones', [
      { key: 'id', label: 'ID' }, { key: 'plan', label: 'Plan' }, { key: 'estado', label: 'Estado' },
      { key: 'precio', label: 'Precio' }, { key: 'inicio', label: 'Inicio' }, { key: 'vencimiento', label: 'Vencimiento' },
      { key: 'autoRenov', label: 'Auto Renovación' },
    ]);
    toast.success('Suscripciones exportadas');
  };

  const handleCreateSubscription = () => {
    if (!newSubForm.userId) { toast.error('Selecciona un usuario'); return; }
    addSubscription(newSubForm);
    toast.success('Suscripción creada exitosamente');
    setShowNewSubscription(false);
    setNewSubForm({ userId: '', plan: 'basico', months: 12 });
  };

  // Generar contraseña aleatoria
  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let password = '';
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleCreateStore = () => {
    if (!newStoreForm.name || !newStoreForm.email) { toast.error('Completa los campos requeridos'); return; }

    let ownerId = newStoreForm.ownerId;

    // Si crea nuevo usuario
    if (newStoreForm.createNewUser) {
      if (!newStoreForm.ownerName) { toast.error('Nombre del propietario requerido'); return; }
      if (!newStoreForm.password) { toast.error('Contraseña requerida'); return; }

      // Crear usuario
      const newUser = addUser({ name: newStoreForm.ownerName, email: newStoreForm.email, role: 'tienda', isActive: true });
      ownerId = newUser.id;

      // Crear tienda
      const newStore = addStore({ ...newStoreForm, ownerId });

      // Crear suscripción con el plan seleccionado
      const newSub = addSubscription({ userId: ownerId, storeId: newStore.id, plan: newStoreForm.plan, months: 12 });

      // Persistir en localStorage para que pueda loguearse
      saveDynamicUser(newUser, newStore, newSub);

      // Mostrar credenciales
      toast.success(
        `Usuario creado: ${newStoreForm.email} / ${newStoreForm.password}`,
        { duration: 10000, description: 'Guarda estas credenciales' }
      );
    } else {
      // Crear tienda para usuario existente
      const newStore = addStore({ ...newStoreForm, ownerId });
      addSubscription({ userId: ownerId, storeId: newStore.id, plan: newStoreForm.plan, months: 12 });
    }

    toast.success('Tienda creada exitosamente');
    setShowNewStore(false);
    setNewStoreForm({
      name: '', description: '', category: '', address: '', phone: '', email: '', ownerId: '', isActive: true,
      createNewUser: true, ownerName: '', password: '', plan: 'profesional',
    });
  };

  const handleEditStore = () => {
    if (!editingStore) return;
    updateStore(editingStore.id, editingStore);
    toast.success('Tienda actualizada');
    setShowEditStore(false);
    setEditingStore(null);
  };

  const handleCreateUser = () => {
    if (!newUserForm.name || !newUserForm.email) { toast.error('Completa los campos requeridos'); return; }
    addUser(newUserForm);
    toast.success('Usuario creado exitosamente');
    setShowNewUser(false);
    setNewUserForm({ name: '', email: '', role: 'cliente', isActive: true });
  };

  const handleDeleteSubscription = (id: string) => {
    deleteSubscription(id);
    toast.success('Suscripción eliminada');
  };

  const handleDeleteStore = (id: string) => {
    deleteStore(id);
    toast.success('Tienda eliminada');
  };

  const handleDeleteUser = (id: string) => {
    deleteUser(id);
    toast.success('Usuario eliminado');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 p-4 md:p-6 transition-colors duration-300">
      {/* Header Premium */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Control central de suscripciones y tiendas</p>
        </div>
      </div>

      {/* Stats Grid Premium */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 mb-8">
        <StatCard
          title="Usuarios Totales"
          value={stats.totalUsers.toString()}
          icon={Users}
          trend="+12% este mes"
          color="#3b82f6"
          gradient="bg-gradient-to-r from-blue-500 to-cyan-500"
        />
        <StatCard
          title="Tiendas Activas"
          value={stats.totalStores.toString()}
          icon={Store}
          trend="+5 nuevas"
          color="#10b981"
          gradient="bg-gradient-to-r from-emerald-500 to-teal-500"
        />
        <StatCard
          title="Suscripciones"
          value={stats.activeSubscriptions.toString()}
          icon={CreditCard}
          trend="98% retención"
          color="#8b5cf6"
          gradient="bg-gradient-to-r from-violet-500 to-purple-500"
        />
        <StatCard
          title="Órdenes Totales"
          value={stats.totalOrders.toString()}
          icon={ShoppingBag}
          color="#f59e0b"
          gradient="bg-gradient-to-r from-amber-500 to-orange-500"
        />
        <StatCard
          title="Ingresos"
          value={`$${stats.totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend="+23%"
          color="#ef4444"
          gradient="bg-gradient-to-r from-rose-500 to-pink-500"
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="subscriptions" className="space-y-6">
        <TabsList className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg p-1 rounded-xl">
          <TabsTrigger value="subscriptions" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md"><CreditCard className="h-4 w-4 mr-2" />Suscripciones</TabsTrigger>
          <TabsTrigger value="stores" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md"><Store className="h-4 w-4 mr-2" />Tiendas</TabsTrigger>
          <TabsTrigger value="users" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md"><Users className="h-4 w-4 mr-2" />Usuarios</TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md"><TrendingUp className="h-4 w-4 mr-2" />Analíticas</TabsTrigger>
          <TabsTrigger value="config" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md"><Filter className="h-4 w-4 mr-2" />Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions">
          <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <CardHeader className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-gray-800">
              <div>
                <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                  <CreditCard className="h-4 w-4 text-violet-500" />
                  Suscripciones
                </CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400">{filteredSubscriptions.length} registros</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input placeholder="Buscar..." className="pl-9 h-9 w-full md:w-48 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={handleExportSubscriptions} className="h-9 w-9"><Download className="h-4 w-4" /></Button>
                  <Button onClick={() => setShowNewSubscription(true)} className="h-9 gap-1.5 text-sm bg-violet-600 hover:bg-violet-700 text-white"><Plus className="h-4 w-4" />Nueva</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-800 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <th className="px-6 py-3">ID</th>
                      <th className="px-6 py-3">Usuario</th>
                      <th className="px-6 py-3">Plan</th>
                      <th className="px-6 py-3">Estado</th>
                      <th className="px-6 py-3">Precio</th>
                      <th className="px-6 py-3">Vencimiento</th>
                      <th className="px-6 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {filteredSubscriptions.map((sub) => {
                      const subscriber = users.find(u => u.id === sub.userId);
                      return (
                        <tr key={sub.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors text-sm">
                          <td className="px-6 py-4 font-mono text-xs text-gray-400">{sub.id}</td>
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{subscriber?.name || 'N/A'}</td>
                          <td className="px-6 py-4"><PlanBadge plan={sub.plan} /></td>
                          <td className="px-6 py-4"><SubscriptionStatusBadge status={sub.status} /></td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300 font-medium">${sub.price.toFixed(2)}</td>
                          <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{sub.endDate.toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setSelectedSubscription(sub)}>Detalles</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateSubscriptionStatus(sub.id, 'activa')}>Activar</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => updateSubscriptionStatus(sub.id, 'cancelada')}>Cancelar</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteSubscription(sub.id)}>Eliminar</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y dark:divide-gray-800">
                {filteredSubscriptions.map((sub) => {
                  const subscriber = users.find(u => u.id === sub.userId);
                  return (
                    <div key={sub.id} className="p-4 space-y-3 active:bg-gray-50 dark:active:bg-gray-800 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white uppercase">{subscriber?.name || 'N/A'}</p>
                          <p className="text-[10px] font-mono text-gray-400">ID: {sub.id}</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedSubscription(sub)}>Detalles</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateSubscriptionStatus(sub.id, 'activa')}>Activar</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateSubscriptionStatus(sub.id, 'cancelada')}>Cancelar</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteSubscription(sub.id)}>Eliminar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <PlanBadge plan={sub.plan} />
                        <SubscriptionStatusBadge status={sub.status} />
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-500">Vence: {sub.endDate.toLocaleDateString()}</span>
                        <span className="font-bold text-gray-900 dark:text-white">${sub.price.toFixed(2)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stores">
          <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <CardHeader className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-gray-800">
              <div>
                <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                  <Store className="h-4 w-4 text-violet-500" />
                  Tiendas
                </CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400">{filteredStores.length} registradas</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input placeholder="Buscar..." className="pl-9 h-9 w-full md:w-48 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <Button onClick={() => setShowNewStore(true)} className="h-9 gap-1.5 text-sm bg-violet-600 hover:bg-violet-700 text-white"><Plus className="h-4 w-4" />Nueva</Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStores.map((store) => (
                  <Card key={store.id} className="group hover:shadow-md transition-all dark:bg-gray-800/50 dark:border-gray-700">
                    <CardHeader className="p-4 pb-2">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-300 font-bold border dark:border-gray-700">
                          {store.name.charAt(0)}
                        </div>
                        <Badge variant={store.isActive ? 'default' : 'secondary'} className="text-[10px] h-5">{store.isActive ? 'Activa' : 'Inactiva'}</Badge>
                      </div>
                      <CardTitle className="text-sm font-bold mt-2 dark:text-white">{store.name}</CardTitle>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{store.category}</p>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 min-h-[32px] mb-3">{store.description}</p>
                      <div className="space-y-1.5 text-[10px] text-gray-500">
                        <div className="flex items-center"><MapPin className="h-3 w-3 mr-1.5 text-gray-400" />{store.address}</div>
                        <div className="flex items-center"><Mail className="h-3 w-3 mr-1.5 text-gray-400" />{store.email}</div>
                      </div>
                      <div className="flex gap-1.5 mt-4 pt-4 border-t dark:border-gray-700">
                        <Button variant="outline" size="sm" className="flex-1 h-8 text-[10px]" onClick={() => { setEditingStore(store); setShowEditStore(true); }}>
                          <Edit className="h-3 w-3 mr-1" />Editar
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => updateStoreStatus(store.id, !store.isActive)}>
                              {store.isActive ? 'Desactivar' : 'Activar'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteStore(store.id)}>Eliminar</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <CardHeader className="p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b dark:border-gray-800">
              <div>
                <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                  <Users className="h-4 w-4 text-violet-500" />
                  Usuarios
                </CardTitle>
                <p className="text-xs text-gray-500 dark:text-gray-400">{filteredUsers.length} registros</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 md:flex-none">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
                  <Input placeholder="Buscar..." className="pl-9 h-9 w-full md:w-48 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <Button onClick={() => setShowNewUser(true)} className="h-9 gap-1.5 text-sm bg-violet-600 hover:bg-violet-700 text-white"><UserPlus className="h-4 w-4" />Nuevo</Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b dark:border-gray-800 text-left text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      <th className="px-6 py-3">Usuario</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Rol</th>
                      <th className="px-6 py-3">Estado</th>
                      <th className="px-6 py-3">Registro</th>
                      <th className="px-6 py-3 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors text-sm">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full border dark:border-gray-700" />
                            <span className="font-medium text-gray-900 dark:text-white">{user.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                        <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                        <td className="px-6 py-4"><Badge variant={user.isActive ? 'default' : 'secondary'} className="text-[10px]">{user.isActive ? 'Activo' : 'Inactivo'}</Badge></td>
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{user.createdAt.toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => updateUserStatus(user.id, !user.isActive)}>{user.isActive ? 'Desactivar' : 'Activar'}</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id)}>Eliminar</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y dark:divide-gray-800">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="p-4 space-y-3 active:bg-gray-50 dark:active:bg-gray-800 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full border dark:border-gray-700" />
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white uppercase">{user.name}</p>
                          <p className="text-[10px] text-gray-500">{user.email}</p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => updateUserStatus(user.id, !user.isActive)}>{user.isActive ? 'Desactivar' : 'Activar'}</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteUser(user.id)}>Eliminar</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <RoleBadge role={user.role} />
                      <Badge variant={user.isActive ? 'default' : 'secondary'} className="text-[10px]">{user.isActive ? 'Activo' : 'Inactivo'}</Badge>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-gray-500">
                      <span>Registrado: {user.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <CardHeader className="p-4 sm:p-6 pb-2"><CardTitle className="text-sm font-bold dark:text-white">Ingresos Mensuales</CardTitle></CardHeader>
              <CardContent className="h-60 sm:h-72 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs><linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1} /><stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-100 dark:stroke-gray-800" />
                    <XAxis dataKey="month" stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} /><YAxis stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                    <Area type="monotone" dataKey="ingresos" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorIngresos)" name="Ingresos" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <CardHeader className="p-4 sm:p-6 pb-2"><CardTitle className="text-sm font-bold dark:text-white">Distribución por Plan</CardTitle></CardHeader>
              <CardContent className="h-60 sm:h-72 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={planDistributionData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value">
                      {planDistributionData.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.color} />))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm">
              <CardHeader className="p-4 sm:p-6 pb-2"><CardTitle className="text-sm font-bold dark:text-white">Órdenes Esta Semana</CardTitle></CardHeader>
              <CardContent className="h-60 sm:h-72 p-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyOrdersData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-gray-100 dark:stroke-gray-800" />
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} /><YAxis stroke="#9ca3af" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '10px' }} />
                    <Bar dataKey="ordenes" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={32} name="Órdenes" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="config">
          <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <CardHeader className="p-4 sm:p-6 border-b dark:border-gray-800">
              <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                <Filter className="h-4 w-4 text-violet-500" />
                Configuración de Planes
              </CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400">Modifica precios y límites globales del sistema</p>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {(Object.keys(planLimits) as Array<SubscriptionPlan>).map((planKey) => (
                  <div key={planKey} className="p-4 rounded-xl border dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/20 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs text-white font-bold ${planKey === 'free' ? 'bg-gray-400' :
                          planKey === 'basico' ? 'bg-blue-500' :
                            planKey === 'profesional' ? 'bg-purple-500' : 'bg-amber-500'
                          }`}>
                          {planKey.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-sm capitalize dark:text-white">{planKey}</span>
                      </div>
                      <Badge variant="outline" className="text-[10px] h-5">${planLimits[planKey].price}/mes</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-gray-400">Precio ($)</Label>
                        <Input type="number" value={planLimits[planKey].price} className="h-8 text-xs bg-white dark:bg-gray-900"
                          onChange={(e) => updatePlanLimits(planKey, { price: parseFloat(e.target.value) || 0 })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-gray-400">Ventas/mes</Label>
                        <Input type="number" value={planLimits[planKey].maxSalesPerMonth} className="h-8 text-xs bg-white dark:bg-gray-900"
                          onChange={(e) => updatePlanLimits(planKey, { maxSalesPerMonth: parseInt(e.target.value) || -1 })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-gray-400">Max Prod.</Label>
                        <Input type="number" value={planLimits[planKey].maxProducts} className="h-8 text-xs bg-white dark:bg-gray-900"
                          onChange={(e) => updatePlanLimits(planKey, { maxProducts: parseInt(e.target.value) || -1 })} />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] uppercase font-bold text-gray-400">Max Tiendas</Label>
                        <Input type="number" value={planLimits[planKey].maxStores} className="h-8 text-xs bg-white dark:bg-gray-900"
                          onChange={(e) => updatePlanLimits(planKey, { maxStores: parseInt(e.target.value) || 1 })} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end pt-4">
                <Button onClick={() => toast.success('Configuración de planes guardada')} className="bg-violet-600 hover:bg-violet-700 text-white text-xs h-9">
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal: Nueva Suscripción */}
      <Dialog open={showNewSubscription} onOpenChange={setShowNewSubscription}>
        <DialogContent className="dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Nueva Suscripción</DialogTitle>
            <DialogDescription>Crea una nueva suscripción para un usuario</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Usuario</Label>
              <Select value={newSubForm.userId} onValueChange={(v) => setNewSubForm(p => ({ ...p, userId: v }))}>
                <SelectTrigger className="dark:bg-gray-700"><SelectValue placeholder="Seleccionar usuario" /></SelectTrigger>
                <SelectContent className="dark:bg-gray-800">
                  {users.filter(u => u.role !== 'admin').map(u => (<SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Plan</Label>
              <Select value={newSubForm.plan} onValueChange={(v: SubscriptionPlan) => setNewSubForm(p => ({ ...p, plan: v }))}>
                <SelectTrigger className="dark:bg-gray-700"><SelectValue /></SelectTrigger>
                <SelectContent className="dark:bg-gray-800">
                  <SelectItem value="free">Gratis - $0/mes</SelectItem>
                  <SelectItem value="basico">Básico - ${planLimits.basico.price}/mes</SelectItem>
                  <SelectItem value="profesional">Profesional - ${planLimits.profesional.price}/mes</SelectItem>
                  <SelectItem value="empresarial">Empresarial - ${planLimits.empresarial.price}/mes</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Duración (meses)</Label>
              <Select value={newSubForm.months.toString()} onValueChange={(v) => setNewSubForm(p => ({ ...p, months: parseInt(v) }))}>
                <SelectTrigger className="dark:bg-gray-700"><SelectValue /></SelectTrigger>
                <SelectContent className="dark:bg-gray-800">
                  <SelectItem value="1">1 mes</SelectItem><SelectItem value="3">3 meses</SelectItem>
                  <SelectItem value="6">6 meses</SelectItem><SelectItem value="12">12 meses</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewSubscription(false)}>Cancelar</Button>
            <Button onClick={handleCreateSubscription}>Crear Suscripción</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Nueva Tienda */}
      <Dialog open={showNewStore} onOpenChange={setShowNewStore}>
        <DialogContent className="dark:bg-gray-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Nueva Tienda</DialogTitle>
            <DialogDescription>Registra una nueva tienda en la plataforma</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
            {/* Toggle crear nuevo usuario */}
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <Label className="font-medium">Crear nuevo usuario</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Genera credenciales para el dueño de la tienda</p>
              </div>
              <Switch checked={newStoreForm.createNewUser} onCheckedChange={(c) => setNewStoreForm(p => ({ ...p, createNewUser: c }))} />
            </div>

            {/* Datos del propietario (solo si crea nuevo) */}
            {newStoreForm.createNewUser && (
              <div className="space-y-3 p-3 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Datos del propietario</p>
                <div><Label>Nombre del propietario *</Label><Input value={newStoreForm.ownerName} onChange={(e) => setNewStoreForm(p => ({ ...p, ownerName: e.target.value }))} placeholder="Juan Pérez" className="dark:bg-gray-700" /></div>
                <div>
                  <Label>Contraseña *</Label>
                  <div className="flex gap-2">
                    <Input value={newStoreForm.password} onChange={(e) => setNewStoreForm(p => ({ ...p, password: e.target.value }))} placeholder="Ingresa o genera una contraseña" className="dark:bg-gray-700" />
                    <Button type="button" variant="outline" size="sm" onClick={() => setNewStoreForm(p => ({ ...p, password: generatePassword() }))}>Generar</Button>
                  </div>
                </div>
              </div>
            )}

            {/* Propietario existente (si no crea nuevo) */}
            {!newStoreForm.createNewUser && (
              <div>
                <Label>Propietario existente</Label>
                <Select value={newStoreForm.ownerId} onValueChange={(v) => setNewStoreForm(p => ({ ...p, ownerId: v }))}>
                  <SelectTrigger className="dark:bg-gray-700"><SelectValue placeholder="Seleccionar propietario" /></SelectTrigger>
                  <SelectContent className="dark:bg-gray-800">
                    {users.filter(u => u.role === 'tienda').map(u => (<SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Datos de la tienda */}
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Nombre tienda *</Label><Input value={newStoreForm.name} onChange={(e) => setNewStoreForm(p => ({ ...p, name: e.target.value }))} className="dark:bg-gray-700" /></div>
              <div><Label>Categoría</Label><Input value={newStoreForm.category} onChange={(e) => setNewStoreForm(p => ({ ...p, category: e.target.value }))} placeholder="Tecnología, Moda..." className="dark:bg-gray-700" /></div>
            </div>
            <div><Label>Descripción</Label><Textarea value={newStoreForm.description} onChange={(e) => setNewStoreForm(p => ({ ...p, description: e.target.value }))} className="dark:bg-gray-700" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Email *</Label><Input type="email" value={newStoreForm.email} onChange={(e) => setNewStoreForm(p => ({ ...p, email: e.target.value }))} className="dark:bg-gray-700" /></div>
              <div><Label>Teléfono</Label><Input value={newStoreForm.phone} onChange={(e) => setNewStoreForm(p => ({ ...p, phone: e.target.value }))} className="dark:bg-gray-700" /></div>
            </div>
            <div><Label>Dirección</Label><Input value={newStoreForm.address} onChange={(e) => setNewStoreForm(p => ({ ...p, address: e.target.value }))} className="dark:bg-gray-700" /></div>

            {/* Plan de suscripción */}
            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <Label className="font-medium">Plan de suscripción</Label>
              <Select value={newStoreForm.plan} onValueChange={(v: SubscriptionPlan) => setNewStoreForm(p => ({ ...p, plan: v }))}>
                <SelectTrigger className="dark:bg-gray-700 mt-2"><SelectValue /></SelectTrigger>
                <SelectContent className="dark:bg-gray-800">
                  <SelectItem value="free">Gratis - $0/mes (5 ventas)</SelectItem>
                  <SelectItem value="basico">Básico - ${planLimits.basico.price}/mes (50 ventas)</SelectItem>
                  <SelectItem value="profesional">Profesional - ${planLimits.profesional.price}/mes (500 ventas)</SelectItem>
                  <SelectItem value="empresarial">Empresarial - ${planLimits.empresarial.price}/mes (Ilimitado)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Switch checked={newStoreForm.isActive} onCheckedChange={(c) => setNewStoreForm(p => ({ ...p, isActive: c }))} />
              <Label>Tienda activa</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewStore(false)}>Cancelar</Button>
            <Button onClick={handleCreateStore}>Crear Tienda</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar Tienda */}
      <Dialog open={showEditStore} onOpenChange={setShowEditStore}>
        <DialogContent className="dark:bg-gray-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Editar Tienda</DialogTitle>
          </DialogHeader>
          {editingStore && (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Nombre</Label><Input value={editingStore.name} onChange={(e) => setEditingStore(p => p ? { ...p, name: e.target.value } : null)} className="dark:bg-gray-700" /></div>
                <div><Label>Categoría</Label><Input value={editingStore.category} onChange={(e) => setEditingStore(p => p ? { ...p, category: e.target.value } : null)} className="dark:bg-gray-700" /></div>
              </div>
              <div><Label>Descripción</Label><Textarea value={editingStore.description} onChange={(e) => setEditingStore(p => p ? { ...p, description: e.target.value } : null)} className="dark:bg-gray-700" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Email</Label><Input type="email" value={editingStore.email} onChange={(e) => setEditingStore(p => p ? { ...p, email: e.target.value } : null)} className="dark:bg-gray-700" /></div>
                <div><Label>Teléfono</Label><Input value={editingStore.phone} onChange={(e) => setEditingStore(p => p ? { ...p, phone: e.target.value } : null)} className="dark:bg-gray-700" /></div>
              </div>
              <div><Label>Dirección</Label><Input value={editingStore.address} onChange={(e) => setEditingStore(p => p ? { ...p, address: e.target.value } : null)} className="dark:bg-gray-700" /></div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditStore(false)}>Cancelar</Button>
            <Button onClick={handleEditStore}>Guardar Cambios</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Nuevo Usuario */}
      <Dialog open={showNewUser} onOpenChange={setShowNewUser}>
        <DialogContent className="dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="dark:text-white">Nuevo Usuario</DialogTitle>
            <DialogDescription>Registra un nuevo usuario en la plataforma</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div><Label>Nombre *</Label><Input value={newUserForm.name} onChange={(e) => setNewUserForm(p => ({ ...p, name: e.target.value }))} className="dark:bg-gray-700" /></div>
            <div><Label>Email *</Label><Input type="email" value={newUserForm.email} onChange={(e) => setNewUserForm(p => ({ ...p, email: e.target.value }))} className="dark:bg-gray-700" /></div>
            <div>
              <Label>Rol</Label>
              <Select value={newUserForm.role} onValueChange={(v: UserRole) => setNewUserForm(p => ({ ...p, role: v }))}>
                <SelectTrigger className="dark:bg-gray-700"><SelectValue /></SelectTrigger>
                <SelectContent className="dark:bg-gray-800">
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="tienda">Dueño de Tienda</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={newUserForm.isActive} onCheckedChange={(c) => setNewUserForm(p => ({ ...p, isActive: c }))} />
              <Label>Usuario activo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewUser(false)}>Cancelar</Button>
            <Button onClick={handleCreateUser}>Crear Usuario</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal: Detalle Suscripción */}
      <Dialog open={!!selectedSubscription} onOpenChange={() => setSelectedSubscription(null)}>
        <DialogContent className="dark:bg-gray-800">
          <DialogHeader><DialogTitle className="dark:text-white">Detalles de Suscripción</DialogTitle></DialogHeader>
          {selectedSubscription && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><Label className="text-gray-500">ID</Label><p className="font-mono text-sm dark:text-gray-300">{selectedSubscription.id}</p></div>
                <div><Label className="text-gray-500">Plan</Label><p><PlanBadge plan={selectedSubscription.plan} /></p></div>
                <div><Label className="text-gray-500">Estado</Label><p><SubscriptionStatusBadge status={selectedSubscription.status} /></p></div>
                <div><Label className="text-gray-500">Precio</Label><p className="text-lg font-semibold dark:text-white">${selectedSubscription.price.toFixed(2)}/mes</p></div>
                <div><Label className="text-gray-500">Inicio</Label><p className="dark:text-gray-300">{selectedSubscription.startDate.toLocaleDateString()}</p></div>
                <div><Label className="text-gray-500">Vencimiento</Label><p className="dark:text-gray-300">{selectedSubscription.endDate.toLocaleDateString()}</p></div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
