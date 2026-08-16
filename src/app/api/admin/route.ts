import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const password = searchParams.get('password');
    const name = searchParams.get('name');
    const sort = searchParams.get('sort') || 'desc';

    // 验证密码
    if (password !== '123456') {
      return NextResponse.json({ error: '密码错误' }, { status: 401 });
    }

    const supabase = getSupabaseClient();
    
    // 构建查询
    let query = supabase
      .from('diagnosis_records')
      .select('*');

    // 按姓名搜索
    if (name) {
      query = query.ilike('name', `%${name}%`);
    }

    // 排序
    query = query.order('created_at', { ascending: sort === 'asc' });

    const { data, error } = await query;

    if (error) {
      console.error('查询记录失败:', error);
      return NextResponse.json({ error: '查询失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('获取记录失败:', error);
    return NextResponse.json({ error: '获取记录失败' }, { status: 500 });
  }
}
