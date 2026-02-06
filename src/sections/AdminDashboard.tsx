
import {
  Users,
  Store,
  CreditCard,
  TrendingUp,
  Filter,
  DollarSign,
  ShoppingBag,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdminData } from '@/hooks/useData';
import { formatPrice } from '@/utils/format';
import { exportToCSV } from '@/utils/export';
import { toast } from 'sonner';

import { StatCard } from '@/components/StatCard';
import { SubscriptionsView } from './AdminDashboard/SubscriptionsView';
import { AdminStoresView } from './AdminDashboard/AdminStoresView';
import { AdminUsersView } from './AdminDashboard/AdminUsersView';
import { SystemAnalyticsView } from './AdminDashboard/SystemAnalyticsView';
import { PlanConfigView } from './AdminDashboard/PlanConfigView';

export default function AdminDashboard() {
  const {
    stats, subscriptions, stores, users, planLimits,
    addSubscription, updateSubscriptionStatus, deleteSubscription,
    addStore, updateStore, updateStoreStatus, deleteStore,
    addUser, updateUserStatus, deleteUser,
    updatePlanLimits
  } = useAdminData();

  const handleExportSubscriptions = () => {
    exportToCSV(subscriptions.map(s => ({
      id: s.id, plan: s.plan, estado: s.status, precio: formatPrice(s.price),
      inicio: s.startDate.toLocaleDateString(), vencimiento: s.endDate.toLocaleDateString(),
      autoRenov: s.autoRenew ? 'Sí' : 'No',
    })), 'suscripciones', [
      { key: 'id', label: 'ID' }, { key: 'plan', label: 'Plan' }, { key: 'estado', label: 'Estado' },
      { key: 'precio', label: 'Precio' }, { key: 'inicio', label: 'Inicio' }, { key: 'vencimiento', label: 'Vencimiento' },
      { key: 'autoRenov', label: 'Auto Renovación' },
    ]);
    toast.success('Suscripciones exportadas');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-gray-900 dark:via-gray-900 dark:to-gray-950 p-2 sm:p-4 md:p-6 transition-colors duration-300">
      {/* Header Premium */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Panel de Administración</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Control central de suscripciones y tiendas</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-6 mb-8">
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
          value={formatPrice(stats.totalRevenue)}
          icon={DollarSign}
          trend="+23%"
          color="#ef4444"
          gradient="bg-gradient-to-r from-rose-500 to-pink-500"
        />
      </div>

      {/* Main Content */}
      <Tabs defaultValue="subscriptions" className="space-y-6">
        <TabsList className="flex w-full overflow-x-auto scrollbar-hide bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg p-1 rounded-xl justify-start sm:justify-center">
          <TabsTrigger value="subscriptions" className="flex-none sm:flex-1 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md px-4 sm:px-3 text-xs sm:text-sm"><CreditCard className="h-4 w-4 mr-2" />Suscripciones</TabsTrigger>
          <TabsTrigger value="stores" className="flex-none sm:flex-1 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md px-4 sm:px-3 text-xs sm:text-sm"><Store className="h-4 w-4 mr-2" />Tiendas</TabsTrigger>
          <TabsTrigger value="users" className="flex-none sm:flex-1 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md px-4 sm:px-3 text-xs sm:text-sm"><Users className="h-4 w-4 mr-2" />Usuarios</TabsTrigger>
          <TabsTrigger value="analytics" className="flex-none sm:flex-1 rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md px-4 sm:px-3 text-xs sm:text-sm"><TrendingUp className="h-4 w-4 mr-2" />Analíticas</TabsTrigger>
        </TabsList>

        <TabsContent value="subscriptions" className="space-y-6">
          <PlanConfigView
            planLimits={planLimits}
            updatePlanLimits={updatePlanLimits}
          />
          <SubscriptionsView
            subscriptions={subscriptions}
            users={users}
            planLimits={planLimits}
            addSubscription={addSubscription}
            updateSubscriptionStatus={updateSubscriptionStatus}
            deleteSubscription={deleteSubscription}
            handleExportSubscriptions={handleExportSubscriptions}
          />
        </TabsContent>

        <TabsContent value="stores">
          <AdminStoresView
            stores={stores}
            users={users}
            addStore={addStore}
            updateStore={updateStore}
            updateStoreStatus={updateStoreStatus}
            deleteStore={deleteStore}
            addUser={addUser}
            addSubscription={addSubscription}
            planLimits={planLimits}
          />
        </TabsContent>

        <TabsContent value="users">
          <AdminUsersView
            users={users}
            addUser={addUser}
            updateUserStatus={updateUserStatus}
            deleteUser={deleteUser}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <SystemAnalyticsView />
        </TabsContent>


      </Tabs>

      <div className="mt-8 text-center text-xs text-slate-400 dark:text-slate-600">
        Yupay v0.1.0 — <span className="opacity-75">Neurocortex</span>
      </div>
    </div>
  );
}
