'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import sjlBoundary from '@/data/sjl_boundary.json';

interface LocationPickerMapInternalProps {
  latitude: number;
  longitude: number;
  onChangeLocation: (lat: number, lng: number) => void;
}

export function LocationPickerMapInternal({
  latitude,
  longitude,
  onChangeLocation,
}: LocationPickerMapInternalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = latitude || -11.9754;
      const initialLng = longitude || -76.9982;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap Tiles con soporte https y subdominios
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
        subdomains: ['a', 'b', 'c'],
      }).addTo(map);

      // Dibujar polígono referencial de San Juan de Lurigancho
      try {
        L.geoJSON(sjlBoundary as any, {
          style: {
            color: '#d30684',
            weight: 2,
            opacity: 0.6,
            fillColor: '#fce7f3',
            fillOpacity: 0.08,
            dashArray: '4, 4',
          },
        }).addTo(map);
      } catch (err) {
        console.warn('Error rendering boundary:', err);
      }

      // Marcador interactivo tipo Pin centrado en el punto
      const pinIconHtml = `
        <div style="display:flex; flex-direction:column; align-items:center; cursor: grab;">
          <div style="background-color: #d30684; color: white; width: 34px; height: 34px; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(211,6,132,0.45); border: 2.5px solid #ffffff;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #d30684; margin-top: -2px;"></div>
        </div>
      `;

      const customPin = L.divIcon({
        html: pinIconHtml,
        className: 'custom-problem-pin',
        iconSize: [34, 42],
        iconAnchor: [17, 42],
      });

      const marker = L.marker([initialLat, initialLng], {
        icon: customPin,
        draggable: true,
      }).addTo(map);

      marker.on('dragend', () => {
        const pos = marker.getLatLng();
        onChangeLocation(pos.lat, pos.lng);
      });

      map.on('click', (e: L.LeafletMouseEvent) => {
        marker.setLatLng(e.latlng);
        onChangeLocation(e.latlng.lat, e.latlng.lng);
      });

      markerRef.current = marker;
      mapInstanceRef.current = map;

      // Invalidation de tamaño para evitar bugs de tiles en blanco o desalineados
      map.whenReady(() => {
        map.invalidateSize();
      });

      const t1 = setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 100);

      const t2 = setTimeout(() => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      }, 400);

      const handleResize = () => {
        if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
      };
      window.addEventListener('resize', handleResize);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        window.removeEventListener('resize', handleResize);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }
      };
    }
  }, []);

  // Sincronizar posición del marcador si cambian las coordenadas externamente
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current && latitude && longitude) {
      const currentPos = markerRef.current.getLatLng();
      if (Math.abs(currentPos.lat - latitude) > 0.0001 || Math.abs(currentPos.lng - longitude) > 0.0001) {
        markerRef.current.setLatLng([latitude, longitude]);
        mapInstanceRef.current.panTo([latitude, longitude]);
      }
    }
  }, [latitude, longitude]);

  return (
    <div className="relative w-full h-[280px] rounded-2xl overflow-hidden border-2 border-[#D3B9B9] shadow-inner bg-[#E7E7E5]">
      <div 
        ref={mapContainerRef} 
        style={{ height: '280px', width: '100%' }}
        className="w-full h-full" 
      />
      <div className="absolute top-2.5 left-2.5 right-2.5 z-[400] bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-xl border border-[#D3B9B9] shadow-sm text-xs text-[#1a2527] font-medium text-center pointer-events-none">
        Toca el mapa o mueve el pin para señalar la ubicación exacta
      </div>
    </div>
  );
}
