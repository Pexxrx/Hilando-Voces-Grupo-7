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
  const [activeFolder, setActiveFolder] = useState<string>('todos');
  const [starredIds, setStarredIds] = useState<Set<string>>(
    new Set(reports.filter((r) => r.priority_level === 'alta').map((r) => r.id))
  );
  const [updating, setUpdating] = useState(false);

  // Comentarios / Notas de coordinación de la lideresa por reporte
  const [leaderComments, setLeaderComments] = useState<Record<string, string>>({});
  const [currentComment, setCurrentComment] = useState('');
  const [commentSaved, setCommentSaved] = useState(false);

  // Alternar estrella (marcar como prioritario)
  const toggleStar = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setStarredIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Filtrado estilo Gmail
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
      if (!codeMatch && !descMatch && !refMatch && !summaryMatch) return false;
    }

    return true;
  });

  const handleStatusChange = async (newStatus: ReportStatus) => {
    if (!selectedReport) return;
    setUpdating(true);
    await onUpdateStatus(selectedReport.id, newStatus);
    setUpdating(false);
  };

  const handleSaveComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport || !currentComment.trim()) return;
    setLeaderComments((prev) => ({
      ...prev,
      [selectedReport.id]: currentComment.trim(),
    }));
    setCommentSaved(true);
    setTimeout(() => setCommentSaved(false), 2500);
  };

  // Estandarización de badges con la paleta de colores oficial aprobada
  const getAxisPill = (axis: ReportAxis) => {
    switch (axis) {
      case 'alumbrado':
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#FFFBEB] text-[#E4981E] border border-[#E4981E]/30 flex items-center space-x-1 shrink-0">
            <GoogleIcon name="lightbulb" size={12} className="text-[#E4981E]" />
            <span>Alumbrado</span>
          </span>
        );
      case 'microbasurales':
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#FAF8F5] text-[#E28A85] border border-[#E28A85]/40 flex items-center space-x-1 shrink-0">
            <GoogleIcon name="delete_sweep" size={12} className="text-[#E28A85]" />
            <span>Microbasural</span>
          </span>
        );
      case 'espacios_recreativos':
        return (
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-[#F0FDF4] text-[#588157] border border-[#588157]/30 flex items-center space-x-1 shrink-0">
            <GoogleIcon name="park" size={12} className="text-[#588157]" />
            <span>Espacio Público</span>
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resuelto':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#F0FDF4] text-[#588157] border border-[#588157]/40">
            Resuelto
          </span>
        );
      case 'faena_programada':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#FFFBEB] text-[#E4981E] border border-[#E4981E]/40">
            Faena Programada
          </span>
        );
      case 'en_evaluacion':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#fdf2f8] text-[#d30684] border border-[#d30684]/30">
            En Evaluación
          </span>
        );
      default:
        // Recibido en tono neutro Linen para no alarmar ni confundir con crítico
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-[#F3E8E8] text-[#1a2527] border border-[#D3B9B9]">
            Recibido
          </span>
        );
    }
  };

  // Generador de Asunto Inteligente de la IA a partir de la descripción (Sin nombres personales)
  const generateSubjectFromReport = (r: Report) => {
    if (r.ai_summary) {
      // Extrae la primera frase concisa
      const clean = r.ai_summary.split('.')[0];
      return clean.length > 70 ? clean.slice(0, 70) + '...' : clean;
    }
    return `Incidencia en ${r.reference || 'San Juan de Lurigancho'}`;
  };

  // Generador del Plan de Acción Recomendado por la IA
  const getAIActionPlan = (r: Report) => {
    if (r.axis === 'alumbrado') {
      return {
        title: 'Plan Comunal de Iluminación Segura',
        steps: [
          'Coordinar con la brigada de electricidad para inspección de cables y sockets.',
          'Separar escalera de tijera (mínimo 5m) con el vecino voluntario de la zona.',
          'Instalar luminarias LED comunales o reflectores de 50W en puntos ciegos.',
          'Notificar a la junta vecinal y comité de seguridad del pasaje.',
        ],
        tools: 'Escalera telescópica, taladro percutor, cinta aislante 3M, cinta reflectiva.',
        estimatedHours: '2 horas de jornada comunitaria',
      };
    }
    if (r.axis === 'microbasurales') {
      return {
        title: 'Plan de Erradicación de Basural y Sembrado',
        steps: [
          'Convocatoria a vecinos colindantes para jornada matutina de recojo.',
          'Despeje de residuos sólidos pesados y escombros con carretillas.',
          'Desinfección de la zona con cal viva o lejía industrial.',
          'Siembra de buganvilias o colocación de llantas maceteras para evitar reincidencia.',
        ],
        tools: '4 palas tipo cuchara, 3 carretillas, bolsas 140L, guantes de cuero, cal.',
        estimatedHours: '3 horas de faena vecinal',
      };
    }
    return {
      title: 'Plan de Recuperación de Espacio Recreativo',
      steps: [
        'Inspección de juegos o arcos de losa y listado de repuestos (pernos/mallas).',
        'Lijado y pintado anticorrosivo de estructuras metálicas y demarcación.',
        'Instalación de sistema casero de riego por goteo con bidones reciclados.',
        'Acta vecinal de cuidado compartido para uso de niñas y niños.',
      ],
      tools: 'Compresora o rodillos, esmalte sintético, brochas, lijas de fierro, pernos.',
      estimatedHours: '4 horas de trabajo en equipo',
    };
  };

  return (
    <div className="space-y-4">
      {/* 1. BARRA SUPERIOR ESTILO GMAIL: Búsqueda y Carpetas con Densidad Cómoda */}
      <div className="bg-white p-4 rounded-3xl border border-[#D3B9B9]/50 shadow-sm space-y-3">
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
              placeholder="Buscar por código de ticket, problemática o sector de SJL..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9]/60 text-xs text-[#1a2527] placeholder:text-slate-400 focus:outline-none focus:border-[#d30684] focus:ring-1 focus:ring-[#d30684]"
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
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-1 border-t border-[#D3B9B9]/40">
          <button
            type="button"
            onClick={() => setActiveFolder('todos')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 cursor-pointer ${
              activeFolder === 'todos'
                ? 'bg-[#1a2527] text-white shadow-xs'
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
                ? 'bg-[#d30684] text-white shadow-xs'
                : 'bg-[#FAF8F5] text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            <GoogleIcon name="star" filled size={16} className={activeFolder === 'alta' ? 'text-white' : 'text-[#d30684]'} />
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
                ? 'bg-[#1a2527] text-white shadow-xs'
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
                ? 'bg-[#d30684] text-white shadow-xs'
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
                ? 'bg-[#E4981E] text-white shadow-xs'
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
                ? 'bg-[#588157] text-white shadow-xs'
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

      {/* 2. BANDEJA GMAIL DENSIDAD CÓMODA: LISTA DE EXPEDIENTES + PANEL DE LECTURA CONTINUO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[640px]">
        {/* COLUMNA IZQUIERDA: LISTA DE MENSAJES (DENSIDAD CÓMODA, ASUNTO GENERADO POR IA, CERO DATOS PERSONALES) */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-[#D3B9B9]/50 shadow-sm flex flex-col overflow-hidden max-h-[780px]">
          <div className="p-3.5 bg-[#FAF8F5] border-b border-[#D3B9B9]/50 flex items-center justify-between text-xs text-slate-600 font-bold">
            <span>Buzón Comunal ({filtered.length})</span>
            <span className="text-[11px] text-slate-400 font-normal">Densidad Cómoda</span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#D3B9B9]/40">
            {filtered.length === 0 ? (
              <div className="p-10 text-center text-slate-400 space-y-2">
                <GoogleIcon name="inbox" size={36} className="text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-[#1a2527]">No se encontraron reportes en esta carpeta.</p>
                <p className="text-[11px] text-slate-500">Prueba ajustando los filtros de búsqueda.</p>
              </div>
            ) : (
              filtered.map((report) => {
                const isSelected = selectedReport?.id === report.id;
                const isStarred = starredIds.has(report.id);
                const subject = generateSubjectFromReport(report);

                return (
                  <div
                    key={report.id}
                    onClick={() => onSelectReport(report)}
                    className={`p-4 transition-all cursor-pointer select-none space-y-2 relative ${
                      isSelected
                        ? 'bg-[#fdf2f8] border-l-4 border-l-[#d30684]'
                        : 'hover:bg-[#FAF8F5] bg-white border-l-4 border-l-transparent'
                    }`}
                  >
                    {/* Fila 1: Asunto IA + Estrella + Fecha */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2 min-w-0">
                        <button
                          type="button"
                          onClick={(e) => toggleStar(e, report.id)}
                          className="text-slate-300 hover:text-[#d30684] transition-colors cursor-pointer shrink-0"
                          title={isStarred ? 'Quitar de destacados' : 'Marcar como prioritario'}
                        >
                          <GoogleIcon
                            name="star"
                            filled={isStarred}
                            size={16}
                            className={isStarred ? 'text-[#d30684]' : 'text-slate-300'}
                          />
                        </button>
                        <span className="font-heading font-black text-xs text-[#1a2527] truncate">
                          {subject}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">
                        {new Date(report.created_at).toLocaleDateString([], {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                    </div>

                    {/* Fila 2: Snippet de la Voz del Vecino */}
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      {report.description}
                    </p>

                    {/* Fila 3: Código + Eje Temático + Estado */}
                    <div className="flex items-center justify-between pt-0.5 text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[10px] font-black text-[#d30684]">
                          {report.ticket_code}
                        </span>
                        {getAxisPill(report.axis)}
                      </div>
                      {getStatusBadge(report.status)}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: PANEL DE LECTURA CONTINUO (SIN DIVISIONES RÍGIDAS) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-[#D3B9B9]/50 shadow-sm flex flex-col overflow-hidden max-h-[780px]">
          {selectedReport ? (
            <div className="flex-1 overflow-y-auto p-6 sm:p-7 space-y-6">
              {/* 1. LO PRIMERO: CÓDIGO / QUÉ TEMA ES / ESTADO / FECHA */}
              <div className="border-b border-[#D3B9B9]/50 pb-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-black text-[#d30684] bg-[#fdf2f8] px-3 py-1 rounded-xl border border-[#d30684]/20">
                      {selectedReport.ticket_code}
                    </span>
                    {getAxisPill(selectedReport.axis)}
                    {getStatusBadge(selectedReport.status)}
                  </div>

                  <span className="text-xs text-slate-500 font-medium">
                    Recibido el{' '}
                    {new Date(selectedReport.created_at).toLocaleString([], {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>

                {/* ASUNTO GENERADO POR IA (EN VEZ DE NOMBRE DE VECINO) */}
                <h3 className="font-heading font-black text-lg text-[#1a2527] pt-1">
                  {generateSubjectFromReport(selectedReport)}
                </h3>
                <p className="text-xs text-slate-500">
                  📍 Ubicación de referencia: <strong>{selectedReport.reference || 'San Juan de Lurigancho'}</strong> (Ubigeo: {selectedReport.ubigeo || '150132'})
                </p>
              </div>

              {/* 2. SIGUIENTE LÍNEA: VOZ DEL VECINO ORIGINAL + PLAN DE SOLUCIÓN DE LA IA (EN UN CUADRO AL COSTADO) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Lado izquierdo (7 cols): Mensaje del Vecino Original */}
                <div className="md:col-span-7 space-y-2">
                  <span className="text-xs font-bold text-[#1a2527] flex items-center space-x-1.5">
                    <GoogleIcon name="record_voice_over" size={16} className="text-[#d30684]" />
                    <span>Mensaje Ciudadano (Voz del Vecino):</span>
                  </span>
                  <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9]/60 text-xs text-slate-800 leading-relaxed italic relative">
                    <span className="text-3xl text-[#d30684]/25 font-serif absolute top-1 left-2 select-none">“</span>
                    <p className="pl-4 relative z-10 whitespace-pre-line font-sans not-italic text-slate-800">
                      {selectedReport.description}
                    </p>
                  </div>
                </div>

                {/* Lado derecho (5 cols): Cuadro de Recomendación y Plan de Acción de la IA */}
                <div className="md:col-span-5 space-y-2">
                  <span className="text-xs font-bold text-[#d30684] flex items-center space-x-1.5">
                    <GoogleIcon name="lightbulb" size={16} className="text-[#E4981E]" />
                    <span>Plan Recomendado por la IA:</span>
                  </span>
                  {(() => {
                    const plan = getAIActionPlan(selectedReport);
                    return (
                      <div className="p-4 rounded-2xl bg-[#FFFBEB]/70 border border-[#E4981E]/30 text-xs space-y-2">
                        <span className="font-bold text-[#1a2527] block text-[11px]">
                          {plan.title}
                        </span>
                        <ul className="space-y-1 text-[11px] text-slate-700 list-disc list-inside">
                          {plan.steps.map((st, i) => (
                            <li key={i} className="leading-tight">{st}</li>
                          ))}
                        </ul>
                        <div className="pt-1.5 border-t border-[#E4981E]/20 text-[10px] text-slate-600">
                          <span className="font-bold text-slate-800">Herramientas sugeridas: </span>
                          <span>{plan.tools}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* 3. SIGUIENTE LÍNEA: EVIDENCIAS DE LO OCURRIDO (FOTOS ANTES / DESPUÉS) */}
              <div className="space-y-2 pt-1">
                <span className="text-xs font-bold text-[#1a2527] block">Evidencia Visual:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Foto Antes */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Evidencia Inicial
                    </span>
                    <div className="h-44 rounded-2xl overflow-hidden border border-[#D3B9B9]/50 bg-slate-100 relative group">
                      {selectedReport.photo_before_url ? (
                        <img
                          src={selectedReport.photo_before_url}
                          alt="Evidencia antes"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
                          <GoogleIcon name="image_not_supported" size={28} />
                          <span>Sin foto registrada</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Foto Después */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-[#588157] uppercase tracking-wider block">
                      Resultado de Faena (Después)
                    </span>
                    <div className="h-44 rounded-2xl overflow-hidden border border-[#D3B9B9]/50 bg-slate-100 relative group">
                      {selectedReport.photo_after_url ? (
                        <img
                          src={selectedReport.photo_after_url}
                          alt="Evidencia después"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs p-4 text-center space-y-1">
                          <GoogleIcon name="pending" size={28} className="text-[#E4981E]" />
                          <span className="font-bold text-slate-600">Pendiente de Ejecución</span>
                          <span className="text-[10px] text-slate-400">
                            Se registrará al finalizar la faena barrial.
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. BOTONES EN LISTA DE GESTIÓN: EVALUACIÓN, FAENA, RESUELTO, RECHAZADO + CALENDARIZAR */}
              <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#D3B9B9]/60 space-y-3">
                <span className="text-xs font-bold text-[#1a2527] block">
                  Acciones de Estado y Gestión Comunal:
                </span>
                <div className="flex flex-wrap items-center gap-2">
                  {selectedReport.status !== 'en_evaluacion' && (
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => handleStatusChange('en_evaluacion')}
                      className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FAF8F5] text-[#d30684] border border-[#d30684]/40 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <GoogleIcon name="manage_search" size={15} />
                      <span>Poner En Evaluación</span>
                    </button>
                  )}

                  {selectedReport.status !== 'faena_programada' && selectedReport.status !== 'resuelto' && (
                    <button
                      type="button"
                      onClick={() => onScheduleFaena(selectedReport)}
                      className="px-3.5 py-2 rounded-xl bg-[#FFFBEB] hover:bg-[#FEF3C7] text-[#E4981E] border border-[#E4981E]/40 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <GoogleIcon name="calendar_month" size={15} />
                      <span>Calendarizar Faena Barrial</span>
                    </button>
                  )}

                  {selectedReport.status !== 'resuelto' && (
                    <button
                      type="button"
                      onClick={() => onOpenResolveModal(selectedReport)}
                      className="px-3.5 py-2 rounded-xl bg-[#588157] hover:bg-[#476b46] text-white text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                    >
                      <GoogleIcon name="task_alt" size={15} />
                      <span>Marcar como Resuelto</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const reason = prompt('Indica el motivo de desestimación para el ciudadano:');
                      if (reason) {
                        alert(`Caso desestimado con sustento: "${reason}"`);
                        handleStatusChange('resuelto');
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <GoogleIcon name="block" size={15} />
                    <span>Rechazar / Desestimar</span>
                  </button>
                </div>
              </div>

              {/* 5. CAJA DE COMENTARIOS Y EXPLICACIÓN DE LA LIDERESA AL CIUDADANO */}
              <div className="space-y-2 pt-1 border-t border-[#D3B9B9]/50">
                <span className="text-xs font-bold text-[#1a2527] flex items-center space-x-1.5">
                  <GoogleIcon name="chat" size={16} className="text-[#d30684]" />
                  <span>Mensaje de Coordinación / Explicación al Ciudadano:</span>
                </span>
                <p className="text-[11px] text-slate-500">
                  Escribe una respuesta para coordinar con los vecinos del pasaje o explicar la resolución/rechazo.
                </p>

                <form onSubmit={handleSaveComment} className="space-y-2">
                  <textarea
                    rows={3}
                    value={currentComment || leaderComments[selectedReport.id] || ''}
                    onChange={(e) => setCurrentComment(e.target.value)}
                    placeholder="Ejemplo: 'Estimados vecinos, la brigada juvenil inspeccionará el pasaje este viernes a las 6pm para verificar la altura de los postes...'"
                    className="w-full p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9]/60 text-xs text-[#1a2527] placeholder:text-slate-400 focus:outline-none focus:border-[#d30684]"
                  />

                  <div className="flex items-center justify-between">
                    {commentSaved && (
                      <span className="text-xs font-bold text-[#588157] flex items-center space-x-1">
                        <GoogleIcon name="check_circle" size={14} />
                        <span>Respuesta guardada para el expediente</span>
                      </span>
                    )}
                    <button
                      type="submit"
                      disabled={!currentComment.trim()}
                      className="ml-auto px-4 py-2 rounded-xl bg-[#d30684] hover:bg-[#bd0474] disabled:opacity-40 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                    >
                      Guardar Observación
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
              <GoogleIcon name="mark_email_read" size={48} className="text-slate-300" />
              <p className="text-sm font-bold text-[#1a2527]">Selecciona un reporte del buzón</p>
              <p className="text-xs text-slate-500 max-w-xs">
                Haz clic en cualquier incidencia de la izquierda para ver el asunto de la IA, el mensaje original y el plan sugerido.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
