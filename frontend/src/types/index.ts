export interface Teacher {
  id: number;
  username: string;
  name: string;
}

export interface Student {
  id: number;
  name: string;
  class_name: string;
  total_points: number;
  created_at: string;
  updated_at: string;
}

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

export interface PointsRecord {
  id: number;
  change_amount: number;
  reason: string;
  type: 'award' | 'deduct' | 'redeem' | 'lottery' | 'import';
  teacher_name: string;
  created_at: string;
}

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
  image_url?: string;
}

export type OrderStatus = 'pending' | 'completed' | 'cancelled';

export interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface LoginResponse {
  token: string;
  teacher: Teacher;
}

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

export interface PaginatedProducts {
  list: Product[];
  total: number;
  page: number;
  pageSize: number;
}

export interface PaginatedOrders {
  list: Order[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateOrderResponse {
  order_id: number;
  student_name: string;
  student_class: string;
  remaining_points: number;
  product_name: string;
  cost_points: number;
}

export interface LotteryResult {
  prize_name: string | null;
  is_win: boolean;
  remaining_points: number;
}

export interface PaginatedLotteryRecords {
  list: LotteryRecord[];
  total: number;
}

export interface PointsOperationResponse {
  student_id: number;
  total_points: number;
}

export interface ImportPreview {
  preview: Array<{
    row: number;
    student_id: number | null;
    name: string;
    class_name: string;
    change_amount: number;
    reason: string;
    valid: boolean;
    error?: string;
  }>;
  valid_count: number;
  invalid_count: number;
}

export interface StudentImportPreview {
  preview: Array<{
    row: number;
    name: string;
    class_name: string;
    total_points: number;
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
