import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingBag, Star, ArrowLeft, AlertCircle } from 'lucide-react';
import { productService } from '@/services/productService';
import { studentService } from '@/services/studentService';
import { orderService } from '@/services/orderService';
import { Product, Student } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useApp } from '@/store/AppContext';

export const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const { showNotification } = useApp();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await productService.getProduct(parseInt(id || '0'));
        setProduct(response);
      } catch (error) {
        console.error('获取商品详情失败:', error);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await studentService.getStudents({ page: 1, pageSize: 100 });
        setStudents(response.list);
      } catch (error) {
        console.error('获取学生列表失败:', error);
      }
    };
    fetchStudents();
  }, []);

  const handleExchange = async () => {
    if (!selectedStudent || !product) return;
    try {
      await orderService.createOrder({ student_id: selectedStudent, product_id: product.id });
      showNotification('兑换成功', 'success');
      setShowExchangeModal(false);
      setSelectedStudent(null);
    } catch (error) {
      showNotification(error instanceof Error ? error.message : '兑换失败', 'error');
    }
  };

  if (!product) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">加载中...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => window.history.back()}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        返回商品列表
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="h-80 bg-gray-100 flex items-center justify-center">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <ShoppingBag className="w-24 h-24 text-gray-300" />
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <span className="px-3 py-1 bg-primary-50 text-primary-600 text-sm rounded-full">
              {product.category}
            </span>
            <h1 className="text-2xl font-bold text-gray-800 mt-3">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-500" />
              <span className="text-3xl font-bold text-primary-600">{product.price_points}</span>
              <span className="text-gray-500">积分</span>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${product.stock > 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              {product.stock > 0 ? `库存: ${product.stock}` : '已售罄'}
            </span>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">商品描述</h3>
            <p className="text-gray-600">{product.description}</p>
          </div>

          <Button
            onClick={() => setShowExchangeModal(true)}
            disabled={product.stock === 0}
            className="w-full"
          >
            兑换商品
          </Button>
        </div>
      </div>

      <Modal
        isOpen={showExchangeModal}
        onClose={() => {
          setShowExchangeModal(false);
          setSelectedStudent(null);
        }}
        title="选择学生兑换"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">选择学生</label>
            <select
              value={selectedStudent || ''}
              onChange={(e) => setSelectedStudent(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">请选择学生</option>
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} - {student.class} (积分: {student.total_points})
                </option>
              ))}
            </select>
          </div>

          {selectedStudent && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-700">
                  确认扣除学生 {students.find(s => s.id === selectedStudent)?.name} 的 {product.price_points} 积分？
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setShowExchangeModal(false);
                setSelectedStudent(null);
              }}
              className="flex-1"
            >
              取消
            </Button>
            <Button
              onClick={handleExchange}
              disabled={!selectedStudent}
              className="flex-1"
            >
              确认兑换
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
