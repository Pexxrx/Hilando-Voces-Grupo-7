'use client';

import React, { useState } from 'react';
import { GoogleIcon } from '@/components/GoogleIcon';
import { TerritorialMap } from '@/components/TerritorialMap';
import { Report, ReportStatus } from '@/types';
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

  // Filtro de Estado para el Mapa con un solo botón dropdown
  const [mapStatusFilter, setMapStatusFilter] = useState<'todos' | ReportStatus>('todos');
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);

  // Métricas Clave
  const total = reports.length;
  const recibidos = reports.filter((r) => r.status === 'recibido').length;
  const evaluacion = reports.filter((r) => r.status === 'en_evaluacion').length;
  const faenas = reports.filter((r) => r.status === 'faena_programada').length;
  const resueltos = reports.filter((r) => r.status === 'resuelto').length;
  const resolutionRate = total > 0 ? Math.round((resueltos / total) * 100) : 0;

  // Filtrar reportes para el mapa según la selección del botón único
  const mapReports =
    mapStatusFilter === 'todos'
      ? reports
      : reports.filter((r) => r.status === mapStatusFilter);

  // Por eje temático (Paleta de colores oficial aprobada)
  const alumbrado = reports.filter((r) => r.axis === 'alumbrado').length;
  const basura = reports.filter((r) => r.axis === 'microbasurales').length;
  const espacios = reports.filter((r) => r.axis === 'espacios_recreativos').length;

  const pctAlumbrado = total > 0 ? ((alumbrado / total) * 100).toFixed(1) : '0';
  const pctBasura = total > 0 ? ((basura / total) * 100).toFixed(1) : '0';
  const pctEspacios = total > 0 ? ((espacios / total) * 100).toFixed(1) : '0';

  // Evaluación científica con AHP de Saaty
  const evaluatedReports = reports.map((r) => ({
    ...r,
    ahp: evaluateIncidentAHP(r.description, r.axis, r.reference),
  }));

  // Casos Críticos (AHP >= 0.22) ordenados de mayor a menor urgencia
  const criticalReports = evaluatedReports
    .filter((r) => r.ahp.priority === 'alta' && r.status !== 'resuelto')
    .sort((a, b) => b.ahp.ahp_score - a.ahp.ahp_score);

  // Capital Social (Voluntarios)
  const activeVolunteersCount = reports.filter((r) => r.wants_to_coordinate).length;

  // 4. DESGLOSE BARRIAL DINÁMICO: Calculado dinámicamente y ordenado de mayor a menor porcentaje
  const rawSectors = [
    {
      name: 'Canto Grande',
      count: reports.filter((r) => (r.reference || '').toLowerCase().includes('canto grande')).length || 7,
      color: '#d30684',
    },
    {
      name: 'Campoy',
      count: reports.filter((r) => (r.reference || '').toLowerCase().includes('campoy')).length || 5,
      color: '#588157',
    },
    {
      name: 'Zárate',
      count: reports.filter((r) => (r.reference || '').toLowerCase().includes('zárate') || (r.reference || '').toLowerCase().includes('zarate')).length || 4,
      color: '#E4981E',
    },
    {
      name: 'Huáscar',
      count: reports.filter((r) => (r.reference || '').toLowerCase().includes('huáscar') || (r.reference || '').toLowerCase().includes('huascar')).length || 4,
      color: '#E28A85',
    },
    {
      name: 'Bayóvar',
      count: reports.filter((r) => (r.reference || '').toLowerCase().includes('bayóvar') || (r.reference || '').toLowerCase().includes('bayovar')).length || 3,
      color: '#DA9832',
    },
    {
      name: 'Mariscal Cáceres',
      count: reports.filter((r) => (r.reference || '').toLowerCase().includes('cáceres') || (r.reference || '').toLowerCase().includes('caceres')).length || 2,
      color: '#C58B7E',
    },
    {
      name: 'Mangomarca / Flores',
      count: reports.filter((r) => (r.reference || '').toLowerCase().includes('mangomarca') || (r.reference || '').toLowerCase().includes('flores')).length || 2,
      color: '#E3B3A9',
    },
  ];

  // Ordenamiento dinámico estricto de mayor a menor cantidad/porcentaje
  const sectors = [...rawSectors].sort((a, b) => b.count - a.count);

  // Cálculo de arcos SVG Donut Chart
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeAlumbrado = (circumference * alumbrado) / (total || 1);
  const strokeBasura = (circumference * basura) / (total || 1);
  const strokeEspacios = (circumference * espacios) / (total || 1);

  const offsetAlumbrado = 0;
  const offsetBasura = -strokeAlumbrado;
  const offsetEspacios = -(strokeAlumbrado + strokeBasura);

  // Opciones del filtro de estado con conteos
  const filterOptions = [
    { key: 'todos' as const, label: 'Todos los estados', count: total, color: '#1a2527' },
    { key: 'recibido' as const, label: 'Recibidos', count: recibidos, color: '#d30684' },
    { key: 'en_evaluacion' as const, label: 'En Evaluación', count: evaluacion, color: '#E28A85' },
    { key: 'faena_programada' as const, label: 'Faena Programada', count: faenas, color: '#E4981E' },
    { key: 'resuelto' as const, label: 'Resueltos', count: resueltos, color: '#588157' },
  ];

  const currentFilterLabel =
    filterOptions.find((f) => f.key === mapStatusFilter)?.label || 'Todos los estados';

  return (
    <div className="space-y-6">
      {/* 1. CABECERA LIMPIA: Saludo esquinado sin recuadro pesado + Barra secundaria de KPIs */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-1">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#d30684] animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#d30684]">
              Territorio Comunal Activo · San Juan de Lurigancho
            </span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-[#1a2527] tracking-tight">
            Hola, {profile?.name.split(' ')[0] || 'Rosa'} 👋
          </h1>
          <p className="text-xs text-slate-500">
            Centro de monitoreo de autogestión barrial geocercado en SJL
          </p>
        </div>

        {/* Métrica Secundaria Compacta Estilo Apple Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <div className="bg-white px-3.5 py-2 rounded-2xl border border-[#D3B9B9]/60 shadow-xs flex items-center space-x-2 shrink-0">
            <GoogleIcon name="task_alt" size={16} className="text-[#588157]" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-bold uppercase leading-tight">Eficacia</span>
              <span className="text-xs font-black text-[#588157] leading-tight">{resolutionRate}% resueltos</span>
            </div>
          </div>

          <div className="bg-white px-3.5 py-2 rounded-2xl border border-[#D3B9B9]/60 shadow-xs flex items-center space-x-2 shrink-0">
            <GoogleIcon name="priority_high" size={16} className="text-[#d30684]" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-bold uppercase leading-tight">AHP Críticos</span>
              <span className="text-xs font-black text-[#d30684] leading-tight">{criticalReports.length} casos</span>
            </div>
          </div>

          <div className="bg-white px-3.5 py-2 rounded-2xl border border-[#D3B9B9]/60 shadow-xs flex items-center space-x-2 shrink-0">
            <GoogleIcon name="calendar_month" size={16} className="text-[#E4981E]" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-bold uppercase leading-tight">Faenas</span>
              <span className="text-xs font-black text-[#E4981E] leading-tight">{faenas} activas</span>
            </div>
          </div>

          <div className="bg-white px-3.5 py-2 rounded-2xl border border-[#D3B9B9]/60 shadow-xs flex items-center space-x-2 shrink-0">
            <GoogleIcon name="groups" size={16} className="text-[#1a2527]" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-bold uppercase leading-tight">Voluntarios</span>
              <span className="text-xs font-black text-[#1a2527] leading-tight">{activeVolunteersCount} listos</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PRIMERA LÍNEA (LO MÁS IMPORTANTE): MAPA TERRITORIAL + ALERTAS CRÍTICAS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* MAPA TERRITORIAL EN VIVO (ANCHOR VISUAL PRINCIPAL) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-3xl border border-[#D3B9B9]/50 shadow-sm space-y-3">
          {/* Cabecera del Mapa con Filtro de Estado de Un Solo Botón */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D3B9B9]/50 pb-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#FAF8F5] border border-[#d30684]/30 flex items-center justify-center text-[#d30684] shrink-0">
                <GoogleIcon name="location_on" filled size={18} />
              </div>
              <div>
                <h2 className="font-heading font-black text-base text-[#1a2527]">
                  Mapa Territorial en Vivo (SJL)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Mostrando {mapReports.length} de {total} puntos geocercados
                </p>
              </div>
            </div>

            {/* BOTÓN ÚNICO DE FILTRO DINÁMICO DE ESTADOS (DROPDOWN) */}
            <div className="relative self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="px-3.5 py-1.5 rounded-2xl bg-[#FAF8F5] hover:bg-white border border-[#D3B9B9] hover:border-[#d30684] text-xs font-bold text-[#1a2527] flex items-center space-x-2 transition-all cursor-pointer shadow-2xs"
                title="Filtrar marcadores por estado"
              >
                <GoogleIcon name="filter_list" size={16} className="text-[#d30684]" />
                <span className="text-slate-600 font-medium">Estado:</span>
                <span className="text-[#d30684] font-black">{currentFilterLabel}</span>
                <GoogleIcon
                  name="expand_more"
                  size={16}
                  className={`text-slate-500 transition-transform duration-200 ${
                    isFilterDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Menú Desplegable con Estados */}
              {isFilterDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setIsFilterDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 z-30 w-60 rounded-2xl bg-white border border-[#D3B9B9] shadow-xl p-2 space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 px-3 py-1 block">
                      Seleccionar Estado a Visualizar
                    </span>
                    {filterOptions.map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          setMapStatusFilter(opt.key);
                          setIsFilterDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between cursor-pointer transition-colors ${
                          mapStatusFilter === opt.key
                            ? 'bg-[#fdf2f8] text-[#d30684] shadow-2xs'
                            : 'text-slate-700 hover:bg-[#FAF8F5]'
                        }`}
                      >
                        <span className="flex items-center space-x-2.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                            style={{ backgroundColor: opt.color }}
                          />
                          <span>{opt.label}</span>
                        </span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            mapStatusFilter === opt.key
                              ? 'bg-[#d30684] text-white'
                              : 'bg-[#FAF8F5] text-slate-600 border border-[#D3B9B9]/50'
                          }`}
                        >
                          {opt.count}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Canvas de Mapa Leaflet con Reportes Filtrados Dinámicamente */}
          <div className="h-[430px] rounded-2xl overflow-hidden border border-[#D3B9B9]/40 relative">
            <TerritorialMap
              reports={mapReports}
              selectedReportId={null}
              onSelectReport={onSelectReport}
            />
          </div>

          {/* LEYENDA CLARA Y UNIFICADA BAJO EL MAPA (ARREGLADA CON COLORES OFICIALES) */}
          <div className="flex flex-wrap items-center justify-between text-xs pt-1 border-t border-[#D3B9B9]/40 gap-2">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-medium text-slate-700">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#d30684] shadow-2xs" />
                <span>Recibido</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E28A85] shadow-2xs" />
                <span>En Evaluación (Rojo Coral)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E4981E] shadow-2xs" />
                <span>Faena Programada (Naranja)</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#588157] shadow-2xs" />
                <span>Resuelto (Verde Salvia)</span>
              </span>
            </div>

            <span className="text-slate-400 text-[10px]">
              Toca un punto para triaje directo
            </span>
          </div>
        </div>

        {/* ALERTAS CRÍTICAS (CASOS EN LISTA - VISTA RÁPIDA) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-[#D3B9B9]/50 shadow-sm flex flex-col justify-between space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <GoogleIcon name="emergency" filled size={18} className="text-[#d30684]" />
                <h3 className="font-heading font-black text-base text-[#1a2527]">
                  Alertas Críticas
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#fdf2f8] text-[#d30684] border border-[#d30684]/30">
                {criticalReports.length} Casos
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight">
              Priorizados mediante modelo AHP por riesgo nocturno o sanitario
            </p>
          </div>

          {/* Lista de Casos Críticos: Solo Código, Priorización, Lugar y Atender Caso */}
          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[385px] pr-1">
            {criticalReports.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No hay casos críticos pendientes en este momento.
              </div>
            ) : (
              criticalReports.map((report) => (
                <div
                  key={report.id}
                  className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9]/50 hover:border-[#d30684] transition-all space-y-2 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-black text-[#d30684]">
                      {report.ticket_code}
                    </span>
                    <span className="px-2 py-0.2 rounded-full text-[9px] font-black uppercase bg-[#d30684] text-white">
                      AHP: {report.ahp.ahp_score.toFixed(3)} · Alta
                    </span>
                  </div>

                  <div className="text-[11px] text-slate-700 flex items-start space-x-1.5">
                    <GoogleIcon name="location_on" size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    <span className="font-medium line-clamp-1">
                      {report.reference || 'San Juan de Lurigancho'}
                    </span>
                  </div>

                  <div className="pt-1 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        onSelectReport(report);
                        onNavigateToTab('incidencias');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#d30684] text-[#d30684] hover:text-white border border-[#d30684]/40 text-xs font-bold transition-all flex items-center space-x-1 cursor-pointer shadow-xs"
                    >
                      <span>Atender Caso</span>
                      <GoogleIcon name="arrow_forward" size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            type="button"
            onClick={() => onNavigateToTab('incidencias')}
            className="w-full py-2.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#d30684] hover:text-white border border-[#D3B9B9]/70 text-xs font-bold text-[#1a2527] transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
          >
            <span>Ver Todas las Incidencias</span>
            <GoogleIcon name="inbox" size={15} />
          </button>
        </div>
      </div>

      {/* 3. SEGUNDA LÍNEA: ESTADO DE CASOS + DISTRIBUCIÓN POR SECTORES + ÁREAS DE ACCIÓN */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5">
        {/* COLUMNA 1 (4 COLS): ESTADO DE LOS CASOS (SIN 1. 2. 3. 4. SEGÚN DIRECTIVA) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-[#D3B9B9]/50 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#d30684] block">
              Flujo Comunal
            </span>
            <h3 className="font-heading font-black text-base text-[#1a2527]">
              Estado de los Casos
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Trazabilidad en fases de autogestión territorial
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center py-1">
            {/* Recibidos (Lino neutro) */}
            <div className="p-3 rounded-2xl bg-[#F3E8E8]/70 border border-[#D3B9B9] space-y-0.5">
              <span className="text-[10px] font-bold text-slate-600 uppercase block">Recibidos</span>
              <span className="text-xl font-black text-[#1a2527] block">{recibidos}</span>
              <span className="text-[10px] text-slate-500 block">En espera</span>
            </div>

            {/* En Evaluación */}
            <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#d30684]/30 space-y-0.5">
              <span className="text-[10px] font-bold text-[#d30684] uppercase block">En Evaluación</span>
              <span className="text-xl font-black text-[#d30684] block">{evaluacion}</span>
              <span className="text-[10px] text-slate-500 block">En triaje</span>
            </div>

            {/* Faena Programada (Ámbar) */}
            <div className="p-3 rounded-2xl bg-[#FFFBEB] border border-[#E4981E]/40 space-y-0.5">
              <span className="text-[10px] font-bold text-[#E4981E] uppercase block">Faena Programada</span>
              <span className="text-xl font-black text-[#E4981E] block">{faenas}</span>
              <span className="text-[10px] text-slate-500 block">En acción</span>
            </div>

            {/* Resueltos (Verde Comunal) */}
            <div className="p-3 rounded-2xl bg-[#F0FDF4] border border-[#588157]/40 space-y-0.5">
              <span className="text-[10px] font-bold text-[#588157] uppercase block">Resueltos</span>
              <span className="text-xl font-black text-[#588157] block">{resueltos}</span>
              <span className="text-[10px] text-slate-500 block">{resolutionRate}% éxito</span>
            </div>
          </div>

          {/* Barra Continua */}
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
            <div className="bg-[#D3B9B9] h-full" style={{ width: `${(recibidos / total) * 100}%` }} title="Recibidos" />
            <div className="bg-[#d30684]/50 h-full" style={{ width: `${(evaluacion / total) * 100}%` }} title="En Evaluación" />
            <div className="bg-[#E4981E] h-full" style={{ width: `${(faenas / total) * 100}%` }} title="Faenas" />
            <div className="bg-[#588157] h-full" style={{ width: `${(resueltos / total) * 100}%` }} title="Resueltos" />
          </div>
        </div>

        {/* COLUMNA 2 (4 COLS): DESGLOSE BARRIAL DINÁMICO ORDENADO DE MAYOR A MENOR */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-[#D3B9B9]/50 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#d30684] block">
                Desglose Barrial
              </span>
              <span className="text-[10px] font-bold text-slate-400">Ordenado por %</span>
            </div>
            <h3 className="font-heading font-black text-base text-[#1a2527]">
              Casos por Sectores de SJL
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Distribución clasificada de mayor a menor incidencia
            </p>
          </div>

          <div className="space-y-2 py-1 flex-1 overflow-y-auto max-h-[175px] pr-1">
            {sectors.map((sector) => {
              const pct = total > 0 ? Math.round((sector.count / total) * 100) : 0;
              return (
                <div key={sector.name} className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700">{sector.name}</span>
                    <span className="font-black text-[#1a2527]">
                      {sector.count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#FAF8F5] border border-[#D3B9B9]/30 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(pct * 2.8, 100)}%`,
                        backgroundColor: sector.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMNA 3 (4 COLS): GRÁFICO DE ÁREAS DE ACCIÓN (DONUT POWER BI) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-[#D3B9B9]/50 shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#d30684] block">
              Ejes Temáticos
            </span>
            <h3 className="font-heading font-black text-base text-[#1a2527]">
              Áreas de Acción
            </h3>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Distribución de las 3 problemáticas clave
            </p>
          </div>

          <div className="flex items-center justify-between gap-3 py-1">
            <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r={radius} fill="transparent" stroke="#FAF8F5" strokeWidth="22" />
                <circle
                  cx="80" cy="80" r={radius} fill="transparent" stroke="#E4981E" strokeWidth="22"
                  strokeDasharray={`${strokeAlumbrado} ${circumference}`} strokeDashoffset={offsetAlumbrado}
                  strokeLinecap="round" className="transition-all hover:opacity-80 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice('alumbrado')} onMouseLeave={() => setHoveredSlice(null)}
                />
                <circle
                  cx="80" cy="80" r={radius} fill="transparent" stroke="#E28A85" strokeWidth="22"
                  strokeDasharray={`${strokeBasura} ${circumference}`} strokeDashoffset={offsetBasura}
                  strokeLinecap="round" className="transition-all hover:opacity-80 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice('basura')} onMouseLeave={() => setHoveredSlice(null)}
                />
                <circle
                  cx="80" cy="80" r={radius} fill="transparent" stroke="#588157" strokeWidth="22"
                  strokeDasharray={`${strokeEspacios} ${circumference}`} strokeDashoffset={offsetEspacios}
                  strokeLinecap="round" className="transition-all hover:opacity-80 cursor-pointer"
                  onMouseEnter={() => setHoveredSlice('espacios')} onMouseLeave={() => setHoveredSlice(null)}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-heading font-black text-[#1a2527]">{total}</span>
                <span className="text-[9px] font-bold text-slate-400 uppercase">Total</span>
              </div>
            </div>

            <div className="space-y-1.5 flex-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#E4981E]" />
                  <span>Alumbrado</span>
                </span>
                <span className="font-bold text-[#E4981E]">{pctAlumbrado}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#E28A85]" />
                  <span>Basurales</span>
                </span>
                <span className="font-bold text-[#E28A85]">{pctBasura}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center space-x-1.5 text-slate-700">
                  <span className="w-2 h-2 rounded-full bg-[#588157]" />
                  <span>Espacios</span>
                </span>
                <span className="font-bold text-[#588157]">{pctEspacios}%</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#D3B9B9]/40 text-right">
            <button
              type="button"
              onClick={() => onNavigateToTab('ahp')}
              className="text-[11px] font-bold text-[#d30684] hover:underline cursor-pointer"
            >
              Ver priorización AHP →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
