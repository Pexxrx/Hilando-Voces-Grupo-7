'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { AHPPrioritizerView } from '@/components/admin/AHPPrioritizerView';
import { useAdminData } from '@/components/admin/AdminDataContext';
import { Report } from '@/types';

export default function AHPPrioritizerPage() {
  const router = useRouter();
  const {
    reports,
    setSelectedReport,
    openFaenaModal,
  } = useAdminData();

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
    <AHPPrioritizerView
      reports={reports}
      onSelectReport={handleSelectReport}
      onNavigateToTab={handleNavigateToTab}
      onScheduleFaena={openFaenaModal}
    />
  );
}
