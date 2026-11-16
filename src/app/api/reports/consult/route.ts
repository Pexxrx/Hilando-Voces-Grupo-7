import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { hashDniInMemory, isValidDniFormat } from '@/lib/hasher';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticket_code, dni } = body;

    // Caso 1: Búsqueda directa por código de ticket
    if (ticket_code && typeof ticket_code === 'string') {
      const cleanCode = ticket_code.trim().toUpperCase();
      const { data, error } = await supabaseAdmin
        .from('reports')
        .select('ticket_code, axis, description, status, priority_level, created_at, resolved_at, photo_before_url, photo_after_url, ubigeo')
        .eq('ticket_code', cleanCode)
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      if (!data) {
        return NextResponse.json({ error: 'No se encontró ningún reporte con este código.' }, { status: 404 });
      }

      return NextResponse.json({ report: data });
    }

    // Caso 2: Recuperación segura por DNI ("¿Olvidaste tu código?")
    if (dni && typeof dni === 'string') {
      if (!isValidDniFormat(dni)) {
        return NextResponse.json({ error: 'El DNI debe tener 8 dígitos numéricos válidos.' }, { status: 400 });
      }

      // Hash en memoria volátil (Ley 29733: DNI se descarta al instante)
      const antiSpamHash = hashDniInMemory(dni);

      const { data, error } = await supabaseAdmin
        .from('reports')
        .select('ticket_code, axis, description, status, priority_level, created_at, resolved_at, photo_before_url, photo_after_url, ubigeo')
        .eq('anti_spam_hash', antiSpamHash)
        .order('created_at', { ascending: false });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ reports: data || [] });
    }

    return NextResponse.json(
      { error: 'Debe ingresar un código de ticket o un número de DNI para la consulta.' },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json({ error: 'Error interno en la consulta.' }, { status: 500 });
  }
}
