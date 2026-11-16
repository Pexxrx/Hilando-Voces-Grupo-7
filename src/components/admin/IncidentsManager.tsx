'use client';

import React, { useState } from 'react';
import { GoogleIcon } from '@/components/GoogleIcon';
import { Report, ReportAxis, ReportStatus } from '@/types';
import { ExtendedReport } from '@/data/mockReports';
import { evaluateIncidentAHP } from '@/lib/ahp';

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
  const [activeFolder, setActiveFolder] = useState<string>('todos'); // 'todos', 'recibido', 'alta', 'en_evaluacion', 'faena_programada', 'resuelto'
  const [starredIds, setStarredIds] = useState<Set<string>>(
    new Set(reports.filter((r) => r.priority_level === 'alta').map((r) => r.id))
  );
  const [updating, setUpdating] = useState(false);

  // Alternar estrella (marcar como prioritario / destacado)
  const toggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filtrado de incidencias estilo carpetas de correo Gmail
  const filtered = reports.filter((r) => {
    if (activeFolder === 'recibido' && r.status !== 'recibido') return false;
    if (activeFolder === 'alta' && !starredIds.has(r.id) && r.priority_level !== 'alta') return false;
    if (activeFolder === 'en_evaluacion' && r.status !== 'en_evaluacion') return false;
    if (activeFolder === 'faena_programada' && r.status !== 'faena_programada') return false;
    if (activeFolder === 'resuelto' && r.status !== 'resuelto') return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const codeMatch = r.ticket_code.toLowerCase().includes(term);
      const descMatch = r.description.toLowerCase().includes(term);
      const refMatch = (r.reference || '').toLowerCase().includes(term);
      const summaryMatch = (r.ai_summary || '').toLowerCase().includes(term);
      const coordMatch = ((r as ExtendedReport).coordinator_name || '').toLowerCase().includes(term);
      if (!codeMatch && !descMatch && !refMatch && !summaryMatch && !coordMatch) return false;
    }

    return true;
  });

  const handleStatusChange = async (newStatus: ReportStatus) => {
    if (!selectedReport) return;
    setUpdating(true);
    await onUpdateStatus(selectedReport.id, newStatus);
    setUpdating(false);
  };

  const getAxisPill = (axis: ReportAxis) => {
    switch (axis) {
      case 'alumbrado':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFFBEB] text-[#E4981E] border border-[#FDE68A] flex items-center space-x-1 shrink-0">
            <GoogleIcon name="lightbulb" size={12} className="text-[#E4981E]" />
            <span>Alumbrado</span>
          </span>
        );
      case 'microbasurales':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF2F2] text-[#E28A85] border border-red-200 flex items-center space-x-1 shrink-0">
            <GoogleIcon name="delete_sweep" size={12} className="text-[#E28A85]" />
            <span>Basural</span>
          </span>
        );
      case 'espacios_recreativos':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F0FDF4] text-[#588157] border border-emerald-200 flex items-center space-x-1 shrink-0">
            <GoogleIcon name="park" size={12} className="text-[#588157]" />
            <span>Espacio</span>
          </span>
        );
    }
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

  const activeExt = selectedReport as ExtendedReport | null;

  return (
    <div className="space-y-4">
      {/* BARRA SUPERIOR ESTILO GMAIL: Búsqueda y Pestañas de Carpetas */}
      <div className="bg-white p-4 rounded-3xl border border-[#D3B9B9] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Caja de Búsqueda estilo Gmail */}
          <div className="relative flex-1">
            <GoogleIcon
              name="search"
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en el buzón comunitario por código, zona, vecino o resumen..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9] text-xs text-[#1a2527] placeholder:text-slate-400 focus:outline-none focus:border-[#d30684] focus:ring-1 focus:ring-[#d30684]"
            />
          </div>

          <div className="flex items-center space-x-2 shrink-0 text-xs text-slate-500 font-medium">
            <span>
              Mostrando <strong className="text-[#1a2527]">{filtered.length}</strong> de{' '}
              <strong className="text-[#1a2527]">{reports.length}</strong> incidencias
            </span>
          </div>
        </div>

        {/* Pestañas de Carpetas tipo Gmail */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-[#D3B9B9]/50">
          <button
            type="button"
            onClick={() => setActiveFolder('todos')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeFolder === 'todos'
                ? 'bg-[#1a2527] text-white shadow-sm'
                : 'bg-[#FAF8F5] text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <GoogleIcon name="inbox" size={16} />
            <span>Todos</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-current">
              {reports.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFolder('alta')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeFolder === 'alta'
                ? 'bg-[#E4981E] text-white shadow-sm'
                : 'bg-[#FAF8F5] text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <GoogleIcon name="star" filled size={16} className={activeFolder === 'alta' ? 'text-white' : 'text-[#E4981E]'} />
            <span>Prioridad Alta</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-current">
              {starredIds.size}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFolder('recibido')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeFolder === 'recibido'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-[#FAF8F5] text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <GoogleIcon name="mark_email_unread" size={16} />
            <span>Recibidos</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-current">
              {reports.filter((r) => r.status === 'recibido').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFolder('en_evaluacion')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeFolder === 'en_evaluacion'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-[#FAF8F5] text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <GoogleIcon name="find_in_page" size={16} />
            <span>En Evaluación</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-current">
              {reports.filter((r) => r.status === 'en_evaluacion').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFolder('faena_programada')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeFolder === 'faena_programada'
                ? 'bg-[#E4981E] text-white shadow-sm'
                : 'bg-[#FAF8F5] text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <GoogleIcon name="calendar_month" size={16} />
            <span>Faenas</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-current">
              {reports.filter((r) => r.status === 'faena_programada').length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveFolder('resuelto')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeFolder === 'resuelto'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-[#FAF8F5] text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <GoogleIcon name="check_circle" size={16} />
            <span>Resueltos</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-current">
              {reports.filter((r) => r.status === 'resuelto').length}
            </span>
          </button>
        </div>
      </div>

      {/* BANDEJA SPLIT-VIEW ESTILO GMAIL: Lista a la Izquierda + Panel de Lectura a la Derecha */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[640px]">
        {/* COLUMNA IZQUIERDA: Lista de correos / reportes (Gmail Message List) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#D3B9B9] shadow-sm flex flex-col overflow-hidden max-h-[750px]">
          <div className="p-3.5 bg-[#FAF8F5] border-b border-[#D3B9B9] flex items-center justify-between text-xs text-slate-600 font-bold">
            <span>Buzón de Incidencias ({filtered.length})</span>
            <span className="text-[11px] text-slate-400 font-normal">Orden cronológico</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#D3B9B9]/50">
            {filtered.length === 0 ? (
              <div className="p-10 text-center text-slate-400 space-y-2">
                <GoogleIcon name="inbox" size={36} className="text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-[#1a2527]">No se encontraron reportes en esta carpeta.</p>
                <p className="text-[11px] text-slate-500">Prueba ajustando los filtros o el término de búsqueda.</p>
              </div>
            ) : (
              filtered.map((report) => {
                const isSelected = selectedReport?.id === report.id;
                const isStarred = starredIds.has(report.id);
                const ext = report as ExtendedReport;
                const senderName = ext.coordinator_name || 'Vecino Anónimo';

                return (
                  <div
                    key={report.id}
                    onClick={() => onSelectReport(report)}
                    className={`p-3.5 transition-all cursor-pointer select-none space-y-1.5 relative ${
                      isSelected
                        ? 'bg-[#fdf2f8] border-l-4 border-l-[#d30684]'
                        : 'hover:bg-[#FAF8F5]/80 bg-white border-l-4 border-l-transparent'
                    }`}
                  >
                    {/* Fila 1: Estrella + Remitente / Zona + Fecha */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={(e) => toggleStar(e, report.id)}
                          className="text-slate-300 hover:text-[#E4981E] transition-colors cursor-pointer"
                          title={isStarred ? 'Quitar de destacados' : 'Marcar como prioritario'}
                        >
                          <GoogleIcon
                            name="star"
                            filled={isStarred}
                            size={16}
                            className={isStarred ? 'text-[#E4981E]' : 'text-slate-300'}
                          />
                        </button>
                        <span className="font-bold text-[#1a2527] line-clamp-1 max-w-[150px]">
                          {senderName}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1.5">
                        {getAxisPill(report.axis)}
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(report.created_at).toLocaleDateString([], {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                      </div>
                    </div>

                    {/* Fila 2: Asunto (Resumen Copiloto Gemini) */}
                    <div className="text-xs font-bold text-slate-800 line-clamp-1">
                      {report.ai_summary || report.ticket_code}
                    </div>

                    {/* Fila 3: Snippet del Testimonio del Vecino */}
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {report.description}
                    </p>

                    {/* Fila 4: Código de Ticket, Score AHP y Estado */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-[10px] font-black text-[#d30684]">
                          {report.ticket_code}
                        </span>
                        <span className="font-mono text-[9px] font-bold text-slate-400 bg-slate-50 px-1 py-0.2 rounded border border-slate-200">
                          AHP: {evaluateIncidentAHP(report.description, report.axis, report.reference).ahp_score.toFixed(3)}
                        </span>
                      </div>
                      {getStatusBadge(report.status)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Panel de Lectura y Dossier del Reporte (Gmail Reading Pane) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#D3B9B9] shadow-sm flex flex-col overflow-hidden max-h-[750px]">
          {selectedReport ? (
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
              {/* CABECERA DEL CORREO / DOSSIER */}
              <div className="border-b border-[#D3B9B9]/60 pb-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-black text-[#d30684] bg-[#fdf2f8] px-2.5 py-1 rounded-xl border border-[#d30684]/20">
                      {selectedReport.ticket_code}
                    </span>
                    {getAxisPill(selectedReport.axis)}
                    {getStatusBadge(selectedReport.status)}
                  </div>

                  <span className="text-xs text-slate-500">
                    Registrado el{' '}
                    {new Date(selectedReport.created_at).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>

                {/* Remitente y Contacto Comunal */}
                <div className="flex items-start justify-between gap-3 pt-1">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#d30684] to-[#1a2527] text-white flex items-center justify-center font-bold text-sm shadow-sm">
                      {(activeExt?.coordinator_name || 'V').slice(0, 1)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-heading font-extrabold text-sm text-[#1a2527]">
                          {activeExt?.coordinator_name || 'Vecino/a de San Juan de Lurigancho'}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500 bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#D3B9B9]">
                          Ubigeo: {selectedReport.ubigeo || '150132'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">
                        📍 {selectedReport.reference || 'San Juan de Lurigancho, Lima'}
                      </p>
                    </div>
                  </div>

                  {/* Botón directo de WhatsApp para la líder */}
                  {selectedReport.coordinator_whatsapp && (
                    <a
                      href={`https://wa.me/51${selectedReport.coordinator_whatsapp}?text=${encodeURIComponent(
                        `Hola ${activeExt?.coordinator_name || 'vecino/a'}, te saludamos de la coordinación comunitaria de Hilando Voces respecto a tu reporte ${selectedReport.ticket_code}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer shrink-0"
                    >
                      <GoogleIcon name="chat" size={14} />
                      <span>WhatsApp ({selectedReport.coordinator_whatsapp})</span>
                    </a>
                  )}
                </div>
              </div>

              {/* BARRA DE ACCIONES DE GESTIÓN RÁPIDA */}
              <div className="bg-[#FAF8F5] p-3 rounded-2xl border border-[#D3B9B9] flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700">Acciones de Autogestión:</span>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedReport.status !== 'en_evaluacion' && (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => handleStatusChange('en_evaluacion')}
                      className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                    >
                      <GoogleIcon name="manage_search" size={14} />
                      <span>Poner En Evaluación</span>
                    </button>
                  )}

                  {selectedReport.status !== 'faena_programada' && selectedReport.status !== 'resuelto' && (
                    <button
                      type="button"
                      onClick={() => onScheduleFaena(selectedReport)}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-[#E4981E] border border-amber-200 text-xs font-bold flex items-center space-x-1 transition-colors cursor-pointer"
                    >
                      <GoogleIcon name="event" size={14} />
                      <span>Programar Faena Barrial</span>
                    </button>
                  )}

                  {selectedReport.status !== 'resuelto' && (
                    <button
                      type="button"
                      onClick={() => onOpenResolveModal(selectedReport)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center space-x-1 shadow-sm transition-all cursor-pointer"
                    >
                      <GoogleIcon name="task_alt" size={14} />
                      <span>Resolver y Subir Foto Después</span>
                    </button>
                  )}
                </div>
              </div>

              {/* CARD: SÍNTESIS Y TRIAJE DEL COPILOTO GEMINI + EVALUACIÓN AHP */}
              {(() => {
                const ahpData = evaluateIncidentAHP(
                  selectedReport.description,
                  selectedReport.axis,
                  selectedReport.reference
                );
                return (
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#fdf2f8] to-white border border-[#d30684]/30 space-y-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-2 h-2 rounded-full bg-[#d30684] animate-pulse" />
                        <span className="font-heading font-black text-xs uppercase tracking-wider text-[#d30684] flex items-center space-x-1">
                          <GoogleIcon name="smart_toy" size={16} />
                          <span>Síntesis y Triaje del Copiloto Gemini</span>
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-black bg-white border border-[#d30684]/40 text-[#d30684]">
                          AHP: {ahpData.ahp_score.toFixed(4)}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            ahpData.priority === 'alta'
                              ? 'bg-red-600 text-white'
                              : ahpData.priority === 'media'
                              ? 'bg-amber-500 text-white'
                              : 'bg-emerald-600 text-white'
                          }`}
                        >
                          {ahpData.priority.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs font-bold text-slate-800 leading-relaxed">
                      {selectedReport.ai_summary || 'Resumen no disponible para este reporte.'}
                    </p>

                    {/* Desglose de Criterios AHP de Saaty */}
                    <div className="p-2.5 rounded-xl bg-white/80 border border-[#D3B9B9]/50 space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold uppercase">
                        <span>Ponderación Multicriterio AHP (Grupo 7):</span>
                        <span className="text-[#d30684]">CR = 0.0221 (Consistente)</span>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5 text-center text-[10px]">
                        <div className="bg-[#FAF8F5] p-1 rounded">
                          <span className="text-slate-400 block text-[9px]">Seg (48.5%)</span>
                          <span className="font-bold text-slate-800">
                            {(ahpData.criteria_ratings.seguridad * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="bg-[#FAF8F5] p-1 rounded">
                          <span className="text-slate-400 block text-[9px]">Sal (22.7%)</span>
                          <span className="font-bold text-slate-800">
                            {(ahpData.criteria_ratings.salud * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="bg-[#FAF8F5] p-1 rounded">
                          <span className="text-slate-400 block text-[9px]">Equ (14.3%)</span>
                          <span className="font-bold text-slate-800">
                            {(ahpData.criteria_ratings.equidad * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="bg-[#FAF8F5] p-1 rounded">
                          <span className="text-slate-400 block text-[9px]">Alc (8.9%)</span>
                          <span className="font-bold text-slate-800">
                            {(ahpData.criteria_ratings.alcance * 100).toFixed(0)}%
                          </span>
                        </div>
                        <div className="bg-[#FAF8F5] p-1 rounded">
                          <span className="text-slate-400 block text-[9px]">Con (5.7%)</span>
                          <span className="font-bold text-slate-800">
                            {(ahpData.criteria_ratings.convivencia * 100).toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Etiquetas Temáticas */}
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {(selectedReport.ai_tags || ['SJL', 'Comunitario']).map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg bg-white border border-[#D3B9B9] text-[10px] font-semibold text-slate-600"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* CARD: VOZ DEL VECINO (TESTIMONIO CIUDADANO COMPLETO) */}
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-xs font-bold text-[#1a2527]">
                  <GoogleIcon name="record_voice_over" size={16} className="text-[#d30684]" />
                  <span>Voz del Vecino (Testimonio Ciudadano Original):</span>
                </div>
                <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9] text-xs text-slate-700 leading-relaxed italic relative">
                  <span className="text-3xl text-[#d30684]/30 font-serif absolute top-1 left-2 select-none">“</span>
                  <p className="pl-4 relative z-10 whitespace-pre-line font-sans not-italic text-slate-800">
                    {selectedReport.description}
                  </p>
                </div>
              </div>

              {/* CARD: DATOS DE COORDINACIÓN DE VOLUNTARIADO DE CAMPO */}
              {activeExt?.wants_to_coordinate && (
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs">
                  <div className="flex items-center space-x-2 text-amber-900 font-bold">
                    <GoogleIcon name="handshake" size={16} className="text-[#E4981E]" />
                    <span>Vecino Inscrito para Apoyar en Faena Barrial</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                    <div>
                      <span className="font-semibold block text-slate-500">Rol sugerido:</span>
                      <span className="font-bold text-[#1a2527]">{activeExt.volunteer_role || 'Coordinador de Campo'}</span>
                    </div>
                    <div>
                      <span className="font-semibold block text-slate-500">Herramientas que puede aportar:</span>
                      <span className="font-bold text-[#1a2527]">
                        {activeExt.tools_available?.join(', ') || 'Apoyo con mano de obra y refrigerios'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* EVIDENCIA VISUAL: ANTES Y DESPUÉS */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-[#1a2527] block">Evidencia Visual del Caso:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Foto Antes */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider block">
                      Condición Inicial (Reporte Vecinal)
                    </span>
                    <div className="h-44 rounded-2xl overflow-hidden border border-[#D3B9B9] bg-slate-100 relative group">
                      {selectedReport.photo_before_url ? (
                        <img
                          src={selectedReport.photo_before_url}
                          alt="Foto antes"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                          <GoogleIcon name="image_not_supported" size={32} />
                          <span>Sin foto registrada</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Foto Después */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider block">
                      Resultado Post-Faena Comunal
                    </span>
                    <div className="h-44 rounded-2xl overflow-hidden border border-[#D3B9B9] bg-slate-100 relative group">
                      {selectedReport.photo_after_url ? (
                        <img
                          src={selectedReport.photo_after_url}
                          alt="Foto después"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center space-y-1">
                          <GoogleIcon name="pending" size={28} className="text-amber-500" />
                          <span className="font-bold text-slate-600">Pendiente de Ejecución</span>
                          <span className="text-[10px] text-slate-400">
                            La foto del después se registrará al finalizar la faena comunitaria.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
              <GoogleIcon name="mark_email_read" size={48} className="text-slate-300" />
              <p className="text-sm font-bold text-[#1a2527]">Selecciona un reporte del buzón</p>
              <p className="text-xs text-slate-500 max-w-xs">
                Haz clic en cualquier incidencia de la izquierda para ver el análisis de Gemini, el testimonio y coordinar la faena.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
