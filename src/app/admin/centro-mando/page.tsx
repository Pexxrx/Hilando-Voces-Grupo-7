'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardOverview } from '@/components/admin/DashboardOverview';
import { useAdminData } from '@/components/admin/AdminDataContext';
import { Report } from '@/types';

export default function CentroMandoPage() {
  const router = useRouter();
  const { reports, setSelectedReport } = useAdminData();

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report);
    router.push('/admin/bandeja');
  };

  const handleNavigateToTab = (tabSlug: string) => {
    const routeMap: Record<string, string> = {
      incidencias: '/admin/bandeja',
      faenas: '/admin/calendario',
      ahp: '/admin/ahp',
      voluntarios: '/admin/voluntarios',
      rendicion: '/admin/rendicion',
      equipo: '/admin/equipo',
    };
    router.push(routeMap[tabSlug] || `/admin/${tabSlug}`);
  };

  return (
    <DashboardOverview
      reports={reports}
      onSelectReport={handleSelectReport}
      onNavigateToTab={handleNavigateToTab}
    />
  );
}
