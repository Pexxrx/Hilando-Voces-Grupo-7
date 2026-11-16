'use client';

import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Report } from '@/types';
import sjlBoundary from '@/data/sjl_boundary.json';

interface TerritorialMapInternalProps {
  reports: Report[];
  selectedReportId?: string | null;
  onSelectReport: (report: Report) => void;
}

export function TerritorialMapInternal({
  reports,
  selectedReportId,
  onSelectReport,
}: TerritorialMapInternalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Inicializar mapa centrado en SJL
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [-11.9800, -76.9950],
        zoom: 13,
        zoomControl: true,
      });

      // Capa de OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Dibujar polígono territorial oficial de San Juan de Lurigancho
      try {
        const boundaryLayer = L.geoJSON(sjlBoundary as any, {
          style: {
            color: '#d30684', // Magenta Warmi
            weight: 2.5,
            opacity: 0.85,
            fillColor: '#fce7f3',
            fillOpacity: 0.18,
            dashArray: '5, 6',
          },
        }).addTo(map);

        map.fitBounds(boundaryLayer.getBounds(), { padding: [20, 20] });
      } catch (err) {
        console.warn('Error rendering SJL GeoJSON boundary:', err);
      }

      const markersGroup = L.layerGroup().addTo(map);
      markersLayerRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    return () => {
      // Cleanup al desmontar
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Actualizar marcadores cuando cambian los reportes o selección
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    reports.forEach((rep) => {
      if (!rep.latitude || !rep.longitude) return;

      const isSelected = rep.id === selectedReportId;

      // Colores de estado:
      // En proceso / Pendiente: #EF4444 (Rojo)
      // Faena programada: #F97316 (Naranja)
      // Resuelto: #22C55E (Verde claro)
      let bgStyle = 'background-color: #EF4444; border-color: #FEE2E2;';
      if (rep.status === 'faena_programada') {
        bgStyle = 'background-color: #F97316; border-color: #FFEDD5;';
      } else if (rep.status === 'resuelto') {
        bgStyle = 'background-color: #22C55E; border-color: #DCFCE7;';
      }

      const scaleClass = isSelected ? 'transform: scale(1.3); box-shadow: 0 0 0 4px rgba(211, 6, 132, 0.4);' : '';

      // Iconos SVG vectoriales limpios sin emojis
      const iconSvg = rep.axis === 'alumbrado'
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`
        : rep.axis === 'microbasurales'
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2-8 12h5v6h6v-6h5z"/></svg>`;

      const iconHtml = `
        <div style="display:flex; align-items:center; justify-content:center;">
          <div style="width:26px; height:26px; border-radius:9999px; ${bgStyle} ${scaleClass} border-width:2px; display:flex; align-items:center; justify-content:center; color:#fff; cursor:pointer; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2);">
            ${iconSvg}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: 'custom-leaflet-marker',
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });

      const marker = L.marker([rep.latitude, rep.longitude], { icon: customIcon });

      marker.bindPopup(`
        <div style="padding: 4px; font-family: sans-serif;">
          <strong style="font-family: monospace; color: #d30684; font-size: 13px;">${rep.ticket_code}</strong><br/>
          <span style="color: #1a2527; text-transform: capitalize; font-size: 11px; font-weight: 700;">${rep.axis}</span><br/>
          <p style="color: #4b5563; font-size: 11px; margin-top: 4px; line-height: 1.3;">${rep.description.slice(0, 65)}...</p>
        </div>
      `);

      marker.on('click', () => {
        onSelectReport(rep);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [reports, selectedReportId, onSelectReport]);

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-[#D3B9B9] shadow-sm">
      <div ref={mapContainerRef} className="w-full h-full" />
      {/* Leyenda del mapa */}
      <div className="absolute bottom-3 right-3 z-[400] bg-white/95 backdrop-blur-sm p-3.5 rounded-2xl border border-[#D3B9B9] shadow-md text-xs space-y-1.5 font-medium text-[#1a2527]">
        <div className="font-bold text-[11px] uppercase tracking-wider mb-1 text-[#1a2527]">
          Estados de Incidencias
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-[#EF4444] inline-block shrink-0 shadow-sm" />
          <span className="text-slate-700">En proceso / Pendiente (Rojo)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-[#F97316] inline-block shrink-0 shadow-sm" />
          <span className="text-slate-700">Faena Programada (Naranja)</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3 h-3 rounded-full bg-[#22C55E] inline-block shrink-0 shadow-sm" />
          <span className="text-slate-700">Resuelto / Recuperado (Verde claro)</span>
        </div>
      </div>
    </div>
  );
}
