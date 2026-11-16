'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Report, ReportStatus } from '@/types';
import { useRouter } from 'next/navigation';
import { useAdminSession } from './AdminSessionContext';

interface AdminDataContextType {
  reports: Report[];
  loading: boolean;
  refreshing: boolean;
  selectedReport: Report | null;
  setSelectedReport: (report: Report | null) => void;
  refreshReports: () => Promise<void>;
  handleUpdateStatus: (reportId: string, status: ReportStatus) => Promise<void>;
  openFaenaModal: (report: Report) => void;
  openResolveModal: (report: Report) => void;
  pendingCount: number;
  navigateToTab: (routeSlug: string) => void;
}

const AdminDataContext = createContext<AdminDataContextType | undefined>(undefined);

export function AdminDataProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { profile, loading: sessionLoading } = useAdminSession();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  // Estados de modales compartidos
  const [activeFaenaReport, setActiveFaenaReport] = useState<Report | null>(null);
  const [activeResolveReport, setActiveResolveReport] = useState<Report | null>(null);

  const fetchReports = useCallback(async () => {
    if (!profile) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/admin/reports', {
        headers: {
          'x-admin-email': profile.email,
          'x-admin-role': profile.role,
        },
      });
      const data = await res.json();
      if (data.reports) {
        setReports(data.reports);
        if (data.reports.length > 0 && !selectedReport) {
          setSelectedReport(data.reports[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching admin reports:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [profile, selectedReport]);

  useEffect(() => {
    if (profile) {
      fetchReports();
    } else if (!sessionLoading) {
      setReports([]);
      setLoading(false);
    }
  }, [profile, sessionLoading, fetchReports]);

  const refreshReports = async () => {
    if (!profile) return;
    setRefreshing(true);
    await fetchReports();
  };

  const handleUpdateStatus = async (reportId: string, status: ReportStatus) => {
    if (!profile) return;

    setReports((prev) =>
      prev.map((r) =>
        r.id === reportId
          ? {
              ...r,
              status,
              resolved_at: status === 'resuelto' ? new Date().toISOString() : r.resolved_at,
            }
          : r
      )
    );

    if (selectedReport?.id === reportId) {
      setSelectedReport((prev) =>
        prev
          ? {
              ...prev,
              status,
              resolved_at: status === 'resuelto' ? new Date().toISOString() : prev.resolved_at,
            }
          : null
      );
    }

    try {
      await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': profile.email,
          'x-admin-role': profile.role,
        },
        body: JSON.stringify({ status }),
      });
    } catch (e) {
      console.error('Error actualizando estado:', e);
    }
  };

  const openFaenaModal = (report: Report) => {
    setActiveFaenaReport(report);
  };

  const openResolveModal = (report: Report) => {
    setActiveResolveReport(report);
  };

  const navigateToTab = (routeSlug: string) => {
    const routeMap: Record<string, string> = {
      resumen: '/admin/centro-mando',
      'centro-mando': '/admin/centro-mando',
      incidencias: '/admin/bandeja',
      bandeja: '/admin/bandeja',
      faenas: '/admin/calendario',
      calendario: '/admin/calendario',
      ahp: '/admin/ahp',
      voluntarios: '/admin/voluntarios',
      rendicion: '/admin/rendicion',
      equipo: '/admin/equipo',
    };
    const target = routeMap[routeSlug] || `/admin/${routeSlug}`;
    router.push(target);
  };

  const pendingCount = reports.filter(
    (r) => r.status === 'recibido' || r.status === 'en_evaluacion'
  ).length;

  return (
    <AdminDataContext.Provider
      value={{
        reports,
        loading,
        refreshing,
        selectedReport,
        setSelectedReport,
        refreshReports,
        handleUpdateStatus,
        openFaenaModal,
        openResolveModal,
        pendingCount,
        navigateToTab,
      }}
    >
      {children}
    </AdminDataContext.Provider>
  );
}

export function useAdminData() {
  const context = useContext(AdminDataContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
}
