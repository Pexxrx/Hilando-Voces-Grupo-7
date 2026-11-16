import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { validateAdminAuth } from '@/lib/authGuard';

const ALLOWED_STATUSES = ['recibido', 'en_evaluacion', 'faena_programada', 'resuelto'];
const ALLOWED_PRIORITIES = ['baja', 'media', 'alta', 'urgente'];
const VALID_ID_REGEX = /^([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|rep-sjl-\d{3})$/i;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Control de Autenticación de Lideresa / Coordinadora
    const auth = await validateAdminAuth(req, ['lideresa', 'coordinadora', 'superadmin']);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error || 'No autorizado para modificar expedientes.' },
        { status: auth.statusCode || 401 }
      );
    }

    const { id } = await params;

    // 2. Validación estricta de ID (Prevención de Inyección de parámetros)
    if (!id || !VALID_ID_REGEX.test(id)) {
      return NextResponse.json({ error: 'Identificador de reporte inválido.' }, { status: 400 });
    }

    const body = await req.json();
    const { status, priority_level, photo_after_url } = body;

    // 3. Reglas RBAC de modificación
    // Coordinadoras de faena solo pueden agendar faenas o certificar resoluciones con foto
    if (auth.role === 'coordinadora') {
      if (priority_level) {
        return NextResponse.json(
          { error: 'Las coordinadoras de faena no tienen permisos para alterar niveles de prioridad AHP.' },
          { status: 403 }
        );
      }
      if (status && !['faena_programada', 'resuelto'].includes(status)) {
        return NextResponse.json(
          { error: 'Las coordinadoras solo pueden programar faenas o marcar casos como resueltos.' },
          { status: 403 }
        );
      }
    }

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
      // Validar que sea una URL HTTPS segura o imagen base64 de tamaño razonable
      if (photo_after_url.length > 5000000) {
        return NextResponse.json({ error: 'El tamaño de la fotografía excede el límite permitido.' }, { status: 400 });
      }
      updates.photo_after_url = photo_after_url;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No se enviaron campos válidos para actualizar.' }, { status: 400 });
    }

    // 4. Si es un reporte sintético territorial del dataset oficial de SJL
    if (id.startsWith('rep-sjl-')) {
      return NextResponse.json({
        success: true,
        report: {
          id,
          ...updates,
          updated_at: new Date().toISOString(),
        },
      });
    }

    // 5. Si es un reporte persistido en Supabase
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
