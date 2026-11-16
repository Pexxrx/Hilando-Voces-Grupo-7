'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useAdminSession } from '@/components/admin/AdminSessionContext';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { IncidentsManager } from '@/components/admin/IncidentsManager';
import { FaenasPlanner } from '@/components/admin/FaenasPlanner';
import { VolunteersDirectory } from '@/components/admin/VolunteersDirectory';
import { AccountabilityGallery } from '@/components/admin/AccountabilityGallery';
import { TeamRolesManager } from '@/components/admin/TeamRolesManager';
import { FaenaSheetModal } from '@/components/FaenaSheetModal';
import { GoogleIcon } from '@/components/GoogleIcon';
import { Report, ReportStatus } from '@/types';

export default function AdminDashboardPage() {
  const { activeTab, setActiveTab } = useAdminSession();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Control de Sidebar móvil
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modales
  const [activeFaenaReport, setActiveFaenaReport] = useState<Report | null>(null);
  const [activeResolveReport, setActiveResolveReport] = useState<Report | null>(null);
  const [resolvePhoto, setResolvePhoto] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchReports = useCallback(async () => {
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      if (data.reports) {
        setReports(data.reports);
        if (data.reports.length > 0 && !selectedReport) {
          setSelectedReport(data.reports[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedReport]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
  };

  // Cambio de estado directo
  const handleUpdateStatus = async (reportId: string, status: ReportStatus) => {
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        await fetchReports();
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Confirmar Faena desde Modal de Ficha Técnica
  const handleConfirmScheduleFaena = async (reportId: string) => {
    await handleUpdateStatus(reportId, 'faena_programada');
    setActiveFaenaReport(null);
  };

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

    try {
      const res = await fetch(`/api/admin/reports/${activeResolveReport.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'resuelto',
          photo_after_url: resolvePhoto,
        }),
      });

      if (res.ok) {
        setActiveResolveReport(null);
        setResolvePhoto(null);
        await fetchReports();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const pendingCount = reports.filter(
    (r) => r.status === 'recibido' || r.status === 'en_evaluacion'
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center text-[#d30684] p-4">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-[#d30684] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm font-semibold text-[#1a2527]">
            Cargando centro de mando territorial de San Juan de Lurigancho...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col lg:flex-row text-[#1a2527]">
      {/* 1. Barra Lateral de Navegación Modular (Sidebar) */}
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
          onRefresh={handleRefresh}
          refreshing={refreshing}
          totalAlerts={reports.filter((r) => r.priority_level === 'alta').length}
        />

        {/* Contenido Modular según Sub-menú Seleccionado */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'resumen' && (
            <DashboardOverview
              reports={reports}
              onSelectReport={(report) => {
                setSelectedReport(report);
                setActiveTab('incidencias');
              }}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

          {activeTab === 'incidencias' && (
            <IncidentsManager
              reports={reports}
              selectedReport={selectedReport}
              onSelectReport={(report) => setSelectedReport(report)}
              onScheduleFaena={(report) => setActiveFaenaReport(report)}
              onOpenResolveModal={(report) => {
                setActiveResolveReport(report);
                setResolvePhoto(null);
              }}
              onUpdateStatus={handleUpdateStatus}
            />
          )}

          {activeTab === 'faenas' && (
            <FaenasPlanner
              reports={reports}
              onOpenFaenaModal={(report) => setActiveFaenaReport(report)}
              onOpenResolveModal={(report) => {
                setActiveResolveReport(report);
                setResolvePhoto(null);
              }}
              onSelectReport={(report) => {
                setSelectedReport(report);
                setActiveTab('incidencias');
              }}
            />
          )}

          {activeTab === 'voluntarios' && (
            <VolunteersDirectory reports={reports} />
          )}

          {activeTab === 'rendicion' && (
            <AccountabilityGallery
              reports={reports}
              onOpenResolveModal={(report) => {
                setActiveResolveReport(report);
                setResolvePhoto(null);
              }}
            />
          )}

          {activeTab === 'equipo' && <TeamRolesManager />}
        </main>
      </div>

      {/* MODAL 1: Ficha Técnica de Faena Comunal (Imprimible en PDF) */}
      {activeFaenaReport && (
        <FaenaSheetModal
          report={activeFaenaReport}
          onClose={() => setActiveFaenaReport(null)}
          onScheduleFaena={handleConfirmScheduleFaena}
        />
      )}

      {/* MODAL 2: Certificación y Resolución con Foto del "Después" */}
      {activeResolveReport && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border-2 border-[#D3B9B9] space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[#D3B9B9] pb-3">
              <div className="flex items-center space-x-2">
                <GoogleIcon name="verified" filled size={22} className="text-emerald-600" />
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
                  className="w-2/3 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center space-x-1.5 transition-all cursor-pointer disabled:opacity-50"
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
