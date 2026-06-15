import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/store/AuthContext';
import { AppProvider } from '@/store/AppContext';
import { LoginPage } from '@/pages/auth/LoginPage';
import { StudentLayout } from '@/components/layout/StudentLayout';
import { TeacherLayout } from '@/components/layout/TeacherLayout';
import { StudentDashboard } from '@/pages/student/StudentDashboard';
import { ProductList } from '@/pages/student/ProductList';
import { ProductDetail } from '@/pages/student/ProductDetail';
import { StudentManagement } from '@/pages/teacher/StudentManagement';
import { PointsManagement } from '@/pages/teacher/PointsManagement';
import { OrderManagement } from '@/pages/teacher/OrderManagement';
import { LotteryPage } from '@/pages/teacher/LotteryPage';
import { ImportPage } from '@/pages/teacher/ImportPage';

const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return null;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<StudentLayout />}>
          <Route index element={<StudentDashboard />} />
          <Route path="products" element={<ProductList />} />
          <Route path="products/:id" element={<ProductDetail />} />
        </Route>
        <Route element={<TeacherLayout />}>
          <Route index element={<StudentManagement />} />
          <Route path="teacher/students" element={<StudentManagement />} />
          <Route path="teacher/points" element={<PointsManagement />} />
          <Route path="teacher/orders" element={<OrderManagement />} />
          <Route path="teacher/lottery" element={<LotteryPage />} />
          <Route path="teacher/import" element={<ImportPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
