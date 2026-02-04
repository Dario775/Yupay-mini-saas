
import { useState } from 'react';
import { Store, Search, Plus, MapPin, Mail, Edit, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { formatPrice } from '@/utils/format';
import type { Store as StoreType, User, SubscriptionPlan } from '@/types';
import { toast } from 'sonner';

interface AdminStoresViewProps {
    stores: StoreType[];
    users: User[];
    addStore: (data: any) => StoreType;
    updateStore: (id: string, updates: Partial<StoreType>) => void;
    updateStoreStatus: (id: string, isActive: boolean) => void;
    deleteStore: (id: string) => void;
    addUser: (data: any) => User;
    addSubscription: (data: any) => void;
    planLimits: Record<SubscriptionPlan, any>;
}

export function AdminStoresView({
    stores,
    users,
    addStore,
    updateStore,
    updateStoreStatus,
    deleteStore,
    addUser,
    addSubscription,
    planLimits
}: AdminStoresViewProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewStore, setShowNewStore] = useState(false);
    const [showEditStore, setShowEditStore] = useState(false);
    const [editingStore, setEditingStore] = useState<StoreType | null>(null);
    const [newStoreForm, setNewStoreForm] = useState({
        name: '', description: '', category: '', address: '', phone: '', email: '', ownerId: '', isActive: true,
        createNewUser: true, ownerName: '', password: '', plan: 'profesional' as SubscriptionPlan,
    });

    const filteredStores = stores.filter(store =>
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        store.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const generatePassword = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        let password = '';
        for (let i = 0; i < 8; i++) password += chars.charAt(Math.floor(Math.random() * chars.length));
        return password;
    };

    const handleCreateStore = () => {
        if (!newStoreForm.name || !newStoreForm.email) {
            toast.error('Nombre y Email son requeridos');
            return;
        }

        let ownerId = newStoreForm.ownerId;
        if (newStoreForm.createNewUser) {
            if (!newStoreForm.ownerName || !newStoreForm.password) {
                toast.error('Nombre de propietario y contraseña son requeridos');
                return;
            }
            const newUser = addUser({ name: newStoreForm.ownerName, email: newStoreForm.email, role: 'tienda', isActive: true });
            ownerId = newUser.id;
            toast.success(`Usuario creado: ${newStoreForm.email} / ${newStoreForm.password}`, { duration: 10000 });
        }

        const newStore = addStore({ ...newStoreForm, ownerId });
        addSubscription({ userId: ownerId, storeId: newStore.id, plan: newStoreForm.plan, months: 12 });

        toast.success('Tienda creada exitosamente');
        setShowNewStore(false);
        setNewStoreForm({
            name: '', description: '', category: '', address: '', phone: '', email: '', ownerId: '', isActive: true,
            createNewUser: true, ownerName: '', password: '', plan: 'profesional',
        });
    };

    const handleEditStoreSubmit = () => {
        if (!editingStore) return;
        updateStore(editingStore.id, editingStore);
        setShowEditStore(false);
        setEditingStore(null);
        toast.success('Tienda actualizada');
    };

    return (
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
                                            <DropdownMenuItem className="text-red-600" onClick={() => deleteStore(store.id)}>Eliminar</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </CardContent>

            <Dialog open={showNewStore} onOpenChange={setShowNewStore}>
                <DialogContent className="max-w-md dark:bg-gray-800">
                    <DialogHeader><DialogTitle className="dark:text-white">Nueva Tienda</DialogTitle><DialogDescription>Configura un nuevo comercio en la plataforma</DialogDescription></DialogHeader>
                    <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1">
                        <div className="space-y-2"><Label>Nombre de la Tienda *</Label><Input value={newStoreForm.name} onChange={(e) => setNewStoreForm({ ...newStoreForm, name: e.target.value })} placeholder="Ej: Mi Tienda Gamer" className="dark:bg-gray-700" /></div>
                        <div className="space-y-2"><Label>Email de contacto *</Label><Input value={newStoreForm.email} onChange={(e) => setNewStoreForm({ ...newStoreForm, email: e.target.value })} placeholder="email@tienda.com" className="dark:bg-gray-700" /></div>
                        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <Switch checked={newStoreForm.createNewUser} onCheckedChange={(c) => setNewStoreForm({ ...newStoreForm, createNewUser: c })} />
                            <Label>¿Crear nuevo usuario propietario?</Label>
                        </div>
                        {newStoreForm.createNewUser ? (
                            <div className="p-3 border dark:border-gray-700 rounded-lg space-y-3">
                                <div className="space-y-1"><Label className="text-xs">Nombre Completo</Label><Input value={newStoreForm.ownerName} onChange={(e) => setNewStoreForm({ ...newStoreForm, ownerName: e.target.value })} className="h-8 text-xs dark:bg-gray-700" /></div>
                                <div className="space-y-1"><Label className="text-xs">Contraseña Temporal</Label><div className="flex gap-2"><Input value={newStoreForm.password} onChange={(e) => setNewStoreForm({ ...newStoreForm, password: e.target.value })} className="h-8 text-xs dark:bg-gray-700" /><Button size="sm" variant="outline" className="h-8 text-[10px]" onClick={() => setNewStoreForm({ ...newStoreForm, password: generatePassword() })}>Generar</Button></div></div>
                            </div>
                        ) : (
                            <div className="space-y-2"><Label>Propietario Existente</Label><Select value={newStoreForm.ownerId} onValueChange={(v) => setNewStoreForm({ ...newStoreForm, ownerId: v })}><SelectTrigger className="dark:bg-gray-700"><SelectValue placeholder="Seleccionar" /></SelectTrigger><SelectContent className="dark:bg-gray-800">{users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}</SelectContent></Select></div>
                        )}
                        <div className="space-y-2"><Label>Plan de Suscripción Inicial</Label><Select value={newStoreForm.plan} onValueChange={(v: SubscriptionPlan) => setNewStoreForm({ ...newStoreForm, plan: v })}><SelectTrigger className="dark:bg-gray-700"><SelectValue /></SelectTrigger><SelectContent className="dark:bg-gray-800"><SelectItem value="basico">Básico ({formatPrice(planLimits.basico.price)})</SelectItem><SelectItem value="profesional">Profesional ({formatPrice(planLimits.profesional.price)})</SelectItem><SelectItem value="empresarial">Empresarial ({formatPrice(planLimits.empresarial.price)})</SelectItem></SelectContent></Select></div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setShowNewStore(false)}>Cancelar</Button><Button onClick={handleCreateStore}>Crear Tienda</Button></DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={!!editingStore} onOpenChange={() => setEditingStore(null)}>
                <DialogContent className="dark:bg-gray-800">
                    <DialogHeader><DialogTitle className="dark:text-white">Editar Tienda</DialogTitle></DialogHeader>
                    {editingStore && (
                        <div className="space-y-4">
                            <div className="space-y-2"><Label>Nombre</Label><Input value={editingStore.name} onChange={(e) => setEditingStore({ ...editingStore, name: e.target.value })} className="dark:bg-gray-700" /></div>
                            <div className="space-y-2"><Label>Descripción</Label><Textarea value={editingStore.description} onChange={(e) => setEditingStore({ ...editingStore, description: e.target.value })} rows={3} className="dark:bg-gray-700" /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2"><Label>Categoría</Label><Input value={editingStore.category} onChange={(e) => setEditingStore({ ...editingStore, category: e.target.value })} className="dark:bg-gray-700" /></div>
                                <div className="space-y-2"><Label>Email</Label><Input value={editingStore.email} onChange={(e) => setEditingStore({ ...editingStore, email: e.target.value })} className="dark:bg-gray-700" /></div>
                            </div>
                        </div>
                    )}
                    <DialogFooter><Button variant="outline" onClick={() => setEditingStore(null)}>Cancelar</Button><Button onClick={handleEditStoreSubmit}>Guardar</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
