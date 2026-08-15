'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Herb {
  id: number;
  name: string;
  pinyin_name: string;
  category: string;
  properties: string;
  effects: string;
  indications: string;
  dosage: string;
  contraindications: string;
  notes: string;
}

export default function HerbsPage() {
  const [herbs, setHerbs] = useState<Herb[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHerbs();
  }, []);

  const fetchHerbs = async () => {
    try {
      const res = await fetch('/api/herbs');
      const data = await res.json();
      if (data.success) {
        setHerbs(data.data);
      }
    } catch (err) {
      console.error('获取药材数据失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = Array.from(new Set(herbs.map(h => h.category).filter(Boolean)));

  const filteredHerbs = herbs.filter(h => {
    const matchSearch = !searchTerm ||
      h.name.includes(searchTerm) ||
      h.pinyin_name?.includes(searchTerm) ||
      h.effects?.includes(searchTerm) ||
      h.indications?.includes(searchTerm);
    const matchCategory = !selectedCategory || h.category === selectedCategory;
    return matchSearch && matchCategory;
  });

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
            <Link href="/prescriptions" className="hover:text-amber-200 transition-colors">方剂查询</Link>
            <Link href="/herbs" className="hover:text-amber-200 transition-colors font-semibold">药材百科</Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-amber-900 mb-6">药材百科</h2>

        {/* 搜索和筛选 */}
        <div className="mb-6 space-y-3">
          <input
            type="text"
            placeholder="搜索药材名称、拼音、功效、主治..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border-2 border-amber-200 focus:border-amber-500 focus:outline-none bg-white text-amber-900 placeholder-amber-400"
          />
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  !selectedCategory
                    ? 'bg-amber-700 text-white'
                    : 'bg-white text-amber-700 border border-amber-300 hover:bg-amber-50'
                }`}
              >
                全部
              </button>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    selectedCategory === cat
                      ? 'bg-amber-700 text-white'
                      : 'bg-white text-amber-700 border border-amber-300 hover:bg-amber-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 药材列表 */}
        {filteredHerbs.length > 0 ? (
          <div className="grid gap-4">
            {filteredHerbs.map((herb) => (
              <div key={herb.id} className="bg-white rounded-xl p-6 shadow-md border border-amber-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-amber-900">{herb.name}</h3>
                    {herb.pinyin_name && (
                      <p className="text-sm text-amber-600">{herb.pinyin_name}</p>
                    )}
                  </div>
                  {herb.category && (
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded">
                      {herb.category}
                    </span>
                  )}
                </div>
                <div className="space-y-2 text-sm text-amber-800">
                  {herb.properties && (
                    <div>
                      <span className="font-semibold">性味归经：</span>
                      <span>{herb.properties}</span>
                    </div>
                  )}
                  {herb.effects && (
                    <div>
                      <span className="font-semibold">功效：</span>
                      <span>{herb.effects}</span>
                    </div>
                  )}
                  {herb.indications && (
                    <div>
                      <span className="font-semibold">主治：</span>
                      <span>{herb.indications}</span>
                    </div>
                  )}
                  {herb.dosage && (
                    <div>
                      <span className="font-semibold">常用剂量：</span>
                      <span>{herb.dosage}</span>
                    </div>
                  )}
                  {herb.contraindications && (
                    <div>
                      <span className="font-semibold">禁忌：</span>
                      <span className="text-red-600">{herb.contraindications}</span>
                    </div>
                  )}
                  {herb.notes && (
                    <div>
                      <span className="font-semibold">备注：</span>
                      <span className="italic">{herb.notes}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-amber-600">
            <p className="text-lg">
              {searchTerm || selectedCategory ? '未找到匹配的药材' : '暂无药材数据'}
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
