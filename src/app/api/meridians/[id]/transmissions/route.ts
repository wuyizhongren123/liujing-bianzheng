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
    
    // 获取传变关系
    const { data: transmissions, error: transError } = await client
      .from('meridian_transmissions')
      .select(`
        id,
        source_meridian_id,
        target_meridian_id,
        transmission_type,
        warning_symptoms,
        interception_principle,
        interception_method,
        herb_additions,
        combined_prescription,
        combined_prescription_desc,
        purpose,
        sort_order
      `)
      .eq('source_meridian_id', meridianId)
      .order('sort_order', { ascending: true });

    if (transError) throw new Error(`查询传变关系失败: ${transError.message}`);

    // 获取目标经的名称
    if (transmissions && transmissions.length > 0) {
      const targetIds = [...new Set(transmissions.map(t => t.target_meridian_id))];
      const { data: targetMeridians, error: meridianError } = await client
        .from('six_meridians')
        .select('id, name')
        .in('id', targetIds);

      if (meridianError) throw new Error(`查询目标经失败: ${meridianError.message}`);

      const meridianMap = new Map(targetMeridians?.map(m => [m.id, m.name]) || []);
      
      // 附加目标经名称
      const enrichedTransmissions = transmissions.map(t => ({
        ...t,
        target_meridian_name: meridianMap.get(t.target_meridian_id) || '',
      }));

      // 获取截断方剂
      const transmissionIds = transmissions.map(t => t.id);
      const { data: interceptionPrescriptions, error: prescError } = await client
        .from('interception_prescriptions')
        .select(`
          id,
          transmission_id,
          syndrome_id,
          name,
          base_prescription,
          additional_herbs,
          composition,
          effects,
          indications,
          usage_notes,
          interception_purpose,
          sort_order
        `)
        .in('transmission_id', transmissionIds)
        .order('sort_order', { ascending: true });

      if (prescError) throw new Error(`查询截断方剂失败: ${prescError.message}`);

      // 按传变ID分组方剂
      const prescriptionsByTransmission = new Map<number, typeof interceptionPrescriptions>();
      interceptionPrescriptions?.forEach(p => {
        const existing = prescriptionsByTransmission.get(p.transmission_id) || [];
        existing.push(p);
        prescriptionsByTransmission.set(p.transmission_id, existing);
      });

      // 组装最终结果
      const result = enrichedTransmissions.map(t => ({
        ...t,
        interception_prescriptions: prescriptionsByTransmission.get(t.id) || [],
      }));

      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json({ success: true, data: [] });
  } catch (err) {
    const message = err instanceof Error ? err.message : '查询失败';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
