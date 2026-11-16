'use client';

import React, { useState } from 'react';
import { GoogleIcon } from '@/components/GoogleIcon';
import { Report } from '@/types';
import { ExtendedReport } from '@/data/mockReports';

interface VolunteersDirectoryProps {
  reports: Report[];
}

interface VolunteerItem {
  id: string;
  alias: string;
  roleType: 'vecino' | 'voluntario' | 'coordinadora';
  roleLabel: string;
  phone: string;
  sector: string;
  tools: string[];
  ticketCode?: string;
}

export function VolunteersDirectory({ reports }: VolunteersDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState('todos');
  const [roleTypeFilter, setRoleTypeFilter] = useState('todos');
  const [copiedPhone, setCopiedPhone] = useState<string | null>(null);

  // Modal para inscribir nuevo colaborador con apodo/alias
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAlias, setNewAlias] = useState('');
  const [newRoleType, setNewRoleType] = useState<'vecino' | 'voluntario' | 'coordinadora'>('voluntario');
  const [newPhone, setNewPhone] = useState('');
  const [newSector, setNewSector] = useState('Canto Grande');
  const [newTools, setNewTools] = useState('');

  // Voluntarios registrados localmente
  const [customVolunteers, setCustomVolunteers] = useState<VolunteerItem[]>([]);

  // Convertir los reportes con vecinos a formato anónimo estricto con alias comunales
  const initialVolunteers: VolunteerItem[] = reports
    .filter((r) => r.wants_to_coordinate && r.coordinator_whatsapp)
    .map((v, idx) => {
      const ext = v as ExtendedReport;
      const sectorGuess = (v.reference || '').split(',')[0] || 'San Juan de Lurigancho';

      // Asignar apodo / alias comunitario protegiendo datos personales (Ley N° 29733)
      let alias = `Colaborador SJL-${idx + 1}`;
      let roleType: 'vecino' | 'voluntario' | 'coordinadora' = 'vecino';
      let roleLabel = 'Vecino Coordinador';

      if (idx % 3 === 0) {
        alias = `Técnico Barrial #${idx + 10}`;
        roleType = 'coordinadora';
        roleLabel = 'Coordinadora de Faena';
      } else if (idx % 2 === 0) {
        alias = `Joven Brigadista #${idx + 5}`;
        roleType = 'voluntario';
        roleLabel = 'Joven Voluntario/a';
      } else {
        alias = `Vecino Vigilante #${idx + 1}`;
        roleType = 'vecino';
        roleLabel = 'Vecino(a) Colaborador(a)';
      }

      return {
        id: v.id,
        alias,
        roleType,
        roleLabel,
        phone: v.coordinator_whatsapp || '',
        sector: sectorGuess,
        tools: ext.tools_available || ['Mano de obra comunitaria y refrigerios'],
        ticketCode: v.ticket_code,
      };
    });

  const allVolunteers = [...customVolunteers, ...initialVolunteers];

  const filtered = allVolunteers.filter((vol) => {
    if (roleTypeFilter !== 'todos' && vol.roleType !== roleTypeFilter) return false;
    if (sectorFilter !== 'todos' && !vol.sector.toLowerCase().includes(sectorFilter.toLowerCase())) return false;

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const aliasMatch = vol.alias.toLowerCase().includes(term);
      const phoneMatch = vol.phone.includes(term);
      const toolsMatch = vol.tools.join(' ').toLowerCase().includes(term);
      const secMatch = vol.sector.toLowerCase().includes(term);
      if (!aliasMatch && !phoneMatch && !toolsMatch && !secMatch) return false;
    }

    return true;
  });

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(phone);
    setTimeout(() => setCopiedPhone(null), 2000);
  };

  const handleRegisterVolunteer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAlias.trim() || !newPhone.trim()) return;

    let roleLabel = 'Joven Voluntario/a';
    if (newRoleType === 'vecino') roleLabel = 'Vecino(a) Colaborador(a)';
    if (newRoleType === 'coordinadora') roleLabel = 'Coordinadora de Faena';

    const toolsArr = newTools.trim()
      ? newTools.split(',').map((t) => t.trim())
      : ['Mano de obra para cuadrilla juvenil'];

    const newVol: VolunteerItem = {
      id: `custom-vol-${Date.now()}`,
      alias: newAlias.trim(),
      roleType: newRoleType,
      roleLabel,
      phone: newPhone.trim(),
      sector: newSector,
      tools: toolsArr,
    };

    setCustomVolunteers((prev) => [newVol, ...prev]);
    setNewAlias('');
    setNewPhone('');
    setNewTools('');
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. CABECERA LIMPIA: ARTICULACIÓN VECINAL Y BOTÓN DE NUEVO VOLUNTARIO */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#D3B9B9]/50 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <GoogleIcon name="groups" filled size={18} className="text-[#d30684]" />
            <span className="text-[10px] font-black uppercase tracking-wider text-[#d30684]">
              Articulación y Fuerza Comunal
            </span>
          </div>
          <h2 className="font-heading font-black text-2xl text-[#1a2527] tracking-tight">
            Red de Colaboradores y Voluntarios
          </h2>
          <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
            Directorio protegido bajo la Ley N° 29733: se usan <strong>apodos o alias comunitarios</strong> para resguardar la identidad vecinal y solo se mantiene el número de coordinación logística.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#d30684] hover:bg-[#bd0474] text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-md shadow-[#d30684]/25 cursor-pointer"
          >
            <GoogleIcon name="person_add" size={16} />
            <span>Inscribir Colaborador</span>
          </button>
        </div>
      </div>

      {/* 2. BARRA DE FILTROS Y BÚSQUEDA */}
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
              placeholder="Buscar por apodo, herramientas o teléfono..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9]/60 text-xs text-[#1a2527] placeholder:text-slate-400 focus:outline-none focus:border-[#d30684]"
            />
          </div>

          {/* Filtro por Tipo de Rol */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setRoleTypeFilter('todos')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                roleTypeFilter === 'todos'
                  ? 'bg-[#1a2527] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({allVolunteers.length})
            </button>
            <button
              type="button"
              onClick={() => setRoleTypeFilter('voluntario')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                roleTypeFilter === 'voluntario'
                  ? 'bg-[#d30684] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#d30684] hover:bg-[#fdf2f8]'
              }`}
            >
              Jóvenes Voluntarios
            </button>
            <button
              type="button"
              onClick={() => setRoleTypeFilter('vecino')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                roleTypeFilter === 'vecino'
                  ? 'bg-[#E4981E] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#E4981E] hover:bg-[#FFFBEB]'
              }`}
            >
              Vecinos Colaboradores
            </button>
            <button
              type="button"
              onClick={() => setRoleTypeFilter('coordinadora')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                roleTypeFilter === 'coordinadora'
                  ? 'bg-[#588157] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#588157] hover:bg-[#F0FDF4]'
              }`}
            >
              Coordinadoras
            </button>
          </div>
        </div>

        {/* Sectores de SJL */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-2 border-t border-[#D3B9B9]/40 text-xs">
          <span className="text-slate-400 font-bold text-[11px] mr-1">Sector:</span>
          {['todos', 'Canto Grande', 'Bayóvar', 'Campoy', 'Zárate', 'Huáscar', 'Jicamarca'].map((sec) => (
            <button
              key={sec}
              type="button"
              onClick={() => setSectorFilter(sec)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors shrink-0 cursor-pointer ${
                sectorFilter === sec
                  ? 'bg-[#d30684] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sec === 'todos' ? 'Todos los sectores' : sec}
            </button>
          ))}
        </div>
      </div>

      {/* 3. GRID DE TARJETAS DE COLABORADORES (ANÓNIMO, CON APODOS Y HERRAMIENTAS) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full bg-white p-10 rounded-3xl border border-[#D3B9B9]/50 text-center text-slate-400 space-y-2">
            <GoogleIcon name="person_search" size={36} className="text-slate-300 mx-auto" />
            <p className="text-xs font-bold text-[#1a2527]">No se encontraron colaboradores con esos filtros.</p>
          </div>
        ) : (
          filtered.map((vol) => (
            <div
              key={vol.id}
              className="bg-white p-5 rounded-3xl border border-[#D3B9B9]/50 hover:border-[#d30684] shadow-sm transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-3">
                {/* Encabezado: Apodo + Etiqueta de Rol */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-[#fdf2f8] text-[#d30684] border border-[#d30684]/20 flex items-center justify-center font-black text-sm shrink-0">
                      {vol.roleType === 'coordinadora' ? '⚡' : vol.roleType === 'voluntario' ? '🤝' : '🏠'}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-heading font-black text-sm text-[#1a2527] truncate">
                        {vol.alias}
                      </h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.2 rounded-full inline-block mt-0.5 ${
                          vol.roleType === 'coordinadora'
                            ? 'bg-[#F0FDF4] text-[#588157] border border-[#588157]/30'
                            : vol.roleType === 'voluntario'
                            ? 'bg-[#fdf2f8] text-[#d30684] border border-[#d30684]/30'
                            : 'bg-[#FFFBEB] text-[#E4981E] border border-[#E4981E]/30'
                        }`}
                      >
                        {vol.roleLabel}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    📍 SJL
                  </span>
                </div>

                {/* Sector Territorial */}
                <div className="text-xs text-slate-600 space-y-0.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Sector Asignado:
                  </span>
                  <p className="line-clamp-1 font-medium text-slate-800">
                    {vol.sector}
                  </p>
                </div>

                {/* Herramientas y Compromiso */}
                <div className="space-y-1 pt-1 border-t border-[#D3B9B9]/40">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                    Herramientas y Aporte Comprometido:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {vol.tools.map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-lg bg-[#FAF8F5] border border-[#D3B9B9]/50 text-[10px] font-semibold text-slate-700"
                      >
                        🛠️ {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botón de Coordinación Directa por WhatsApp */}
              <div className="pt-2 border-t border-[#D3B9B9]/50 flex items-center gap-2">
                <a
                  href={`https://wa.me/51${vol.phone}?text=${encodeURIComponent(
                    `Hola ${vol.alias}, te saludamos desde la coordinación comunitaria de Hilando Voces para coordinar la faena barrial.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-[#588157] hover:bg-[#476b46] text-white text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <GoogleIcon name="chat" size={15} />
                  <span>WhatsApp ({vol.phone})</span>
                </a>

                <button
                  type="button"
                  onClick={() => handleCopyPhone(vol.phone)}
                  className="py-2 px-3 rounded-xl bg-[#FAF8F5] hover:bg-slate-200 border border-[#D3B9B9] text-xs font-bold text-slate-700 transition-colors cursor-pointer shrink-0"
                  title="Copiar teléfono"
                >
                  {copiedPhone === vol.phone ? (
                    <span className="text-[#588157] text-[10px] font-black">¡Copiado!</span>
                  ) : (
                    <GoogleIcon name="content_copy" size={15} />
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4. MODAL PARA INSCRIBIR NUEVO COLABORADOR / VOLUNTARIO (CON APODOS) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl border border-[#D3B9B9] space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-[#D3B9B9]/50 pb-3">
              <div className="flex items-center space-x-2">
                <GoogleIcon name="person_add" filled size={20} className="text-[#d30684]" />
                <h3 className="font-heading font-black text-base text-[#1a2527]">
                  Inscribir Nuevo Colaborador
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <GoogleIcon name="close" size={20} />
              </button>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed">
              Para proteger los datos personales (Ley N° 29733), asigna un <strong>apodo o alias</strong> con el que el voluntario o vecino desee ser identificado en la cuadrilla.
            </p>

            <form onSubmit={handleRegisterVolunteer} className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Tipo de Colaborador:
                </label>
                <select
                  value={newRoleType}
                  onChange={(e) => setNewRoleType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D3B9B9] text-xs font-bold text-slate-800"
                >
                  <option value="voluntario">Joven Voluntario/a</option>
                  <option value="vecino">Vecino(a) Colaborador(a)</option>
                  <option value="coordinadora">Coordinadora de Faena</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Apodo o Alias Comunal:
                </label>
                <input
                  type="text"
                  required
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  placeholder="Ejemplo: 'Técnico Bayóvar', 'Águila Canto Grande'"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#D3B9B9] text-xs text-slate-800 focus:outline-none focus:border-[#d30684]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    WhatsApp (9 dígitos):
                  </label>
                  <input
                    type="tel"
                    required
                    maxLength={9}
                    pattern="[0-9]{9}"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="987654321"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#D3B9B9] text-xs font-mono text-slate-800 focus:outline-none focus:border-[#d30684]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                    Sector de SJL:
                  </label>
                  <select
                    value={newSector}
                    onChange={(e) => setNewSector(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF8F5] border border-[#D3B9B9] text-xs text-slate-800"
                  >
                    <option value="Canto Grande">Canto Grande</option>
                    <option value="Campoy">Campoy</option>
                    <option value="Zárate">Zárate</option>
                    <option value="Huáscar">Huáscar</option>
                    <option value="Bayóvar">Bayóvar</option>
                    <option value="Mariscal Cáceres">Mariscal Cáceres</option>
                    <option value="Jicamarca">Jicamarca</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Herramientas y Compromiso (separadas por coma):
                </label>
                <input
                  type="text"
                  value={newTools}
                  onChange={(e) => setNewTools(e.target.value)}
                  placeholder="Ej: Escalera de 6m, 2 palas, carretilla"
                  className="w-full px-3.5 py-2 rounded-xl bg-[#FAF8F5] border border-[#D3B9B9] text-xs text-slate-800 focus:outline-none focus:border-[#d30684]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#D3B9B9]/50">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#d30684] hover:bg-[#bd0474] text-white text-xs font-bold shadow-sm"
                >
                  Registrar Colaborador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
