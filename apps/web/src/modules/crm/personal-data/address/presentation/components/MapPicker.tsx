"use client";

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Next.js/Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPickerProps {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
}

const LocationMarker = ({ position, setPosition, onChange }: any) => {
  const map = useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onChange(lat, lng);
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

export default function MapPicker({ latitude, longitude, onChange }: MapPickerProps) {
  // Default to a central location if 0,0 is provided, or the provided location
  const isDefault = latitude === 0 && longitude === 0;
  const initialCenter: [number, number] = isDefault ? [-17.3938, -66.1569] : [latitude, longitude]; // Cochabamba, Bolivia as default map view, just as example
  const [position, setPosition] = useState<[number, number] | null>(isDefault ? null : initialCenter);

  useEffect(() => {
    if (!isDefault) {
      setPosition([latitude, longitude]);
    }
  }, [latitude, longitude, isDefault]);

  return (
    <div className="h-[300px] w-full rounded-lg overflow-hidden border border-border/50">
      <MapContainer center={initialCenter} zoom={13} scrollWheelZoom={true} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker position={position} setPosition={setPosition} onChange={onChange} />
        {!isDefault && <MapUpdater center={[latitude, longitude]} />}
      </MapContainer>
    </div>
  );
}
