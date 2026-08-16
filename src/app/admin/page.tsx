'use client';

import { useState, useEffect } from 'react';

interface Record {
  id: number;
  name: string;
  age: number;
  weight: number;
  gender?: string;
  menstrual_info?: string;
  prescription: string;
  final_prescription?: string;
  meridian: string;
  created_at: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [records, setRecords] = useState<Record[]>([]);
  const [searchName, setSearchName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState(false);

  const fetchRecords = async (name = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin?password=${password}&name=${encodeURIComponent(name)}`);
      const data = await res.json();
      if (data.success) {
        setRecords(data.data || []);
        setIsAuthenticated(true);
        setError('');
      } else {
        setError(data.error || '获取记录失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords(searchName);
  };

  useEffect(() => {
    const storedPassword = sessionStorage.getItem('adminPassword');
    if (storedPassword) {
      setPassword(storedPassword);
      setIsAuthenticated(true);
      fetchRecords();
    }
  }, []);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    sessionStorage.setItem('adminPassword', e.target.value);
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === records.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(records.map(r => r.id)));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`确定删除选中的 ${selectedIds.size} 条记录？`)) return;

    setDeleting(true);
    try {
      const ids = Array.from(selectedIds).join(',');
      const res = await fetch(`/api/admin?password=${password}&ids=${ids}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSelectedIds(new Set());
        await fetchRecords(searchName);
      } else {
        alert(data.error || '删除失败');
      }
    } catch {
      alert('网络错误');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAll = async () => {
    if (records.length === 0) return;
    if (!confirm(`确定清除全部 ${records.length} 条记录？此操作不可恢复！`)) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin?password=${password}&ids=all`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setSelectedIds(new Set());
        await fetchRecords(searchName);
      } else {
        alert(data.error || '清除失败');
      }
    } catch {
      alert('网络错误');
    } finally {
      setDeleting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-100 to-stone-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-stone-800">管理后台</h1>
            <p className="text-stone-500 mt-1">请输入访问密码</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="请输入密码"
              className="w-full px-4 py-3 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            {error && <p className="text-red-600 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-red-700 to-red-800 text-white rounded-lg font-medium hover:from-red-800 hover:to-red-900 transition-all"
            >
              登录
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-100 to-stone-200">
      <div className="bg-white shadow-sm border-b border-stone-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-stone-800">问诊记录管理</h1>
            <button
              onClick={() => {
                setIsAuthenticated(false);
                sessionStorage.removeItem('adminPassword');
              }}
              className="text-stone-500 hover:text-stone-700 text-sm"
            >
              退出登录
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* 搜索栏 */}
        <form onSubmit={handleSearch} className="mb-4 flex gap-3">
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="搜索姓名"
            className="flex-1 px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
          >
            搜索
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchName('');
              setSelectedIds(new Set());
              fetchRecords();
            }}
            className="px-6 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 transition-colors"
          >
            重置
          </button>
        </form>

        {/* 操作栏 */}
        {records.length > 0 && (
          <div className="mb-4 flex items-center justify-between bg-white rounded-lg shadow px-4 py-3">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={records.length > 0 && selectedIds.size === records.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 accent-red-700"
                />
                <span className="text-sm text-stone-600">全选</span>
              </label>
              <span className="text-sm text-stone-400">
                已选 {selectedIds.size} / {records.length} 条
              </span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDeleteSelected}
                disabled={selectedIds.size === 0 || deleting}
                className="px-4 py-1.5 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {deleting ? '删除中...' : `删除选中 (${selectedIds.size})`}
              </button>
              <button
                type="button"
                onClick={handleDeleteAll}
                disabled={deleting}
                className="px-4 py-1.5 bg-red-700 text-white text-sm rounded-lg hover:bg-red-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                全部清除
              </button>
            </div>
          </div>
        )}

        {/* 记录列表 */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-stone-500">加载中...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl shadow">
            <p className="text-stone-500">暂无记录</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-stone-600 w-10">
                    <input
                      type="checkbox"
                      checked={records.length > 0 && selectedIds.size === records.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 accent-red-700"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-stone-600">姓名</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-stone-600">性别</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-stone-600">年龄</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-stone-600">体重</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-stone-600">月经</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-stone-600">病经</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-stone-600">推荐方剂</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-stone-600">提交时间</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {records.map((record) => (
                  <tr
                    key={record.id}
                    className={`hover:bg-stone-50 cursor-pointer ${selectedIds.has(record.id) ? 'bg-red-50' : ''}`}
                    onClick={() => toggleSelect(record.id)}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(record.id)}
                        onChange={() => toggleSelect(record.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 accent-red-700"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm text-stone-800">{record.name}</td>
                    <td className="px-4 py-3 text-sm text-stone-600">{record.gender || '-'}</td>
                    <td className="px-4 py-3 text-sm text-stone-600">{record.age}岁</td>
                    <td className="px-4 py-3 text-sm text-stone-600">{record.weight}kg</td>
                    <td className="px-4 py-3 text-sm text-pink-600">{record.menstrual_info || '-'}</td>
                    <td className="px-4 py-3 text-sm text-red-700 font-medium">{record.meridian || '-'}</td>
                    <td className="px-4 py-3 text-sm text-stone-800">{record.final_prescription || record.prescription}</td>
                    <td className="px-4 py-3 text-sm text-stone-500">
                      {new Date(record.created_at).toLocaleString('zh-CN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
