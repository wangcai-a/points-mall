import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import { AppProvider } from '@/store/AppContext';
import { LoginPage } from '@/pages/auth/LoginPage';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { TeacherLayout } from '@/components/layout/TeacherLayout';
import { StudentDashboard } from '@/pages/student/StudentDashboard';
import { ProductList } from '@/pages/student/ProductList';
import { ProductDetail } from '@/pages/student/ProductDetail';
import { StudentManagement } from '@/pages/teacher/StudentManagement';
import { ProductManagement } from '@/pages/teacher/ProductManagement';
import { PointsManagement } from '@/pages/teacher/PointsManagement';
import { OrderManagement } from '@/pages/teacher/OrderManagement';
import { LotteryPage } from '@/pages/teacher/LotteryPage';
import { ImportPage } from '@/pages/teacher/ImportPage';
import { Notification } from '@/components/ui/Notification';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<TeacherLayout />}>
          <Route index element={<StudentManagement />} />
          <Route path="teacher/students" element={<StudentManagement />} />
          <Route path="teacher/products" element={<ProductManagement />} />
          <Route path="teacher/points" element={<PointsManagement />} />
          <Route path="teacher/orders" element={<OrderManagement />} />
          <Route path="teacher/lottery" element={<LotteryPage />} />
          <Route path="teacher/import" element={<ImportPage />} />
        </Route>
        <Route element={<StudentLayout />}>
          <Route path="student" element={<StudentDashboard />} />
          <Route path="student/products" element={<ProductList />} />
          <Route path="student/products/:id" element={<ProductDetail />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
          <Notification />
        </AuthProvider>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
