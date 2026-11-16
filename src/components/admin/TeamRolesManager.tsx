'use client';

import React from 'react';
import { GoogleIcon } from '@/components/GoogleIcon';
import { useAdminSession, AdminRole, DEMO_PROFILES } from './AdminSessionContext';

export function TeamRolesManager() {
  const { profile, switchRole } = useAdminSession();

  const leadersDirectory = [
    {
      name: 'Rosa Huamán Quispe',
      email: 'lideresa@hilandovoces.pe',
      role: 'lideresa',
      roleTitle: 'Lideresa Territorial SJL',
      sector: 'Comuna 12 · Canto Grande',
      phone: '984123456',
      status: 'Activa',
      casesAttended: 18,
    },
    {
      name: 'Valeria Mendoza Paucar',
      email: 'coordinadora@hilandovoces.pe',
      role: 'coordinadora',
      roleTitle: 'Coordinadora de Faena Barrial',
      sector: 'Comuna 8 · Bayóvar',
      phone: '956789123',
      status: 'Activa',
      casesAttended: 12,
    },
    {
      name: 'Ing. Carmen Ramos Alarcón',
      email: 'supervisora@hilandovoces.pe',
      role: 'superadmin',
      roleTitle: 'Supervisora Comunal Distrital',
      sector: 'Sede Central · San Juan de Lurigancho',
      phone: '998345678',
      status: 'Activa',
      casesAttended: 34,
    },
    {
      name: 'Milagros Chumpitaz Cárdenas',
      email: 'milagros.sjl@hilandovoces.pe',
      role: 'lideresa',
      roleTitle: 'Lideresa Territorial SJL',
      sector: 'Comuna 4 · Zárate y Campoy',
      phone: '971234890',
      status: 'Activa',
      casesAttended: 9,
    },
    {
      name: 'Keyla Paredes Condori',
      email: 'keyla.sjl@hilandovoces.pe',
      role: 'coordinadora',
      roleTitle: 'Coordinadora de Faena Barrial',
      sector: 'Comuna 15 · Mariscal Cáceres',
      phone: '962341789',
      status: 'Activa',
      casesAttended: 15,
    },
  ];

  const permissionsMatrix = [
    {
      permission: 'Visualizar Dashboard y Mapa Territorial en tiempo real',
      lideresa: true,
      coordinadora: true,
      superadmin: true,
    },
    {
      permission: 'Triaje de incidencias y análisis asistido con Gemini IA',
      lideresa: true,
      coordinadora: false,
      superadmin: true,
    },
    {
      permission: 'Programar fechas de faenas barriales comunitarias',
      lideresa: true,
      coordinadora: true,
      superadmin: true,
    },
    {
      permission: 'Acceso a números de WhatsApp de vecinos para coordinación de campo',
      lideresa: true,
      coordinadora: true,
      superadmin: true,
    },
    {
      permission: 'Subir fotografía del "Después" y certificar recuperación del espacio',
      lideresa: true,
      coordinadora: true,
      superadmin: true,
    },
    {
      permission: 'Emisión e impresión de Fichas Técnicas Oficiales de Faena',
      lideresa: true,
      coordinadora: true,
      superadmin: true,
    },
    {
      permission: 'Gestión de roles de lideresas y políticas de seguridad (RLS)',
      lideresa: false,
      coordinadora: false,
      superadmin: true,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Banner de Roles */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#D3B9B9] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <GoogleIcon name="manage_accounts" filled size={20} className="text-[#d30684]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#d30684]">
              Gobernanza y Estructura Organizativa
            </span>
          </div>
          <h2 className="font-heading font-extrabold text-xl sm:text-2xl text-[#1a2527] tracking-tight">
            Equipo de Lideresas Juveniles y Roles (RBAC)
          </h2>
          <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
            Estructura de liderazgo territorial en San Juan de Lurigancho con control de accesos basado en roles para asegurar la trazabilidad comunitaria.
          </p>
        </div>

        {/* Perfil Activo */}
        <div className="p-3.5 rounded-2xl bg-[#fdf2f8] border border-[#d30684]/30 flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#d30684] text-white flex items-center justify-center font-black text-sm">
            {profile?.avatarInitials}
          </div>
          <div>
            <span className="font-bold text-xs text-[#1a2527] block">{profile?.name}</span>
            <span className="text-[11px] font-semibold text-[#d30684] block">
              Rol: {profile?.roleTitle}
            </span>
          </div>
        </div>
      </div>

      {/* Selector Rápido de Perfil para la Evaluación / Demo */}
      <div className="bg-white p-5 rounded-3xl border-2 border-[#d30684]/30 shadow-sm space-y-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#d30684] block">
            Simulador de Roles (Para Pruebas y Jurado)
          </span>
          <p className="text-xs text-slate-600 mt-0.5">
            Haz clic en cualquiera de los 3 perfiles para cambiar de rol al instante y probar las distintas funciones del panel:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Opción 1: Lideresa Territorial */}
          <button
            type="button"
            onClick={() => switchRole('lideresa')}
            className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer space-y-1 ${
              profile?.role === 'lideresa'
                ? 'border-[#d30684] bg-[#fdf2f8] shadow-md ring-2 ring-[#d30684]'
                : 'border-[#D3B9B9] bg-[#FAF8F5] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#d30684]">1. Lideresa Territorial</span>
              {profile?.role === 'lideresa' && <GoogleIcon name="check" size={18} className="text-[#d30684]" />}
            </div>
            <p className="text-xs font-bold text-[#1a2527]">Rosa Huamán Quispe</p>
            <p className="text-[11px] text-slate-500">Canto Grande · Triaje y priorización con Gemini IA</p>
          </button>

          {/* Opción 2: Coordinadora de Faena */}
          <button
            type="button"
            onClick={() => switchRole('coordinadora')}
            className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer space-y-1 ${
              profile?.role === 'coordinadora'
                ? 'border-[#E4981E] bg-[#FFFBEB] shadow-md ring-2 ring-[#E4981E]'
                : 'border-[#D3B9B9] bg-[#FAF8F5] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#E4981E]">2. Coordinadora de Faena</span>
              {profile?.role === 'coordinadora' && <GoogleIcon name="check" size={18} className="text-[#E4981E]" />}
            </div>
            <p className="text-xs font-bold text-[#1a2527]">Valeria Mendoza Paucar</p>
            <p className="text-[11px] text-slate-500">Bayóvar · Convocatoria WhatsApp y fotos del "Después"</p>
          </button>

          {/* Opción 3: Supervisora Comunal */}
          <button
            type="button"
            onClick={() => switchRole('superadmin')}
            className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer space-y-1 ${
              profile?.role === 'superadmin'
                ? 'border-purple-600 bg-purple-50 shadow-md ring-2 ring-purple-600'
                : 'border-[#D3B9B9] bg-[#FAF8F5] hover:bg-white'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-purple-700">3. Supervisora Comunal</span>
              {profile?.role === 'superadmin' && <GoogleIcon name="check" size={18} className="text-purple-700]" />}
            </div>
            <p className="text-xs font-bold text-[#1a2527]">Ing. Carmen Ramos Alarcón</p>
            <p className="text-[11px] text-slate-500">Sede Distrital SJL · Control total y auditoría de seguridad</p>
          </button>
        </div>
      </div>

      {/* Matriz de Permisos por Rol */}
      <div className="bg-white p-6 rounded-3xl border border-[#D3B9B9] shadow-sm space-y-4">
        <h3 className="font-heading font-bold text-base text-[#1a2527]">
          Matriz de Roles y Privilegios
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#D3B9B9] text-slate-500">
                <th className="py-2.5 px-3 font-bold uppercase">Funcionalidad / Permiso</th>
                <th className="py-2.5 px-3 text-center font-bold uppercase text-[#d30684]">Lideresa</th>
                <th className="py-2.5 px-3 text-center font-bold uppercase text-[#E4981E]">Coordinadora</th>
                <th className="py-2.5 px-3 text-center font-bold uppercase text-purple-700">Supervisora</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D3B9B9]/50">
              {permissionsMatrix.map((row, i) => (
                <tr key={i} className="hover:bg-[#FAF8F5]">
                  <td className="py-3 px-3 font-medium text-slate-700">{row.permission}</td>
                  <td className="py-3 px-3 text-center">
                    {row.lideresa ? (
                      <GoogleIcon name="check_circle" filled size={16} className="text-[#16a34a] mx-auto" />
                    ) : (
                      <GoogleIcon name="remove" size={16} className="text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {row.coordinadora ? (
                      <GoogleIcon name="check_circle" filled size={16} className="text-[#16a34a] mx-auto" />
                    ) : (
                      <GoogleIcon name="remove" size={16} className="text-slate-300 mx-auto" />
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {row.superadmin ? (
                      <GoogleIcon name="check_circle" filled size={16} className="text-[#16a34a] mx-auto" />
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

      {/* Directorio de Lideresas de SJL */}
      <div className="bg-white p-6 rounded-3xl border border-[#D3B9B9] shadow-sm space-y-4">
        <h3 className="font-heading font-bold text-base text-[#1a2527]">
          Directorio de Lideresas Barriales SJL ({leadersDirectory.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {leadersDirectory.map((leader, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9] space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1a2527] text-sm">{leader.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-emerald-100 text-emerald-800">
                  {leader.status}
                </span>
              </div>
              <p className="text-[#d30684] font-semibold text-[11px]">{leader.roleTitle}</p>
              <p className="text-slate-500 text-[11px]">📍 {leader.sector}</p>
              <div className="pt-2 border-t border-[#D3B9B9]/60 flex items-center justify-between text-[11px] text-slate-600">
                <span>Casos atendidos: <strong>{leader.casesAttended}</strong></span>
                <span className="font-mono">{leader.phone}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
