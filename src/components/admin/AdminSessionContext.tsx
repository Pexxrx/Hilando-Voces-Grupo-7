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

export const DEMO_PROFILES: Record<AdminRole, AdminProfile> = {
  lideresa: {
    email: 'lideresa@hilandovoces.pe',
    name: 'Rosa Huamán Quispe',
    role: 'lideresa',
    roleTitle: 'Lideresa Territorial SJL',
    sector: 'Comuna 12 · Canto Grande',
    avatarInitials: 'RH',
  },
  coordinadora: {
    email: 'coordinadora@hilandovoces.pe',
    name: 'Valeria Mendoza Paucar',
    role: 'coordinadora',
    roleTitle: 'Coordinadora de Faena Barrial',
    sector: 'Comuna 8 · Bayóvar',
    avatarInitials: 'VM',
  },
  superadmin: {
    email: 'supervisora@hilandovoces.pe',
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
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('resumen');

  useEffect(() => {
    const initSession = async () => {
      // 1. Verificar si hay sesión en localStorage (modo demo/offline prioritario)
      const cached = localStorage.getItem('hv_admin_profile');
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as AdminProfile;
          setProfile(parsed);
          setLoading(false);
          return;
        } catch (e) {}
      }

      // 2. Verificar sesión de Supabase Auth
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          const email = sessionData.session.user.email || '';
          
          // Consultar rol en la base de datos
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('email', email)
            .maybeSingle();

          const role = (roleData?.role as AdminRole) || 'lideresa';
          const defaultProfile = DEMO_PROFILES[role] || {
            email,
            name: email.split('@')[0],
            role,
            roleTitle: 'Lideresa Barrial',
            sector: 'San Juan de Lurigancho',
            avatarInitials: email.slice(0, 2).toUpperCase(),
          };

          setProfile(defaultProfile);
          localStorage.setItem('hv_admin_profile', JSON.stringify(defaultProfile));
          setLoading(false);
          return;
        }
      } catch (err) {}

      // Si no hay sesión, asignar perfil de lideresa por defecto en modo desarrollo para visualización
      const fallback = DEMO_PROFILES.lideresa;
      setProfile(fallback);
      localStorage.setItem('hv_admin_profile', JSON.stringify(fallback));
      setLoading(false);
    };

    initSession();
  }, []);

  const switchRole = (newRole: AdminRole) => {
    const newProfile = DEMO_PROFILES[newRole];
    setProfile(newProfile);
    localStorage.setItem('hv_admin_profile', JSON.stringify(newProfile));
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {}
    localStorage.removeItem('hv_admin_profile');
    setProfile(null);
    router.push('/admin/login');
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
