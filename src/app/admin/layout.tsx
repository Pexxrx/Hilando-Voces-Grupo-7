'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Shield, LogOut, Lock, AlertTriangle } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    // Si estamos en la página de login, no verificar ni bloquear
    if (pathname === '/admin/login') {
      setLoading(false);
      return;
    }

    const verifySession = async () => {
      setLoading(true);
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.push('/admin/login');
        return;
      }

      const email = sessionData.session.user.email;
      setUserEmail(email || null);

      // Verificar rol en base de datos
      const { data: roleData, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('email', email)
        .maybeSingle();

      if (error || !roleData || !['lideresa', 'coordinadora', 'superadmin'].includes(roleData.role)) {
        setUnauthorized(true);
      } else {
        setUserRole(roleData.role);
        setUnauthorized(false);
      }

      setLoading(false);
    };

    verifySession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/admin/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [pathname, router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  // En la página de login, renderizar sin la cabecera administrativa
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Pantalla de carga mientras se valida la sesión
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-[#d30684] p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#d30684] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#1a2527]">
            Verificando credenciales de lideresa y permisos de seguridad...
          </p>
        </div>
      </div>
    );
  }

  // Pantalla de No Autorizado (403) si el usuario se autenticó pero no tiene rol de lideresa
  if (unauthorized) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-4 text-[#1a2527]">
        <div className="max-w-md w-full bg-white border border-[#D3B9B9] rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-16 h-16 bg-[#fdf2f8] border border-[#E28A85] rounded-2xl flex items-center justify-center mx-auto text-[#d30684]">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="font-heading text-xl font-bold text-[#1a2527]">Acceso Denegado (403)</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            La cuenta <strong className="text-[#d30684]">{userEmail}</strong> no está autorizada en el padrón de lideresas comunitarias de San Juan de Lurigancho.
          </p>
          <button
            onClick={handleSignOut}
            className="w-full py-2.5 px-4 rounded-xl bg-[#d30684] hover:bg-[#bd0474] text-xs font-bold text-white transition-all cursor-pointer shadow-sm"
          >
            Cerrar Sesión e Intentar con otra cuenta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col text-[#1a2527]">
      {/* Barra de Navegación Exclusiva de Administración */}
      <header className="sticky top-0 z-50 bg-[#d30684] text-white border-b border-[#bd0474] shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Identidad Administrativa */}
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-white text-[#d30684] flex items-center justify-center font-bold shadow-sm">
                <Shield className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-heading font-extrabold text-sm sm:text-base tracking-tight text-white">
                    Panel Lideresas SJL
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white text-[#d30684]">
                    {userRole || 'Lideresa'}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[11px] text-[#fce7f3]">
                  <span className="flex items-center space-x-1">
                    <Lock className="w-3 h-3 text-[#fce7f3]" />
                    <span className="text-[#fce7f3] font-medium">RLS Activo</span>
                  </span>
                  <span>•</span>
                  <span>San Juan de Lurigancho</span>
                </div>
              </div>
            </div>

            {/* Sesión y Cerrar Sesión */}
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-white">{userEmail}</span>
                <span className="text-[10px] text-[#fce7f3]">Sesión Segura Verificada</span>
              </div>

              <button
                onClick={handleSignOut}
                title="Cerrar sesión"
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#bd0474] hover:bg-[#a60366] border border-white/20 text-xs font-semibold text-white transition-all cursor-pointer shadow-sm"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido del Panel */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
