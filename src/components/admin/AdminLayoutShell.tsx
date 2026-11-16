'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { WarmichaChatbot } from './WarmichaChatbot';
import { useAdminData } from './AdminDataContext';
import { useAdminSession } from './AdminSessionContext';
import { FaenaSheetModal } from '@/components/FaenaSheetModal';
import { GoogleIcon } from '@/components/GoogleIcon';
import { Report } from '@/types';

export function AdminLayoutShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, loading: sessionLoading, checkSession } = useAdminSession();

  const {
    reports,
    loading: dataLoading,
    refreshing,
    refreshReports,
    pendingCount,
    handleUpdateStatus,
  } = useAdminData();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeFaenaReport, setActiveFaenaReport] = useState<Report | null>(null);
  const [activeResolveReport, setActiveResolveReport] = useState<Report | null>(null);
  const [resolvePhoto, setResolvePhoto] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // ROUTE GUARD DE CIBERSEGURIDAD: Si no hay perfil autenticado, redirigir inmediatamente a /admin/login
  useEffect(() => {
    if (!sessionLoading && !profile) {
      router.replace('/admin/login');
    }
  }, [sessionLoading, profile, router]);

  // Manejo de eventos de navegación por historial / retroceso del navegador (bfcache)
  useEffect(() => {
    const handlePopState = () => {
      const active = checkSession();
      if (!active) {
        router.replace('/admin/login');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [checkSession, router]);

  // Subir foto "Después" para resolver caso
  const handlePhotoUploadResolve = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setResolvePhoto(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmResolveCase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeResolveReport) return;
    setUpdating(true);

    const reportId = activeResolveReport.id;
    const finalPhoto =
      resolvePhoto ||
      'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=80';

    await handleUpdateStatus(reportId, 'resuelto');

    try {
      await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': profile?.email || 'lideresa.canto@hilandovoces.pe',
          'x-admin-role': profile?.role || 'lideresa',
        },
        body: JSON.stringify({
          status: 'resuelto',
          photo_after_url: finalPhoto,
        }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setActiveResolveReport(null);
      setResolvePhoto(null);
      setUpdating(false);
    }
  };

  // Bloqueo visual durante la verificación de credenciales
  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-[#d30684] p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#d30684] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-700">
            Verificando credenciales de acceso institucional...
          </p>
        </div>
      </div>
    );
  }

  // Si no hay perfil, mostrar mensaje de bloqueo y esperar redirección
  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-[#d30684] p-4">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#d30684] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-black text-[#d30684]">
            Acceso no autorizado. Redirigiendo al inicio de sesión institucional...
          </p>
        </div>
      </div>
    );
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-[#d30684] p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#d30684] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#1a2527]">
            Cargando plataforma territorial de San Juan de Lurigancho...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col text-[#1a2527] relative">
      {/* 1. Barra Lateral de Navegación Modular (Off-canvas) */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        pendingCount={pendingCount}
      />

      {/* 2. Área de Trabajo Principal */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Cabecera Dinámica del Módulo */}
        <AdminHeader
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onRefresh={refreshReports}
          refreshing={refreshing}
          totalAlerts={reports.filter((r) => r.priority_level === 'alta').length}
        />

        {/* Contenido de la Ruta Hija */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* 3. Mascota Flotante Copiloto Warmicha */}
      <WarmichaChatbot />

      {/* MODAL 1: Ficha Técnica de Faena Comunal (Imprimible en PDF) */}
      {activeFaenaReport && (
        <FaenaSheetModal
          report={activeFaenaReport}
          onClose={() => setActiveFaenaReport(null)}
          onScheduleFaena={async (id) => {
            await handleUpdateStatus(id, 'faena_programada');
            setActiveFaenaReport(null);
          }}
        />
      )}

      {/* MODAL 2: Certificación y Resolución con Foto del "Después" */}
      {activeResolveReport && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border-2 border-[#D3B9B9] space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[#D3B9B9] pb-3">
              <div className="flex items-center space-x-2">
                <GoogleIcon name="verified" filled size={22} className="text-[#588157]" />
                <h3 className="font-heading font-bold text-lg text-[#1a2527]">
                  Certificar y Concluir Caso
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveResolveReport(null)}
                className="text-slate-400 hover:text-[#1a2527] p-1 cursor-pointer"
              >
                <GoogleIcon name="close" size={22} />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#fdf2f8] border border-[#d30684]/30 text-xs text-slate-700 space-y-1">
              <span className="font-bold text-[#d30684] block">
                Expediente: {activeResolveReport.ticket_code}
              </span>
              <p className="line-clamp-2 italic">"{activeResolveReport.description}"</p>
            </div>

            <form onSubmit={handleConfirmResolveCase} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1a2527] mb-1.5">
                  Fotografía de Evidencia ("Después"):
                </label>
                <p className="text-xs text-slate-500 mb-2">
                  Sube la foto del espacio limpio, reparado o iluminado para la rendición de cuentas pública.
                </p>

                {resolvePhoto ? (
                  <div className="relative rounded-2xl overflow-hidden border-2 border-[#D3B9B9] aspect-video">
                    <img src={resolvePhoto} alt="Después" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setResolvePhoto(null)}
                      className="absolute top-2 right-2 p-1.5 rounded-xl bg-white/95 text-[#d30684] shadow-md hover:bg-[#F3E8E8] cursor-pointer"
                      title="Eliminar foto"
                    >
                      <GoogleIcon name="delete" size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-36 rounded-2xl bg-[#FAF8F5] hover:bg-[#fdf2f8] border-2 border-dashed border-[#D3B9B9] hover:border-[#d30684] flex flex-col items-center justify-center space-y-2 cursor-pointer transition-all">
                    <GoogleIcon name="add_a_photo" size={28} className="text-[#d30684]" />
                    <span className="text-xs font-bold text-[#d30684]">
                      Subir o tomar foto de la obra terminada
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handlePhotoUploadResolve}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              <div className="flex items-center space-x-2 pt-2 border-t border-[#D3B9B9]">
                <button
                  type="button"
                  onClick={() => setActiveResolveReport(null)}
                  className="w-1/3 py-2.5 px-3 rounded-xl border border-[#D3B9B9] text-xs font-bold text-slate-700 hover:bg-[#FAF8F5] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-2/3 py-2.5 px-4 rounded-xl bg-[#d30684] hover:bg-[#bd0474] text-white text-xs font-bold shadow-md shadow-[#d30684]/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  <GoogleIcon name="check_circle" filled size={16} className="text-white" />
                  <span>{updating ? 'Guardando...' : 'Marcar como Resuelto'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
