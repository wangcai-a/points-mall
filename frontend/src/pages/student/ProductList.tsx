import { useState, useEffect } from 'react';
import { ShoppingBag, Star, Filter } from 'lucide-react';
import { productService } from '@/services/productService';
import { Product } from '@/types';

export const ProductList = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await productService.getProducts({ category: selectedCategory || undefined });
        setProducts(response.list);
      } catch (error) {
        console.error('获取商品列表失败:', error);
      }
    };
    fetchProducts();
  }, [selectedCategory]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await productService.getCategories();
        setCategories(response);
      } catch (error) {
        console.error('获取分类失败:', error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Filter className="w-5 h-5 text-gray-500" />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedCategory === ''
                ? 'bg-primary-500 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            全部
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-500 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-card overflow-hidden hover:shadow-card-hover transition-shadow"
          >
            <div className="h-48 bg-gray-100 flex items-center justify-center">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ShoppingBag className="w-16 h-16 text-gray-300" />
              )}
            </div>
            <div className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-primary-50 text-primary-600 text-xs rounded-full">
                  {product.category}
                </span>
              </div>
              <h3 className="font-semibold text-gray-800 mb-2">{product.name}</h3>
              <p className="text-sm text-gray-500 mb-3 line-clamp-2">{product.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold text-lg text-primary-600">{product.price_points}</span>
                  <span className="text-sm text-gray-500">积分</span>
                </div>
                <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  库存: {product.stock}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-16">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">暂无商品</p>
        </div>
      )}
    </div>
  );
};
