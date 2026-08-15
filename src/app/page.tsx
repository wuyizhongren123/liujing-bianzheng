'use client';

import Link from 'next/link';
import { useState } from 'react';

const BOOK_COVER_URL = '/book-cover.jpg';

export default function Home() {
  const [copied, setCopied] = useState(false);

  const handleCopyWechat = async () => {
    try {
      await navigator.clipboard.writeText('ZRLSGZRLS');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* 顶部导航 */}
      <nav className="bg-amber-900/90 text-amber-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-wide">六经辨证用药指导</h1>
          <div className="flex gap-4 text-sm">
            <Link href="/" className="hover:text-amber-200 transition-colors">首页</Link>
            <Link href="/diagnosis" className="hover:text-amber-200 transition-colors">辨证论治</Link>
            <Link href="/prescriptions" className="hover:text-amber-200 transition-colors">方剂查询</Link>
            <Link href="/herbs" className="hover:text-amber-200 transition-colors">药材百科</Link>
          </div>
        </div>
      </nav>

      {/* 主内容区域 */}
      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* 封面展示区域 */}
        <div className="flex flex-col items-center mb-12">
          <div className="relative group">
            {/* 装饰性阴影 */}
            <div className="absolute -inset-4 bg-amber-200/30 rounded-2xl blur-xl group-hover:bg-amber-200/50 transition-all duration-500" />
            
            {/* 封面图片 */}
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={BOOK_COVER_URL}
                alt="六经辨证用药指导 - 郭中仁"
                className="w-72 md:w-80 h-auto rounded-lg shadow-2xl ring-1 ring-amber-900/10 transition-transform duration-500 group-hover:scale-[1.02] object-cover"
                style={{ objectPosition: 'center top', aspectRatio: '3/4' }}
              />
              {/* 封面底部渐变遮罩 */}
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/40 to-transparent rounded-b-lg" />
            </div>
          </div>

          {/* 作者名 */}
          <div className="mt-8 text-center">
            <p className="text-3xl font-serif text-amber-900 tracking-[0.5em]">郭中仁</p>
            <div className="mt-3 w-24 h-px bg-amber-900/30 mx-auto" />
            <p className="mt-3 text-sm text-amber-700/70 tracking-wider">编著</p>
          </div>
        </div>

        {/* 书籍简介 */}
        <div className="max-w-2xl mx-auto text-center mb-12">
          <p className="text-amber-800/80 leading-relaxed text-base">
            本书以《伤寒论》六经辨证体系为核心，系统梳理太阳、阳明、少阳、太阴、少阴、厥阴六经病证的辨证要点与用药法则，
            为临床中医辨证施治提供实用指导。
          </p>
        </div>

        {/* 六经概览卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          {[
            { name: '太阳病', desc: '表证初起，恶寒发热', color: 'from-blue-50 to-blue-100', accent: 'text-blue-800 border-blue-200' },
            { name: '阳明病', desc: '里热亢盛，大热大渴', color: 'from-red-50 to-red-100', accent: 'text-red-800 border-red-200' },
            { name: '少阳病', desc: '半表半里，寒热往来', color: 'from-green-50 to-green-100', accent: 'text-green-800 border-green-200' },
            { name: '太阴病', desc: '脾虚寒湿，腹满吐利', color: 'from-yellow-50 to-yellow-100', accent: 'text-yellow-800 border-yellow-200' },
            { name: '少阴病', desc: '心肾阳虚，脉微细', color: 'from-purple-50 to-purple-100', accent: 'text-purple-800 border-purple-200' },
            { name: '厥阴病', desc: '寒热错杂，厥热胜复', color: 'from-indigo-50 to-indigo-100', accent: 'text-indigo-800 border-indigo-200' },
          ].map((item) => (
            <Link
              key={item.name}
              href={`/diagnosis?meridian=${encodeURIComponent(item.name)}`}
              className={`group bg-gradient-to-br ${item.color} rounded-xl p-5 border ${item.accent} hover:shadow-lg transition-all duration-300 hover:-translate-y-1`}
            >
              <h3 className={`font-bold text-lg ${item.accent.split(' ')[0]}`}>{item.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
              <span className="inline-block mt-2 text-xs text-gray-500 group-hover:translate-x-1 transition-transform">
                查看详情 →
              </span>
            </Link>
          ))}
        </div>

        {/* 开始辨证入口 */}
        <div className="max-w-xl mx-auto mb-12">
          <Link
            href="/consultation/info"
            className="block bg-gradient-to-r from-red-700 to-red-800 rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1 text-center group"
          >
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">开始十问辨证</h2>
            <p className="text-white/80 text-sm">融合中医十问歌与六经辨证，精准辨证用药</p>
            <span className="inline-block mt-4 px-6 py-2 bg-white/20 rounded-full text-white text-sm group-hover:bg-white/30 transition-colors">
              进入问诊 →
            </span>
          </Link>
        </div>

        {/* 功能入口 */}
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Link
            href="/diagnosis"
            className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-md hover:shadow-xl transition-all border border-amber-100 group"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
              <svg className="w-6 h-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-bold text-amber-900 text-lg">辨证论治</h3>
            <p className="text-sm text-amber-700/70 mt-2">根据症状选择六经证型，获取对应方剂与用药建议</p>
          </Link>

          <Link
            href="/prescriptions"
            className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-md hover:shadow-xl transition-all border border-amber-100 group"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
              <svg className="w-6 h-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h3 className="font-bold text-amber-900 text-lg">方剂查询</h3>
            <p className="text-sm text-amber-700/70 mt-2">浏览经典方剂组成、功效、用量与煎服方法</p>
          </Link>

          <Link
            href="/herbs"
            className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-md hover:shadow-xl transition-all border border-amber-100 group"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-amber-200 transition-colors">
              <svg className="w-6 h-6 text-amber-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="font-bold text-amber-900 text-lg">药材百科</h3>
            <p className="text-sm text-amber-700/70 mt-2">了解常用中药材的性味归经、功效与使用禁忌</p>
          </Link>
        </div>
      </main>

      {/* 底部 */}
      <footer className="bg-amber-900/90 text-amber-100/70 text-center py-6 mt-12">
        <p className="text-sm">六经辨证用药指导 · 郭中仁 编著</p>
        <p className="text-xs mt-1 text-amber-100/50">仅供学习参考，用药请遵医嘱</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-amber-800/50 rounded-lg px-4 py-2 cursor-pointer hover:bg-amber-800/70 transition-colors" onClick={handleCopyWechat}>
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.944 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.062-6.122zm-2.18 2.769c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.969-.982z"/>
          </svg>
          <span className="text-xs text-amber-100/80">微信号：<span className="font-mono text-green-300">ZRLSGZRLS</span></span>
          {copied && <span className="text-xs text-green-300 ml-2">已复制</span>}
        </div>
      </footer>
    </div>
  );
}
