import { NextResponse } from 'next/server';
import { getSupabase } from '@/storage/database/supabase-client';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const meridianId = parseInt(id, 10);
    if (isNaN(meridianId)) {
      return NextResponse.json({ success: false, error: '无效的经ID' }, { status: 400 });
    }

    const client = getSupabase();
    const { data, error } = await client
      .from('syndromes')
      .select('id, meridian_id, name, description, symptoms, tongue_presentation, pulse_presentation, pathogenesis, treatment_principle, sort_order')
      .eq('meridian_id', meridianId)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(`查询失败: ${error.message}`);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
