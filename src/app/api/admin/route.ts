import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

const supabase = getSupabaseClient();

// 获取诊断记录
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get('password');
  const name = searchParams.get('name');

  // 验证密码
  if (password !== '123456') {
    return NextResponse.json({ error: '密码错误' }, { status: 401 });
  }

  let query = supabase.from('diagnosis_records').select('*');

  // 按姓名搜索
  if (name) {
    query = query.ilike('name', `%${name}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error('查询诊断记录失败:', error);
    return NextResponse.json({ error: '查询失败' }, { status: 500 });
  }

  return NextResponse.json({ success: true, data: data || [] }, {
    headers: {
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    }
  });
}

// 删除诊断记录
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const password = searchParams.get('password');
  const ids = searchParams.get('ids');

  // 验证密码
  if (password !== '123456') {
    return NextResponse.json({ error: '密码错误' }, { status: 401 });
  }

  if (!ids) {
    return NextResponse.json({ error: '缺少参数' }, { status: 400 });
  }

  let error;

  if (ids === 'all') {
    // 删除所有记录
    const result = await supabase.from('diagnosis_records').delete().neq('id', 0);
    error = result.error;
  } else {
    // 删除指定记录
    const idList = ids.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
    const result = await supabase.from('diagnosis_records').delete().in('id', idList);
    error = result.error;
  }

  if (error) {
    console.error('删除诊断记录失败:', error);
    return NextResponse.json({ error: '删除失败' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
