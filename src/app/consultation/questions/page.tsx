'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserInfo {
  name: string;
  age: number;
  weight: number;
}

interface Answers {
  // 第一问·寒热
  q1_cold: boolean | null;
  q1_fever: boolean | null;
  q1_alternating: boolean | null;
  q1_sweat: '有汗' | '无汗' | '未发热' | null;
  
  // 第二问·汗
  q2_spontaneous: boolean | null;
  q2_night: boolean | null;
  q2_location: '全身' | '头颈' | '胸背' | '手足' | '无明显出汗' | null;
  
  // 第三问·头身
  q3_headache: boolean | null;
  q3_head_location: '前额' | '两侧' | '后脑' | '头顶' | '不痛' | null;
  q3_body_pain: boolean | null;
  q3_body_location: '全身' | '腰背' | '四肢' | '关节' | '不痛' | null;
  q3_heavy: boolean | null;
  
  // 第四问·便
  q4_stool: '正常' | '便秘' | '稀溏' | '腹泻' | '先干后溏' | null;
  q4_urine: '正常' | '尿黄短少' | '尿清长' | '夜尿多' | null;
  
  // 第五问·饮食
  q5_appetite: '正常' | '食欲减退' | '不想吃东西' | '吃后腹胀' | null;
  q5_nausea: boolean | null;
  
  // 第六问·胸
  q6_chest_tight: boolean | null;
  q6_chest_pain: boolean | null;
  q6_hypochondrium: boolean | null;
  q6_palpitation: boolean | null;
  
  // 第七问·聋
  q7_tinnitus: boolean | null;
  q7_hearing: boolean | null;
  
  // 第八问·渴
  q8_thirsty: boolean | null;
  q8_thirst_level: '不渴' | '微渴' | '大渴引饮' | null;
  q8_drink_pref: '喜冷' | '喜热' | '都可以' | '不渴' | null;
  q8_taste: '口苦' | '口甜' | '口淡无味' | '正常' | null;
  
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
  q10_duration: '1-3天' | '4-7天' | '1-2周' | '2周以上' | null;
  q10_cause: '受凉' | '劳累' | '饮食不当' | '情绪波动' | '不清楚' | null;
}

const defaultAnswers: Answers = {
  q1_cold: null, q1_fever: null, q1_alternating: null, q1_sweat: null,
  q2_spontaneous: null, q2_night: null, q2_location: null,
  q3_headache: null, q3_head_location: null, q3_body_pain: null, q3_body_location: null, q3_heavy: null,
  q4_stool: null, q4_urine: null,
  q5_appetite: null, q5_nausea: null,
  q6_chest_tight: null, q6_chest_pain: null, q6_hypochondrium: null, q6_palpitation: null,
  q7_tinnitus: null, q7_hearing: null,
  q8_thirsty: null, q8_thirst_level: null, q8_drink_pref: null, q8_taste: null,
  q9_chronic: null, q9_chronic_desc: '', q9_medicine: null, q9_medicine_desc: '',
  q9_skin: null, q9_skin_desc: '', q9_pain: null, q9_pain_desc: '',
  q10_duration: null, q10_cause: null,
};

export default function QuestionsPage() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>(defaultAnswers);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('userInfo');
    if (stored) {
      setUserInfo(JSON.parse(stored));
    } else {
      router.push('/consultation/info');
    }
  }, [router]);

  const totalSteps = 10;

  const updateAnswer = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return answers.q1_cold !== null && answers.q1_fever !== null && answers.q1_alternating !== null && answers.q1_sweat !== null;
      case 2: return answers.q2_spontaneous !== null && answers.q2_night !== null && answers.q2_location !== null;
      case 3: return answers.q3_headache !== null && answers.q3_head_location !== null && answers.q3_body_pain !== null && answers.q3_body_location !== null && answers.q3_heavy !== null;
      case 4: return answers.q4_stool !== null && answers.q4_urine !== null;
      case 5: return answers.q5_appetite !== null && answers.q5_nausea !== null;
      case 6: return answers.q6_chest_tight !== null && answers.q6_chest_pain !== null && answers.q6_hypochondrium !== null && answers.q6_palpitation !== null;
      case 7: return answers.q7_tinnitus !== null && answers.q7_hearing !== null;
      case 8: return answers.q8_thirsty !== null && answers.q8_thirst_level !== null && answers.q8_drink_pref !== null && answers.q8_taste !== null;
      case 9: return answers.q9_chronic !== null && answers.q9_medicine !== null && answers.q9_skin !== null && answers.q9_pain !== null;
      case 10: return answers.q10_duration !== null && answers.q10_cause !== null;
      default: return true;
    }
  };

  const handleSubmit = async () => {
    if (!userInfo) return;
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/diagnosis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userInfo, answers }),
      });
      
      const result = await response.json();
      if (result.success) {
        // 将 userInfo 添加到结果中，以便 result 页面使用
        const resultWithUserInfo = {
          ...result.data,
          userInfo: userInfo,
          answers: answers,
        };
        sessionStorage.setItem('diagnosisResult', JSON.stringify(resultWithUserInfo));
        router.push('/consultation/result');
      } else {
        alert('辨证失败，请重试');
      }
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userInfo) return null;

  const YesNoButtons = ({ value, onChange }: { value: boolean | null; onChange: (v: boolean) => void }) => (
    <div className="flex gap-3">
      <button onClick={() => onChange(true)} className={`flex-1 py-3 rounded-lg font-medium transition-all ${value === true ? 'bg-red-700 text-white' : 'bg-white border-2 border-amber-200 text-stone-700 hover:border-amber-400'}`}>是</button>
      <button onClick={() => onChange(false)} className={`flex-1 py-3 rounded-lg font-medium transition-all ${value === false ? 'bg-red-700 text-white' : 'bg-white border-2 border-amber-200 text-stone-700 hover:border-amber-400'}`}>否</button>
    </div>
  );

  const OptionButtons = <T extends string>({ options, value, onChange }: { options: T[]; value: T | null; onChange: (v: T) => void }) => (
    <div className="grid grid-cols-2 gap-2">
      {options.map(opt => (
        <button key={opt} onClick={() => onChange(opt)} className={`py-3 px-3 rounded-lg text-sm font-medium transition-all ${value === opt ? 'bg-red-700 text-white' : 'bg-white border-2 border-amber-200 text-stone-700 hover:border-amber-400'}`}>{opt}</button>
      ))}
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6">
              <span className="text-4xl">一</span>
              <h2 className="text-xl font-bold text-red-900 mt-2">问寒热</h2>
            </div>
            <div><p className="text-stone-700 mb-2 font-medium">是否怕冷？</p><YesNoButtons value={answers.q1_cold} onChange={v => updateAnswer('q1_cold', v)} /></div>
            <div><p className="text-stone-700 mb-2 font-medium">是否发热？</p><YesNoButtons value={answers.q1_fever} onChange={v => updateAnswer('q1_fever', v)} /></div>
            <div><p className="text-stone-700 mb-2 font-medium">怕冷和发热是否交替出现？</p><YesNoButtons value={answers.q1_alternating} onChange={v => updateAnswer('q1_alternating', v)} /></div>
            <div><p className="text-stone-700 mb-2 font-medium">如有发热，是否出汗？</p><OptionButtons options={['有汗', '无汗', '未发热']} value={answers.q1_sweat} onChange={v => updateAnswer('q1_sweat', v)} /></div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6"><span className="text-4xl">二</span><h2 className="text-xl font-bold text-red-900 mt-2">问汗</h2></div>
            <div><p className="text-stone-700 mb-2 font-medium">是否容易出汗（自汗）？</p><YesNoButtons value={answers.q2_spontaneous} onChange={v => updateAnswer('q2_spontaneous', v)} /></div>
            <div><p className="text-stone-700 mb-2 font-medium">是否夜间盗汗？</p><YesNoButtons value={answers.q2_night} onChange={v => updateAnswer('q2_night', v)} /></div>
            <div><p className="text-stone-700 mb-2 font-medium">出汗部位？</p><OptionButtons options={['全身', '头颈', '胸背', '手足', '无明显出汗']} value={answers.q2_location} onChange={v => updateAnswer('q2_location', v)} /></div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6"><span className="text-4xl">三</span><h2 className="text-xl font-bold text-red-900 mt-2">问头身</h2></div>
            <div><p className="text-stone-700 mb-2 font-medium">是否头痛？</p><YesNoButtons value={answers.q3_headache} onChange={v => updateAnswer('q3_headache', v)} /></div>
            <div><p className="text-stone-700 mb-2 font-medium">头痛部位？</p><OptionButtons options={['前额', '两侧', '后脑', '头顶', '不痛']} value={answers.q3_head_location} onChange={v => updateAnswer('q3_head_location', v)} /></div>
            <div><p className="text-stone-700 mb-2 font-medium">是否身体疼痛？</p><YesNoButtons value={answers.q3_body_pain} onChange={v => updateAnswer('q3_body_pain', v)} /></div>
            <div><p className="text-stone-700 mb-2 font-medium">疼痛部位？</p><OptionButtons options={['全身', '腰背', '四肢', '关节', '不痛']} value={answers.q3_body_location} onChange={v => updateAnswer('q3_body_location', v)} /></div>
            <div><p className="text-stone-700 mb-2 font-medium">是否感觉沉重困倦？</p><YesNoButtons value={answers.q3_heavy} onChange={v => updateAnswer('q3_heavy', v)} /></div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6"><span className="text-4xl">四</span><h2 className="text-xl font-bold text-red-900 mt-2">问便</h2></div>
            <div><p className="text-stone-700 mb-2 font-medium">大便情况？</p><OptionButtons options={['正常', '便秘', '稀溏', '腹泻', '先干后溏']} value={answers.q4_stool} onChange={v => updateAnswer('q4_stool', v)} /></div>
            <div><p className="text-stone-700 mb-2 font-medium">小便情况？</p><OptionButtons options={['正常', '尿黄短少', '尿清长', '夜尿多']} value={answers.q4_urine} onChange={v => updateAnswer('q4_urine', v)} /></div>
          </div>
        );
      case 5:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6"><span className="text-4xl">五</span><h2 className="text-xl font-bold text-red-900 mt-2">问饮食</h2></div>
            <div><p className="text-stone-700 mb-2 font-medium">食欲如何？</p><OptionButtons options={['正常', '食欲减退', '不想吃东西', '吃后腹胀']} value={answers.q5_appetite} onChange={v => updateAnswer('q5_appetite', v)} /></div>
            <div><p className="text-stone-700 mb-2 font-medium">是否有恶心呕吐？</p><YesNoButtons value={answers.q5_nausea} onChange={v => updateAnswer('q5_nausea', v)} /></div>
          </div>
        );
      case 6:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6"><span className="text-4xl">六</span><h2 className="text-xl font-bold text-red-900 mt-2">问胸</h2></div>
            <div><p className="text-stone-700 mb-2 font-medium">是否胸闷？</p><YesNoButtons value={answers.q6_chest_tight} onChange={v => updateAnswer('q6_chest_tight', v)} /></div>
            <div><p className="text-stone-700 mb-2 font-medium">是否胸痛？</p><YesNoButtons value={answers.q6_chest_pain} onChange={v => updateAnswer('q6_chest_pain', v)} /></div>
            <div><p className="text-stone-700 mb-2 font-medium">是否胸胁部胀满不适？</p><YesNoButtons value={answers.q6_hypochondrium} onChange={v => updateAnswer('q6_hypochondrium', v)} /></div>
            <div><p className="text-stone-700 mb-2 font-medium">是否心悸？</p><YesNoButtons value={answers.q6_palpitation} onChange={v => updateAnswer('q6_palpitation', v)} /></div>
          </div>
        );
      case 7:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6"><span className="text-4xl">七</span><h2 className="text-xl font-bold text-red-900 mt-2">问聋</h2></div>
            <div><p className="text-stone-700 mb-2 font-medium">是否耳鸣？</p><YesNoButtons value={answers.q7_tinnitus} onChange={v => updateAnswer('q7_tinnitus', v)} /></div>
            <div><p className="text-stone-700 mb-2 font-medium">是否听力下降？</p><YesNoButtons value={answers.q7_hearing} onChange={v => updateAnswer('q7_hearing', v)} /></div>
          </div>
        );
      case 8:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6"><span className="text-4xl">八</span><h2 className="text-xl font-bold text-red-900 mt-2">问渴</h2></div>
            <div><p className="text-stone-700 mb-2 font-medium">是否口渴？</p><YesNoButtons value={answers.q8_thirsty} onChange={v => updateAnswer('q8_thirsty', v)} /></div>
            <div><p className="text-stone-700 mb-2 font-medium">口渴程度？</p><OptionButtons options={['不渴', '微渴', '大渴引饮']} value={answers.q8_thirst_level} onChange={v => updateAnswer('q8_thirst_level', v)} /></div>
            <div><p className="text-stone-700 mb-2 font-medium">喜饮冷水还是热水？</p><OptionButtons options={['喜冷', '喜热', '都可以', '不渴']} value={answers.q8_drink_pref} onChange={v => updateAnswer('q8_drink_pref', v)} /></div>
            <div><p className="text-stone-700 mb-2 font-medium">口中有无异常味道？</p><OptionButtons options={['口苦', '口甜', '口淡无味', '正常']} value={answers.q8_taste} onChange={v => updateAnswer('q8_taste', v)} /></div>
          </div>
        );
      case 9:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6"><span className="text-4xl">九</span><h2 className="text-xl font-bold text-red-900 mt-2">问旧病</h2></div>
            <div>
              <p className="text-stone-700 mb-2 font-medium">有无慢性病史？</p>
              <YesNoButtons value={answers.q9_chronic} onChange={v => updateAnswer('q9_chronic', v)} />
              {answers.q9_chronic && <input type="text" value={answers.q9_chronic_desc} onChange={e => updateAnswer('q9_chronic_desc', e.target.value)} className="w-full mt-2 px-3 py-2 rounded-lg border-2 border-amber-200 focus:border-amber-500 focus:outline-none" placeholder="请说明慢性病史" />}
            </div>
            <div>
              <p className="text-stone-700 mb-2 font-medium">有无正在服用的西药？</p>
              <YesNoButtons value={answers.q9_medicine} onChange={v => updateAnswer('q9_medicine', v)} />
              {answers.q9_medicine && <input type="text" value={answers.q9_medicine_desc} onChange={e => updateAnswer('q9_medicine_desc', e.target.value)} className="w-full mt-2 px-3 py-2 rounded-lg border-2 border-amber-200 focus:border-amber-500 focus:outline-none" placeholder="请说明药名" />}
            </div>
            <div>
              <p className="text-stone-700 mb-2 font-medium">有无皮肤疾病？</p>
              <YesNoButtons value={answers.q9_skin} onChange={v => updateAnswer('q9_skin', v)} />
              {answers.q9_skin && <input type="text" value={answers.q9_skin_desc} onChange={e => updateAnswer('q9_skin_desc', e.target.value)} className="w-full mt-2 px-3 py-2 rounded-lg border-2 border-amber-200 focus:border-amber-500 focus:outline-none" placeholder="请说明皮肤疾病" />}
            </div>
            <div>
              <p className="text-stone-700 mb-2 font-medium">有无长期疼痛问题？</p>
              <YesNoButtons value={answers.q9_pain} onChange={v => updateAnswer('q9_pain', v)} />
              {answers.q9_pain && <input type="text" value={answers.q9_pain_desc} onChange={e => updateAnswer('q9_pain_desc', e.target.value)} className="w-full mt-2 px-3 py-2 rounded-lg border-2 border-amber-200 focus:border-amber-500 focus:outline-none" placeholder="请说明疼痛部位" />}
            </div>
          </div>
        );
      case 10:
        return (
          <div className="space-y-5">
            <div className="text-center mb-6"><span className="text-4xl">十</span><h2 className="text-xl font-bold text-red-900 mt-2">问因</h2></div>
            <div><p className="text-stone-700 mb-2 font-medium">发病多久了？</p><OptionButtons options={['1-3天', '4-7天', '1-2周', '2周以上']} value={answers.q10_duration} onChange={v => updateAnswer('q10_duration', v)} /></div>
            <div><p className="text-stone-700 mb-2 font-medium">有无明显诱因？</p><OptionButtons options={['受凉', '劳累', '饮食不当', '情绪波动', '不清楚']} value={answers.q10_cause} onChange={v => updateAnswer('q10_cause', v)} /></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      <div className="bg-gradient-to-r from-red-800 to-red-900 h-2"></div>
      
      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* 进度条 */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-stone-600 mb-2">
            <span>第 {currentStep} 问 / 共 {totalSteps} 问</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-600 to-red-800 transition-all duration-300" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
          </div>
        </div>

        {/* 问题卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-amber-200 min-h-[400px]">
          {renderStep()}
        </div>

        {/* 导航按钮 */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white border-2 border-amber-200 text-stone-700 hover:border-amber-400"
          >
            ← 上一问
          </button>
          
          {currentStep < totalSteps ? (
            <button
              onClick={() => canProceed() && setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
              className="px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-red-700 to-red-800 text-white hover:from-red-800 hover:to-red-900"
            >
              下一问 →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-red-700 to-red-800 text-white hover:from-red-800 hover:to-red-900"
            >
              {isSubmitting ? '辨证中...' : '完成问诊'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
