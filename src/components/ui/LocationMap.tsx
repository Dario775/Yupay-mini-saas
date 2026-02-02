import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Corregir problema de iconos de Leaflet en React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface LocationMapProps {
    lat: number;
    lng: number;
    onLocationChange: (lat: number, lng: number) => void;
    className?: string;
}

// Componente para manejar clics en el mapa
function LocationMarker({ position, onLocationChange }: { position: L.LatLngExpression, onLocationChange: (lat: number, lng: number) => void }) {
    const markerRef = useRef<L.Marker>(null);

    const map = useMapEvents({
        click(e) {
            onLocationChange(e.latlng.lat, e.latlng.lng);
        },
    });

    // Manejar arrastre del marcador
    const eventHandlers = {
        dragend() {
            const marker = markerRef.current;
            if (marker != null) {
                const { lat, lng } = marker.getLatLng();
                onLocationChange(lat, lng);
            }
        },
    };

    return (
        <Marker
            draggable={true}
            eventHandlers={eventHandlers}
            position={position}
            ref={markerRef}
        />
    );
}

// Componente para centrar el mapa cuando cambian las coordenadas externamente
function MapUpdater({ center }: { center: L.LatLngExpression }) {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, map.getZoom());
    }, [center, map]);
    return null;
}

export default function LocationMap({ lat, lng, onLocationChange, className = "h-64 w-full rounded-lg" }: LocationMapProps) {
    // Aseguramos coordenadas válidas o usamos un default (CABA)
    const position: L.LatLngExpression = [lat || -34.6037, lng || -58.3816];

    return (
        <div className={className}>
            <MapContainer
                center={position}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%', borderRadius: 'inherit' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} onLocationChange={onLocationChange} />
                <MapUpdater center={position} />
            </MapContainer>
        </div>
    );
}
