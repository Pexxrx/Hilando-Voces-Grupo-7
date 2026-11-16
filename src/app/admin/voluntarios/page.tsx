'use client';

import React from 'react';
import { VolunteersDirectory } from '@/components/admin/VolunteersDirectory';
import { useAdminData } from '@/components/admin/AdminDataContext';

export default function VoluntariosPage() {
  const { reports } = useAdminData();

  return <VolunteersDirectory reports={reports} />;
}
