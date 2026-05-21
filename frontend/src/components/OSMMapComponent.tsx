"use client";

import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { renderToString } from 'react-dom/server';

// Fix Leaflet's default icon path issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create custom icons
const createUserIcon = () => {
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `<div style="width: 40px; height: 40px; border-radius: 50%; background-color: rgba(37, 99, 235, 0.2); border: 4px solid #3b82f6; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(59,130,246,0.5);">
             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-user"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
           </div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20]
  });
};

const createMosqueIcon = (name: string) => {
  const shortName = name.length > 20 ? name.substring(0,20)+'...' : name;
  return L.divIcon({
    className: 'bg-transparent border-0',
    html: `<div style="display: flex; flex-direction: column; align-items: center; gap: 4px;" class="group">
             <div style="width: 32px; height: 32px; border-radius: 50%; background-color: #10b981; border: 1px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); cursor: pointer;">
               <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
             </div>
             <span style="font-size: 9px; background-color: #09090b; padding: 2px 8px; border-radius: 4px; color: #34d399; font-weight: bold; border: 1px solid rgba(16, 185, 129, 0.2); white-space: nowrap; opacity: 1; transition: opacity 0.2s;" class="group-hover:opacity-100">
               ${shortName}
             </span>
           </div>`,
    iconSize: [32, 50],
    iconAnchor: [16, 32]
  });
};

function ChangeView({ center, zoom }: { center: {lat: number, lng: number}, zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

interface OSMMapComponentProps {
  userLocation: {lat: number, lng: number};
  mosquesList: any[];
  onMosqueClick: (mosque: any) => void;
}

export default function OSMMapComponent({ userLocation, mosquesList, onMosqueClick }: OSMMapComponentProps) {
  return (
    <MapContainer 
      center={userLocation} 
      zoom={13} 
      style={{ width: '100%', height: '100%', background: '#050505' }}
      zoomControl={false}
    >
      <ChangeView center={userLocation} zoom={13} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      
      <Marker position={userLocation} icon={createUserIcon()} zIndexOffset={100} />
      
      {mosquesList.map((m: any, i: number) => (
        <Marker 
          key={m.id || i} 
          position={{ lat: m.lat, lng: m.lon }}
          icon={createMosqueIcon(m.tags?.name || "Masjid")}
          eventHandlers={{
            click: () => {
              onMosqueClick({
                name: m.tags?.name || "Masjid (Tanpa Nama)",
                coordinate: `POINT(${m.lon.toFixed(4)} ${m.lat.toFixed(4)})`
              });
            }
          }}
        />
      ))}
    </MapContainer>
  );
}
