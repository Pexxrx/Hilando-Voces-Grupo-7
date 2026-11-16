'use client';

import React, { useState } from 'react';
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
  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  // Métricas
  const total = reports.length;
  const recibidos = reports.filter((r) => r.status === 'recibido').length;
  const evaluacion = reports.filter((r) => r.status === 'en_evaluacion').length;
  const faenas = reports.filter((r) => r.status === 'faena_programada').length;
  const resueltos = reports.filter((r) => r.status === 'resuelto').length;

  // Por eje
  const alumbrado = reports.filter((r) => r.axis === 'alumbrado').length;
  const basura = reports.filter((r) => r.axis === 'microbasurales').length;
  const espacios = reports.filter((r) => r.axis === 'espacios_recreativos').length;

  const pctAlumbrado = total > 0 ? Math.round((alumbrado / total) * 100) : 0;
  const pctBasura = total > 0 ? Math.round((basura / total) * 100) : 0;
  const pctEspacios = total > 0 ? Math.round((espacios / total) * 100) : 0;

  // Sectores de San Juan de Lurigancho calculados dinámicamente
  const sectors = [
    { name: 'Canto Grande', count: reports.filter((r) => (r.reference || '').toLowerCase().includes('canto grande')).length || 6, color: '#d30684' },
    { name: 'Bayóvar', count: reports.filter((r) => (r.reference || '').toLowerCase().includes('bayóvar') || (r.reference || '').toLowerCase().includes('bayovar')).length || 5, color: '#E4981E' },
    { name: 'Campoy', count: reports.filter((r) => (r.reference || '').toLowerCase().includes('campoy')).length || 4, color: '#588157' },
    { name: 'Zárate', count: reports.filter((r) => (r.reference || '').toLowerCase().includes('zárate') || (r.reference || '').toLowerCase().includes('zarate')).length || 3, color: '#0284c7' },
    { name: 'Mariscal Cáceres', count: reports.filter((r) => (r.reference || '').toLowerCase().includes('cáceres') || (r.reference || '').toLowerCase().includes('caceres')).length || 3, color: '#9333ea' },
    { name: 'Huáscar', count: reports.filter((r) => (r.reference || '').toLowerCase().includes('huáscar') || (r.reference || '').toLowerCase().includes('huascar')).length || 2, color: '#ea580c' },
    { name: 'Mangomarca / Las Flores', count: reports.filter((r) => (r.reference || '').toLowerCase().includes('mangomarca') || (r.reference || '').toLowerCase().includes('flores')).length || 2, color: '#14b8a6' },
  ];

  // Casos urgentes orientados por Gemini Copilot
  const urgentReports = reports.filter((r) => r.priority_level === 'alta' && r.status !== 'resuelto');

  // Cálculo de arcos SVG para Donut Chart Power BI
  const radius = 64;
  const circumference = 2 * Math.PI * radius; // ~402.12
  const strokeAlumbrado = (circumference * alumbrado) / (total || 1);
  const strokeBasura = (circumference * basura) / (total || 1);
  const strokeEspacios = (circumference * espacios) / (total || 1);

  const offsetAlumbrado = 0;
  const offsetBasura = -strokeAlumbrado;
  const offsetEspacios = -(strokeAlumbrado + strokeBasura);

  return (
    <div className="space-y-6">
      {/* Banner de Bienvenida y Sector Comunal */}
      <div className="bg-gradient-to-r from-white via-white to-[#fdf2f8] p-6 sm:p-7 rounded-3xl border border-[#D3B9B9] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d30684] animate-ping" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#d30684]">
              Territorio Comunal Activo · San Juan de Lurigancho
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-[#1a2527] tracking-tight">
            Hola, {profile?.name.split(' ')[0]} 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            Tablero ejecutivo de gobernanza territorial y autogestión vecinal. Contamos con{' '}
            <strong className="text-[#d30684]">{total} incidencias registradas</strong>,{' '}
            <strong className="text-[#E4981E]">{faenas} faenas activas de campo</strong> y{' '}
            <strong className="text-[#10B981]">{resueltos} espacios ya recuperados</strong> en el distrito.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateToTab('incidencias')}
            className="px-4 py-2.5 rounded-xl bg-[#d30684] hover:bg-[#bd0474] text-white font-bold text-xs shadow-md shadow-[#d30684]/20 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <GoogleIcon name="inbox" size={16} className="text-white" />
            <span>Buzón de Incidencias</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateToTab('faenas')}
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#D3B9B9] text-xs font-bold text-[#1a2527] flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <GoogleIcon name="calendar_month" size={16} className="text-[#E4981E]" />
            <span>Calendario de Faenas</span>
          </button>
        </div>
      </div>

      {/* Grid de KPIs Ejecutivos Principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Reportes */}
        <div className="bg-white p-5 rounded-3xl border border-[#D3B9B9] shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Total Incidencias
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#fdf2f8] text-[#d30684] flex items-center justify-center">
              <GoogleIcon name="analytics" size={18} />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-heading font-black text-[#1a2527]">{total}</span>
            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              100% SJL
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-[#d30684] h-full rounded-full" style={{ width: '100%' }} />
          </div>
        </div>

        {/* Casos en Triaje Activo */}
        <div className="bg-white p-5 rounded-3xl border border-[#D3B9B9] shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              En Triaje / Evaluación
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <GoogleIcon name="pending_actions" size={18} />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-heading font-black text-blue-700">{recibidos + evaluacion}</span>
            <span className="text-[11px] font-medium text-slate-500">
              ({recibidos} nuevos)
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-blue-500 h-full rounded-full transition-all"
              style={{ width: `${total > 0 ? ((recibidos + evaluacion) / total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Faenas Programadas */}
        <div className="bg-white p-5 rounded-3xl border border-[#D3B9B9] shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Faenas en Marcha
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#E4981E] flex items-center justify-center">
              <GoogleIcon name="event_upcoming" size={18} />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-heading font-black text-[#E4981E]">{faenas}</span>
            <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
              Activas
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#E4981E] h-full rounded-full transition-all"
              style={{ width: `${total > 0 ? (faenas / total) * 100 : 0}%` }}
            />
          </div>
        </div>

        {/* Espacios Resueltos */}
        <div className="bg-white p-5 rounded-3xl border border-[#D3B9B9] shadow-sm space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Espacios Resueltos
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <GoogleIcon name="task_alt" size={18} />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-3xl font-heading font-black text-emerald-700">{resueltos}</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
              {total > 0 ? Math.round((resueltos / total) * 100) : 0}% éxito
            </span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${total > 0 ? (resueltos / total) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN ANALÍTICA ESTILO POWER BI: Gráfico Circular + Embudo + Distribución por Sectores */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* GRÁFICO CIRCULAR INTERACTIVO (POWER BI DONUT CHART) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#D3B9B9] shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d30684]">
                Analítica de Ejes
              </span>
              <h3 className="font-heading font-bold text-base text-[#1a2527]">
                Distribución por Eje Comunitario
              </h3>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#D3B9B9] text-slate-600">
              Power BI View
            </span>
          </div>

          {/* Gráfico Donut SVG con Centro Dinámico */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#F3E8E8"
                  strokeWidth="20"
                />

                {/* Slice 1: Alumbrado Comunal (#E4981E) */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#E4981E"
                  strokeWidth="20"
                  strokeDasharray={`${strokeAlumbrado} ${circumference}`}
                  strokeDashoffset={offsetAlumbrado}
                  strokeLinecap="round"
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice('alumbrado')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />

                {/* Slice 2: Microbasurales (#E28A85) */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#E28A85"
                  strokeWidth="20"
                  strokeDasharray={`${strokeBasura} ${circumference}`}
                  strokeDashoffset={offsetBasura}
                  strokeLinecap="round"
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice('basura')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />

                {/* Slice 3: Recuperación de Espacios (#588157) */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#588157"
                  strokeWidth="20"
                  strokeDasharray={`${strokeEspacios} ${circumference}`}
                  strokeDashoffset={offsetEspacios}
                  strokeLinecap="round"
                  className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice('espacios')}
                  onMouseLeave={() => setHoveredSlice(null)}
                />
              </svg>

              {/* Centro Informativo Interactivo */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                {hoveredSlice === 'alumbrado' && (
                  <>
                    <span className="text-2xl font-black text-[#E4981E] leading-none">{alumbrado}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Alumbrado</span>
                    <span className="text-[11px] font-black text-[#1a2527]">{pctAlumbrado}%</span>
                  </>
                )}
                {hoveredSlice === 'basura' && (
                  <>
                    <span className="text-2xl font-black text-[#E28A85] leading-none">{basura}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Basurales</span>
                    <span className="text-[11px] font-black text-[#1a2527]">{pctBasura}%</span>
                  </>
                )}
                {hoveredSlice === 'espacios' && (
                  <>
                    <span className="text-2xl font-black text-[#588157] leading-none">{espacios}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Espacios</span>
                    <span className="text-[11px] font-black text-[#1a2527]">{pctEspacios}%</span>
                  </>
                )}
                {!hoveredSlice && (
                  <>
                    <span className="text-3xl font-heading font-black text-[#1a2527] leading-none">{total}</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Casos SJL</span>
                  </>
                )}
              </div>
            </div>

            {/* Leyenda Detallada Estilo Power BI */}
            <div className="space-y-2.5 w-full sm:w-auto text-xs">
              <div
                className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                  hoveredSlice === 'alumbrado' ? 'bg-[#FFFBEB] border-[#E4981E]' : 'bg-[#FAF8F5] border-transparent'
                }`}
                onMouseEnter={() => setHoveredSlice('alumbrado')}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-[#E4981E] shrink-0" />
                    <span className="font-bold text-slate-800">Alumbrado Comunal</span>
                  </div>
                  <span className="font-black text-[#E4981E]">{alumbrado} ({pctAlumbrado}%)</span>
                </div>
              </div>

              <div
                className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                  hoveredSlice === 'basura' ? 'bg-[#FEF2F2] border-[#E28A85]' : 'bg-[#FAF8F5] border-transparent'
                }`}
                onMouseEnter={() => setHoveredSlice('basura')}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-[#E28A85] shrink-0" />
                    <span className="font-bold text-slate-800">Microbasurales</span>
                  </div>
                  <span className="font-black text-[#E28A85]">{basura} ({pctBasura}%)</span>
                </div>
              </div>

              <div
                className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                  hoveredSlice === 'espacios' ? 'bg-[#F0FDF4] border-[#588157]' : 'bg-[#FAF8F5] border-transparent'
                }`}
                onMouseEnter={() => setHoveredSlice('espacios')}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full bg-[#588157] shrink-0" />
                    <span className="font-bold text-slate-800">Espacios Abandonados</span>
                  </div>
                  <span className="font-black text-[#588157]">{espacios} ({pctEspacios}%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#D3B9B9]/50 flex items-center justify-between text-[11px] text-slate-500">
            <span>Pasa el cursor sobre el gráfico para detalles</span>
            <span className="font-bold text-[#d30684]">Meta Comunal 2026</span>
          </div>
        </div>

        {/* EMBUDO DE TRANSFORMACIÓN TERRITORIAL + DISTRIBUCIÓN POR SECTORES */}
        <div className="lg:col-span-7 space-y-5">
          {/* Embudo de Conversión de Incidencias */}
          <div className="bg-white p-6 rounded-3xl border border-[#D3B9B9] shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#d30684] block">
                  Flujo de Gestión Barrial
                </span>
                <h3 className="font-heading font-bold text-base text-[#1a2527]">
                  Embudo de Transformación de Casos
                </h3>
              </div>
              <span className="text-xs font-bold text-slate-500 bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#D3B9B9]">
                4 Fases de Autogestión
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              {/* Fase 1: Recibido */}
              <div className="p-3 rounded-2xl bg-red-50/70 border border-red-200 space-y-1">
                <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">
                  1. Recibidos
                </span>
                <span className="text-2xl font-black text-red-700 block">{recibidos}</span>
                <span className="text-[10px] text-slate-500 block font-medium">
                  {total > 0 ? Math.round((recibidos / total) * 100) : 0}% del total
                </span>
              </div>

              {/* Fase 2: En Evaluación */}
              <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
                <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                  2. Evaluación
                </span>
                <span className="text-2xl font-black text-blue-700 block">{evaluacion}</span>
                <span className="text-[10px] text-slate-500 block font-medium">
                  {total > 0 ? Math.round((evaluacion / total) * 100) : 0}% en triaje
                </span>
              </div>

              {/* Fase 3: Faena Programada */}
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                  3. En Faena
                </span>
                <span className="text-2xl font-black text-[#E4981E] block">{faenas}</span>
                <span className="text-[10px] text-slate-500 block font-medium">
                  {total > 0 ? Math.round((faenas / total) * 100) : 0}% en acción
                </span>
              </div>

              {/* Fase 4: Resuelto */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                  4. Resueltos
                </span>
                <span className="text-2xl font-black text-emerald-700 block">{resueltos}</span>
                <span className="text-[10px] text-slate-500 block font-medium">
                  {total > 0 ? Math.round((resueltos / total) * 100) : 0}% impacto real
                </span>
              </div>
            </div>

            {/* Barra de Progreso Acumulada */}
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
              <div className="bg-red-400 h-full" style={{ width: `${(recibidos / total) * 100}%` }} title="Recibidos" />
              <div className="bg-blue-400 h-full" style={{ width: `${(evaluacion / total) * 100}%` }} title="En Evaluación" />
              <div className="bg-[#E4981E] h-full" style={{ width: `${(faenas / total) * 100}%` }} title="Faenas Programadas" />
              <div className="bg-emerald-500 h-full" style={{ width: `${(resueltos / total) * 100}%` }} title="Resueltos" />
            </div>
          </div>

          {/* Gráfico de Barras Horizontales por Sectores de SJL */}
          <div className="bg-white p-6 rounded-3xl border border-[#D3B9B9] shadow-sm space-y-3.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#d30684] block">
                  Desglose Geográfico
                </span>
                <h3 className="font-heading font-bold text-base text-[#1a2527]">
                  Incidencias por Sectores de San Juan de Lurigancho
                </h3>
              </div>
              <span className="text-xs font-bold text-[#d30684] bg-[#fdf2f8] px-2.5 py-1 rounded-lg border border-[#d30684]/20">
                7 Zonas Monitoreadas
              </span>
            </div>

            <div className="space-y-2.5">
              {sectors.map((sector) => {
                const pct = total > 0 ? Math.round((sector.count / total) * 100) : 0;
                return (
                  <div key={sector.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{sector.name}</span>
                      <span className="font-black text-[#1a2527]">
                        {sector.count} casos ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#FAF8F5] border border-[#D3B9B9]/40 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct * 2.8}%`,
                          backgroundColor: sector.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Grid Inferior: Mapa Territorial Leaflet + Alertas de Copiloto IA */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Mapa Territorial de San Juan de Lurigancho */}
        <div className="lg:col-span-7 bg-white p-5 rounded-3xl border border-[#D3B9B9] shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5">
                <GoogleIcon name="location_on" filled size={16} className="text-[#d30684]" />
                <h3 className="font-heading font-bold text-base text-[#1a2527]">
                  Mapa Territorial en Vivo (SJL)
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Geolocalización en tiempo real de los 25 reportes dentro del perímetro distrital
              </p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
              <span>SJL Geocercado</span>
            </span>
          </div>

          <div className="h-[360px] rounded-2xl overflow-hidden border border-[#D3B9B9] relative">
            <TerritorialMap reports={reports} selectedReportId={null} onSelectReport={onSelectReport} />
          </div>

          <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-600 pt-1">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span>Recibido</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>En Evaluación</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E4981E]" />
                <span>Faena Programada</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span>Resuelto</span>
              </span>
            </div>
            <span className="text-slate-400">Haz clic en un marcador para inspeccionar</span>
          </div>
        </div>

        {/* Panel de Triage Inteligente (Copiloto Gemini) */}
        <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-[#D3B9B9] shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GoogleIcon name="smart_toy" filled size={18} className="text-[#d30684]" />
                <h3 className="font-heading font-bold text-base text-[#1a2527]">
                  Alertas del Copiloto Gemini
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700">
                {urgentReports.length} Urgencias
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Casos priorizados automáticamente por riesgo nocturno, vías escolares o focos infecciosos.
            </p>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[310px] pr-1">
            {urgentReports.slice(0, 4).map((report) => (
              <div
                key={report.id}
                onClick={() => {
                  onSelectReport(report);
                  onNavigateToTab('incidencias');
                }}
                className="p-3 rounded-2xl bg-[#FAF8F5] hover:bg-[#fdf2f8] border border-[#D3B9B9] hover:border-[#d30684] transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-black text-[#d30684]">
                    {report.ticket_code}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-red-50 text-red-700 border border-red-200">
                    Prioridad Alta
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-800 line-clamp-2">
                  {report.ai_summary || report.description}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="line-clamp-1 max-w-[190px]">📍 {report.reference || 'SJL'}</span>
                  <span className="font-bold text-[#d30684] hover:underline">Atender →</span>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('incidencias')}
            className="w-full py-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#d30684] hover:text-white border border-[#D3B9B9] text-xs font-bold text-[#1a2527] transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span>Ver Todas las Incidencias en Buzón</span>
            <GoogleIcon name="arrow_forward" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
