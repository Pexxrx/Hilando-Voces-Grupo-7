'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { GoogleIcon } from '@/components/GoogleIcon';
import { useAdminSession } from './AdminSessionContext';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  totalAlerts?: number;
}

export function AdminHeader({
  onToggleSidebar,
  onRefresh,
  refreshing,
  totalAlerts = 0,
}: AdminHeaderProps) {
  const pathname = usePathname();
  const { profile } = useAdminSession();

  const getSectionTitle = () => {
    if (pathname.includes('/admin/bandeja')) {
      return {
        title: 'Bandeja de Incidencias',
        subtitle: 'Expedientes ciudadanos y triaje de campo sin datos personales',
      };
    }
    if (pathname.includes('/admin/calendario')) {
      return {
        title: 'Planificador de Faenas Barriales',
        subtitle: 'Agenda comunitaria mensual, responsables y fichas técnicas',
      };
    }
    if (pathname.includes('/admin/ahp')) {
      return {
        title: 'Priorización Multicriterio AHP',
        subtitle: 'Modelo científico de Saaty para ranking objetivo en San Juan de Lurigancho',
      };
    }
    if (pathname.includes('/admin/voluntarios')) {
      return {
        title: 'Red de Voluntarios y Coordinación',
        subtitle: 'Padrón de vecinos y brigadistas con alias comunitarios y herramientas',
      };
    }
    if (pathname.includes('/admin/rendicion')) {
      return {
        title: 'Rendición de Cuentas Social',
        subtitle: 'Bitácora pública de transformaciones comunitarias (Antes y Después)',
      };
    }
    if (pathname.includes('/admin/equipo')) {
      return {
        title: 'Equipo de Lideresas y Gobernanza',
        subtitle: 'Estructura organizativa y matriz formal de roles y permisos (RBAC)',
      };
    }
    return {
      title: 'Centro de Mando Territorial',
      subtitle: 'Monitoreo barrial geocercado para San Juan de Lurigancho (SJL)',
    };
  };

  const { title, subtitle } = getSectionTitle();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#D3B9B9]/50 px-4 sm:px-6 py-3 shadow-2xs">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto w-full">
        {/* Lado izquierdo: Botón Menú Siempre Disponible + Título de Sección */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="px-3.5 py-2 rounded-2xl text-slate-800 hover:text-[#d30684] hover:bg-[#FAF8F5] border border-[#D3B9B9] flex items-center space-x-2 transition-all cursor-pointer shadow-2xs group"
            title="Abrir menú de módulos"
          >
            <GoogleIcon name="menu" size={20} className="text-[#d30684] group-hover:scale-110 transition-transform" />
            <span className="font-heading font-black text-xs text-[#1a2527]">Menú</span>
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-heading font-black text-base sm:text-lg text-[#1a2527] tracking-tight">
                {title}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FAF8F5] text-[#d30684] border border-[#d30684]/20">
                SJL · Grupo 7
              </span>
            </div>
            <p className="text-[11px] text-slate-500 hidden sm:block truncate max-w-md">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Lado derecho: Acciones y Perfil */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Botón Refrescar Datos */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2 sm:px-3 sm:py-2 rounded-2xl border border-[#D3B9B9] hover:border-[#d30684] hover:bg-[#FAF8F5] text-xs font-bold text-[#1a2527] flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50 shadow-2xs"
            title="Actualizar datos"
          >
            <GoogleIcon
              name="refresh"
              size={18}
              className={`text-[#d30684] ${refreshing ? 'animate-spin' : ''}`}
            />
            <span className="hidden sm:inline">Actualizar</span>
          </button>

          {/* Insignia del Rol con Avatar */}
          <div className="flex items-center space-x-2 bg-[#FAF8F5] border border-[#D3B9B9]/70 px-3 py-1.5 rounded-2xl">
            <div className="w-6 h-6 rounded-xl bg-[#d30684] text-white flex items-center justify-center text-[10px] font-black">
              {profile?.avatarInitials || 'L'}
            </div>
            <div className="text-left hidden md:block">
              <span className="text-xs font-bold text-[#1a2527] block leading-tight">
                {profile?.name.split(' ')[0]}
              </span>
              <span className="text-[10px] text-[#d30684] font-semibold block leading-tight">
                {profile?.roleTitle}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
