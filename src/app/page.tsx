import React from 'react';
import Link from 'next/link';
import { ReportForm } from '@/components/ReportForm';
import { Search, ArrowRight, HeartHandshake } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1a2527] flex flex-col justify-between">
      {/* Contenedor Superior: Formulario Único, Directo y Protagónico */}
      <main className="w-full max-w-xl mx-auto px-3 sm:px-4 pt-6 pb-10 space-y-4">
        {/* Encabezado Corto e Impactante */}
        <div className="text-center space-y-2 pb-1">
          <h1 className="font-heading text-4xl sm:text-5xl font-black text-[#1a2527] tracking-tight">
            Alza tu <span className="text-[#d30684]">voz</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
            Reporta de forma 100% anónima y segura las necesidades de tu calle o pasaje.
          </p>
        </div>

        {/* Formulario de Implementación Exclusivo */}
        <ReportForm isDemo={false} />

        {/* Acceso discreto para consulta de ticket existente */}
        <div className="pt-2 text-center">
          <Link
            href="/consultar"
            className="inline-flex items-center space-x-2 text-xs sm:text-sm font-semibold text-[#1a2527] hover:text-[#d30684] transition-colors py-2"
          >
            <Search className="w-4 h-4 text-[#d30684]" />
            <span>¿Ya registraste un caso? Consulta tu ticket aquí</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>
      </main>

      {/* Footer Mínimo sin verdes ni emojis */}
      <footer className="bg-white border-t border-[#D3B9B9] py-6 px-4 text-center text-xs text-slate-600">
        <div className="flex items-center justify-center space-x-2 font-bold text-[#1a2527]">
          <HeartHandshake className="w-4 h-4 text-[#d30684]" />
          <span>Hilando Voces · Liderazgo Comunitario</span>
        </div>
        <p className="text-[11px] text-slate-500 mt-1">
          Plataforma ciudadana independiente de autogestión vecinal.
        </p>
      </footer>
    </div>
  );
}
