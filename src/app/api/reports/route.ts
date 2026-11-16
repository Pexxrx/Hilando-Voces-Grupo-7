import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { 
  hashDniInMemory, 
  isValidDniFormat, 
  generateSecureTicketCode,
  sanitizeText 
} from '@/lib/hasher';
import { isPointInSJL } from '@/lib/geofencing';
import { analyzeReportWithGemini } from '@/lib/gemini';
import { ReportAxis } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      dni,
      axis,
      description,
      latitude,
      longitude,
      photo_before_url,
      photos,
      wants_to_coordinate,
      coordinator_whatsapp,
      reference,
      ubigeo,
    } = body;

    // 1. Ciberseguridad & Validación de DNI en memoria (Ley N° 29733)
    if (!dni || !isValidDniFormat(dni)) {
      return NextResponse.json(
        { error: 'El DNI debe tener 8 dígitos numéricos válidos.' },
        { status: 400 }
      );
    }

    // 2. Validación de Ubigeo (6 dígitos numéricos)
    if (!ubigeo || !/^\d{6}$/.test(ubigeo)) {
      return NextResponse.json(
        { error: 'El código de Ubigeo debe tener 6 dígitos numéricos.' },
        { status: 400 }
      );
    }

    // 3. Validación estricta de Coordenadas & Geofencing
    if (typeof latitude !== 'number' || typeof longitude !== 'number' || isNaN(latitude) || isNaN(longitude)) {
      return NextResponse.json(
        { error: 'Se requieren coordenadas de ubicación válidas para registrar el reporte.' },
        { status: 400 }
      );
    }

    if (!isPointInSJL(latitude, longitude)) {
      return NextResponse.json(
        { error: 'La ubicación seleccionada se encuentra fuera del área activa de atención comunitaria.' },
        { status: 400 }
      );
    }

    // 4. Validación de campos obligatorios y sanitización anti-XSS
    const validAxes: ReportAxis[] = ['alumbrado', 'microbasurales', 'espacios_recreativos'];
    if (!validAxes.includes(axis)) {
      return NextResponse.json(
        { error: 'Debe seleccionar una de las tres áreas válidas de atención comunitaria.' },
        { status: 400 }
      );
    }

    const cleanDescription = sanitizeText(description);
    if (!cleanDescription || cleanDescription.length < 10) {
      return NextResponse.json(
        { error: 'Por favor describe la problemática con al menos 10 caracteres.' },
        { status: 400 }
      );
    }
    if (cleanDescription.length > 1000) {
      return NextResponse.json(
        { error: 'La descripción excede el límite máximo de 1000 caracteres.' },
        { status: 400 }
      );
    }

    const cleanReference = sanitizeText(reference);
    if (!cleanReference || cleanReference.length < 5) {
      return NextResponse.json(
        { error: 'La referencia o dirección es obligatoria para ubicar el lugar (al menos 5 caracteres).' },
        { status: 400 }
      );
    }
    if (cleanReference.length > 250) {
      return NextResponse.json(
        { error: 'La referencia excede el límite máximo de 250 caracteres.' },
        { status: 400 }
      );
    }

    // Validación de WhatsApp si el vecino desea coordinar voluntariamente
    let cleanWhatsapp: string | null = null;
    if (wants_to_coordinate) {
      if (!coordinator_whatsapp || !/^\d{9}$/.test(coordinator_whatsapp.trim())) {
        return NextResponse.json(
          { error: 'Por favor ingresa un número telefónico válido de 9 dígitos.' },
          { status: 400 }
        );
      }
      cleanWhatsapp = coordinator_whatsapp.trim();
    }

    // 5. Ciberseguridad: Token Anti-Spam en Memoria (NUNCA guardar DNI)
    const antiSpamHash = hashDniInMemory(dni);

    // 6. Generar Código Único Criptográficamente Seguro (#HV-SJL-YYYYY)
    const ticketCode = generateSecureTicketCode();

    // 7. Análisis de Copiloto IA (Gemini 3.8 Flash con fallback heurístico)
    const aiAnalysis = await analyzeReportWithGemini(cleanDescription, axis);

    // 8. Inserción segura en Supabase con cliente administrativo
    const photoToSave = (Array.isArray(photos) && photos.length > 0 ? photos[0] : photo_before_url) || null;

    const { data, error } = await supabaseAdmin
      .from('reports')
      .insert({
        ticket_code: ticketCode,
        axis,
        description: cleanDescription,
        photo_before_url: photoToSave,
        latitude,
        longitude,
        ubigeo: ubigeo || '150132',
        reference: cleanReference,
        wants_to_coordinate: !!wants_to_coordinate,
        coordinator_whatsapp: cleanWhatsapp,
        anti_spam_hash: antiSpamHash,
        status: 'recibido',
        priority_level: aiAnalysis.priority,
        ai_summary: aiAnalysis.summary,
        ai_tags: aiAnalysis.tags,
      })
      .select()
      .single();

    if (error) {
      console.error('Error insertando en Supabase:', error);
      return NextResponse.json(
        { error: 'Ocurrió un error al registrar el reporte en la base de datos.' },
        { status: 500 }
      );
    }

    // 9. Retorno seguro al cliente (Cero fugas de DNI o hash)
    return NextResponse.json({
      success: true,
      ticket_code: data.ticket_code,
      status: data.status,
      created_at: data.created_at,
      axis: data.axis,
    });
  } catch (err: any) {
    console.error('Error en POST /api/reports:', err);
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar el reporte.' },
      { status: 500 }
    );
  }
}

/**
 * Consulta pública de reportes territoriales
 * CIBERSEGURIDAD: EXCLUYE coordinator_whatsapp y anti_spam_hash para evitar fugas de datos personales.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const axis = searchParams.get('axis');
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('reports')
      .select('id, ticket_code, axis, description, latitude, longitude, status, priority_level, created_at, resolved_at, photo_before_url, photo_after_url, ubigeo')
      .order('created_at', { ascending: false });

    if (axis) query = query.eq('axis', axis);
    if (status) query = query.eq('status', status);

    const { data, error } = await query;

    if (error) {
      console.error('Error obteniendo reportes:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ reports: data || [] });
  } catch (err: any) {
    return NextResponse.json({ error: 'Error interno al consultar reportes' }, { status: 500 });
  }
}
