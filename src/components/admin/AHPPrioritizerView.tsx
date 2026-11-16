'use client';

import React, { useState } from 'react';
import { GoogleIcon } from '@/components/GoogleIcon';
import { Report } from '@/types';
import { ExtendedReport } from '@/data/mockReports';
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
  const [filterPriority, setFilterPriority] = useState<string>('todos');

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

  const filtered = evaluatedReports.filter((r) => {
    if (filterPriority === 'todos') return true;
    return r.ahp_priority === filterPriority;
  });

  const highPriorityCount = evaluatedReports.filter((r) => r.ahp_priority === 'alta').length;
  const mediumPriorityCount = evaluatedReports.filter((r) => r.ahp_priority === 'media').length;
  const normalPriorityCount = evaluatedReports.filter((r) => r.ahp_priority === 'baja').length;

  return (
    <div className="space-y-6">
      {/* Apple-style Hero Banner: Metodología AHP */}
      <div className="bg-white/80 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-[#D3B9B9]/40 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#d30684]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#d30684]">
                Metodología Científica · Saaty AHP (Grupo 7)
              </span>
            </div>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-[#1a2527] tracking-tight">
              Priorización Objetiva Multicriterio (AHP)
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              Sistema matemático de jerarquización analítica para evitar sesgos: califica las incidencias
              mediante 5 criterios de impacto social ponderados por la dirigencia comunal de San Juan de Lurigancho.
            </p>
          </div>

          {/* Badge de Consistencia Matemática */}
          <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9]/60 shrink-0 space-y-1 text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Razón de Consistencia (CR)
            </span>
            <div className="flex items-center justify-center space-x-1.5">
              <span className="text-2xl font-heading font-black text-emerald-700">
                {AHP_CONSISTENCY.cr.toFixed(4)}
              </span>
              <GoogleIcon name="verified" filled size={18} className="text-emerald-600" />
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full inline-block border border-emerald-200">
              Matemáticamente Consistente (&lt; 0.10)
            </span>
          </div>
        </div>

        {/* Criterios Ponderados (Cards Estilo Apple Bento) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2">
          {/* Criterio 1: Seguridad */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#D3B9B9]/50 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Seguridad</span>
              <span className="font-mono font-black text-[#d30684]">48.47%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#d30684] h-full rounded-full" style={{ width: '48.47%' }} />
            </div>
            <span className="text-[10px] text-slate-400 block truncate">Rutas escolares, asaltos</span>
          </div>

          {/* Criterio 2: Salud */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#D3B9B9]/50 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Salud</span>
              <span className="font-mono font-black text-[#E28A85]">22.68%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#E28A85] h-full rounded-full" style={{ width: '22.68%' }} />
            </div>
            <span className="text-[10px] text-slate-400 block truncate">Infecciones, roedores, humo</span>
          </div>

          {/* Criterio 3: Equidad */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#D3B9B9]/50 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Equidad</span>
              <span className="font-mono font-black text-purple-600">14.31%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full" style={{ width: '14.31%' }} />
            </div>
            <span className="text-[10px] text-slate-400 block truncate">Cerros altos, sin servicios</span>
          </div>

          {/* Criterio 4: Alcance */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#D3B9B9]/50 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Alcance</span>
              <span className="font-mono font-black text-[#E4981E]">8.88%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#E4981E] h-full rounded-full" style={{ width: '8.88%' }} />
            </div>
            <span className="text-[10px] text-slate-400 block truncate">Volumen de transeúntes</span>
          </div>

          {/* Criterio 5: Convivencia */}
          <div className="p-3.5 rounded-2xl bg-white border border-[#D3B9B9]/50 shadow-xs space-y-1 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Convivencia</span>
              <span className="font-mono font-black text-[#588157]">5.66%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#588157] h-full rounded-full" style={{ width: '5.66%' }} />
            </div>
            <span className="text-[10px] text-slate-400 block truncate">Lozas, deporte, áreas verdes</span>
          </div>
        </div>
      </div>

      {/* Selector de Filtros de Prioridad */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setFilterPriority('todos')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              filterPriority === 'todos'
                ? 'bg-[#1a2527] text-white shadow-sm'
                : 'bg-white border border-[#D3B9B9]/50 text-slate-600 hover:bg-[#FAF8F5]'
            }`}
          >
            Todos ({evaluatedReports.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterPriority('alta')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              filterPriority === 'alta'
                ? 'bg-red-600 text-white shadow-sm'
                : 'bg-white border border-[#D3B9B9]/50 text-red-600 hover:bg-red-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span>Prioridad Alta ({highPriorityCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterPriority('media')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              filterPriority === 'media'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-white border border-[#D3B9B9]/50 text-amber-700 hover:bg-amber-50'
            }`}
          >
            Prioridad Media ({mediumPriorityCount})
          </button>

          <button
            type="button"
            onClick={() => setFilterPriority('baja')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              filterPriority === 'baja'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white border border-[#D3B9B9]/50 text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            Normal / Comunitaria ({normalPriorityCount})
          </button>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Ordenado por Score AHP decreciente
        </span>
      </div>

      {/* Tabla Ejecutiva de Ranking AHP */}
      <div className="bg-white rounded-3xl border border-[#D3B9B9]/40 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#D3B9B9]/50 text-slate-500">
                <th className="py-3.5 px-4 font-bold uppercase text-center w-14">Rank</th>
                <th className="py-3.5 px-4 font-bold uppercase">Expediente & Problemática</th>
                <th className="py-3.5 px-4 font-bold uppercase text-center">Eje</th>
                <th className="py-3.5 px-4 font-bold uppercase text-center">Score AHP</th>
                <th className="py-3.5 px-4 font-bold uppercase text-center">Nivel</th>
                <th className="py-3.5 px-4 font-bold uppercase text-center">Criterio Crítico</th>
                <th className="py-3.5 px-4 font-bold uppercase text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D3B9B9]/40">
              {filtered.map((item, idx) => {
                const globalRank = evaluatedReports.findIndex((r) => r.id === item.id) + 1;
                const isHigh = item.ahp_priority === 'alta';
                const isMed = item.ahp_priority === 'media';

                // Determinar el criterio con mayor peso en este reporte
                const ratings = item.criteria_ratings;
                let topCrit = 'Seguridad';
                let topVal = ratings.seguridad;
                if (ratings.salud > topVal) { topCrit = 'Salud'; topVal = ratings.salud; }
                if (ratings.equidad > topVal) { topCrit = 'Equidad'; topVal = ratings.equidad; }
                if (ratings.convivencia > topVal) { topCrit = 'Convivencia'; topVal = ratings.convivencia; }

                return (
                  <tr key={item.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    {/* Rank */}
                    <td className="py-3.5 px-4 text-center font-black">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs ${
                          globalRank === 1
                            ? 'bg-[#d30684] text-white shadow-xs'
                            : globalRank <= 3
                            ? 'bg-amber-100 text-[#E4981E]'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {globalRank}
                      </span>
                    </td>

                    {/* Problemática */}
                    <td className="py-3.5 px-4 space-y-0.5 max-w-sm">
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
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-[11px] font-bold capitalize text-slate-700">
                        {item.axis.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Score AHP */}
                    <td className="py-3.5 px-4 text-center font-mono font-black text-sm">
                      <span
                        className={
                          isHigh ? 'text-red-600' : isMed ? 'text-amber-600' : 'text-slate-600'
                        }
                      >
                        {item.ahp_score.toFixed(4)}
                      </span>
                    </td>

                    {/* Nivel de Prioridad */}
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          isHigh
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : isMed
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {item.ahp_priority}
                      </span>
                    </td>

                    {/* Criterio Dominante */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="text-[11px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200">
                        {topCrit} ({(topVal * 100).toFixed(0)}%)
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectReport(item);
                            onNavigateToTab('incidencias');
                          }}
                          className="px-2.5 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#fdf2f8] border border-[#D3B9B9] text-xs font-bold text-[#1a2527] hover:text-[#d30684] transition-colors cursor-pointer"
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
