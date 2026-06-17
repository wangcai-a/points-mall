import { useState, useEffect } from 'react';
import { ShoppingCart, Check, X, Clock } from 'lucide-react';
import { orderService } from '@/services/orderService';
import { Order, OrderStatus } from '@/types';
import { Table } from '@/components/ui/Table';
import { useApp } from '@/store/AppContext';

export const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [filterStatus, setFilterStatus] = useState<OrderStatus | ''>('');
  const { showNotification } = useApp();

  const fetchOrders = async (page = 1, status?: string) => {
    setLoading(true);
    try {
      const response = await orderService.getOrders({
        page,
        pageSize: pagination.pageSize,
        status: status || undefined,
      });
      setOrders(response.list);
      setPagination(prev => ({ ...prev, page: response.page, total: response.total }));
    } catch (error) {
      showNotification('获取订单列表失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePageChange = (page: number) => {
    fetchOrders(page, filterStatus || undefined);
  };

  const handleStatusChange = async (orderId: number, status: OrderStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      showNotification('状态更新成功', 'success');
      fetchOrders(pagination.page, filterStatus || undefined);
    } catch (error) {
      showNotification(error instanceof Error ? error.message : '更新失败', 'error');
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'cancelled':
        return <X className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return '待处理';
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
    }
  };

  const columns = [
    { key: 'id', label: '订单ID' },
    { key: 'student_name', label: '学生' },
    { key: 'product_name', label: '商品' },
    {
      key: 'status',
      label: '状态',
      render: (value: OrderStatus) => (
        <div className="flex items-center gap-2">
          {getStatusIcon(value)}
          <span className={`font-medium ${
            value === 'pending' ? 'text-yellow-600' :
            value === 'completed' ? 'text-green-600' : 'text-red-600'
          }`}>
            {getStatusText(value)}
          </span>
        </div>
      ),
    },
    { key: 'created_at', label: '创建时间', render: (value: string) => new Date(value).toLocaleString() },
    {
      key: 'actions',
      label: '操作',
      render: (_value: unknown, row: Order) => (
        <div className="flex items-center gap-2">
          {row.status === 'pending' && (
            <>
              <button
                onClick={() => handleStatusChange(row.id, 'completed')}
                className="px-3 py-1 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm"
              >
                完成
              </button>
              <button
                onClick={() => handleStatusChange(row.id, 'cancelled')}
                className="px-3 py-1 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm"
              >
                取消
              </button>
            </>
          )}
          {row.status !== 'pending' && (
            <span className="text-gray-400 text-sm">无操作</span>
          )}
        </div>
      ),
    },
  ];

  const statusOptions: { value: OrderStatus | ''; label: string }[] = [
    { value: '', label: '全部' },
    { value: 'pending', label: '待处理' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-800">订单管理</h2>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterStatus}
            onChange={(e) => {
              const value = e.target.value as OrderStatus | '';
              setFilterStatus(value);
              fetchOrders(1, value || undefined);
            }}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Table<Order>
        data={orders}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        searchPlaceholder="搜索学生或商品..."
        onSearch={(keyword) => {
          console.log('搜索:', keyword);
        }}
      />
    </div>
  );
};