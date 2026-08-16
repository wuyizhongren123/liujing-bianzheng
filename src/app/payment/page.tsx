'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
	const router = useRouter();
	const [countdown, setCountdown] = useState(0);
	const [showTip, setShowTip] = useState(false);
	const qrRef = useRef<HTMLDivElement>(null);
	const longPressTimer = useRef<NodeJS.Timeout | null>(null);

	// 长按二维码处理 - 跳转支付宝
	const handleLongPressStart = () => {
		longPressTimer.current = setTimeout(handleLongPress, 800);
	};

	const handleLongPressEnd = () => {
		if (longPressTimer.current) {
			clearTimeout(longPressTimer.current);
			longPressTimer.current = null;
		}
	};

	const handleLongPress = () => {
		// 跳转到支付宝
		window.location.href = 'alipays://';
	};

	// 点击打开支付宝
	const handleOpenAlipay = () => {
		window.location.href = 'alipays://';
	};

	// 支付完成自动跳转
	const handlePaymentComplete = () => {
		const recordId = Date.now().toString(36) + Math.random().toString(36).substr(2);
		sessionStorage.setItem('paymentVerified', 'true');
		sessionStorage.setItem('paymentRecordId', recordId);
		router.push(`/reasoning/${recordId}`);
	};

	// 开始倒计时自动跳转
	const startCountdown = () => {
		setCountdown(5);
		const timer = setInterval(() => {
			setCountdown((prev) => {
				if (prev <= 1) {
					clearInterval(timer);
					handlePaymentComplete();
					return 0;
				}
				return prev - 1;
			});
		}, 1000);
	};

	// 复制微信号
	const handleCopyWeChat = () => {
		navigator.clipboard.writeText('ZRLSGZRLS');
		setShowTip(true);
		setTimeout(() => setShowTip(false), 2000);
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50">
			{/* 顶部导航 */}
			<header className="bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg">
				<div className="container mx-auto px-4 py-4">
					<div className="flex items-center justify-between">
						<Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
							<span className="text-xl"></span>
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
					<div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 text-center">
						<p className="text-sm opacity-90 mb-1">应付金额</p>
						<p className="text-4xl font-bold tracking-wide">¥10.00</p>
					</div>

					{/* 收款码区域 */}
					<div className="p-6">
						{/* 二维码 - 支持长按 */}
						<div className="text-center mb-6">
							<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
								<p className="text-blue-700 font-medium text-sm">👆 长按下方二维码打开支付宝支付</p>
							</div>

							{/* 二维码容器 - 支持长按 */}
							<div
								ref={qrRef}
								onTouchStart={handleLongPressStart}
								onTouchEnd={handleLongPressEnd}
								onTouchCancel={handleLongPressEnd}
								onContextMenu={(e) => {
									e.preventDefault();
									handleLongPress();
								}}
								className="inline-block cursor-pointer active:scale-95 transition-transform"
							>
								<div className="relative w-[260px] h-[260px] rounded-xl overflow-hidden shadow-lg border-4 border-white ring-2 ring-blue-200 mx-auto">
									<Image
										src="/qrcode_payment.jpg"
										alt="支付宝收款码 - 长按支付"
										fill
										className="object-cover"
										priority
									/>
								</div>
							</div>

							<p className="text-gray-500 text-xs mt-3">
								长按二维码打开支付宝扫码
							</p>
						</div>

						{/* 收款人信息 */}
						<div className="text-center space-y-2 mb-6">
							<div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full">
								<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
									<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
								</svg>
								<span className="font-medium">收款人：郭中仁</span>
							</div>
						</div>

						{/* 操作按钮 */}
						<div className="space-y-3">
							{/* 打开支付宝按钮 */}
							<button
								onClick={handleOpenAlipay}
								className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
							>
								<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
								</svg>
								打开支付宝
							</button>

							{/* 支付完成按钮 - 点击后5秒倒计时自动跳转 */}
							{countdown > 0 ? (
								<div className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl font-bold text-lg shadow-lg flex items-center justify-center gap-2">
									<svg className="w-6 h-6 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
									</svg>
									{countdown}秒后自动进入推理页面...
								</div>
							) : (
								<button
									onClick={startCountdown}
									className="w-full py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
									</svg>
									我已支付，进入推理过程
								</button>
							)}
						</div>

						{/* 温馨提示 */}
						<div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
							<h3 className="text-amber-800 font-medium text-sm mb-2 flex items-center gap-1">
								<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
								</svg>
								支付说明
							</h3>
							<ul className="text-amber-700 text-xs space-y-1">
								<li>• 请确认收款人为「郭中仁」后再付款</li>
								<li>• 付款时请备注您的姓名</li>
								<li>• 支付完成后点击按钮，5秒后自动进入推理页面</li>
								<li>• 长按二维码可直接打开支付宝扫码</li>
							</ul>
						</div>

						{/* 联系方式 */}
						<div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
							<div className="flex items-center justify-center gap-2 flex-wrap">
								<svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
									<path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.944 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.062-6.122zm-2.18 2.769c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.969-.982z"/>
								</svg>
								<span className="text-stone-700 text-sm">如有疑问，请联系微信：</span>
								<button
									onClick={handleCopyWeChat}
									className="font-mono font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
								>
									ZRLSGZRLS
								</button>
								{showTip && (
									<span className="text-blue-600 text-xs animate-pulse">已复制!</span>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* 返回首页按钮 */}
				<div className="mt-6 text-center">
					<Link
						href="/"
						className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 transition-colors"
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
