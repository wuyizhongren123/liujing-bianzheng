import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface UserInfo {
  name: string;
  age: number;
  weight: number;
}

interface Answers {
  q1_cold: boolean | null;
  q1_fever: boolean | null;
  q1_alternating: boolean | null;
  q1_sweat: '有汗' | '无汗' | '未发热' | null;
  q2_spontaneous: boolean | null;
  q2_night: boolean | null;
  q2_location: string | null;
  q3_headache: boolean | null;
  q3_head_location: string | null;
  q3_body_pain: boolean | null;
  q3_body_location: string | null;
  q3_heavy: boolean | null;
  q4_stool: string | null;
  q4_urine: string | null;
  q5_appetite: string | null;
  q5_nausea: boolean | null;
  q6_chest_tight: boolean | null;
  q6_chest_pain: boolean | null;
  q6_hypochondrium: boolean | null;
  q6_palpitation: boolean | null;
  q7_tinnitus: boolean | null;
  q7_hearing: boolean | null;
  q8_thirsty: boolean | null;
  q8_thirst_level: string | null;
  q8_drink_pref: string | null;
  q8_taste: string | null;
  q9_chronic: boolean | null;
  q9_chronic_desc: string;
  q9_medicine: boolean | null;
  q9_medicine_desc: string;
  q9_skin: boolean | null;
  q9_skin_desc: string;
  q9_pain: boolean | null;
  q9_pain_desc: string;
  q10_duration: string | null;
  q10_cause: string | null;
}

interface DiagnosisResult {
  meridian: string;
  meridianFull: string;
  syndrome: string;
  prescription: string;
  composition: string;
  dosage: string;
  preparation: string;
  usage: string;
  effects: string;
  indications: string;
  contraindications: string;
  notes: string;
  interception: {
    type: '少阳枢' | '少阴枢' | null;
    reason: string;
    combinedPrescription: string;
  };
  dietaryAdvice: string[];
  lifestyleAdvice: string[];
}

// 六经辨证逻辑
function analyzeMeridian(answers: Answers): { meridian: string; syndrome: string; confidence: number } {
  let scores: Record<string, number> = {
    '太阳病': 0,
    '阳明病': 0,
    '少阳病': 0,
    '太阴病': 0,
    '少阴病': 0,
    '厥阴病': 0,
  };

  // 太阳病评分
  if (answers.q1_cold && answers.q1_fever) scores['太阳病'] += 3;
  if (answers.q3_headache && answers.q3_head_location === '后脑') scores['太阳病'] += 2;
  if (answers.q3_body_pain) scores['太阳病'] += 2;
  if (answers.q1_sweat === '无汗') scores['太阳病'] += 1;
  if (answers.q1_sweat === '有汗') scores['太阳病'] += 1;

  // 阳明病评分
  if (answers.q1_fever && !answers.q1_cold) scores['阳明病'] += 3;
  if (answers.q2_spontaneous) scores['阳明病'] += 2;
  if (answers.q8_thirsty && answers.q8_thirst_level === '大渴引饮') scores['阳明病'] += 3;
  if (answers.q4_stool === '便秘') scores['阳明病'] += 2;
  if (answers.q8_taste === '口苦') scores['阳明病'] += 1;

  // 少阳病评分
  if (answers.q1_alternating) scores['少阳病'] += 4;
  if (answers.q6_hypochondrium) scores['少阳病'] += 3;
  if (answers.q8_taste === '口苦') scores['少阳病'] += 2;
  if (answers.q5_appetite === '食欲减退' || answers.q5_appetite === '不想吃东西') scores['少阳病'] += 2;
  if (answers.q5_nausea) scores['少阳病'] += 2;

  // 太阴病评分
  if (answers.q4_stool === '腹泻' || answers.q4_stool === '稀溏') scores['太阴病'] += 3;
  if (answers.q5_appetite === '食欲减退' || answers.q5_appetite === '不想吃东西') scores['太阴病'] += 2;
  if (answers.q5_nausea) scores['太阴病'] += 1;
  if (!answers.q8_thirsty) scores['太阴病'] += 1;

  // 少阴病评分
  if (answers.q3_heavy) scores['少阴病'] += 3;
  if (answers.q4_urine === '尿清长') scores['少阴病'] += 2;
  if (answers.q4_stool === '腹泻') scores['少阴病'] += 1;
  if (answers.q1_cold && !answers.q1_fever) scores['少阴病'] += 2;

  // 厥阴病评分
  if (answers.q8_thirsty && answers.q8_thirst_level === '大渴引饮') scores['厥阴病'] += 2;
  if (answers.q6_hypochondrium) scores['厥阴病'] += 2;
  if (answers.q5_appetite === '不想吃东西') scores['厥阴病'] += 1;
  if (answers.q6_chest_tight) scores['厥阴病'] += 1;

  // 找到最高分的经
  const maxScore = Math.max(...Object.values(scores));
  const meridian = Object.entries(scores).find(([, score]) => score === maxScore)?.[0] || '太阳病';

  // 确定证型
  let syndrome = '';
  if (meridian === '太阳病') {
    syndrome = answers.q1_sweat === '无汗' ? '太阳伤寒证' : '太阳中风证';
  } else if (meridian === '阳明病') {
    syndrome = answers.q4_stool === '便秘' ? '阳明腑证' : '阳明经证';
  } else if (meridian === '少阳病') {
    syndrome = '少阳本证';
  } else if (meridian === '太阴病') {
    syndrome = '太阴虚寒证';
  } else if (meridian === '少阴病') {
    syndrome = '少阴寒化证';
  } else if (meridian === '厥阴病') {
    syndrome = '厥阴寒热错杂证';
  }

  return { meridian, syndrome, confidence: maxScore };
}

// 开合枢截断逻辑
function checkInterception(answers: Answers): { type: '少阳枢' | '少阴枢' | null; reason: string } {
  // 检查少阳枢机不利
  const shaoyangSigns = [
    answers.q8_taste === '口苦',
    answers.q6_hypochondrium,
    answers.q1_alternating,
  ].filter(Boolean).length;

  // 检查少阴枢机不利
  const shaoyinSigns = [
    answers.q3_heavy,
    answers.q4_urine === '尿清长',
    answers.q1_cold && !answers.q1_fever,
  ].filter(Boolean).length;

  // 西药史阳性
  const hasWesternMedicine = answers.q9_medicine === true;

  if (shaoyangSigns >= 2 || hasWesternMedicine) {
    return {
      type: '少阳枢',
      reason: hasWesternMedicine ? '正在服用西药，合小柴胡汤调和枢机' : '见少阳枢机不利之象（口苦、胸胁满、寒热往来）',
    };
  }

  if (shaoyinSigns >= 2) {
    return {
      type: '少阴枢',
      reason: '见少阴枢机不利之象（困倦、四肢冷、小便清长）',
    };
  }

  return { type: null, reason: '' };
}

// 获取方剂信息
function getPrescription(meridian: string, syndrome: string): {
  prescription: string;
  composition: string;
  dosage: string;
  preparation: string;
  usage: string;
  effects: string;
  indications: string;
  contraindications: string;
  notes: string;
} {
  const prescriptions: Record<string, {
    prescription: string;
    composition: string;
    dosage: string;
    preparation: string;
    usage: string;
    effects: string;
    indications: string;
    contraindications: string;
    notes: string;
  }> = {
    '太阳中风证': {
      prescription: '桂枝汤',
      composition: '桂枝、芍药、甘草、生姜、大枣',
      dosage: '桂枝9g，芍药9g，甘草6g，生姜9g，大枣4枚',
      preparation: '水煎服',
      usage: '温服，取微汗',
      effects: '解肌发表，调和营卫',
      indications: '太阳中风证，发热汗出，恶风脉浮缓',
      contraindications: '表实无汗者禁用',
      notes: '服后宜啜热粥以助药力',
    },
    '太阳伤寒证': {
      prescription: '麻黄汤',
      composition: '麻黄、桂枝、杏仁、甘草',
      dosage: '麻黄9g，桂枝6g，杏仁9g，甘草3g',
      preparation: '水煎服',
      usage: '温服，覆取微汗',
      effects: '发汗解表，宣肺平喘',
      indications: '太阳伤寒证，恶寒发热，无汗而喘',
      contraindications: '表虚自汗、体虚者慎用',
      notes: '中病即止，不可过服',
    },
    '阳明经证': {
      prescription: '白虎汤',
      composition: '石膏、知母、甘草、粳米',
      dosage: '石膏50g，知母18g，甘草6g，粳米18g',
      preparation: '水煎，米熟汤成',
      usage: '温服',
      effects: '清热生津',
      indications: '阳明经证，大热大渴大汗脉洪大',
      contraindications: '表证未解者禁用',
      notes: '石膏先煎',
    },
    '阳明腑证': {
      prescription: '大承气汤',
      composition: '大黄、厚朴、枳实、芒硝',
      dosage: '大黄12g，厚朴24g，枳实12g，芒硝9g',
      preparation: '水煎，芒硝溶服',
      usage: '分二次温服，得下止后服',
      effects: '峻下热结',
      indications: '阳明腑实证，潮热谵语，腹满痛便秘',
      contraindications: '表证未解、阴虚者禁用',
      notes: '急下存阴之方',
    },
    '少阳本证': {
      prescription: '小柴胡汤',
      composition: '柴胡、黄芩、人参、半夏、甘草、生姜、大枣',
      dosage: '柴胡24g，黄芩9g，人参9g，半夏12g，甘草9g，生姜9g，大枣4枚',
      preparation: '水煎服',
      usage: '去滓再煎，温服',
      effects: '和解少阳',
      indications: '少阳证，寒热往来，胸胁苦满，默默不欲饮食',
      contraindications: '阴虚血少者慎用',
      notes: '和解剂之代表方',
    },
    '太阴虚寒证': {
      prescription: '理中丸',
      composition: '人参、干姜、甘草、白术',
      dosage: '人参、干姜、甘草、白术各9g',
      preparation: '研末蜜丸或水煎服',
      usage: '丸剂日三四次，汤剂分二次温服',
      effects: '温中健脾，散寒除湿',
      indications: '太阴虚寒证，腹满吐利',
      contraindications: '实热积滞者禁用',
      notes: '温补太阴之主方',
    },
    '少阴寒化证': {
      prescription: '四逆汤',
      composition: '附子、干姜、甘草',
      dosage: '附子15g（先煎），干姜9g，甘草6g',
      preparation: '水煎服',
      usage: '温服',
      effects: '回阳救逆',
      indications: '少阴寒化证，四肢厥逆，脉微欲绝',
      contraindications: '热厥、阴虚者禁用',
      notes: '回阳救逆第一方，附子必须先煎',
    },
    '厥阴寒热错杂证': {
      prescription: '乌梅丸',
      composition: '乌梅、细辛、干姜、黄连、当归、附子、蜀椒、桂枝、人参、黄柏',
      dosage: '乌梅30g，细辛3g，干姜9g，黄连16g，当归4g，附子6g（先煎），蜀椒4g，桂枝6g，人参6g，黄柏6g',
      preparation: '蜜丸或水煎服',
      usage: '日三服',
      effects: '清上温下，寒热并调',
      indications: '厥阴寒热错杂证',
      contraindications: '纯热无寒或纯寒无热者不宜',
      notes: '厥阴病主方',
    },
  };

  return prescriptions[syndrome] || prescriptions['少阳本证'];
}

// 年龄体重调整药量
function adjustDosage(dosage: string, age: number, weight: number): string {
  let adjusted = dosage;
  
  // 儿童（<12岁）：药量减半
  if (age < 12) {
    adjusted = adjusted.replace(/(\d+)g/g, (match, num) => {
      const adjusted_num = Math.round(parseInt(num) / 2);
      return `${adjusted_num}g`;
    });
    return adjusted + '（儿童用量减半）';
  }
  
  // 老人（>65岁）：药量酌减1/3
  if (age > 65) {
    adjusted = adjusted.replace(/(\d+)g/g, (match, num) => {
      const adjusted_num = Math.round(parseInt(num) * 2 / 3);
      return `${adjusted_num}g`;
    });
    return adjusted + '（老人用量酌减）';
  }
  
  // 体重<50kg：药量酌减
  if (weight < 50) {
    adjusted = adjusted.replace(/(\d+)g/g, (match, num) => {
      const adjusted_num = Math.round(parseInt(num) * 0.75);
      return `${adjusted_num}g`;
    });
    return adjusted + '（体重较轻，用量酌减）';
  }
  
  // 体重>80kg：药量酌增
  if (weight > 80) {
    adjusted = adjusted.replace(/(\d+)g/g, (match, num) => {
      const adjusted_num = Math.round(parseInt(num) * 1.25);
      return `${adjusted_num}g`;
    });
    return adjusted + '（体重较重，用量酌增）';
  }
  
  return adjusted;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, age, weight, answers } = body as {
      name: string;
      age: number;
      weight: number;
      answers: Answers;
    };

    if (!name || !age || !weight || !answers) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 辨证分析
    const { meridian, syndrome } = analyzeMeridian(answers);
    
    // 开合枢截断检查
    const interception = checkInterception(answers);
    
    // 获取方剂
    const prescriptionInfo = getPrescription(meridian, syndrome);
    
    // 调整药量
    const adjustedDosage = adjustDosage(prescriptionInfo.dosage, age, weight);

    // 构建结果
    const result: DiagnosisResult = {
      meridian,
      meridianFull: meridian,
      syndrome,
      prescription: prescriptionInfo.prescription,
      composition: prescriptionInfo.composition,
      dosage: adjustedDosage,
      preparation: prescriptionInfo.preparation,
      usage: prescriptionInfo.usage,
      effects: prescriptionInfo.effects,
      indications: prescriptionInfo.indications,
      contraindications: prescriptionInfo.contraindications,
      notes: prescriptionInfo.notes,
      interception: {
        type: interception.type,
        reason: interception.reason,
        combinedPrescription: interception.type === '少阳枢' ? '小柴胡汤' : '四逆汤',
      },
      dietaryAdvice: [
        '饮食宜清淡易消化',
        '忌生冷、油腻、辛辣之物',
        '多饮温水，少食多餐',
      ],
      lifestyleAdvice: [
        '注意休息，避免劳累',
        '保持心情舒畅',
        '适当运动，增强体质',
        '遵医嘱服药，如有不适及时就医',
      ],
    };

    // 保存到数据库
    const supabase = getSupabaseClient();
    const { error } = await supabase
      .from('diagnosis_records')
      .insert({
        name,
        age,
        weight,
        prescription: prescriptionInfo.prescription,
        meridian,
        answers: JSON.stringify(answers),
      });

    if (error) {
      console.error('保存记录失败:', error);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('辨证失败:', error);
    return NextResponse.json({ error: '辨证失败' }, { status: 500 });
  }
}
