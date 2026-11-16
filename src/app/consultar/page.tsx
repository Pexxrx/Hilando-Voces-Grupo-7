'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, KeyRound, AlertCircle, ShieldCheck, ArrowRight } from 'lucide-react';
import { Timeline } from '@/components/Timeline';
import { Report } from '@/types';

function ConsultContent() {
  const searchParams = useSearchParams();
  const ticketParam = searchParams.get('ticket');

  const [mode, setMode] = useState<'ticket' | 'dni'>('ticket');
  const [ticketInput, setTicketInput] = useState(ticketParam || '');
  const [dniInput, setDniInput] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [report, setReport] = useState<Report | null>(null);
  const [reportsByDni, setReportsByDni] = useState<Report[]>([]);
  const [savedTickets, setSavedTickets] = useState<{ code: string; axis: string; created_at: string }[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('hv_tickets');
    if (stored) {
      try {
        setSavedTickets(JSON.parse(stored));
      } catch (e) {}
    }

    if (ticketParam) {
      searchByTicket(ticketParam);
    }
  }, [ticketParam]);

  const searchByTicket = async (code: string) => {
    if (!code) return;
    setLoading(true);
    setError(null);
    setReport(null);
    setReportsByDni([]);

    try {
      const res = await fetch('/api/reports/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_code: code }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'No se encontró el reporte.');
      } else {
        setReport(data.report);
      }
    } catch (e) {
      setError('Error de conexión al consultar el ticket.');
    } finally {
      setLoading(false);
    }
  };

  const searchByDni = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dniInput || dniInput.length !== 8) {
      setError('Ingresa un DNI válido de 8 dígitos.');
      return;
    }

    setLoading(true);
    setError(null);
    setReport(null);
    setReportsByDni([]);

    try {
      const res = await fetch('/api/reports/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dni: dniInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'No se encontraron reportes asociados.');
      } else {
        if (data.reports && data.reports.length > 0) {
          setReportsByDni(data.reports);
        } else {
          setError('No hay reportes registrados con este DNI.');
        }
      }
    } catch (e) {
      setError('Error de conexión al consultar.');
    } finally {
      setLoading(false);
    }
  };

  const getAxisBadge = (axis: string) => {
    switch (axis) {
      case 'alumbrado':
        return <span className="bg-[#FFFBEB] text-[#E4981E] border border-[#FDE68A] px-3 py-1 rounded-full font-bold text-xs">Alumbrado</span>;
      case 'microbasurales':
        return <span className="bg-[#FFF1F2] text-[#E28A85] border border-[#FECDD3] px-3 py-1 rounded-full font-bold text-xs">Limpieza de basura</span>;
      case 'espacios_recreativos':
        return <span className="bg-[#F0FDF4] text-[#588157] border border-[#BBF7D0] px-3 py-1 rounded-full font-bold text-xs">Espacios Recreativos</span>;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'resuelto':
        return (
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-300 px-3 py-1 rounded-full font-bold text-xs uppercase shadow-sm">
            Resuelto
          </span>
        );
      case 'faena_programada':
        return (
          <span className="bg-amber-50 text-amber-700 border border-amber-300 px-3 py-1 rounded-full font-bold text-xs uppercase shadow-sm">
            Faena Programada
          </span>
        );
      default:
        return (
          <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-full font-bold text-xs uppercase shadow-sm">
            En Proceso
          </span>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Selector de modo de consulta */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D3B9B9]/70 shadow-xl shadow-[#d30684]/5 space-y-6">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-widest text-[#d30684] block mb-1">
            Seguimiento Ciudadano
          </span>
          <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#1a2527] tracking-tight">
            Consulta y Estado de Tickets
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Revisa el avance de la faena y la fotografía de rendición de cuentas del espacio recuperado.
          </p>
        </div>

        {/* Pestañas de modo */}
        <div className="flex rounded-2xl bg-[#FAF8F5] p-1.5 border border-[#D3B9B9]">
          <button
            type="button"
            onClick={() => { setMode('ticket'); setError(null); }}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'ticket' ? 'bg-[#d30684] text-white shadow-sm' : 'text-slate-600 hover:text-[#d30684]'
            }`}
          >
            Buscar por Código (#HV-...)
          </button>
          <button
            type="button"
            onClick={() => { setMode('dni'); setError(null); }}
            className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              mode === 'dni' ? 'bg-[#d30684] text-white shadow-sm' : 'text-slate-600 hover:text-[#d30684]'
            }`}
          >
            ¿Olvidaste tu código? (Por DNI)
          </button>
        </div>

        {mode === 'ticket' ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              searchByTicket(ticketInput);
            }}
            className="flex flex-col sm:flex-row gap-2"
          >
            <input
              type="text"
              placeholder="Ej: #HV-SJL-048"
              value={ticketInput}
              onChange={(e) => setTicketInput(e.target.value.toUpperCase())}
              className="flex-1 px-4 py-3.5 rounded-xl bg-white border border-[#D3B9B9] font-mono text-base uppercase text-[#1a2527] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d30684] focus:border-[#d30684] transition-all shadow-sm font-bold"
            />
            <button
              type="submit"
              disabled={loading || !ticketInput}
              className="px-6 py-3.5 rounded-xl bg-[#d30684] hover:bg-[#bd0474] text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-[#d30684]/20"
            >
              <Search className="w-4 h-4 text-white" />
              <span>{loading ? 'Consultando...' : 'Consultar'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={searchByDni} className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                maxLength={8}
                placeholder="Ingresa tu DNI (8 dígitos)"
                value={dniInput}
                onChange={(e) => setDniInput(e.target.value.replace(/\D/g, ''))}
                className="flex-1 px-4 py-3.5 rounded-xl bg-white border border-[#D3B9B9] font-mono text-base text-[#1a2527] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d30684] focus:border-[#d30684] transition-all shadow-sm font-bold"
              />
              <button
                type="submit"
                disabled={loading || dniInput.length !== 8}
                className="px-6 py-3.5 rounded-xl bg-[#d30684] hover:bg-[#bd0474] text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-[#d30684]/20"
              >
                <KeyRound className="w-4 h-4 text-white" />
                <span>{loading ? 'Recuperando...' : 'Recuperar'}</span>
              </button>
            </div>
            <div className="p-3 bg-[#fdf2f8] border border-[#d30684]/30 rounded-xl text-xs text-[#1a2527] flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-[#d30684] shrink-0" />
              <span>Tu DNI solo se usa para buscar el ticket y se descarta de la memoria al instante.</span>
            </div>
          </form>
        )}

        {/* Accesos rápidos desde LocalStorage */}
        {savedTickets.length > 0 && !report && reportsByDni.length === 0 && (
          <div className="pt-4 border-t border-[#D3B9B9]/50">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-3">
              Tus reportes guardados:
            </span>
            <div className="flex flex-wrap gap-2">
              {savedTickets.map((t) => (
                <button
                  key={t.code}
                  type="button"
                  onClick={() => {
                    setTicketInput(t.code);
                    searchByTicket(t.code);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#fdf2f8] border border-[#D3B9B9] hover:border-[#d30684] text-xs font-mono font-bold text-[#1a2527] transition-all flex items-center space-x-2 cursor-pointer shadow-sm"
                >
                  <span className="text-[#d30684]">{t.code}</span>
                  <span className="text-[11px] text-slate-500 capitalize">• {t.axis}</span>
                  <ArrowRight className="w-3 h-3 text-[#d30684]" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-[#F3E8E8] border border-[#d30684]/40 text-[#8c472f] text-xs sm:text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-[#d30684] shrink-0" />
          <div>{error}</div>
        </div>
      )}

      {/* Múltiples reportes recuperados por DNI */}
      {reportsByDni.length > 0 && !report && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D3B9B9]/70 shadow-xl space-y-4">
          <h2 className="font-heading text-lg font-bold text-[#1a2527]">
            Reportes asociados a tu DNI ({reportsByDni.length})
          </h2>
          <div className="space-y-3">
            {reportsByDni.map((r) => (
              <div
                key={r.ticket_code}
                onClick={() => setReport(r)}
                className="p-4 rounded-2xl border border-[#D3B9B9] hover:border-[#d30684] bg-[#FAF8F5] hover:bg-white transition-all cursor-pointer flex items-center justify-between shadow-sm"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-[#d30684] text-base">{r.ticket_code}</span>
                    {getAxisBadge(r.axis)}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-1">{r.description}</p>
                </div>
                <div className="text-right">
                  {getStatusBadge(r.status)}
                  <span className="text-[11px] text-slate-500 block mt-1">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detalle del caso */}
      {report && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#D3B9B9]/70 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D3B9B9]/60 pb-5">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-slate-500">Expediente Ciudadano</span>
              <h2 className="text-2xl sm:text-3xl font-mono font-black text-[#d30684]">{report.ticket_code}</h2>
            </div>
            <div className="flex items-center space-x-2">
              {getAxisBadge(report.axis)}
              {getStatusBadge(report.status)}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1a2527] block mb-1.5">
              Testimonio Vecinal Registrado:
            </span>
            <p className="text-xs sm:text-sm text-slate-700 bg-[#FAF8F5] p-4 rounded-2xl border border-[#D3B9B9] leading-relaxed italic">
              "{report.description}"
            </p>
          </div>

          <Timeline
            status={report.status}
            createdAt={report.created_at}
            resolvedAt={report.resolved_at}
            photoBeforeUrl={report.photo_before_url}
            photoAfterUrl={report.photo_after_url}
          />
        </div>
      )}
    </div>
  );
}

export default function ConsultPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 px-4 sm:px-6">
      <Suspense fallback={<div className="text-center py-16 text-slate-500 font-mono text-sm">Cargando consulta comunitaria...</div>}>
        <ConsultContent />
      </Suspense>
    </div>
  );
}
