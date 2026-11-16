'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export type AdminRole = 'superadmin' | 'lideresa' | 'coordinadora';

export interface AdminProfile {
  email: string;
  name: string;
  role: AdminRole;
  roleTitle: string;
  sector: string;
  avatarInitials: string;
}

export const OFFICIAL_ADMIN_PROFILES: Record<AdminRole, AdminProfile> = {
  lideresa: {
    email: 'lideresa.canto@hilandovoces.pe',
    name: 'Rosa Huamán Quispe',
    role: 'lideresa',
    roleTitle: 'Lideresa Territorial SJL',
    sector: 'Comuna 12 · Canto Grande',
    avatarInitials: 'RH',
  },
  coordinadora: {
    email: 'coordinadora.bayovar@hilandovoces.pe',
    name: 'Valeria Mendoza Paucar',
    role: 'coordinadora',
    roleTitle: 'Coordinadora de Faena Barrial',
    sector: 'Comuna 8 · Bayóvar',
    avatarInitials: 'VM',
  },
  superadmin: {
    email: 'supervisora.distrital@hilandovoces.pe',
    name: 'Ing. Carmen Ramos Alarcón',
    role: 'superadmin',
    roleTitle: 'Supervisora Comunal Distrital',
    sector: 'Sede Central · San Juan de Lurigancho',
    avatarInitials: 'CR',
  },
};

interface AdminContextType {
  profile: AdminProfile | null;
  loading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  switchRole: (role: AdminRole) => void;
  signOut: () => Promise<void>;
  checkSession: () => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('resumen');

  const checkSession = () => {
    const cached = localStorage.getItem('hv_admin_profile');
    if (!cached) {
      if (profile !== null) setProfile(null);
      return false;
    }
    try {
      const parsed = JSON.parse(cached) as AdminProfile;
      if (!profile || profile.email !== parsed.email) {
        setProfile(parsed);
      }
      return true;
    } catch (e) {
      localStorage.removeItem('hv_admin_profile');
      setProfile(null);
      return false;
    }
  };

  useEffect(() => {
    const initSession = async () => {
      // 1. Verificar si hay sesión activa en localStorage
      const cached = localStorage.getItem('hv_admin_profile');
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as AdminProfile;
          setProfile(parsed);
          setLoading(false);
          return;
        } catch (e) {
          localStorage.removeItem('hv_admin_profile');
        }
      }

      // 2. Verificar sesión de Supabase Auth
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          const email = sessionData.session.user.email || '';
          
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('email', email)
            .maybeSingle();

          const role = (roleData?.role as AdminRole) || 'lideresa';
          const userProfile = OFFICIAL_ADMIN_PROFILES[role] || {
            email,
            name: email.split('@')[0],
            role,
            roleTitle: 'Lideresa Barrial',
            sector: 'San Juan de Lurigancho',
            avatarInitials: email.slice(0, 2).toUpperCase(),
          };

          setProfile(userProfile);
          localStorage.setItem('hv_admin_profile', JSON.stringify(userProfile));
          setLoading(false);
          return;
        }
      } catch (err) {}

      // Si no hay sesión previa, mantener perfil como null (acceso NO autenticado)
      setProfile(null);
      setLoading(false);
    };

    initSession();

    // Detección cuando el usuario vuelve con el botón "Atrás" del navegador
    const handlePageShow = (event: PageTransitionEvent) => {
      const hasSession = checkSession();
      if (!hasSession && window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        router.replace('/admin/login');
      }
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('storage', () => checkSession());

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [router]);

  const switchRole = (newRole: AdminRole) => {
    const newProfile = OFFICIAL_ADMIN_PROFILES[newRole];
    setProfile(newProfile);
    localStorage.setItem('hv_admin_profile', JSON.stringify(newProfile));
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    localStorage.removeItem('hv_admin_profile');
    sessionStorage.clear();
    setProfile(null);
    router.replace('/admin/login');
  };

  return (
    <AdminContext.Provider
      value={{
        profile,
        loading,
        activeTab,
        setActiveTab,
        switchRole,
        signOut,
        checkSession,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdminSession() {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminSession must be used within an AdminProvider');
  }
  return context;
}
