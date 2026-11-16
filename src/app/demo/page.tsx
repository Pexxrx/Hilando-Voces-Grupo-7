import React from 'react';
import Link from 'next/link';
import { ReportForm } from '@/components/ReportForm';
import { Sparkles, ArrowRight, Shield, MapPin, ExternalLink, HeartHandshake } from 'lucide-react';

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1a2527] flex flex-col justify-between">
      {/* Contenedor Superior */}
      <main className="w-full max-w-xl mx-auto px-3 sm:px-4 pt-3 pb-8 space-y-3">
        {/* Banner de Modo Demostración */}
        <div className="bg-[#fdf2f8] p-3.5 rounded-2xl border border-[#d30684]/30 text-xs text-[#d30684] flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2 font-bold">
            <Sparkles className="w-4 h-4 text-[#d30684]" />
            <span>Versión Demo para Innovathon / Jurado</span>
          </div>
          <Link
            href="/"
            className="text-[11px] underline font-bold hover:text-[#bd0474]"
          >
            Ver versión real de producción →
          </Link>
        </div>

        <div className="text-center space-y-1">
          <h1 className="font-heading text-xl sm:text-2xl font-extrabold text-[#1a2527] tracking-tight">
            Simulador de Reporte Vecinal (Demo)
          </h1>
          <p className="text-xs text-slate-600">
            Incluye botón de auto-llenado y simulación GPS en Canto Grande (SJL).
          </p>
        </div>

        {/* Formulario en Modo Demo */}
        <ReportForm isDemo={true} />

        {/* Información Ciudadana */}
        <div className="p-4 bg-white rounded-2xl border border-[#D3B9B9] text-center space-y-1 shadow-sm">
          <span className="text-xs font-bold text-[#1a2527] block">
            Plataforma Barrial de Autogestión Cívica
          </span>
          <p className="text-[11px] text-slate-500">
            Los reportes registrados se procesan de forma 100% anónima para organizar jornadas de limpieza, reparación y alumbrado.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white text-slate-600 py-6 px-4 text-center text-xs mt-6 border-t border-[#D3B9B9]">
        <div className="flex items-center justify-center space-x-2 font-bold text-[#1a2527]">
          <HeartHandshake className="w-4 h-4 text-[#d30684]" />
          <span>Hilando Voces · Warmi Innovathon 2026 | Modo Demostración</span>
        </div>
      </footer>
    </div>
  );
}
