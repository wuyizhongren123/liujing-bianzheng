'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Prescription {
  id: number;
  syndrome_id: number;
  name: string;
  composition: string;
  dosage: string;
  effects: string;
  indications: string;
  sort_order: number;
}

export default function PrescriptionsPage() {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await fetch('/api/prescriptions');
      const data = await res.json();
      if (data.success) {
        setPrescriptions(data.data);
      }
    } catch (err) {
      console.error('获取方剂数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrescriptions = prescriptions.filter(p =>
    p.name.includes(searchTerm) ||
    p.composition?.includes(searchTerm) ||
    p.effects?.includes(searchTerm) ||
    p.indications?.includes(searchTerm)
  );

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
            <Link href="/diagnosis" className="hover:text-amber-200 transition-colors">辨证论治</Link>
            <Link href="/prescriptions" className="hover:text-amber-200 transition-colors font-semibold">方剂查询</Link>
            <Link href="/herbs" className="hover:text-amber-200 transition-colors">药材百科</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-amber-900 mb-6">方剂查询</h2>

        {/* 搜索框 */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="搜索方剂名称、组成、功效、主治..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white text-amber-900 placeholder-amber-400"
          />
        </div>

        {/* 方剂列表 */}
        {filteredPrescriptions.length > 0 ? (
          <div className="grid gap-4">
            {filteredPrescriptions.map((prescription) => (
              <div key={prescription.id} className="bg-white rounded-xl p-6 shadow-md border border-amber-100">
                <h3 className="text-lg font-bold text-amber-900 mb-3">{prescription.name}</h3>
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
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-amber-600">
            <p className="text-lg">
              {searchTerm ? '未找到匹配的方剂' : '暂无方剂数据'}
            </p>
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
