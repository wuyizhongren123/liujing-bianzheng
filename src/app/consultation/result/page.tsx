'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DiagnosisResult {
  userInfo: {
    name: string;
    age: number;
    weight: number;
  };
  answers?: Record<string, unknown>;
  meridian: string;
  meridianFull?: string;
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
  interception?: {
    type?: string | null;
    reason?: string;
    combinedPrescription?: string;
  } | null;
  dietaryAdvice?: string[];
  lifestyleAdvice?: string[];
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('diagnosisResult');
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      router.push('/consultation/info');
    }
  }, [router]);

  const handleCopy = () => {
    if (!result) return;
    
    const content = `
六经辨证结果
==============
姓名：${result.userInfo?.name || '未提供'}
年龄：${result.userInfo?.age || '未提供'}岁
体重：${result.userInfo?.weight || '未提供'}kg

辨证结论
--------------
病经：${result.meridian}
证型：${result.syndrome}

推荐方剂
--------------
方剂：${result.prescription}
组成：${result.composition}
剂量：${result.dosage}
功效：${result.effects}
主治：${result.indications}
煎服：${result.preparation}，${result.usage}

注意事项
--------------
${result.notes}

开阖枢理论
--------------
"舍枢，不能开阖；舍开阖，不能转枢" ——《灵枢·根结》

枢＝门轴；开＝把门打开；阖＝把门关上。

用大门做比喻：
• 枢，就是大门的转轴。开是开门，阖是关门。
• 舍枢，不能开阖：离开了门轴（枢），门就没办法实现开门、关门的动作。
• 舍开阖，不能转枢：如果门本身没有开合的功能，门轴也就失去转动的意义。

六经对应：
• 少阳是阳门的门轴（阳枢），少阴是阴门的门轴（阴枢）。
• 没有少阳枢机，太阳就没法"开"（阳气向外布散卫表），阳明也没法"阖"（阳气向内收敛入腑）。
• 没有少阴枢机，太阴就没法"开"（布散阴精），厥阴也没法"阖"（收纳阴血）。

翻译成中医白话：
枢（少阳、少阴）是动力转轴，负责转换；开阖是向外、向内的结果。
没有转轴，阴阳就出不去、收不回来；
没有向外向内的开合，转轴的转动就毫无意义。二者互相依存，缺一不可。

武医思路：站桩调的就是这一套气化，形体中正，枢机才能转，一身阴阳才能正常开阖。

三阴病传变路径
--------------
三阴往外出，优先靠枢机转动（少阴、厥阴），先转到少阳这个阳枢；
如果阳气偏旺，燥热化，才进一步落到阳明（三阳之阖）；
阳气平和，就直接从少阳、太阳把邪气散掉，不会走到阳明燥实。

传变路径：
三阴（太阴/少阴/厥阴）→ 少阴枢/厥阴 → 少阳（阳枢）
  ↓ 阳气平和 → 从少阳、太阳散掉
  ↓ 阳气偏旺、燥热化 → 落到阳明（三阳之阖）

用药后饮食注意
--------------
❌ 少吃或忌口：
• 生冷食物（冰饮、凉菜、生鱼片等）
• 鱼虾海鲜（寒凉之品，易伤脾胃）
• 辛辣刺激（辣椒、花椒、大蒜等）
• 水果（多数水果性寒，服药期间少吃）
• 牛奶、咖啡（寒凉刺激，影响药效）

✅ 宜食：
• 温热饮食（热粥、热汤面等）
• 易消化食物（小米粥、山药、大枣等）
• 清淡为主，少油少盐

郭中仁·道武医锻炼法
--------------
【站桩功 - 调枢机】

理论依据：
站桩调的就是开阖枢这一套气化。形体中正，枢机才能转，一身阴阳才能正常开阖。
少阳为阳枢，少阴为阴枢，站桩时脊柱正直，正是调少阴枢；双肩放松，正是调少阳枢。

动作要领：
1. 双脚平行站立，与肩同宽
2. 双膝微屈，似坐非坐
3. 双手环抱于胸前，如抱大树
4. 脊柱正直，头顶如悬
5. 双肩放松，自然下沉
6. 呼吸自然，意守丹田

练习时间：
每次15-30分钟，每日1-2次

【五行拳 - 调五脏】

劈拳（金·肺）：
• 动作：双手如斧劈下，一前一后
• 功效：宣肺理气，增强呼吸功能
• 对应：手太阴肺经

钻拳（水·肾）：
• 动作：双手如钻向上，螺旋发力
• 功效：补肾益精，强健腰膝
• 对应：足少阴肾经

崩拳（木·肝）：
• 动作：直拳 forward，如箭射出
• 功效：疏肝理气，调畅情志
• 对应：足厥阴肝经

炮拳（火·心）：
• 动作：双手如炮向上架打
• 功效：温通心阳，活血通脉
• 对应：手少阴心经

横拳（土·脾）：
• 动作：双手如球横拨
• 功效：健脾和胃，增强消化
• 对应：足太阴脾经

练习建议：
每拳练习5-10遍，全套约20分钟
配合站桩练习，效果更佳

免责声明
--------------
本辨证结果仅供参考，不能替代专业医师的诊断和治疗。
如有不适，请及时就医。用药请遵医嘱。
    `.trim();

    navigator.clipboard.writeText(content).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleScreenshot = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    alert('请使用手机截图功能保存页面：\n\niOS：同时按住电源键 + 音量上键\nAndroid：同时按住电源键 + 音量下键');
  };

  if (!result) return null;

  // 生成推理过程分析
  const generateReasoning = () => {
    const steps: { title: string; content: string; highlight?: boolean }[] = [];

    // 第一步：用户信息
    steps.push({
      title: '第一步：用户基本信息',
      content: `姓名：${result.userInfo?.name || '未提供'}，年龄：${result.userInfo?.age || '未提供'}岁，体重：${result.userInfo?.weight || '未提供'}kg`
    });

    // 第二步：十问分析
    const answers = result.answers || {};
    const hasCold = answers.q1_cold === true;
    const hasFever = answers.q1_fever === true;
    const hasAlternating = answers.q1_alternating === true;
    const sweatType = answers.q1_sweat as string;
    const headacheLocation = answers.q3_head_location as string;
    const taste = answers.q8_taste as string;
    const isThirsty = answers.q8_thirsty === true;
    const thirstLevel = answers.q8_thirst_level as string;
    const stool = answers.q4_stool as string;

    steps.push({
      title: '第二步：十问症状分析',
      content: `根据用户回答，提取关键症状信息...`
    });

    if (hasCold && hasFever) {
      steps.push({
        title: '寒热辨证',
        content: `用户同时出现怕冷和发热症状，属于「恶寒发热」，提示表证。${sweatType === '有汗' ? '有汗，属于表虚证。' : sweatType === '无汗' ? '无汗，属于表实证。' : ''}`,
        highlight: true
      });
    }

    if (hasAlternating) {
      steps.push({
        title: '寒热辨证',
        content: '用户出现寒热往来（怕冷和发热交替出现），这是少阳病的典型特征。',
        highlight: true
      });
    }

    if (headacheLocation === '后脑') {
      steps.push({
        title: '头痛部位分析',
        content: '后脑头痛，属于太阳经循行部位，提示太阳病。',
        highlight: true
      });
    } else if (headacheLocation === '两侧') {
      steps.push({
        title: '头痛部位分析',
        content: '两侧头痛，属于少阳经循行部位，提示少阳病。',
        highlight: true
      });
    } else if (headacheLocation === '前额') {
      steps.push({
        title: '头痛部位分析',
        content: '前额头痛，属于阳明经循行部位，提示阳明病。',
        highlight: true
      });
    }

    if (taste === '口苦') {
      steps.push({
        title: '口味分析',
        content: '口苦是少阳病的典型症状，提示胆火上炎。',
        highlight: true
      });
    }

    if (isThirsty && thirstLevel === '大渴引饮') {
      steps.push({
        title: '口渴分析',
        content: '大渴引饮，提示阳明热盛，津液受损。',
        highlight: true
      });
    }

    if (stool === '便秘') {
      steps.push({
        title: '二便分析',
        content: '便秘，提示阳明腑实，需要通下。',
        highlight: true
      });
    } else if (stool === '稀溏' || stool === '腹泻') {
      steps.push({
        title: '二便分析',
        content: '大便稀溏或腹泻，提示太阴脾虚。',
        highlight: true
      });
    }

    // 第三步：六经辨证
    steps.push({
      title: '第三步：六经辨证结论',
      content: `综合以上症状分析，辨证为「${result.meridianFull || result.meridian}」，证型为「${result.syndrome}」。`,
      highlight: true
    });

    // 第四步：方剂推荐
    steps.push({
      title: '第四步：方剂推荐',
      content: `根据辨证结果，推荐方剂「${result.prescription}」。组成：${result.composition}。功效：${result.effects}。`
    });

    // 第五步：开合枢截断分析
    const kaiheShuTheory = `【开阖枢理论】
"舍枢，不能开阖；舍开阖，不能转枢" ——《灵枢·根结》

枢＝门轴；开＝把门打开；阖＝把门关上。

用大门做比喻最好懂：
枢，就是大门的转轴。开是开门，阖是关门。

舍枢，不能开阖：
离开了门轴（枢），门就没办法实现开门、关门的动作。
放到六经：
• 少阳是阳门的门轴，少阴是阴门的门轴。
• 没有少阳枢机，太阳就没法"开"（阳气向外布散卫表），阳明也没法"阖"（阳气向内收敛入腑）。
• 没有少阴枢机，太阴就没法"开"（布散阴精），厥阴也没法"阖"（收纳阴血）。
没有枢机转动，阴阳就做不了向外打开、向内收敛。

舍开阖，不能转枢：
反过来，如果门本身没有开合的功能，门轴也就失去转动的意义。
门轴不是凭空空转，它是为开门、关门服务的。
放到人体：
• 少阳这个枢，不是自己凭空折腾，是为了实现太阳开、阳明阖；
• 少阴这个枢，不是单纯水火瞎转，是配合太阴开、厥阴阖，完成阴气的布散与收束。
没有开阖的作用，枢机的转动就没有目的。

翻译成中医白话：
枢（少阳、少阴）是动力转轴，负责转换；开阖是向外、向内的结果。
没有转轴，阴阳就出不去、收不回来；
没有向外向内的开合，转轴的转动就毫无意义。二者互相依存，缺一不可。

落到伤寒六经实际：
少阳（阳枢）——太阳要开（卫气布于体表），阳明要阖（热归胃肠），全靠少阳三焦胆作为转轴。少阳枢机一堵，门轴锈住：太阳的邪出不去，阳明的热收不进来 → 往来寒热、胸胁苦满，小柴胡汤就是修理这个门轴。
少阴（阴枢，心肾）——太阴要把津液布散出来（开），厥阴要把阴血收藏回去（阖），依靠少阴心肾水火升降作为转轴。少阴枢机坏掉，水火不交：要么寒化（四逆汤证），要么热化（黄连阿胶汤证）。

一句话总结：
枢管转换，开阖管出入。没有转轴就打不开门关不上；没有开门关门，转轴也没必要转动。

【三阴病传变路径】
三阴往外出，优先靠枢机转动（少阴、厥阴），先转到少阳这个阳枢；
如果阳气偏旺，燥热化，才进一步落到阳明（三阳之阖）；
阳气平和，就直接从少阳、太阳把邪气散掉，不会走到阳明燥实。

传变路径：
三阴（太阴/少阴/厥阴）→ 少阴枢/厥阴 → 少阳（阳枢）
  ↓ 阳气平和 → 从少阳、太阳散掉
  ↓ 阳气偏旺、燥热化 → 落到阳明（三阳之阖）

武医思路：站桩调的就是这一套气化，形体中正，枢机才能转，一身阴阳才能正常开阖。`;

    if (result.interception && result.interception.reason) {
      steps.push({
        title: '第五步：开合枢截断分析',
        content: `${kaiheShuTheory}

【本案分析】
根据开合枢理论，${result.interception.reason}，建议合用「${result.interception.combinedPrescription}」进行截断。`,
        highlight: true
      });
    } else {
      steps.push({
        title: '第五步：开合枢截断分析',
        content: `${kaiheShuTheory}

【本案分析】
根据开合枢理论，当前症状未见明显的传变趋势，暂无需合方截断。`
      });
    }

    // 第六步：年龄体重调整
    let dosageAdjustment = '';
    if (result.userInfo?.age && result.userInfo.age < 12) {
      dosageAdjustment = '患者为儿童（<12岁），药量应减半。';
    } else if (result.userInfo?.age && result.userInfo.age > 65) {
      dosageAdjustment = '患者为老人（>65岁），药量酌减1/3，注意扶正。';
    }
    
    if (result.userInfo?.weight && result.userInfo.weight < 50) {
      dosageAdjustment += '体重<50kg，药量酌减。';
    } else if (result.userInfo?.weight && result.userInfo.weight > 80) {
      dosageAdjustment += '体重>80kg，药量酌增。';
    }

    if (dosageAdjustment) {
      steps.push({
        title: '第六步：剂量调整',
        content: dosageAdjustment
      });
    }

    return steps;
  };

  const reasoningSteps = generateReasoning();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="bg-gradient-to-r from-red-800 to-red-900 h-2"></div>
      
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* 标题 */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-red-900">辨证结果</h1>
          <p className="text-stone-600 mt-1">基于十问歌与六经辨证体系</p>
        </div>

        {/* 用户信息 */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4 border border-amber-200">
          <h2 className="text-lg font-bold text-red-900 mb-3 flex items-center">
            <span className="w-1 h-5 bg-red-700 rounded mr-2"></span>
            基本信息
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-stone-500 text-sm">姓名</p>
              <p className="text-stone-800 font-medium">{result.userInfo?.name || '未提供'}</p>
            </div>
            <div>
              <p className="text-stone-500 text-sm">年龄</p>
              <p className="text-stone-800 font-medium">{result.userInfo?.age || '未提供'}岁</p>
            </div>
            <div>
              <p className="text-stone-500 text-sm">体重</p>
              <p className="text-stone-800 font-medium">{result.userInfo?.weight || '未提供'}kg</p>
            </div>
          </div>
        </div>

        {/* 辨证结论 */}
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl shadow-lg p-5 mb-4 border-2 border-red-200">
          <h2 className="text-lg font-bold text-red-900 mb-3 flex items-center">
            <span className="w-1 h-5 bg-red-700 rounded mr-2"></span>
            辨证结论
          </h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-stone-600 w-20">病经：</span>
              <span className="text-xl font-bold text-red-800">{result.meridian}</span>
            </div>
            <p className="text-stone-600 text-sm pl-20">{result.meridianFull || ''}</p>
            <div className="flex items-center">
              <span className="text-stone-600 w-20">证型：</span>
              <span className="text-lg font-medium text-stone-800">{result.syndrome}</span>
            </div>
          </div>
        </div>

        {/* 推荐方剂 */}
        <div className="bg-white rounded-xl shadow-lg p-5 mb-4 border border-amber-200">
          <h2 className="text-lg font-bold text-red-900 mb-3 flex items-center">
            <span className="w-1 h-5 bg-red-700 rounded mr-2"></span>
            推荐方剂
          </h2>
          <div className="space-y-4">
            <div className="text-center py-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-red-800">{result.prescription}</p>
            </div>
            
            <div>
              <p className="text-stone-600 text-sm mb-1">功效</p>
              <p className="text-stone-800">{result.effects}</p>
            </div>
            
            <div>
              <p className="text-stone-600 text-sm mb-1">组成</p>
              <p className="text-stone-800">{result.composition}</p>
            </div>
            
            <div>
              <p className="text-stone-600 text-sm mb-1">剂量</p>
              <p className="text-stone-800">{result.dosage}</p>
            </div>
            
            <div>
              <p className="text-stone-600 text-sm mb-1">煎服方法</p>
              <p className="text-stone-800">{result.preparation}，{result.usage}</p>
            </div>
            
            <div>
              <p className="text-stone-600 text-sm mb-1">主治</p>
              <p className="text-stone-800">{result.indications}</p>
            </div>
            
            {result.notes && (
              <div>
                <p className="text-stone-600 text-sm mb-1">注意事项</p>
                <p className="text-stone-700">{result.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* 完整辨证推理过程 */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-lg p-5 mb-4 border-2 border-amber-200">
          <h2 className="text-lg font-bold text-amber-900 mb-4 flex items-center">
            <span className="w-1 h-5 bg-amber-700 rounded mr-2"></span>
            完整辨证推理过程
          </h2>
          
          <div className="space-y-3">
            {reasoningSteps.map((step, index) => (
              <div
                key={index}
                className={`bg-white rounded-lg p-4 ${step.highlight ? 'ring-2 ring-amber-400' : 'border border-amber-100'}`}
              >
                <h3 className={`font-bold mb-2 ${step.highlight ? 'text-amber-800' : 'text-stone-800'}`}>
                  {step.title}
                </h3>
                <p className="text-stone-700 text-sm leading-relaxed whitespace-pre-line">{step.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 用药后饮食注意 */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl shadow-lg p-5 mb-4 border-2 border-amber-200">
          <h2 className="text-lg font-bold text-amber-900 mb-3 flex items-center">
            <span className="w-1 h-5 bg-amber-700 rounded mr-2"></span>
            用药后饮食注意
          </h2>
          <div className="space-y-3 text-sm">
            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <p className="font-semibold text-amber-800 mb-2">❌ 少吃或忌口：</p>
              <ul className="space-y-1 text-stone-700 list-disc list-inside">
                <li>生冷食物（冰饮、凉菜、生鱼片等）</li>
                <li>鱼虾海鲜（寒凉之品，易伤脾胃）</li>
                <li>辛辣刺激（辣椒、花椒、大蒜等）</li>
                <li>水果（多数水果性寒，服药期间少吃）</li>
                <li>牛奶、咖啡（寒凉刺激，影响药效）</li>
              </ul>
            </div>
            <div className="bg-white rounded-lg p-4 border border-amber-200">
              <p className="font-semibold text-amber-800 mb-2">✅ 宜食：</p>
              <ul className="space-y-1 text-stone-700 list-disc list-inside">
                <li>温热饮食（热粥、热汤面等）</li>
                <li>易消化食物（小米粥、山药、大枣等）</li>
                <li>清淡为主，少油少盐</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 锻炼方法 */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg p-5 mb-4 border-2 border-green-200">
          <h2 className="text-lg font-bold text-green-900 mb-3 flex items-center">
            <span className="w-1 h-5 bg-green-700 rounded mr-2"></span>
            郭中仁·道武医锻炼法
          </h2>
          
          <div className="space-y-4 text-sm">
            {/* 站桩 */}
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h3 className="font-bold text-green-900 mb-2">🧘 站桩功（调枢机）</h3>
              <p className="font-semibold text-stone-700 mb-1">【理论依据】</p>
              <p className="text-stone-600 text-xs leading-relaxed mb-3">
                站桩调的就是开阖枢这一套气化。形体中正，枢机才能转，一身阴阳才能正常开阖。
                少阳为阳枢，少阴为阴枢，站桩时脊柱正直，正是调少阴枢；双肩放松，正是调少阳枢。
              </p>
              <p className="font-semibold text-stone-700 mb-1">【动作要领】</p>
              <ol className="text-stone-600 text-xs space-y-1 list-decimal list-inside">
                <li>双脚平行站立，与肩同宽</li>
                <li>双膝微屈，似坐非坐</li>
                <li>双手环抱于胸前，如抱大树</li>
                <li>脊柱正直，头顶如悬</li>
                <li>双肩放松，自然下沉</li>
                <li>呼吸自然，意守丹田</li>
              </ol>
              <p className="text-stone-600 text-xs mt-2">练习时间：每次15-30分钟，每日1-2次</p>
            </div>

            {/* 五行拳 */}
            <div className="bg-white rounded-lg p-4 border border-green-200">
              <h3 className="font-bold text-green-900 mb-2">🤸 五行拳（调五脏）</h3>
              <div className="space-y-2 text-xs">
                <div>
                  <p className="font-semibold text-stone-700">劈拳（金·肺）</p>
                  <p className="text-stone-600">双手如斧劈下，宣肺理气，增强呼吸功能</p>
                </div>
                <div>
                  <p className="font-semibold text-stone-700">钻拳（水·肾）</p>
                  <p className="text-stone-600">双手如钻向上，补肾益精，强健腰膝</p>
                </div>
                <div>
                  <p className="font-semibold text-stone-700">崩拳（木·肝）</p>
                  <p className="text-stone-600">直拳 forward，疏肝理气，调畅情志</p>
                </div>
                <div>
                  <p className="font-semibold text-stone-700">炮拳（火·心）</p>
                  <p className="text-stone-600">双手如炮向上架打，温通心阳，活血通脉</p>
                </div>
                <div>
                  <p className="font-semibold text-stone-700">横拳（土·脾）</p>
                  <p className="text-stone-600">双手如球横拨，健脾和胃，增强消化</p>
                </div>
              </div>
              <p className="text-stone-600 text-xs mt-2">每拳练习5-10遍，全套约20分钟，配合站桩效果更佳</p>
            </div>
          </div>
        </div>

        {/* 免责声明 */}
        <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-200">
          <h3 className="font-bold text-red-900 mb-2 text-center">免责声明</h3>
          <p className="text-stone-600 text-xs text-center leading-relaxed">
            本辨证结果仅供参考，不能替代专业医师的诊断和治疗。
            如有不适，请及时就医。用药请遵医嘱。
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="space-y-3">
          <div className="flex gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 py-3 rounded-lg font-medium bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              {copySuccess ? '已复制' : '复制文字'}
            </button>
            <button
              onClick={handleScreenshot}
              className="flex-1 py-3 rounded-lg font-medium bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              截图保存
            </button>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/')}
              className="flex-1 py-3 rounded-lg font-medium bg-white border-2 border-amber-200 text-stone-700 hover:border-amber-400 transition-all"
            >
              返回首页
            </button>
            <button
              onClick={() => {
                sessionStorage.removeItem('userInfo');
                sessionStorage.removeItem('diagnosisResult');
                router.push('/consultation/info');
              }}
              className="flex-1 py-3 rounded-lg font-medium bg-gradient-to-r from-red-700 to-red-800 text-white hover:from-red-800 hover:to-red-900 transition-all"
            >
              重新问诊
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
