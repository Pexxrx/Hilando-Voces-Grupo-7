import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { MOCK_REPORTS_25, ExtendedReport } from '@/data/mockReports';
import { validateAdminAuth, sanitizeReportData } from '@/lib/authGuard';

/**
 * Endpoint administrativo para líderes de San Juan de Lurigancho
 * Provee la lista de 25 reportes territoriales enriquecidos con datos de coordinación de campo,
 * resúmenes del Copiloto Gemini y datos de voluntariado vecinal (Ley N° 29733).
 * 
 * AUDITORÍA DE CIBERSEGURIDAD:
 * - Valida autenticación y rol de lideresa comunitaria antes de entregar datos.
 * - Sanitiza y suprime hashes criptográficos (anti_spam_hash).
 * - Protege los números telefónicos bajo la Ley N° 29733 de Protección de Datos Personales.
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Control de Acceso y Autenticación RBAC (Incluye los 3 perfiles oficiales)
    const auth = await validateAdminAuth(req, ['lideresa', 'coordinadora', 'supervisora', 'superadmin']);
    if (!auth.authenticated) {
      return NextResponse.json(
        { error: auth.error || 'Acceso no autorizado al Centro de Mando.' },
        { status: auth.statusCode || 401 }
      );
    }

    const url = new URL(req.url);
    const axis = url.searchParams.get('axis');
    const status = url.searchParams.get('status');

    let dbReports: any[] = [];
    try {
      let query = supabaseAdmin
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (axis && axis !== 'todos') query = query.eq('axis', axis);
      if (status && status !== 'todos') query = query.eq('status', status);

      // Respaldo de tiempo de espera: máximo 2.5s para no bloquear la experiencia de usuario
      const timeoutPromise = new Promise<{ data: null; error: any }>((_, reject) =>
        setTimeout(() => reject(new Error('Supabase query timeout')), 2500)
      );

      const result: any = await Promise.race([query, timeoutPromise]);
      if (result && !result.error && Array.isArray(result.data) && result.data.length > 0) {
        dbReports = result.data;
      }
    } catch (dbErr) {
      console.warn('Consulta a Supabase omitida por timeout o no disponibilidad:', dbErr);
    }

    // Dataset oficial: Únicamente reportes reales registrados
    const combinedReports: ExtendedReport[] = [...dbReports];

    // Aplicar filtros en memoria si vienen parámetros
    let filtered = combinedReports;
    if (axis && axis !== 'todos') {
      filtered = filtered.filter((r) => r.axis === axis);
    }
    if (status && status !== 'todos') {
      filtered = filtered.filter((r) => r.status === status);
    }

    // Sanitizar reportes (eliminación de hashes internos y protección Ley N° 29733)
    const sanitizedReports = filtered.map((r) => sanitizeReportData(r, auth.role));

    return NextResponse.json({
      success: true,
      total: sanitizedReports.length,
      reports: sanitizedReports,
      userRole: auth.role,
    });
  } catch (err: any) {
    if (err?.digest?.startsWith('NEXT_')) {
      throw err;
    }
    console.error('Error en GET /api/admin/reports:', err);
    return NextResponse.json(
      { error: 'Error interno del servidor al procesar reportes administrativos.' },
      { status: 500 }
    );
  }
}
