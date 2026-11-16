'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { Shield, Lock, Mail, Eye, EyeOff, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Si ya hay sesión activa, redirigir directo al dashboard
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        router.push('/admin');
      }
    };
    checkSession();
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) {
        setError('Credenciales inválidas o correo no registrado.');
        setLoading(false);
        return;
      }

      if (data.user) {
        // Verificar rol en la base de datos (user_roles)
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('email', data.user.email)
          .maybeSingle();

        if (roleError || !roleData || !['lideresa', 'coordinadora', 'superadmin'].includes(roleData.role)) {
          // Si no tiene rol autorizado, cerrar sesión y denegar acceso
          await supabase.auth.signOut();
          setError('Acceso denegado: Este correo no cuenta con privilegios de lideresa comunitaria.');
          setLoading(false);
          return;
        }

        // Redirigir al panel de administración
        router.push('/admin');
      }
    } catch (err: any) {
      setError('Ocurrió un error inesperado al procesar la autenticación.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadDemoCredentials = () => {
    setEmail('lideresa@hilandovoces.pe');
    setPassword('LideresaSJL2026!');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center p-4 sm:p-6 text-[#1a2527]">
      <div className="w-full max-w-md space-y-8">
        {/* Encabezado Institucional */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-[#d30684] flex items-center justify-center mx-auto shadow-xl shadow-[#d30684]/20 border border-[#bd0474]">
            <Shield className="w-8 h-8 text-white" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#d30684] block">
              Acceso Restringido · Liderazgo Comunitario
            </span>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1a2527] tracking-tight mt-1">
              Hilando Voces Admin
            </h1>
            <p className="text-xs text-slate-600 mt-1 font-medium">
              Panel Territorial para Lideresas Juveniles de San Juan de Lurigancho
            </p>
          </div>
        </div>

        {/* Tarjeta de Inicio de Sesión */}
        <div className="bg-white p-8 rounded-3xl border border-[#D3B9B9]/80 shadow-xl shadow-[#d30684]/5 space-y-6">
          <div className="flex items-center space-x-2 text-xs text-[#d30684] bg-[#fdf2f8] border border-[#d30684]/20 p-3 rounded-2xl font-medium">
            <Lock className="w-4 h-4 shrink-0 text-[#d30684]" />
            <span>Autenticación Cifrada con Row Level Security (RLS)</span>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-[#fdf2f8] border border-[#E28A85] text-[#8c472f] text-xs flex items-start space-x-2.5">
              <AlertCircle className="w-4 h-4 text-[#d30684] shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1a2527] mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  placeholder="lideresa@hilandovoces.pe"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-[#D3B9B9] text-sm text-[#1a2527] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d30684] focus:border-[#d30684] transition-all font-medium shadow-sm"
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1a2527] mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-white border border-[#D3B9B9] text-sm text-[#1a2527] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d30684] focus:border-[#d30684] transition-all font-medium shadow-sm"
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-slate-400 hover:text-[#d30684] transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-slate-500" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#d30684] hover:bg-[#bd0474] text-white font-bold text-sm shadow-md shadow-[#d30684]/20 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Lock className="w-4 h-4 text-white" />
              <span>{loading ? 'Verificando Credenciales...' : 'Iniciar Sesión'}</span>
            </button>
          </form>

          {/* Botón de Acceso Rápido para Pruebas / Demo */}
          <div className="pt-2 border-t border-[#D3B9B9]/50">
            <button
              type="button"
              onClick={handleLoadDemoCredentials}
              className="w-full py-2.5 px-4 rounded-xl bg-[#FAF8F5] hover:bg-[#fdf2f8] border border-[#D3B9B9] text-xs font-semibold text-[#d30684] flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#d30684]" />
              <span>Cargar Credenciales de Lideresa (Demo)</span>
            </button>
            <p className="text-[11px] text-center text-slate-500 mt-2">
              Autofill: <code className="text-[#d30684] font-mono">lideresa@hilandovoces.pe</code>
            </p>
          </div>
        </div>

        {/* Enlace discreto para regresar al portal vecinal */}
        <div className="text-center">
          <a
            href="/"
            className="text-xs text-slate-600 hover:text-[#d30684] transition-colors font-medium underline underline-offset-4"
          >
            ← Volver al Portal Vecinal de San Juan de Lurigancho
          </a>
        </div>
      </div>
    </div>
  );
}
