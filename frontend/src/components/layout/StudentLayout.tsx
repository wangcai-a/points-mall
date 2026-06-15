import { Outlet } from 'react-router-dom';
import { GraduationCap, User, LogOut } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';

export const StudentLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-card">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">学生积分商城</h1>
                <p className="text-sm text-gray-500">欢迎，{user?.name}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">退出登录</span>
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
};
