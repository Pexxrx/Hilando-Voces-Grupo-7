'use client';

import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Lightbulb, 
  Trash2, 
  TreePine, 
  CheckCircle2, 
  Sparkles, 
  FileText, 
  RefreshCw,
  X,
  Phone,
  Calendar,
  Layers,
  ArrowUpRight,
  Users,
  MessageSquare
} from 'lucide-react';
import { TerritorialMap } from '@/components/TerritorialMap';
import { FaenaSheetModal } from '@/components/FaenaSheetModal';
import { Report } from '@/types';

export default function AdminDashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [axisFilter, setAxisFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Modales
  const [showFaenaModal, setShowFaenaModal] = useState(false);
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolvePhoto, setResolvePhoto] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      if (data.reports) {
        setReports(data.reports);
        if (data.reports.length > 0 && !selectedReport) {
          setSelectedReport(data.reports[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Filtrado reactivo
  const filteredReports = reports.filter((r) => {
    if (axisFilter !== 'todos' && r.axis !== axisFilter) return false;
    if (statusFilter !== 'todos' && r.status !== statusFilter) return false;
    return true;
  });

  // Métricas barriales
  const totalReports = reports.length;
  const alumbradoCount = reports.filter((r) => r.axis === 'alumbrado').length;
  const basuraCount = reports.filter((r) => r.axis === 'microbasurales').length;
  const espaciosCount = reports.filter((r) => r.axis === 'espacios_recreativos').length;
  const resolvedCount = reports.filter((r) => r.status === 'resuelto').length;

  // Cambiar estado a faena programada
  const handleScheduleFaena = async (reportId: string) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'faena_programada' }),
      });
      if (res.ok) {
        setShowFaenaModal(false);
        fetchReports();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Resolver caso con foto de "Después"
  const handleResolveCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    setUpdating(true);

    try {
      const res = await fetch(`/api/admin/reports/${selectedReport.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'resuelto',
          photo_after_url: resolvePhoto,
        }),
      });

      if (res.ok) {
        setShowResolveModal(false);
        setResolvePhoto(null);
        fetchReports();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resuelto':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-sm">
            Resuelto
          </span>
        );
      case 'faena_programada':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-300 shadow-sm">
            Faena Programada
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-red-50 text-red-700 border border-red-200 shadow-sm">
            En Proceso
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-6 lg:px-8 space-y-6 text-[#1a2527]">
      {/* Cabecera del Centro de Comando */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D3B9B9]/70 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xl"></span>
            <span className="text-xs font-bold uppercase tracking-widest text-[#E4981E]">
              Inteligencia Territorial & Liderazgo Juvenil
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#d30684] tracking-tight mt-1">
            Tablero de Coordinación Comunitaria
          </h1>
          <p className="text-xs sm:text-sm text-[#bd0474] mt-1">
            San Juan de Lurigancho (SJL) · Autogestión Barrial e Independencia Municipal
          </p>
        </div>

        <button
          onClick={fetchReports}
          disabled={loading}
          className="px-4 py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F3E8E8] border border-[#D3B9B9] text-xs font-bold text-[#d30684] flex items-center space-x-2 transition-all self-start md:self-auto cursor-pointer shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#E4981E] ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar Telemetría</span>
        </button>
      </div>

      {/* Tarjetas KPI de Métricas Barriales */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Casos */}
        <div className="bg-white p-5 rounded-3xl border border-[#D3B9B9]/70 shadow-sm hover:border-[#d30684] transition-all">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Total Casos</span>
          <span className="text-3xl font-bold font-heading text-[#d30684] mt-1 block tracking-tight">{totalReports}</span>
          <span className="text-[11px] text-[#bd0474]">Recibidos en SJL</span>
        </div>

        {/* Alumbrado */}
        <div className="bg-white p-5 rounded-3xl border border-[#D3B9B9]/70 shadow-sm hover:border-[#E4981E] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E4981E]">Alumbrado</span>
            <Lightbulb className="w-4 h-4 text-[#E4981E]" />
          </div>
          <span className="text-3xl font-bold font-heading text-[#d30684] mt-1 block tracking-tight">{alumbradoCount}</span>
          <span className="text-[11px] text-slate-500">Vías peatonales oscuras</span>
        </div>

        {/* Microbasurales */}
        <div className="bg-white p-5 rounded-3xl border border-[#D3B9B9]/70 shadow-sm hover:border-[#d30684] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#d30684]">Microbasurales</span>
            <Trash2 className="w-4 h-4 text-[#d30684]" />
          </div>
          <span className="text-3xl font-bold font-heading text-[#d30684] mt-1 block tracking-tight">{basuraCount}</span>
          <span className="text-[11px] text-slate-500">Focos infecciosos</span>
        </div>

        {/* Espacios Recreativos */}
        <div className="bg-white p-5 rounded-3xl border border-[#D3B9B9]/70 shadow-sm hover:border-[#E28A85] transition-all">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#E28A85]">Espacios Rec.</span>
            <TreePine className="w-4 h-4 text-[#E28A85]" />
          </div>
          <span className="text-3xl font-bold font-heading text-[#d30684] mt-1 block tracking-tight">{espaciosCount}</span>
          <span className="text-[11px] text-slate-500">Losas / Parques</span>
        </div>

        {/* Resueltos */}
        <div className="bg-white p-5 rounded-3xl border border-[#D3B9B9]/70 shadow-sm hover:border-[#16a34a] transition-all col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#16a34a]">Recuperados</span>
            <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
          </div>
          <span className="text-3xl font-bold font-heading text-[#16a34a] mt-1 block tracking-tight">{resolvedCount}</span>
          <span className="text-[11px] text-slate-500">Faenas concluidas</span>
        </div>
      </div>

      {/* Grid Principal: Mapa y Bandeja de Casos */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        {/* Columna Izquierda: Mapa Territorial (7 cols) */}
        <div className="xl:col-span-7 bg-white p-5 sm:p-6 rounded-3xl border border-[#D3B9B9]/70 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-heading font-bold text-[#d30684] flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-[#E28A85]" />
                <span>Mapa de Calor Territorial (San Juan de Lurigancho)</span>
              </h2>
              <p className="text-xs text-slate-500">
                Selecciona cualquier punto para cargar su expediente en la columna derecha.
              </p>
            </div>

            {/* Filtros */}
            <div className="flex items-center space-x-2 text-xs">
              <select
                value={axisFilter}
                onChange={(e) => setAxisFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#D3B9B9] text-[#d30684] font-semibold focus:outline-none focus:ring-1 focus:ring-[#d30684]"
              >
                <option value="todos">Todos los Ejes</option>
                <option value="alumbrado">Alumbrado</option>
                <option value="microbasurales">Microbasurales</option>
                <option value="espacios_recreativos">Espacios Recreativos</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-[#FAF8F5] border border-[#D3B9B9] text-[#d30684] font-semibold focus:outline-none focus:ring-1 focus:ring-[#d30684]"
              >
                <option value="todos">Todos los Estados</option>
                <option value="recibido">Recibido</option>
                <option value="faena_programada">Faena Programada</option>
                <option value="resuelto">Resuelto</option>
              </select>
            </div>
          </div>

          <TerritorialMap
            reports={filteredReports}
            selectedReportId={selectedReport?.id}
            onSelectReport={(rep) => setSelectedReport(rep)}
          />

          {/* Bandeja de incidencias filtradas */}
          <div className="pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#d30684] block mb-2.5">
              Expedientes en Bandeja ({filteredReports.length}):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
              {filteredReports.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedReport(r)}
                  className={`p-3.5 rounded-2xl border text-xs cursor-pointer transition-all ${
                    selectedReport?.id === r.id
                      ? 'border-[#d30684] bg-[#DAE3D9]/40 ring-1 ring-[#d30684] shadow-sm'
                      : 'border-[#D3B9B9]/70 bg-white hover:border-[#d30684] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono font-bold">
                    <span className="text-[#d30684]">{r.ticket_code}</span>
                    {getStatusBadge(r.status)}
                  </div>
                  <p className="text-[11px] text-slate-600 line-clamp-1 mt-1">{r.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Columna Derecha: Soberanía Humana vs Asistente Copiloto IA (5 cols) */}
        <div className="xl:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-[#D3B9B9]/70 shadow-sm space-y-6">
          {selectedReport ? (
            <>
              <div className="border-b border-[#D3B9B9]/60 pb-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-mono uppercase text-slate-500">Expediente Seleccionado</span>
                  <h3 className="font-mono text-2xl sm:text-3xl font-black text-[#d30684]">
                    {selectedReport.ticket_code}
                  </h3>
                </div>
                <div className="text-right">
                  {getStatusBadge(selectedReport.status)}
                  <span className="text-[11px] font-mono text-slate-500 block mt-1">
                    {new Date(selectedReport.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* 1. Área Principal: Soberanía de la Voz Vecinal */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#d30684] block">
                   Voz del Vecino (Transcripción 100% Original):
                </span>
                <p className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#DACCAF] text-xs sm:text-sm text-slate-700 italic leading-relaxed shadow-inner">
                  "{selectedReport.description}"
                </p>
                {selectedReport.reference && (
                  <div className="text-xs text-slate-500 flex items-center space-x-1 pl-1">
                    <MapPin className="w-3.5 h-3.5 text-[#E28A85]" />
                    <span>Referencia: {selectedReport.reference}</span>
                  </div>
                )}
              </div>

              {/* Foto de Evidencia Inicial */}
              {selectedReport.photo_before_url && (
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#d30684] block mb-1.5">
                    Evidencia Fotográfica Inicial:
                  </span>
                  <div className="h-40 w-full rounded-2xl overflow-hidden border border-[#D3B9B9] shadow-sm">
                    <img
                      src={selectedReport.photo_before_url}
                      alt="Evidencia"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}

              {/* 2. Caja Lateral: Copiloto IA (Gemini 3.8 Flash) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-[#DAE3D9]/40 border border-[#DAE3D9] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5 font-bold text-xs text-[#d30684]">
                    <Sparkles className="w-4 h-4 text-[#E4981E]" />
                    <span>Copiloto IA · Gemini 3.8 Flash</span>
                  </div>
                  <span className="text-[10px] bg-white text-[#d30684] border border-[#D3B9B9] px-2 py-0.5 rounded-full font-bold uppercase">
                    Orientativo
                  </span>
                </div>

                <div className="text-xs text-[#1a2527] space-y-1">
                  <span className="font-semibold block text-[#d30684]">Síntesis Territorial:</span>
                  <p className="leading-relaxed text-slate-700">{selectedReport.ai_summary || 'Sin síntesis disponible.'}</p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  {selectedReport.ai_tags?.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-0.5 rounded-lg bg-white border border-[#D3B9B9] text-[10px] font-semibold text-[#d30684]"
                    >
                      #{tag}
                    </span>
                  ))}
                  <span className="text-[11px] font-bold text-[#d30684] ml-auto">
                    Prioridad sugerida: <strong className="uppercase text-[#E28A85]">{selectedReport.priority_level}</strong>
                  </span>
                </div>
              </div>

              {/* Vecino Coordinador */}
              {selectedReport.wants_to_coordinate && selectedReport.coordinator_whatsapp && (
                <div className="p-4 bg-[#F3E8E8] border border-[#D3B9B9] rounded-2xl text-xs flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#d30684] block">Vecino Coordinador Inscrito</span>
                    <span className="text-slate-600">Disponible para articular la faena barrial.</span>
                  </div>
                  <a
                    href={`https://wa.me/51${selectedReport.coordinator_whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-[#d30684] hover:bg-[#bd0474] text-white font-bold flex items-center space-x-1.5 shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5 text-[#E4981E]" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              )}

              {/* Botones de Acción de Lideresa */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => setShowFaenaModal(true)}
                  className="flex-1 py-3.5 px-4 rounded-xl bg-[#FAF8F5] hover:bg-[#F3E8E8] border border-[#D3B9B9] text-[#d30684] text-xs font-bold flex items-center justify-center space-x-2 shadow-sm cursor-pointer transition-all hover:border-[#d30684]"
                >
                  <FileText className="w-4 h-4 text-[#E4981E]" />
                  <span>Ficha de Faena Comunal</span>
                </button>

                {selectedReport.status !== 'resuelto' && (
                  <button
                    type="button"
                    onClick={() => setShowResolveModal(true)}
                    className="flex-1 py-3.5 px-4 rounded-xl bg-[#d30684] hover:bg-[#bd0474] text-white text-xs font-bold flex items-center justify-center space-x-2 shadow-md shadow-[#d30684]/20 cursor-pointer transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#DAE3D9]" />
                    <span>Rendición de Cuentas</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-24 text-slate-400 text-sm font-mono">
              Selecciona un caso en el mapa o en la bandeja para inspeccionar.
            </div>
          )}
        </div>
      </div>

      {/* Modal de Ficha Técnica */}
      {showFaenaModal && selectedReport && (
        <FaenaSheetModal
          report={selectedReport}
          onClose={() => setShowFaenaModal(false)}
          onScheduleFaena={handleScheduleFaena}
        />
      )}

      {/* Modal de Cierre de Faena con Foto "Después" */}
      {showResolveModal && selectedReport && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleResolveCase}
            className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-[#D3B9B9] overflow-hidden space-y-6 p-6 text-[#1a2527]"
          >
            <div className="flex items-center justify-between border-b border-[#D3B9B9]/60 pb-3">
              <h3 className="font-heading font-bold text-lg text-[#d30684]">
                Rendición de Cuentas: Cierre de Faena
              </h3>
              <button
                type="button"
                onClick={() => setShowResolveModal(false)}
                className="text-slate-400 hover:text-[#d30684] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Para cerrar el caso <strong>{selectedReport.ticket_code}</strong> como <strong>Resuelto</strong>, adjunta la fotografía del espacio recuperado ("Después"). Esta evidencia se publicará de inmediato en la consulta vecinal pública.
            </p>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#d30684] mb-1.5">
                Fotografía del "Después":
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => setResolvePhoto(reader.result as string);
                    reader.readAsDataURL(file);
                  }
                }}
                className="block w-full text-xs text-slate-600 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#F3E8E8] file:text-[#d30684] hover:file:bg-[#ebdcdc] cursor-pointer"
              />
              {resolvePhoto && (
                <div className="mt-3 h-40 w-full rounded-2xl overflow-hidden border border-[#D3B9B9] shadow-sm">
                  <img src={resolvePhoto} alt="Después" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2.5 rounded-xl border border-[#D3B9B9] text-xs font-semibold text-slate-700 hover:bg-[#FAF8F5] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={updating}
                className="px-5 py-2.5 rounded-xl bg-[#d30684] hover:bg-[#bd0474] text-white text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-[#d30684]/20 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#DAE3D9]" />
                <span>{updating ? 'Guardando...' : 'Confirmar Resolución'}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
