'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AdminProvider } from '@/components/admin/AdminSessionContext';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // En la página de login, renderizar limpio sin layout administrativo
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <AdminProvider>
      {children}
    </AdminProvider>
  );
}
