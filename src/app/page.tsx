import Link from 'next/link';

const BOOK_COVER_URL = 'https://coze-coding-project.tos.coze.site/cli_attachment/2026-08-15/4210475031598347_1fcb33dce8bbeacac841a83259f75a64_coze_image_1786728580891.png?sign=1786849270-952071ab4c-0-083db8427ad52da1b9dc191bf65d73d26d89f4dd74e2729d0d66c7fd4f1200ea';

export default function Home() {
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
            <div className="relative">
              <img
                src={BOOK_COVER_URL}
                alt="六经辨证用药指导 - 郭中仁"
                className="w-72 md:w-80 rounded-lg shadow-2xl ring-1 ring-amber-900/10 transition-transform duration-500 group-hover:scale-[1.02]"
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
      </footer>
    </div>
  );
}
