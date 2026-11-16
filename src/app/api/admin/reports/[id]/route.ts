import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

const ALLOWED_STATUSES = ['recibido', 'en_evaluacion', 'faena_programada', 'resuelto'];
const ALLOWED_PRIORITIES = ['baja', 'media', 'alta', 'urgente'];
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validación estricta de ID
    if (!id || !UUID_REGEX.test(id)) {
      return NextResponse.json({ error: 'Identificador de reporte inválido.' }, { status: 400 });
    }

    const body = await req.json();
    const { status, priority_level, photo_after_url } = body;

    const updates: Record<string, any> = {};

    if (status) {
      if (!ALLOWED_STATUSES.includes(status)) {
        return NextResponse.json({ error: 'Estado de caso no válido.' }, { status: 400 });
      }
      updates.status = status;
      if (status === 'resuelto') {
        updates.resolved_at = new Date().toISOString();
      }
    }

    if (priority_level) {
      if (!ALLOWED_PRIORITIES.includes(priority_level)) {
        return NextResponse.json({ error: 'Nivel de prioridad no válido.' }, { status: 400 });
      }
      updates.priority_level = priority_level;
    }

    if (photo_after_url && typeof photo_after_url === 'string') {
      updates.photo_after_url = photo_after_url;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No se enviaron campos válidos para actualizar.' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('reports')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, report: data });
  } catch (err: any) {
    return NextResponse.json({ error: 'Error interno al actualizar el reporte' }, { status: 500 });
  }
}
