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

    // Si el contenedor fue previamente inicializado por Leaflet en otro ciclo de render, limpiarlo
    if ((mapContainerRef.current as any)._leaflet_id && !mapInstanceRef.current) {
      delete (mapContainerRef.current as any)._leaflet_id;
    }

    // Inicializar mapa centrado en SJL
    if (!mapInstanceRef.current) {
      try {
        const map = L.map(mapContainerRef.current, {
          center: [-11.9800, -76.9950],
          zoom: 13,
          zoomControl: true,
        });

        // Capa de OpenStreetMap estándar de alta disponibilidad
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
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
              fillOpacity: 0.12,
              dashArray: '5, 6',
            },
          }).addTo(map);

          if (boundaryLayer.getBounds().isValid()) {
            map.fitBounds(boundaryLayer.getBounds(), { padding: [20, 20] });
          }
        } catch (boundaryErr) {
          console.warn('Error dibujando límites de SJL:', boundaryErr);
        }

        const markersGroup = L.layerGroup().addTo(map);
        markersLayerRef.current = markersGroup;
        mapInstanceRef.current = map;

        // Forzar cálculo de dimensiones tras montaje en DOM
        setTimeout(() => {
          map.invalidateSize();
        }, 200);
      } catch (mapInitErr) {
        console.error('Error inicializando mapa Leaflet:', mapInitErr);
      }
    }

    return () => {
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

    if (!Array.isArray(reports) || reports.length === 0) return;

    reports.forEach((rep) => {
      if (!rep.latitude || !rep.longitude) return;

      const isSelected = rep.id === selectedReportId;

      let bgStyle = 'background-color: #d30684; border-color: #F3E8E8;';
      if (rep.status === 'en_evaluacion') {
        bgStyle = 'background-color: #E28A85; border-color: #FAF8F5;';
      } else if (rep.status === 'faena_programada') {
        bgStyle = 'background-color: #E4981E; border-color: #FFFBEB;';
      } else if (rep.status === 'resuelto') {
        bgStyle = 'background-color: #588157; border-color: #DAE3D9;';
      }

      const scaleClass = isSelected ? 'transform: scale(1.3); box-shadow: 0 0 0 4px rgba(211, 6, 132, 0.4);' : '';

      // Iconos SVG vectoriales limpios
      const iconSvg = rep.axis === 'alumbrado'
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>`
        : rep.axis === 'microbasurales'
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2-8 12h5v6h6v-6h5z"/></svg>`;

      const iconHtml = `
        <div style="display:flex; align-items:center; justify-content:center;">
          <div style="width:26px; height:26px; border-radius:9999px; ${bgStyle} ${scaleClass} border-width:2px; display:flex; align-items:center; justify-content:center; color:#fff; cursor:pointer; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.25);">
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
          <p style="color: #4b5563; font-size: 11px; margin-top: 4px; line-height: 1.3;">${(rep.description || '').slice(0, 65)}...</p>
        </div>
      `);

      marker.on('click', () => {
        onSelectReport(rep);
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [reports, selectedReportId, onSelectReport]);

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full min-h-[420px]" />
    </div>
  );
}
