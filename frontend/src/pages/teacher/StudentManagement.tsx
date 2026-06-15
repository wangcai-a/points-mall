import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, User } from 'lucide-react';
import { studentService } from '@/services/studentService';
import { Student } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { useApp } from '@/store/AppContext';

export const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ name: '', class: '', total_points: 0 });
  const { showNotification } = useApp();

  const fetchStudents = async (page = 1, keyword = '') => {
    setLoading(true);
    try {
      const response = await studentService.getStudents({
        page,
        pageSize: pagination.pageSize,
        name: keyword || undefined,
      });
      setStudents(response.list);
      setPagination(prev => ({ ...prev, page: response.page, total: response.total }));
    } catch (error) {
      showNotification('获取学生列表失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    fetchStudents(1, keyword);
  };

  const handlePageChange = (page: number) => {
    fetchStudents(page, searchKeyword);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.class) {
      showNotification('请填写完整信息', 'warning');
      return;
    }
    try {
      await studentService.createStudent({
        name: formData.name,
        class: formData.class,
        total_points: formData.total_points,
      });
      showNotification('创建成功', 'success');
      setShowCreateModal(false);
      setFormData({ name: '', class: '', total_points: 0 });
      fetchStudents();
    } catch (error) {
      showNotification(error instanceof Error ? error.message : '创建失败', 'error');
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({ name: student.name, class: student.class, total_points: student.total_points });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editingStudent || !formData.name || !formData.class) {
      showNotification('请填写完整信息', 'warning');
      return;
    }
    try {
      await studentService.updateStudent(editingStudent.id, {
        name: formData.name,
        class: formData.class,
      });
      showNotification('更新成功', 'success');
      setShowEditModal(false);
      setEditingStudent(null);
      fetchStudents();
    } catch (error) {
      showNotification(error instanceof Error ? error.message : '更新失败', 'error');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingStudent) return;
    try {
      await studentService.deleteStudent(deletingStudent.id);
      showNotification('删除成功', 'success');
      setShowDeleteModal(false);
      setDeletingStudent(null);
      fetchStudents();
    } catch (error) {
      showNotification(error instanceof Error ? error.message : '删除失败', 'error');
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '姓名' },
    { key: 'class', label: '班级' },
    { key: 'total_points', label: '积分' },
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
              setDeletingStudent(row);
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
          <User className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-800">学生管理</h2>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4" />
          添加学生
        </Button>
      </div>

      <Table
        data={students}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        searchPlaceholder="搜索学生姓名..."
        onSearch={handleSearch}
      />

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="添加学生">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="请输入学生姓名"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">班级</label>
            <input
              type="text"
              value={formData.class}
              onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="请输入班级"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">初始积分</label>
            <input
              type="number"
              value={formData.total_points}
              onChange={(e) => setFormData(prev => ({ ...prev, total_points: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="请输入初始积分"
            />
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

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingStudent(null); }} title="编辑学生">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">班级</label>
            <input
              type="text"
              value={formData.class}
              onChange={(e) => setFormData(prev => ({ ...prev, class: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => { setShowEditModal(false); setEditingStudent(null); }} className="flex-1">
              取消
            </Button>
            <Button onClick={handleUpdate} className="flex-1">
              确认更新
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => { setShowDeleteModal(false); setDeletingStudent(null); }} title="确认删除">
        <p className="text-gray-600 mb-4">
          确定要删除学生 <span className="font-semibold">{deletingStudent?.name}</span> 吗？此操作不可撤销。
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => { setShowDeleteModal(false); setDeletingStudent(null); }} className="flex-1">
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
