import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseClient';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { status, priority_level, photo_after_url } = body;

    const updates: any = {};
    if (status) updates.status = status;
    if (priority_level) updates.priority_level = priority_level;
    if (photo_after_url) updates.photo_after_url = photo_after_url;
    if (status === 'resuelto') {
      updates.resolved_at = new Date().toISOString();
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
