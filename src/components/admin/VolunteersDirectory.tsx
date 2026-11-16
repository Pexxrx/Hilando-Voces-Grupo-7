'use client';

import React, { useState } from 'react';
import { GoogleIcon } from '@/components/GoogleIcon';
import { Report } from '@/types';
import { ExtendedReport } from '@/data/mockReports';

interface VolunteersDirectoryProps {
  reports: Report[];
}

export function VolunteersDirectory({ reports }: VolunteersDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('todos');
  const [toolCategory, setToolCategory] = useState('todos');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Filtrar reportes con vecino coordinador inscrito
  const volunteers = reports.filter(
    (r) => r.wants_to_coordinate && r.coordinator_whatsapp
  );

  const filtered = volunteers.filter((v) => {
    const ext = v as ExtendedReport;
    const ref = (v.reference || '').toLowerCase();
    const toolsStr = (ext.tools_available || []).join(' ').toLowerCase();

    // Filtro por sector
    if (sectorFilter !== 'todos') {
      if (!ref.includes(sectorFilter.toLowerCase())) return false;
    }

    // Filtro por categoría de herramientas
    if (toolCategory === 'electricidad') {
      if (!toolsStr.includes('escalera') && !toolsStr.includes('cable') && !toolsStr.includes('taladro') && !toolsStr.includes('multímetro') && !toolsStr.includes('dieléctric')) {
        return false;
      }
    } else if (toolCategory === 'limpieza') {
      if (!toolsStr.includes('pala') && !toolsStr.includes('carretilla') && !toolsStr.includes('bolsa') && !toolsStr.includes('escobón') && !toolsStr.includes('rastrillo')) {
        return false;
      }
    } else if (toolCategory === 'pintura') {
      if (!toolsStr.includes('brocha') && !toolsStr.includes('rodillo') && !toolsStr.includes('pintura') && !toolsStr.includes('lija') && !toolsStr.includes('compresora')) {
        return false;
      }
    }

    // Búsqueda libre
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const phoneMatch = (v.coordinator_whatsapp || '').includes(term);
      const nameMatch = (ext.coordinator_name || '').toLowerCase().includes(term);
      const roleMatch = (ext.volunteer_role || '').toLowerCase().includes(term);
      const ticketMatch = v.ticket_code.toLowerCase().includes(term);
      const refMatch = ref.includes(term);
      if (!phoneMatch && !nameMatch && !roleMatch && !ticketMatch && !refMatch && !toolsStr.includes(term)) {
        return false;
      }
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
              Articulación Ciudadana en SJL
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#1a2527] tracking-tight">
            Red de Vecinos Coordinadores y Voluntarios
          </h2>
          <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
            Directorio territorial de ciudadanas y ciudadanos comprometidos con herramientas y mano de obra para las faenas barriales de San Juan de Lurigancho.
          </p>
        </div>

        <div className="flex items-center space-x-3 bg-[#fdf2f8] border border-[#d30684]/30 p-3.5 rounded-2xl shrink-0">
          <div className="text-center">
            <span className="text-3xl font-heading font-black text-[#d30684] block leading-none">
              {volunteers.length}
            </span>
            <span className="text-[10px] font-bold text-[#bd0474] uppercase tracking-wider">
              Voluntarios Activos
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
            Los números telefónicos fueron compartidos voluntariamente por los ciudadanos únicamente para coordinar fechas y logística de faenas en su pasaje. Queda prohibido su uso para fines externos o no autorizados.
          </span>
        </div>
      </div>

      {/* BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="bg-white p-4 rounded-3xl border border-[#D3B9B9] shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Input de Búsqueda */}
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
              placeholder="Buscar voluntario por nombre, herramientas, sector o teléfono..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9] text-xs text-[#1a2527] placeholder:text-slate-400 focus:outline-none focus:border-[#d30684] focus:ring-1 focus:ring-[#d30684]"
            />
          </div>

          {/* Filtro por Categoría de Herramientas */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setToolCategory('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                toolCategory === 'todos'
                  ? 'bg-[#1a2527] text-white'
                  : 'bg-[#FAF8F5] text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todas las Herramientas
            </button>
            <button
              type="button"
              onClick={() => setToolCategory('electricidad')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                toolCategory === 'electricidad'
                  ? 'bg-[#E4981E] text-white'
                  : 'bg-[#FAF8F5] text-slate-600 hover:bg-slate-200'
              }`}
            >
              ⚡ Electricidad y Escaleras
            </button>
            <button
              type="button"
              onClick={() => setToolCategory('limpieza')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                toolCategory === 'limpieza'
                  ? 'bg-[#E28A85] text-white'
                  : 'bg-[#FAF8F5] text-slate-600 hover:bg-slate-200'
              }`}
            >
              🧹 Limpieza y Palas
            </button>
            <button
              type="button"
              onClick={() => setToolCategory('pintura')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                toolCategory === 'pintura'
                  ? 'bg-[#588157] text-white'
                  : 'bg-[#FAF8F5] text-slate-600 hover:bg-slate-200'
              }`}
            >
              🎨 Pintura y Lozas
            </button>
          </div>
        </div>

        {/* Filtro rápido por sectores de SJL */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-[#D3B9B9]/50 text-xs">
          <span className="text-slate-400 font-bold shrink-0 text-[11px] mr-1">Sector SJL:</span>
          {['todos', 'Canto Grande', 'Bayóvar', 'Campoy', 'Zárate', 'Cáceres', 'Huáscar', 'Jicamarca', 'Mangomarca'].map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setSectorFilter(sec)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors shrink-0 cursor-pointer ${
                sectorFilter === sec
                  ? 'bg-[#d30684] text-white'
                  : 'bg-[#FAF8F5] text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sec === 'todos' ? 'Todos los sectores' : sec}
            </button>
          ))}
        </div>
      </div>

      {/* GRID DE VOLUNTARIOS Y COORDINADORES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white p-10 rounded-3xl border border-[#D3B9B9] text-center text-slate-400 space-y-2">
            <GoogleIcon name="person_search" size={36} className="text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-[#1a2527]">No se encontraron voluntarios con esos criterios.</p>
            <p className="text-[11px] text-slate-500">Prueba cambiando el sector o la categoría de herramientas.</p>
          </div>
        ) : (
          filtered.map((vol) => {
            const ext = vol as ExtendedReport;
            const name = ext.coordinator_name || 'Vecino Voluntario';
            const phone = vol.coordinator_whatsapp || '';
            const role = ext.volunteer_role || 'Coordinador Barrial';

            return (
              <div
                key={vol.id}
                className="bg-white p-5 rounded-3xl border border-[#D3B9B9] hover:border-[#d30684] shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  {/* Encabezado: Avatar + Nombre + Rol */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#d30684] to-[#1a2527] text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                        {name.slice(0, 1)}
                      </div>
                      <div>
                        <h4 className="font-heading font-bold text-sm text-[#1a2527] line-clamp-1">
                          {name}
                        </h4>
                        <span className="text-[11px] font-semibold text-[#d30684] block">
                          {role}
                        </span>
                      </div>
                    </div>

                    <span className="font-mono text-[10px] font-bold text-slate-400 bg-[#FAF8F5] px-1.5 py-0.5 rounded border border-[#D3B9B9]">
                      {vol.ticket_code}
                    </span>
                  </div>

                  {/* Ubicación y Referencia */}
                  <div className="text-xs text-slate-600 space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                      Ubicación de Referencia:
                    </span>
                    <p className="line-clamp-2 leading-relaxed font-medium">
                      📍 {vol.reference}
                    </p>
                  </div>

                  {/* Herramientas Disponibles */}
                  <div className="space-y-1.5 pt-2 border-t border-[#D3B9B9]/50">
                    <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">
                      Herramientas Comprometidas:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {(ext.tools_available || ['Mano de obra comunitaria']).map((tool, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-[#FAF8F5] border border-[#D3B9B9] text-[10px] font-semibold text-slate-700"
                        >
                          🛠️ {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Acciones de Contacto Comunitario */}
                <div className="pt-3 border-t border-[#D3B9B9]/60 flex items-center gap-2">
                  <a
                    href={`https://wa.me/51${phone}?text=${encodeURIComponent(
                      `Hola ${name}, te saludamos de la coordinación comunitaria de Hilando Voces respecto a tu reporte ${vol.ticket_code}.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <GoogleIcon name="chat" size={15} />
                    <span>WhatsApp</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyPhone(phone)}
                    className="py-2 px-3 rounded-xl bg-[#FAF8F5] hover:bg-slate-200 border border-[#D3B9B9] text-xs font-bold text-slate-700 transition-colors cursor-pointer shrink-0"
                    title="Copiar teléfono"
                  >
                    {copiedPhone === phone ? (
                      <span className="text-emerald-600 text-[11px] font-bold">¡Copiado!</span>
                    ) : (
                      <GoogleIcon name="content_copy" size={15} />
                    )}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
