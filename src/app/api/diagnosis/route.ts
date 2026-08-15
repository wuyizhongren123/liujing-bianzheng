import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// 十问回答接口
interface Answers {
  // 第一问·寒热
  q1_cold: boolean | null; // 恶寒
  q1_fever: boolean | null; // 发热
  q1_alternating: boolean | null; // 寒热往来
  q1_sweat: '有汗' | '无汗' | '未发热' | null; // 出汗情况
  
  // 第二问·汗
  q2_spontaneous: boolean | null; // 自汗
  q2_night: boolean | null; // 盗汗
  q2_location: string | null; // 出汗部位
  
  // 第三问·头身
  q3_headache: boolean | null; // 头痛
  q3_head_location: string | null; // 头痛部位
  q3_body_pain: boolean | null; // 身痛
  q3_body_location: string | null; // 身痛部位
  q3_heavy: boolean | null; // 沉重困倦
  
  // 第四问·便
  q4_stool: string | null; // 大便情况
  q4_urine: string | null; // 小便情况
  
  // 第五问·饮食
  q5_appetite: string | null; // 食欲
  q5_nausea: boolean | null; // 恶心呕吐
  
  // 第六问·胸
  q6_chest_tight: boolean | null; // 胸闷
  q6_chest_pain: boolean | null; // 胸痛
  q6_hypochondrium: boolean | null; // 胸胁胀满
  q6_palpitation: boolean | null; // 心悸
  
  // 第七问·聋
  q7_tinnitus: boolean | null; // 耳鸣
  q7_hearing: boolean | null; // 听力下降
  
  // 第八问·渴
  q8_thirsty: boolean | null; // 口渴
  q8_thirst_level: string | null; // 口渴程度
  q8_drink_pref: string | null; // 喜冷喜热
  q8_taste: string | null; // 口味
  
  // 第九问·旧病
  q9_chronic: boolean | null;
  q9_chronic_desc: string;
  q9_medicine: boolean | null;
  q9_medicine_desc: string;
  q9_skin: boolean | null;
  q9_skin_desc: string;
  q9_pain: boolean | null;
  q9_pain_desc: string;
  
  // 第十问·因
  q10_duration: string | null;
  q10_cause: string | null;
}

// 辨证结果接口
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

// 六经评分阈值
const THRESHOLDS = {
  '太阳病': 8,
  '阳明病': 10,
  '少阳病': 10,
  '太阴病': 8,
  '少阴病': 8,
  '厥阴病': 8,
};

// 六经辨证评分函数
function analyzeMeridian(answers: Answers): { 
  meridian: string; 
  syndrome: string; 
  scores: Record<string, number>;
  isTableExcess?: boolean;
  isTableDeficiency?: boolean;
  isYangmingChannel?: boolean;
  isYangmingFu?: boolean;
  isShaoyinCold?: boolean;
  isShaoyinHeat?: boolean;
} {
  const scores: Record<string, number> = {
    '太阳病': 0,
    '阳明病': 0,
    '少阳病': 0,
    '太阴病': 0,
    '少阴病': 0,
    '厥阴病': 0,
  };

  // ========== 太阳病评分（表证）==========
  // 恶寒 +3
  if (answers.q1_cold) scores['太阳病'] += 3;
  // 发热 +2
  if (answers.q1_fever) scores['太阳病'] += 2;
  // 头痛 +2
  if (answers.q3_headache) scores['太阳病'] += 2;
  // 身痛 +2
  if (answers.q3_body_pain) scores['太阳病'] += 2;
  // 浮脉简化：恶寒+发热同时存在 +3
  if (answers.q1_cold && answers.q1_fever) scores['太阳病'] += 3;
  // 无汗（表实）+2，有汗（表虚）+1
  let isTableExcess = false;
  let isTableDeficiency = false;
  if (answers.q1_sweat === '无汗') {
    scores['太阳病'] += 2;
    isTableExcess = true;
  } else if (answers.q1_sweat === '有汗') {
    scores['太阳病'] += 1;
    isTableDeficiency = true;
  }

  // ========== 阳明病评分（里热证）==========
  // 高热（发热且不恶寒）+3
  if (answers.q1_fever && !answers.q1_cold) scores['阳明病'] += 3;
  // 大汗 +3
  if (answers.q2_spontaneous) scores['阳明病'] += 3;
  // 大渴引饮 +3
  if (answers.q8_thirsty && answers.q8_thirst_level === '大渴引饮') scores['阳明病'] += 3;
  // 便秘 +2
  if (answers.q4_stool === '便秘') scores['阳明病'] += 2;
  // 腹满痛（身痛+便秘）+2
  if (answers.q3_body_pain && answers.q4_stool === '便秘') scores['阳明病'] += 2;
  // 尿黄赤 +2
  if (answers.q4_urine === '尿黄短少') scores['阳明病'] += 2;
  // 洪大脉简化：高热+大汗 +3
  if (answers.q1_fever && !answers.q1_cold && answers.q2_spontaneous) scores['阳明病'] += 3;
  let isYangmingChannel = false;
  let isYangmingFu = false;
  if (answers.q4_stool === '便秘') {
    isYangmingFu = true;
  } else if (answers.q1_fever && answers.q8_thirsty) {
    isYangmingChannel = true;
  }

  // ========== 少阳病评分（半表半里）==========
  // 口苦 +3
  if (answers.q8_taste === '口苦') scores['少阳病'] += 3;
  // 目眩简化：耳鸣 +2
  if (answers.q7_tinnitus) scores['少阳病'] += 2;
  // 胸胁苦满 +3
  if (answers.q6_hypochondrium) scores['少阳病'] += 3;
  // 心烦喜呕 +3
  if (answers.q5_nausea) scores['少阳病'] += 3;
  // 寒热往来 +3
  if (answers.q1_alternating) scores['少阳病'] += 3;
  // 默默不欲饮食 +2
  if (answers.q5_appetite === '食欲减退' || answers.q5_appetite === '不想吃东西') scores['少阳病'] += 2;
  // 弦脉简化：口苦+胸胁满 +2
  if (answers.q8_taste === '口苦' && answers.q6_hypochondrium) scores['少阳病'] += 2;

  // ========== 太阴病评分（里虚寒）==========
  // 腹满（单独计算，不与身痛关联）+3
  if (answers.q6_chest_tight && answers.q4_stool !== '正常' && answers.q4_stool !== '便秘') scores['太阴病'] += 3;
  // 自利/下利 +3
  if (answers.q4_stool === '腹泻' || answers.q4_stool === '稀溏') scores['太阴病'] += 3;
  // 呕吐 +2
  if (answers.q5_nausea) scores['太阴病'] += 2;
  // 食不下 +2
  if (answers.q5_appetite === '食欲减退' || answers.q5_appetite === '不想吃东西') scores['太阴病'] += 2;
  // 口不渴 +2（必须同时有腹泻或呕吐才加分，避免误判）
  if (!answers.q8_thirsty && (answers.q4_stool === '腹泻' || answers.q4_stool === '稀溏' || answers.q5_nausea)) scores['太阴病'] += 2;
  // 神疲乏力 +2（必须同时有腹泻才加分）
  if (answers.q3_heavy && (answers.q4_stool === '腹泻' || answers.q4_stool === '稀溏')) scores['太阴病'] += 2;

  // ========== 少阴病评分（心肾虚衰）==========
  // 四肢厥冷简化：困倦+恶寒（必须同时存在）+3
  if (answers.q3_heavy && answers.q1_cold && !answers.q1_fever) scores['少阴病'] += 3;
  // 但欲寐（极度困倦）+3（必须单独存在且明显）
  if (answers.q3_heavy && !answers.q1_fever && !answers.q1_alternating) scores['少阴病'] += 3;
  // 下利清谷 +2
  if (answers.q4_stool === '腹泻' && answers.q3_heavy) scores['少阴病'] += 2;
  // 脉微细/沉脉简化：困倦+恶寒（无发热）+3
  if (answers.q3_heavy && answers.q1_cold && !answers.q1_fever) scores['少阴病'] += 3;
  // 畏寒蜷卧 +2
  if (answers.q1_cold && !answers.q1_fever && answers.q3_heavy) scores['少阴病'] += 2;
  let isShaoyinCold = false;
  let isShaoyinHeat = false;
  if (answers.q1_cold && answers.q3_heavy && !answers.q1_fever) {
    isShaoyinCold = true;
  } else if (answers.q6_palpitation && answers.q7_tinnitus && !answers.q1_cold) {
    isShaoyinHeat = true;
  }

  // ========== 厥阴病评分（寒热错杂）==========
  // 四肢厥逆简化：困倦+恶寒（必须同时存在）+3
  if (answers.q3_heavy && answers.q1_cold && !answers.q1_fever) scores['厥阴病'] += 3;
  // 厥热胜复：寒热往来 +3
  if (answers.q1_alternating) scores['厥阴病'] += 3;
  // 气上撞心/呕逆 +2
  if (answers.q5_nausea && answers.q6_chest_tight) scores['厥阴病'] += 2;
  // 嘈杂不适 +1
  if (answers.q6_chest_tight && !answers.q6_hypochondrium) scores['厥阴病'] += 1;
  // 下利 +2
  if (answers.q4_stool === '腹泻') scores['厥阴病'] += 2;
  // 饥而不欲食 +2
  if (answers.q3_heavy && (answers.q5_appetite === '食欲减退' || answers.q5_appetite === '不想吃东西')) scores['厥阴病'] += 2;
  // 寒热错杂加分：同时存在寒证和热证
  const hasColdSign = answers.q1_cold || (answers.q3_heavy && !answers.q1_fever);
  const hasHeatSign = answers.q1_fever || answers.q2_spontaneous || (answers.q8_thirsty && answers.q8_thirst_level === '大渴引饮');
  if (hasColdSign && hasHeatSign) scores['厥阴病'] += 3;

  // 找到得分最高的经
  const maxScore = Math.max(...Object.values(scores));
  const meridian = Object.entries(scores).find(([, score]) => score === maxScore)?.[0] || '太阳病';

  // 检查是否达到阈值
  const threshold = THRESHOLDS[meridian as keyof typeof THRESHOLDS];
  if (maxScore < threshold) {
    // 如果最高分未达到阈值，默认返回太阳病（表证最常见）
    return {
      meridian: '太阳病',
      syndrome: '太阳表虚证',
      scores,
      isTableDeficiency: true,
    };
  }

  // 确定证型
  let syndrome = '';
  if (meridian === '太阳病') {
    syndrome = isTableExcess ? '太阳表实证' : '太阳表虚证';
  } else if (meridian === '阳明病') {
    syndrome = isYangmingFu ? '阳明腑实证' : '阳明经证';
  } else if (meridian === '少阳病') {
    syndrome = '少阳本证';
  } else if (meridian === '太阴病') {
    syndrome = '太阴虚寒证';
  } else if (meridian === '少阴病') {
    syndrome = isShaoyinHeat ? '少阴热化证' : '少阴寒化证';
  } else if (meridian === '厥阴病') {
    syndrome = '厥阴寒热错杂证';
  }

  return { 
    meridian, 
    syndrome, 
    scores,
    isTableExcess,
    isTableDeficiency,
    isYangmingChannel,
    isYangmingFu,
    isShaoyinCold,
    isShaoyinHeat,
  };
}

// 开合枢截断逻辑
function checkInterception(answers: Answers, scores: Record<string, number>): { 
  type: '少阳枢' | '少阴枢' | null; 
  reason: string;
  combinedMeridian?: string;
} {
  // 检查少阳枢机不利
  const shaoyangSigns = [
    answers.q8_taste === '口苦',
    answers.q6_hypochondrium,
    answers.q1_alternating,
  ].filter(Boolean).length;

  // 检查少阴枢机不利
  const shaoyinSigns = [
    answers.q3_heavy && answers.q1_cold && !answers.q1_fever,
    answers.q4_stool === '腹泻' && answers.q3_heavy,
  ].filter(Boolean).length;

  // 西药史阳性
  const hasWesternMedicine = answers.q9_medicine === true;

  // 获取当前辨证的经
  const maxScore = Math.max(...Object.values(scores));
  const currentMeridian = Object.entries(scores).find(([, score]) => score === maxScore)?.[0] || '太阳病';

  // 少阳为枢：任何经病见少阳枢机不利
  if (shaoyangSigns >= 2 || hasWesternMedicine) {
    return {
      type: '少阳枢',
      reason: hasWesternMedicine ? '正在服用西药，合小柴胡汤调和枢机' : '见少阳枢机不利之象（口苦、胸胁满、寒热往来）',
      combinedMeridian: currentMeridian,
    };
  }

  // 少阴为枢：任何经病见少阴枢机不利
  if (shaoyinSigns >= 2) {
    return {
      type: '少阴枢',
      reason: '见少阴枢机不利之象（困倦、四肢冷、小便清长）',
      combinedMeridian: currentMeridian,
    };
  }

  return { type: null, reason: '' };
}

// 获取方剂信息
function getPrescription(
  meridian: string, 
  syndrome: string,
  isTableExcess?: boolean,
  isTableDeficiency?: boolean,
  isYangmingChannel?: boolean,
  isYangmingFu?: boolean,
  isShaoyinCold?: boolean,
  isShaoyinHeat?: boolean
): {
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
    '太阳表实证': {
      prescription: '麻黄汤',
      composition: '麻黄、桂枝、杏仁、甘草',
      dosage: '麻黄9g，桂枝6g，杏仁9g，甘草3g',
      preparation: '水煎服',
      usage: '温服，药后覆取微汗',
      effects: '发汗解表，宣肺平喘',
      indications: '太阳表实证，恶寒发热，无汗而喘，脉浮紧',
      contraindications: '表虚自汗者禁用',
      notes: '温服，药后覆取微汗。忌生冷、油腻、辛辣。注意观察汗出情况，得汗即止，不可过服。儿童减量1/3，老人减量1/4。服药后症状无改善或加重，请及时就医。',
    },
    '太阳表虚证': {
      prescription: '桂枝汤',
      composition: '桂枝、白芍、生姜、大枣、甘草',
      dosage: '桂枝9g，白芍9g，生姜9g，大枣4枚，甘草6g',
      preparation: '水煎服',
      usage: '温服，药后啜热粥，取微汗',
      effects: '解肌发表，调和营卫',
      indications: '太阳表虚证，发热汗出，恶风脉浮缓',
      contraindications: '表实无汗者禁用',
      notes: '温服，药后啜热粥以助药力。忌生冷、油腻、辛辣。注意观察汗出情况。儿童减量1/3，老人减量1/4。服药后症状无改善或加重，请及时就医。',
    },
    '阳明经证': {
      prescription: '白虎汤',
      composition: '石膏、知母、甘草、粳米',
      dosage: '石膏30g，知母12g，甘草6g，粳米18g',
      preparation: '水煎，米熟汤成',
      usage: '温服',
      effects: '清热生津',
      indications: '阳明经证，大热大渴大汗脉洪大',
      contraindications: '表证未解者禁用',
      notes: '石膏先煎30分钟。忌生冷、油腻、辛辣。观察汗出及口渴变化。儿童减量1/3，老人减量1/4。服药后症状无改善或加重，请及时就医。',
    },
    '阳明腑实证': {
      prescription: '大承气汤',
      composition: '大黄、厚朴、枳实、芒硝',
      dosage: '大黄12g，厚朴15g，枳实9g，芒硝9g',
      preparation: '水煎，芒硝溶服',
      usage: '分二次温服，得下止后服',
      effects: '峻下热结',
      indications: '阳明腑实证，潮热谵语，腹满痛便秘，脉沉实',
      contraindications: '表证未解、阴虚者禁用',
      notes: '大黄后下，芒硝溶服。忌生冷、油腻、辛辣。观察二便变化，中病即止，不可过服。儿童减量1/3，老人减量1/4。服药后症状无改善或加重，请及时就医。',
    },
    '少阳本证': {
      prescription: '小柴胡汤',
      composition: '柴胡、黄芩、人参、半夏、生姜、大枣、甘草',
      dosage: '柴胡24g，黄芩9g，人参9g，半夏9g，生姜9g，大枣4枚，甘草6g',
      preparation: '水煎服',
      usage: '去滓再煎，温服',
      effects: '和解少阳',
      indications: '少阳证，寒热往来，胸胁苦满，默默不欲饮食，心烦喜呕，口苦咽干目眩',
      contraindications: '阴虚血少者慎用',
      notes: '去滓再煎，温服。忌生冷、油腻、辛辣。观察寒热变化。儿童减量1/3，老人减量1/4。服药后症状无改善或加重，请及时就医。',
    },
    '太阴虚寒证': {
      prescription: '理中汤',
      composition: '人参、干姜、白术、甘草',
      dosage: '人参9g，干姜9g，白术9g，甘草9g',
      preparation: '水煎服',
      usage: '温服',
      effects: '温中健脾，散寒除湿',
      indications: '太阴虚寒证，腹满吐利，食不下，口不渴',
      contraindications: '实热积滞者禁用',
      notes: '温服。忌生冷、油腻、辛辣。观察二便变化。儿童减量1/3，老人减量1/4。服药后症状无改善或加重，请及时就医。',
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
      notes: '附子必须先煎30分钟以上至口尝无麻味。忌生冷、油腻、辛辣。观察四肢温度及脉搏变化。儿童减量1/3，老人减量1/4。服药后症状无改善或加重，请及时就医。',
    },
    '少阴热化证': {
      prescription: '黄连阿胶汤',
      composition: '黄连、黄芩、白芍、阿胶、鸡子黄',
      dosage: '黄连12g，黄芩6g，白芍12g，阿胶9g（烊化），鸡子黄2枚',
      preparation: '水煎，阿胶烊化，鸡子黄搅入',
      usage: '温服',
      effects: '滋阴降火，交通心肾',
      indications: '少阴热化证，心烦不得眠，口燥咽痛',
      contraindications: '阳虚者禁用',
      notes: '阿胶烊化，鸡子黄搅入。忌生冷、油腻、辛辣。观察睡眠及心烦变化。儿童减量1/3，老人减量1/4。服药后症状无改善或加重，请及时就医。',
    },
    '厥阴寒热错杂证': {
      prescription: '乌梅丸',
      composition: '乌梅、细辛、干姜、黄连、当归、附子、蜀椒、桂枝、人参、黄柏',
      dosage: '乌梅30g，细辛3g，干姜9g，黄连12g，当归6g，附子6g（先煎），蜀椒6g，桂枝6g，人参6g，黄柏6g',
      preparation: '蜜丸或水煎服',
      usage: '日三服',
      effects: '清上温下，寒热并调',
      indications: '厥阴寒热错杂证',
      contraindications: '纯热无寒或纯寒无热者不宜',
      notes: '附子先煎30分钟。忌生冷、油腻、辛辣。观察寒热变化。儿童减量1/3，老人减量1/4。服药后症状无改善或加重，请及时就医。',
    },
  };

  return prescriptions[syndrome] || prescriptions['太阳表虚证'];
}

// 获取合方信息
function getCombinedPrescription(
  currentMeridian: string,
  interceptionType: '少阳枢' | '少阴枢'
): {
  prescription: string;
  composition: string;
  dosage: string;
  preparation: string;
  usage: string;
  effects: string;
  indications: string;
  notes: string;
} | null {
  const combinedPrescriptions: Record<string, {
    prescription: string;
    composition: string;
    dosage: string;
    preparation: string;
    usage: string;
    effects: string;
    indications: string;
    notes: string;
  }> = {
    // 少阳为枢合方
    '太阳病_少阳枢': {
      prescription: '柴胡桂枝汤',
      composition: '柴胡、黄芩、人参、半夏、桂枝、白芍、生姜、大枣、甘草',
      dosage: '柴胡12g，黄芩6g，人参6g，半夏6g，桂枝6g，白芍6g，生姜6g，大枣3枚，甘草3g',
      preparation: '水煎服',
      usage: '温服',
      effects: '和解少阳，兼以解表',
      indications: '太阳少阳合病，发热微恶寒，支节烦疼，微呕，心下支结',
      notes: '温服。忌生冷、油腻、辛辣。观察寒热变化。儿童减量1/3，老人减量1/4。',
    },
    '阳明病_少阳枢': {
      prescription: '大柴胡汤',
      composition: '柴胡、黄芩、半夏、生姜、大枣、芍药、枳实、大黄',
      dosage: '柴胡24g，黄芩9g，半夏9g，生姜15g，大枣4枚，芍药9g，枳实9g，大黄6g',
      preparation: '水煎服',
      usage: '分二次温服',
      effects: '和解少阳，通下里实',
      indications: '少阳阳明合病，呕不止，心下急，郁郁微烦',
      notes: '大黄后下。忌生冷、油腻、辛辣。观察二便变化。儿童减量1/3，老人减量1/4。',
    },
    '太阴病_少阳枢': {
      prescription: '柴胡桂枝干姜汤',
      composition: '柴胡、桂枝、干姜、瓜蒌根、黄芩、牡蛎、甘草',
      dosage: '柴胡24g，桂枝9g，干姜6g，瓜蒌根12g，黄芩9g，牡蛎12g，甘草6g',
      preparation: '水煎服',
      usage: '温服',
      effects: '和解少阳，温中散寒',
      indications: '少阳太阴合病，胸胁满微结，小便不利，渴而不呕，但头汗出',
      notes: '温服。忌生冷、油腻、辛辣。观察寒热变化。儿童减量1/3，老人减量1/4。',
    },
    '少阴病_少阳枢': {
      prescription: '柴胡加龙骨牡蛎汤变方',
      composition: '柴胡、黄芩、人参、半夏、生姜、大枣、甘草、附子、龙骨、牡蛎',
      dosage: '柴胡12g，黄芩6g，人参6g，半夏6g，生姜6g，大枣3枚，甘草6g，附子6g（先煎），龙骨15g（先煎），牡蛎15g（先煎）',
      preparation: '水煎服',
      usage: '温服',
      effects: '和解少阳，温阳安神',
      indications: '少阳少阴合病，胸满烦惊，小便不利',
      notes: '附子、龙骨、牡蛎先煎30分钟。忌生冷、油腻、辛辣。观察神志变化。儿童减量1/3，老人减量1/4。',
    },
    '厥阴病_少阳枢': {
      prescription: '小柴胡汤合乌梅丸化裁',
      composition: '柴胡、黄芩、人参、半夏、生姜、大枣、甘草、乌梅、黄连、黄柏',
      dosage: '柴胡12g，黄芩6g，人参6g，半夏6g，生姜6g，大枣3枚，甘草6g，乌梅15g，黄连6g，黄柏6g',
      preparation: '水煎服',
      usage: '温服',
      effects: '和解少阳，清上温下',
      indications: '少阳厥阴合病，寒热错杂',
      notes: '温服。忌生冷、油腻、辛辣。观察寒热变化。儿童减量1/3，老人减量1/4。',
    },
    // 少阴为枢合方
    '太阳病_少阴枢': {
      prescription: '麻黄附子细辛汤',
      composition: '麻黄、附子、细辛',
      dosage: '麻黄6g，附子15g（先煎），细辛3g',
      preparation: '水煎服',
      usage: '温服',
      effects: '温经散寒，助阳解表',
      indications: '太阳少阴合病，发热恶寒，无汗，脉沉',
      notes: '附子必须先煎30分钟以上。忌生冷、油腻、辛辣。观察汗出及脉搏变化。儿童减量1/3，老人减量1/4。',
    },
    '阳明病_少阴枢': {
      prescription: '白虎汤合四逆汤化裁',
      composition: '石膏、知母、甘草、粳米、附子、干姜',
      dosage: '石膏30g（先煎），知母12g，甘草6g，粳米18g，附子6g（先煎），干姜6g',
      preparation: '水煎服',
      usage: '温服',
      effects: '清热生津，回阳救逆',
      indications: '阳明少阴合病，寒热错杂，危重证',
      notes: '石膏、附子先煎30分钟。寒热错杂，需密切观察。忌生冷、油腻、辛辣。儿童减量1/3，老人减量1/4。',
    },
    '太阴病_少阴枢': {
      prescription: '附子理中汤',
      composition: '人参、白术、干姜、附子、甘草',
      dosage: '人参9g，白术9g，干姜9g，附子15g（先煎），甘草6g',
      preparation: '水煎服',
      usage: '温服',
      effects: '温中健脾，回阳救逆',
      indications: '太阴少阴合病，腹满吐利，四肢厥冷',
      notes: '附子必须先煎30分钟以上。忌生冷、油腻、辛辣。观察四肢温度及二便变化。儿童减量1/3，老人减量1/4。',
    },
    '少阴病_少阴枢': {
      prescription: '四逆汤',
      composition: '附子、干姜、甘草',
      dosage: '附子15g（先煎），干姜9g，甘草6g',
      preparation: '水煎服',
      usage: '温服',
      effects: '回阳救逆',
      indications: '少阴病，四肢厥逆，脉微欲绝',
      notes: '附子必须先煎30分钟以上。忌生冷、油腻、辛辣。观察四肢温度及脉搏变化。儿童减量1/3，老人减量1/4。',
    },
    '厥阴病_少阴枢': {
      prescription: '四逆汤合乌梅丸化裁',
      composition: '附子、干姜、甘草、乌梅、黄连、黄柏',
      dosage: '附子15g（先煎），干姜9g，甘草6g，乌梅15g，黄连6g，黄柏6g',
      preparation: '水煎服',
      usage: '温服',
      effects: '回阳救逆，清上温下',
      indications: '厥阴少阴合病，寒热错杂，四肢厥逆',
      notes: '附子先煎30分钟。忌生冷、油腻、辛辣。观察寒热及四肢变化。儿童减量1/3，老人减量1/4。',
    },
  };

  const key = `${currentMeridian}_${interceptionType}`;
  return combinedPrescriptions[key] || null;
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
    
    // 兼容两种数据格式
    const userInfo = body.userInfo || {};
    const name = body.name || userInfo.name;
    const age = body.age || userInfo.age;
    const weight = body.weight || userInfo.weight;
    const answers = body.answers || {};

    if (!name || !age || !weight || !answers) {
      return NextResponse.json({ error: '缺少必要参数' }, { status: 400 });
    }

    // 辨证分析
    const { 
      meridian, 
      syndrome, 
      scores,
      isTableExcess,
      isTableDeficiency,
      isYangmingChannel,
      isYangmingFu,
      isShaoyinCold,
      isShaoyinHeat,
    } = analyzeMeridian(answers);
    
    // 开合枢截断检查
    const interception = checkInterception(answers, scores);
    
    // 获取方剂
    const prescriptionInfo = getPrescription(
      meridian, 
      syndrome,
      isTableExcess,
      isTableDeficiency,
      isYangmingChannel,
      isYangmingFu,
      isShaoyinCold,
      isShaoyinHeat
    );
    
    // 获取合方（如果有截断）
    let combinedPrescriptionInfo = null;
    if (interception.type && interception.combinedMeridian) {
      combinedPrescriptionInfo = getCombinedPrescription(
        interception.combinedMeridian,
        interception.type
      );
    }
    
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
        combinedPrescription: combinedPrescriptionInfo?.prescription || (interception.type === '少阳枢' ? '小柴胡汤' : '四逆汤'),
      },
      dietaryAdvice: [
        '忌生冷寒凉',
        '忌油腻厚味',
        '忌辛辣刺激',
        '宜温热饮食',
        ...(meridian === '太阳病' ? ['可饮生姜红糖水助汗'] : []),
        ...(meridian === '阳明病' ? ['可饮绿豆汤清热', '多食梨、西瓜等清热生津之品'] : []),
        ...(meridian === '太阴病' ? ['可食山药、大枣健脾', '忌生冷瓜果'] : []),
        ...(meridian === '少阴病' ? ['宜温补食材', '忌寒凉生冷'] : []),
      ],
      lifestyleAdvice: [
        '服药后注意观察汗出、二便、寒热变化',
        '服药方法：温服，频服',
        '年龄体重剂量调整：儿童减量1/3，老人减量1/4',
        '服药后症状无改善或加重，请及时就医',
        ...(meridian === '太阳病' ? ['注意避风保暖', '观察汗出情况'] : []),
        ...(meridian === '阳明病' ? ['观察二便变化', '保持大便通畅'] : []),
        ...(meridian === '少阴病' ? ['注意保暖', '观察四肢温度'] : []),
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
