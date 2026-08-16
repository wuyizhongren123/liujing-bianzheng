import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

const supabase = getSupabaseClient();

interface UserInfo {
  name: string;
  age: number;
  weight: number;
  gender?: string;
  menstrual_cycle?: string;
  menstrual_flow?: string;
  menstrual_pain?: string;
}

interface Answers {
  q1_cold: boolean;
  q1_fever: boolean;
  q1_alternating: boolean;
  q1_sweat: boolean | string;
  q2_spontaneous: boolean;
  q2_night: boolean;
  q2_location: string;
  q3_headache: boolean;
  q3_head_location: string;
  q3_body_pain: boolean;
  q3_body_location: string;
  q3_heavy: boolean;
  q4_stool: string;
  q4_urine: string;
  q5_appetite: boolean | string;
  q5_nausea: boolean;
  q6_chest_tight: boolean;
  q6_chest_pain: boolean;
  q6_hypochondrium: boolean;
  q6_palpitation: boolean;
  q7_tinnitus: boolean;
  q7_hearing: boolean;
  q8_thirsty: boolean;
  q8_thirst_level: string;
  q8_drink_pref: string;
  q8_taste: string;
  q9_chronic: boolean;
  q9_medicine: boolean;
  q9_skin: boolean;
  q9_pain: boolean;
  q10_duration: string;
  q10_cause: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userInfo, answers } = body;

    // 字段映射：兼容新旧格式
    const a = {
      chills: answers.q1_cold,
      fever: answers.q1_fever,
      alternating: answers.q1_alternating,
      sweating: answers.q1_sweat === true || answers.q1_sweat === '有汗',
      noSweat: answers.q1_sweat === false || answers.q1_sweat === '无汗',
      spontaneousSweat: answers.q2_spontaneous,
      nightSweat: answers.q2_night,
      sweatLocation: answers.q2_location,
      headache: answers.q3_headache,
      headLocation: answers.q3_head_location,
      bodyPain: answers.q3_body_pain,
      bodyLocation: answers.q3_body_location,
      heavy: answers.q3_heavy,
      stool: answers.q4_stool,
      urine: answers.q4_urine,
      appetite: answers.q5_appetite === true || answers.q5_appetite === '正常',
      appetitePoor: answers.q5_appetite === false || answers.q5_appetite === '食欲减退',
      nausea: answers.q5_nausea,
      chestTight: answers.q6_chest_tight,
      chestPain: answers.q6_chest_pain,
      hypochondrium: answers.q6_hypochondrium,
      palpitation: answers.q6_palpitation,
      tinnitus: answers.q7_tinnitus,
      hearingLoss: answers.q7_hearing,
      thirsty: answers.q8_thirsty,
      thirstLevel: answers.q8_thirst_level,
      drinkPref: answers.q8_drink_pref,
      taste: answers.q8_taste,
      chronic: answers.q9_chronic,
      westernMedicine: answers.q9_medicine,
      skinIssues: answers.q9_skin,
      pain: answers.q9_pain,
      duration: answers.q10_duration,
      cause: answers.q10_cause,
      pulseType: answers.pulseType || 'normal',
    };

    // 六经评分
    const scores = {
      taiyang: 0,
      yangming: 0,
      shaoyang: 0,
      taiyin: 0,
      shaoyin: 0,
      jueyin: 0,
    };

    // 太阳病评分
    if (a.chills && a.fever) scores.taiyang += 5;
    if (a.headache) scores.taiyang += 2;
    if (a.bodyPain) scores.taiyang += 2;
    if (a.noSweat) scores.taiyang += 3;
    if (a.pulseType === 'floating') scores.taiyang += 3;

    // 阳明病评分
    if (a.fever && !a.chills) scores.yangming += 3;
    if (a.thirsty) scores.yangming += 3;
    if (a.stool === '便秘') scores.yangming += 3;
    if (a.taste === '口臭') scores.yangming += 2;

    // 少阳病评分
    if (a.alternating) scores.shaoyang += 5;
    if (a.hypochondrium) scores.shaoyang += 3;
    if (a.nausea) scores.shaoyang += 2;
    if (a.taste === '口苦') scores.shaoyang += 3;
    if (a.tinnitus) scores.shaoyang += 2;

    // 太阴病评分
    if (a.stool === '便溏' || a.stool === '腹泻') scores.taiyin += 3;
    if (a.appetitePoor) scores.taiyin += 2;
    if (!a.thirsty) scores.taiyin += 2;
    if (a.heavy) scores.taiyin += 1;

    // 少阴病评分
    if (a.chills && !a.fever) scores.shaoyin += 3;
    if (a.palpitation) scores.shaoyin += 3;
    if (a.nightSweat) scores.shaoyin += 2;

    // 厥阴病评分
    if (a.chills && a.fever) scores.jueyin += 3;
    if (a.alternating) scores.jueyin += 2;
    if (a.nausea && a.stool === '腹泻') scores.jueyin += 2;

    // 确定病经
    let meridian = '';
    let meridianFull = '';
    let maxScore = 0;

    const meridianNames: Record<string, string> = {
      taiyang: '太阳病',
      yangming: '阳明病',
      shaoyang: '少阳病',
      taiyin: '太阴病',
      shaoyin: '少阴病',
      jueyin: '厥阴病',
    };

    for (const [key, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        meridian = key;
        meridianFull = meridianNames[key];
      }
    }

    // 阈值判断
    if (maxScore < 8) {
      meridian = 'taiyang';
      meridianFull = '太阳病';
    }

    // 确定证型
    let syndrome = '';
    let prescription = '';
    let composition = '';
    let dosage = '';
    let preparation = '水煎服';
    let usage = '温服';
    let effects = '';
    let indications = '';
    let contraindications = '';
    let notes = '';

    // 太阳病
    if (meridian === 'taiyang') {
      if (a.noSweat) {
        syndrome = '太阳表实证';
        prescription = '麻黄汤';
        composition = '麻黄、桂枝、杏仁、甘草';
        dosage = '麻黄9g，桂枝6g，杏仁9g，甘草3g';
        effects = '发汗解表，宣肺平喘';
        indications = '恶寒发热，无汗而喘，脉浮紧';
        notes = '温服，药后覆取微汗。忌生冷、油腻、辛辣。';
      } else {
        syndrome = '太阳表虚证';
        prescription = '桂枝汤';
        composition = '桂枝、白芍、生姜、大枣、甘草';
        dosage = '桂枝9g，白芍9g，生姜9g，大枣4枚，甘草6g';
        effects = '解肌发表，调和营卫';
        indications = '恶风发热，汗出头痛，脉浮缓';
        notes = '温服，药后啜热稀粥助汗。忌生冷、油腻、辛辣。';
      }
    }

    // 阳明病
    if (meridian === 'yangming') {
      if (a.stool === '便秘') {
        syndrome = '阳明腑实证';
        prescription = '大承气汤';
        composition = '大黄、芒硝、实、厚朴';
        dosage = '大黄12g，芒硝9g，实12g，厚朴24g';
        effects = '峻下热结';
        indications = '大便秘结，脘腹痞满，腹痛拒按';
        notes = '得下余勿服。中病即止，不可过服。';
      } else {
        syndrome = '阳明经证';
        prescription = '白虎汤';
        composition = '石膏、知母、甘草、粳米';
        dosage = '石膏30g，知母12g，甘草6g，粳米9g';
        effects = '清热生津';
        indications = '大热，大汗，大渴，脉洪大';
        notes = '温服。脾胃虚寒者慎用。';
      }
    }

    // 少阳病
    if (meridian === 'shaoyang') {
      syndrome = '少阳证';
      prescription = '小柴胡汤';
      composition = '柴胡、黄芩、人参、半夏、甘草、生姜、大枣';
      dosage = '柴胡12g，黄芩6g，人参6g，半夏6g，甘草6g，生姜6g，大枣4枚';
      effects = '和解少阳';
      indications = '往来寒热，胸胁苦满，默默不欲饮食，心烦喜呕';
      notes = '温服。忌生冷、油腻、辛辣。';
    }

    // 太阴病
    if (meridian === 'taiyin') {
      syndrome = '太阴病';
      prescription = '理中汤';
      composition = '人参、干姜、甘草、白术';
      dosage = '人参9g，干姜9g，甘草9g，白术9g';
      effects = '温中散寒，健脾益气';
      indications = '腹满而吐，食不下，自利益甚，时腹自痛';
      notes = '温服。服药后饮热粥助药力。';
    }

    // 少阴病
    if (meridian === 'shaoyin') {
      if (a.chills && !a.fever) {
        syndrome = '少阴寒化证';
        prescription = '四逆汤';
        composition = '附子、干姜、甘草';
        dosage = '附子9g，干姜9g，甘草6g';
        effects = '回阳救逆';
        indications = '四肢厥逆，恶寒蜷卧，呕吐不渴，腹痛下利';
        notes = '温服。附子先煎30分钟。';
      } else {
        syndrome = '少阴热化证';
        prescription = '黄连阿胶汤';
        composition = '黄连、黄芩、芍药、鸡子黄、阿胶';
        dosage = '黄连6g，黄6g，芍药6g，鸡子黄2枚，阿胶9g';
        effects = '滋阴降火，除烦安神';
        indications = '心中烦，不得卧，口燥咽干';
        notes = '温服。阿胶烊化，鸡子黄后下。';
      }
    }

    // 厥阴病
    if (meridian === 'jueyin') {
      syndrome = '厥阴病';
      prescription = '乌梅丸';
      composition = '乌梅、细辛、干姜、黄连、当归、附子、蜀椒、桂枝、人参、黄柏';
      dosage = '乌梅30g，细辛3g，干姜9g，黄连9g，当归6g，附子6g，蜀椒6g，桂枝6g，人参6g，黄柏6g';
      effects = '清上温下，安蛔止痛';
      indications = '消渴，气上撞心，心中疼热，饥而不欲食，食则吐蛔';
      notes = '温服。忌生冷、油腻、辛辣。';
    }

    // 合方逻辑
    let finalPrescription = prescription;
    let combinedPrescription = '';

    // 三阳病合少阳方
    if (meridian === 'taiyang' || meridian === 'yangming') {
      if (prescription !== '小柴胡汤') {
        finalPrescription = `${prescription} 合 小柴胡汤`;
        combinedPrescription = '小柴胡汤';
        composition += '、柴胡、黄芩、人参、半夏';
        dosage += '，柴胡12g，黄芩6g，人参6g，半夏6g';
        effects += '，和解少阳';
      }
    }

    // 三阴病合少阴+少阳方
    if (meridian === 'taiyin' || meridian === 'shaoyin' || meridian === 'jueyin') {
      if (meridian !== 'shaoyin' && prescription !== '四逆汤' && prescription !== '黄连阿胶汤') {
        finalPrescription = `${prescription} 合 四逆汤`;
        combinedPrescription = '四逆汤';
        composition += '、附子、干姜';
        dosage += '，附子9g，干姜9g';
        effects += '，温阳散寒';
      }
      if (prescription !== '小柴胡汤') {
        finalPrescription = `${finalPrescription} 合 小柴胡汤`;
        combinedPrescription = combinedPrescription ? `${combinedPrescription}、小柴胡汤` : '小柴胡汤';
        composition += '、柴胡、黄、人参、半夏';
        dosage += '，柴胡12g，黄芩6g，人参6g，半夏6g';
        effects += '，和解少阳';
      }
    }

    // 妇科温经汤合方
    let menstrualInfo = '';
    if (userInfo.gender === '女' && userInfo.age >= 12 && userInfo.age <= 55) {
      const menstrualIssues = [];
      if (userInfo.menstrual_cycle && userInfo.menstrual_cycle !== '正常') {
        menstrualIssues.push(`周期${userInfo.menstrual_cycle}`);
      }
      if (userInfo.menstrual_flow && userInfo.menstrual_flow !== '正常') {
        menstrualIssues.push(userInfo.menstrual_flow);
      }
      if (userInfo.menstrual_pain && userInfo.menstrual_pain === '有痛经') {
        menstrualIssues.push('痛经');
      }

      if (menstrualIssues.length > 0) {
        menstrualInfo = menstrualIssues.join('、');
        finalPrescription = `${finalPrescription} 合 温经汤`;
        composition += '、吴茱萸、川芎、阿胶、麦冬';
        dosage += '，吴茱6g，川芎9g，阿胶9g，麦冬9g';
        effects += '，温经散寒，养血调经';
        notes += '妇科辨证：月经异常，合温经汤调经。';
      }
    }

    // 药材加减
    // 通用健脾胃
    composition += '、白术、当归';
    dosage += '，白术9g，当归9g';

    // 有西药史
    if (a.westernMedicine) {
      composition += '、鸡内金、神曲、炒麦芽';
      dosage += '，鸡内金9g，神曲9g，炒麦芽9g';
      notes += '有西药服用史，加消食化积药。';
    }

    // 用下法
    if (a.stool === '便秘') {
      composition += '、木香、砂仁、大黄';
      dosage += '，木香6g，砂仁6g，大黄12g';
      notes += '用下法，加行气通便药。';
    }

    // 月经量多/量少加减
    if (userInfo.gender === '女') {
      if (userInfo.menstrual_flow === '量多') {
        composition += '、黄芪';
        dosage += '，黄芪15g';
        notes += '月经量多，加黄芪补气摄血。';
      } else if (userInfo.menstrual_flow === '量少') {
        composition += '、熟地';
        dosage += '，熟地12g';
        notes += '月经量少，加熟地补血养阴。';
      }
    }

    // 三阴病加生地
    if (meridian === 'taiyin' || meridian === 'shaoyin' || meridian === 'jueyin') {
      composition += '、生地';
      dosage += '，生地12g';
    }

    // 饮食建议
    const dietaryAdvice = [
      '忌生冷寒凉',
      '忌油腻厚味',
      '忌辛辣刺激',
      '宜温热饮食',
    ];

    if (meridian === 'taiyang' && a.noSweat) {
      dietaryAdvice.push('可饮生姜红糖水助汗');
    }

    // 生活建议
    const lifestyleAdvice = [
      '服药后注意观察汗出、二便、寒热变化',
      '服药方法：温服，频服',
      '年龄体重剂量调整：儿童减量1/3，老人减量1/4',
      '服药后症状无改善或加重，请及时就医',
    ];

    if (meridian === 'taiyang') {
      lifestyleAdvice.push('注意避风保暖');
      lifestyleAdvice.push('观察汗出情况');
    }

    // 保存到数据库
    console.log('准备保存记录:', userInfo.name, finalPrescription);
    
    const { data, error } = await supabase
      .from('diagnosis_records')
      .insert([
        {
          name: userInfo.name,
          gender: userInfo.gender || '未知',
          prescription: finalPrescription,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('保存记录失败:', error);
    } else {
      console.log('保存记录成功:', data);
    }

    return NextResponse.json({
      success: true,
      data: {
        meridian,
        meridianFull,
        syndrome,
        prescription,
        finalPrescription,
        composition,
        dosage,
        preparation,
        usage,
        effects,
        indications,
        contraindications,
        notes,
        dietaryAdvice,
        lifestyleAdvice,
        combinedPrescription,
        menstrualInfo,
      }
    });

  } catch (error) {
    console.error('诊断API错误:', error);
    return NextResponse.json({ error: '诊断失败' }, { status: 500 });
  }
}
