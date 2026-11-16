import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { hashDniInMemory, isValidDniFormat } from '@/lib/hasher';
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

    // 1. Ciberseguridad & Validación de DNI en memoria
    if (!dni || !isValidDniFormat(dni)) {
      return NextResponse.json(
        { error: 'El DNI debe tener 8 dígitos numéricos válidos.' },
        { status: 400 }
      );
    }

    // 2. Validación de Ubigeo (6 dígitos)
    if (!ubigeo || !/^\d{6}$/.test(ubigeo)) {
      return NextResponse.json(
        { error: 'El código de Ubigeo debe tener 6 dígitos numéricos.' },
        { status: 400 }
      );
    }

    // 3. Validación de Geofencing (SJL obligatorio)
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Se requiere geolocalización GPS activa para registrar el reporte.' },
        { status: 400 }
      );
    }

    if (!isPointInSJL(latitude, longitude)) {
      return NextResponse.json(
        { error: 'La ubicación detectada no se encuentra dentro del territorio de San Juan de Lurigancho.' },
        { status: 400 }
      );
    }

    // 4. Validación de campos obligatorios
    const validAxes: ReportAxis[] = ['alumbrado', 'microbasurales', 'espacios_recreativos'];
    if (!validAxes.includes(axis)) {
      return NextResponse.json(
        { error: 'Debe seleccionar uno de los tres ejes válidos de acción comunitaria.' },
        { status: 400 }
      );
    }

    if (!description || description.trim().length < 10) {
      return NextResponse.json(
        { error: 'Por favor describe la problemática con al menos 10 caracteres.' },
        { status: 400 }
      );
    }

    if (!reference || reference.trim().length < 5) {
      return NextResponse.json(
        { error: 'La referencia o dirección es obligatoria para ubicar el lugar (al menos 5 caracteres).' },
        { status: 400 }
      );
    }

    // 5. Ciberseguridad: Token Anti-Spam en Memoria (NUNCA guardar DNI)
    const antiSpamHash = hashDniInMemory(dni);

    // 6. Generar Código Único de Ticket (ej: #HV-SJL-048)
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const ticketCode = `#HV-SJL-${randomSuffix}`;

    // 7. Análisis de Copiloto IA (Gemini 3.8 Flash)
    const aiAnalysis = await analyzeReportWithGemini(description.trim(), axis);

    // 8. Inserción segura en Supabase con cliente administrativo
    const { data, error } = await supabaseAdmin
      .from('reports')
      .insert({
        ticket_code: ticketCode,
        axis,
        description: description.trim(),
        photo_before_url: (Array.isArray(photos) && photos.length > 0 ? photos[0] : photo_before_url) || null,
        latitude,
        longitude,
        ubigeo: ubigeo || '150132',
        reference: reference ? reference.trim() : null,
        wants_to_coordinate: !!wants_to_coordinate,
        coordinator_whatsapp: wants_to_coordinate && coordinator_whatsapp ? coordinator_whatsapp.trim() : null,
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

    // 9. Retorno seguro al cliente (sin ningún rastro del DNI)
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const axis = searchParams.get('axis');
    const status = searchParams.get('status');

    let query = supabaseAdmin
      .from('reports')
      .select('*')
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
