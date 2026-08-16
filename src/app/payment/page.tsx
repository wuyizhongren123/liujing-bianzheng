'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function PaymentPage() {
	const router = useRouter();
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
		window.location.href = 'alipays://';
	};

	// 支付完成 - 直接跳转推理页面
	const handlePaymentComplete = () => {
		const recordId = Date.now().toString(36) + Math.random().toString(36).substr(2);
		sessionStorage.setItem('paymentVerified', 'true');
		sessionStorage.setItem('paymentRecordId', recordId);
		router.push(`/reasoning/${recordId}`);
	};

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

				{/* 支付完成按钮 */}
				<button
					onClick={handlePaymentComplete}
					className="w-full mt-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-bold text-lg shadow-lg transition-all flex items-center justify-center gap-2"
				>
					<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
					</svg>
					支付完成，查看推理过程
				</button>

				{/* 返回首页 */}
				<div className="mt-4 text-center">
					<Link href="/" className="text-blue-700 hover:text-blue-900 text-sm transition-colors">
						返回首页
					</Link>
				</div>
			</div>
		</div>
	);
}
