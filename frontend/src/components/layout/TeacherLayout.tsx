import { Outlet, useNavigate } from 'react-router-dom';
import { GraduationCap, Users, Coins, ShoppingCart, Ticket, Upload, LogOut, User, ShoppingBag } from 'lucide-react';
import { useAuth } from '@/store/AuthContext';

const menuItems = [
  { path: '/student/products', icon: ShoppingBag, label: '积分商城' },
  { path: '/teacher/students', icon: Users, label: '学生管理' },
  { path: '/teacher/products', icon: ShoppingCart, label: '商品管理' },
  { path: '/teacher/points', icon: Coins, label: '积分管理' },
  { path: '/teacher/orders', icon: ShoppingCart, label: '订单管理' },
  { path: '/teacher/lottery', icon: Ticket, label: '抽奖功能' },
  { path: '/teacher/import', icon: Upload, label: '积分导入' },
];

export const TeacherLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white shadow-card min-h-screen">
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">积分商城</h1>
              <p className="text-xs text-gray-500">教师管理后台</p>
            </div>
          </div>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-primary-50 hover:text-primary-600 rounded-lg transition-colors"
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="absolute bottom-0 left-0 w-64 p-4 border-t">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">退出登录</span>
          </button>
        </div>
      </aside>
      <div className="flex-1">
        <header className="bg-white shadow-card px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">
              {menuItems.find(item => window.location.pathname.includes(item.path))?.label || '管理后台'}
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-5 h-5" />
                <span>{user?.name}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
