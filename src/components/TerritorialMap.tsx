'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Report } from '@/types';
import sjlBoundary from '@/data/sjl_boundary.json';

interface TerritorialMapProps {
  reports: Report[];
  selectedReportId?: string | null;
  onSelectReport: (report: Report) => void;
}

// Carga dinámica del mapa para evitar errores de SSR con Leaflet
export const TerritorialMap = dynamic(
  () => import('./TerritorialMapInternal').then((mod) => mod.TerritorialMapInternal),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[520px] rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 text-sm font-medium animate-pulse">
        Cargando mapa territorial de San Juan de Lurigancho...
      </div>
    ),
  }
);
