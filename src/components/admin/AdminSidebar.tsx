'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GoogleIcon } from '@/components/GoogleIcon';
import { useAdminSession, AdminRole } from './AdminSessionContext';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  pendingCount?: number;
}

export function AdminSidebar({ isOpen, onClose, pendingCount = 0 }: AdminSidebarProps) {
  const pathname = usePathname();
  const { profile, signOut } = useAdminSession();

  const navigationItems = [
    {
      href: '/admin/centro-mando',
      label: 'Centro de Mando',
      description: 'Mapa territorial en vivo y alertas',
      icon: 'dashboard',
    },
    {
      href: '/admin/bandeja',
      label: 'Bandeja de Incidencias',
      description: 'Expedientes ciudadanos y gestión',
      icon: 'inbox',
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    {
      href: '/admin/calendario',
      label: 'Planificador de Faenas',
      description: 'Agenda comunitaria y calendario',
      icon: 'calendar_month',
    },
    {
      href: '/admin/ahp',
      label: 'Priorización AHP',
      description: 'Modelo científico de Saaty',
      icon: 'tune',
    },
    {
      href: '/admin/voluntarios',
      label: 'Red de Voluntarios',
      description: 'Padrón con alias y herramientas',
      icon: 'groups',
    },
    {
      href: '/admin/rendicion',
      label: 'Rendición de Cuentas',
      description: 'Bitácora visual Antes y Después',
      icon: 'photo_camera',
    },
    {
      href: '/admin/equipo',
      label: 'Equipo y Roles',
      description: 'Lideresas de SJL y gobernanza',
      icon: 'manage_accounts',
    },
  ];

  const getRoleBadgeStyle = (role?: AdminRole) => {
    switch (role) {
      case 'superadmin':
        return 'bg-[#F3E8E8] text-[#C58B7E] border-[#C58B7E]/40';
      case 'coordinadora':
        return 'bg-[#FFFBEB] text-[#E4981E] border-[#FDE68A]';
      default:
        return 'bg-[#fdf2f8] text-[#d30684] border-[#f472b6]/40';
    }
  };

  return (
    <>
      {/* Backdrop global cuando el menú está abierto */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Barra lateral off-canvas (siempre oculta por defecto hasta que la lideresa la abre) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-80 bg-white border-r border-[#D3B9B9] flex flex-col justify-between transition-transform duration-300 ease-in-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Cabecera del Sidebar */}
        <div className="p-5 border-b border-[#D3B9B9]/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-[#fdf2f8] text-[#d30684] border border-[#d30684]/30 flex items-center justify-center shadow-2xs">
                <GoogleIcon name="volunteer_activism" size={24} filled className="text-[#d30684]" />
              </div>
              <div>
                <span className="font-heading font-black text-base tracking-tight text-[#1a2527] block leading-tight">
                  Hilando Voces
                </span>
                <span className="text-[10px] text-[#E28A85] block font-bold uppercase tracking-wider">
                  Panel de Lideresas SJL
                </span>
              </div>
            </div>

            {/* Botón cerrar */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-[#1a2527] hover:bg-[#FAF8F5] cursor-pointer"
              title="Cerrar menú"
            >
              <GoogleIcon name="close" size={20} />
            </button>
          </div>

          {/* Tarjeta de Lideresa Activa */}
          <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9]/60 space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#d30684] text-white flex items-center justify-center font-heading font-black text-xs shadow-2xs shrink-0">
                {profile?.avatarInitials || 'L'}
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
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${getRoleBadgeStyle(
                  profile?.role
                )}`}
              >
                {profile?.roleTitle || 'Lideresa SJL'}
              </span>
              <span className="text-[10px] text-[#588157] font-bold flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#588157] animate-pulse" />
                <span>Sesión Activa</span>
              </span>
            </div>
          </div>
        </div>

        {/* Navegación por Módulos con Rutas Dedicadas */}
        <nav className="flex-1 overflow-y-auto p-3.5 space-y-1.5">
          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400 px-3 py-1 block">
            Módulos de Gestión Barrial
          </span>

          {navigationItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`w-full flex items-center justify-between p-3 rounded-2xl text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#fdf2f8] text-[#d30684] font-bold border border-[#d30684]/40 shadow-2xs'
                    : 'text-slate-700 hover:bg-[#FAF8F5] hover:text-[#1a2527] font-semibold border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-[#d30684] text-white shadow-2xs' : 'bg-[#FAF8F5] text-slate-500'
                    }`}
                  >
                    <GoogleIcon name={item.icon} size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold block leading-tight truncate">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-400 block leading-tight truncate">
                      {item.description}
                    </span>
                  </div>
                </div>

                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#d30684] text-white shadow-2xs shrink-0">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Pie del Sidebar: Cerrar Sesión */}
        <div className="p-4 border-t border-[#D3B9B9]/60">
          <button
            type="button"
            onClick={signOut}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-600 hover:text-red-700 hover:bg-red-50 border border-[#D3B9B9]/60 transition-colors cursor-pointer"
          >
            <GoogleIcon name="logout" size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
