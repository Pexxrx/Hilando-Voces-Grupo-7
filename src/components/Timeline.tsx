import React from 'react';
import { CheckCircle2, Clock, Calendar, Check, Image as ImageIcon } from 'lucide-react';
import { ReportStatus } from '@/types';

interface TimelineProps {
  status: ReportStatus;
  createdAt: string;
  resolvedAt?: string | null;
  photoBeforeUrl?: string | null;
  photoAfterUrl?: string | null;
}

export function Timeline({
  status,
  createdAt,
  resolvedAt,
  photoBeforeUrl,
  photoAfterUrl,
}: TimelineProps) {
  const steps: { key: ReportStatus; label: string; desc: string }[] = [
    { key: 'recibido', label: 'Recibido', desc: 'Registrado en plataforma' },
    { key: 'en_evaluacion', label: 'En Evaluación', desc: 'Revisado por lideresas' },
    { key: 'faena_programada', label: 'Faena Programada', desc: 'Jornada barrial agendada' },
    { key: 'resuelto', label: 'Resuelto', desc: 'Espacio recuperado' },
  ];

  const statusOrder: Record<ReportStatus, number> = {
    recibido: 1,
    en_evaluacion: 2,
    faena_programada: 3,
    resuelto: 4,
  };

  const currentLevel = statusOrder[status] || 1;

  return (
    <div className="space-y-6">
      {/* Stepper visual cálido */}
      <div className="relative flex items-center justify-between px-2 pt-2">
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1.5 bg-[#E7E7E5] rounded-full z-0" />
        <div
          className="absolute left-6 top-1/2 -translate-y-1/2 h-1.5 bg-[#d30684] transition-all duration-500 rounded-full z-0"
          style={{ width: `calc(${((currentLevel - 1) / (steps.length - 1)) * 100}% - 12px)` }}
        />

        {steps.map((s, idx) => {
          const stepLevel = idx + 1;
          const isDone = stepLevel <= currentLevel;
          const isCurrent = stepLevel === currentLevel;

          return (
            <div key={s.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  isDone
                    ? 'bg-[#d30684] text-white shadow-md ring-4 ring-[#fdf2f8]'
                    : 'bg-white border-2 border-[#D3B9B9] text-slate-400'
                } ${isCurrent ? 'ring-4 ring-[#d30684]/30 scale-110' : ''}`}
              >
                {isDone ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
              </div>
              <span
                className={`text-[11px] sm:text-xs font-semibold mt-2.5 text-center whitespace-nowrap ${
                  isCurrent ? 'text-[#d30684] font-bold' : isDone ? 'text-[#1a2527]' : 'text-slate-400'
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Tarjeta de estado actual */}
      <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9]/70 text-xs text-[#1a2527] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-sm">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-[#d30684]" />
          <span>Fecha de reporte: <strong>{new Date(createdAt).toLocaleDateString()}</strong></span>
        </div>
        {resolvedAt && (
          <div className="flex items-center space-x-1.5 text-[#16a34a] font-bold bg-[#f0fdf4] px-3 py-1 rounded-full border border-[#16a34a]/30">
            <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
            <span>Faena Concluida el: {new Date(resolvedAt).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Comparativa fotográfica Antes y Después */}
      {(photoBeforeUrl || photoAfterUrl) && (
        <div className="pt-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1a2527] block mb-3">
            Evidencias Comunitarias (Rendición de Cuentas)
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {photoBeforeUrl && (
              <div className="rounded-2xl border border-[#D3B9B9] overflow-hidden bg-white shadow-sm">
                <div className="bg-[#FAF8F5] px-3.5 py-2 border-b border-[#D3B9B9] text-[11px] font-bold text-[#d30684] flex items-center justify-between">
                  <span>Foto Inicial ("Antes")</span>
                  <ImageIcon className="w-3.5 h-3.5" />
                </div>
                <div className="h-48 w-full bg-[#FAF8F5]">
                  <img src={photoBeforeUrl} alt="Antes" className="w-full h-full object-cover" />
                </div>
              </div>
            )}

            {photoAfterUrl ? (
              <div className="rounded-2xl border border-[#d30684]/40 overflow-hidden bg-white shadow-sm">
                <div className="bg-[#fdf2f8] px-3.5 py-2 border-b border-[#d30684]/30 text-[11px] font-bold text-[#d30684] flex items-center justify-between">
                  <span>Espacio Recuperado ("Después")</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#d30684]" />
                </div>
                <div className="h-48 w-full bg-[#FAF8F5]">
                  <img src={photoAfterUrl} alt="Después" className="w-full h-full object-cover" />
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#D3B9B9] p-6 flex flex-col items-center justify-center text-center bg-[#FAF8F5]">
                <Calendar className="w-8 h-8 text-[#D3B9B9] mb-2" />
                <span className="text-xs font-bold text-[#1a2527]">Fotografía "Después" en curso</span>
                <span className="text-[11px] text-slate-500 mt-1 max-w-xs leading-relaxed">
                  Las lideresas juveniles subirán la fotografía al culminar la faena comunitaria.
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
