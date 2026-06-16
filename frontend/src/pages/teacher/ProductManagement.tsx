import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Trash2, Search, ShoppingBag, Upload, X, Image as ImageIcon } from 'lucide-react';
import { productService } from '@/services/productService';
import { uploadService } from '@/services/uploadService';
import { Product } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { useApp } from '@/store/AppContext';

const DEFAULT_IMAGES = [
  'https://picsum.photos/seed/product1/400/400',
  'https://picsum.photos/seed/product2/400/400',
  'https://picsum.photos/seed/product3/400/400',
  'https://picsum.photos/seed/product4/400/400',
  'https://picsum.photos/seed/product5/400/400',
];

export const ProductManagement = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', price_points: 0, stock: 0, image_url: '', category: '' });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showNotification } = useApp();

  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const response = await productService.getProducts({
        page,
        pageSize: pagination.pageSize,
      });
      const filtered = searchKeyword
        ? response.list.filter(p => p.name.toLowerCase().includes(searchKeyword.toLowerCase()))
        : response.list;
      setProducts(filtered);
      setPagination(prev => ({ ...prev, page: response.page, total: response.total }));
    } catch (error) {
      showNotification('获取商品列表失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    fetchProducts(1);
  };

  const handlePageChange = (page: number) => {
    fetchProducts(page);
  };

  const handleCreate = async () => {
    if (!formData.name || formData.price_points <= 0) {
      showNotification('请填写商品名称和价格', 'warning');
      return;
    }
    try {
      await productService.createProduct({
        name: formData.name,
        description: formData.description,
        price_points: formData.price_points,
        stock: formData.stock,
        image_url: formData.image_url,
        category: formData.category,
      });
      showNotification('创建成功', 'success');
      setShowCreateModal(false);
      setFormData({ name: '', description: '', price_points: 0, stock: 0, image_url: '', category: '' });
      fetchProducts();
    } catch (error) {
      showNotification(error instanceof Error ? error.message : '创建失败', 'error');
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price_points: product.price_points,
      stock: product.stock,
      image_url: product.image_url,
      category: product.category,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editingProduct || !formData.name || formData.price_points <= 0) {
      showNotification('请填写商品名称和价格', 'warning');
      return;
    }
    try {
      await productService.updateProduct(editingProduct.id, {
        name: formData.name,
        description: formData.description,
        price_points: formData.price_points,
        stock: formData.stock,
        category: formData.category,
        image_url: formData.image_url,
      });
      showNotification('更新成功', 'success');
      setShowEditModal(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      showNotification(error instanceof Error ? error.message : '更新失败', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;
    try {
      await productService.deleteProduct(deletingProduct.id);
      showNotification('删除成功', 'success');
      setShowDeleteModal(false);
      setDeletingProduct(null);
      fetchProducts();
    } catch (error) {
      showNotification(error instanceof Error ? error.message : '删除失败', 'error');
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showNotification('不支持的图片格式', 'warning');
      return;
    }
    
    setUploading(true);
    try {
      const result = await uploadService.uploadImage(file);
      setFormData(prev => ({ ...prev, image_url: result.image_url }));
      showNotification('图片上传成功', 'success');
    } catch (error) {
      showNotification(error instanceof Error ? error.message : '图片上传失败', 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSelectDefaultImage = (imageUrl: string) => {
    setFormData(prev => ({ ...prev, image_url: imageUrl }));
    setShowImagePickerModal(false);
  };

  const handleClearImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '商品名称' },
    { key: 'description', label: '描述', render: (value) => (value as string).length > 20 ? `${(value as string).slice(0, 20)}...` : value },
    { key: 'price_points', label: '价格(积分)' },
    { key: 'stock', label: '库存' },
    { key: 'category', label: '分类' },
    { key: 'created_at', label: '创建时间', render: (value) => new Date(value as string).toLocaleDateString() },
    {
      key: 'actions',
      label: '操作',
      render: (_value, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEdit(row)}
            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setDeletingProduct(row);
              setShowDeleteModal(true);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShoppingBag className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-800">商品管理</h2>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" />
          添加商品
        </Button>
      </div>

      <Table
        data={products}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        searchPlaceholder="搜索商品名称..."
        onSearch={handleSearch}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="添加商品">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">商品名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="请输入商品名称"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">商品描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="请输入商品描述"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">价格(积分)</label>
            <input
              type="number"
              min="1"
              value={formData.price_points}
              onChange={(e) => setFormData(prev => ({ ...prev, price_points: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="请输入商品价格"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">库存</label>
            <input
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="请输入库存数量"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="请输入商品分类"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">商品图片</label>
            <div className="space-y-3">
              {formData.image_url && (
                <div className="flex items-center gap-3">
                  <img
                    src={formData.image_url}
                    alt="商品预览"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 truncate">{formData.image_url}</p>
                  </div>
                  <button
                    onClick={handleClearImage}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? '上传中...' : '上传图片'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowImagePickerModal(true)}
                  className="flex-1"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  使用默认图片
                </Button>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setShowCreateModal(false)} className="flex-1">
              取消
            </Button>
            <Button onClick={handleCreate} className="flex-1">
              确认添加
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showImagePickerModal} onClose={() => setShowImagePickerModal(false)} title="选择默认图片">
        <div className="grid grid-cols-5 gap-3">
          {DEFAULT_IMAGES.map((img, index) => (
            <button
              key={index}
              onClick={() => handleSelectDefaultImage(img)}
              className="group relative overflow-hidden rounded-lg border-2 border-transparent hover:border-primary-500 transition-colors"
            >
              <img
                src={img}
                alt={`默认图片 ${index + 1}`}
                className="w-full aspect-square object-cover"
              />
              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium">选择</span>
              </div>
            </button>
          ))}
        </div>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingProduct(null); }} title="编辑商品">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">商品名称</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">商品描述</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">价格(积分)</label>
            <input
              type="number"
              min="1"
              value={formData.price_points}
              onChange={(e) => setFormData(prev => ({ ...prev, price_points: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">库存</label>
            <input
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">分类</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">商品图片</label>
            <div className="space-y-3">
              {formData.image_url && (
                <div className="flex items-center gap-3">
                  <img
                    src={formData.image_url}
                    alt="商品预览"
                    className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-500 truncate">{formData.image_url}</p>
                  </div>
                  <button
                    onClick={handleClearImage}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex-1"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? '上传中...' : '上传图片'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowImagePickerModal(true)}
                  className="flex-1"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  使用默认图片
                </Button>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => { setShowEditModal(false); setEditingProduct(null); }} className="flex-1">
              取消
            </Button>
            <Button onClick={handleUpdate} className="flex-1">
              确认更新
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeletingProduct(null); }} title="确认删除">
        <p className="text-gray-600 mb-4">
          确定要删除商品 <span className="font-semibold">{deletingProduct?.name}</span> 吗？此操作不可撤销。
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => { setShowDeleteModal(false); setDeletingProduct(null); }} className="flex-1">
            取消
          </Button>
          <Button variant="danger" onClick={handleDeleteConfirm} className="flex-1">
            确认删除
          </Button>
        </div>
      </Modal>
    </div>
  );
};