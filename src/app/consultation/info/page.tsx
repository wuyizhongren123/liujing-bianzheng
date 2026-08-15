'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function UserInfoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    weight: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validate()) {
      // 保存用户信息到sessionStorage
      sessionStorage.setItem('userInfo', JSON.stringify({
        name: formData.name.trim(),
        age: parseInt(formData.age),
        weight: parseFloat(formData.weight)
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

            {/* 提示信息 */}
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <p className="text-stone-600 text-sm">
                <span className="font-medium text-amber-800">温馨提示：</span>
                儿童（&lt;12岁）和老人（&gt;65岁）的药量会自动调整，请如实填写年龄。
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
