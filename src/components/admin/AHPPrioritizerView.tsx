'use client';

import React, { useState } from 'react';
import { GoogleIcon } from '@/components/GoogleIcon';
import { Report } from '@/types';
import { AHP_WEIGHTS, AHP_CONSISTENCY, evaluateIncidentAHP } from '@/lib/ahp';

interface AHPPrioritizerViewProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
  onNavigateToTab: (tab: string) => void;
  onScheduleFaena: (report: Report) => void;
}

export function AHPPrioritizerView({
  reports,
  onSelectReport,
  onNavigateToTab,
  onScheduleFaena,
}: AHPPrioritizerViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('todos');
  const [filterAxis, setFilterAxis] = useState<string>('todos');
  const [filterSector, setFilterSector] = useState<string>('todos');

  // Evaluar y ordenar todas las incidencias por puntaje AHP descendente
  const evaluatedReports = reports.map((r) => {
    const evalData = evaluateIncidentAHP(r.description, r.axis, r.reference);
    return {
      ...r,
      ahp_score: evalData.ahp_score,
      ahp_priority: evalData.priority,
      ahp_label: evalData.priority_label,
      criteria_ratings: evalData.criteria_ratings,
    };
  });

  evaluatedReports.sort((a, b) => b.ahp_score - a.ahp_score);

  // Filtrado dinámico multicriterio
  const filtered = evaluatedReports.filter((r) => {
    if (filterPriority !== 'todos' && r.ahp_priority !== filterPriority) return false;
    if (filterAxis !== 'todos' && r.axis !== filterAxis) return false;
    if (filterSector !== 'todos' && !(r.reference || '').toLowerCase().includes(filterSector.toLowerCase())) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const codeMatch = r.ticket_code.toLowerCase().includes(term);
      const descMatch = r.description.toLowerCase().includes(term);
      const refMatch = (r.reference || '').toLowerCase().includes(term);
      if (!codeMatch && !descMatch && !refMatch) return false;
    }

    return true;
  });

  const highPriorityCount = evaluatedReports.filter((r) => r.ahp_priority === 'alta').length;
  const mediumPriorityCount = evaluatedReports.filter((r) => r.ahp_priority === 'media').length;
  const normalPriorityCount = evaluatedReports.filter((r) => r.ahp_priority === 'baja').length;

  return (
    <div className="space-y-6">
      {/* 1. HERO BANNER METODOLÓGICO: AHP DE SAATY CON COLORES ESTANDARIZADOS */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#D3B9B9]/50 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d30684]" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#d30684]">
                Metodología Científica de Jerarquización Analítica (AHP)
              </span>
            </div>
            <h2 className="font-heading font-black text-2xl text-[#1a2527] tracking-tight">
              Priorización Multicriterio de Problemáticas Barriales
            </h2>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              El modelo matemático de Thomas Saaty elimina la arbitrariedad en la asignación de recursos comunales
              evaluando 5 dimensiones ponderadas por las lideresas de San Juan de Lurigancho (Grupo 7).
            </p>
          </div>

          {/* Razón de Consistencia Validada */}
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9]/60 shrink-0 text-center space-y-0.5">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              Razón de Consistencia (CR)
            </span>
            <div className="flex items-center justify-center space-x-1.5">
              <span className="text-2xl font-heading font-black text-[#588157]">
                {AHP_CONSISTENCY.cr.toFixed(4)}
              </span>
              <GoogleIcon name="verified" filled size={18} className="text-[#588157]" />
            </div>
            <span className="text-[10px] font-bold text-[#588157] bg-[#F0FDF4] px-2 py-0.5 rounded-full inline-block border border-[#588157]/30">
              Matemáticamente Consistente (&lt; 0.10)
            </span>
          </div>
        </div>

        {/* Criterios Ponderados (Paleta Oficial de Colores) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {/* Seguridad (48.47% - Magenta) */}
          <div className="p-3 rounded-2xl bg-white border border-[#D3B9B9]/50 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Seguridad</span>
              <span className="font-mono font-black text-[#d30684]">48.47%</span>
            </div>
            <div className="w-full bg-[#FAF8F5] h-1.5 rounded-full overflow-hidden border border-[#D3B9B9]/30">
              <div className="bg-[#d30684] h-full rounded-full" style={{ width: '48.47%' }} />
            </div>
            <span className="text-[10px] text-slate-400 block truncate">Rutas escolares oscuras, cerros</span>
          </div>

          {/* Salud (22.68% - Coral Terracota) */}
          <div className="p-3 rounded-2xl bg-white border border-[#D3B9B9]/50 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Salud</span>
              <span className="font-mono font-black text-[#E28A85]">22.68%</span>
            </div>
            <div className="w-full bg-[#FAF8F5] h-1.5 rounded-full overflow-hidden border border-[#D3B9B9]/30">
              <div className="bg-[#E28A85] h-full rounded-full" style={{ width: '22.68%' }} />
            </div>
            <span className="text-[10px] text-slate-400 block truncate">Infecciones, roedores, humo</span>
          </div>

          {/* Equidad (14.31% - Neutro) */}
          <div className="p-3 rounded-2xl bg-white border border-[#D3B9B9]/50 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Equidad</span>
              <span className="font-mono font-black text-[#1a2527]">14.31%</span>
            </div>
            <div className="w-full bg-[#FAF8F5] h-1.5 rounded-full overflow-hidden border border-[#D3B9B9]/30">
              <div className="bg-[#1a2527] h-full rounded-full" style={{ width: '14.31%' }} />
            </div>
            <span className="text-[10px] text-slate-400 block truncate">Asentamientos altos vulnerables</span>
          </div>

          {/* Alcance (8.88% - Ámbar) */}
          <div className="p-3 rounded-2xl bg-white border border-[#D3B9B9]/50 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Alcance</span>
              <span className="font-mono font-black text-[#E4981E]">8.88%</span>
            </div>
            <div className="w-full bg-[#FAF8F5] h-1.5 rounded-full overflow-hidden border border-[#D3B9B9]/30">
              <div className="bg-[#E4981E] h-full rounded-full" style={{ width: '8.88%' }} />
            </div>
            <span className="text-[10px] text-slate-400 block truncate">Volumen de transeúntes</span>
          </div>

          {/* Convivencia (5.66% - Verde Salvia) */}
          <div className="p-3 rounded-2xl bg-white border border-[#D3B9B9]/50 space-y-1 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Convivencia</span>
              <span className="font-mono font-black text-[#588157]">5.66%</span>
            </div>
            <div className="w-full bg-[#FAF8F5] h-1.5 rounded-full overflow-hidden border border-[#D3B9B9]/30">
              <div className="bg-[#588157] h-full rounded-full" style={{ width: '5.66%' }} />
            </div>
            <span className="text-[10px] text-slate-400 block truncate">Lozas, deporte, parques</span>
          </div>
        </div>
      </div>

      {/* 2. BARRA DE BÚSQUEDA Y FILTROS DINÁMICOS */}
      <div className="bg-white p-4 rounded-3xl border border-[#D3B9B9]/50 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Búsqueda */}
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
              placeholder="Buscar por código, problemática o dirección..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9]/60 text-xs text-[#1a2527] placeholder:text-slate-400 focus:outline-none focus:border-[#d30684]"
            />
          </div>

          {/* Filtros Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            {/* Eje */}
            <select
              value={filterAxis}
              onChange={(e) => setFilterAxis(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D3B9B9]/60 font-bold text-slate-700"
            >
              <option value="todos">Todos los Ejes</option>
              <option value="alumbrado">Alumbrado</option>
              <option value="microbasurales">Microbasurales</option>
              <option value="espacios_recreativos">Espacios</option>
            </select>

            {/* Sector SJL */}
            <select
              value={filterSector}
              onChange={(e) => setFilterSector(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D3B9B9]/60 font-bold text-slate-700"
            >
              <option value="todos">Todos los Sectores</option>
              <option value="Canto Grande">Canto Grande</option>
              <option value="Campoy">Campoy</option>
              <option value="Zárate">Zárate</option>
              <option value="Huáscar">Huáscar</option>
              <option value="Bayóvar">Bayóvar</option>
              <option value="Cáceres">Mariscal Cáceres</option>
              <option value="Jicamarca">Jicamarca</option>
            </select>
          </div>
        </div>

        {/* Chips de Prioridad AHP */}
        <div className="flex items-center gap-2 pt-1 border-t border-[#D3B9B9]/40 overflow-x-auto no-scrollbar text-xs">
          <span className="text-slate-400 font-bold text-[11px] mr-1">Rango AHP:</span>
          <button
            type="button"
            onClick={() => setFilterPriority('todos')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterPriority === 'todos'
                ? 'bg-[#1a2527] text-white shadow-xs'
                : 'bg-[#FAF8F5] text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({evaluatedReports.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterPriority('alta')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterPriority === 'alta'
                ? 'bg-[#d30684] text-white shadow-xs'
                : 'bg-[#FAF8F5] text-[#d30684] hover:bg-[#fdf2f8]'
            }`}
          >
            Alta (Score &ge; 0.22): {highPriorityCount}
          </button>
          <button
            type="button"
            onClick={() => setFilterPriority('media')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterPriority === 'media'
                ? 'bg-[#E4981E] text-white shadow-xs'
                : 'bg-[#FAF8F5] text-[#E4981E] hover:bg-[#FFFBEB]'
            }`}
          >
            Media (0.16 - 0.22): {mediumPriorityCount}
          </button>
          <button
            type="button"
            onClick={() => setFilterPriority('baja')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              filterPriority === 'baja'
                ? 'bg-[#588157] text-white shadow-xs'
                : 'bg-[#FAF8F5] text-[#588157] hover:bg-[#F0FDF4]'
            }`}
          >
            Normal (&lt; 0.16): {normalPriorityCount}
          </button>
        </div>
      </div>

      {/* 3. TABLA DE RANKING CIENTÍFICO AHP */}
      <div className="bg-white rounded-3xl border border-[#D3B9B9]/50 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#D3B9B9]/50 text-slate-500 font-bold uppercase">
                <th className="py-3 px-4 text-center w-14">Rank</th>
                <th className="py-3 px-4">Problemática y Ubicación</th>
                <th className="py-3 px-4 text-center">Eje</th>
                <th className="py-3 px-4 text-center">Score AHP</th>
                <th className="py-3 px-4 text-center">Nivel</th>
                <th className="py-3 px-4 text-center">Criterio Dominante</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D3B9B9]/40">
              {filtered.map((item) => {
                const globalRank = evaluatedReports.findIndex((r) => r.id === item.id) + 1;
                const isHigh = item.ahp_priority === 'alta';
                const isMed = item.ahp_priority === 'media';

                const ratings = item.criteria_ratings;
                let topCrit = 'Seguridad';
                let topVal = ratings.seguridad;
                if (ratings.salud > topVal) { topCrit = 'Salud'; topVal = ratings.salud; }
                if (ratings.equidad > topVal) { topCrit = 'Equidad'; topVal = ratings.equidad; }
                if (ratings.convivencia > topVal) { topCrit = 'Convivencia'; topVal = ratings.convivencia; }

                return (
                  <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                    {/* Rank */}
                    <td className="py-3 px-4 text-center font-black">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs ${
                          globalRank === 1
                            ? 'bg-[#d30684] text-white shadow-xs'
                            : globalRank <= 3
                            ? 'bg-[#FFFBEB] text-[#E4981E] border border-[#E4981E]/30'
                            : 'bg-[#FAF8F5] text-slate-600'
                        }`}
                      >
                        {globalRank}
                      </span>
                    </td>

                    {/* Problemática */}
                    <td className="py-3 px-4 space-y-0.5 max-w-sm">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-[11px] font-black text-[#d30684]">
                          {item.ticket_code}
                        </span>
                        <span className="text-slate-400">·</span>
                        <span className="text-[11px] text-slate-500 font-medium truncate max-w-[200px]">
                          📍 {item.reference || 'SJL'}
                        </span>
                      </div>
                      <p className="font-semibold text-slate-800 line-clamp-1">
                        {item.ai_summary || item.description}
                      </p>
                    </td>

                    {/* Eje */}
                    <td className="py-3 px-4 text-center">
                      <span className="text-[11px] font-bold capitalize text-slate-700">
                        {item.axis.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Score AHP */}
                    <td className="py-3 px-4 text-center font-mono font-black text-sm">
                      <span
                        className={
                          isHigh ? 'text-[#d30684]' : isMed ? 'text-[#E4981E]' : 'text-[#588157]'
                        }
                      >
                        {item.ahp_score.toFixed(4)}
                      </span>
                    </td>

                    {/* Nivel */}
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          isHigh
                            ? 'bg-[#fdf2f8] text-[#d30684] border border-[#d30684]/30'
                            : isMed
                            ? 'bg-[#FFFBEB] text-[#E4981E] border border-[#E4981E]/40'
                            : 'bg-[#F0FDF4] text-[#588157] border border-[#588157]/40'
                        }`}
                      >
                        {item.ahp_priority}
                      </span>
                    </td>

                    {/* Criterio Dominante */}
                    <td className="py-3 px-4 text-center">
                      <span className="text-[11px] font-bold text-slate-600 bg-[#FAF8F5] px-2 py-0.5 rounded-md border border-[#D3B9B9]/50">
                        {topCrit} ({(topVal * 100).toFixed(0)}%)
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectReport(item);
                            onNavigateToTab('incidencias');
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#FAF8F5] border border-[#D3B9B9] text-xs font-bold text-[#1a2527] hover:text-[#d30684] transition-colors cursor-pointer"
                        >
                          Ver Caso
                        </button>
                        {item.status !== 'faena_programada' && item.status !== 'resuelto' && (
                          <button
                            type="button"
                            onClick={() => onScheduleFaena(item)}
                            className="px-2.5 py-1.5 rounded-xl bg-[#d30684] hover:bg-[#bd0474] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                          >
                            Agendar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
