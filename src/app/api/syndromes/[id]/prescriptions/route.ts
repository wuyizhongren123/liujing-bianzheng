import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const syndromeId = parseInt(id, 10);
    if (isNaN(syndromeId)) {
      return NextResponse.json({ success: false, error: '无效的证型ID' }, { status: 400 });
    }

    const client = getSupabaseClient();
    const { data, error } = await client
      .from('prescriptions')
      .select('id, syndrome_id, name, composition, dosage, preparation, usage, effects, indications, contraindications, notes, sort_order')
      .eq('syndrome_id', syndromeId)
      .order('sort_order', { ascending: true });

    if (error) throw new Error(`查询失败: ${error.message}`);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
