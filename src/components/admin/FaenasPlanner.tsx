'use client';

import React from 'react';
import { GoogleIcon } from '@/components/GoogleIcon';
import { Report } from '@/types';

interface FaenasPlannerProps {
  reports: Report[];
  onOpenFaenaModal: (report: Report) => void;
  onOpenResolveModal: (report: Report) => void;
  onSelectReport: (report: Report) => void;
}

export function FaenasPlanner({
  reports,
  onOpenFaenaModal,
  onOpenResolveModal,
  onSelectReport,
}: FaenasPlannerProps) {
  // Faenas activas ya agendadas
  const scheduled = reports.filter((r) => r.status === 'faena_programada');
  // Casos en evaluación o recibidos con alta prioridad que ameritan ser programados
  const readyForFaena = reports.filter(
    (r) => (r.status === 'en_evaluacion' || r.status === 'recibido') && r.priority_level === 'alta'
  );

  return (
    <div className="space-y-6">
      {/* Banner de Introducción */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#D3B9B9] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <GoogleIcon name="calendar_month" filled size={18} className="text-[#E4981E]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#E4981E]">
              Agenda Comunitaria de Campo
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#1a2527] tracking-tight">
            Planificador de Faenas Barriales
          </h2>
          <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
            Organiza las jornadas de trabajo vecinal con brigadas juveniles: asignación de puntos de encuentro, checklist de herramientas y emisión de fichas técnicas oficiales.
          </p>
        </div>

        <div className="flex items-center space-x-2 bg-[#FFFBEB] border border-[#FDE68A] p-3 rounded-2xl shrink-0">
          <div className="text-center">
            <span className="text-2xl font-heading font-black text-[#E4981E] block leading-none">
              {scheduled.length}
            </span>
            <span className="text-[10px] font-bold text-[#92400e] uppercase tracking-wider">
              Faenas Activas
            </span>
          </div>
        </div>
      </div>

      {/* Sección 1: Faenas Programadas */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GoogleIcon name="event_available" filled size={20} className="text-[#E4981E]" />
            <h3 className="font-heading font-bold text-base text-[#1a2527]">
              Jornadas Barriales en Proceso de Ejecución ({scheduled.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500">Listas para coordinación en campo</span>
        </div>

        {scheduled.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-[#D3B9B9] text-center text-slate-400 space-y-2">
            <GoogleIcon name="event_busy" size={36} className="text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-[#1a2527]">No hay faenas programadas actualmente.</p>
            <p className="text-[11px] text-slate-500">
              Puedes agendar una faena seleccionando un reporte en la lista de abajo o desde la bandeja de incidencias.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {scheduled.map((report) => (
              <div
                key={report.id}
                className="bg-white p-5 rounded-3xl border-2 border-[#E4981E]/40 hover:border-[#E4981E] transition-all shadow-sm space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-sm font-black text-[#d30684]">
                      {report.ticket_code}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-300">
                      Faena Activa
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-500 capitalize">
                    {report.axis}
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9] text-xs space-y-1">
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">
                    Punto de Intervención:
                  </span>
                  <p className="font-bold text-[#1a2527] leading-snug">
                    {report.reference || 'Ubicación identificada por coordenadas'}
                  </p>
                  <p className="text-[11px] text-slate-600 line-clamp-2 italic pt-1 border-t border-[#D3B9B9]/50">
                    "{report.description}"
                  </p>
                </div>

                {/* Coordinación con Vecino si existe */}
                {report.wants_to_coordinate && report.coordinator_whatsapp && (
                  <div className="p-2.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-[#92400e]">
                      Vecino/a con WhatsApp inscrito:
                    </span>
                    <a
                      href={`https://api.whatsapp.com/send?phone=51${report.coordinator_whatsapp}&text=${encodeURIComponent(
                        `Hola, te contactamos desde Hilando Voces para coordinar la faena comunitaria del ticket ${report.ticket_code}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[11px] flex items-center space-x-1"
                    >
                      <GoogleIcon name="call" filled size={12} className="text-white" />
                      <span>Contactar</span>
                    </a>
                  </div>
                )}

                {/* Acciones de la Faena */}
                <div className="flex items-center space-x-2 pt-1 border-t border-[#D3B9B9]/60">
                  <button
                    type="button"
                    onClick={() => onOpenFaenaModal(report)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#D3B9B9] hover:bg-[#FAF8F5] text-xs font-bold text-[#1a2527] flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <GoogleIcon name="print" size={16} className="text-[#d30684]" />
                    <span>Ficha de Faena</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenResolveModal(report)}
                    className="flex-1 py-2 px-3 rounded-xl bg-[#d30684] hover:bg-[#bd0474] text-white text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-sm shadow-[#d30684]/20"
                  >
                    <GoogleIcon name="check_circle" filled size={16} className="text-white" />
                    <span>Concluir Faena</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sección 2: Casos Prioritarios Candidatos a Faena */}
      <div className="space-y-3 pt-4 border-t border-[#D3B9B9]">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <GoogleIcon name="priority_high" size={20} className="text-red-600" />
            <h3 className="font-heading font-bold text-base text-[#1a2527]">
              Casos Críticos Listos para ser Agendados ({readyForFaena.length})
            </h3>
          </div>
          <span className="text-xs text-slate-500">Priorizados por Gemini IA</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {readyForFaena.slice(0, 6).map((report) => (
            <div
              key={report.id}
              className="bg-white p-4 rounded-2xl border border-[#D3B9B9] hover:border-[#d30684] transition-all space-y-2 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#d30684]">{report.ticket_code}</span>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  Alta Prioridad
                </span>
              </div>
              <p className="text-xs text-[#1a2527] font-medium line-clamp-2 leading-relaxed">
                "{report.description}"
              </p>
              <button
                type="button"
                onClick={() => onOpenFaenaModal(report)}
                className="w-full py-2 px-3 rounded-xl bg-[#fdf2f8] hover:bg-[#d30684] text-[#d30684] hover:text-white border border-[#d30684]/30 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
              >
                <GoogleIcon name="add_circle" size={14} />
                <span>Programar en esta zona</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
