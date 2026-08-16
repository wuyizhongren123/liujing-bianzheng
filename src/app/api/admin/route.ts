import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

function verifyPassword(request: NextRequest): boolean {
  const { searchParams } = new URL(request.url);
  return searchParams.get('password') === '123456';
}

export async function GET(request: NextRequest) {
  try {
    if (!verifyPassword(request)) {
      return NextResponse.json({ error: '密码错误' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const sort = searchParams.get('sort') || 'desc';

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

export async function DELETE(request: NextRequest) {
  try {
    if (!verifyPassword(request)) {
      return NextResponse.json({ success: false, error: '密码错误' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ids = searchParams.get('ids'); // 逗号分隔的 id 列表，或 "all" 表示全部清除
    const supabase = getSupabaseClient();

    if (ids === 'all') {
      const { error } = await supabase.from('diagnosis_records').delete().neq('id', 0);
      if (error) {
        console.error('清除全部记录失败:', error);
        return NextResponse.json({ success: false, error: '清除失败' }, { status: 500 });
      }
      return NextResponse.json({ success: true, message: '已清除全部记录' });
    }

    if (!ids) {
      return NextResponse.json({ success: false, error: '未指定要删除的记录' }, { status: 400 });
    }

    const idList = ids.split(',').map(id => Number(id.trim())).filter(id => !isNaN(id));
    if (idList.length === 0) {
      return NextResponse.json({ success: false, error: '无有效记录ID' }, { status: 400 });
    }

    const { error } = await supabase.from('diagnosis_records').delete().in('id', idList);
    if (error) {
      console.error('删除记录失败:', error);
      return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `已删除 ${idList.length} 条记录` });
  } catch (error) {
    console.error('删除记录失败:', error);
    return NextResponse.json({ success: false, error: '删除失败' }, { status: 500 });
  }
}
