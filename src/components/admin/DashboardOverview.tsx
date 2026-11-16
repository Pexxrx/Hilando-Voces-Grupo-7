'use client';

import React from 'react';
import { GoogleIcon } from '@/components/GoogleIcon';
import { TerritorialMap } from '@/components/TerritorialMap';
import { Report } from '@/types';
import { useAdminSession } from './AdminSessionContext';

interface DashboardOverviewProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
  onNavigateToTab: (tab: string) => void;
}

export function DashboardOverview({
  reports,
  onSelectReport,
  onNavigateToTab,
}: DashboardOverviewProps) {
  const { profile } = useAdminSession();

  // Métricas
  const total = reports.length;
  const pendientes = reports.filter((r) => r.status === 'recibido' || r.status === 'en_evaluacion').length;
  const faenas = reports.filter((r) => r.status === 'faena_programada').length;
  const resueltos = reports.filter((r) => r.status === 'resuelto').length;

  // Por eje
  const alumbrado = reports.filter((r) => r.axis === 'alumbrado').length;
  const basura = reports.filter((r) => r.axis === 'microbasurales').length;
  const espacios = reports.filter((r) => r.axis === 'espacios_recreativos').length;

  // Casos de alta prioridad orientados por Gemini Copilot
  const urgentReports = reports.filter((r) => r.priority_level === 'alta' && r.status !== 'resuelto');

  return (
    <div className="space-y-6">
      {/* Banner de Bienvenida y Sector Comunal */}
      <div className="bg-gradient-to-r from-white via-white to-[#fdf2f8] p-6 sm:p-7 rounded-3xl border border-[#D3B9B9] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d30684] animate-ping" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#d30684]">
              Territorio Activo · San Juan de Lurigancho
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1a2527] tracking-tight">
            Hola, {profile?.name.split(' ')[0]} 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            Centro de monitoreo comunitario de autogestión barrial. Tienes{' '}
            <strong className="text-[#d30684]">{pendientes} casos pendientes de triaje</strong> y{' '}
            <strong className="text-[#E4981E]">{faenas} faenas comunitarias programadas</strong> en el distrito.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateToTab('incidencias')}
            className="px-4 py-2.5 rounded-xl bg-[#d30684] hover:bg-[#bd0474] text-white font-bold text-xs shadow-md shadow-[#d30684]/20 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <GoogleIcon name="inbox" size={16} className="text-white" />
            <span>Ver Bandeja de Casos</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateToTab('faenas')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#D3B9B9] text-xs font-bold text-[#1a2527] flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <GoogleIcon name="calendar_month" size={16} className="text-[#E4981E]" />
            <span>Agenda de Faenas</span>
          </button>
        </div>
      </div>

      {/* Grid de KPIs Principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Reportes */}
        <div className="bg-white p-5 rounded-3xl border border-[#D3B9B9] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Reportes
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#fdf2f8] text-[#d30684] flex items-center justify-center">
              <GoogleIcon name="description" size={18} className="text-[#d30684]" />
            </div>
          </div>
          <div className="text-3xl font-heading font-black text-[#1a2527]">{total}</div>
          <p className="text-[11px] text-slate-500">Expedientes registrados por vecinos</p>
        </div>

        {/* Pendientes de Triaje */}
        <div className="bg-white p-5 rounded-3xl border border-[#D3B9B9] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">
              En Proceso
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <GoogleIcon name="pending" size={18} className="text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-heading font-black text-red-600">{pendientes}</div>
          <p className="text-[11px] text-slate-500">Requieren evaluación o inspección</p>
        </div>

        {/* Faenas Programadas */}
        <div className="bg-white p-5 rounded-3xl border border-[#D3B9B9] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#E4981E] uppercase tracking-wider">
              Faenas Agendadas
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FFFBEB] text-[#E4981E] flex items-center justify-center">
              <GoogleIcon name="event" size={18} className="text-[#E4981E]" />
            </div>
          </div>
          <div className="text-3xl font-heading font-black text-[#E4981E]">{faenas}</div>
          <p className="text-[11px] text-slate-500">Jornadas barriales en preparación</p>
        </div>

        {/* Espacios Recuperados */}
        <div className="bg-white p-5 rounded-3xl border border-[#D3B9B9] shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Recuperados
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <GoogleIcon name="check_circle" filled size={18} className="text-emerald-600" />
            </div>
          </div>
          <div className="text-3xl font-heading font-black text-emerald-700">{resueltos}</div>
          <p className="text-[11px] text-slate-500">Con evidencias fotográficas</p>
        </div>
      </div>

      {/* Sección Territorial: Mapa en Vivo + Alertas Críticas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa Territorial Interactivo (2 columnas) */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-[#D3B9B9] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D3B9B9]/60 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <GoogleIcon name="map" size={20} className="text-[#d30684]" />
                <h3 className="font-heading font-bold text-base sm:text-lg text-[#1a2527]">
                  Mapa Territorial de Incidencias en SJL
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Puntos calientes georreferenciados dentro del polígono distrital
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs font-semibold">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-slate-600">En Proceso</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-600">Faena</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-600">Resuelto</span>
              </span>
            </div>
          </div>

          {/* Componente de Mapa Leaflet */}
          <div className="h-[360px] rounded-2xl overflow-hidden border border-[#D3B9B9]/70">
            <TerritorialMap
              reports={reports}
              onSelectReport={onSelectReport}
            />
          </div>

          {/* Desglose por Ejes */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
            <div className="p-2.5 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A]">
              <span className="font-bold text-[#E4981E] block text-base">{alumbrado}</span>
              <span className="text-slate-600 text-[11px]">Alumbrado ({total > 0 ? Math.round((alumbrado / total) * 100) : 0}%)</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#FFF1F2] border border-[#FECDD3]">
              <span className="font-bold text-[#E28A85] block text-base">{basura}</span>
              <span className="text-slate-600 text-[11px]">Basura ({total > 0 ? Math.round((basura / total) * 100) : 0}%)</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0]">
              <span className="font-bold text-[#588157] block text-base">{espacios}</span>
              <span className="text-slate-600 text-[11px]">Espacios ({total > 0 ? Math.round((espacios / total) * 100) : 0}%)</span>
            </div>
          </div>
        </div>

        {/* Panel Lateral: Alertas Críticas de Gemini IA (1 columna) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#D3B9B9] shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-[#D3B9B9]/60 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-[#fdf2f8] text-[#d30684] flex items-center justify-center">
                  <GoogleIcon name="auto_awesome" filled size={16} className="text-[#d30684]" />
                </div>
                <h3 className="font-heading font-bold text-sm sm:text-base text-[#1a2527]">
                  Alertas Copiloto Gemini
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700">
                {urgentReports.length} Urgencias
              </span>
            </div>

            <p className="text-xs text-slate-500 leading-snug">
              Casos identificados por inteligencia artificial que requieren atención prioritaria de las lideresas:
            </p>

            <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {urgentReports.length === 0 ? (
                <div className="p-6 text-center text-slate-400 space-y-2">
                  <GoogleIcon name="check_circle" size={32} className="text-emerald-500 mx-auto" />
                  <p className="text-xs font-semibold text-slate-600">
                    No hay casos de urgencia crítica pendientes en este momento.
                  </p>
                </div>
              ) : (
                urgentReports.map((report) => (
                  <div
                    key={report.id}
                    onClick={() => onSelectReport(report)}
                    className="p-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#fdf2f8] border border-[#D3B9B9] hover:border-[#d30684] transition-all cursor-pointer space-y-1.5 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-extrabold text-[#d30684]">
                        {report.ticket_code}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-red-100 text-red-800">
                        Prioridad Alta
                      </span>
                    </div>

                    <p className="text-xs text-[#1a2527] font-medium line-clamp-2 leading-relaxed">
                      {report.ai_summary || report.description}
                    </p>

                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500">
                      <span className="capitalize font-semibold text-[#E28A85]">
                        • {report.axis}
                      </span>
                      <span>{new Date(report.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('incidencias')}
            className="w-full py-2.5 px-4 rounded-xl border border-[#D3B9B9] hover:bg-[#fdf2f8] hover:border-[#d30684] text-xs font-bold text-[#d30684] flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
          >
            <span>Ver Todas las Incidencias</span>
            <GoogleIcon name="arrow_forward" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
