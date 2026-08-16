'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserInfoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: '',
    gender: '' as '' | '男' | '女',
    // 月经相关（仅女性显示）
    menstrual_cycle: '' as '' | '正常' | '提前' | '推后' | '不定期',
    menstrual_flow: '' as '' | '正常' | '量多' | '量少',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isFemale = formData.gender === '女';

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '请输入姓名';
    }
    
    const age = parseInt(formData.age);
    if (!formData.age || isNaN(age) || age < 1 || age > 150) {
      newErrors.age = '请输入有效年龄（1-150岁）';
    }
    
    const weight = parseFloat(formData.weight);
    if (!formData.weight || isNaN(weight) || weight < 1 || weight > 300) {
      newErrors.weight = '请输入有效体重（1-300kg）';
    }

    if (!formData.gender) {
      newErrors.gender = '请选择性别';
    }

    // 女性且年龄在生育期（12-55岁），需要填写月经信息
    if (isFemale && age >= 12 && age <= 55) {
      if (!formData.menstrual_cycle) {
        newErrors.menstrual_cycle = '请选择月经周期';
      }
      if (!formData.menstrual_flow) {
        newErrors.menstrual_flow = '请选择月经量';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      const age = parseInt(formData.age);
      // 保存用户信息到sessionStorage
      sessionStorage.setItem('userInfo', JSON.stringify({
        name: formData.name.trim(),
        age,
        weight: parseFloat(formData.weight),
        gender: formData.gender,
        // 仅女性且生育期才传月经信息
        menstrual_cycle: (isFemale && age >= 12 && age <= 55) ? formData.menstrual_cycle : null,
        menstrual_flow: (isFemale && age >= 12 && age <= 55) ? formData.menstrual_flow : null,
      }));
      
      // 跳转到问诊页面
      router.push('/consultation/questions');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
      {/* 顶部装饰 */}
      <div className="bg-gradient-to-r from-red-800 to-red-900 h-2"></div>
      
      <div className="container mx-auto px-4 py-8 max-w-lg">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-red-900 mb-2">患者信息登记</h1>
          <p className="text-stone-600 text-sm">请填写以下信息，以便进行精准辨证</p>
        </div>

        {/* 表单卡片 */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-amber-200">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 姓名 */}
            <div>
              <label className="block text-stone-700 font-medium mb-2">
                姓名 <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                  errors.name 
                    ? 'border-red-400 bg-red-50' 
                    : 'border-amber-200 focus:border-amber-500'
                } focus:outline-none`}
                placeholder="请输入您的姓名"
              />
              {errors.name && (
                <p className="text-red-600 text-sm mt-1">{errors.name}</p>
              )}
            </div>

            {/* 性别 */}
            <div>
              <label className="block text-stone-700 font-medium mb-2">
                性别 <span className="text-red-600">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: '男' })}
                  className={`py-3 rounded-lg border-2 font-medium transition-all ${
                    formData.gender === '男'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-amber-200 text-stone-600 hover:border-amber-400'
                  }`}
                >
                  男
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, gender: '女' })}
                  className={`py-3 rounded-lg border-2 font-medium transition-all ${
                    formData.gender === '女'
                      ? 'border-pink-500 bg-pink-50 text-pink-700'
                      : 'border-amber-200 text-stone-600 hover:border-amber-400'
                  }`}
                >
                  女
                </button>
              </div>
              {errors.gender && (
                <p className="text-red-600 text-sm mt-1">{errors.gender}</p>
              )}
            </div>

            {/* 年龄 */}
            <div>
              <label className="block text-stone-700 font-medium mb-2">
                年龄 <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                    errors.age 
                      ? 'border-red-400 bg-red-50' 
                      : 'border-amber-200 focus:border-amber-500'
                  } focus:outline-none`}
                  placeholder="请输入您的年龄"
                  min="1"
                  max="150"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500">岁</span>
              </div>
              {errors.age && (
                <p className="text-red-600 text-sm mt-1">{errors.age}</p>
              )}
            </div>

            {/* 体重 */}
            <div>
              <label className="block text-stone-700 font-medium mb-2">
                体重 <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className={`w-full px-4 py-3 rounded-lg border-2 transition-colors ${
                    errors.weight 
                      ? 'border-red-400 bg-red-50' 
                      : 'border-amber-200 focus:border-amber-500'
                  } focus:outline-none`}
                  placeholder="请输入您的体重"
                  min="1"
                  max="300"
                  step="0.1"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500">kg</span>
              </div>
              {errors.weight && (
                <p className="text-red-600 text-sm mt-1">{errors.weight}</p>
              )}
            </div>

            {/* 月经信息（仅女性且生育期显示） */}
            {isFemale && formData.age && parseInt(formData.age) >= 12 && parseInt(formData.age) <= 55 && (
              <div className="border-t border-amber-200 pt-5 space-y-5">
                <div className="bg-pink-50 rounded-lg p-3 border border-pink-200">
                  <p className="text-pink-800 text-sm font-medium">女性生理信息（必填）</p>
                </div>

                {/* 月经周期 */}
                <div>
                  <label className="block text-stone-700 font-medium mb-2">
                    月经周期 <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {['正常', '提前', '推后', '不定期'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormData({ ...formData, menstrual_cycle: option as typeof formData.menstrual_cycle })}
                        className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          formData.menstrual_cycle === option
                            ? 'border-pink-500 bg-pink-50 text-pink-700'
                            : 'border-amber-200 text-stone-600 hover:border-amber-400'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {errors.menstrual_cycle && (
                    <p className="text-red-600 text-sm mt-1">{errors.menstrual_cycle}</p>
                  )}
                </div>

                {/* 月经量 */}
                <div>
                  <label className="block text-stone-700 font-medium mb-2">
                    月经量 <span className="text-red-600">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['正常', '量多', '量少'].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFormData({ ...formData, menstrual_flow: option as typeof formData.menstrual_flow })}
                        className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition-all ${
                          formData.menstrual_flow === option
                            ? 'border-pink-500 bg-pink-50 text-pink-700'
                            : 'border-amber-200 text-stone-600 hover:border-amber-400'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {errors.menstrual_flow && (
                    <p className="text-red-600 text-sm mt-1">{errors.menstrual_flow}</p>
                  )}
                </div>
              </div>
            )}

            {/* 提示信息 */}
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <p className="text-stone-600 text-sm">
                <span className="font-medium text-amber-800">温馨提示：</span>
                儿童（&lt;12岁）和老人（&gt;65岁）的药量会自动调整，请如实填写年龄。
                {isFemale && ' 女性患者需填写月经信息，以便精准辨证。'}
              </p>
            </div>

            {/* 提交按钮 */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-red-700 to-red-800 text-white py-3 rounded-lg font-medium hover:from-red-800 hover:to-red-900 transition-all shadow-lg"
            >
              开始问诊
            </button>
          </form>
        </div>

        {/* 返回按钮 */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push('/')}
            className="text-stone-600 hover:text-red-800 transition-colors"
          >
            ← 返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
