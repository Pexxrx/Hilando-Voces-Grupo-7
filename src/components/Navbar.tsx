'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GoogleIcon } from './GoogleIcon';

export function Navbar() {
  const pathname = usePathname();

  // Ocultar barra pública en administración
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md text-[#1a2527] shadow-sm border-b border-[#D3B9B9]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Nombre Institucional */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-[#fdf2f8] text-[#d30684] border border-[#d30684]/25 flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform">
              <GoogleIcon name="volunteer_activism" size={24} filled />
            </div>
            <div>
              <span className="font-heading font-extrabold text-lg sm:text-xl tracking-tight text-[#1a2527] block leading-tight">
                Hilando Voces
              </span>
              <span className="text-[11px] text-[#E28A85] block font-semibold">
                Plataforma de Acción Comunitaria
              </span>
            </div>
          </Link>

          {/* Navegación Ciudadana */}
          <nav className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
            <Link
              href="/"
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
                pathname === '/'
                  ? 'bg-[#d30684] text-white shadow-md shadow-[#d30684]/20'
                  : 'text-[#1a2527] hover:text-[#d30684] hover:bg-[#FAF8F5]'
              }`}
            >
              <GoogleIcon name="add_circle" size={18} />
              <span>Reportar</span>
            </Link>

            <Link
              href="/consultar"
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl font-bold transition-all ${
                pathname === '/consultar'
                  ? 'bg-[#d30684] text-white shadow-md shadow-[#d30684]/20'
                  : 'text-[#1a2527] hover:text-[#d30684] hover:bg-[#FAF8F5]'
              }`}
            >
              <GoogleIcon name="search" size={18} />
              <span className="hidden sm:inline">Consultar Ticket</span>
              <span className="sm:hidden">Consultar</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
