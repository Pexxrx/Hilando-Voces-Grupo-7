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

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function FaenasPlanner({
  reports,
  onOpenFaenaModal,
  onOpenResolveModal,
  onSelectReport,
}: FaenasPlannerProps) {
  // Navegación Dinámica entre Meses (Iniciando en Noviembre 2026)
  const [currentMonth, setCurrentMonth] = useState<number>(10); // 10 = Noviembre (0-indexed)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Filtros dinámicos
  const [axisFilter, setAxisFilter] = useState<string>('todos');
  const [priorityFilter, setPriorityFilter] = useState<string>('todos');

  // Navegar al mes anterior o siguiente
  const handlePrevMonth = () => {
    setSelectedDay(null);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    setSelectedDay(null);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Faenas agendadas
  const scheduledReports = reports.filter((r) => r.status === 'faena_programada');

  // Mapeo dinámico de faenas para cualquier mes/año
  const getFaenasForDay = (day: number) => {
    const formattedMonth = (currentMonth + 1).toString().padStart(2, '0');
    const formattedDay = day.toString().padStart(2, '0');
    const targetDatePrefix = `${currentYear}-${formattedMonth}-${formattedDay}`;

    return scheduledReports.filter((report) => {
      // Filtros de Eje y Prioridad
      if (axisFilter !== 'todos' && report.axis !== axisFilter) return false;
      if (priorityFilter !== 'todos' && report.priority_level !== priorityFilter) return false;

      const ext = report as ExtendedReport;
      const dateStr = ext.scheduled_date || '';
      if (dateStr.includes(targetDatePrefix)) return true;

      // Fallback predeterminado para el mes base de Noviembre 2026
      if (currentYear === 2026 && currentMonth === 10) {
        if (day === 21 && (report.id === 'rep-sjl-003' || report.id === 'rep-sjl-005')) return true;
        if (day === 22 && report.id === 'rep-sjl-007') return true;
        if (day === 28 && report.id === 'rep-sjl-016') return true;
        if (day === 29 && report.id === 'rep-sjl-022') return true;
      }

      return false;
    });
  };

  // Construcción de celdas del calendario para el mes seleccionado
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  // Primer día de la semana (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
  const firstDayWeekday = new Date(currentYear, currentMonth, 1).getDay();
  // Convertir a Lunes = 0 (offset para cuadrícula Lun a Dom)
  const startDayOffset = (firstDayWeekday + 6) % 7;

  const calendarCells = [];
  for (let i = 0; i < startDayOffset; i++) {
    calendarCells.push({ empty: true, key: `empty-${i}` });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({
      empty: false,
      day: d,
      faenas: getFaenasForDay(d),
      key: `day-${d}`,
    });
  }

  // Faenas filtradas que se mostrarán en la lista
  const displayedFaenas = selectedDay
    ? getFaenasForDay(selectedDay)
    : scheduledReports.filter((r) => {
        if (axisFilter !== 'todos' && r.axis !== axisFilter) return false;
        if (priorityFilter !== 'todos' && r.priority_level !== priorityFilter) return false;
        return true;
      });

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
      {/* 1. CABECERA LIMPIA: NAVEGACIÓN ENTRE MESES + FILTROS DINÁMICOS */}
      <div className="bg-white p-6 rounded-3xl border border-[#D3B9B9]/50 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#d30684] block">
              Agenda Territorial
            </span>
            <div className="flex items-center space-x-3">
              <h2 className="font-heading font-black text-2xl text-[#1a2527] tracking-tight">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </h2>
              {/* Controles para moverse entre meses */}
              <div className="flex items-center space-x-1 bg-[#FAF8F5] p-1 rounded-2xl border border-[#D3B9B9]/50">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-[#FAF8F5] text-slate-700 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                  title="Mes anterior"
                >
                  <GoogleIcon name="chevron_left" size={18} />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="w-8 h-8 rounded-xl bg-white hover:bg-[#FAF8F5] text-slate-700 flex items-center justify-center transition-colors shadow-xs cursor-pointer"
                  title="Mes siguiente"
                >
                  <GoogleIcon name="chevron_right" size={18} />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500">
              Planificación operativa de jornadas de trabajo vecinal en San Juan de Lurigancho
            </p>
          </div>

          {/* Filtros por Eje y Prioridad */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {/* Filtro por Eje */}
            <select
              value={axisFilter}
              onChange={(e) => setAxisFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D3B9B9]/60 font-bold text-slate-700 focus:outline-none focus:border-[#d30684]"
            >
              <option value="todos">Todos los Ejes</option>
              <option value="alumbrado">Alumbrado</option>
              <option value="microbasurales">Microbasurales</option>
              <option value="espacios_recreativos">Espacios</option>
            </select>

            {/* Filtro por Prioridad */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D3B9B9]/60 font-bold text-slate-700 focus:outline-none focus:border-[#d30684]"
            >
              <option value="todos">Todas las Prioridades</option>
              <option value="alta">Prioridad Alta</option>
              <option value="media">Prioridad Media</option>
            </select>

            {selectedDay && (
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-300 font-bold text-slate-700 transition-colors"
              >
                Ver todo el mes
              </button>
            )}
          </div>
        </div>

        {/* Encabezados de días de la semana */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 py-2 border-y border-[#D3B9B9]/40">
          <span>Lun</span>
          <span>Mar</span>
          <span>Mié</span>
          <span>Jue</span>
          <span>Vie</span>
          <span className="text-[#d30684]">Sáb</span>
          <span className="text-[#d30684]">Dom</span>
        </div>

        {/* Celdas del Calendario Dinámico */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {calendarCells.map((cell) => {
            if (cell.empty) {
              return (
                <div
                  key={cell.key}
                  className="h-16 sm:h-20 rounded-2xl bg-slate-50/40 border border-transparent"
                />
              );
            }

            const dayNum = cell.day as number;
            const faenasForDay = cell.faenas || [];
            const hasFaena = faenasForDay.length > 0;
            const isSelected = selectedDay === dayNum;

            return (
              <div
                key={cell.key}
                onClick={() => setSelectedDay(isSelected ? null : dayNum)}
                className={`h-16 sm:h-20 p-1.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#d30684] bg-[#fdf2f8] ring-2 ring-[#d30684]/30'
                    : hasFaena
                    ? 'border-[#E4981E]/50 bg-[#FFFBEB] hover:bg-[#FFFBEB]/90'
                    : 'border-slate-100 bg-white hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-black ${
                      hasFaena ? 'text-[#E4981E]' : 'text-slate-700'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {hasFaena && (
                    <span className="w-2 h-2 rounded-full bg-[#E4981E] animate-ping" />
                  )}
                </div>

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

      {/* 2. DETALLE DE TODAS LAS FAENAS ACTIVAS DEL MES:
          HORA, LUGAR, ENCARGADO QUE LO APROBÓ, RESPONSABLE DE FAENA Y CONTACTO VECINAL (SIN DATOS PERSONALES) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GoogleIcon name="event_available" filled size={20} className="text-[#E4981E]" />
            <h3 className="font-heading font-black text-base text-[#1a2527]">
              {selectedDay
                ? `Faenas Programadas para el ${selectedDay} de ${MONTH_NAMES[currentMonth]} (${displayedFaenas.length})`
                : `Todas las Faenas Activas de ${MONTH_NAMES[currentMonth]} ${currentYear} (${displayedFaenas.length})`}
            </h3>
          </div>
          <span className="text-xs text-slate-500">Coordinación comunal de campo</span>
        </div>

        {displayedFaenas.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl border border-[#D3B9B9]/50 text-center text-slate-400 space-y-2">
            <GoogleIcon name="event_busy" size={40} className="text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-[#1a2527]">
              No hay faenas programadas para los filtros o fecha seleccionada.
            </p>
            <p className="text-[11px] text-slate-500">
              Puedes calendarizar una faena desde la Bandeja de Incidencias con el botón "Calendarizar Faena".
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedFaenas.map((report) => {
              const ext = report as ExtendedReport;
              return (
                <div
                  key={report.id}
                  className="bg-white p-5 rounded-3xl border border-[#D3B9B9]/50 shadow-sm hover:border-[#E4981E] transition-all space-y-4 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Encabezado: Código + Estado */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-[#d30684] bg-[#fdf2f8] px-2.5 py-0.5 rounded-lg border border-[#d30684]/20">
                        {report.ticket_code}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#FFFBEB] text-[#E4981E] border border-[#E4981E]/30">
                        Faena Confirmada
                      </span>
                    </div>

                    {/* Problemática */}
                    <div>
                      <h4 className="font-heading font-black text-sm text-[#1a2527] line-clamp-2">
                        {report.ai_summary || report.description}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                        📍 {report.reference}
                      </p>
                    </div>

                    {/* DETALLADO COMPLETO REQUERIDO (SIN DATOS PERSONALES):
                        HORA, PUNTO DE ENCUENTRO, QUIEN APROBÓ, RESPONSABLE Y CONTACTO */}
                    <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9]/50 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Fecha y Hora:</span>
                        <span className="font-bold text-[#1a2527]">
                          {ext.scheduled_date
                            ? new Date(ext.scheduled_date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })
                            : 'Sábado 21 Nov, 08:30 AM'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Punto de Encuentro:</span>
                        <span className="font-bold text-slate-800 line-clamp-1 max-w-[200px]">
                          {ext.meeting_point || 'Frente a la losa comunal del sector'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Aprobado por:</span>
                        <span className="font-bold text-[#d30684]">
                          Coordinación Territorial Hilando Voces (SJL)
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Encargado / Responsable:</span>
                        <span className="font-bold text-[#588157]">
                          Brigada Juvenil Comunal #4 · Lideresa de Campo
                        </span>
                      </div>

                      {/* Contacto de la persona con la que se coordina (Sin datos personales) */}
                      {report.coordinator_whatsapp && (
                        <div className="flex items-center justify-between pt-1 border-t border-[#D3B9B9]/40">
                          <span className="text-slate-500">Contacto de Coordinación:</span>
                          <span className="font-mono font-bold text-slate-800">
                            Vecino Coordinador (WhatsApp: {report.coordinator_whatsapp})
                          </span>
                        </div>
                      )}

                      {ext.tools_available && ext.tools_available.length > 0 && (
                        <div className="pt-1 border-t border-[#D3B9B9]/40">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Herramientas comprometidas:</span>
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
                      className="flex-1 py-2 px-3 rounded-xl bg-[#FAF8F5] hover:bg-[#fdf2f8] border border-[#D3B9B9] text-xs font-bold text-[#1a2527] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <GoogleIcon name="print" size={15} className="text-[#E4981E]" />
                      <span>Ficha Técnica Oficial</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenResolveModal(report)}
                      className="py-2 px-3 rounded-xl bg-[#588157] hover:bg-[#476b46] text-white text-xs font-bold flex items-center justify-center space-x-1 shadow-xs transition-all cursor-pointer"
                    >
                      <GoogleIcon name="task_alt" size={15} />
                      <span>Concluir Faena</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
