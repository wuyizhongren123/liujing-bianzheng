'use client';

import { useState, useEffect } from 'react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [records, setRecords] = useState<any[]>([]);
  const [searchName, setSearchName] = useState('');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const auth = sessionStorage.getItem('admin_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
      fetchRecords();
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const res = await fetch(`/api/admin?password=${encodeURIComponent(password)}`);
    const data = await res.json();
    
    if (data.success) {
      setIsAuthenticated(true);
      sessionStorage.setItem('admin_auth', 'true');
      setRecords(data.data || []);
    } else {
      setError(data.error || '密码错误');
    }
  };

  const fetchRecords = async (name?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ password: '123456' });
      if (name) params.set('name', name);
      params.set('_t', Date.now().toString());
      
      const res = await fetch(`/api/admin?${params.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        setRecords(data.data || []);
      }
    } catch (err) {
      console.error('获取记录失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecords(searchName);
  };

  const handleDelete = async (ids: number[]) => {
    if (!confirm(`确定要删除选中的 ${ids.length} 条记录吗？此操作不可恢复！`)) {
      return;
    }

    try {
      const idsParam = ids.join(',');
      const res = await fetch(`/api/admin?password=123456&ids=${idsParam}`, {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        alert('删除成功');
        fetchRecords(searchName);
        setSelectedIds([]);
      } else {
        alert('删除失败：' + data.error);
      }
    } catch (err) {
      console.error('删除失败:', err);
      alert('删除失败');
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm('确定要清除所有记录吗？此操作不可恢复！')) {
      return;
    }

    try {
      const res = await fetch('/api/admin?password=123456&ids=all', {
        method: 'DELETE',
      });
      const data = await res.json();

      if (data.success) {
        alert('全部清除成功');
        fetchRecords();
        setSelectedIds([]);
      } else {
        alert('清除失败：' + data.error);
      }
    } catch (err) {
      console.error('清除失败:', err);
      alert('清除失败');
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === records.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(records.map(r => r.id));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('admin_auth');
    setPassword('');
    setRecords([]);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-amber-200 p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-amber-900 mb-2">管理后台</h1>
            <p className="text-sm text-amber-700/70">六经辨证用药指导系统</p>
            <div className="mt-4 w-16 h-px bg-amber-900/30 mx-auto" />
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-amber-800 mb-2">
                管理员密码
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-amber-200 bg-white/60 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                placeholder="请输入密码"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-amber-900 hover:bg-amber-800 text-white font-medium py-3 rounded-lg transition-colors shadow-lg"
            >
              登录
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
      {/* 顶部导航 */}
      <nav className="bg-amber-900/90 text-amber-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-wide">管理后台</h1>
          <div className="flex gap-4 text-sm">
            <button
              onClick={handleLogout}
              className="hover:text-amber-200 transition-colors"
            >
              退出登录
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* 搜索和操作栏 */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <form onSubmit={handleSearch} className="flex gap-3 flex-1 w-full md:w-auto">
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                placeholder="按姓名搜索..."
                className="flex-1 px-4 py-2 rounded-lg border border-amber-200 bg-white/60 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-amber-900 hover:bg-amber-800 text-white rounded-lg transition-colors"
              >
                搜索
              </button>
            </form>

            <div className="flex gap-3">
              {selectedIds.length > 0 && (
                <button
                  onClick={() => handleDelete(selectedIds)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
                >
                  删除选中 ({selectedIds.length})
                </button>
              )}
              <button
                onClick={handleDeleteAll}
                className="px-4 py-2 bg-red-800 hover:bg-red-900 text-white rounded-lg transition-colors text-sm"
              >
                全部清除
              </button>
            </div>
          </div>
        </div>

        {/* 记录列表 */}
        <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-amber-200 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-amber-700">
              加载中...
            </div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center text-amber-700/70">
              暂无记录
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-amber-100/50 border-b border-amber-200">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === records.length && records.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-amber-300 text-amber-900 focus:ring-amber-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-amber-900">姓名</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-amber-900">性别</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-amber-900">推荐方剂</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-amber-900">提交时间</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-amber-100">
                  {records.map((record) => (
                    <tr
                      key={record.id}
                      className={`hover:bg-amber-50/50 transition-colors cursor-pointer ${
                        selectedIds.includes(record.id) ? 'bg-amber-50' : ''
                      }`}
                      onClick={() => toggleSelect(record.id)}
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(record.id)}
                          onChange={() => toggleSelect(record.id)}
                          className="w-4 h-4 rounded border-amber-300 text-amber-900 focus:ring-amber-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{record.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{record.gender || '-'}</td>
                      <td className="px-4 py-3 text-sm text-amber-900 font-medium">
                        {record.final_prescription || record.prescription || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {new Date(record.created_at).toLocaleString('zh-CN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 统计信息 */}
        {records.length > 0 && (
          <div className="mt-4 text-sm text-amber-700/70 text-center">
            共 {records.length} 条记录
          </div>
        )}
      </main>
    </div>
  );
}
