// Utilidades de geocodificación usando OpenStreetMap Nominatim
import type { GeoLocation, Store } from '@/types';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

/**
 * Geocodifica una dirección usando la API de Nominatim (OpenStreetMap)
 * @param address Dirección a geocodificar
 * @returns GeoLocation o null si no se encuentra
 */
export async function geocodeAddress(address: string): Promise<GeoLocation | null> {
    try {
        const response = await fetch(
            `${NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(address)}&limit=1&addressdetails=1`,
            {
                headers: {
                    'Accept-Language': 'es',
                    'User-Agent': 'Yupay/1.0'
                }
            }
        );

        if (!response.ok) return null;

        const data = await response.json();
        if (!data || data.length === 0) return null;

        const result = data[0];
        const addr = result.address || {};

        return {
            lat: parseFloat(result.lat),
            lng: parseFloat(result.lon),
            address: result.display_name,
            locality: addr.city || addr.town || addr.village || addr.municipality,
            province: addr.state || addr.province
        };
    } catch (error) {
        console.error('Error geocoding address:', error);
        return null;
    }
}

/**
 * Busca direcciones para autocompletado
 * @param query Texto de búsqueda
 * @param country Código de país (ej: 'ar' para Argentina)
 * @returns Array de sugerencias de direcciones
 */
export async function searchAddresses(query: string, country: string = 'ar'): Promise<GeoLocation[]> {
    if (query.length < 3) return [];

    try {
        const response = await fetch(
            `${NOMINATIM_URL}/search?format=json&q=${encodeURIComponent(query)}&countrycodes=${country}&limit=5&addressdetails=1`,
            {
                headers: {
                    'Accept-Language': 'es',
                    'User-Agent': 'Yupay/1.0'
                }
            }
        );

        if (!response.ok) return [];

        const data = await response.json();

        return data.map((result: any) => {
            const addr = result.address || {};
            return {
                lat: parseFloat(result.lat),
                lng: parseFloat(result.lon),
                address: result.display_name,
                locality: addr.city || addr.town || addr.village || addr.municipality,
                province: addr.state || addr.province
            };
        });
    } catch (error) {
        console.error('Error searching addresses:', error);
        return [];
    }
}

/**
 * Calcula la distancia entre dos puntos usando la fórmula Haversine
 * @returns Distancia en kilómetros
 */
export function calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}

/**
 * Filtra tiendas por distancia desde la ubicación del usuario
 * @param stores Lista de tiendas
 * @param userLocation Ubicación del usuario
 * @param radiusKm Radio de búsqueda en km (0 = solo misma localidad)
 * @returns Tiendas filtradas con distancia calculada
 */
export function filterStoresByDistance(
    stores: Store[],
    userLocation: GeoLocation,
    radiusKm: number
): Array<Store & { distance: number }> {
    const storesWithDistance = stores
        .filter(store => store.location) // Solo tiendas con ubicación
        .map(store => {
            const distance = calculateDistance(
                userLocation.lat,
                userLocation.lng,
                store.location!.lat,
                store.location!.lng
            );
            return { ...store, distance };
        });

    // Si radio es 0, filtrar solo por misma localidad
    if (radiusKm === 0) {
        return storesWithDistance.filter(
            store => store.location?.locality?.toLowerCase() === userLocation.locality?.toLowerCase()
        );
    }

    // Filtrar por radio en km
    return storesWithDistance
        .filter(store => store.distance <= radiusKm)
        .sort((a, b) => a.distance - b.distance);
}

/**
 * Obtiene la ubicación actual del usuario usando la Geolocation API
 * @returns Promise con las coordenadas
 */
export function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation no está disponible'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                });
            },
            (error) => {
                reject(error);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });
}

/**
 * Geocodificación inversa: obtiene dirección desde coordenadas
 */
export async function reverseGeocode(lat: number, lng: number): Promise<GeoLocation | null> {
    try {
        const response = await fetch(
            `${NOMINATIM_URL}/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
            {
                headers: {
                    'Accept-Language': 'es',
                    'User-Agent': 'Yupay/1.0'
                }
            }
        );

        if (!response.ok) return null;

        const result = await response.json();
        const addr = result.address || {};

        return {
            lat,
            lng,
            address: result.display_name,
            locality: addr.city || addr.town || addr.village || addr.municipality,
            province: addr.state || addr.province
        };
    } catch (error) {
        console.error('Error reverse geocoding:', error);
        return null;
    }
}

/**
 * Formatea la distancia para mostrar al usuario
 */
export function formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
        return `${Math.round(distanceKm * 1000)} m`;
    }
    if (distanceKm < 10) {
        return `${distanceKm.toFixed(1)} km`;
    }
    return `${Math.round(distanceKm)} km`;
}
