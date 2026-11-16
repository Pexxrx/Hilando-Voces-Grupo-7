'use client';

import React, { useState } from 'react';
import { GoogleIcon } from '@/components/GoogleIcon';
import { Report } from '@/types';

interface FaenaSheetModalProps {
  report: Report;
  onClose: () => void;
  onScheduleFaena: (reportId: string) => void;
}

export function FaenaSheetModal({ report, onClose, onScheduleFaena }: FaenaSheetModalProps) {
  const [faenaDate, setFaenaDate] = useState('');
  const [meetingPoint, setMeetingPoint] = useState(report.reference || 'Punto central de la comunidad');
  const [materials] = useState<string[]>([
    'Bolsas gruesas de basura de 140 litros',
    'Escobas de cerda dura y palas',
    'Guantes de protección de nitrilo',
    'Agua y refrigerio para brigada juvenil',
  ]);

  const handlePrint = () => {
    window.print();
  };

  const handleConfirmSchedule = () => {
    onScheduleFaena(report.id);
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#D3B9B9] overflow-hidden my-8 print:m-0 print:border-none print:shadow-none print:bg-white text-[#1a2527] print:text-black">
        {/* Cabecera del modal (oculta al imprimir) */}
        <div className="bg-[#FAF8F5] p-6 flex items-center justify-between border-b border-[#D3B9B9]/70 print:hidden">
          <div className="flex items-center space-x-2">
            <GoogleIcon name="description" filled size={20} className="text-[#d30684]" />
            <h3 className="font-heading font-bold text-lg text-[#1a2527]">Ficha Técnica de Faena Comunal</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-[#d30684] hover:bg-[#fdf2f8] transition-colors cursor-pointer"
          >
            <GoogleIcon name="close" size={22} />
          </button>
        </div>

        {/* Contenido imprimible */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="border-b-2 border-[#D3B9B9] print:border-black pb-4 flex justify-between items-start">
            <div>
              <span className="text-xs uppercase font-bold tracking-widest text-[#d30684] block">
                Plataforma Comunitaria · Hilando Voces
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1a2527] print:text-black mt-0.5">
                Ficha Técnica de Jornada Barrial
              </h1>
              <p className="text-xs text-slate-600 print:text-slate-600 mt-0.5">
                Territorio: San Juan de Lurigancho (SJL), Lima · Grupo 7
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 print:text-slate-600 block">Código del Caso</span>
              <span className="text-lg font-mono font-bold bg-[#FAF8F5] print:bg-slate-100 text-[#d30684] print:text-black px-3 py-1 rounded-xl border border-[#D3B9B9] print:border-slate-300">
                {report.ticket_code}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-[#FAF8F5] print:bg-slate-50 rounded-2xl border border-[#D3B9B9] print:border-slate-200">
              <span className="font-bold text-slate-500 print:text-slate-600 uppercase block text-[10px]">Eje Barrial:</span>
              <span className="font-heading font-bold text-[#1a2527] print:text-black capitalize text-sm">{report.axis}</span>
            </div>
            <div className="p-3.5 bg-[#FAF8F5] print:bg-slate-50 rounded-2xl border border-[#D3B9B9] print:border-slate-200">
              <span className="font-bold text-slate-500 print:text-slate-600 uppercase block text-[10px]">Prioridad Sugerida:</span>
              <span className="font-bold text-[#d30684] print:text-black capitalize text-sm">{report.priority_level}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1a2527] print:text-slate-600 mb-1.5">
              Voz del Vecino (Testimonio Textual):
            </h4>
            <p className="p-4 bg-[#FAF8F5] print:bg-slate-50 rounded-2xl border border-[#DACCAF] print:border-slate-200 text-xs sm:text-sm text-slate-700 print:text-black italic leading-relaxed">
              "{report.description}"
            </p>
          </div>

          {report.wants_to_coordinate && report.coordinator_whatsapp && (
            <div className="p-4 bg-[#FAF8F5] print:bg-amber-50 rounded-2xl border border-[#D3B9B9] print:border-amber-200 text-xs flex items-center justify-between">
              <div>
                <span className="font-bold text-[#1a2527] print:text-amber-900 block">Vecino Coordinador Inscrito:</span>
                <span className="text-slate-600 print:text-amber-800">Dispuesto a apoyar en la organización y logística barrial.</span>
              </div>
              <span className="font-mono font-bold text-sm bg-white print:bg-white px-3 py-1.5 rounded-xl border border-[#D3B9B9] print:border-amber-300 text-[#d30684] print:text-black flex items-center space-x-1">
                <GoogleIcon name="call" filled size={16} className="text-[#d30684]" />
                <span>{report.coordinator_whatsapp}</span>
              </span>
            </div>
          )}

          {/* Formulario de Faena */}
          <div className="space-y-4 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1a2527] print:text-black border-b border-[#D3B9B9] print:border-slate-300 pb-1.5">
              Datos Operativos de la Jornada
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-[#1a2527] print:text-black block mb-1">Fecha y Hora Programada:</label>
                <input
                  type="datetime-local"
                  value={faenaDate}
                  onChange={(e) => setFaenaDate(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white print:bg-white border border-[#D3B9B9] print:border-slate-300 text-xs text-[#1a2527] print:text-black shadow-sm"
                />
              </div>

              <div>
                <label className="font-bold text-[#1a2527] print:text-black block mb-1">Punto de Encuentro:</label>
                <input
                  type="text"
                  value={meetingPoint}
                  onChange={(e) => setMeetingPoint(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white print:bg-white border border-[#D3B9B9] print:border-slate-300 text-xs text-[#1a2527] print:text-black shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-[#1a2527] print:text-black block mb-2 text-xs">
                Checklist de Materiales Requeridos:
              </label>
              <ul className="space-y-2 text-xs text-slate-700 print:text-slate-800">
                {materials.map((mat, i) => (
                  <li key={i} className="flex items-center space-x-2.5">
                    <GoogleIcon name="check_box" filled size={18} className="text-[#d30684] shrink-0" />
                    <span>{mat}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Acciones del pie */}
        <div className="bg-[#FAF8F5] p-4 sm:p-6 border-t border-[#D3B9B9]/70 flex flex-col sm:flex-row items-center justify-end gap-3 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-[#D3B9B9] text-xs font-semibold text-slate-700 hover:bg-white cursor-pointer shadow-sm"
          >
            Cerrar
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white hover:bg-[#fdf2f8] text-[#1a2527] hover:text-[#d30684] text-xs font-bold flex items-center justify-center space-x-2 cursor-pointer border border-[#D3B9B9] shadow-sm transition-colors"
          >
            <GoogleIcon name="print" size={18} className="text-[#d30684]" />
            <span>Imprimir / PDF</span>
          </button>
          <button
            type="button"
            onClick={handleConfirmSchedule}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#d30684] hover:bg-[#bd0474] text-white text-xs font-bold shadow-md shadow-[#d30684]/20 flex items-center justify-center space-x-2 cursor-pointer transition-all"
          >
            <GoogleIcon name="calendar_month" filled size={18} className="text-white" />
            <span>Marcar "Faena Programada"</span>
          </button>
        </div>
      </div>
    </div>
  );
}
