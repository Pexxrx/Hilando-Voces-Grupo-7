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
  login: (profile: AdminProfile) => void;
  signOut: (reason?: string) => Promise<void>;
  checkSession: () => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('resumen');

  // Comprueba la sesión sin provocar re-renders infinitos
  const checkSession = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const cached = localStorage.getItem('hv_admin_profile');
    if (!cached) {
      setProfile((prev) => (prev !== null ? null : prev));
      return false;
    }
    try {
      const parsed = JSON.parse(cached) as AdminProfile;
      setProfile((prev) => (prev?.email === parsed.email ? prev : parsed));
      return true;
    } catch (e) {
      localStorage.removeItem('hv_admin_profile');
      sessionStorage.clear();
      setProfile(null);
      return false;
    }
  }, []);

  const login = useCallback((newProfile: AdminProfile) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('hv_admin_profile', JSON.stringify(newProfile));
      sessionStorage.setItem('hv_last_activity', Date.now().toString());
    }
    setProfile(newProfile);
    setLoading(false);
  }, []);

  const signOut = useCallback(
    async (reason?: string) => {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hv_admin_profile');
        sessionStorage.clear();
      }
      setProfile(null);
      const target = reason === 'inactivity' ? '/admin/login?reason=inactivity' : '/admin/login';
      router.replace(target);
    },
    [router]
  );

  useEffect(() => {
    const init = async () => {
      // 1. Verificar si hay perfil en localStorage
      if (typeof window !== 'undefined') {
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

        // 2. Si no hay en localStorage, verificar Supabase Auth
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session?.user?.email) {
            const email = sessionData.session.user.email;
            let role: AdminRole = 'lideresa';
            if (email.includes('coordinadora')) role = 'coordinadora';
            else if (email.includes('supervisora') || email.includes('superadmin')) role = 'superadmin';

            const userProfile = OFFICIAL_ADMIN_PROFILES[role];
            setProfile(userProfile);
            localStorage.setItem('hv_admin_profile', JSON.stringify(userProfile));
            setLoading(false);
            return;
          }
        } catch (err) {}
      }

      setProfile(null);
      setLoading(false);
    };

    init();

    // Detección cuando se restaura desde la caché de navegación Atrás / Adelante (bfcache)
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        // Restaurado desde bfcache (botón Atrás/Adelante del navegador fuera del sitio)
        signOut();
        return;
      }
      checkSession();
    };

    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('storage', () => checkSession());

    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [checkSession, signOut]);

  // Monitor de Inactividad de 5 Minutos (Cierre automático si no hay movimiento)
  useEffect(() => {
    if (!profile) return;

    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('hv_last_activity', Date.now().toString());
      }
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        signOut('inactivity');
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'];
    let lastUpdate = 0;
    const onActivity = () => {
      const now = Date.now();
      if (now - lastUpdate > 2000) { // Throttle a 2 segundos
        lastUpdate = now;
        resetTimer();
      }
    };

    events.forEach((evt) => {
      window.addEventListener(evt, onActivity, { passive: true });
    });

    // Iniciar temporizador
    resetTimer();

    // Verificación pasiva cada 15s
    const intervalId = setInterval(() => {
      if (typeof window !== 'undefined') {
        const last = Number(sessionStorage.getItem('hv_last_activity') || Date.now());
        if (Date.now() - last >= INACTIVITY_TIMEOUT_MS) {
          signOut('inactivity');
        }
      }
    }, 15000);

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
    if (typeof window !== 'undefined') {
      localStorage.setItem('hv_admin_profile', JSON.stringify(newProfile));
    }
  };

  return (
    <AdminContext.Provider
      value={{
        profile,
        loading,
        activeTab,
        setActiveTab,
        switchRole,
        login,
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
