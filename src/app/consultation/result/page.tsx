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

  useEffect(() => {
    const stored = sessionStorage.getItem('diagnosisResult');
    if (stored) {
      setResult(JSON.parse(stored));
    } else {
      router.push('/consultation/info');
    }
  }, [router]);

  if (!result) return null;

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

        {/* 开合枢截断 */}
        {result.interception?.reason && (
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg p-5 mb-4 border-2 border-purple-200">
            <h2 className="text-lg font-bold text-purple-900 mb-3 flex items-center">
              <span className="w-1 h-5 bg-purple-700 rounded mr-2"></span>
              枢机截断
            </h2>
            <p className="text-stone-700 mb-2">{result.interception.reason}</p>
            {result.interception.combinedPrescription && (
              <p className="text-stone-600 text-sm">
                <span className="font-medium">截断方剂：</span>{result.interception.combinedPrescription}
              </p>
            )}
          </div>
        )}

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
            
            {result.contraindications && (
              <div>
                <p className="text-stone-600 text-sm mb-1">禁忌</p>
                <p className="text-red-700">{result.contraindications}</p>
              </div>
            )}
            
            {result.notes && (
              <div>
                <p className="text-stone-600 text-sm mb-1">注意事项</p>
                <p className="text-stone-700">{result.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* 剂量说明 */}
        {result.dosage && (
          <div className="bg-amber-50 rounded-xl shadow p-4 mb-4 border border-amber-200">
            <h3 className="font-bold text-amber-900 mb-2">剂量说明</h3>
            <p className="text-stone-700 text-sm">{result.dosage}</p>
          </div>
        )}

        {/* 免责声明 */}
        <div className="bg-red-50 rounded-xl p-4 mb-6 border border-red-200">
          <h3 className="font-bold text-red-900 mb-2 text-center">免责声明</h3>
          <p className="text-stone-600 text-xs text-center leading-relaxed">
            本辨证结果仅供参考，不能替代专业医师的诊断和治疗。
            如有不适，请及时就医。用药请遵医嘱。
          </p>
        </div>

        {/* 查看推理过程 - 付费 */}
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-xl shadow-lg p-5 mb-4 border-2 border-amber-300">
          <div className="text-center">
            <h3 className="text-lg font-bold text-amber-900 mb-3">查看完整辨证推理过程</h3>
            <div className="bg-white/60 rounded-lg p-4 mb-4 text-left">
              <p className="text-stone-700 text-sm mb-2">
                <span className="font-bold text-amber-800">付费后您将看到：</span>
              </p>
              <ul className="text-stone-600 text-sm space-y-1.5 list-disc list-inside">
                <li>完整的六经辨证推理过程（十问→评分→辨证）</li>
                <li>开阖枢截断理论详解（为什么合用枢机方剂）</li>
                <li>三阴病传变路径分析</li>
                <li>用药后饮食注意事项</li>
                <li>郭中仁书中锻炼方法（站桩 + 五行拳）</li>
              </ul>
            </div>
            <button
              onClick={() => {
                // 保存当前结果到sessionStorage，用于推理页面
                sessionStorage.setItem('pendingReasoning', JSON.stringify(result));
                router.push('/payment');
              }}
              className="w-full py-4 px-6 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              查看辨证推理过程 ¥10
            </button>
          </div>
        </div>

        {/* 操作按钮 */}
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
  );
}
