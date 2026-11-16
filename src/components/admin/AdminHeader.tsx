'use client';

import React from 'react';
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
  const { profile, activeTab, switchRole } = useAdminSession();

  const getSectionTitle = () => {
    switch (activeTab) {
      case 'incidencias':
        return {
          title: 'Bandeja de Incidencias y Triaje',
          subtitle: 'Clasificación asistida por Gemini IA y atención de tickets vecinales',
        };
      case 'faenas':
        return {
          title: 'Planificador de Faenas Barriales',
          subtitle: 'Agenda comunitaria, materiales requeridos y fichas técnicas imprimibles',
        };
      case 'voluntarios':
        return {
          title: 'Red de Voluntarios y Coordinación',
          subtitle: 'Vecinas y vecinos dispuestos a apoyar en faenas con enlace directo a WhatsApp',
        };
      case 'rendicion':
        return {
          title: 'Rendición de Cuentas y Evidencias',
          subtitle: 'Carga de fotografías del "Después" para cerrar expedientes y certificar obras',
        };
      case 'equipo':
        return {
          title: 'Equipo de Lideresas y Permisos',
          subtitle: 'Padrón de lideresas barriales de San Juan de Lurigancho y matriz de roles',
        };
      default:
        return {
          title: 'Centro de Mando Territorial',
          subtitle: 'Monitoreo barrial en tiempo real para San Juan de Lurigancho (SJL)',
        };
    }
  };

  const { title, subtitle } = getSectionTitle();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#D3B9B9] px-4 sm:px-6 py-3.5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        {/* Lado izquierdo: Botón Menú Móvil + Título */}
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-[#d30684] hover:bg-[#FAF8F5] border border-[#D3B9B9] cursor-pointer"
            title="Abrir menú"
          >
            <GoogleIcon name="menu" size={20} />
          </button>

          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-heading font-extrabold text-lg sm:text-xl text-[#1a2527] tracking-tight">
                {title}
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#fdf2f8] text-[#d30684] border border-[#d30684]/30">
                SJL · Grupo 7
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Lado derecho: Acciones Rápidas */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Botón Refrescar Datos */}
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="p-2 sm:px-3 sm:py-2 rounded-xl border border-[#D3B9B9] hover:border-[#d30684] hover:bg-[#FAF8F5] text-xs font-bold text-[#1a2527] flex items-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
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
          <div className="flex items-center space-x-2 bg-[#FAF8F5] border border-[#D3B9B9] px-3 py-1.5 rounded-2xl">
            <div className="w-6 h-6 rounded-lg bg-[#d30684] text-white flex items-center justify-center text-[10px] font-black">
              {profile?.avatarInitials || 'L'}
            </div>
            <div className="hidden md:block text-left leading-tight">
              <span className="text-xs font-bold text-[#1a2527] block">
                {profile?.name.split(' ')[0]}
              </span>
              <span className="text-[10px] font-semibold text-[#d30684] block">
                {profile?.roleTitle}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
