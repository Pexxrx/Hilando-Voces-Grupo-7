'use client';

import React, { useState, useRef, useEffect } from 'react';
import { GoogleIcon } from '@/components/GoogleIcon';
import { useAdminSession } from './AdminSessionContext';

interface ChatMessage {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: string;
  source?: string;
}

export function WarmichaChatbot() {
  const { profile } = useAdminSession();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [customKey, setCustomKey] = useState('');
  const [savedKey, setSavedKey] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `¡Hola, lideresa ${profile?.name.split(' ')[0] || ''}! 🦉🧵 Soy **Warmicha**, tu copiloto y lechuza vigía comunitaria en San Juan de Lurigancho.\n\nEstoy aquí para orientarte en tiempo real: desde el análisis de priorización con el **modelo científico AHP**, hasta la logística de las faenas barriales y la red de voluntarios con herramientas en tu comuna. ¿En qué te puedo apoyar hoy?`,
      timestamp: 'Ahora',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Cargar clave personalizada si el usuario la guardó en su navegador
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('warmicha_gemini_api_key');
      if (stored) {
        setSavedKey(stored);
        setCustomKey(stored);
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSaveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = customKey.trim();
    setSavedKey(cleanKey);
    if (typeof window !== 'undefined') {
      if (cleanKey) {
        localStorage.setItem('warmicha_gemini_api_key', cleanKey);
      } else {
        localStorage.removeItem('warmicha_gemini_api_key');
      }
    }
    setShowKeyModal(false);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-email': profile?.email || 'lideresa.canto@hilandovoces.pe',
          'x-admin-role': profile?.role || 'lideresa',
        },
        body: JSON.stringify({
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          userRole: profile?.roleTitle,
          userName: profile?.name,
          customApiKey: savedKey || undefined,
        }),
      });

      const data = await res.json();
      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'Aquí estoy para apoyarte con cualquier caso de SJL.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error('Error enviando mensaje a Warmicha:', err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          '¡Hola vecina! 🦉 Tuve una pequeña interferencia, pero puedes preguntarme directamente sobre las 5 faenas de noviembre o la priorización AHP.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    '📐 ¿Cómo funciona la Priorización AHP de Saaty?',
    '📅 ¿Qué faenas tenemos agendadas este fin de semana?',
    '⚡ Casos de alta prioridad en Canto Grande',
    '🛠️ ¿Qué vecinos tienen escaleras y palas?',
  ];

  return (
    <>
      {/* Botón Flotante Apple Style */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Abrir copiloto Warmicha"
            className="group relative flex items-center space-x-2.5 bg-gradient-to-r from-[#d30684] to-[#bd0474] text-white px-4 py-3 rounded-full shadow-2xl shadow-[#d30684]/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border-2 border-white/90"
          >
            <div className="relative">
              <span className="text-2xl filter drop-shadow">🦉</span>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#E4981E] rounded-full ring-2 ring-white animate-pulse" />
            </div>
            <div className="text-left hidden sm:block">
              <span className="font-heading font-black text-xs block leading-tight">Warmicha</span>
              <span className="text-[10px] text-pink-100 font-semibold block leading-tight">
                Copiloto Territorial
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Ventana de Chat Flotante Apple-Inspired */}
      {isOpen && (
        <div className="fixed bottom-5 right-5 z-50 w-[92vw] sm:w-[430px] h-[600px] max-h-[85vh] bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-[#D3B9B9]/50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300">
          {/* Cabecera Estilo Apple */}
          <div className="bg-gradient-to-r from-[#d30684] via-[#c00577] to-[#1a2527] p-4 text-white flex items-center justify-between shrink-0 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl border border-white/30 shadow-inner">
                🦉
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-heading font-black text-sm tracking-tight">Warmicha</h3>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-[#E4981E] text-white uppercase tracking-wider">
                    Copiloto IA
                  </span>
                </div>
                <p className="text-[11px] text-pink-100 font-medium">
                  Lechuza vigía comunitaria · San Juan de Lurigancho
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setShowKeyModal(!showKeyModal)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Configurar Gemini API Key"
              >
                <GoogleIcon name="settings" size={16} />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Minimizar chat"
              >
                <GoogleIcon name="close" size={18} />
              </button>
            </div>
          </div>

          {/* Modal / Popover para configurar API Key de Gemini */}
          {showKeyModal && (
            <div className="p-4 bg-[#FAF8F5] border-b border-[#D3B9B9]/60 text-xs space-y-2 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#1a2527] flex items-center space-x-1">
                  <GoogleIcon name="key" size={14} className="text-[#d30684]" />
                  <span>Google Gemini API Key (Opcional):</span>
                </span>
                <button
                  type="button"
                  onClick={() => setShowKeyModal(false)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  <GoogleIcon name="close" size={14} />
                </button>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Ingresa una clave gratuita desde <strong className="text-[#d30684]">Google AI Studio</strong> para conectar Warmicha directamente a Gemini 2.5 Flash en vivo:
              </p>
              <form onSubmit={handleSaveApiKey} className="flex gap-2">
                <input
                  type="password"
                  value={customKey}
                  onChange={(e) => setCustomKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-[#D3B9B9] text-xs font-mono focus:outline-none focus:border-[#d30684]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-[#d30684] text-white font-bold text-xs hover:bg-[#bd0474] transition-colors"
                >
                  Guardar
                </button>
              </form>
              {savedKey && (
                <span className="text-[10px] text-emerald-600 font-semibold block">
                  ✓ Clave personalizada configurada
                </span>
              )}
            </div>
          )}

          {/* Subbarra de Estado */}
          <div className="bg-[#FAF8F5] px-4 py-2 border-b border-[#D3B9B9]/60 flex items-center justify-between text-[11px] text-slate-600">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Conectada a 29 casos de SJL y AHP</span>
            </span>
            <span className="font-bold text-[#d30684] text-[10px] bg-[#fdf2f8] px-2 py-0.5 rounded-full border border-[#d30684]/20">
              {savedKey ? 'Gemini Live ⚡' : 'Motor AHP SJL'}
            </span>
          </div>

          {/* Historial de Mensajes con Scroll Suave */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-gradient-to-b from-[#FAF8F5]/30 to-white text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${
                  msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="w-7 h-7 rounded-full bg-[#fdf2f8] border border-[#d30684]/30 flex items-center justify-center text-sm shrink-0">
                    🦉
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#1a2527] text-white font-bold flex items-center justify-center text-[10px] shrink-0">
                    {profile?.avatarInitials || 'L'}
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 leading-relaxed space-y-1 shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-[#d30684] text-white rounded-tr-none'
                      : 'bg-white border border-[#D3B9B9]/60 text-slate-800 rounded-tl-none'
                  }`}
                >
                  <div className="whitespace-pre-line text-xs font-normal">{msg.content}</div>
                  <div className="flex items-center justify-between pt-1 text-[9px]">
                    <span
                      className={msg.role === 'user' ? 'text-pink-200' : 'text-slate-400'}
                    >
                      {msg.source === 'gemini-live' ? '⚡ Gemini 2.5 Flash' : ''}
                    </span>
                    <span
                      className={msg.role === 'user' ? 'text-pink-200' : 'text-slate-400'}
                    >
                      {msg.timestamp}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-[#fdf2f8] border border-[#d30684]/30 flex items-center justify-center text-sm shrink-0">
                  🦉
                </div>
                <div className="bg-white border border-[#D3B9B9]/60 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#d30684] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#d30684] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-[#d30684] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias Rápidas */}
          <div className="px-3 py-2 bg-[#FAF8F5] border-t border-[#D3B9B9]/50 overflow-x-auto no-scrollbar flex gap-1.5 shrink-0">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                disabled={loading}
                className="whitespace-nowrap px-3 py-1 rounded-full bg-white border border-[#D3B9B9]/70 hover:border-[#d30684] hover:text-[#d30684] text-[10px] font-semibold text-slate-700 transition-colors shrink-0 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Caja de Entrada de Texto Estilo Apple */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-[#D3B9B9]/50 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pregúntale a Warmicha sobre cualquier caso de SJL..."
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-2xl bg-[#FAF8F5] border border-[#D3B9B9]/60 text-xs text-[#1a2527] placeholder:text-slate-400 focus:outline-none focus:border-[#d30684] focus:ring-1 focus:ring-[#d30684]"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-2xl bg-[#d30684] hover:bg-[#bd0474] disabled:opacity-40 text-white flex items-center justify-center transition-all cursor-pointer shadow-md shadow-[#d30684]/25 shrink-0"
              title="Enviar consulta"
            >
              <GoogleIcon name="arrow_upward" size={18} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
