'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
	const router = useRouter();
	const qrRef = useRef<HTMLDivElement>(null);
	const longPressTimer = useRef<NodeJS.Timeout | null>(null);
	const [paymentStatus, setPaymentStatus] = useState<'waiting' | 'completed' | 'redirecting'>('waiting');

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
		window.location.href = 'alipays://';
	};

	// 跳转到推理页面
	const redirectToReasoning = () => {
		setPaymentStatus('redirecting');
		const recordId = Date.now().toString(36) + Math.random().toString(36).substr(2);
		sessionStorage.setItem('paymentVerified', 'true');
		sessionStorage.setItem('paymentRecordId', recordId);
		
		// 延迟1秒后跳转，让用户看到"正在跳转"提示
		setTimeout(() => {
			router.push(`/reasoning/${recordId}`);
		}, 1000);
	};

	// 监听页面可见性变化 - 用户从支付宝返回时自动跳转
	useEffect(() => {
		const handleVisibilityChange = () => {
			if (document.visibilityState === 'visible' && paymentStatus === 'waiting') {
				// 用户从支付宝返回，标记支付完成
				setPaymentStatus('completed');
				
				// 延迟3秒后自动跳转，给用户返回的时间
				setTimeout(() => {
					redirectToReasoning();
				}, 3000);
			}
		};

		document.addEventListener('visibilitychange', handleVisibilityChange);
		
		return () => {
			document.removeEventListener('visibilitychange', handleVisibilityChange);
		};
	}, [paymentStatus]);

	return (
		<div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 flex items-center justify-center p-4">
			<div className="w-full max-w-sm">
				{/* 收款码 - 长按跳转支付宝 */}
				<div
					ref={qrRef}
					onTouchStart={handleLongPressStart}
					onTouchEnd={handleLongPressEnd}
					onTouchCancel={handleLongPressEnd}
					onContextMenu={(e) => {
						e.preventDefault();
						handleLongPress();
					}}
					className="cursor-pointer active:scale-95 transition-transform"
				>
					<div className="relative w-full aspect-square rounded-xl overflow-hidden shadow-2xl border-4 border-white ring-2 ring-blue-200">
						<Image
							src="/qrcode_payment.jpg"
							alt="支付宝收款码 - 长按支付"
							fill
							className="object-cover"
							priority
						/>
					</div>
				</div>

				{/* 支付状态提示 */}
				<div className="mt-6 text-center">
					{paymentStatus === 'waiting' && (
						<div className="space-y-2">
							<p className="text-blue-900 font-medium">长按收款码跳转支付宝付款</p>
							<p className="text-blue-700 text-sm">付款完成后自动跳转推理页面</p>
						</div>
					)}
					
					{paymentStatus === 'completed' && (
						<div className="space-y-2">
							<div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-full">
								<svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
								<span className="text-green-700 font-medium">支付完成</span>
							</div>
							<p className="text-blue-700 text-sm">3秒后自动跳转推理页面...</p>
						</div>
					)}
					
					{paymentStatus === 'redirecting' && (
						<div className="space-y-2">
							<div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 rounded-full">
								<svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
									<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
									<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
								</svg>
								<span className="text-blue-700 font-medium">正在跳转...</span>
							</div>
						</div>
					)}
				</div>

				{/* 返回首页 */}
				<div className="mt-6 text-center">
					<Link href="/" className="text-blue-700 hover:text-blue-900 text-sm transition-colors">
						返回首页
					</Link>
				</div>
			</div>
		</div>
	);
}
