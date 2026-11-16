'use client';

import React from 'react';
import { AccountabilityGallery } from '@/components/admin/AccountabilityGallery';
import { useAdminData } from '@/components/admin/AdminDataContext';

export default function RendicionCuentasPage() {
  const { reports, openResolveModal } = useAdminData();

  return (
    <AccountabilityGallery
      reports={reports}
      onOpenResolveModal={openResolveModal}
    />
  );
}
