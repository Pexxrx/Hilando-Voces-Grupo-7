'use client';

import React, { useState } from 'react';
import { GoogleIcon } from '@/components/GoogleIcon';
import { Report } from '@/types';

interface AccountabilityGalleryProps {
  reports: Report[];
  onOpenResolveModal: (report: Report) => void;
}

interface SocialPostState {
  viewMode: 'despues' | 'antes' | 'comparativa';
  likes: number;
  isLiked: boolean;
  comments: { author: string; role: string; text: string; time: string }[];
  showComments: boolean;
}

export function AccountabilityGallery({
  reports,
  onOpenResolveModal,
}: AccountabilityGalleryProps) {
  const [filter, setFilter] = useState<'todos' | 'resueltos' | 'en_faena'>('todos');
  const [selectedSector, setSelectedSector] = useState<string>('todos');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estados interactivos por publicación (likes, vista seleccionada, comentarios)
  const [postsState, setPostsState] = useState<Record<string, SocialPostState>>({
    'rep-sjl-004': {
      viewMode: 'despues',
      likes: 142,
      isLiked: false,
      showComments: false,
      comments: [
        {
          author: 'Vecina de Bayóvar',
          role: 'Madre de familia',
          text: '¡Muchísimas gracias a la brigada de Hilando Voces! Ahora mis hijas pueden salir al paradero sin miedo.',
          time: 'Hace 1 día',
        },
        {
          author: 'Delegado Manzana B',
          role: 'Vecino vigilante',
          text: 'Excelente trabajo comunitario. Ya instalamos el candado comunal para cuidar el parque.',
          time: 'Hace 18 horas',
        },
      ],
    },
    'rep-sjl-005': {
      viewMode: 'despues',
      likes: 98,
      isLiked: true,
      showComments: false,
      comments: [
        {
          author: 'Profesor del Colegio 0090',
          role: 'Docente barrial',
          text: 'El acceso al colegio quedó impecable, se eliminaron todos los desmontes y focos de infección.',
          time: 'Hace 2 días',
        },
      ],
    },
    'rep-sjl-010': {
      viewMode: 'despues',
      likes: 187,
      isLiked: false,
      showComments: false,
      comments: [
        {
          author: 'Joven Brigadista #4',
          role: 'Voluntario juvenil',
          text: 'Orgulloso de haber participado con las palas y los plantones. San Juan de Lurigancho avanza con sus mujeres lideresas.',
          time: 'Hace 3 días',
        },
      ],
    },
    'rep-sjl-014': {
      viewMode: 'despues',
      likes: 115,
      isLiked: false,
      showComments: false,
      comments: [
        {
          author: 'Coordinadora de Comedor Popular',
          role: 'Comuna 12',
          text: 'La escalera quedó iluminada y segura. Las mamás del comedor estamos eternamente agradecidas.',
          time: 'Hace 4 días',
        },
      ],
    },
    'rep-sjl-018': {
      viewMode: 'despues',
      likes: 76,
      isLiked: false,
      showComments: false,
      comments: [],
    },
    'rep-sjl-021': {
      viewMode: 'despues',
      likes: 64,
      isLiked: false,
      showComments: false,
      comments: [],
    },
    'rep-sjl-025': {
      viewMode: 'despues',
      likes: 133,
      isLiked: true,
      showComments: false,
      comments: [
        {
          author: 'Vecino Vigilante #8',
          role: 'Comuna 15',
          text: 'La colocación del reflector LED erradicó por completo el punto de venta de drogas en la losa.',
          time: 'Hace 5 días',
        },
      ],
    },
  });

  const [newCommentText, setNewCommentText] = useState<Record<string, string>>({});

  const resolved = reports.filter((r) => r.status === 'resuelto');
  const inFaena = reports.filter((r) => r.status === 'faena_programada');

  const displayedReports = reports.filter((r) => {
    // Filtro por estado
    if (filter === 'resueltos' && r.status !== 'resuelto') return false;
    if (filter === 'en_faena' && r.status !== 'faena_programada') return false;
    if (filter === 'todos' && r.status !== 'resuelto' && r.status !== 'faena_programada') return false;

    // Filtro por sector
    if (selectedSector !== 'todos') {
      const match = (r.reference || '').toLowerCase().includes(selectedSector.toLowerCase());
      if (!match) return false;
    }

    return true;
  });

  const getPostState = (reportId: string): SocialPostState => {
    return (
      postsState[reportId] || {
        viewMode: 'despues',
        likes: 45,
        isLiked: false,
        comments: [],
        showComments: false,
      }
    );
  };

  const handleToggleLike = (reportId: string) => {
    setPostsState((prev) => {
      const current = prev[reportId] || {
        viewMode: 'despues',
        likes: 45,
        isLiked: false,
        comments: [],
        showComments: false,
      };
      const nextLiked = !current.isLiked;
      return {
        ...prev,
        [reportId]: {
          ...current,
          isLiked: nextLiked,
          likes: nextLiked ? current.likes + 1 : current.likes - 1,
        },
      };
    });
  };

  const handleSetViewMode = (reportId: string, mode: 'despues' | 'antes' | 'comparativa') => {
    setPostsState((prev) => {
      const current = prev[reportId] || {
        viewMode: 'despues',
        likes: 45,
        isLiked: false,
        comments: [],
        showComments: false,
      };
      return {
        ...prev,
        [reportId]: {
          ...current,
          viewMode: mode,
        },
      };
    });
  };

  const handleToggleComments = (reportId: string) => {
    setPostsState((prev) => {
      const current = prev[reportId] || {
        viewMode: 'despues',
        likes: 45,
        isLiked: false,
        comments: [],
        showComments: false,
      };
      return {
        ...prev,
        [reportId]: {
          ...current,
          showComments: !current.showComments,
        },
      };
    });
  };

  const handleAddComment = (reportId: string) => {
    const text = (newCommentText[reportId] || '').trim();
    if (!text) return;

    setPostsState((prev) => {
      const current = prev[reportId] || {
        viewMode: 'despues',
        likes: 45,
        isLiked: false,
        comments: [],
        showComments: true,
      };
      return {
        ...prev,
        [reportId]: {
          ...current,
          showComments: true,
          comments: [
            ...current.comments,
            {
              author: 'Lideresa de Guardia',
              role: 'Equipo Hilando Voces',
              text,
              time: 'Ahora mismo',
            },
          ],
        },
      };
    });

    setNewCommentText((prev) => ({ ...prev, [reportId]: '' }));
  };

  const handleCopyShareLink = (ticketCode: string) => {
    const url = `${window.location.origin}/consultar?codigo=${ticketCode.replace('#', '')}`;
    navigator.clipboard.writeText(url);
    setCopiedId(ticketCode);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Banner Superior de Rendición de Cuentas Social */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#D3B9B9] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d30684] animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#d30684]">
              Bitácora Comunitaria Pública · San Juan de Lurigancho
            </span>
          </div>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-[#1a2527] tracking-tight">
            Rendición de Cuentas Social (Antes y Después)
          </h2>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Publicaciones en formato de red social que documentan de manera transparente la recuperación física de los espacios barriales. Comparte el impacto de las faenas con la comunidad de SJL.
          </p>
        </div>

        {/* Métricas de Impacto Comunal */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="px-4 py-3 rounded-2xl bg-[#DAE3D9]/40 border border-[#DAE3D9] text-center">
            <span className="text-2xl font-heading font-black text-[#1a2527] block leading-none">
              {resolved.length}
            </span>
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              Espacios Certificados
            </span>
          </div>

          <div className="px-4 py-3 rounded-2xl bg-[#fdf2f8] border border-[#d30684]/30 text-center">
            <span className="text-2xl font-heading font-black text-[#d30684] block leading-none">
              870+
            </span>
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              Agradecimientos Vecinales
            </span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros y Búsqueda por Sector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Pestañas de Estado */}
        <div className="flex rounded-2xl bg-white p-1.5 border border-[#D3B9B9] text-xs font-bold shadow-xs">
          <button
            type="button"
            onClick={() => setFilter('todos')}
            className={`py-2 px-3.5 rounded-xl transition-all cursor-pointer ${
              filter === 'todos'
                ? 'bg-[#d30684] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#d30684]'
            }`}
          >
            Todos ({reports.filter((r) => r.status === 'resuelto' || r.status === 'faena_programada').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('resueltos')}
            className={`py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
              filter === 'resueltos'
                ? 'bg-[#d30684] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#d30684]'
            }`}
          >
            <span>Certificados</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {resolved.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilter('en_faena')}
            className={`py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center space-x-1.5 ${
              filter === 'en_faena'
                ? 'bg-[#d30684] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#d30684]'
            }`}
          >
            <span>Faenas en Curso</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {inFaena.length}
            </span>
          </button>
        </div>

        {/* Filtro por Zona de SJL */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">Comuna / Sector:</span>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="text-xs font-bold bg-white border border-[#D3B9B9] rounded-2xl px-3 py-2 text-[#1a2527] focus:outline-none focus:border-[#d30684] cursor-pointer"
          >
            <option value="todos">Todos los sectores de SJL</option>
            <option value="Canto Grande">Canto Grande (Comuna 12)</option>
            <option value="Bayóvar">Bayóvar (Comuna 8)</option>
            <option value="Las Flores">Las Flores / Zárate</option>
            <option value="Mariscal Cáceres">Mariscal Cáceres (Comuna 15)</option>
            <option value="Huáscar">Huáscar (Comuna 6)</option>
          </select>
        </div>
      </div>

      {/* FEED ESTILO INSTAGRAM / RED SOCIAL DE ACCIÓN COMUNITARIA */}
      <div className="max-w-2xl mx-auto space-y-8">
        {displayedReports.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-[#D3B9B9] text-center text-slate-400 space-y-3">
            <GoogleIcon name="photo_camera" size={40} className="text-[#D3B9B9] mx-auto" />
            <p className="text-sm font-bold text-[#1a2527]">
              No hay publicaciones disponibles para este filtro en San Juan de Lurigancho.
            </p>
          </div>
        ) : (
          displayedReports.map((report) => {
            const isResolved = report.status === 'resuelto';
            const post = getPostState(report.id);
            const viewMode = post.viewMode;

            // Extraer comuna aproximada de la referencia
            const sectorName = report.reference?.includes('Canto Grande')
              ? 'Comuna 12 · Canto Grande'
              : report.reference?.includes('Bayóvar')
              ? 'Comuna 8 · Bayóvar'
              : report.reference?.includes('Las Flores')
              ? 'Comuna 4 · Las Flores'
              : report.reference?.includes('Mariscal Cáceres')
              ? 'Comuna 15 · Mariscal Cáceres'
              : 'San Juan de Lurigancho';

            return (
              <article
                key={report.id}
                className="bg-white rounded-3xl border border-[#D3B9B9] shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                {/* 1. CABECERA DEL POST (Perfil + Ubicación + Badge Oficial) */}
                <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#FAF8F5]">
                  <div className="flex items-center space-x-3 min-w-0">
                    {/* Avatar con borde degradado de acción comunitaria */}
                    <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-[#d30684] via-[#E4981E] to-[#E28A85] shrink-0">
                      <div className="w-full h-full rounded-full bg-white flex items-center justify-center">
                        <GoogleIcon name="volunteer_activism" size={20} filled className="text-[#d30684]" />
                      </div>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center space-x-1.5">
                        <span className="font-heading font-black text-sm text-[#1a2527] truncate">
                          hilandovoces.sjl
                        </span>
                        <GoogleIcon name="verified" filled size={16} className="text-[#d30684] shrink-0" />
                        <span className="text-[11px] text-slate-400">·</span>
                        <span className="text-[11px] font-mono font-bold text-[#d30684]">
                          {report.ticket_code}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate flex items-center space-x-1">
                        <span>📍 {sectorName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Estado Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 border ${
                      isResolved
                        ? 'bg-[#DAE3D9] text-[#1a2527] border-[#DAE3D9]'
                        : 'bg-[#FFFBEB] text-[#E4981E] border-[#FDE68A]'
                    }`}
                  >
                    {isResolved ? '✨ Recuperado' : '🛠️ Faena en Curso'}
                  </span>
                </div>

                {/* 2. SELECTOR DE VISTA FOTOGRÁFICA INTERACTIVA (Antes / Después / Comparativa) */}
                <div className="bg-[#FAF8F5] px-4 py-2 border-b border-[#D3B9B9]/50 flex items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-1">
                    <button
                      type="button"
                      onClick={() => handleSetViewMode(report.id, 'despues')}
                      className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                        viewMode === 'despues'
                          ? 'bg-[#d30684] text-white shadow-xs'
                          : 'text-slate-600 hover:text-[#d30684]'
                      }`}
                    >
                      <GoogleIcon name="check_circle" size={14} />
                      <span>Ver Después</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetViewMode(report.id, 'antes')}
                      className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                        viewMode === 'antes'
                          ? 'bg-[#d30684] text-white shadow-xs'
                          : 'text-slate-600 hover:text-[#d30684]'
                      }`}
                    >
                      <GoogleIcon name="history" size={14} />
                      <span>Ver Antes</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSetViewMode(report.id, 'comparativa')}
                      className={`px-3 py-1 rounded-xl font-bold transition-all cursor-pointer flex items-center space-x-1 ${
                        viewMode === 'comparativa'
                          ? 'bg-[#d30684] text-white shadow-xs'
                          : 'text-slate-600 hover:text-[#d30684]'
                      }`}
                    >
                      <GoogleIcon name="compare" size={14} />
                      <span>Lado a Lado</span>
                    </button>
                  </div>

                  <span className="text-[10px] text-slate-400 hidden sm:inline font-medium">
                    Evidencia certificada
                  </span>
                </div>

                {/* 3. BLOQUE MULTIMEDIA PRINCIPAL */}
                <div className="relative bg-black aspect-4/3 sm:aspect-16/10 overflow-hidden flex items-center justify-center">
                  {viewMode === 'comparativa' ? (
                    // Vista Dividida / Lado a Lado
                    <div className="w-full h-full grid grid-cols-2 divide-x-2 divide-white">
                      <div className="relative w-full h-full overflow-hidden bg-slate-900">
                        {report.photo_before_url ? (
                          <img
                            src={report.photo_before_url}
                            alt="Problema inicial antes"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                            Sin foto antes
                          </div>
                        )}
                        <span className="absolute top-3 left-3 px-2 py-0.5 rounded-lg bg-black/70 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                          Antes
                        </span>
                      </div>

                      <div className="relative w-full h-full overflow-hidden bg-slate-900">
                        {report.photo_after_url ? (
                          <img
                            src={report.photo_after_url}
                            alt="Espacio recuperado después"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-center p-3 text-slate-300 space-y-2">
                            <GoogleIcon name="add_a_photo" size={24} className="text-[#d30684]" />
                            <span className="text-[11px] font-bold">Faena pendiente de foto final</span>
                            <button
                              type="button"
                              onClick={() => onOpenResolveModal(report)}
                              className="px-2.5 py-1 rounded-lg bg-[#d30684] text-white text-[10px] font-bold cursor-pointer"
                            >
                              Subir Foto
                            </button>
                          </div>
                        )}
                        <span className="absolute top-3 right-3 px-2 py-0.5 rounded-lg bg-[#588157]/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                          Después
                        </span>
                      </div>
                    </div>
                  ) : viewMode === 'antes' ? (
                    // Solo Foto ANTES
                    <div className="relative w-full h-full">
                      {report.photo_before_url ? (
                        <img
                          src={report.photo_before_url}
                          alt="Problema inicial antes"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                          Sin foto inicial
                        </div>
                      )}
                      <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-[#E28A85]/95 text-[#1a2527] font-heading font-black text-xs uppercase tracking-wide shadow-md flex items-center space-x-1.5">
                        <GoogleIcon name="report_problem" size={16} />
                        <span>Antes · Problema Reportado</span>
                      </div>
                    </div>
                  ) : (
                    // Solo Foto DESPUÉS
                    <div className="relative w-full h-full">
                      {report.photo_after_url ? (
                        <img
                          src={report.photo_after_url}
                          alt="Espacio recuperado después"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-slate-300 space-y-3 bg-[#1a2527]">
                          <div className="w-14 h-14 rounded-2xl bg-[#fdf2f8] text-[#d30684] flex items-center justify-center">
                            <GoogleIcon name="add_a_photo" size={32} />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">Faena Comunitaria en Ejecución</p>
                            <p className="text-xs text-slate-400 max-w-xs mt-1">
                              Sube la fotografía final del espacio limpio para certificar el cierre del caso ante el barrio.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => onOpenResolveModal(report)}
                            className="px-4 py-2 rounded-xl bg-[#d30684] hover:bg-[#bd0474] text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center space-x-1.5"
                          >
                            <GoogleIcon name="photo_camera" size={16} />
                            <span>Certificar y Subir Foto Final</span>
                          </button>
                        </div>
                      )}
                      {report.photo_after_url && (
                        <div className="absolute top-3 left-3 px-3 py-1 rounded-xl bg-[#DAE3D9]/95 text-[#1a2527] font-heading font-black text-xs uppercase tracking-wide shadow-md flex items-center space-x-1.5">
                          <GoogleIcon name="verified" filled size={16} className="text-[#588157]" />
                          <span>Después · Espacio Comunitario Recuperado</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 4. BARRA DE INTERACCIÓN SOCIAL (Likes, Comentarios, Compartir, Ficha) */}
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {/* Botón de Like */}
                      <button
                        type="button"
                        onClick={() => handleToggleLike(report.id)}
                        className={`flex items-center space-x-1.5 text-xs font-bold transition-transform active:scale-125 cursor-pointer ${
                          post.isLiked ? 'text-[#d30684]' : 'text-slate-700 hover:text-[#d30684]'
                        }`}
                        title="Agradecer acción comunitaria"
                      >
                        <GoogleIcon
                          name={post.isLiked ? 'favorite' : 'favorite_border'}
                          filled={post.isLiked}
                          size={24}
                          className={post.isLiked ? 'text-[#d30684]' : 'text-slate-700'}
                        />
                      </button>

                      {/* Botón de Comentarios */}
                      <button
                        type="button"
                        onClick={() => handleToggleComments(report.id)}
                        className="flex items-center space-x-1 text-slate-700 hover:text-[#d30684] text-xs font-bold transition-colors cursor-pointer"
                        title="Ver testimonios vecinales"
                      >
                        <GoogleIcon name="chat_bubble_outline" size={22} />
                      </button>

                      {/* Botón Compartir Ficha de Impacto */}
                      <button
                        type="button"
                        onClick={() => handleCopyShareLink(report.ticket_code)}
                        className="flex items-center space-x-1 text-slate-700 hover:text-[#d30684] text-xs font-bold transition-colors cursor-pointer"
                        title="Compartir enlace vecinal"
                      >
                        <GoogleIcon name="share" size={22} />
                        {copiedId === report.ticket_code && (
                          <span className="text-[10px] text-[#588157] font-bold">¡Copiado!</span>
                        )}
                      </button>
                    </div>

                    {/* Botón Ficha de Impacto PDF */}
                    <button
                      type="button"
                      onClick={() => handleCopyShareLink(report.ticket_code)}
                      className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#DAE3D9]/50 border border-[#D3B9B9] text-[11px] font-bold text-[#1a2527] flex items-center space-x-1.5 transition-all cursor-pointer"
                    >
                      <GoogleIcon name="description" size={16} className="text-[#d30684]" />
                      <span>Ficha de Impacto</span>
                    </button>
                  </div>

                  {/* Contador de Agradecimientos Sociales */}
                  <div className="text-xs font-bold text-[#1a2527] flex items-center space-x-1">
                    <GoogleIcon name="volunteer_activism" filled size={14} className="text-[#d30684]" />
                    <span>A {post.likes} vecinas y vecinos de SJL les entusiasma esta transformación</span>
                  </div>

                  {/* 5. COPY NARRATIVO Y TESTIMONIO COMUNITARIO */}
                  <div className="space-y-2 text-xs leading-relaxed text-slate-800">
                    <p>
                      <strong className="text-[#1a2527] font-black mr-1.5">hilandovoces.sjl</strong>
                      ¡Misión cumplida en {report.reference || 'San Juan de Lurigancho'}! Gracias al trabajo articulado entre las lideresas territoriales y la brigada de jóvenes voluntarios, recuperamos este espacio para devolver la seguridad y la convivencia a nuestras familias.
                    </p>

                    {/* Voz del vecino sintetizada */}
                    <div className="p-3 rounded-2xl bg-[#FAF8F5] border-l-4 border-[#d30684] text-[11px] text-slate-700 italic">
                      "{report.description}"
                    </div>

                    {/* Chips de Impacto */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      <span className="px-2.5 py-1 rounded-xl bg-[#DAE3D9]/60 border border-[#DAE3D9] text-[10px] font-bold text-[#1a2527]">
                        👥 18 Voluntarios Participantes
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-[10px] font-bold text-[#E4981E]">
                        ⏱️ 4 Horas de Faena
                      </span>
                      <span className="px-2.5 py-1 rounded-xl bg-[#fdf2f8] border border-[#d30684]/20 text-[10px] font-bold text-[#d30684]">
                        🌱 Espacio Limpio y Seguro
                      </span>
                    </div>

                    {/* Hashtags Comunitarios */}
                    <div className="text-[11px] font-semibold text-[#d30684] space-x-1.5 pt-1">
                      <span>#HilandoVoces</span>
                      <span>#SanJuanDeLurigancho</span>
                      <span>#FaenaComunitaria</span>
                      <span>#LiderazgoFemenino</span>
                      <span>#SJLRecuperado</span>
                      <span>#Grupo7</span>
                    </div>

                    <div className="text-[10px] text-slate-400 uppercase tracking-wider pt-0.5 font-bold">
                      Publicado para la comunidad · Certificado con Ley N° 29733
                    </div>
                  </div>

                  {/* 6. SECCIÓN DE COMENTARIOS Y TESTIMONIOS VECINALES (Expandible) */}
                  {post.showComments && (
                    <div className="pt-3 border-t border-[#D3B9B9]/50 space-y-3">
                      <h4 className="font-heading font-bold text-xs text-[#1a2527] flex items-center space-x-1.5">
                        <GoogleIcon name="forum" size={16} className="text-[#d30684]" />
                        <span>Testimonios y Comentarios del Barrio ({post.comments.length})</span>
                      </h4>

                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {post.comments.length === 0 ? (
                          <p className="text-[11px] text-slate-400 italic">
                            Sé la primera lideresa en registrar una observación o testimonio.
                          </p>
                        ) : (
                          post.comments.map((comment, idx) => (
                            <div
                              key={idx}
                              className="p-2.5 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9]/40 text-xs space-y-0.5"
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-[#1a2527] text-[11px]">
                                  {comment.author} ·{' '}
                                  <span className="text-[#d30684] font-semibold text-[10px]">
                                    {comment.role}
                                  </span>
                                </span>
                                <span className="text-[10px] text-slate-400">{comment.time}</span>
                              </div>
                              <p className="text-slate-700 text-[11px]">{comment.text}</p>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Input para agregar comentario como lideresa */}
                      <div className="flex items-center space-x-2 pt-1">
                        <input
                          type="text"
                          value={newCommentText[report.id] || ''}
                          onChange={(e) =>
                            setNewCommentText((prev) => ({
                              ...prev,
                              [report.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddComment(report.id);
                          }}
                          placeholder="Añadir una felicitación o nota comunitaria..."
                          className="flex-1 bg-[#FAF8F5] border border-[#D3B9B9] rounded-xl px-3 py-1.5 text-xs text-[#1a2527] placeholder:text-slate-400 focus:outline-none focus:border-[#d30684]"
                        />
                        <button
                          type="button"
                          onClick={() => handleAddComment(report.id)}
                          className="px-3 py-1.5 rounded-xl bg-[#d30684] text-white text-xs font-bold hover:bg-[#bd0474] transition-all cursor-pointer shrink-0"
                        >
                          Publicar
                        </button>
                      </div>
                    </div>
                  )}

                  {!post.showComments && post.comments.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleToggleComments(report.id)}
                      className="text-[11px] text-slate-500 font-semibold hover:text-[#d30684] cursor-pointer pt-1 block"
                    >
                      Ver los {post.comments.length} comentarios de los vecinos...
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
