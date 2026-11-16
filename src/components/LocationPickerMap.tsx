'use client';

import React from 'react';
import dynamic from 'next/dynamic';

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onChangeLocation: (lat: number, lng: number) => void;
}

export const LocationPickerMap = dynamic(
  () => import('./LocationPickerMapInternal').then((mod) => mod.LocationPickerMapInternal),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[270px] sm:h-[300px] rounded-2xl bg-[#FAF8F5] border-2 border-[#D3B9B9] flex flex-col items-center justify-center text-slate-400 text-xs font-medium space-y-2 animate-pulse">
        <div className="w-8 h-8 rounded-full border-2 border-[#d30684] border-t-transparent animate-spin" />
        <span>Cargando mapa interactivo...</span>
      </div>
    ),
  }
);
