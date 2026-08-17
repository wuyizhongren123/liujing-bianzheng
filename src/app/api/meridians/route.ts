import { NextResponse } from 'next/server';
import { getSupabase } from '@/storage/database/supabase-client';

export async function GET() {
  try {
    const client = getSupabase();
    const { data, error } = await client
      .from('six_meridians')
      .select('id, name, description, pathogenesis, main_symptoms, sort_order')
      .order('sort_order', { ascending: true });

    if (error) throw new Error(`查询失败: ${error.message}`);

    return NextResponse.json({ success: true, data });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
