'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

const INACTIVITY_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutos de inactividad

interface AdminContextType {
  profile: AdminProfile | null;
  loading: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  switchRole: (role: AdminRole) => void;
  signOut: (reason?: string) => Promise<void>;
  checkSession: () => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('resumen');

  const checkSession = useCallback(() => {
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
      sessionStorage.clear();
      setProfile(null);
      return false;
    }
  }, [profile]);

  const signOut = useCallback(
    async (reason?: string) => {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
      localStorage.removeItem('hv_admin_profile');
      sessionStorage.clear();
      setProfile(null);
      const target = reason === 'inactivity' ? '/admin/login?reason=inactivity' : '/admin/login';
      router.replace(target);
    },
    [router]
  );

  useEffect(() => {
    const initSession = async () => {
      // 1. Si estamos en la pantalla de login, forzar cierre de credenciales
      if (typeof window !== 'undefined' && window.location.pathname === '/admin/login') {
        localStorage.removeItem('hv_admin_profile');
        sessionStorage.clear();
        setProfile(null);
        setLoading(false);
        return;
      }

      // 2. Verificar si hay sesión activa en localStorage
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

      // 3. Verificar sesión de Supabase Auth
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

    // Detección estricta de navegación Atrás / Adelante (Back / Forward cache & History traversal)
    const handlePageShow = (event: PageTransitionEvent) => {
      let isBackForward = event.persisted;
      if (!isBackForward && typeof performance !== 'undefined') {
        const navEntries = performance.getEntriesByType('navigation');
        if (navEntries.length > 0 && (navEntries[0] as PerformanceNavigationTiming).type === 'back_forward') {
          isBackForward = true;
        }
      }

      // Si el usuario navegó usando los botones Atrás / Adelante del navegador
      if (isBackForward) {
        localStorage.removeItem('hv_admin_profile');
        sessionStorage.clear();
        setProfile(null);
        if (window.location.pathname.startsWith('/admin')) {
          router.replace('/admin/login');
        }
        return;
      }

      const hasSession = checkSession();
      if (!hasSession && window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login') {
        router.replace('/admin/login');
      }
    };

    // Evento popstate: se activa inmediatamente cuando el usuario presiona "Atrás" o "Adelante"
    const handlePopState = () => {
      localStorage.removeItem('hv_admin_profile');
      sessionStorage.clear();
      setProfile(null);
      router.replace('/admin/login');
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('storage', () => checkSession());

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router, checkSession]);

  // Monitor de Inactividad de 5 Minutos (Cierre automático si no hay movimiento)
  useEffect(() => {
    if (!profile) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      sessionStorage.setItem('hv_last_activity', Date.now().toString());
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        signOut('inactivity');
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    let lastUpdate = 0;
    const onActivity = () => {
      const now = Date.now();
      if (now - lastUpdate > 1000) { // Throttle a 1 segundo para no recargar CPU
        lastUpdate = now;
        resetTimer();
      }
    };

    events.forEach((evt) => {
      window.addEventListener(evt, onActivity, { passive: true });
    });

    // Iniciar temporizador
    resetTimer();

    // Verificación de respaldo periódica cada 10s (útil si la pestaña estuvo minimizada)
    const intervalId = setInterval(() => {
      const last = Number(sessionStorage.getItem('hv_last_activity') || Date.now());
      if (Date.now() - last >= INACTIVITY_TIMEOUT_MS) {
        signOut('inactivity');
      }
    }, 10000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      events.forEach((evt) => {
        window.removeEventListener(evt, onActivity);
      });
    };
  }, [profile, signOut]);

  const switchRole = (newRole: AdminRole) => {
    const newProfile = OFFICIAL_ADMIN_PROFILES[newRole];
    setProfile(newProfile);
    localStorage.setItem('hv_admin_profile', JSON.stringify(newProfile));
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
