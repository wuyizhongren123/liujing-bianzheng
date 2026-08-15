'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Meridian {
  id: number;
  name: string;
  description: string;
  pathogenesis: string;
  main_symptoms: string;
  sort_order: number;
}

interface Syndrome {
  id: number;
  meridian_id: number;
  name: string;
  description: string;
  symptoms: string;
  tongue_presentation: string;
  pulse_presentation: string;
  pathogenesis: string;
  treatment_principle: string;
  sort_order: number;
}

interface Prescription {
  id: number;
  syndrome_id: number;
  name: string;
  composition: string;
  dosage: string;
  preparation: string;
  usage: string;
  effects: string;
  indications: string;
  contraindications: string;
  notes: string;
  sort_order: number;
}

interface InterceptionPrescription {
  id: number;
  transmission_id: number;
  syndrome_id: number | null;
  name: string;
  base_prescription: string;
  additional_herbs: string;
  composition: string;
  effects: string;
  indications: string;
  usage_notes: string;
  interception_purpose: string;
  sort_order: number;
}

interface Transmission {
  id: number;
  source_meridian_id: number;
  target_meridian_id: number;
  target_meridian_name: string;
  transmission_type: string;
  warning_symptoms: string;
  interception_principle: string;
  interception_method: string;
  herb_additions: string;
  combined_prescription: string;
  combined_prescription_desc: string;
  purpose: string;
  sort_order: number;
  interception_prescriptions: InterceptionPrescription[];
}

function DiagnosisContent() {
  const searchParams = useSearchParams();
  const [meridians, setMeridians] = useState<Meridian[]>([]);
  const [selectedMeridian, setSelectedMeridian] = useState<Meridian | null>(null);
  const [syndromes, setSyndromes] = useState<Syndrome[]>([]);
  const [selectedSyndrome, setSelectedSyndrome] = useState<Syndrome | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [transmissions, setTransmissions] = useState<Transmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeridians();
  }, []);

  useEffect(() => {
    const meridianName = searchParams.get('meridian');
    if (meridianName && meridians.length > 0) {
      const meridian = meridians.find(m => m.name === meridianName);
      if (meridian) {
        handleMeridianSelect(meridian);
      }
    }
  }, [meridians, searchParams]);

  const fetchMeridians = async () => {
    try {
      const res = await fetch('/api/meridians');
      const data = await res.json();
      if (data.success) {
        setMeridians(data.data);
      }
    } catch (err) {
      console.error('获取六经数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMeridianSelect = async (meridian: Meridian) => {
    setSelectedMeridian(meridian);
    setSelectedSyndrome(null);
    setPrescriptions([]);
    setTransmissions([]);
    try {
      // 并行获取证型和传变关系
      const [syndromeRes, transmissionRes] = await Promise.all([
        fetch(`/api/meridians/${meridian.id}/syndromes`),
        fetch(`/api/meridians/${meridian.id}/transmissions`),
      ]);
      const syndromeData = await syndromeRes.json();
      const transmissionData = await transmissionRes.json();
      if (syndromeData.success) {
        setSyndromes(syndromeData.data);
      }
      if (transmissionData.success) {
        setTransmissions(transmissionData.data);
      }
    } catch (err) {
      console.error('获取数据失败:', err);
    }
  };

  const handleSyndromeSelect = async (syndrome: Syndrome) => {
    setSelectedSyndrome(syndrome);
    try {
      const res = await fetch(`/api/syndromes/${syndrome.id}/prescriptions`);
      const data = await res.json();
      if (data.success) {
        setPrescriptions(data.data);
      }
    } catch (err) {
      console.error('获取方剂数据失败:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
        <p className="text-amber-700">加载中...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* 导航 */}
      <nav className="bg-amber-900/90 text-amber-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-wide">六经辨证用药指导</h1>
          <div className="flex gap-4 text-sm">
            <Link href="/" className="hover:text-amber-200 transition-colors">首页</Link>
            <Link href="/diagnosis" className="hover:text-amber-200 transition-colors font-semibold">辨证论治</Link>
            <Link href="/prescriptions" className="hover:text-amber-200 transition-colors">方剂查询</Link>
            <Link href="/herbs" className="hover:text-amber-200 transition-colors">药材百科</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-amber-900 mb-6">辨证论治</h2>

        {/* 六经选择 */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-amber-800 mb-3">选择经络</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {meridians.map((meridian) => (
              <button
                key={meridian.id}
                onClick={() => handleMeridianSelect(meridian)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMeridian?.id === meridian.id
                    ? 'bg-amber-700 text-white border-amber-700 shadow-lg'
                    : 'bg-white border-amber-200 text-amber-800 hover:border-amber-400 hover:shadow-md'
                }`}
              >
                <div className="font-bold text-lg">{meridian.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 经络详情 */}
        {selectedMeridian && (
          <div className="mb-8 bg-white rounded-xl p-6 shadow-md border border-amber-100">
            <h3 className="text-xl font-bold text-amber-900 mb-4">{selectedMeridian.name}</h3>
            <div className="space-y-3 text-amber-800">
              {selectedMeridian.description && (
                <div>
                  <span className="font-semibold">概述：</span>
                  <span>{selectedMeridian.description}</span>
                </div>
              )}
              {selectedMeridian.pathogenesis && (
                <div>
                  <span className="font-semibold">病机：</span>
                  <span>{selectedMeridian.pathogenesis}</span>
                </div>
              )}
              {selectedMeridian.main_symptoms && (
                <div>
                  <span className="font-semibold">主要症状：</span>
                  <span>{selectedMeridian.main_symptoms}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 枢机截断板块 - 基于开合枢理论 */}
        {selectedMeridian && transmissions.length > 0 && (
          <div className="mb-8 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 rounded-xl p-6 shadow-lg border-2 border-purple-300">
            {/* 板块标题 */}
            <div className="flex items-center gap-3 mb-4 pb-4 border-b-2 border-purple-200">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-purple-900">枢机截断</h3>
                <p className="text-sm text-purple-700">基于开合枢理论 · 抓住少阳、少阴二枢</p>
              </div>
            </div>

            {/* 开合枢理论说明 */}
            <div className="mb-5 bg-white/70 rounded-lg p-4 border border-purple-100">
              <h4 className="font-bold text-purple-800 mb-2 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                开合枢理论
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="bg-amber-50 rounded p-2 border border-amber-200">
                  <span className="font-semibold text-amber-800">太阳为开</span>
                  <span className="text-amber-700 ml-1">· 太阴为合</span>
                </div>
                <div className="bg-purple-50 rounded p-2 border border-purple-200">
                  <span className="font-bold text-purple-800">少阳为枢</span>
                  <span className="text-purple-700 ml-1">· </span>
                  <span className="font-bold text-purple-800">少阴为枢</span>
                </div>
                <div className="bg-blue-50 rounded p-2 border border-blue-200">
                  <span className="font-semibold text-blue-800">阳明为合</span>
                  <span className="text-blue-700 ml-1">· 厥阴为合</span>
                </div>
              </div>
              <p className="text-xs text-purple-600 mt-2">
                核心策略：无论何经病，只要见枢机不利之象，必调其枢。少阳枢用小柴胡汤，少阴枢用四逆汤。
              </p>
            </div>

            {/* 枢机重点提示 */}
            <div className="mb-5 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 border border-orange-200">
                <h5 className="font-bold text-orange-800 mb-1 flex items-center gap-1">
                  <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold">阳</span>
                  少阳枢（半表半里之枢）
                </h5>
                <p className="text-xs text-orange-700">
                  <span className="font-semibold">辨证要点：</span>口苦、咽干、目眩、胸胁苦满、寒热往来
                </p>
                <p className="text-xs text-orange-700 mt-1">
                  <span className="font-semibold">核心方剂：</span>小柴胡汤
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                <h5 className="font-bold text-blue-800 mb-1 flex items-center gap-1">
                  <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">阴</span>
                  少阴枢（阴阳之枢）
                </h5>
                <p className="text-xs text-blue-700">
                  <span className="font-semibold">辨证要点：</span>脉微细、但欲寐、四肢厥逆、精神萎靡
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  <span className="font-semibold">核心方剂：</span>四逆汤
                </p>
              </div>
            </div>

            {/* 传变预警列表 */}
            <p className="text-sm text-purple-700 mb-4 font-semibold">
              {selectedMeridian.name}枢机传变趋势与截断方案：
            </p>
            
            <div className="space-y-5">
              {transmissions.map((transmission) => {
                // 判断是否为枢机传变
                const isShaoyangPivot = transmission.target_meridian_name === '少阳病';
                const isShaoyinPivot = transmission.target_meridian_name === '少阴病';
                const pivotType = isShaoyangPivot ? '少阳枢' : isShaoyinPivot ? '少阴枢' : '';
                const pivotColor = isShaoyangPivot ? 'orange' : isShaoyinPivot ? 'blue' : 'gray';
                
                return (
                  <div key={transmission.id} className={`bg-white rounded-lg p-5 border-2 ${
                    isShaoyangPivot ? 'border-orange-300 shadow-orange-100' : 
                    isShaoyinPivot ? 'border-blue-300 shadow-blue-100' : 
                    'border-purple-100'
                  } shadow-md`}>
                    {/* 传变方向与枢机标识 */}
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-semibold">
                        {selectedMeridian.name}
                      </span>
                      <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        isShaoyangPivot ? 'bg-orange-100 text-orange-800' : 
                        isShaoyinPivot ? 'bg-blue-100 text-blue-800' : 
                        'bg-red-100 text-red-800'
                      }`}>
                        {transmission.target_meridian_name}
                      </span>
                      {pivotType && (
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                          isShaoyangPivot ? 'bg-orange-500 text-white' : 'bg-blue-600 text-white'
                        }`}>
                          {pivotType}
                        </span>
                      )}
                      {transmission.transmission_type && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                          {transmission.transmission_type}
                        </span>
                      )}
                    </div>

                    {/* 枢机不利先兆 */}
                    {transmission.warning_symptoms && (
                      <div className="mb-3">
                        <span className={`font-semibold ${
                          isShaoyangPivot ? 'text-orange-700' : 
                          isShaoyinPivot ? 'text-blue-700' : 'text-purple-700'
                        }`}>
                          {pivotType ? `${pivotType}不利先兆：` : '传变先兆：'}
                        </span>
                        <span className="text-gray-800">{transmission.warning_symptoms}</span>
                      </div>
                    )}

                    {/* 截断原则 */}
                    {transmission.interception_principle && (
                      <div className="mb-3">
                        <span className="font-semibold text-purple-700">截断原则：</span>
                        <span className="text-gray-800">{transmission.interception_principle}</span>
                      </div>
                    )}

                    {/* 截断方法 */}
                    {transmission.interception_method && (
                      <div className="mb-3">
                        <span className="font-semibold text-purple-700">截断方法：</span>
                        <p className="text-gray-800 mt-1">{transmission.interception_method}</p>
                      </div>
                    )}

                    {/* 加味药物 */}
                    {transmission.herb_additions && (
                      <div className="mb-3">
                        <span className="font-semibold text-purple-700">加味药物：</span>
                        <span className="text-gray-800">{transmission.herb_additions}</span>
                      </div>
                    )}

                    {/* 截断目的 */}
                    {transmission.purpose && (
                      <div className="mb-3">
                        <span className="font-semibold text-purple-700">截断目的：</span>
                        <span className="text-green-700 font-medium">{transmission.purpose}</span>
                      </div>
                    )}

                    {/* 截断方剂 */}
                    {transmission.interception_prescriptions && transmission.interception_prescriptions.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-purple-100">
                        <h5 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                          推荐枢机合方：
                        </h5>
                        <div className="space-y-3">
                          {transmission.interception_prescriptions.map((presc) => (
                            <div key={presc.id} className={`rounded-lg p-4 border-2 ${
                              isShaoyangPivot ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200' : 
                              isShaoyinPivot ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' : 
                              'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                            }`}>
                              <h6 className={`font-bold mb-2 ${
                                isShaoyangPivot ? 'text-orange-800' : 
                                isShaoyinPivot ? 'text-blue-800' : 'text-green-800'
                              }`}>{presc.name}</h6>
                              {presc.base_prescription && (
                                <div className="text-sm mb-1">
                                  <span className={`font-semibold ${
                                    isShaoyangPivot ? 'text-orange-700' : 
                                    isShaoyinPivot ? 'text-blue-700' : 'text-green-700'
                                  }`}>基础方：</span>
                                  <span className="text-gray-700">{presc.base_prescription}</span>
                                </div>
                              )}
                              {presc.additional_herbs && (
                                <div className="text-sm mb-1">
                                  <span className={`font-semibold ${
                                    isShaoyangPivot ? 'text-orange-700' : 
                                    isShaoyinPivot ? 'text-blue-700' : 'text-green-700'
                                  }`}>加味：</span>
                                  <span className="text-gray-700">{presc.additional_herbs}</span>
                                </div>
                              )}
                              {presc.composition && (
                                <div className="text-sm mb-1">
                                  <span className={`font-semibold ${
                                    isShaoyangPivot ? 'text-orange-700' : 
                                    isShaoyinPivot ? 'text-blue-700' : 'text-green-700'
                                  }`}>组成：</span>
                                  <span className="text-gray-700">{presc.composition}</span>
                                </div>
                              )}
                              {presc.effects && (
                                <div className="text-sm mb-1">
                                  <span className={`font-semibold ${
                                    isShaoyangPivot ? 'text-orange-700' : 
                                    isShaoyinPivot ? 'text-blue-700' : 'text-green-700'
                                  }`}>功效：</span>
                                  <span className="text-gray-700">{presc.effects}</span>
                                </div>
                              )}
                              {presc.indications && (
                                <div className="text-sm mb-1">
                                  <span className={`font-semibold ${
                                    isShaoyangPivot ? 'text-orange-700' : 
                                    isShaoyinPivot ? 'text-blue-700' : 'text-green-700'
                                  }`}>主治：</span>
                                  <span className="text-gray-700">{presc.indications}</span>
                                </div>
                              )}
                              {presc.interception_purpose && (
                                <div className="text-sm mb-1">
                                  <span className="font-semibold text-emerald-700">截断目的：</span>
                                  <span className="text-emerald-700 font-medium">{presc.interception_purpose}</span>
                                </div>
                              )}
                              {presc.usage_notes && (
                                <div className="text-sm mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                                  <span className="font-semibold text-yellow-700">使用注意：</span>
                                  <span className="text-yellow-800">{presc.usage_notes}</span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 证型选择 */}
        {syndromes.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-amber-800 mb-3">选择证型</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {syndromes.map((syndrome) => (
                <button
                  key={syndrome.id}
                  onClick={() => handleSyndromeSelect(syndrome)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    selectedSyndrome?.id === syndrome.id
                      ? 'bg-amber-700 text-white border-amber-700 shadow-lg'
                      : 'bg-white border-amber-200 text-amber-800 hover:border-amber-400 hover:shadow-md'
                  }`}
                >
                  <div className="font-bold">{syndrome.name}</div>
                  {syndrome.description && (
                    <div className="text-sm mt-1 opacity-80">{syndrome.description}</div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 证型详情 */}
        {selectedSyndrome && (
          <div className="mb-8 bg-white rounded-xl p-6 shadow-md border border-amber-100">
            <h3 className="text-xl font-bold text-amber-900 mb-4">{selectedSyndrome.name}</h3>
            <div className="space-y-3 text-amber-800">
              {selectedSyndrome.symptoms && (
                <div>
                  <span className="font-semibold">症状表现：</span>
                  <p className="mt-1">{selectedSyndrome.symptoms}</p>
                </div>
              )}
              {selectedSyndrome.tongue_presentation && (
                <div>
                  <span className="font-semibold">舌象：</span>
                  <span>{selectedSyndrome.tongue_presentation}</span>
                </div>
              )}
              {selectedSyndrome.pulse_presentation && (
                <div>
                  <span className="font-semibold">脉象：</span>
                  <span>{selectedSyndrome.pulse_presentation}</span>
                </div>
              )}
              {selectedSyndrome.pathogenesis && (
                <div>
                  <span className="font-semibold">病机分析：</span>
                  <p className="mt-1">{selectedSyndrome.pathogenesis}</p>
                </div>
              )}
              {selectedSyndrome.treatment_principle && (
                <div>
                  <span className="font-semibold">治法：</span>
                  <span>{selectedSyndrome.treatment_principle}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 方剂列表 */}
        {prescriptions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-amber-800 mb-3">推荐方剂</h3>
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="bg-white rounded-xl p-6 shadow-md border border-amber-100">
                  <h4 className="text-lg font-bold text-amber-900 mb-3">{prescription.name}</h4>
                  <div className="space-y-2 text-sm text-amber-800">
                    {prescription.composition && (
                      <div>
                        <span className="font-semibold">组成：</span>
                        <span>{prescription.composition}</span>
                      </div>
                    )}
                    {prescription.dosage && (
                      <div>
                        <span className="font-semibold">用量：</span>
                        <span>{prescription.dosage}</span>
                      </div>
                    )}
                    {prescription.preparation && (
                      <div>
                        <span className="font-semibold">制法：</span>
                        <span>{prescription.preparation}</span>
                      </div>
                    )}
                    {prescription.usage && (
                      <div>
                        <span className="font-semibold">用法：</span>
                        <span>{prescription.usage}</span>
                      </div>
                    )}
                    {prescription.effects && (
                      <div>
                        <span className="font-semibold">功效：</span>
                        <span>{prescription.effects}</span>
                      </div>
                    )}
                    {prescription.indications && (
                      <div>
                        <span className="font-semibold">主治：</span>
                        <span>{prescription.indications}</span>
                      </div>
                    )}
                    {prescription.contraindications && (
                      <div>
                        <span className="font-semibold">禁忌：</span>
                        <span className="text-red-600">{prescription.contraindications}</span>
                      </div>
                    )}
                    {prescription.notes && (
                      <div>
                        <span className="font-semibold">备注：</span>
                        <span className="italic">{prescription.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 空状态 */}
        {!selectedMeridian && (
          <div className="text-center py-12 text-amber-600">
            <p className="text-lg">请选择一个经络开始辨证</p>
          </div>
        )}
      </main>

      {/* 底部 */}
      <footer className="bg-amber-900/90 text-amber-100/70 text-center py-6 mt-12">
        <p className="text-sm">六经辨证用药指导 · 郭中仁 编著</p>
        <p className="text-xs mt-1 text-amber-100/50">仅供学习参考，用药请遵医嘱</p>
      </footer>
    </div>
  );
}

export default function DiagnosisPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="text-amber-800 text-lg">加载中...</div>
      </div>
    }>
      <DiagnosisContent />
    </Suspense>
  );
}
