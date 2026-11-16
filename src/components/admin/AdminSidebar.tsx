'use client';

import React from 'react';
import Link from 'next/link';
import { GoogleIcon } from '@/components/GoogleIcon';
import { useAdminSession, AdminRole } from './AdminSessionContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pendingCount?: number;
}

export function AdminSidebar({ isOpen, onClose, pendingCount = 0 }: AdminSidebarProps) {
  const { profile, activeTab, setActiveTab, switchRole, signOut } = useAdminSession();

  const navigationItems = [
    {
      id: 'resumen',
      label: 'Centro de Mando',
      description: 'KPIs, mapa territorial y alertas',
      icon: 'dashboard',
    },
    {
      id: 'incidencias',
      label: 'Bandeja de Incidencias',
      description: 'Triaje, tickets y análisis IA',
      icon: 'inbox',
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      id: 'faenas',
      label: 'Planificador de Faenas',
      description: 'Agenda barrial y fichas técnicas',
      icon: 'calendar_month',
    },
    {
      id: 'voluntarios',
      label: 'Red de Voluntarios',
      description: 'Coordinación por WhatsApp',
      icon: 'groups',
    },
    {
      id: 'rendicion',
      label: 'Rendición de Cuentas',
      description: 'Evidencias del "Después"',
      icon: 'verified',
    },
    {
      id: 'equipo',
      label: 'Equipo y Roles',
      description: 'Lideresas de SJL y permisos',
      icon: 'manage_accounts',
    },
  ];

  const getRoleBadgeStyle = (role?: AdminRole) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'coordinadora':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-[#fdf2f8] text-[#d30684] border-[#f472b6]';
    }
  };

  return (
    <>
      {/* Backdrop móvil */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Barra lateral */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-[#D3B9B9] flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Cabecera del Sidebar */}
        <div className="p-5 border-b border-[#D3B9B9]/70 space-y-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-2xl bg-[#fdf2f8] text-[#d30684] border border-[#d30684]/30 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                <GoogleIcon name="volunteer_activism" size={24} filled className="text-[#d30684]" />
              </div>
              <div>
                <span className="font-heading font-extrabold text-base tracking-tight text-[#1a2527] block leading-tight">
                  Hilando Voces
                </span>
                <span className="text-[10px] text-[#E28A85] block font-bold uppercase tracking-wider">
                  Panel de Lideresas SJL
                </span>
              </div>
            </Link>

            {/* Botón cerrar en móvil */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-[#1a2527] hover:bg-[#FAF8F5]"
            >
              <GoogleIcon name="close" size={20} />
            </button>
          </div>

          {/* Tarjeta de Lideresa Activa */}
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9]/80 space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#d30684] text-white flex items-center justify-center font-heading font-extrabold text-xs shadow-sm shrink-0">
                {profile?.avatarInitials || 'LH'}
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-bold text-xs text-[#1a2527] truncate block">
                  {profile?.name || 'Lideresa Comunitaria'}
                </span>
                <span className="text-[11px] text-slate-500 truncate block">
                  {profile?.sector || 'San Juan de Lurigancho'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-[#D3B9B9]/50">
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(
                  profile?.role
                )}`}
              >
                {profile?.roleTitle || 'Lideresa SJL'}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Activa</span>
              </span>
            </div>
          </div>
        </div>

        {/* Navegación por Sub-menús */}
        <nav className="flex-1 overflow-y-auto p-3.5 space-y-1.5">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-slate-500 px-3 py-1 block">
            Módulos de Gestión Barrial
          </span>

          {navigationItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#fdf2f8] text-[#d30684] font-bold border-2 border-[#d30684] shadow-sm'
                    : 'text-slate-700 hover:bg-[#FAF8F5] hover:text-[#1a2527] font-semibold border-2 border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-[#d30684] text-white' : 'bg-[#FAF8F5] text-slate-500'
                    }`}
                  >
                    <GoogleIcon
                      name={item.icon}
                      size={18}
                      filled={isActive}
                      className={isActive ? 'text-white' : 'text-slate-600'}
                    />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm block leading-tight truncate">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal block leading-tight truncate">
                      {item.description}
                    </span>
                  </div>
                </div>

                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#d30684] text-white shadow-sm shrink-0 ml-1">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Pie del Sidebar: Selector de Roles y Cierre */}
        <div className="p-4 border-t border-[#D3B9B9]/70 space-y-3 bg-[#FAF8F5]">
          {/* Selector de Rol Rápido (Demo Switcher) */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Cambiar Rol (Modo Demo):
            </span>
            <div className="grid grid-cols-3 gap-1 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => switchRole('lideresa')}
                className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer border ${
                  profile?.role === 'lideresa'
                    ? 'bg-[#d30684] text-white border-[#d30684] shadow-sm'
                    : 'bg-white text-slate-600 border-[#D3B9B9] hover:border-[#d30684]'
                }`}
                title="Lideresa Territorial"
              >
                Lideresa
              </button>
              <button
                type="button"
                onClick={() => switchRole('coordinadora')}
                className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer border ${
                  profile?.role === 'coordinadora'
                    ? 'bg-[#E4981E] text-white border-[#E4981E] shadow-sm'
                    : 'bg-white text-slate-600 border-[#D3B9B9] hover:border-[#E4981E]'
                }`}
                title="Coordinadora de Faena"
              >
                Faenas
              </button>
              <button
                type="button"
                onClick={() => switchRole('superadmin')}
                className={`py-1.5 px-1 rounded-lg text-center transition-all cursor-pointer border ${
                  profile?.role === 'superadmin'
                    ? 'bg-purple-700 text-white border-purple-700 shadow-sm'
                    : 'bg-white text-slate-600 border-[#D3B9B9] hover:border-purple-600'
                }`}
                title="Supervisora Comunal"
              >
                Super
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#D3B9B9]/50 text-xs">
            <Link
              href="/"
              className="text-slate-600 hover:text-[#d30684] font-medium flex items-center space-x-1 transition-colors"
            >
              <GoogleIcon name="arrow_back" size={14} />
              <span>Ver Portal</span>
            </Link>

            <button
              type="button"
              onClick={signOut}
              className="text-[#8c472f] hover:text-[#d30684] font-bold flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <GoogleIcon name="logout" size={14} />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
