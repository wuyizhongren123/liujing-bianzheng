'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
	const router = useRouter();
	const [isWeChat, setIsWeChat] = useState(false);
	const [countdown, setCountdown] = useState(0);
	const [showTip, setShowTip] = useState(false);
	const qrRef = useRef<HTMLDivElement>(null);
	const longPressTimer = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		const ua = navigator.userAgent.toLowerCase();
		setIsWeChat(ua.includes('micromessenger'));
	}, []);

	// 长按二维码处理
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
		if (!isWeChat) {
			window.location.href = 'weixin://';
		}
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
		setCountdown(10);
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
						{/* 二维码 - 支持长按 */}
						<div className="text-center mb-6">
							{isWeChat ? (
								<div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
									<p className="text-green-700 font-medium text-sm">👆 长按下方二维码直接支付</p>
								</div>
							) : (
								<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
									<p className="text-blue-700 font-medium text-sm">📱 长按二维码打开微信扫码支付</p>
								</div>
							)}

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
								<div className="relative w-[260px] h-[260px] rounded-xl overflow-hidden shadow-lg border-4 border-white ring-2 ring-gray-200 mx-auto">
									<Image
										src="/qrcode_payment.jpg"
										alt="微信收款码 - 长按支付"
										fill
										className="object-cover"
										priority
									/>
								</div>
							</div>

							<p className="text-gray-500 text-xs mt-3">
								{isWeChat ? '微信内长按自动识别' : '长按二维码打开微信扫码'}
							</p>
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
							{/* 支付完成按钮 - 点击后10秒倒计时自动跳转 */}
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
								<li>• 支付完成后点击按钮，10秒后自动进入推理页面</li>
								{isWeChat && <li>• 微信内可直接长按二维码识别支付</li>}
								{!isWeChat && <li>• 长按二维码可直接打开微信扫码</li>}
							</ul>
						</div>

						{/* 联系方式 */}
						<div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
							<div className="flex items-center justify-center gap-2 flex-wrap">
								<svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
									<path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.944 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.062-6.122zm-2.18 2.769c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.97-.982zm4.844 0c.535 0 .969.44.969.982a.976.976 0 01-.969.983.976.976 0 01-.969-.983c0-.542.434-.982.969-.982z"/>
								</svg>
								<span className="text-stone-700 text-sm">如有疑问，请联系微信：</span>
								<button
									onClick={handleCopyWeChat}
									className="font-mono font-bold text-green-700 bg-green-100 px-2 py-1 rounded hover:bg-green-200 transition-colors"
								>
									ZRLSGZRLS
								</button>
								{showTip && (
									<span className="text-green-600 text-xs animate-pulse">已复制!</span>
								)}
							</div>
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
