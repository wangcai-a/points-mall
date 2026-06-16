import { useState, useEffect } from 'react';
import { GraduationCap, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/store/AuthContext';
import { useApp } from '@/store/AppContext';

const STORAGE_KEY = 'points-mall-login-cache';

export const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showNotification } = useApp();

  useEffect(() => {
    const cachedData = localStorage.getItem(STORAGE_KEY);
    if (cachedData) {
      try {
        const { username: savedUsername, password: savedPassword, remember: savedRemember } = JSON.parse(cachedData);
        if (savedRemember && savedUsername) {
          setUsername(savedUsername);
          setPassword(savedPassword || '');
          setRememberMe(savedRemember);
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      showNotification('请填写用户名和密码', 'warning');
      return;
    }
    setLoading(true);
    try {
      await login({ username, password });
      
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          username,
          password,
          remember: true
        }));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      showNotification(error instanceof Error ? error.message : '登录失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleClearCache = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUsername('');
    setPassword('');
    setRememberMe(false);
    showNotification('已清除账号密码缓存', 'info');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md fade-in">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-500 rounded-xl flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">积分商城</h1>
            <p className="text-gray-500 mt-2">教师登录</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入用户名"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-600">记住密码</span>
                </label>
                <button
                  type="button"
                  onClick={handleClearCache}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  清除缓存
                </button>
              </div>
              <Button type="submit" loading={loading} className="w-full">
                登录
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
