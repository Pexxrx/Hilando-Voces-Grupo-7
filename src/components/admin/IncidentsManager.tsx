'use client';

import React, { useState } from 'react';
import { GoogleIcon } from '@/components/GoogleIcon';
import { Report, ReportAxis, ReportStatus, PriorityLevel } from '@/types';

interface IncidentsManagerProps {
  reports: Report[];
  selectedReport: Report | null;
  onSelectReport: (report: Report) => void;
  onScheduleFaena: (report: Report) => void;
  onOpenResolveModal: (report: Report) => void;
  onUpdateStatus: (reportId: string, status: ReportStatus) => Promise<void>;
}

export function IncidentsManager({
  reports,
  selectedReport,
  onSelectReport,
  onScheduleFaena,
  onOpenResolveModal,
  onUpdateStatus,
}: IncidentsManagerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [axisFilter, setAxisFilter] = useState<string>('todos');
  const [priorityFilter, setPriorityFilter] = useState<string>('todos');
  const [updating, setUpdating] = useState(false);

  // Filtrado de reportes
  const filtered = reports.filter((r) => {
    if (statusFilter !== 'todos' && r.status !== statusFilter) return false;
    if (axisFilter !== 'todos' && r.axis !== axisFilter) return false;
    if (priorityFilter !== 'todos' && r.priority_level !== priorityFilter) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const codeMatch = r.ticket_code.toLowerCase().includes(term);
      const descMatch = r.description.toLowerCase().includes(term);
      const refMatch = (r.reference || '').toLowerCase().includes(term);
      if (!codeMatch && !descMatch && !refMatch) return false;
    }

    return true;
  });

  const handleStatusChange = async (newStatus: ReportStatus) => {
    if (!selectedReport) return;
    setUpdating(true);
    await onUpdateStatus(selectedReport.id, newStatus);
    setUpdating(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resuelto':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-300">
            Resuelto
          </span>
        );
      case 'faena_programada':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-300">
            Faena Programada
          </span>
        );
      case 'en_evaluacion':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
            En Evaluación
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-50 text-red-700 border border-red-200">
            Recibido
          </span>
        );
    }
  };

  const getAxisBadge = (axis: string) => {
    switch (axis) {
      case 'alumbrado':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFFBEB] text-[#E4981E] border border-[#FDE68A]">
            Alumbrado
          </span>
        );
      case 'microbasurales':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF1F2] text-[#E28A85] border border-[#FECDD3]">
            Limpieza
          </span>
        );
      case 'espacios_recreativos':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0FDF4] text-[#588157] border border-[#BBF7D0]">
            Espacios
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-[#D3B9B9] shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por código (#HV-SJL-...), calle o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#D3B9B9] text-xs sm:text-sm text-[#1a2527] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d30684] shadow-sm font-medium"
            />
            <div className="absolute left-3 top-2.5">
              <GoogleIcon name="search" size={18} className="text-slate-400" />
            </div>
          </div>

          {/* Filtros Dropdown */}
          <div className="flex flex-wrap sm:flex-nowrap gap-2 text-xs">
            {/* Estado */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-white border border-[#D3B9B9] text-xs font-bold text-[#1a2527] focus:outline-none focus:ring-2 focus:ring-[#d30684] cursor-pointer shadow-sm"
            >
              <option value="todos">Todos los Estados</option>
              <option value="recibido">Recibido</option>
              <option value="en_evaluacion">En Evaluación</option>
              <option value="faena_programada">Faena Programada</option>
              <option value="resuelto">Resuelto</option>
            </select>

            {/* Eje */}
            <select
              value={axisFilter}
              onChange={(e) => setAxisFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-white border border-[#D3B9B9] text-xs font-bold text-[#1a2527] focus:outline-none focus:ring-2 focus:ring-[#d30684] cursor-pointer shadow-sm"
            >
              <option value="todos">Todos los Ejes</option>
              <option value="alumbrado">Alumbrado</option>
              <option value="microbasurales">Limpieza de basura</option>
              <option value="espacios_recreativos">Espacios comunitarios</option>
            </select>

            {/* Prioridad */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl bg-white border border-[#D3B9B9] text-xs font-bold text-[#1a2527] focus:outline-none focus:ring-2 focus:ring-[#d30684] cursor-pointer shadow-sm"
            >
              <option value="todos">Todas las Prioridades</option>
              <option value="alta">Alta</option>
              <option value="media">Media</option>
              <option value="baja">Baja</option>
            </select>
          </div>
        </div>

        {/* Resumen de resultados */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-[#D3B9B9]/50">
          <span>Mostrando <strong>{filtered.length}</strong> de {reports.length} reportes registrados</span>
          {(searchTerm || statusFilter !== 'todos' || axisFilter !== 'todos' || priorityFilter !== 'todos') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('todos');
                setAxisFilter('todos');
                setPriorityFilter('todos');
              }}
              className="text-[#d30684] font-bold hover:underline cursor-pointer"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Layout Master-Detail: Lista a la izquierda, Detalle a la derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Columna Izquierda: Lista de Tarjetas (5 columnas en LG) */}
        <div className="lg:col-span-5 space-y-3 max-h-[750px] overflow-y-auto pr-1">
          {filtered.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-[#D3B9B9] text-center text-slate-500 space-y-2">
              <GoogleIcon name="search_off" size={32} className="text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-[#1a2527]">No se encontraron reportes con estos criterios.</p>
              <p className="text-[11px]">Intenta cambiando los filtros o el término de búsqueda.</p>
            </div>
          ) : (
            filtered.map((report) => {
              const isSelected = selectedReport?.id === report.id;
              return (
                <div
                  key={report.id}
                  onClick={() => onSelectReport(report)}
                  className={`p-4 rounded-3xl border-2 transition-all cursor-pointer space-y-2 text-left ${
                    isSelected
                      ? 'border-[#d30684] bg-white ring-2 ring-[#d30684]/20 shadow-md'
                      : 'border-[#D3B9B9] bg-white hover:border-[#E28A85] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-[#d30684]">
                      {report.ticket_code}
                    </span>
                    <div className="flex items-center space-x-1.5">
                      {getAxisBadge(report.axis)}
                      {getStatusBadge(report.status)}
                    </div>
                  </div>

                  <p className="text-xs text-[#1a2527] font-medium line-clamp-2 leading-relaxed">
                    "{report.description}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-[#D3B9B9]/50">
                    <span className="truncate max-w-[180px] font-semibold text-slate-700">
                      📍 {report.reference || 'Sin dirección específica'}
                    </span>
                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Columna Derecha: Inspector / Detalle de Triaje (7 columnas en LG) */}
        <div className="lg:col-span-7">
          {selectedReport ? (
            <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-[#D3B9B9] shadow-sm space-y-6 sticky top-20">
              {/* Encabezado del Expediente */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D3B9B9] pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 block">
                    Expediente Comunitario
                  </span>
                  <div className="flex items-center space-x-3 mt-0.5">
                    <h3 className="font-heading font-black text-2xl text-[#d30684] font-mono">
                      {selectedReport.ticket_code}
                    </h3>
                    {getStatusBadge(selectedReport.status)}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {getAxisBadge(selectedReport.axis)}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-slate-100 text-slate-700 border border-slate-300">
                    Prioridad: {selectedReport.priority_level}
                  </span>
                </div>
              </div>

              {/* Testimonio Ciudadano */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1a2527] block">
                  Voz del Vecino (Testimonio Textual):
                </span>
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9] text-xs sm:text-sm text-slate-800 leading-relaxed italic">
                  "{selectedReport.description}"
                </div>
              </div>

              {/* Referencia y Ubicación */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9]">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Dirección o Referencia:
                  </span>
                  <span className="font-bold text-[#1a2527] block">
                    {selectedReport.reference || 'Ubicación identificada por coordenadas'}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                      Coordenadas GPS:
                    </span>
                    <span className="font-mono font-bold text-[#1a2527]">
                      {selectedReport.latitude.toFixed(4)}, {selectedReport.longitude.toFixed(4)}
                    </span>
                  </div>
                  <a
                    href={`https://www.google.com/maps?q=${selectedReport.latitude},${selectedReport.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-white border border-[#D3B9B9] text-[#d30684] hover:bg-[#fdf2f8] transition-colors cursor-pointer"
                    title="Ver en Google Maps"
                  >
                    <GoogleIcon name="open_in_new" size={16} />
                  </a>
                </div>
              </div>

              {/* Fotografía de la problemática (Antes) */}
              {selectedReport.photo_before_url && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1a2527] block">
                    Evidencia Fotográfica Inicial ("Antes"):
                  </span>
                  <div className="rounded-2xl border-2 border-[#D3B9B9] overflow-hidden bg-slate-50 max-h-56">
                    <img
                      src={selectedReport.photo_before_url}
                      alt="Evidencia del problema"
                      className="w-full h-56 object-cover"
                    />
                  </div>
                </div>
              )}

              {/* Asistente Copiloto Gemini IA */}
              <div className="p-4 rounded-2xl bg-[#fdf2f8] border-2 border-[#d30684]/30 space-y-2">
                <div className="flex items-center space-x-2 text-xs font-extrabold text-[#d30684]">
                  <GoogleIcon name="auto_awesome" filled size={16} className="text-[#d30684]" />
                  <span>Análisis de Copiloto Gemini 3.8 Flash</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {selectedReport.ai_summary || 'Análisis en proceso por el asistente barrial.'}
                </p>
                {selectedReport.ai_tags && selectedReport.ai_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {selectedReport.ai_tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white text-[#d30684] border border-[#d30684]/20"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Vecino Coordinador Voluntario */}
              {selectedReport.wants_to_coordinate && selectedReport.coordinator_whatsapp && (
                <div className="p-3.5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-[#92400e] block">Vecino disponible para apoyar:</span>
                    <span className="text-[11px] text-slate-600">Marcó deseo de coordinar la faena barrial</span>
                  </div>
                  <a
                    href={`https://api.whatsapp.com/send?phone=51${selectedReport.coordinator_whatsapp}&text=${encodeURIComponent(
                      `Hola vecino/a, te contactamos desde Hilando Voces SJL para coordinar la faena comunitaria de tu reporte ${selectedReport.ticket_code}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <GoogleIcon name="call" filled size={14} className="text-white" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              )}

              {/* Barra de Acciones de Triaje para la Lideresa */}
              <div className="pt-2 border-t border-[#D3B9B9] space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1a2527] block">
                  Acciones de Gestión para este Caso:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {selectedReport.status !== 'en_evaluacion' && (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => handleStatusChange('en_evaluacion')}
                      className="py-2.5 px-3 rounded-xl border border-[#D3B9B9] hover:bg-[#FAF8F5] text-xs font-bold text-slate-700 flex items-center justify-center space-x-1 transition-all cursor-pointer disabled:opacity-50"
                    >
                      <GoogleIcon name="pending_actions" size={16} />
                      <span>En Evaluación</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onScheduleFaena(selectedReport)}
                    className="py-2.5 px-3 rounded-xl bg-[#E4981E] hover:bg-[#DA9832] text-white text-xs font-bold shadow-sm flex items-center justify-center space-x-1 transition-all cursor-pointer"
                  >
                    <GoogleIcon name="calendar_month" filled size={16} className="text-white" />
                    <span>Programar Faena</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenResolveModal(selectedReport)}
                    className="py-2.5 px-3 rounded-xl bg-[#d30684] hover:bg-[#bd0474] text-white text-xs font-bold shadow-md shadow-[#d30684]/20 flex items-center justify-center space-x-1 transition-all cursor-pointer"
                  >
                    <GoogleIcon name="check_circle" filled size={16} className="text-white" />
                    <span>Resolver Caso</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border-2 border-dashed border-[#D3B9B9] text-center text-slate-400 space-y-3">
              <GoogleIcon name="touch_app" size={40} className="text-slate-300 mx-auto" />
              <h4 className="font-heading font-bold text-base text-[#1a2527]">
                Selecciona un reporte de la lista
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Toca cualquier caso a la izquierda para inspeccionar el testimonio vecinal, el análisis de Gemini IA y activar las acciones de faena comunitaria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
