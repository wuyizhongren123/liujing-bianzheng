'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface DiagnosisResult {
	userInfo: {
		name: string;
		age: number;
		weight: number;
	};
	answers: Record<string, unknown>;
	result: {
		meridian: string;
		meridianFull: string;
		syndrome: string;
		prescription: string;
		composition: string;
		dosage: string;
		preparation: string;
		usage: string;
		effects: string;
		indications: string;
		contraindications: string;
		notes: string;
		interception: {
			type: string | null;
			reason: string;
			combinedPrescription: string;
		};
		dietaryAdvice: string[];
		lifestyleAdvice: string[];
	};
}

export default function ReasoningPage() {
	const params = useParams();
	const router = useRouter();
	const recordId = params.id as string;
	const [diagnosis, setDiagnosis] = useState<DiagnosisResult | null>(null);
	const [isVerified, setIsVerified] = useState(false);

	useEffect(() => {
		// 检查支付状态
		const paymentVerified = sessionStorage.getItem('paymentVerified');
		const savedDiagnosis = sessionStorage.getItem('diagnosisResult');
		
		if (paymentVerified === 'true') {
			setIsVerified(true);
		}
		
		if (savedDiagnosis) {
			try {
				setDiagnosis(JSON.parse(savedDiagnosis));
			} catch (e) {
				console.error('解析诊断结果失败', e);
			}
		}
	}, []);

	// 未支付验证
	if (!isVerified) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
				<div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4 text-center">
					<div className="text-6xl mb-4">🔒</div>
					<h1 className="text-2xl font-bold text-gray-800 mb-2">请先完成支付</h1>
					<p className="text-gray-600 mb-6">查看完整辨证推理过程需要支付 ¥10.00</p>
					<Link
						href="/payment"
						className="inline-block px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all"
					>
						前往支付
					</Link>
				</div>
			</div>
		);
	}

	// 没有诊断数据
	if (!diagnosis) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center">
				<div className="bg-white rounded-2xl shadow-xl p-8 max-w-md mx-4 text-center">
					<div className="text-6xl mb-4">📋</div>
					<h1 className="text-2xl font-bold text-gray-800 mb-2">暂无诊断数据</h1>
					<p className="text-gray-600 mb-6">请先完成辨证问诊</p>
					<Link
						href="/consultation/info"
						className="inline-block px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-medium hover:from-amber-700 hover:to-amber-800 transition-all"
					>
						开始问诊
					</Link>
				</div>
			</div>
		);
	}

	const { userInfo, answers, result } = diagnosis;

	// 生成推理过程分析
	const generateReasoning = () => {
		const steps: { title: string; content: string; highlight?: boolean }[] = [];

		// 第一步：用户信息
		steps.push({
			title: '第一步：用户基本信息',
			content: `姓名：${userInfo.name}，年龄：${userInfo.age}岁，体重：${userInfo.weight}kg`
		});

		// 第二步：十问分析
		steps.push({
			title: '第二步：十问症状分析',
			content: `根据用户回答，提取关键症状信息...`
		});

		// 寒热分析
		const hasCold = answers.q1_cold === true;
		const hasFever = answers.q1_fever === true;
		const hasAlternating = answers.q1_alternating === true;
		const sweatType = answers.q1_sweat as string;

		if (hasCold && hasFever) {
			steps.push({
				title: '寒热辨证',
				content: `用户同时出现怕冷和发热症状，属于「恶寒发热」，提示表证。${sweatType === '有汗' ? '有汗，属于表虚证。' : sweatType === '无汗' ? '无汗，属于表实证。' : ''}`,
				highlight: true
			});
		}

		if (hasAlternating) {
			steps.push({
				title: '寒热辨证',
				content: '用户出现寒热往来（怕冷和发热交替出现），这是少阳病的典型特征。',
				highlight: true
			});
		}

		// 头痛分析
		const headacheLocation = answers.q3_head_location as string;
		if (headacheLocation === '后脑') {
			steps.push({
				title: '头痛部位分析',
				content: '后脑头痛，属于太阳经循行部位，提示太阳病。',
				highlight: true
			});
		} else if (headacheLocation === '两侧') {
			steps.push({
				title: '头痛部位分析',
				content: '两侧头痛，属于少阳经循行部位，提示少阳病。',
				highlight: true
			});
		} else if (headacheLocation === '前额') {
			steps.push({
				title: '头痛部位分析',
				content: '前额头痛，属于阳明经循行部位，提示阳明病。',
				highlight: true
			});
		}

		// 口渴分析
		const isThirsty = answers.q8_thirsty === true;
		const thirstLevel = answers.q8_thirst_level as string;
		const taste = answers.q8_taste as string;

		if (taste === '口苦') {
			steps.push({
				title: '口味分析',
				content: '口苦是少阳病的典型症状，提示胆火上炎。',
				highlight: true
			});
		}

		if (isThirsty && thirstLevel === '大渴引饮') {
			steps.push({
				title: '口渴分析',
				content: '大渴引饮，提示阳明热盛，津液受损。',
				highlight: true
			});
		}

		// 二便分析
		const stool = answers.q4_stool as string;
		if (stool === '便秘') {
			steps.push({
				title: '二便分析',
				content: '便秘，提示阳明腑实，需要通下。',
				highlight: true
			});
		} else if (stool === '稀溏' || stool === '腹泻') {
			steps.push({
				title: '二便分析',
				content: '大便稀溏或腹泻，提示太阴脾虚。',
				highlight: true
			});
		}

		// 第三步：六经辨证
		steps.push({
			title: '第三步：六经辨证结论',
			content: `综合以上症状分析，辨证为「${result.meridianFull}」，证型为「${result.syndrome}」。`,
			highlight: true
		});

		// 第四步：方剂推荐
		steps.push({
			title: '第四步：方剂推荐',
			content: `根据辨证结果，推荐方剂「${result.prescription}」。组成：${result.composition}。功效：${result.effects}。`
		});

		// 第五步：开合枢截断分析
		const kaiheShuTheory = `【开阖枢理论】
"舍枢，不能开阖；舍开阖，不能转枢" ——《灵枢·根结》

枢＝门轴；开＝把门打开；阖＝把门关上。

用大门做比喻最好懂：
枢，就是大门的转轴。开是开门，阖是关门。

舍枢，不能开阖：
离开了门轴（枢），门就没办法实现开门、关门的动作。
放到六经：
• 少阳是阳门的门轴，少阴是阴门的门轴。
• 没有少阳枢机，太阳就没法"开"（阳气向外布散卫表），阳明也没法"阖"（阳气向内收敛入腑）。
• 没有少阴枢机，太阴就没法"开"（布散阴精），厥阴也没法"阖"（收纳阴血）。
没有枢机转动，阴阳就做不了向外打开、向内收敛。

舍开阖，不能转枢：
反过来，如果门本身没有开合的功能，门轴也就失去转动的意义。
门轴不是凭空空转，它是为开门、关门服务的。
放到人体：
• 少阳这个枢，不是自己凭空折腾，是为了实现太阳开、阳明阖；
• 少阴这个枢，不是单纯水火瞎转，是配合太阴开、厥阴阖，完成阴气的布散与收束。
没有开阖的作用，枢机的转动就没有目的。

翻译成中医白话：
枢（少阳、少阴）是动力转轴，负责转换；开阖是向外、向内的结果。
没有转轴，阴阳就出不去、收不回来；
没有向外向内的开合，转轴的转动就毫无意义。二者互相依存，缺一不可。

落到伤寒六经实际：
少阳（阳枢）——太阳要开（卫气布于体表），阳明要阖（热归胃肠），全靠少阳三焦胆作为转轴。少阳枢机一堵，门轴锈住：太阳的邪出不去，阳明的热收不进来 → 往来寒热、胸胁苦满，小柴胡汤就是修理这个门轴。
少阴（阴枢，心肾）——太阴要把津液布散出来（开），厥阴要把阴血收藏回去（阖），依靠少阴心肾水火升降作为转轴。少阴枢机坏掉，水火不交：要么寒化（四逆汤证），要么热化（黄连阿胶汤证）。

一句话总结：
枢管转换，开阖管出入。没有转轴就打不开门关不上；没有开门关门，转轴也没必要转动。

【三阴病传变路径】
三阴往外出，优先靠枢机转动（少阴、厥阴），先转到少阳这个阳枢；
如果阳气偏旺，燥热化，才进一步落到阳明（三阳之阖）；
阳气平和，就直接从少阳、太阳把邪气散掉，不会走到阳明燥实。

传变路径：
三阴（太阴/少阴/厥阴）→ 少阴枢/厥阴 → 少阳（阳枢）
  ↓ 阳气平和 → 从少阳、太阳散掉
  ↓ 阳气偏旺、燥热化 → 落到阳明（三阳之阖）

武医思路：站桩调的就是这一套气化，形体中正，枢机才能转，一身阴阳才能正常开阖。`;

		if (result.interception && result.interception.type) {
			steps.push({
				title: '第五步：开合枢截断分析',
				content: `${kaiheShuTheory}

【本案分析】
根据开合枢理论，${result.interception.reason}，建议合用「${result.interception.combinedPrescription}」进行截断。`,
				highlight: true
			});
		} else {
			steps.push({
				title: '第五步：开合枢截断分析',
				content: `${kaiheShuTheory}

【本案分析】
根据开合枢理论，当前症状未见明显的传变趋势，暂无需合方截断。`
			});
		}

		// 第六步：年龄体重调整
		let dosageAdjustment = '';
		if (userInfo.age < 12) {
			dosageAdjustment = '患者为儿童（<12岁），药量应减半。';
		} else if (userInfo.age > 65) {
			dosageAdjustment = '患者为老人（>65岁），药量酌减1/3，注意扶正。';
		}
		
		if (userInfo.weight < 50) {
			dosageAdjustment += '体重<50kg，药量酌减。';
		} else if (userInfo.weight > 80) {
			dosageAdjustment += '体重>80kg，药量酌增。';
		}

		if (dosageAdjustment) {
			steps.push({
				title: '第六步：剂量调整',
				content: dosageAdjustment
			});
		}

		return steps;
	};

	const reasoningSteps = generateReasoning();

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
						<h1 className="text-xl font-bold">辨证推理过程</h1>
						<div className="w-20"></div>
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8 max-w-4xl">
				{/* 标题区域 */}
				<div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-2xl p-6 mb-6 shadow-lg">
					<div className="flex items-center gap-3 mb-2">
						<span className="text-3xl">🔍</span>
						<h1 className="text-2xl font-bold">完整辨证推理过程</h1>
					</div>
					<p className="text-amber-100">记录编号：{recordId}</p>
				</div>

				{/* 推理步骤 */}
				<div className="space-y-4 mb-8">
					{reasoningSteps.map((step, index) => (
						<div
							key={index}
							className={`bg-white rounded-xl shadow-md overflow-hidden ${step.highlight ? 'ring-2 ring-amber-400' : ''}`}
						>
							<div className={`px-5 py-3 ${step.highlight ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 'bg-gray-100'}`}>
								<h3 className={`font-bold ${step.highlight ? 'text-white' : 'text-gray-800'}`}>
									{step.title}
								</h3>
							</div>
							<div className="p-5">
								<p className="text-gray-700 leading-relaxed">{step.content}</p>
							</div>
						</div>
					))}
				</div>

				{/* 最终结论 */}
				<div className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-2xl p-6 mb-6 shadow-lg">
					<div className="flex items-center gap-3 mb-4">
						<span className="text-3xl">✅</span>
						<h2 className="text-xl font-bold">最终辨证结论</h2>
					</div>
					<div className="space-y-3">
						<div className="bg-white/10 rounded-lg p-4">
							<p className="text-sm opacity-90 mb-1">辨证结果</p>
							<p className="text-xl font-bold">{result.meridianFull}</p>
							<p className="text-lg">{result.syndrome}</p>
						</div>
						<div className="bg-white/10 rounded-lg p-4">
							<p className="text-sm opacity-90 mb-1">推荐方剂</p>
							<p className="text-xl font-bold">{result.prescription}</p>
							<p className="text-sm opacity-90 mt-1">{result.composition}</p>
						</div>
					</div>
				</div>

				{/* 操作按钮 */}
				<div className="flex flex-col sm:flex-row gap-4">
					<Link
						href="/consultation/result"
						className="flex-1 py-3 px-4 bg-white border-2 border-amber-600 text-amber-700 rounded-lg font-medium hover:bg-amber-50 transition-colors text-center"
					>
						返回辨证结果
					</Link>
					<Link
						href="/"
						className="flex-1 py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg font-medium hover:from-amber-700 hover:to-amber-800 transition-all text-center"
					>
						返回首页
					</Link>
				</div>
			</main>
		</div>
	);
}
