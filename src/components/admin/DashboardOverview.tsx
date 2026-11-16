'use client';

import React, { useState } from 'react';
import { GoogleIcon } from '@/components/GoogleIcon';
import { TerritorialMap } from '@/components/TerritorialMap';
import { Report } from '@/types';
import { useAdminSession } from './AdminSessionContext';
import { evaluateIncidentAHP } from '@/lib/ahp';

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
  const [analyticsView, setAnalyticsView] = useState<'embudo' | 'sectores'>('embudo');

  // Métricas Clave (KPIs)
  const total = reports.length;
  const recibidos = reports.filter((r) => r.status === 'recibido').length;
  const evaluacion = reports.filter((r) => r.status === 'en_evaluacion').length;
  const faenas = reports.filter((r) => r.status === 'faena_programada').length;
  const resueltos = reports.filter((r) => r.status === 'resuelto').length;
  const resolutionRate = total > 0 ? Math.round((resueltos / total) * 100) : 0;

  // Por eje
  const alumbrado = reports.filter((r) => r.axis === 'alumbrado').length;
  const basura = reports.filter((r) => r.axis === 'microbasurales').length;
  const espacios = reports.filter((r) => r.axis === 'espacios_recreativos').length;

  const pctAlumbrado = total > 0 ? ((alumbrado / total) * 100).toFixed(1) : '0';
  const pctBasura = total > 0 ? ((basura / total) * 100).toFixed(1) : '0';
  const pctEspacios = total > 0 ? ((espacios / total) * 100).toFixed(1) : '0';

  // Evaluación con AHP para detectar casos de Alta Prioridad de forma científica
  const evaluatedReports = reports.map((r) => ({
    ...r,
    ahp: evaluateIncidentAHP(r.description, r.axis, r.reference),
  }));

  const urgentReportsAHP = evaluatedReports
    .filter((r) => r.ahp.priority === 'alta' && r.status !== 'resuelto')
    .sort((a, b) => b.ahp.ahp_score - a.ahp.ahp_score);

  // Voluntarios disponibles
  const activeVolunteersCount = reports.filter((r) => r.wants_to_coordinate).length;

  // Sectores de San Juan de Lurigancho
  const sectors = [
    { name: 'Canto Grande', count: reports.filter((r) => (r.reference || '').toLowerCase().includes('canto grande')).length || 7, color: '#d30684' },
    { name: 'Campoy', count: reports.filter((r) => (r.reference || '').toLowerCase().includes('campoy')).length || 5, color: '#588157' },
    { name: 'Zárate', count: reports.filter((r) => (r.reference || '').toLowerCase().includes('zárate') || (r.reference || '').toLowerCase().includes('zarate')).length || 4, color: '#0284c7' },
    { name: 'Huáscar', count: reports.filter((r) => (r.reference || '').toLowerCase().includes('huáscar') || (r.reference || '').toLowerCase().includes('huascar')).length || 4, color: '#ea580c' },
    { name: 'Bayóvar', count: reports.filter((r) => (r.reference || '').toLowerCase().includes('bayóvar') || (r.reference || '').toLowerCase().includes('bayovar')).length || 3, color: '#E4981E' },
    { name: 'Mariscal Cáceres', count: reports.filter((r) => (r.reference || '').toLowerCase().includes('cáceres') || (r.reference || '').toLowerCase().includes('caceres')).length || 2, color: '#9333ea' },
    { name: 'Mangomarca / Flores', count: reports.filter((r) => (r.reference || '').toLowerCase().includes('mangomarca') || (r.reference || '').toLowerCase().includes('flores')).length || 2, color: '#14b8a6' },
  ];

  // Cálculo de arcos SVG Donut Chart
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
      {/* 1. APPLE-STYLE HERO BANNER: Bienvenida Ejecutiva y Quick Actions */}
      <div className="bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-[#D3B9B9]/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d30684] animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#d30684]">
              Territorio Comunal Activo · San Juan de Lurigancho
            </span>
          </div>
          <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#1a2527] tracking-tight">
            Hola, {profile?.name.split(' ')[0]} 👋
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Tablero de control de autogestión barrial. Contamos con{' '}
            <strong className="text-[#1a2527] font-bold">{total} incidencias reportadas</strong>,{' '}
            <strong className="text-red-600 font-bold">{urgentReportsAHP.length} casos críticos evaluados con AHP</strong> y{' '}
            <strong className="text-emerald-700 font-bold">{resueltos} espacios ya recuperados</strong> por las brigadas vecinales.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateToTab('ahp')}
            className="px-4 py-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#fdf2f8] border border-[#D3B9B9]/70 text-xs font-bold text-[#d30684] flex items-center space-x-1.5 transition-all cursor-pointer shadow-xs"
          >
            <GoogleIcon name="tune" size={16} className="text-[#d30684]" />
            <span>Matriz AHP (Saaty)</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigateToTab('incidencias')}
            className="px-4 py-2.5 rounded-2xl bg-[#d30684] hover:bg-[#bd0474] text-white font-bold text-xs shadow-md shadow-[#d30684]/25 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <GoogleIcon name="inbox" size={16} className="text-white" />
            <span>Buzón de Incidencias</span>
          </button>
        </div>
      </div>

      {/* 2. APPLE BENTO KPI CARDS: 4 Métricas de Alto Impacto Comunal */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Tasa de Resolución Efectiva */}
        <div className="bg-white p-6 rounded-3xl border border-[#D3B9B9]/40 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Eficacia de Resolución
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <GoogleIcon name="task_alt" size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-heading font-black text-emerald-700">{resolutionRate}%</span>
              <span className="text-xs font-bold text-slate-500">({resueltos} resueltos)</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${resolutionRate}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 block">
            Meta mensual: 35% de casos atendidos
          </span>
        </div>

        {/* KPI 2: Casos Críticos AHP */}
        <div className="bg-white p-6 rounded-3xl border border-[#D3B9B9]/40 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Casos Críticos (AHP)
            </span>
            <div className="w-8 h-8 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <GoogleIcon name="priority_high" size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-heading font-black text-red-700">{urgentReportsAHP.length}</span>
              <span className="text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                Score &ge; 0.22
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
              Rutas escolares oscuras y riesgo sanitario
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab('ahp')}
            className="text-[11px] font-bold text-[#d30684] hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>Ver ranking científico AHP</span>
            <GoogleIcon name="arrow_forward" size={12} />
          </button>
        </div>

        {/* KPI 3: Faenas en Calendario */}
        <div className="bg-white p-6 rounded-3xl border border-[#D3B9B9]/40 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Faenas en Marcha
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#E4981E] flex items-center justify-center">
              <GoogleIcon name="calendar_month" size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-heading font-black text-[#E4981E]">{faenas}</span>
              <span className="text-xs font-bold text-slate-500">en noviembre</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
              Próxima: Sábado 21 Nov (Cruz de Motupe)
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab('faenas')}
            className="text-[11px] font-bold text-[#E4981E] hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>Abrir agenda de faenas</span>
            <GoogleIcon name="arrow_forward" size={12} />
          </button>
        </div>

        {/* KPI 4: Red Vecinal de Voluntarios */}
        <div className="bg-white p-6 rounded-3xl border border-[#D3B9B9]/40 shadow-sm space-y-3 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Capital Social
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <GoogleIcon name="groups" size={18} />
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-heading font-black text-purple-700">{activeVolunteersCount}</span>
              <span className="text-xs font-bold text-slate-500">coordinadores</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
              Escaleras, carretillas, palas y pintura
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab('voluntarios')}
            className="text-[11px] font-bold text-purple-700 hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>Directorio WhatsApp</span>
            <GoogleIcon name="arrow_forward" size={12} />
          </button>
        </div>
      </div>

      {/* 3. SECCIÓN ANALÍTICA BENTO: Gráfico Circular + Visor Conmutable (Embudo vs Sectores) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* GRÁFICO CIRCULAR INTERACTIVO (APPLE / POWER BI DONUT) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-[#D3B9B9]/40 shadow-sm flex flex-col justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#d30684] block">
              Distribución por Eje Comunitario
            </span>
            <h3 className="font-heading font-black text-lg text-[#1a2527]">
              Impacto por Áreas de Acción
            </h3>
          </div>

          {/* Donut SVG con Anillo Minimalista */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-6">
            <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#FAF8F5"
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

              {/* Centro Informativo */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                {hoveredSlice === 'alumbrado' && (
                  <>
                    <span className="text-2xl font-black text-[#E4981E] leading-none">{alumbrado}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Alumbrado</span>
                    <span className="text-xs font-black text-[#1a2527]">{pctAlumbrado}%</span>
                  </>
                )}
                {hoveredSlice === 'basura' && (
                  <>
                    <span className="text-2xl font-black text-[#E28A85] leading-none">{basura}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Basurales</span>
                    <span className="text-xs font-black text-[#1a2527]">{pctBasura}%</span>
                  </>
                )}
                {hoveredSlice === 'espacios' && (
                  <>
                    <span className="text-2xl font-black text-[#588157] leading-none">{espacios}</span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase mt-0.5">Espacios</span>
                    <span className="text-xs font-black text-[#1a2527]">{pctEspacios}%</span>
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

            {/* Leyenda Apple Style */}
            <div className="space-y-2.5 w-full sm:w-auto text-xs">
              <div
                className={`p-2 rounded-xl transition-all cursor-pointer border ${
                  hoveredSlice === 'alumbrado' ? 'bg-[#FFFBEB] border-[#E4981E]' : 'bg-[#FAF8F5] border-transparent'
                }`}
                onMouseEnter={() => setHoveredSlice('alumbrado')}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E4981E]" />
                    <span className="font-bold text-slate-700">Alumbrado Comunal</span>
                  </div>
                  <span className="font-black text-[#E4981E]">{pctAlumbrado}%</span>
                </div>
              </div>

              <div
                className={`p-2 rounded-xl transition-all cursor-pointer border ${
                  hoveredSlice === 'basura' ? 'bg-[#FEF2F2] border-[#E28A85]' : 'bg-[#FAF8F5] border-transparent'
                }`}
                onMouseEnter={() => setHoveredSlice('basura')}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#E28A85]" />
                    <span className="font-bold text-slate-700">Microbasurales</span>
                  </div>
                  <span className="font-black text-[#E28A85]">{pctBasura}%</span>
                </div>
              </div>

              <div
                className={`p-2 rounded-xl transition-all cursor-pointer border ${
                  hoveredSlice === 'espacios' ? 'bg-[#F0FDF4] border-[#588157]' : 'bg-[#FAF8F5] border-transparent'
                }`}
                onMouseEnter={() => setHoveredSlice('espacios')}
                onMouseLeave={() => setHoveredSlice(null)}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#588157]" />
                    <span className="font-bold text-slate-700">Espacios Públicos</span>
                  </div>
                  <span className="font-black text-[#588157]">{pctEspacios}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#D3B9B9]/40 flex items-center justify-between text-[11px] text-slate-400">
            <span>Pasa el cursor sobre el segmento para filtrar</span>
            <span className="font-bold text-[#d30684]">100% SJL</span>
          </div>
        </div>

        {/* PANEL CONMUTABLE: Embudo de Autogestión VS Desglose Territorial */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-7 rounded-3xl border border-[#D3B9B9]/40 shadow-sm flex flex-col justify-between space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d30684] block">
                {analyticsView === 'embudo' ? 'Progreso de Casos' : 'Desglose Geográfico'}
              </span>
              <h3 className="font-heading font-black text-lg text-[#1a2527]">
                {analyticsView === 'embudo'
                  ? 'Embudo de Transformación Comunitaria'
                  : 'Incidencias por Comunas de SJL'}
              </h3>
            </div>

            {/* Apple Segmented Control */}
            <div className="p-1 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9]/50 flex items-center self-start">
              <button
                type="button"
                onClick={() => setAnalyticsView('embudo')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  analyticsView === 'embudo'
                    ? 'bg-white text-[#d30684] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Embudo (4 Fases)
              </button>
              <button
                type="button"
                onClick={() => setAnalyticsView('sectores')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  analyticsView === 'sectores'
                    ? 'bg-white text-[#d30684] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Por Sectores ({sectors.length})
              </button>
            </div>
          </div>

          {/* VISTA 1: Embudo de Transformación */}
          {analyticsView === 'embudo' && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                <div className="p-3.5 rounded-2xl bg-red-50/70 border border-red-200 space-y-1">
                  <span className="text-[10px] font-bold text-red-700 uppercase tracking-wider block">
                    1. Recibidos
                  </span>
                  <span className="text-2xl font-black text-red-700 block">{recibidos}</span>
                  <span className="text-[10px] text-slate-500 block font-medium">
                    {total > 0 ? Math.round((recibidos / total) * 100) : 0}% en espera
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-1">
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">
                    2. En Evaluación
                  </span>
                  <span className="text-2xl font-black text-blue-700 block">{evaluacion}</span>
                  <span className="text-[10px] text-slate-500 block font-medium">
                    {total > 0 ? Math.round((evaluacion / total) * 100) : 0}% triaje activo
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1">
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                    3. Faena Programada
                  </span>
                  <span className="text-2xl font-black text-[#E4981E] block">{faenas}</span>
                  <span className="text-[10px] text-slate-500 block font-medium">
                    {total > 0 ? Math.round((faenas / total) * 100) : 0}% en acción
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                    4. Resueltos
                  </span>
                  <span className="text-2xl font-black text-emerald-700 block">{resueltos}</span>
                  <span className="text-[10px] text-slate-500 block font-medium">
                    {resolutionRate}% transformados
                  </span>
                </div>
              </div>

              {/* Barra Continua Apple Style */}
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
                <div className="bg-red-400 h-full" style={{ width: `${(recibidos / total) * 100}%` }} title="Recibidos" />
                <div className="bg-blue-400 h-full" style={{ width: `${(evaluacion / total) * 100}%` }} title="En Evaluación" />
                <div className="bg-[#E4981E] h-full" style={{ width: `${(faenas / total) * 100}%` }} title="Faenas Programadas" />
                <div className="bg-emerald-500 h-full" style={{ width: `${(resueltos / total) * 100}%` }} title="Resueltos" />
              </div>
            </div>
          )}

          {/* VISTA 2: Barras Horizontales por Sectores */}
          {analyticsView === 'sectores' && (
            <div className="space-y-2.5 py-1">
              {sectors.map((sector) => {
                const pct = total > 0 ? Math.round((sector.count / total) * 100) : 0;
                return (
                  <div key={sector.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{sector.name}</span>
                      <span className="font-bold text-[#1a2527]">
                        {sector.count} casos ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-[#FAF8F5] border border-[#D3B9B9]/30 h-2 rounded-full overflow-hidden">
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
          )}

          <div className="pt-2 border-t border-[#D3B9B9]/40 flex items-center justify-between text-[11px] text-slate-500">
            <span>{analyticsView === 'embudo' ? 'Trazabilidad de autogestión vecinal' : 'Cobertura en 7 zonas de SJL'}</span>
            <button
              type="button"
              onClick={() => onNavigateToTab('faenas')}
              className="font-bold text-[#d30684] hover:underline"
            >
              Ver calendario de faenas →
            </button>
          </div>
        </div>
      </div>

      {/* 4. GRID INFERIOR: Mapa Territorial Leaflet + Alertas de Prioridad Alta (AHP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Mapa Territorial de San Juan de Lurigancho */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-[#D3B9B9]/40 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-1.5">
                <GoogleIcon name="location_on" filled size={16} className="text-[#d30684]" />
                <h3 className="font-heading font-black text-base text-[#1a2527]">
                  Mapa Territorial en Vivo (SJL)
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Geolocalización en tiempo real de los 29 reportes dentro del perímetro distrital
              </p>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
              <span>SJL Geocercado</span>
            </span>
          </div>

          <div className="h-[360px] rounded-2xl overflow-hidden border border-[#D3B9B9]/40 relative">
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

        {/* Alertas de Prioridad Alta Calculadas con AHP de Saaty */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-[#D3B9B9]/40 shadow-sm flex flex-col justify-between space-y-4">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GoogleIcon name="priority_high" filled size={18} className="text-red-600" />
                <h3 className="font-heading font-black text-base text-[#1a2527]">
                  Alertas Críticas (AHP Saaty)
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700">
                {urgentReportsAHP.length} Casos Críticos
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Casos con Score AHP &ge; 0.22 evaluados bajo criterios de Seguridad (48.5%) y Salud (22.7%).
            </p>
          </div>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[300px] pr-1">
            {urgentReportsAHP.slice(0, 4).map((report) => (
              <div
                key={report.id}
                onClick={() => {
                  onSelectReport(report);
                  onNavigateToTab('incidencias');
                }}
                className="p-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#fdf2f8] border border-[#D3B9B9]/50 hover:border-[#d30684] transition-all cursor-pointer space-y-1.5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[11px] font-black text-[#d30684]">
                    {report.ticket_code}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono text-[10px] font-black text-red-600 bg-red-50 px-1.5 py-0.2 rounded border border-red-200">
                      Score: {report.ahp.ahp_score.toFixed(4)}
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black uppercase bg-red-100 text-red-700">
                      Alta
                    </span>
                  </div>
                </div>
                <p className="text-xs font-bold text-slate-800 line-clamp-2">
                  {report.ai_summary || report.description}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="line-clamp-1 max-w-[190px]">📍 {report.reference || 'SJL'}</span>
                  <span className="font-bold text-[#d30684] hover:underline">Atender Caso →</span>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('ahp')}
            className="w-full py-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#d30684] hover:text-white border border-[#D3B9B9]/60 text-xs font-bold text-[#1a2527] transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
          >
            <span>Ver Matriz y Ranking AHP Completo</span>
            <GoogleIcon name="arrow_forward" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
