'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { FaenasPlanner } from '@/components/admin/FaenasPlanner';
import { useAdminData } from '@/components/admin/AdminDataContext';
import { Report } from '@/types';

export default function CalendarioFaenasPage() {
  const router = useRouter();
  const {
    reports,
    openFaenaModal,
    openResolveModal,
    setSelectedReport,
  } = useAdminData();

  const handleSelectReport = (report: Report) => {
    setSelectedReport(report);
    router.push('/admin/bandeja');
  };

  return (
    <FaenasPlanner
      reports={reports}
      onOpenFaenaModal={openFaenaModal}
      onOpenResolveModal={openResolveModal}
      onSelectReport={handleSelectReport}
    />
  );
}
