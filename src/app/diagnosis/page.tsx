'use client';

import { useState, useEffect } from 'react';
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

export default function DiagnosisPage() {
  const searchParams = useSearchParams();
  const [meridians, setMeridians] = useState<Meridian[]>([]);
  const [selectedMeridian, setSelectedMeridian] = useState<Meridian | null>(null);
  const [syndromes, setSyndromes] = useState<Syndrome[]>([]);
  const [selectedSyndrome, setSelectedSyndrome] = useState<Syndrome | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
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
    try {
      const res = await fetch(`/api/meridians/${meridian.id}/syndromes`);
      const data = await res.json();
      if (data.success) {
        setSyndromes(data.data);
      }
    } catch (err) {
      console.error('获取证型数据失败:', err);
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
