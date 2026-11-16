'use client';

import React from 'react';
import { IncidentsManager } from '@/components/admin/IncidentsManager';
import { useAdminData } from '@/components/admin/AdminDataContext';

export default function BandejaIncidenciasPage() {
  const {
    reports,
    selectedReport,
    setSelectedReport,
    openFaenaModal,
    openResolveModal,
    handleUpdateStatus,
  } = useAdminData();

  return (
    <IncidentsManager
      reports={reports}
      selectedReport={selectedReport}
      onSelectReport={setSelectedReport}
      onScheduleFaena={openFaenaModal}
      onOpenResolveModal={openResolveModal}
      onUpdateStatus={handleUpdateStatus}
    />
  );
}
