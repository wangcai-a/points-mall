import { useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';

interface Column<T> {
  key: string;
  label: string;
  render?: (value: unknown, row: T) => React.ReactNode;
}

interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: PaginationConfig;
  onPageChange?: (page: number) => void;
  searchPlaceholder?: string;
  onSearch?: (keyword: string) => void;
  onClickRow?: (row: T) => void;
  selectedRowKey?: string | number;
}

export const Table = <T extends object>({
  data,
  columns,
  loading = false,
  pagination,
  onPageChange,
  searchPlaceholder = '搜索...',
  onSearch,
  onClickRow,
  selectedRowKey,
}: TableProps<T>) => {
  const [searchValue, setSearchValue] = useState('');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    onSearch?.(e.target.value);
  };

  const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 0;

  return (
    <div className="bg-white rounded-xl shadow-card">
      {onSearch && (
        <div className="p-4 border-b">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              {columns.map((column) => (
                <th key={String(column.key)} className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                  加载中...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                  暂无数据
                </td>
              </tr>
            ) : (
              data.map((row, index) => {
                const isSelected = selectedRowKey !== undefined && (row as Record<string, unknown>).id === selectedRowKey;
                return (
                  <tr
                    key={index}
                    className={`border-b border-gray-100 transition-colors ${
                      isSelected
                        ? 'bg-primary-50 border-l-4 border-l-primary-500'
                        : onClickRow
                        ? 'hover:bg-gray-50 cursor-pointer'
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onClickRow?.(row)}
                  >
                    {columns.map((column) => {
                        const rowRecord = row as Record<string, unknown>;
                        const value = rowRecord[String(column.key)];
                        return (
                          <td key={String(column.key)} className="px-4 py-3 text-sm text-gray-600">
                            {column.render
                              ? column.render(value, row)
                              : String(value)}
                          </td>
                        );
                      })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <span className="text-sm text-gray-500">
            显示第 {((pagination.page - 1) * pagination.pageSize) + 1} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} 条，共 {pagination.total} 条
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-medium text-gray-700">
              {pagination.page} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange?.(pagination.page + 1)}
              disabled={pagination.page === totalPages}
              className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
