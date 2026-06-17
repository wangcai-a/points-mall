import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, User, Upload, FileText, Check, X, AlertCircle } from 'lucide-react';
import { studentService } from '@/services/studentService';
import { Student, StudentImportPreview } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table, Column } from '@/components/ui/Table';
import { useApp } from '@/store/AppContext';

export const StudentManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, pageSize: 10, total: 0 });
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [classes, setClasses] = useState<string[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [deletingStudent, setDeletingStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ name: '', class_name: '', total_points: 0 });
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<StudentImportPreview | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { showNotification } = useApp();

  const fetchStudents = async (page = 1, keyword = '', classFilter = '') => {
    setLoading(true);
    try {
      const response = await studentService.getStudents({
        page,
        pageSize: pagination.pageSize,
        name: keyword || undefined,
        class_name: classFilter || undefined,
      });
      setStudents(response.list);
      setPagination(prev => ({ ...prev, page: response.page, total: response.total }));
    } catch (error) {
      showNotification('获取学生列表失败', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const response = await studentService.getClasses();
      setClasses(response);
    } catch (error) {
      showNotification('获取班级列表失败', 'error');
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    fetchStudents(1, keyword, selectedClass);
  };

  const handleClassChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClass(e.target.value);
    fetchStudents(1, searchKeyword, e.target.value);
  };

  const handlePageChange = (page: number) => {
    fetchStudents(page, searchKeyword, selectedClass);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.class_name) {
      showNotification('请填写完整信息', 'warning');
      return;
    }
    try {
      await studentService.createStudent({
        name: formData.name,
        class_name: formData.class_name,
        total_points: formData.total_points,
      });
      showNotification('创建成功', 'success');
      setShowCreateModal(false);
      setFormData({ name: '', class_name: '', total_points: 0 });
      fetchStudents();
    } catch (error) {
      showNotification(error instanceof Error ? error.message : '创建失败', 'error');
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({ name: student.name, class_name: student.class_name, total_points: student.total_points });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!editingStudent || !formData.name || !formData.class_name) {
      showNotification('请填写完整信息', 'warning');
      return;
    }
    try {
      await studentService.updateStudent(editingStudent.id, {
        name: formData.name,
        class_name: formData.class_name,
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

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (extension !== 'xlsx' && extension !== 'xls') {
        showNotification('请上传Excel文件（.xlsx或.xls格式）', 'error');
        return;
      }
      setImportFile(selectedFile);
    }
  };

  const handleImportUpload = async () => {
    if (!importFile) {
      showNotification('请先选择文件', 'warning');
      return;
    }
    setIsUploading(true);
    try {
      const result = await studentService.importExcel(importFile);
      setImportPreview(result);
      showNotification('文件解析成功', 'success');
    } catch (error) {
      showNotification(error instanceof Error ? error.message : '文件解析失败', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!importPreview) return;
    const validRecords = importPreview.preview.filter((item) => item.valid);
    if (validRecords.length === 0) {
      showNotification('没有可导入的有效记录', 'warning');
      return;
    }
    setIsImporting(true);
    try {
      const records = validRecords.map((item) => ({
        name: item.name,
        class_name: item.class_name,
        total_points: item.total_points,
      }));
      const result = await studentService.confirmImport(records);
      showNotification(`导入成功！成功: ${result.success_count} 条，失败: ${result.fail_count} 条`, 'success');
      setImportPreview(null);
      setImportFile(null);
      setShowImportModal(false);
      fetchStudents();
    } catch (error) {
      showNotification(error instanceof Error ? error.message : '导入失败', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  const columns: Column<Student>[] = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '姓名' },
    { key: 'class_name', label: '班级' },
    { key: 'total_points', label: '积分' },
    { key: 'created_at', label: '创建时间', render: (value: unknown) => new Date(value as string).toLocaleDateString() },
    {
      key: 'actions',
      label: '操作',
      render: (_value: unknown, row: Student) => (
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
        <div className="flex gap-2">
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" />
            添加学生
          </Button>
          <Button variant="outline" onClick={() => setShowImportModal(true)}>
            <Upload className="w-4 h-4" />
            导入学生
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="搜索学生姓名..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">班级筛选：</label>
          <select
            value={selectedClass}
            onChange={handleClassChange}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            <option value="">全部班级</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>{cls}</option>
            ))}
          </select>
        </div>
      </div>

      <Table
        data={students}
        columns={columns}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
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
              value={formData.class_name}
              onChange={(e) => setFormData(prev => ({ ...prev, class_name: e.target.value }))}
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
              value={formData.class_name}
              onChange={(e) => setFormData(prev => ({ ...prev, class_name: e.target.value }))}
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

      <Modal isOpen={showImportModal} onClose={() => { setShowImportModal(false); setImportPreview(null); setImportFile(null); }} title="导入学生">
        {!importPreview ? (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-8 h-8 text-primary-500" />
              </div>
              <p className="text-gray-600">上传Excel文件导入学生名单</p>
            </div>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-primary-400 transition-colors">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportFileChange}
                className="hidden"
                id="student-file-upload"
              />
              <label
                htmlFor="student-file-upload"
                className="cursor-pointer block"
              >
                <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">点击或拖拽文件到此处</p>
                <p className="text-sm text-gray-400 mt-1">支持 .xlsx, .xls 格式</p>
              </label>
              {importFile && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg inline-block">
                  <span className="text-gray-600">{importFile.name}</span>
                  <button
                    onClick={() => setImportFile(null)}
                    className="ml-3 text-red-500 hover:text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <div className="p-3 bg-yellow-50 rounded-lg">
              <h4 className="font-medium text-yellow-800 mb-2">Excel文件格式要求：</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• 第一行为标题行：姓名、班级、积分</li>
                <li>• 列顺序：姓名、班级、积分</li>
                <li>• 积分列可留空，默认为0</li>
              </ul>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => { setShowImportModal(false); setImportFile(null); }} className="flex-1">
                取消
              </Button>
              <Button onClick={handleImportUpload} loading={isUploading} disabled={!importFile} className="flex-1">
                <Upload className="w-4 h-4" />
                上传并解析
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">导入预览</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-green-600">
                  <Check className="w-4 h-4 inline mr-1" />
                  有效: {importPreview.valid_count} 条
                </span>
                <span className="text-red-600">
                  <X className="w-4 h-4 inline mr-1" />
                  无效: {importPreview.invalid_count} 条
                </span>
              </div>
            </div>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">行号</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">姓名</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">班级</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">积分</th>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {importPreview.preview.map((item) => (
                    <tr
                      key={item.row}
                      className={`border-b ${item.valid ? 'bg-green-50/50' : 'bg-red-50/50'}`}
                    >
                      <td className="px-4 py-2 text-sm">{item.row}</td>
                      <td className="px-4 py-2 text-sm">{item.name}</td>
                      <td className="px-4 py-2 text-sm">{item.class_name}</td>
                      <td className="px-4 py-2 text-sm">{item.total_points}</td>
                      <td className="px-4 py-2">
                        {item.valid ? (
                          <span className="flex items-center gap-1 text-green-600 text-sm">
                            <Check className="w-4 h-4" />
                            有效
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            {item.error}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => { setImportPreview(null); setImportFile(null); }} className="flex-1">
                重新上传
              </Button>
              <Button onClick={handleConfirmImport} loading={isImporting} className="flex-1">
                <Check className="w-4 h-4" />
                确认导入
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}