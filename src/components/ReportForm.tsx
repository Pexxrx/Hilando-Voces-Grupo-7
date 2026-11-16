'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  Lightbulb, 
  Trash2, 
  TreePine, 
  MapPin, 
  Camera, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  Share2, 
  Copy,
  Users,
  Navigation,
  Check,
  X,
  HelpCircle,
  Phone,
  CreditCard,
  Plus
} from 'lucide-react';
import { ReportAxis } from '@/types';
import { isPointInSJL } from '@/lib/geofencing';
import { LocationPickerMap } from './LocationPickerMap';

interface ReportFormProps {
  isDemo?: boolean;
}

export function ReportForm({ isDemo = false }: ReportFormProps) {
  const [step, setStep] = useState<number>(1);
  const [dni, setDni] = useState('');
  const [ubigeo, setUbigeo] = useState('');
  // Checkbox de mayoría de edad desmarcado por defecto
  const [isAdultConfirmed, setIsAdultConfirmed] = useState(false);
  const [isPrivacyAccepted, setIsPrivacyAccepted] = useState(false);
  
  const [axis, setAxis] = useState<ReportAxis | null>(null);
  const [description, setDescription] = useState('');
  const [reference, setReference] = useState('');
  
  // 1. Permiso de ubicación ciudadana (para verificar presencia en SJL)
  const [userLocationVerified, setUserLocationVerified] = useState(false);
  const [verifyingLocation, setVerifyingLocation] = useState(false);
  const [locationVerificationError, setLocationVerificationError] = useState<string | null>(null);

  // 2. Coordenadas del problema seleccionadas en el mapa
  const [problemCoords, setProblemCoords] = useState<{ lat: number; lng: number }>({
    lat: -11.9754,
    lng: -76.9982,
  });

  // 3. Fotografías del lugar (Mínimo 1, Máximo 3)
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Modales informativos
  const [showLocationHelp, setShowLocationHelp] = useState(false);
  const [showUbigeoGuide, setShowUbigeoGuide] = useState(false);
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);
  const [dniTab, setDniTab] = useState<'azul' | 'dnie' | 'dnie_2020'>('azul');

  const [wantsToCoordinate, setWantsToCoordinate] = useState(false);
  const [whatsapp, setWhatsapp] = useState('');
  
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ticketResult, setTicketResult] = useState<{
    code: string;
    axis: string;
    created_at: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Verificación de permiso de ubicación ciudadana (Confirmar que está en SJL)
  const handleRequestLocationPermission = () => {
    setVerifyingLocation(true);
    setLocationVerificationError(null);

    if (!navigator.geolocation) {
      setLocationVerificationError('Tu dispositivo no soporta geolocalización directa.');
      setVerifyingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const inSjl = isPointInSJL(lat, lng);
        if (inSjl) {
          setUserLocationVerified(true);
          // Si el usuario aún no movió el pin, centramos el problema en su ubicación aproximada
          setProblemCoords({ lat, lng });
          setLocationVerificationError(null);
        } else {
          if (isDemo) {
            setLocationVerificationError('Tu ubicación detectada está fuera de SJL. Puedes usar la confirmación de prueba.');
          } else {
            // Permitimos confirmar que reporta para SJL o reintentar
            setLocationVerificationError('La señal de tu celular indica que estás fuera del área de San Juan de Lurigancho. Si te encuentras en el distrito, por favor asegúrate de tener el GPS activado.');
          }
        }
        setVerifyingLocation(false);
      },
      (error) => {
        let msg = 'No fue posible acceder al permiso de ubicación. Por favor, activa la ubicación en tu teléfono.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Permiso denegado por el navegador. Puedes activarlo en los ajustes de tu navegador o confirmar tu presencia abajo.';
        }
        setLocationVerificationError(msg);
        setVerifyingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSimulateSjlVerification = () => {
    setUserLocationVerified(true);
    setLocationVerificationError(null);
  };

  // Manejo de fotografías múltiples (1 a 3 fotos)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const remainingSlots = 3 - photos.length;
    if (remainingSlots <= 0) return;

    const filesToProcess = Array.from(files).slice(0, remainingSlots);

    filesToProcess.forEach((file) => {
      // Validar que sea archivo de imagen
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setPhotos((prev) => {
            if (prev.length >= 3) return prev;
            return [...prev, reader.result as string];
          });
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Deseleccionar o seleccionar eje (toggle)
  const handleToggleAxis = (selected: ReportAxis) => {
    setAxis((prev) => (prev === selected ? null : selected));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    if (!dni || dni.length !== 8) {
      setSubmitError('Por favor, ingresa los 8 dígitos correspondientes a tu DNI.');
      return;
    }

    if (!ubigeo || ubigeo.length !== 6) {
      setSubmitError('Por favor, ingresa los 6 dígitos del código de Ubigeo de tu DNI.');
      return;
    }

    if (!isAdultConfirmed) {
      setSubmitError('Debes declarar ser mayor de 18 años para realizar el reporte.');
      return;
    }

    if (!isPrivacyAccepted) {
      setSubmitError('Por favor, confirma haber leído y aceptado la política de reporte anónimo.');
      return;
    }

    if (!axis) {
      setSubmitError('Por favor, selecciona una de las tres áreas de atención comunitaria.');
      return;
    }

    if (!userLocationVerified) {
      setSubmitError('Por favor, confirma el permiso de ubicación para verificar tu presencia en el distrito.');
      return;
    }

    if (!reference || reference.trim().length < 5) {
      setSubmitError('La referencia o dirección del lugar es obligatoria (al menos 5 caracteres).');
      return;
    }

    if (!description || description.trim().length < 10) {
      setSubmitError('Por favor, bríndanos un breve detalle de la situación (al menos 10 caracteres).');
      return;
    }

    if (photos.length < 1) {
      setSubmitError('Es obligatorio adjuntar al menos 1 fotografía del lugar (máximo 3).');
      return;
    }

    if (wantsToCoordinate && (!whatsapp || whatsapp.length < 9)) {
      setSubmitError('Por favor, ingresa un número telefónico de 9 dígitos para la coordinación comunitaria.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dni,
          ubigeo,
          axis,
          description: description.trim(),
          reference: reference.trim(),
          latitude: problemCoords.lat,
          longitude: problemCoords.lng,
          photo_before_url: photos[0] || null,
          photos: photos,
          wants_to_coordinate: wantsToCoordinate,
          coordinator_whatsapp: wantsToCoordinate ? whatsapp : null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setSubmitError(data.error || 'Ocurrió un inconveniente al procesar el reporte. Por favor, intenta nuevamente.');
        setSubmitting(false);
        return;
      }

      // Guardar ticket en LocalStorage del celular
      const stored = localStorage.getItem('hv_tickets');
      const ticketList = stored ? JSON.parse(stored) : [];
      ticketList.unshift({
        code: data.ticket_code,
        axis: data.axis,
        created_at: data.created_at,
      });
      localStorage.setItem('hv_tickets', JSON.stringify(ticketList));

      setTicketResult({
        code: data.ticket_code,
        axis: data.axis,
        created_at: data.created_at,
      });
      setStep(5);
    } catch (err: any) {
      setSubmitError('Error de comunicación con el servidor. Revisa tu conexión a internet.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyTicket = () => {
    if (ticketResult) {
      navigator.clipboard.writeText(ticketResult.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareViaWhatsapp = () => {
    if (ticketResult) {
      const text = encodeURIComponent(
        `Hola, he registrado un reporte vecinal en la plataforma comunitaria Hilando Voces con el ticket ${ticketResult.code}. Puedes consultar el estado del caso en: https://hilando-voces.vercel.app/consultar?ticket=${ticketResult.code}`
      );
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl border-2 border-[#D3B9B9] shadow-xl overflow-hidden transition-all text-[#1a2527]">
      {/* Stepper Superior */}
      <div className="bg-[#FAF8F5] border-b border-[#D3B9B9] px-4 sm:px-6 py-3.5">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#1a2527]">
          <span className="flex items-center space-x-1.5">
            <span className="w-5 h-5 rounded-full bg-[#d30684] text-white flex items-center justify-center text-xs font-bold">
              {Math.min(step, 4)}
            </span>
            <span>de 4 pasos</span>
          </span>
          <span className="text-[#d30684] uppercase tracking-wider text-xs font-heading font-extrabold">
            {step === 1 && '1. DNI y Ubigeo'}
            {step === 2 && '2. Tipo de Problema'}
            {step === 3 && '3. Lugar y Detalle'}
            {step === 4 && '4. Colaboración'}
            {step === 5 && '¡Listo!'}
          </span>
        </div>

        {/* Barra de Progreso con el color principal #d30684 */}
        <div className="w-full bg-[#E7E7E5] h-2.5 rounded-full mt-2.5 overflow-hidden border border-[#D3B9B9]/50">
          <div 
            className="bg-[#d30684] h-full transition-all duration-300 rounded-full"
            style={{ width: `${(Math.min(step, 4) / 4) * 100}%` }}
          />
        </div>
      </div>

      <div className="p-4 sm:p-7">
        {submitError && (
          <div className="mb-5 p-4 rounded-2xl bg-[#F3E8E8] border-2 border-[#d30684]/50 text-[#8c472f] text-sm flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-[#d30684] shrink-0 mt-0.5" />
            <div className="font-semibold leading-relaxed">{submitError}</div>
          </div>
        )}

        {/* ============================================================
            PASO 1: Identificación Anónima y Seguridad Total
            ============================================================ */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#d30684] block mb-1">
                Paso 1 de 4
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1a2527] tracking-tight">
                Reporte 100% anónimo
              </h2>
              <p className="text-sm text-slate-600 mt-1 leading-relaxed">
                Tu identidad está protegida. No necesitas registrarte ni crear contraseñas.
              </p>
            </div>

            <div className="space-y-4">
              {/* Campo DNI con estado visual dinámico */}
              <div>
                <label className="block text-sm font-bold text-[#1a2527] mb-1.5">
                  Número de DNI (8 dígitos):
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={8}
                  placeholder="Ejemplo: 71234567"
                  value={dni}
                  onChange={(e) => setDni(e.target.value.replace(/\D/g, ''))}
                  className={`w-full px-4 py-3.5 rounded-2xl bg-white border-2 text-xl font-mono tracking-widest text-[#1a2527] focus:outline-none transition-all shadow-inner text-center font-bold ${
                    dni.length === 8
                      ? 'border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]'
                      : dni.length > 0
                      ? 'border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]'
                      : 'border-[#D3B9B9] focus:ring-2 focus:ring-[#d30684]'
                  }`}
                />

                {/* Mensaje dinámico de confirmación de DNI */}
                <div className="mt-1.5 text-xs text-center font-medium">
                  {dni.length === 0 && (
                    <span className="text-slate-500">
                      El campo está vacío. Ingresa los 8 dígitos de tu DNI.
                    </span>
                  )}
                  {dni.length > 0 && dni.length < 8 && (
                    <span className="text-[#ea580c] font-semibold">
                      Faltan {8 - dni.length} dígitos para completar tu DNI.
                    </span>
                  )}
                  {dni.length === 8 && (
                    <span className="text-[#16a34a] font-bold flex items-center justify-center space-x-1">
                      <CheckCircle2 className="w-4 h-4 text-[#16a34a]" />
                      <span>DNI completado (8 dígitos)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Campo de Ubigeo del DNI con botón a la Guía Visual RENIEC */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1.5">
                  <label className="text-sm font-bold text-[#1a2527]">
                    Código de Ubigeo (6 dígitos):
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowUbigeoGuide(true)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-white border-2 border-[#d30684] text-xs font-bold text-[#d30684] hover:bg-[#fdf2f8] active:scale-95 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-[#d30684] shrink-0" />
                    <span>¿Dónde encuentro el Ubigeo en mi DNI?</span>
                  </button>
                </div>

                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="Ejemplo: 123456"
                  value={ubigeo}
                  onChange={(e) => setUbigeo(e.target.value.replace(/\D/g, ''))}
                  className={`w-full px-4 py-3 rounded-xl bg-white border-2 font-mono text-base text-[#1a2527] focus:outline-none text-center font-bold tracking-widest shadow-inner transition-all ${
                    ubigeo.length === 6
                      ? 'border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]'
                      : ubigeo.length > 0
                      ? 'border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]'
                      : 'border-[#D3B9B9] focus:ring-2 focus:ring-[#d30684]'
                  }`}
                />

                <div className="mt-1 text-xs text-slate-500 text-center">
                  {ubigeo.length === 0 && 'Escribe los 6 números del ubigeo de tu DNI (ej: 123456).'}
                  {ubigeo.length > 0 && ubigeo.length < 6 && (
                    <span className="text-[#ea580c] font-semibold">
                      Faltan {6 - ubigeo.length} dígitos para completar el ubigeo.
                    </span>
                  )}
                  {ubigeo.length === 6 && (
                    <span className="text-[#16a34a] font-bold flex items-center justify-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" />
                      <span>Ubigeo completado (6 dígitos)</span>
                    </span>
                  )}
                </div>
              </div>

              {/* ============================================================
                  SECCIÓN FINAL: Mayoría de Edad (Desmarcado) y Anonimato
                  ============================================================ */}
              <div className="space-y-2.5 pt-2 border-t border-[#D3B9B9]/60">
                {/* Check 1: Mayor de 18 años (Desmarcado por defecto) */}
                <label className="flex items-center space-x-3 text-sm text-slate-800 cursor-pointer bg-[#FAF8F5] p-3 rounded-xl border border-[#D3B9B9]/70 hover:bg-[#FAF8F5]/80 transition-colors">
                  <input
                    type="checkbox"
                    checked={isAdultConfirmed}
                    onChange={(e) => setIsAdultConfirmed(e.target.checked)}
                    className="w-5 h-5 rounded text-[#d30684] focus:ring-[#d30684] border-2 border-[#D3B9B9] cursor-pointer"
                  />
                  <span className="font-medium text-xs sm:text-sm">Declaro ser mayor de 18 años.</span>
                </label>

                {/* Check 2: Aceptación de política de anonimato con enlace amigable */}
                <label className="flex items-start space-x-3 text-xs sm:text-sm text-slate-800 cursor-pointer bg-[#FAF8F5] p-3 rounded-xl border border-[#D3B9B9]/70 hover:bg-[#FAF8F5]/80 transition-colors">
                  <input
                    type="checkbox"
                    checked={isPrivacyAccepted}
                    onChange={(e) => setIsPrivacyAccepted(e.target.checked)}
                    className="w-5 h-5 rounded text-[#d30684] focus:ring-[#d30684] border-2 border-[#D3B9B9] shrink-0 mt-0.5 cursor-pointer"
                  />
                  <div className="leading-snug">
                    <span className="font-medium">
                      He leído y acepto la política de protección y reporte anónimo.
                    </span>{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowPrivacyPolicy(true);
                      }}
                      className="text-[#d30684] font-bold underline hover:text-[#bd0474] inline cursor-pointer"
                    >
                      (¿Para qué se pide mi DNI y cómo se cuidan mis datos?)
                    </button>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="button"
              disabled={dni.length !== 8 || ubigeo.length !== 6 || !isAdultConfirmed || !isPrivacyAccepted}
              onClick={() => setStep(2)}
              className="w-full py-4 px-6 rounded-2xl bg-[#d30684] hover:bg-[#bd0474] text-white font-bold text-base shadow-lg shadow-[#d30684]/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Continuar al Paso 2</span>
              <ArrowRight className="w-5 h-5 text-white" />
            </button>
          </div>
        )}

        {/* ============================================================
            PASO 2: Selección Amable con Toggle de Deselección
            ============================================================ */}
        {step === 2 && (
          <div className="space-y-5">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#d30684] block mb-1">
                Paso 2 de 4
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1a2527] tracking-tight">
                ¿Qué situación deseas reportar?
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Toca una opción para seleccionarla (o tócala de nuevo para deseleccionarla):
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              {/* Opción 1: Alumbrado (Mostaza dorada de la Paleta Perséfone) */}
              <button
                type="button"
                onClick={() => handleToggleAxis('alumbrado')}
                className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all flex items-center space-x-4 cursor-pointer ${
                  axis === 'alumbrado'
                    ? 'border-[#d30684] bg-[#fdf2f8] ring-2 ring-[#d30684] shadow-md'
                    : 'border-[#D3B9B9] bg-white hover:border-[#E4981E] hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="w-13 h-13 rounded-2xl bg-[#FFFBEB] text-[#E4981E] flex items-center justify-center shrink-0 border border-[#FDE68A] shadow-sm">
                  <Lightbulb className="w-7 h-7 text-[#E4981E]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[#1a2527] text-base sm:text-lg">
                      1. Alumbrado y vías oscuras
                    </h3>
                    {axis === 'alumbrado' && <Check className="w-5 h-5 text-[#d30684] stroke-[3]" />}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-snug">
                    Postes sin luz, focos quemados o pasajes oscuros donde se requiere iluminación comunitaria.
                  </p>
                </div>
              </button>

              {/* Opción 2: Limpieza de basura (Sin desmonte) */}
              <button
                type="button"
                onClick={() => handleToggleAxis('microbasurales')}
                className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all flex items-center space-x-4 cursor-pointer ${
                  axis === 'microbasurales'
                    ? 'border-[#d30684] bg-[#fdf2f8] ring-2 ring-[#d30684] shadow-md'
                    : 'border-[#D3B9B9] bg-white hover:border-[#E28A85] hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="w-13 h-13 rounded-2xl bg-[#FFF1F2] text-[#E28A85] flex items-center justify-center shrink-0 border border-[#FECDD3] shadow-sm">
                  <Trash2 className="w-7 h-7 text-[#E28A85]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[#1a2527] text-base sm:text-lg">
                      2. Limpieza de basura
                    </h3>
                    {axis === 'microbasurales' && <Check className="w-5 h-5 text-[#d30684] stroke-[3]" />}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-snug">
                    Puntos con basura acumulada o residuos que los vecinos y brigadas comunitarias pueden recoger y limpiar en una jornada barrial.
                  </p>
                </div>
              </button>

              {/* Opción 3: Recuperación de espacios abandonados */}
              <button
                type="button"
                onClick={() => handleToggleAxis('espacios_recreativos')}
                className={`p-4 sm:p-5 rounded-2xl border-2 text-left transition-all flex items-center space-x-4 cursor-pointer ${
                  axis === 'espacios_recreativos'
                    ? 'border-[#d30684] bg-[#fdf2f8] ring-2 ring-[#d30684] shadow-md'
                    : 'border-[#D3B9B9] bg-white hover:border-[#588157] hover:bg-[#FAF8F5]'
                }`}
              >
                <div className="w-13 h-13 rounded-2xl bg-[#F0FDF4] text-[#588157] flex items-center justify-center shrink-0 border border-[#BBF7D0] shadow-sm">
                  <TreePine className="w-7 h-7 text-[#588157]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-[#1a2527] text-base sm:text-lg">
                      3. Recuperación de espacios abandonados
                    </h3>
                    {axis === 'espacios_recreativos' && <Check className="w-5 h-5 text-[#d30684] stroke-[3]" />}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-snug">
                    Parques descuidados, losas comunales o rincones abandonados para limpiarlos, pintarlos y recuperarlos para la comunidad.
                  </p>
                </div>
              </button>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-1/3 py-4 px-4 rounded-2xl border-2 border-[#D3B9B9] text-slate-700 font-bold hover:bg-[#FAF8F5] cursor-pointer text-sm"
              >
                Atrás
              </button>
              <button
                type="button"
                disabled={!axis}
                onClick={() => setStep(3)}
                className="w-2/3 py-4 px-6 rounded-2xl bg-[#d30684] hover:bg-[#bd0474] text-white font-bold text-sm sm:text-base flex items-center justify-center space-x-2 transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-[#d30684]/20"
              >
                <span>Continuar al Paso 3</span>
                <ArrowRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
            PASO 3: Ubicación, Mapa Interactivo, Referencia y Fotos
            ============================================================ */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#d30684] block mb-1">
                Paso 3 de 4
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1a2527] tracking-tight">
                Lugar del problema y detalles
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Verifica que te encuentras en el distrito, coloca el pin en el mapa y detalla la situación.
              </p>
            </div>

            {/* SECCIÓN 1: Permiso de Ubicación Ciudadana (Presencia en SJL) */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#FAF8F5] border-2 border-[#D3B9B9] space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="text-xs sm:text-sm font-bold text-[#1a2527] flex items-center space-x-1.5">
                    <Navigation className="w-4 h-4 text-[#d30684]" />
                    <span>Verificación de presencia en San Juan de Lurigancho:</span>
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Pedimos acceso a tu ubicación solo para confirmar que estás en el distrito. No se guardará ningún rastro ni coordenadas de tu persona.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLocationHelp(true)}
                  className="text-xs text-[#d30684] font-semibold hover:underline cursor-pointer shrink-0"
                  title="¿Cómo cuidamos tu ubicación?"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>

              {userLocationVerified ? (
                <div className="bg-white p-3.5 rounded-xl border border-[#16a34a]/40 flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-[#16a34a]">
                    <CheckCircle2 className="w-5 h-5 text-[#16a34a] shrink-0" />
                    <span>Ubicación verificada en San Juan de Lurigancho</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRequestLocationPermission}
                    disabled={verifyingLocation}
                    className="text-xs text-slate-500 underline hover:text-[#d30684] cursor-pointer"
                  >
                    Volver a verificar
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleRequestLocationPermission}
                    disabled={verifyingLocation}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#d30684] hover:bg-[#bd0474] text-white font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-md shadow-[#d30684]/20"
                  >
                    <MapPin className="w-4 h-4 text-white" />
                    <span>
                      {verifyingLocation
                        ? 'Verificando señal de ubicación...'
                        : 'Dar permiso para verificar mi ubicación en SJL'}
                    </span>
                  </button>

                  {locationVerificationError && (
                    <div className="p-3 rounded-xl bg-[#F3E8E8] border border-[#d30684]/30 text-xs text-[#8c472f] space-y-1.5">
                      <p className="font-semibold">{locationVerificationError}</p>
                      <button
                        type="button"
                        onClick={handleSimulateSjlVerification}
                        className="font-bold text-[#d30684] underline hover:text-[#bd0474] cursor-pointer block"
                      >
                        Confirmar que me encuentro en San Juan de Lurigancho
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* SECCIÓN 2: Mapa Interactivo para Ubicar el Problema */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#1a2527]">
                Señala el lugar del problema en el mapa:
              </label>
              <p className="text-xs text-slate-600 leading-snug">
                Toca cualquier calle o arrastra el marcador para fijar el punto donde está el poste, la basura o el parque a recuperar.
              </p>
              
              <LocationPickerMap
                latitude={problemCoords.lat}
                longitude={problemCoords.lng}
                onChangeLocation={(lat, lng) => setProblemCoords({ lat, lng })}
              />
            </div>

            {/* SECCIÓN 3: Referencia Obligatoria */}
            <div>
              <label className="block text-sm font-bold text-[#1a2527] mb-1">
                Referencia o lugar donde ocurre <span className="text-[#d30684]">* (Obligatorio)</span>:
              </label>
              <input
                type="text"
                placeholder="Ejemplo: Pasaje Las Flores, frente a la bodega Don Pepe, paradero 4..."
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl bg-white border-2 border-[#D3B9B9] text-sm text-[#1a2527] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d30684] shadow-sm font-medium"
              />
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Escribe una referencia clara para que las brigadas reconozcan el punto.
                </span>
                <span className={reference.trim().length >= 5 ? 'text-[#16a34a] font-bold' : 'text-[#ea580c]'}>
                  {reference.trim().length >= 5 ? '✓ Referencia válida' : 'Mínimo 5 caracteres'}
                </span>
              </div>
            </div>

            {/* SECCIÓN 4: Detalle Breve de la Situación */}
            <div>
              <label className="block text-sm font-bold text-[#1a2527] mb-1">
                Detalle breve de la situación <span className="text-[#d30684]">* (Obligatorio)</span>:
              </label>
              <textarea
                rows={3}
                placeholder="Cuéntanos brevemente qué ocurre para organizar las herramientas o apoyo necesario..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white border-2 border-[#D3B9B9] text-sm text-[#1a2527] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#d30684] shadow-sm leading-relaxed"
              />
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Explica qué se necesita reparar o limpiar.
                </span>
                <span className={`font-semibold ${
                  description.trim().length >= 10
                    ? 'text-[#16a34a] font-bold'
                    : description.trim().length > 0
                    ? 'text-[#ea580c]'
                    : 'text-slate-500'
                }`}>
                  {description.trim().length >= 10
                    ? `✓ ${description.trim().length} caracteres`
                    : `${description.trim().length}/10 caracteres (mínimo 10)`}
                </span>
              </div>
            </div>

            {/* SECCIÓN 5: Fotografías del Lugar (1 a 3 Fotos Obligatorias) */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-bold text-[#1a2527]">
                  Fotografías del lugar <span className="text-[#d30684]">* (Mínimo 1, máximo 3 fotos)</span>:
                </label>
                <p className="text-xs text-slate-600 mt-0.5">
                  Acepta cualquier formato de foto (JPG, PNG, WEBP). Muestra el estado actual del lugar.
                </p>
              </div>

              {/* Grid de Fotos Subidas */}
              {photos.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {photos.map((photoUrl, index) => (
                    <div 
                      key={index} 
                      className="relative rounded-2xl overflow-hidden border-2 border-[#D3B9B9] bg-slate-50 aspect-square shadow-sm group"
                    >
                      <img 
                        src={photoUrl} 
                        alt={`Foto ${index + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute top-2 left-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                        Foto {index + 1} de 3
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute top-2 right-2 p-1.5 rounded-xl bg-white/95 text-[#8c472f] hover:bg-[#F3E8E8] shadow-md transition-all cursor-pointer"
                        title="Borrar foto"
                      >
                        <Trash2 className="w-4 h-4 text-[#d30684]" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Botón para Adjuntar Foto si hay menos de 3 */}
              {photos.length < 3 && (
                <div>
                  <label className="w-full flex items-center justify-center space-x-2 px-5 py-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#fdf2f8] border-2 border-dashed border-[#D3B9B9] hover:border-[#d30684] text-xs sm:text-sm font-bold text-[#d30684] cursor-pointer transition-all shadow-sm">
                    {photos.length === 0 ? (
                      <>
                        <Camera className="w-5 h-5 text-[#d30684]" />
                        <span>Tomar o adjuntar foto (Foto 1 de 3)</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 text-[#d30684]" />
                        <span>Agregar otra foto ({photos.length} de 3 subidas)</span>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* Indicador de estado de fotos */}
              <div className="text-xs font-medium">
                {photos.length === 0 ? (
                  <span className="text-[#ea580c] font-semibold flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5 text-[#ea580c]" />
                    <span>Es necesario adjuntar al menos 1 fotografía para continuar.</span>
                  </span>
                ) : (
                  <span className="text-[#16a34a] font-bold flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" />
                    <span>{photos.length} de 3 fotografías adjuntas</span>
                  </span>
                )}
              </div>
            </div>

            {/* Botones de Navegación del Paso 3 */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-1/3 py-4 px-4 rounded-2xl border-2 border-[#D3B9B9] text-slate-700 font-bold hover:bg-[#FAF8F5] cursor-pointer text-sm"
              >
                Atrás
              </button>
              <button
                type="button"
                disabled={
                  !userLocationVerified ||
                  reference.trim().length < 5 ||
                  description.trim().length < 10 ||
                  photos.length < 1
                }
                onClick={() => setStep(4)}
                className="w-2/3 py-4 px-6 rounded-2xl bg-[#d30684] hover:bg-[#bd0474] text-white font-bold text-sm sm:text-base flex items-center justify-center space-x-2 transition-all disabled:opacity-40 cursor-pointer shadow-md shadow-[#d30684]/20"
              >
                <span>Continuar al Paso 4</span>
                <ArrowRight className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        )}

        {/* ============================================================
            PASO 4: Coordinación Comunitaria Voluntaria
            ============================================================ */}
        {step === 4 && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <span className="text-xs uppercase font-extrabold tracking-widest text-[#d30684] block mb-1">
                Paso 4 de 4
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1a2527] tracking-tight">
                Participación y articulación
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Las mejoras en los barrios se consolidan a través del apoyo entre vecinas, vecinos y lideresas juveniles.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-[#fdf2f8] border-2 border-[#d30684]/30 space-y-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#d30684] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1a2527] text-base">
                    ¿Te gustaría colaborar en la jornada comunitaria?
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                    Si lo deseas, el equipo de lideresas podrá ponerse en contacto contigo para coordinar la fecha, el punto de reunión y las herramientas necesarias.
                  </p>
                </div>
              </div>

              <label className="flex items-center space-x-3 text-sm font-bold text-[#1a2527] cursor-pointer pt-2 bg-white p-3.5 rounded-xl border border-[#D3B9B9]">
                <input
                  type="checkbox"
                  checked={wantsToCoordinate}
                  onChange={(e) => setWantsToCoordinate(e.target.checked)}
                  className="w-5 h-5 rounded text-[#d30684] focus:ring-[#d30684] border-2 border-[#D3B9B9]"
                />
                <span>Deseo apoyar voluntariamente y recibir coordinación por WhatsApp</span>
              </label>

              {wantsToCoordinate && (
                <div className="pt-2">
                  <label className="block text-sm font-bold text-[#1a2527] mb-1.5">
                    Número de WhatsApp para coordinar (9 dígitos):
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Ejemplo: 987654321"
                      maxLength={9}
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, ''))}
                      className={`w-full pl-10 pr-4 py-3.5 rounded-xl bg-white border-2 text-base font-mono text-[#1a2527] focus:outline-none font-bold transition-all ${
                        whatsapp.length === 9
                          ? 'border-[#16a34a] focus:ring-2 focus:ring-[#16a34a]'
                          : whatsapp.length > 0
                          ? 'border-[#ea580c] focus:ring-2 focus:ring-[#ea580c]'
                          : 'border-[#D3B9B9] focus:ring-2 focus:ring-[#d30684]'
                      }`}
                    />
                    <Phone className="w-5 h-5 text-[#d30684] absolute left-3.5 top-3.5" />
                  </div>
                  <div className="mt-1 text-xs">
                    {whatsapp.length === 0 && (
                      <span className="text-slate-500">Solo se empleará para coordinar la faena barrial correspondiente.</span>
                    )}
                    {whatsapp.length > 0 && whatsapp.length < 9 && (
                      <span className="text-[#ea580c] font-semibold">Faltan {9 - whatsapp.length} dígitos para completar tu número de WhatsApp.</span>
                    )}
                    {whatsapp.length === 9 && (
                      <span className="text-[#16a34a] font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#16a34a]" />
                        <span>Número de WhatsApp completado (9 dígitos)</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-1/3 py-4 px-4 rounded-2xl border-2 border-[#D3B9B9] text-slate-700 font-bold hover:bg-[#FAF8F5] cursor-pointer text-sm"
              >
                Atrás
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-2/3 py-4 px-6 rounded-2xl bg-[#d30684] hover:bg-[#bd0474] text-white font-bold text-sm sm:text-base shadow-lg shadow-[#d30684]/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-40 cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>{submitting ? 'Enviando reporte...' : 'Finalizar y Enviar Reporte'}</span>
              </button>
            </div>
          </form>
        )}

        {/* ============================================================
            PASO 5: Confirmación de Ticket
            ============================================================ */}
        {step === 5 && ticketResult && (
          <div className="text-center py-4 space-y-6">
            <div className="w-16 h-16 bg-[#f0fdf4] text-[#16a34a] rounded-full flex items-center justify-center mx-auto shadow-md border-2 border-[#16a34a]/30">
              <CheckCircle2 className="w-10 h-10 text-[#16a34a]" />
            </div>

            <div>
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#16a34a] block">
                ¡Reporte Registrado Correctamente!
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#1a2527] mt-1">
                Tu Código de Seguimiento:
              </h2>
              <div className="mt-4 inline-flex items-center space-x-3 bg-[#FAF8F5] border-2 border-[#d30684] text-[#d30684] px-6 py-3.5 rounded-2xl font-mono text-2xl sm:text-3xl font-black tracking-wider shadow-md">
                <span>{ticketResult.code}</span>
                <button
                  onClick={copyTicket}
                  className="p-2 hover:bg-[#fdf2f8] rounded-xl transition-colors text-slate-500 hover:text-[#d30684] cursor-pointer"
                  title="Copiar código"
                >
                  {copied ? <Check className="w-5 h-5 text-[#d30684]" /> : <Copy className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Conserva este código para consultar los avances de la jornada o compártelo con tus vecinas y vecinos.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={shareViaWhatsapp}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#d30684] hover:bg-[#bd0474] text-white text-sm font-bold flex items-center justify-center space-x-2 shadow-md shadow-[#d30684]/20 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-white" />
                <span>Compartir en WhatsApp</span>
              </button>

              <Link
                href={`/consultar?ticket=${encodeURIComponent(ticketResult.code)}`}
                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#FAF8F5] hover:bg-[#fdf2f8] border-2 border-[#D3B9B9] text-[#1a2527] text-sm font-bold flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Ver estado del caso</span>
                <ArrowRight className="w-4 h-4 text-[#d30684]" />
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          MODAL 1: GUÍA VISUAL RENIEC (DNI Azul, DNIe, DNIe desde 2020)
          ============================================================ */}
      {showUbigeoGuide && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-6 shadow-2xl border-2 border-[#D3B9B9] space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[#D3B9B9] pb-3">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5 text-[#d30684]" />
                <h3 className="font-heading font-bold text-lg text-[#1a2527]">
                  Encuentra el Ubigeo en tu DNI
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowUbigeoGuide(false)}
                className="text-slate-400 hover:text-[#1a2527] p-1 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Selector de 3 pestañas solicitadas estrictamente */}
            <div className="flex rounded-xl bg-[#FAF8F5] p-1 border border-[#D3B9B9] text-xs font-bold">
              <button
                type="button"
                onClick={() => setDniTab('azul')}
                className={`flex-1 py-2 px-2 rounded-lg transition-all cursor-pointer text-center ${
                  dniTab === 'azul'
                    ? 'bg-[#d30684] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#d30684]'
                }`}
              >
                DNI Azul
              </button>
              <button
                type="button"
                onClick={() => setDniTab('dnie')}
                className={`flex-1 py-2 px-2 rounded-lg transition-all cursor-pointer text-center ${
                  dniTab === 'dnie'
                    ? 'bg-[#d30684] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#d30684]'
                }`}
              >
                DNIe
              </button>
              <button
                type="button"
                onClick={() => setDniTab('dnie_2020')}
                className={`flex-1 py-2 px-2 rounded-lg transition-all cursor-pointer text-center ${
                  dniTab === 'dnie_2020'
                    ? 'bg-[#d30684] text-white shadow-sm'
                    : 'text-slate-600 hover:text-[#d30684]'
                }`}
              >
                DNIe desde 2020
              </button>
            </div>

            {/* Pestaña 1: DNI Azul */}
            {dniTab === 'azul' && (
              <div className="space-y-3">
                <div className="rounded-2xl border-2 border-[#D3B9B9] overflow-hidden bg-slate-50 flex items-center justify-center p-2">
                  <img 
                    src="/images/dni/ubigeo_dni_azul.png" 
                    alt="Ubicación del Ubigeo en DNI Azul según RENIEC" 
                    className="max-h-56 w-auto object-contain rounded-xl"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-[#fdf2f8] border border-[#d30684]/30 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-[#d30684] block mb-1">Explicación oficial RENIEC (DNI Azul):</strong>
                  Está en la parte delantera de tu documento, exactamente al costado de tu fecha de nacimiento, junto a la palabra <strong>"Ubigeo"</strong>. Son 6 números juntos (ejemplo: <code>123456</code>).
                </div>
              </div>
            )}

            {/* Pestaña 2: DNIe (versiones anteriores) */}
            {dniTab === 'dnie' && (
              <div className="space-y-3">
                <div className="rounded-2xl border-2 border-[#D3B9B9] overflow-hidden bg-slate-50 flex items-center justify-center p-2">
                  <img 
                    src="/images/dni/ubigeo_dnie.png" 
                    alt="Ubicación del Ubigeo en DNI Electrónico según RENIEC" 
                    className="max-h-56 w-auto object-contain rounded-xl"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-[#fdf2f8] border border-[#d30684]/30 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-[#d30684] block mb-1">Explicación oficial RENIEC (DNI Electrónico):</strong>
                  Se encuentra en el <strong>reverso (parte posterior)</strong> del documento, al lado del chip, identificado como "Ubigeo de nacimiento". Son 6 números juntos.
                </div>
              </div>
            )}

            {/* Pestaña 3: DNIe desde 2020 */}
            {dniTab === 'dnie_2020' && (
              <div className="space-y-3">
                <div className="rounded-2xl border-2 border-[#D3B9B9] overflow-hidden bg-slate-50 flex items-center justify-center p-2">
                  <img 
                    src="/images/dni/ubigeo_dnie_2020.png" 
                    alt="Ubicación del Ubigeo en DNI Electrónico desde 2020 según RENIEC" 
                    className="max-h-56 w-auto object-contain rounded-xl"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-[#fdf2f8] border border-[#d30684]/30 text-xs text-slate-700 leading-relaxed">
                  <strong className="text-[#d30684] block mb-1">Explicación oficial RENIEC (DNIe desde 2020):</strong>
                  En las versiones emitidas a partir de 2020, el ubigeo se ubica en el <strong>anverso (parte delantera)</strong>, en la parte inferior derecha, debajo de la fecha de nacimiento.
                </div>
              </div>
            )}

            <div className="pt-1 border-t border-[#D3B9B9]/60 flex justify-end">
              <button
                type="button"
                onClick={() => setShowUbigeoGuide(false)}
                className="w-full sm:w-auto py-2.5 px-6 rounded-xl bg-[#1a2527] hover:bg-black text-white font-bold text-xs shadow-sm cursor-pointer transition-colors"
              >
                Entendido, cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 2: POLÍTICA DE PROTECCIÓN Y ANONIMATO
          (Solo el primer texto en cuadro, los demás como texto limpio)
          ============================================================ */}
      {showPrivacyPolicy && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-[#D3B9B9] space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-[#D3B9B9] pb-3">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#d30684]" />
                <h3 className="font-heading font-bold text-lg text-[#1a2527]">
                  ¿Cómo protegemos tu tranquilidad y anonimato?
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPrivacyPolicy(false)}
                className="text-slate-400 hover:text-[#1a2527] p-1 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed max-h-[60vh] overflow-y-auto pr-1">
              {/* Único cuadro destacado según lo pedido */}
              <div className="p-3.5 bg-[#fdf2f8] rounded-2xl border border-[#d30684]/30 text-[#1a2527] font-medium leading-relaxed">
                <strong>Tu tranquilidad y seguridad son lo primero:</strong> Esta plataforma comunitaria está creada para que cualquier vecina o vecino pueda pedir mejoras en su calle con total confianza, sin trámites complicados y con la seguridad de que nadie sabrá quién hizo el reporte.
              </div>

              {/* Punto 1: Texto limpio sin cuadro */}
              <div className="space-y-1">
                <h4 className="font-bold text-[#1a2527] text-sm flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[#d30684] text-white text-xs flex items-center justify-center font-bold shrink-0">1</span>
                  <span>Tu nombre e identidad jamás serán publicados</span>
                </h4>
                <p className="text-slate-600 pl-7 text-xs sm:text-sm leading-relaxed">
                  El reporte es 100% anónimo. No te pediremos tu nombre, ni tus apellidos, ni la dirección de tu casa, ni fotos personales. Tu caso solo tendrá un número de ticket comunitario (por ejemplo: <code>#HV-SJL-048</code>) para que puedas seguir el avance sin exponerte ante nadie.
                </p>
              </div>

              {/* Punto 2: Texto limpio sin cuadro */}
              <div className="space-y-1">
                <h4 className="font-bold text-[#1a2527] text-sm flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[#d30684] text-white text-xs flex items-center justify-center font-bold shrink-0">2</span>
                  <span>¿Por qué se pide el DNI y el Ubigeo?</span>
                </h4>
                <p className="text-slate-600 pl-7 text-xs sm:text-sm leading-relaxed">
                  Se solicita únicamente como una medida de orden vecinal para asegurarnos de que los avisos provengan de personas reales del distrito. Esto evita que personas malintencionadas envíen bromas o reportes falsos repetidos que hagan perder tiempo y herramientas a las brigadas comunitarias de limpieza o reparación.
                </p>
              </div>

              {/* Punto 3: Texto limpio sin cuadro */}
              <div className="space-y-1">
                <h4 className="font-bold text-[#1a2527] text-sm flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[#d30684] text-white text-xs flex items-center justify-center font-bold shrink-0">3</span>
                  <span>Tu número de documento no se guarda en ninguna lista</span>
                </h4>
                <p className="text-slate-600 pl-7 text-xs sm:text-sm leading-relaxed">
                  Tu número de DNI nunca queda guardado en ningún padrón, archivo ni lista pública. El sistema solo lo procesa en el instante para confirmar que el reporte es único y auténtico, y luego queda descartado. Nadie puede revisar qué reportaste ni relacionarlo contigo.
                </p>
              </div>

              {/* Punto 4: Texto limpio sin cuadro */}
              <div className="space-y-1">
                <h4 className="font-bold text-[#1a2527] text-sm flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[#d30684] text-white text-xs flex items-center justify-center font-bold shrink-0">4</span>
                  <span>Cero cobros, cero compromisos y nadie te irá a buscar</span>
                </h4>
                <p className="text-slate-600 pl-7 text-xs sm:text-sm leading-relaxed">
                  Las jornadas barriales son una iniciativa solidaria entre vecinas y jóvenes voluntarios para reparar focos quemados, levantar basura acumulada o pintar parques. Nunca nadie te pedirá dinero, no hay cobros de ningún tipo, ni tampoco nadie irá a tocar la puerta de tu casa.
                </p>
              </div>

              {/* Punto 5: Texto limpio sin cuadro */}
              <div className="space-y-1">
                <h4 className="font-bold text-[#1a2527] text-sm flex items-center space-x-2">
                  <span className="w-5 h-5 rounded-full bg-[#d30684] text-white text-xs flex items-center justify-center font-bold shrink-0">5</span>
                  <span>Tu WhatsApp es completamente voluntario</span>
                </h4>
                <p className="text-slate-600 pl-7 text-xs sm:text-sm leading-relaxed">
                  Solo si tú deseas sumarte a la faena comunitaria y decides escribir tu celular en el último paso, las lideresas barriales te enviarán un mensaje cordial invitándote a participar. Si prefieres no dejar tu número, puedes enviar tu reporte igualmente y se atenderá con el mismo compromiso.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsPrivacyAccepted(true);
                setShowPrivacyPolicy(false);
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-[#d30684] hover:bg-[#bd0474] text-white font-bold text-sm shadow-md cursor-pointer transition-colors flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4 text-white" />
              <span>Entendido, continuar con mi reporte</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 3: EXPLICACIÓN DE UBICACIÓN
          ============================================================ */}
      {showLocationHelp && (
        <div className="fixed inset-0 z-[1000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-5 sm:p-7 shadow-2xl border-2 border-[#D3B9B9] space-y-4">
            <div className="flex items-center justify-between border-b border-[#D3B9B9] pb-3">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-[#d30684]" />
                <h3 className="font-heading font-bold text-lg text-[#1a2527]">
                  Uso seguro de la ubicación
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLocationHelp(false)}
                className="text-slate-400 hover:text-[#1a2527] p-1 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D3B9B9]/70 space-y-1">
                <strong className="text-[#1a2527] block">Verificación de presencia en el distrito:</strong>
                <p className="text-slate-600">
                  Pedimos permiso para asegurar que las alertas provengan de vecinas y vecinos de San Juan de Lurigancho.
                </p>
              </div>
              <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#D3B9B9]/70 space-y-1">
                <strong className="text-[#1a2527] block">Tu celular no es seguido ni rastreado:</strong>
                <p className="text-slate-600">
                  Solo se comprueba un único instante si la señal se encuentra en el distrito. No se almacena ningún dato de tu teléfono ni historial de movimientos.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowLocationHelp(false)}
              className="w-full py-3.5 px-4 rounded-xl bg-[#d30684] hover:bg-[#bd0474] text-white font-bold text-sm shadow-md cursor-pointer"
            >
              Comprendido, cerrar ventana
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
