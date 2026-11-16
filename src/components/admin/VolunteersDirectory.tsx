'use client';

import React, { useState } from 'react';
import { GoogleIcon } from '@/components/GoogleIcon';
import { Report } from '@/types';

interface VolunteersDirectoryProps {
  reports: Report[];
}

export function VolunteersDirectory({ reports }: VolunteersDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [axisFilter, setAxisFilter] = useState('todos');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Filtrar solo los reportes con vecino coordinador inscrito
  const volunteers = reports.filter(
    (r) => r.wants_to_coordinate && r.coordinator_whatsapp
  );

  const filtered = volunteers.filter((v) => {
    if (axisFilter !== 'todos' && v.axis !== axisFilter) return false;
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const phoneMatch = (v.coordinator_whatsapp || '').includes(term);
      const ticketMatch = v.ticket_code.toLowerCase().includes(term);
      const refMatch = (v.reference || '').toLowerCase().includes(term);
      if (!phoneMatch && !ticketMatch && !refMatch) return false;
    }
    return true;
  });

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Banner Informativo y de Seguridad */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#D3B9B9] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <GoogleIcon name="groups" filled size={20} className="text-[#d30684]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#d30684]">
              Articulación Ciudadana
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#1a2527] tracking-tight">
            Red de Vecinos Coordinadores y Voluntarios
          </h2>
          <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
            Vecinas y vecinos de San Juan de Lurigancho inscritos para sumarse activamente a las faenas comunitarias.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-[#fdf2f8] border border-[#d30684]/30 p-3.5 rounded-2xl shrink-0">
          <div className="text-center">
            <span className="text-2xl font-heading font-black text-[#d30684] block leading-none">
              {volunteers.length}
            </span>
            <span className="text-[10px] font-bold text-[#bd0474] uppercase tracking-wider">
              Voluntarios Listos
            </span>
          </div>
        </div>
      </div>

      {/* Aviso de Confidencialidad y Ley 29733 */}
      <div className="p-4 rounded-2xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400e] flex items-start space-x-3">
        <GoogleIcon name="verified_user" filled size={18} className="text-[#E4981E] shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <span className="font-bold block">Uso estrictamente comunitario (Ley N° 29733):</span>
          <span>
            Los números telefónicos fueron compartidos voluntariamente por los ciudadanos únicamente para coordinar fechas y logística de faenas en su pasaje. Queda prohibido su uso para fines externos.
          </span>
        </div>
      </div>

      {/* Buscador y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-[#D3B9B9] flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar por teléfono (9...), ticket o referencia..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#D3B9B9] text-xs sm:text-sm text-[#1a2527] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d30684] font-medium"
          />
          <div className="absolute left-3 top-2.5">
            <GoogleIcon name="search" size={18} className="text-slate-400" />
          </div>
        </div>

        <select
          value={axisFilter}
          onChange={(e) => setAxisFilter(e.target.value)}
          className="px-3 py-2.5 rounded-xl bg-white border border-[#D3B9B9] text-xs font-bold text-[#1a2527] focus:outline-none focus:ring-2 focus:ring-[#d30684] cursor-pointer"
        >
          <option value="todos">Todos los Ejes Barriales</option>
          <option value="alumbrado">Alumbrado</option>
          <option value="microbasurales">Limpieza de basura</option>
          <option value="espacios_recreativos">Espacios comunitarios</option>
        </select>
      </div>

      {/* Lista de Voluntarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white p-10 rounded-3xl border border-[#D3B9B9] text-center text-slate-400 space-y-2">
            <GoogleIcon name="person_search" size={36} className="text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-[#1a2527]">No se encontraron voluntarios con este criterio.</p>
          </div>
        ) : (
          filtered.map((v) => (
            <div
              key={v.id}
              className="bg-white p-5 rounded-3xl border-2 border-[#D3B9B9] hover:border-[#d30684] transition-all shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-extrabold text-[#d30684]">
                  {v.ticket_code}
                </span>
                <span className="capitalize text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FAF8F5] border border-[#D3B9B9]">
                  {v.axis}
                </span>
              </div>

              {/* Teléfono con botón de copiado */}
              <div className="p-3 rounded-2xl bg-[#fdf2f8] border border-[#d30684]/30 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-[#d30684] text-white flex items-center justify-center">
                    <GoogleIcon name="call" filled size={16} className="text-white" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">WhatsApp:</span>
                    <span className="font-mono font-bold text-sm text-[#1a2527]">
                      {v.coordinator_whatsapp}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyPhone(v.coordinator_whatsapp || '')}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-[#d30684] hover:bg-white transition-colors cursor-pointer"
                  title="Copiar teléfono"
                >
                  <GoogleIcon
                    name={copiedPhone === v.coordinator_whatsapp ? 'check' : 'content_copy'}
                    size={16}
                    className={copiedPhone === v.coordinator_whatsapp ? 'text-[#16a34a]' : ''}
                  />
                </button>
              </div>

              {/* Zona o Referencia */}
              <div className="text-xs text-slate-700 space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Zona / Pasaje:</span>
                <p className="font-medium text-[#1a2527] line-clamp-1">
                  📍 {v.reference || 'San Juan de Lurigancho'}
                </p>
                <p className="text-[11px] text-slate-500 italic line-clamp-2 pt-1 border-t border-[#D3B9B9]/50">
                  "{v.description}"
                </p>
              </div>

              {/* Botón de Enlace Directo a WhatsApp */}
              <a
                href={`https://api.whatsapp.com/send?phone=51${v.coordinator_whatsapp}&text=${encodeURIComponent(
                  `¡Hola vecino/a! Te saludamos desde la red de lideresas comunitarias Hilando Voces (SJL). Te contactamos para coordinar la faena comunitaria de tu reporte ${v.ticket_code} en ${v.reference || 'tu calle'}. ¿En qué horario podemos llamarte o visitarte para afinar los detalles?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-sm transition-all cursor-pointer"
              >
                <GoogleIcon name="chat" filled size={16} className="text-white" />
                <span>Contactar por WhatsApp</span>
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
