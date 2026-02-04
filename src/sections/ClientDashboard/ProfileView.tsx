
import { useState, useCallback } from 'react';
import { MapPin, Settings, Loader2, Navigation, Search, X, Star } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { searchAddresses, getCurrentPosition, reverseGeocode } from '@/lib/geo';
import type { GeoLocation, User } from '@/types';

interface ProfileViewProps {
    user: User | null;
    userLocation: GeoLocation | null;
    onUpdateLocation: (location: GeoLocation | null) => void;
}

export function ProfileView({ user, userLocation, onUpdateLocation }: ProfileViewProps) {
    const [addressSearch, setAddressSearch] = useState('');
    const [addressResults, setAddressResults] = useState<GeoLocation[]>([]); // Keeps track of results if we want to show a list later
    const [isSearchingAddress, setIsSearchingAddress] = useState(false);
    const [isGettingLocation, setIsGettingLocation] = useState(false);

    const handleAddressSearch = useCallback(async (query: string) => {
        setAddressSearch(query);
        if (query.length < 3) {
            setAddressResults([]);
            return;
        }
        setIsSearchingAddress(true);
        try {
            const results = await searchAddresses(query, 'ar');
            setAddressResults(results);
        } catch (error) {
            console.error('Error searching addresses:', error);
        } finally {
            setIsSearchingAddress(false);
        }
    }, []);

    const handleGetCurrentLocation = async () => {
        setIsGettingLocation(true);
        try {
            const coords = await getCurrentPosition();
            const location = await reverseGeocode(coords.lat, coords.lng);
            if (location) {
                onUpdateLocation(location);
                toast.success('Ubicación detectada');
            } else {
                toast.error('No se pudo obtener la dirección');
            }
        } catch (error: any) {
            toast.error(error.message || 'Error al obtener ubicación');
        } finally {
            setIsGettingLocation(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center sm:text-left">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">Mi Perfil</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Gestiona tu información y preferencias</p>
            </div>

            <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden rounded-2xl">
                <CardHeader className="p-4 sm:p-6 pb-0">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <div className="relative">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full border-2 border-violet-100 dark:border-violet-900" />
                            ) : (
                                <div className="w-16 h-16 rounded-full border-2 border-violet-100 dark:border-violet-900 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-2xl font-bold text-gray-500">
                                    {user?.name?.[0] || 'U'}
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 p-1 bg-violet-600 rounded-full border-2 border-white dark:border-gray-900">
                                <Star className="h-2.5 w-2.5 text-white fill-white" />
                            </div>
                        </div>
                        <div className="text-center sm:text-left">
                            <h3 className="text-lg font-bold dark:text-white">{user?.name}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Nombre</Label>
                            <Input defaultValue={user?.name} className="h-9 text-sm bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800" />
                        </div>
                        <div className="space-y-1">
                            <Label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Teléfono</Label>
                            <Input placeholder="+54 11 1234 5678" className="h-9 text-sm bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800" />
                        </div>
                    </div>
                    <Button className="w-full sm:w-auto bg-violet-600 hover:bg-violet-700 text-white font-bold h-9 px-6 rounded-xl" onClick={() => toast.success('Perfil actualizado')}>
                        Guardar Cambios
                    </Button>
                </CardContent>
            </Card>

            {/* Location Card - More Compact */}
            <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden rounded-2xl">
                <CardHeader className="p-4 sm:p-6 border-b dark:border-gray-800">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 dark:text-white">
                        <MapPin className="h-4 w-4 text-violet-500" /> Mi Ubicación
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                    {userLocation && (
                        <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/30 flex items-center gap-3">
                            <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                                <MapPin className="h-4 w-4 text-violet-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold dark:text-white truncate">{userLocation.locality || 'Seleccionada'}</p>
                                <p className="text-[10px] text-gray-500 truncate">{userLocation.address}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => onUpdateLocation(null)} className="h-8 w-8 text-gray-400">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    )}

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar dirección..."
                            value={addressSearch}
                            onChange={(e) => handleAddressSearch(e.target.value)}
                            className="pl-10 h-10 text-sm bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-800 rounded-xl"
                        />
                        {/* Address results list could be shown here if searching */}
                    </div>

                    <Button
                        variant="outline"
                        className="w-full h-10 gap-2 border-gray-100 dark:border-gray-800 rounded-xl text-xs font-bold"
                        onClick={handleGetCurrentLocation}
                        disabled={isGettingLocation}
                    >
                        {isGettingLocation ? <Loader2 className="h-4 w-4 animate-spin text-violet-600" /> : <Navigation className="h-4 w-4 text-violet-600" />}
                        Usar ubicación actual
                    </Button>
                </CardContent>
            </Card>

            {/* Preferences */}
            <Card className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden rounded-2xl">
                <CardHeader className="p-4 sm:p-6 border-b dark:border-gray-800">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 dark:text-white">
                        <Settings className="h-4 w-4 text-violet-500" /> Preferencias
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6 space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold dark:text-white">Notificaciones por email</p>
                            <p className="text-[10px] text-gray-500">Actualizaciones de pedidos</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold dark:text-white">Ofertas y promociones</p>
                            <p className="text-[10px] text-gray-500">Descuentos exclusivos</p>
                        </div>
                        <Switch defaultChecked />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
