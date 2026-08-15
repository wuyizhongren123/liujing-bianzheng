'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
	const router = useRouter();
	const [copied, setCopied] = useState(false);

	const handleCopyAmount = () => {
		navigator.clipboard.writeText('10.00');
		setCopied(true);
		setTimeout(() => setCopied(false), 2000);
	};

	const handlePaymentComplete = () => {
		// 生成一个唯一的记录ID
		const recordId = Date.now().toString(36) + Math.random().toString(36).substr(2);
		// 保存支付状态到sessionStorage
		sessionStorage.setItem('paymentVerified', 'true');
		sessionStorage.setItem('paymentRecordId', recordId);
		// 跳转到推理逻辑展示页面
		router.push(`/reasoning/${recordId}`);
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
			{/* 顶部导航 */}
			<header className="bg-gradient-to-r from-amber-800 to-amber-900 text-white shadow-lg">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
							<span className="text-xl">🏠</span>
							<span className="text-lg font-bold">返回首页</span>
						</Link>
						<h1 className="text-xl font-bold">扫码支付</h1>
						<div className="w-20"></div>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8 max-w-lg">
				{/* 支付信息卡片 */}
				<div className="bg-white rounded-2xl shadow-xl overflow-hidden">
					{/* 金额区域 */}
					<div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 text-center">
						<p className="text-sm opacity-90 mb-1">应付金额</p>
						<p className="text-4xl font-bold tracking-wide">¥10.00</p>
					</div>

					{/* 收款码区域 */}
					<div className="p-6">
						<div className="text-center mb-4">
							<p className="text-gray-600 text-sm mb-1">请使用微信扫描二维码</p>
							<p className="text-gray-500 text-xs">完成支付</p>
						</div>

						{/* 收款码图片 */}
						<div className="flex justify-center mb-6">
							<div className="relative w-[280px] h-[280px] rounded-xl overflow-hidden shadow-lg border-4 border-white ring-2 ring-gray-200">
								<Image
									src="/qrcode_payment.jpg"
									alt="微信收款码"
									fill
									className="object-cover"
									priority
								/>
							</div>
						</div>

						{/* 收款人信息 */}
						<div className="text-center space-y-2 mb-6">
							<div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full">
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
								</svg>
								<span className="font-medium">收款人：郭中仁</span>
							</div>
						</div>

						{/* 操作按钮 */}
						<div className="space-y-3">
							<button
								onClick={handleCopyAmount}
								className="w-full py-3 px-4 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
							>
								{copied ? (
									<>
										<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
										</svg>
										已复制金额
									</>
								) : (
									<>
										<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
										</svg>
										复制金额 ¥10.00
									</>
								)}
							</button>

							{/* 已完成支付按钮 */}
							<button
								onClick={handlePaymentComplete}
								className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
								已完成支付，查看推理过程
							</button>
						</div>

						{/* 温馨提示 */}
						<div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
							<h3 className="text-amber-800 font-medium text-sm mb-2 flex items-center gap-1">
								<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
								</svg>
								温馨提示
							</h3>
							<ul className="text-amber-700 text-xs space-y-1">
								<li>• 请确认收款人为「郭中仁」后再付款</li>
								<li>• 付款时请备注您的姓名</li>
								<li>• 付款完成后请截图保存凭证</li>
								<li>• 点击「已完成支付」查看完整辨证推理过程</li>
							</ul>
						</div>
					</div>
				</div>

				{/* 返回首页按钮 */}
				<div className="mt-6 text-center">
					<Link
						href="/"
						className="inline-flex items-center gap-2 text-amber-700 hover:text-amber-900 transition-colors"
					>
						<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
						</svg>
						返回首页
					</Link>
				</div>
			</main>
		</div>
	);
}
