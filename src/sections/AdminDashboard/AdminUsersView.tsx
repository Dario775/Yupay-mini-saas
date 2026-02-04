
import { useState } from 'react';
import { Users, Search, UserPlus, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
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
import type { User, UserRole } from '@/types';
import { toast } from 'sonner';

interface AdminUsersViewProps {
    users: User[];
    addUser: (data: any) => User;
    updateUserStatus: (id: string, isActive: boolean) => void;
    deleteUser: (id: string) => void;
}

export function RoleBadge({ role }: { role: UserRole }) {
    const styles = {
        admin: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
        cliente: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
        tienda: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    };
    const labels = { admin: 'Admin', cliente: 'Cliente', tienda: 'Tienda' };
    return <Badge className={styles[role]}>{labels[role]}</Badge>;
}

export function AdminUsersView({
    users,
    addUser,
    updateUserStatus,
    deleteUser
}: AdminUsersViewProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showNewUser, setShowNewUser] = useState(false);
    const [newUserForm, setNewUserForm] = useState({ name: '', email: '', role: 'cliente' as UserRole, isActive: true });

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateUser = () => {
        if (!newUserForm.name || !newUserForm.email) {
            toast.error('Nombre y Email son requeridos');
            return;
        }
        addUser(newUserForm);
        setShowNewUser(false);
        setNewUserForm({ name: '', email: '', role: 'cliente', isActive: true });
        toast.success('Usuario creado exitosamente');
    };

    return (
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
                                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-500 border dark:border-gray-700 overflow-hidden">
                                                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                                            </div>
                                            <span className="font-bold text-gray-900 dark:text-white uppercase">{user.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{user.email}</td>
                                    <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                                    <td className="px-6 py-4"><Badge variant={user.isActive ? 'default' : 'secondary'} className="text-[10px]">{user.isActive ? 'Activo' : 'Inactivo'}</Badge></td>
                                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="px-6 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => updateUserStatus(user.id, !user.isActive)}>{user.isActive ? 'Desactivar' : 'Activar'}</DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600" onClick={() => deleteUser(user.id)}>Eliminar</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="md:hidden divide-y dark:divide-gray-800">
                    {filteredUsers.map((user) => (
                        <div key={user.id} className="p-4 space-y-3 active:bg-gray-50 dark:active:bg-gray-800 transition-colors">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-gray-500 border dark:border-gray-700 overflow-hidden">
                                        {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : user.name.charAt(0)}
                                    </div>
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
                                        <DropdownMenuItem className="text-red-600" onClick={() => deleteUser(user.id)}>Eliminar</DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <RoleBadge role={user.role} />
                                <Badge variant={user.isActive ? 'default' : 'secondary'} className="text-[10px]">{user.isActive ? 'Activo' : 'Inactivo'}</Badge>
                            </div>
                            <div className="flex justify-between items-center text-[10px] text-gray-500">
                                <span>Registrado: {new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>

            <Dialog open={showNewUser} onOpenChange={setShowNewUser}>
                <DialogContent className="dark:bg-gray-800">
                    <DialogHeader><DialogTitle className="dark:text-white">Nuevo Usuario</DialogTitle><DialogDescription>Crea un nuevo usuario en el sistema</DialogDescription></DialogHeader>
                    <div className="space-y-4">
                        <div className="space-y-2"><Label>Nombre Completo</Label><Input value={newUserForm.name} onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })} className="dark:bg-gray-700" /></div>
                        <div className="space-y-2"><Label>Email</Label><Input value={newUserForm.email} onChange={(e) => setNewUserForm({ ...newUserForm, email: e.target.value })} className="dark:bg-gray-700" /></div>
                        <div className="space-y-2">
                            <Label>Rol</Label>
                            <Select value={newUserForm.role} onValueChange={(v: UserRole) => setNewUserForm({ ...newUserForm, role: v })}>
                                <SelectTrigger className="dark:bg-gray-700"><SelectValue /></SelectTrigger>
                                <SelectContent className="dark:bg-gray-800">
                                    <SelectItem value="cliente">Cliente</SelectItem>
                                    <SelectItem value="tienda">Tienda / Propietario</SelectItem>
                                    <SelectItem value="admin">Administrador</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter><Button variant="outline" onClick={() => setShowNewUser(false)}>Cancelar</Button><Button onClick={handleCreateUser}>Crear Usuario</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </Card>
    );
}
