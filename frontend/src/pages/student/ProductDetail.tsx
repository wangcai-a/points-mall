import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ShoppingBag, Star, ArrowLeft, AlertCircle, Search, User } from 'lucide-react';
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
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const { showNotification } = useApp();

  const classList = useMemo(() => {
    const classes = [...new Set(students.map((s) => s.class_name).filter(Boolean))];
    return ['', ...classes];
  }, [students]);

  const fetchProduct = async () => {
    try {
      const response = await productService.getProduct(parseInt(id || '0'));
      setProduct(response);
    } catch (error) {
      console.error('获取商品详情失败:', error);
    }
  };

  useEffect(() => {
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

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchName = !searchKeyword || student.name.toLowerCase().includes(searchKeyword.toLowerCase());
      const matchClass = !selectedClass || student.class_name === selectedClass;
      return matchName && matchClass;
    });
  }, [students, searchKeyword, selectedClass]);

  const handleExchange = async () => {
    if (!selectedStudent || !product) return;
    try {
      await orderService.createOrder({ student_id: selectedStudent, product_id: product.id });
      showNotification('兑换成功', 'success');
      setShowExchangeModal(false);
      setSelectedStudent(null);
      setSearchKeyword('');
      await fetchProduct();
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
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                }}
              />
            ) : null}
            <ShoppingBag className={`w-24 h-24 text-gray-300 ${product.image_url ? 'hidden fallback-icon' : ''}`} />
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
          setSearchKeyword('');
          setSelectedClass('');
        }}
        title="选择学生兑换"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">选择班级</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">全部班级</option>
                {classList.map((className) => (
                  <option key={className} value={className}>
                    {className || '全部班级'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">搜索学生</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="输入姓名搜索..."
                />
              </div>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {filteredStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                <User className="w-12 h-12 mb-2" />
                <p>没有找到匹配的学生</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => setSelectedStudent(student.id)}
                    className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left ${
                      selectedStudent === student.id
                        ? 'bg-primary-50 border-l-4 border-primary-500'
                        : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">{student.name}</p>
                        <p className="text-sm text-gray-500">{student.class_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary-600">{student.total_points}</p>
                      <p className="text-xs text-gray-400">积分</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedStudent && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="text-yellow-700">
                  确认扣除学生 {students.find((s) => s.id === selectedStudent)?.name} 的 {product.price_points} 积分？
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
                setSearchKeyword('');
                setSelectedClass('');
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
