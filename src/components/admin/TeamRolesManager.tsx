'use client';

import React, { useState } from 'react';
import { GoogleIcon } from '@/components/GoogleIcon';
import { useAdminSession, AdminRole } from './AdminSessionContext';

interface LeaderEntry {
  name: string;
  email: string;
  role: AdminRole;
  roleTitle: string;
  sector: string;
  phone: string;
  status: 'Activa' | 'En Campo' | 'Guardia';
  casesAttended: number;
}

export function TeamRolesManager() {
  const { profile } = useAdminSession();
  const [showAddModal, setShowAddModal] = useState(false);

  // Directorio de lideresas activas en San Juan de Lurigancho
  const [leadersDirectory, setLeadersDirectory] = useState<LeaderEntry[]>([
    {
      name: 'Rosa Huamán Quispe',
      email: 'lideresa.canto@hilandovoces.pe',
      role: 'lideresa',
      roleTitle: 'Lideresa Territorial SJL',
      sector: 'Comuna 12 · Canto Grande',
      phone: '984 123 456',
      status: 'Activa',
      casesAttended: 18,
    },
    {
      name: 'Valeria Mendoza Paucar',
      email: 'coordinadora.bayovar@hilandovoces.pe',
      role: 'coordinadora',
      roleTitle: 'Coordinadora de Faena Barrial',
      sector: 'Comuna 8 · Bayóvar',
      phone: '956 789 123',
      status: 'En Campo',
      casesAttended: 12,
    },
    {
      name: 'Ing. Carmen Ramos Alarcón',
      email: 'supervisora.distrital@hilandovoces.pe',
      role: 'superadmin',
      roleTitle: 'Supervisora Comunal Distrital',
      sector: 'Sede Central · San Juan de Lurigancho',
      phone: '998 345 678',
      status: 'Guardia',
      casesAttended: 34,
    },
    {
      name: 'Milagros Chumpitaz Cárdenas',
      email: 'milagros.zarate@hilandovoces.pe',
      role: 'lideresa',
      roleTitle: 'Lideresa Territorial SJL',
      sector: 'Comuna 4 · Zárate y Campoy',
      phone: '971 234 890',
      status: 'Activa',
      casesAttended: 9,
    },
    {
      name: 'Keyla Paredes Condori',
      email: 'keyla.mariscal@hilandovoces.pe',
      role: 'coordinadora',
      roleTitle: 'Coordinadora de Faena Barrial',
      sector: 'Comuna 15 · Mariscal Cáceres',
      phone: '962 341 789',
      status: 'En Campo',
      casesAttended: 15,
    },
  ]);

  // Formulario nueva lideresa
  const [newLeader, setNewLeader] = useState({
    name: '',
    role: 'lideresa' as AdminRole,
    sector: 'Comuna 12 · Canto Grande',
    phone: '',
  });

  const permissionsMatrix = [
    {
      category: 'Visualización y Monitoreo',
      permission: 'Visualizar Dashboard y Mapa Territorial georreferenciado en tiempo real',
      lideresa: true,
      coordinadora: true,
      superadmin: true,
      description: 'Acceso a la vista global de reportes ciudadanos en SJL.',
    },
    {
      category: 'Triaje y Decisión',
      permission: 'Triaje de expedientes, evaluación y categorización de urgencia',
      lideresa: true,
      coordinadora: false,
      superadmin: true,
      description: 'Capacidad de modificar estado a "En Evaluación" o "Desestimado".',
    },
    {
      category: 'Inteligencia Comunitaria',
      permission: 'Ejecutar matriz de priorización científica AHP y ajustar ponderaciones',
      lideresa: true,
      coordinadora: false,
      superadmin: true,
      description: 'Cálculo de pesos de Saaty (Seguridad, Salud, Escuelas, Conectividad).',
    },
    {
      category: 'Operaciones en Campo',
      permission: 'Calendarizar fechas de faenas comunitarias y asignar puntos de encuentro',
      lideresa: true,
      coordinadora: true,
      superadmin: true,
      description: 'Agendar faenas barriales en el calendario mensual de trabajo.',
    },
    {
      category: 'Privacidad y Contacto',
      permission: 'Acceso a números de WhatsApp de brigadistas para coordinación de faena',
      lideresa: true,
      coordinadora: true,
      superadmin: true,
      description: 'Contacto directo estrictamente protegido bajo Ley N° 29733.',
    },
    {
      category: 'Operaciones en Campo',
      permission: 'Emisión y descarga de Fichas Técnicas Oficiales de Faena Barrial',
      lideresa: true,
      coordinadora: true,
      superadmin: true,
      description: 'Generación de documentos de brigada con herramientas requeridas.',
    },
    {
      category: 'Rendición de Cuentas',
      permission: 'Subir fotografía del "Después" y certificar recuperación del espacio',
      lideresa: true,
      coordinadora: true,
      superadmin: true,
      description: 'Publicación comunitaria en la bitácora pública de rendición de cuentas.',
    },
    {
      category: 'Gobernanza y Auditoría',
      permission: 'Auditoría de cumplimiento legal (Ley N° 29733) y gestión de credenciales',
      lideresa: false,
      coordinadora: false,
      superadmin: true,
      description: 'Fiscalización distrital, trazabilidad y supervisión institucional.',
    },
  ];

  const handleCreateLeader = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeader.name || !newLeader.phone) return;

    const roleTitles: Record<AdminRole, string> = {
      lideresa: 'Lideresa Territorial SJL',
      coordinadora: 'Coordinadora de Faena Barrial',
      superadmin: 'Supervisora Comunal Distrital',
    };

    const entry: LeaderEntry = {
      name: newLeader.name,
      email: `${newLeader.name.toLowerCase().replace(/\s+/g, '.')}@hilandovoces.pe`,
      role: newLeader.role,
      roleTitle: roleTitles[newLeader.role],
      sector: newLeader.sector,
      phone: newLeader.phone,
      status: 'Activa',
      casesAttended: 0,
    };

    setLeadersDirectory((prev) => [...prev, entry]);
    setNewLeader({
      name: '',
      role: 'lideresa',
      sector: 'Comuna 12 · Canto Grande',
      phone: '',
    });
    setShowAddModal(false);
  };

  const isLideresaOrSuperadmin = profile?.role === 'lideresa' || profile?.role === 'superadmin';

  return (
    <div className="space-y-6">
      {/* 1. Banner Superior de Roles y Gobernanza */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#D3B9B9] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#d30684]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#d30684]">
              Gobernanza Territorial · San Juan de Lurigancho
            </span>
          </div>
          <h2 className="font-heading font-black text-xl sm:text-2xl text-[#1a2527] tracking-tight">
            Equipo de Lideresas y Estructura Territorial
          </h2>
          <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
            Coordinación y articulación de lideresas juveniles barriales en las 7 comunas territoriales de SJL para la gestión comunitaria geocercada.
          </p>
        </div>

        {/* Perfil Activo en Sesión */}
        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9] flex items-center space-x-3 shrink-0">
          <div className="w-11 h-11 rounded-2xl bg-[#d30684] text-white flex items-center justify-center font-heading font-black text-sm shadow-2xs">
            {profile?.avatarInitials || 'RH'}
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-xs text-[#1a2527]">{profile?.name}</span>
              <GoogleIcon name="verified" filled size={14} className="text-[#d30684]" />
            </div>
            <span className="text-[11px] font-bold text-[#d30684] block">
              {profile?.roleTitle}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {profile?.sector}
            </span>
          </div>
        </div>
      </div>

      {/* 2. PRIMERA LÍNEA: DIRECTORIO DE LIDERESAS BARRIALES EN SAN JUAN DE LURIGANCHO */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#D3B9B9] shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D3B9B9]/50 pb-4">
          <div>
            <h3 className="font-heading font-black text-lg text-[#1a2527]">
              Directorio de Lideresas Barriales SJL ({leadersDirectory.length})
            </h3>
            <p className="text-xs text-slate-500">
              Compañeras asignadas territorialmente para articular la respuesta vecinal en cada comuna
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#d30684] hover:bg-[#bd0474] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <GoogleIcon name="person_add" size={16} />
            <span>Asignar Nueva Lideresa</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leadersDirectory.map((leader, i) => {
            const isLideresa = leader.role === 'lideresa';
            const isCoord = leader.role === 'coordinadora';

            return (
              <div
                key={i}
                className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9] space-y-3 text-xs shadow-2xs hover:border-[#d30684] transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-heading font-black text-xs shrink-0 shadow-2xs ${
                        isLideresa
                          ? 'bg-[#d30684] text-white'
                          : isCoord
                          ? 'bg-[#E4981E] text-white'
                          : 'bg-[#C58B7E] text-white'
                      }`}
                    >
                      {leader.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')}
                    </div>
                    <div className="min-w-0">
                      <span className="font-bold text-[#1a2527] text-sm truncate block">
                        {leader.name}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate block">
                        {leader.email}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0 ${
                      leader.status === 'Activa'
                        ? 'bg-[#DAE3D9] text-[#1a2527]'
                        : leader.status === 'En Campo'
                        ? 'bg-[#FFFBEB] text-[#E4981E]'
                        : 'bg-[#fdf2f8] text-[#d30684]'
                    }`}
                  >
                    {leader.status}
                  </span>
                </div>

                <div className="space-y-1 pt-1">
                  <span
                    className={`text-xs font-bold block ${
                      isLideresa
                        ? 'text-[#d30684]'
                        : isCoord
                        ? 'text-[#E4981E]'
                        : 'text-[#C58B7E]'
                    }`}
                  >
                    {leader.roleTitle}
                  </span>
                  <p className="text-slate-600 text-xs flex items-center space-x-1">
                    <span>📍 {leader.sector}</span>
                  </p>
                </div>

                <div className="pt-2.5 border-t border-[#D3B9B9]/60 flex items-center justify-between text-xs text-slate-600">
                  <span>
                    Casos articulados: <strong>{leader.casesAttended}</strong>
                  </span>
                  <span className="font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded-lg border border-[#D3B9B9]/50">
                    {leader.phone}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. MATRIZ DE PERMISOS POR ROL (RBAC) - EXCLUSIVO PARA LA LIDERESA AL FINAL DEL TODO */}
      {isLideresaOrSuperadmin && (
        <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#D3B9B9] shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D3B9B9]/60 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <GoogleIcon name="lock" size={18} className="text-[#d30684]" />
                <h3 className="font-heading font-black text-base text-[#1a2527]">
                  Matriz Formal de Roles y Permisos (RBAC)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Panel de consulta de privilegios para la gobernanza comunitaria de San Juan de Lurigancho
              </p>
            </div>

            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1 text-slate-600 font-bold">
                <GoogleIcon name="check_circle" filled size={16} className="text-[#588157]" />
                <span>Habilitado</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-400 font-bold">
                <GoogleIcon name="remove" size={16} className="text-slate-300" />
                <span>Sin Acceso</span>
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#D3B9B9] text-slate-500 bg-[#FAF8F5]">
                  <th className="py-3 px-4 font-bold uppercase text-[10px]">Módulo y Funcionalidad</th>
                  <th className="py-3 px-3 text-center font-bold uppercase text-[10px] text-[#d30684] w-28">
                    Lideresa
                  </th>
                  <th className="py-3 px-3 text-center font-bold uppercase text-[10px] text-[#E4981E] w-28">
                    Coordinadora
                  </th>
                  <th className="py-3 px-3 text-center font-bold uppercase text-[10px] text-[#C58B7E] w-28">
                    Supervisora
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D3B9B9]/50">
                {permissionsMatrix.map((row, i) => (
                  <tr key={i} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 px-4">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        {row.category}
                      </span>
                      <span className="font-bold text-[#1a2527] block text-xs">{row.permission}</span>
                      <span className="text-[11px] text-slate-500 block">{row.description}</span>
                    </td>

                    {/* Lideresa */}
                    <td className="py-3 px-3 text-center bg-[#fdf2f8]/30">
                      {row.lideresa ? (
                        <div className="w-6 h-6 rounded-full bg-[#DAE3D9] text-[#1a2527] flex items-center justify-center mx-auto shadow-2xs">
                          <GoogleIcon name="check" size={14} />
                        </div>
                      ) : (
                        <GoogleIcon name="remove" size={16} className="text-slate-300 mx-auto" />
                      )}
                    </td>

                    {/* Coordinadora */}
                    <td className="py-3 px-3 text-center bg-[#FFFBEB]/30">
                      {row.coordinadora ? (
                        <div className="w-6 h-6 rounded-full bg-[#DAE3D9] text-[#1a2527] flex items-center justify-center mx-auto shadow-2xs">
                          <GoogleIcon name="check" size={14} />
                        </div>
                      ) : (
                        <GoogleIcon name="remove" size={16} className="text-slate-300 mx-auto" />
                      )}
                    </td>

                    {/* Supervisora */}
                    <td className="py-3 px-3 text-center bg-[#F3E8E8]/30">
                      {row.superadmin ? (
                        <div className="w-6 h-6 rounded-full bg-[#DAE3D9] text-[#1a2527] flex items-center justify-center mx-auto shadow-2xs">
                          <GoogleIcon name="check" size={14} />
                        </div>
                      ) : (
                        <GoogleIcon name="remove" size={16} className="text-slate-300 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL PARA ASIGNAR NUEVA LIDERESA */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#D3B9B9] shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#D3B9B9]/60 pb-3">
              <div className="flex items-center space-x-2">
                <GoogleIcon name="person_add" size={20} className="text-[#d30684]" />
                <h3 className="font-heading font-black text-base text-[#1a2527]">
                  Asignar Lideresa Territorial SJL
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <GoogleIcon name="close" size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateLeader} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nombre Completo de la Lideresa / Coordinadora:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Gladys Mendoza Huamán"
                  value={newLeader.name}
                  onChange={(e) => setNewLeader({ ...newLeader, name: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#D3B9B9] rounded-xl px-3 py-2 text-xs text-[#1a2527] focus:outline-none focus:border-[#d30684]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Rol y Nivel de Responsabilidad:
                </label>
                <select
                  value={newLeader.role}
                  onChange={(e) =>
                    setNewLeader({ ...newLeader, role: e.target.value as AdminRole })
                  }
                  className="w-full bg-[#FAF8F5] border border-[#D3B9B9] rounded-xl px-3 py-2 text-xs text-[#1a2527] focus:outline-none focus:border-[#d30684] cursor-pointer"
                >
                  <option value="lideresa">1. Lideresa Territorial SJL (Triaje y decisión)</option>
                  <option value="coordinadora">2. Coordinadora de Faena (Operación en campo)</option>
                  <option value="superadmin">3. Supervisora Comunal (Fiscalización)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Comuna o Sector Asignado:
                </label>
                <select
                  value={newLeader.sector}
                  onChange={(e) => setNewLeader({ ...newLeader, sector: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#D3B9B9] rounded-xl px-3 py-2 text-xs text-[#1a2527] focus:outline-none focus:border-[#d30684] cursor-pointer"
                >
                  <option value="Comuna 12 · Canto Grande">Comuna 12 · Canto Grande</option>
                  <option value="Comuna 8 · Bayóvar">Comuna 8 · Bayóvar</option>
                  <option value="Comuna 4 · Zárate y Campoy">Comuna 4 · Zárate y Campoy</option>
                  <option value="Comuna 15 · Mariscal Cáceres">Comuna 15 · Mariscal Cáceres</option>
                  <option value="Comuna 6 · Huáscar">Comuna 6 · Huáscar</option>
                  <option value="Sede Central · SJL">Sede Central · SJL</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Teléfono / WhatsApp de Contacto:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. 987 654 321"
                  value={newLeader.phone}
                  onChange={(e) => setNewLeader({ ...newLeader, phone: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-[#D3B9B9] rounded-xl px-3 py-2 text-xs text-[#1a2527] focus:outline-none focus:border-[#d30684]"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#D3B9B9]/60">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-[#D3B9B9] text-slate-600 font-bold hover:bg-[#FAF8F5] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#d30684] hover:bg-[#bd0474] text-white font-bold cursor-pointer transition-all shadow-xs"
                >
                  Confirmar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
