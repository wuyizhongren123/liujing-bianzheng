'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DiagnosisResult {
  userInfo: {
    name: string;
    age: number;
    weight: number;
  };
  meridian: string;
  meridianDetail: string;
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
  interception: string | null;
  interceptionPrescription: string | null;
  ageAdjustment: string;
  dietaryAdvice: string;
  lifestyleAdvice: string;
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
              <p className="text-stone-800 font-medium">{result.userInfo.name}</p>
            </div>
            <div>
              <p className="text-stone-500 text-sm">年龄</p>
              <p className="text-stone-800 font-medium">{result.userInfo.age}岁</p>
            </div>
            <div>
              <p className="text-stone-500 text-sm">体重</p>
              <p className="text-stone-800 font-medium">{result.userInfo.weight}kg</p>
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
            <p className="text-stone-600 text-sm pl-20">{result.meridianDetail}</p>
            <div className="flex items-center">
              <span className="text-stone-600 w-20">证型：</span>
              <span className="text-lg font-medium text-stone-800">{result.syndrome}</span>
            </div>
          </div>
        </div>

        {/* 开合枢截断 */}
        {result.interception && (
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl shadow-lg p-5 mb-4 border-2 border-purple-200">
            <h2 className="text-lg font-bold text-purple-900 mb-3 flex items-center">
              <span className="w-1 h-5 bg-purple-700 rounded mr-2"></span>
              枢机截断
            </h2>
            <p className="text-stone-700 mb-2">{result.interception}</p>
            {result.interceptionPrescription && (
              <p className="text-stone-600 text-sm">
                <span className="font-medium">截断方剂：</span>{result.interceptionPrescription}
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

        {/* 年龄体重调整 */}
        {result.ageAdjustment && (
          <div className="bg-amber-50 rounded-xl shadow p-4 mb-4 border border-amber-200">
            <h3 className="font-bold text-amber-900 mb-2">剂量调整</h3>
            <p className="text-stone-700 text-sm">{result.ageAdjustment}</p>
          </div>
        )}

        {/* 饮食起居建议 */}
        <div className="bg-white rounded-xl shadow-lg p-5 mb-4 border border-amber-200">
          <h2 className="text-lg font-bold text-red-900 mb-3 flex items-center">
            <span className="w-1 h-5 bg-red-700 rounded mr-2"></span>
            调护建议
          </h2>
          <div className="space-y-3">
            <div>
              <p className="text-stone-600 text-sm mb-1">饮食建议</p>
              <p className="text-stone-800">{result.dietaryAdvice}</p>
            </div>
            <div>
              <p className="text-stone-600 text-sm mb-1">起居建议</p>
              <p className="text-stone-800">{result.lifestyleAdvice}</p>
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
