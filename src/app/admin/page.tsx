'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/centro-mando');
  }, [router]);

  return (
    <div className="flex items-center justify-center p-12 text-[#d30684]">
      <div className="w-8 h-8 border-3 border-[#d30684] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
