'use client';

import React, { useState } from 'react';
import { GoogleIcon } from '@/components/GoogleIcon';
import { Report } from '@/types';

interface AccountabilityGalleryProps {
  reports: Report[];
  onOpenResolveModal: (report: Report) => void;
}

export function AccountabilityGallery({
  reports,
  onOpenResolveModal,
}: AccountabilityGalleryProps) {
  const [filter, setFilter] = useState<'todos' | 'resueltos' | 'pendientes'>('todos');

  const resolved = reports.filter((r) => r.status === 'resuelto');
  const pendingPhotos = reports.filter(
    (r) => r.status === 'faena_programada' && !r.photo_after_url
  );

  const displayedReports =
    filter === 'resueltos'
      ? resolved
      : filter === 'pendientes'
      ? pendingPhotos
      : reports.filter((r) => r.status === 'resuelto' || r.status === 'faena_programada');

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#D3B9B9] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <GoogleIcon name="verified" filled size={20} className="text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
              Transparencia y Trazabilidad
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#1a2527] tracking-tight">
            Rendición de Cuentas y Evidencias ("Antes y Después")
          </h2>
          <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
            Certifica la recuperación de los espacios barriales subiendo la fotografía final de la faena comunitaria para que las vecinas y vecinos verifiquen el resultado.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-emerald-50 border border-emerald-200 p-3.5 rounded-2xl shrink-0">
          <div className="text-center">
            <span className="text-2xl font-heading font-black text-emerald-700 block leading-none">
              {resolved.length}
            </span>
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
              Casos Certificados
            </span>
          </div>
        </div>
      </div>

      {/* Selector de pestañas */}
      <div className="flex rounded-2xl bg-[#FAF8F5] p-1.5 border border-[#D3B9B9] text-xs font-bold max-w-md">
        <button
          type="button"
          onClick={() => setFilter('todos')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer ${
            filter === 'todos' ? 'bg-[#d30684] text-white shadow-sm' : 'text-slate-600 hover:text-[#d30684]'
          }`}
        >
          Todos ({reports.filter((r) => r.status === 'resuelto' || r.status === 'faena_programada').length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('resueltos')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer ${
            filter === 'resueltos' ? 'bg-[#d30684] text-white shadow-sm' : 'text-slate-600 hover:text-[#d30684]'
          }`}
        >
          Resueltos ({resolved.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('pendientes')}
          className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer ${
            filter === 'pendientes' ? 'bg-[#d30684] text-white shadow-sm' : 'text-slate-600 hover:text-[#d30684]'
          }`}
        >
          Pendientes de Foto ({pendingPhotos.length})
        </button>
      </div>

      {/* Grid de Casos y Comparativas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayedReports.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-3xl border border-[#D3B9B9] text-center text-slate-400 space-y-2">
            <GoogleIcon name="photo_library" size={36} className="text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-[#1a2527]">No hay expedientes en esta categoría.</p>
          </div>
        ) : (
          displayedReports.map((report) => (
            <div
              key={report.id}
              className="bg-white p-6 rounded-3xl border-2 border-[#D3B9B9] shadow-sm space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[#D3B9B9]/60 pb-3">
                <div>
                  <span className="font-mono text-sm font-black text-[#d30684]">
                    {report.ticket_code}
                  </span>
                  <span className="text-[11px] text-slate-500 block">
                    📍 {report.reference || 'San Juan de Lurigancho'}
                  </span>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    report.status === 'resuelto'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                      : 'bg-amber-50 text-amber-700 border border-amber-300'
                  }`}
                >
                  {report.status === 'resuelto' ? 'Resuelto' : 'Faena en Curso'}
                </span>
              </div>

              {/* Comparador Fotográfico Antes vs Después */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* Foto Inicial Antes */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Foto Inicial ("Antes"):
                  </span>
                  <div className="aspect-square rounded-2xl overflow-hidden border border-[#D3B9B9] bg-slate-50">
                    {report.photo_before_url ? (
                      <img
                        src={report.photo_before_url}
                        alt="Problema inicial"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-2 text-center text-[11px]">
                        <GoogleIcon name="image_not_supported" size={24} className="mb-1" />
                        <span>Sin foto inicial</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Foto Final Después */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Resultado ("Después"):
                  </span>
                  <div className="aspect-square rounded-2xl overflow-hidden border border-[#D3B9B9] bg-slate-50">
                    {report.photo_after_url ? (
                      <img
                        src={report.photo_after_url}
                        alt="Espacio recuperado"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF8F5] text-slate-400 p-2 text-center space-y-2 border border-dashed border-[#D3B9B9]">
                        <GoogleIcon name="add_a_photo" size={24} className="text-[#d30684]" />
                        <span className="text-[10px] font-bold text-slate-600 leading-tight">
                          Pendiente de fotografía final
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenResolveModal(report)}
                          className="px-2.5 py-1 rounded-lg bg-[#d30684] text-white text-[10px] font-bold shadow-sm cursor-pointer"
                        >
                          Subir Foto
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Detalle del caso */}
              <p className="text-xs text-slate-700 italic leading-snug line-clamp-2">
                "{report.description}"
              </p>

              {report.status !== 'resuelto' && (
                <button
                  type="button"
                  onClick={() => onOpenResolveModal(report)}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#d30684] hover:bg-[#bd0474] text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <GoogleIcon name="check_circle" filled size={16} className="text-white" />
                  <span>Certificar Espacio y Cerrar Caso</span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
