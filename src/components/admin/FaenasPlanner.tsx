'use client';

import React, { useState } from 'react';
import { GoogleIcon } from '@/components/GoogleIcon';
import { Report } from '@/types';
import { ExtendedReport } from '@/data/mockReports';

interface FaenasPlannerProps {
  reports: Report[];
  onOpenFaenaModal: (report: Report) => void;
  onOpenResolveModal: (report: Report) => void;
  onSelectReport: (report: Report) => void;
}

export function FaenasPlanner({
  reports,
  onOpenFaenaModal,
  onOpenResolveModal,
  onSelectReport,
}: FaenasPlannerProps) {
  // Faenas activas ya agendadas
  const scheduled = reports.filter((r) => r.status === 'faena_programada');
  // Casos en evaluación o recibidos con alta prioridad que ameritan ser programados
  const readyForFaena = reports.filter(
    (r) => (r.status === 'en_evaluacion' || r.status === 'recibido') && r.priority_level === 'alta'
  );

  // Estado del calendario mensual (Noviembre 2026)
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Mapeo de faenas por día del mes de noviembre 2026
  // Nov 21: 2 faenas, Nov 22: 1 faena, Nov 28: 1 faena, Nov 29: 1 faena
  const getFaenasForDay = (day: number) => {
    return scheduled.filter((report) => {
      const ext = report as ExtendedReport;
      const dateStr = ext.scheduled_date || '';
      if (dateStr.includes(`2026-11-${day.toString().padStart(2, '0')}`)) return true;
      // Asignación por defecto de días si no viene la fecha exacta en BD
      if (day === 21 && (report.id === 'rep-sjl-003' || report.id === 'rep-sjl-005')) return true;
      if (day === 22 && report.id === 'rep-sjl-007') return true;
      if (day === 28 && report.id === 'rep-sjl-016') return true;
      if (day === 29 && report.id === 'rep-sjl-022') return true;
      return false;
    });
  };

  // Construcción de la grilla de días de Noviembre 2026
  // 1 de Noviembre 2026 fue Domingo (en grilla Lun-Dom, Lun a Sáb son 6 días vacíos al inicio)
  const daysInNov = 30;
  const startDayOffset = 6; // Domingo es el 7mo día de la semana (offset 6 para Lun=0)
  const calendarCells = [];

  for (let i = 0; i < startDayOffset; i++) {
    calendarCells.push({ empty: true, key: `empty-${i}` });
  }
  for (let d = 1; d <= daysInNov; d++) {
    calendarCells.push({ empty: false, day: d, faenas: getFaenasForDay(d), key: `day-${d}` });
  }

  // Faenas filtradas según día seleccionado o todas
  const displayedFaenas = selectedDay ? getFaenasForDay(selectedDay) : scheduled;

  const getAxisColor = (axis: string) => {
    switch (axis) {
      case 'alumbrado':
        return '#E4981E';
      case 'microbasurales':
        return '#E28A85';
      case 'espacios_recreativos':
        return '#588157';
      default:
        return '#d30684';
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner de Introducción */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#D3B9B9] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <GoogleIcon name="calendar_month" filled size={18} className="text-[#E4981E]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#E4981E]">
              Agenda Comunitaria de Campo
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#1a2527] tracking-tight">
            Calendario Mensual de Faenas Barriales
          </h2>
          <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
            Cronograma operativo de jornadas vecinales en San Juan de Lurigancho: brigadas juveniles, checklist de herramientas y emisión de fichas técnicas oficiales.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-[#FFFBEB] border border-[#FDE68A] p-3.5 rounded-2xl shrink-0">
          <div className="text-center">
            <span className="text-3xl font-heading font-black text-[#E4981E] block leading-none">
              {scheduled.length}
            </span>
            <span className="text-[10px] font-bold text-[#92400e] uppercase tracking-wider">
              Faenas Activas
            </span>
          </div>
        </div>
      </div>

      {/* SECCIÓN DEL CALENDARIO MENSUAL (NOVIEMBRE 2026) */}
      <div className="bg-white p-6 rounded-3xl border border-[#D3B9B9] shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#E4981E]">
              <GoogleIcon name="date_range" size={20} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-[#1a2527]">
                Noviembre 2026
              </h3>
              <p className="text-xs text-slate-500">
                Selecciona cualquier día para filtrar las jornadas programadas
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            {selectedDay && (
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-slate-200 border border-[#D3B9B9] font-bold text-slate-700 transition-colors cursor-pointer"
              >
                Ver Todo el Mes
              </button>
            )}
            <div className="flex items-center space-x-3 text-[11px] text-slate-600 bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#D3B9B9]">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E4981E]" />
                <span>Alumbrado</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E28A85]" />
                <span>Basural</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#588157]" />
                <span>Espacio</span>
              </span>
            </div>
          </div>
        </div>

        {/* Encabezados de días de la semana */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 py-2 border-y border-[#D3B9B9]/60">
          <span>Lun</span>
          <span>Mar</span>
          <span>Mié</span>
          <span>Jue</span>
          <span>Vie</span>
          <span className="text-[#d30684]">Sáb</span>
          <span className="text-[#d30684]">Dom</span>
        </div>

        {/* Celdas del Calendario Mensual */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {calendarCells.map((cell) => {
            if (cell.empty) {
              return (
                <div
                  key={cell.key}
                  className="h-16 sm:h-20 rounded-2xl bg-slate-50/50 border border-transparent"
                />
              );
            }

            const dayNum = cell.day as number;
            const faenasForDay = cell.faenas || [];
            const hasFaena = faenasForDay.length > 0;
            const isSelected = selectedDay === dayNum;
            const isWeekend = (dayNum + startDayOffset) % 7 === 6 || (dayNum + startDayOffset) % 7 === 0;

            return (
              <div
                key={cell.key}
                onClick={() => setSelectedDay(isSelected ? null : dayNum)}
                className={`h-16 sm:h-20 p-1.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#d30684] bg-[#fdf2f8] ring-2 ring-[#d30684]/30'
                    : hasFaena
                    ? 'border-[#FDE68A] bg-[#FFFBEB]/70 hover:bg-[#FFFBEB]'
                    : isWeekend
                    ? 'border-slate-200 bg-[#FAF8F5]/60 hover:bg-[#FAF8F5]'
                    : 'border-slate-100 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-black ${
                      hasFaena
                        ? 'text-[#E4981E]'
                        : isWeekend
                        ? 'text-[#d30684]'
                        : 'text-slate-700'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {hasFaena && (
                    <span className="w-2 h-2 rounded-full bg-[#E4981E] animate-ping" />
                  )}
                </div>

                {/* Event Pills en la celda */}
                <div className="space-y-0.5 overflow-hidden">
                  {faenasForDay.slice(0, 2).map((f) => (
                    <div
                      key={f.id}
                      className="px-1 py-0.5 rounded text-[8px] sm:text-[9px] font-bold text-white truncate shadow-xs"
                      style={{ backgroundColor: getAxisColor(f.axis) }}
                      title={`${f.ticket_code} - ${f.axis}`}
                    >
                      {f.ticket_code.replace('#HV-SJL-', '')}
                    </div>
                  ))}
                  {faenasForDay.length > 2 && (
                    <span className="text-[8px] font-bold text-slate-500 block leading-tight">
                      +{faenasForDay.length - 2} más
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECCIÓN 2: TARJETAS DE FAENAS CORRESPONDIENTES AL DÍA O MES */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GoogleIcon name="assignment" filled size={20} className="text-[#E4981E]" />
            <h3 className="font-heading font-bold text-base text-[#1a2527]">
              {selectedDay
                ? `Faenas Programadas para el ${selectedDay} de Noviembre (${displayedFaenas.length})`
                : `Todas las Faenas Activas de Noviembre (${displayedFaenas.length})`}
            </h3>
          </div>
          <span className="text-xs text-slate-500">Listas para coordinación en territorio</span>
        </div>

        {displayedFaenas.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-[#D3B9B9] text-center text-slate-400 space-y-2">
            <GoogleIcon name="event_busy" size={36} className="text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-[#1a2527]">No hay faenas programadas para este día.</p>
            <p className="text-[11px] text-slate-500">
              Puedes seleccionar otra fecha del calendario o programar un caso de la lista inferior.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedFaenas.map((report) => {
              const ext = report as ExtendedReport;
              return (
                <div
                  key={report.id}
                  className="bg-white p-5 rounded-3xl border border-[#D3B9B9] shadow-sm hover:border-[#E4981E] transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Cabecera de la Tarjeta */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-[#d30684] bg-[#fdf2f8] px-2 py-0.5 rounded-lg border border-[#d30684]/20">
                        {report.ticket_code}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-300">
                        Faena Confirmada
                      </span>
                    </div>

                    {/* Título y Eje */}
                    <div>
                      <h4 className="font-heading font-extrabold text-sm text-[#1a2527] line-clamp-2">
                        {report.ai_summary || report.description}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        📍 {report.reference}
                      </p>
                    </div>

                    {/* Datos de Campo: Coordinador, Fecha y Herramientas */}
                    <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9]/60 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Fecha y Hora:</span>
                        <span className="font-bold text-[#1a2527]">
                          {ext.scheduled_date ? new Date(ext.scheduled_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }) : 'Sábado 21 Nov, 08:30 AM'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Punto de Encuentro:</span>
                        <span className="font-bold text-slate-800 line-clamp-1 max-w-[200px]">
                          {ext.meeting_point || 'Frente a la losa comunal'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Vecino Coordinador:</span>
                        <span className="font-bold text-[#d30684]">
                          {ext.coordinator_name || 'Comité de Vecinos'}
                        </span>
                      </div>

                      {ext.tools_available && ext.tools_available.length > 0 && (
                        <div className="pt-1 border-t border-[#D3B9B9]/40">
                          <span className="text-[11px] text-slate-500 block">Herramientas comprometidas:</span>
                          <span className="text-[11px] font-semibold text-slate-700">
                            {ext.tools_available.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botones de Acción */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#D3B9B9]/40">
                    <button
                      type="button"
                      onClick={() => onOpenFaenaModal(report)}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#FAF8F5]/80 border border-[#D3B9B9] text-xs font-bold text-[#1a2527] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <GoogleIcon name="print" size={15} className="text-[#E4981E]" />
                      <span>Ficha Técnica Imprimible</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenResolveModal(report)}
                      className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-1 shadow-sm transition-all cursor-pointer"
                    >
                      <GoogleIcon name="task_alt" size={15} />
                      <span>Resolver Caso</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* SECCIÓN 3: CASOS PRIORITARIOS LISTOS PARA PROGRAMAR FAENA */}
      <div className="space-y-4 pt-4 border-t border-[#D3B9B9]/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GoogleIcon name="pending_actions" filled size={20} className="text-[#d30684]" />
            <h3 className="font-heading font-bold text-base text-[#1a2527]">
              Casos Prioritarios Listos para Agendar Faena ({readyForFaena.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500">Evaluados por el Copiloto Gemini con prioridad alta</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {readyForFaena.map((report) => (
            <div
              key={report.id}
              className="bg-white p-4 rounded-2xl border border-[#D3B9B9] hover:border-[#d30684] shadow-xs transition-all space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-black text-[#d30684]">{report.ticket_code}</span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-red-50 text-red-700 border border-red-200">
                    Prioridad Alta
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 line-clamp-2">
                  {report.ai_summary || report.description}
                </p>
                <span className="text-[11px] text-slate-500 block truncate">📍 {report.reference}</span>
              </div>

              <button
                type="button"
                onClick={() => onOpenFaenaModal(report)}
                className="w-full mt-2 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#d30684] hover:text-white border border-[#D3B9B9] text-xs font-bold text-[#1a2527] transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                <GoogleIcon name="add_circle" size={14} />
                <span>Agendar en Calendario</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
