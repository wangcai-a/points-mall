# 学生积分商城 - 前端开发文档

## 1. 项目概述

### 1.1 项目简介
学生积分商城是一个面向学校学生的积分激励平台，通过积分机制奖励学生的学习表现。前端采用 React + Vite + TailwindCSS 技术栈，提供响应式、高性能的用户界面。

### 1.2 核心功能模块
- **积分管理**：学生积分展示、积分变动记录
- **商品浏览**：商品列表、商品详情、分类筛选
- **订单管理**：兑换订单创建、状态跟踪
- **抽奖功能**：抽奖操作、中奖记录
- **数据导入**：Excel文件上传、数据预览
- **用户管理**：学生信息管理、积分排名

### 1.3 目标用户
- **学生**：查看积分、浏览商品、查看兑换/抽奖记录
- **教师**：管理积分、处理订单、操作抽奖、导入数据

---

## 2. 技术栈

### 2.1 核心技术
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 18.x | UI框架 |
| Vite | 6.x | 构建工具 |
| TypeScript | 5.x | 类型安全 |
| TailwindCSS | 3.x | 样式框架 |
| React Router | 6.x | 路由管理 |
| Axios | latest | HTTP客户端 |
| Lucide React | latest | 图标库 |
| XLSX | latest | Excel处理 |

### 2.2 开发工具
- **包管理器**：npm / pnpm
- **代码规范**：ESLint + Prettier
- **版本控制**：Git
- **浏览器支持**：Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### 2.3 后端对接
- **后端框架**：FastAPI 0.100+
- **数据库**：SQLite 3.x
- **认证方式**：JWT Token
- **API基础路径**：`/api`

---

## 3. 项目结构

```
积分商城/
├── src/
│   ├── assets/              # 静态资源
│   │   ├── images/         # 图片资源
│   │   └── styles/         # 全局样式
│   ├── components/         # 公共组件
│   │   ├── common/        # 通用组件
│   │   ├── layout/        # 布局组件
│   │   └── ui/            # UI基础组件
│   ├── pages/             # 页面组件
│   │   ├── student/       # 学生端页面
│   │   ├── teacher/       # 教师端页面
│   │   └── auth/          # 认证页面
│   ├── hooks/             # 自定义Hooks
│   ├── services/          # API服务
│   ├── store/             # 状态管理
│   ├── utils/             # 工具函数
│   ├── types/             # TypeScript类型定义
│   ├── constants/         # 常量定义
│   ├── App.tsx            # 根组件
│   └── main.tsx           # 入口文件
├── public/                 # 公共资源
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

---

## 4. 组件设计

### 4.1 组件层次结构

```
App
├── AuthProvider
├── Router
│   ├── PublicRoutes
│   │   └── LoginPage
│   └── ProtectedRoutes
│       ├── StudentLayout
│       │   ├── Header
│       │   ├── StudentDashboard
│       │   ├── ProductList
│       │   └── ProductDetail
│       └── TeacherLayout
│           ├── Sidebar
│           ├── Header
│           ├── StudentManagement
│           ├── PointsManagement
│           ├── OrderManagement
│           ├── LotteryPage
│           └── ImportPage
```

### 4.2 核心组件设计

#### 4.2.1 布局组件

**StudentLayout**
```typescript
interface StudentLayoutProps {
  children: React.ReactNode;
}
```

**TeacherLayout**
```typescript
interface TeacherLayoutProps {
  children: React.ReactNode;
}
```

#### 4.2.2 业务组件

**PointsCard**
```typescript
interface PointsCardProps {
  totalPoints: number;
  availablePoints: number;
  recentHistory: PointsRecord[];
}
```

**ProductCard**
```typescript
interface ProductCardProps {
  product: Product;
  onExchange?: (product: Product) => void;
}
```

**LotteryWheel**
```typescript
interface LotteryWheelProps {
  prizes: Prize[];
  onDraw: () => Promise<LotteryResult>;
  isDrawing: boolean;
}
```

**ExcelUploader**
```typescript
interface ExcelUploaderProps {
  onUpload: (file: File) => Promise<ImportPreview>;
  onConfirm: (data: ImportData) => Promise<void>;
}
```

#### 4.2.3 UI基础组件

**Button**
```typescript
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}
```

**Modal**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
```

**Table**
```typescript
interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: PaginationConfig;
}
```

---

## 5. 状态管理

### 5.1 状态管理架构

采用 React Context API + 自定义 Hooks 进行状态管理。

### 5.2 全局状态

**AuthContext**
```typescript
interface AuthContextType {
  user: Teacher | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}
```

**AppContext**
```typescript
interface AppContextType {
  currentStudent: Student | null;
  setCurrentStudent: (student: Student | null) => void;
  notification: Notification | null;
  showNotification: (message: string, type: 'success' | 'error') => void;
}
```

### 5.3 自定义Hooks

**useAuth**
```typescript
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

**useApi**
```typescript
const useApi = <T>(apiFunc: () => Promise<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunc();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};
```

---

## 6. 路由设计

### 6.1 路由配置

```typescript
const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        path: '',
        element: <StudentLayout />,
        children: [
          { index: true, element: <StudentDashboard /> },
          { path: 'products', element: <ProductList /> },
          { path: 'products/:id', element: <ProductDetail /> },
        ],
      },
      {
        path: 'teacher',
        element: <TeacherLayout />,
        children: [
          { index: true, element: <StudentManagement /> },
          { path: 'students', element: <StudentManagement /> },
          { path: 'points', element: <PointsManagement /> },
          { path: 'orders', element: <OrderManagement /> },
          { path: 'lottery', element: <LotteryPage /> },
          { path: 'import', element: <ImportPage /> },
        ],
      },
    ],
  },
]);
```

### 6.2 路由守卫

**ProtectedRoute**
```typescript
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
```

---

## 7. API集成

### 7.1 API客户端配置

```typescript
// src/services/api.ts
import axios, { AxiosError } from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => {
    const { code, data, message } = response.data;
    if (code !== 200) {
      throw new Error(message || '请求失败');
    }
    return data;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(errorMessage);
  }
);

export default apiClient;
```

### 7.2 API服务模块

**authService**
```typescript
export interface LoginResponse {
  token: string;
  teacher: Teacher;
}

export const authService = {
  login: (credentials: LoginCredentials): Promise<LoginResponse> =>
    apiClient.post('/auth/login', credentials),

  getCurrentUser: (): Promise<Teacher> =>
    apiClient.get('/auth/me'),

  logout: () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
};
```

**studentService**
```typescript
export interface PaginatedStudents {
  list: Student[];
  total: number;
  page: number;
  pageSize: number;
}

export interface StudentPointsHistory {
  list: PointsRecord[];
  total: number;
}

export const studentService = {
  getStudents: (params?: { page?: number; pageSize?: number; name?: string; class?: string }): Promise<PaginatedStudents> =>
    apiClient.get('/students', { params }),

  getStudent: (id: number): Promise<Student> =>
    apiClient.get(`/students/${id}`),

  createStudent: (data: { name: string; class: string; total_points?: number }): Promise<Student> =>
    apiClient.post('/students', data),

  updateStudent: (id: number, data: { name?: string; class?: string }): Promise<void> =>
    apiClient.put(`/students/${id}`, data),

  deleteStudent: (id: number): Promise<void> =>
    apiClient.delete(`/students/${id}`),

  getPointsHistory: (id: number, params?: { page?: number; pageSize?: number }): Promise<StudentPointsHistory> =>
    apiClient.get(`/students/${id}/points-history`, { params }),
};
```

**productService**
```typescript
export interface PaginatedProducts {
  list: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export const productService = {
  getProducts: (params?: { page?: number; pageSize?: number; category?: string }): Promise<PaginatedProducts> =>
    apiClient.get('/products', { params }),

  getCategories: (): Promise<string[]> =>
    apiClient.get('/products/categories'),

  getProduct: (id: number): Promise<Product> =>
    apiClient.get(`/products/${id}`),

  createProduct: (data: CreateProductData): Promise<{ id: number }> =>
    apiClient.post('/products', data),

  updateProduct: (id: number, data: UpdateProductData): Promise<void> =>
    apiClient.put(`/products/${id}`, data),

  deleteProduct: (id: number): Promise<void> =>
    apiClient.delete(`/products/${id}`),
};
```

**orderService**
```typescript
export interface PaginatedOrders {
  list: Order[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateOrderResponse {
  order_id: number;
}

export const orderService = {
  getOrders: (params?: { page?: number; pageSize?: number; status?: string; student_id?: number }): Promise<PaginatedOrders> =>
    apiClient.get('/orders', { params }),

  createOrder: (data: { student_id: number; product_id: number }): Promise<CreateOrderResponse> =>
    apiClient.post('/orders', data),

  getOrder: (id: number): Promise<Order> =>
    apiClient.get(`/orders/${id}`),

  updateOrderStatus: (id: number, status: OrderStatus): Promise<void> =>
    apiClient.put(`/orders/${id}`, { status }),
};
```

**lotteryService**
```typescript
export interface LotteryResult {
  prize_name: string | null;
  is_win: boolean;
  remaining_points: number;
}

export interface PaginatedLotteryRecords {
  list: LotteryRecord[];
  total: number;
}

export const lotteryService = {
  getPrizes: (): Promise<Prize[]> =>
    apiClient.get('/lottery/prizes'),

  draw: (data: { student_id: number; cost_points: number }): Promise<LotteryResult> =>
    apiClient.post('/lottery/draw', data),

  getRecords: (params?: { page?: number; pageSize?: number; student_id?: number }): Promise<PaginatedLotteryRecords> =>
    apiClient.get('/lottery/records', { params }),
};
```

**pointsService**
```typescript
export interface PointsOperationResponse {
  student_id: number;
  total_points: number;
}

export interface ImportPreview {
  preview: Array<{
    row: number;
    student_id: number | null;
    name: string;
    class: string;
    change_amount: number;
    reason: string;
    valid: boolean;
    error?: string;
  }>;
  valid_count: number;
  invalid_count: number;
}

export interface ImportConfirmResponse {
  success_count: number;
  fail_count: number;
}

export const pointsService = {
  award: (data: { student_id: number; amount: number; reason: string }): Promise<PointsOperationResponse> =>
    apiClient.post('/points/award', data),

  deduct: (data: { student_id: number; amount: number; reason: string }): Promise<PointsOperationResponse> =>
    apiClient.post('/points/deduct', data),

  importExcel: (file: File): Promise<ImportPreview> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/points/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  confirmImport: (data: { records: Array<{ student_id: number; change_amount: number; reason: string }> }): Promise<ImportConfirmResponse> =>
    apiClient.post('/points/import/confirm', data),
};
```

---

## 8. TypeScript类型定义

```typescript
// 用户类型
export interface Teacher {
  id: number;
  username: string;
  name: string;
}

export interface Student {
  id: number;
  name: string;
  class: string;
  total_points: number;
  created_at: string;
  updated_at: string;
}

// 商品类型
export interface Product {
  id: number;
  name: string;
  description: string;
  price_points: number;
  stock: number;
  image_url: string;
  category: string;
  created_at: string;
  updated_at: string;
}

// 订单类型
export interface Order {
  id: number;
  student_name: string;
  product_name: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  student?: { id: number; name: string; class: string };
  product?: { id: number; name: string; price_points: number };
  completed_at?: string;
}

// 积分记录类型
export interface PointsRecord {
  id: number;
  change_amount: number;
  reason: string;
  type: 'award' | 'deduct' | 'redeem' | 'lottery' | 'import';
  teacher_name: string;
  created_at: string;
}

// 抽奖类型
export interface Prize {
  id: number;
  name: string;
  probability: number;
  stock: number;
}

export interface LotteryRecord {
  id: number;
  student_name: string;
  cost_points: number;
  prize_name: string;
  is_win: boolean;
  teacher_name: string;
  created_at: string;
}

// 表单类型
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  price_points: number;
  stock: number;
  image_url: string;
  category: string;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price_points?: number;
  stock?: number;
  category?: string;
}

export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}
```

---

## 9. 样式系统

### 9.1 TailwindCSS配置

```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F2FF',
          100: '#B3D9FF',
          200: '#80C0FF',
          300: '#4DA7FF',
          400: '#1A8EFF',
          500: '#1E90FF',
          600: '#0072E5',
          700: '#0057B3',
          800: '#003D80',
          900: '#00224D',
        },
        secondary: {
          50: '#FFF7E6',
          100: '#FFE6B3',
          200: '#FFD680',
          300: '#FFC54D',
          400: '#FFB41A',
          500: '#FFA500',
          600: '#E69500',
          700: '#B37300',
          800: '#805200',
          900: '#4D3100',
        },
      },
      fontFamily: {
        sans: ['Microsoft YaHei', 'SimHei', 'sans-serif'],
      },
      borderRadius: {
        'lg': '12px',
        'xl': '16px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
};
```

---

## 10. 环境配置

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
```

---

## 11. 错误码规范

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未登录或Token无效 |
| 403 | 无权限访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

---

## 12. 开发规范

### 12.1 命名规范
- 文件命名：PascalCase（组件）/ camelCase（工具）
- 变量命名：camelCase
- 常量命名：UPPER_SNAKE_CASE
- 类型/接口：PascalCase

### 12.2 API响应处理
所有API响应统一格式：
```typescript
{
  "code": number,
  "message": string,
  "data": any
}
```

### 12.3 分页规范
分页参数：`page`（默认1）、`pageSize`（默认10）
分页响应包含：`list`、`total`、`page`、`pageSize`

---

**文档版本**：v1.1  
**创建日期**：2026年6月15日  
**最后更新**：2026年6月15日