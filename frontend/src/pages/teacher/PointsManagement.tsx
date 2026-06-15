import { useState, useEffect } from 'react';
import { Coins, Plus, Minus, Search } from 'lucide-react';
import { studentService } from '@/services/studentService';
import { pointsService } from '@/services/pointsService';
import { Student, PointsRecord } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { useApp } from '@/store/AppContext';

export const PointsManagement = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [pointsHistory, setPointsHistory] = useState<PointsRecord[]>([]);
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showDeductModal, setShowDeductModal] = useState(false);
  const [formData, setFormData] = useState({ amount: 0, reason: '' });
  const [searchKeyword, setSearchKeyword] = useState('');
  const { showNotification } = useApp();

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchPointsHistory(selectedStudent.id);
    }
  }, [selectedStudent]);

  const fetchStudents = async (keyword = '') => {
    try {
      const response = await studentService.getStudents({
        page: 1,
        pageSize: 100,
        name: keyword || undefined,
      });
      setStudents(response.list);
    } catch (error) {
      showNotification('获取学生列表失败', 'error');
    }
  };

  const fetchPointsHistory = async (studentId: number) => {
    try {
      const response = await studentService.getPointsHistory(studentId);
      setPointsHistory(response.list);
    } catch (error) {
      showNotification('获取积分记录失败', 'error');
    }
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    fetchStudents(keyword);
  };

  const handleAward = async () => {
    if (!selectedStudent || formData.amount <= 0 || !formData.reason) {
      showNotification('请填写完整信息', 'warning');
      return;
    }
    try {
      await pointsService.award({
        student_id: selectedStudent.id,
        amount: formData.amount,
        reason: formData.reason,
      });
      showNotification('积分发放成功', 'success');
      setShowAwardModal(false);
      setFormData({ amount: 0, reason: '' });
      fetchStudents();
      if (selectedStudent) {
        fetchPointsHistory(selectedStudent.id);
      }
    } catch (error) {
      showNotification(error instanceof Error ? error.message : '发放失败', 'error');
    }
  };

  const handleDeduct = async () => {
    if (!selectedStudent || formData.amount <= 0 || !formData.reason) {
      showNotification('请填写完整信息', 'warning');
      return;
    }
    try {
      await pointsService.deduct({
        student_id: selectedStudent.id,
        amount: formData.amount,
        reason: formData.reason,
      });
      showNotification('积分扣除成功', 'success');
      setShowDeductModal(false);
      setFormData({ amount: 0, reason: '' });
      fetchStudents();
      if (selectedStudent) {
        fetchPointsHistory(selectedStudent.id);
      }
    } catch (error) {
      showNotification(error instanceof Error ? error.message : '扣除失败', 'error');
    }
  };

  const studentColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '姓名' },
    { key: 'class', label: '班级' },
    {
      key: 'total_points',
      label: '积分',
      render: (value) => (
        <span className="font-bold text-primary-600">{value}</span>
      ),
    },
    {
      key: 'actions',
      label: '操作',
      render: (_value, row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedStudent(row);
              setShowAwardModal(true);
            }}
            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              setSelectedStudent(row);
              setShowDeductModal(true);
            }}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const historyColumns = [
    {
      key: 'change_amount',
      label: '变动积分',
      render: (value) => (
        <span className={`font-bold ${(value as number) > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {(value as number) > 0 ? '+' : ''}{value}
        </span>
      ),
    },
    { key: 'reason', label: '原因' },
    { key: 'teacher_name', label: '操作教师' },
    { key: 'type', label: '类型', render: (value) => {
      const typeMap: Record<string, string> = {
        award: '奖励',
        deduct: '扣除',
        redeem: '兑换',
        lottery: '抽奖',
        import: '导入',
      };
      return typeMap[value as string] || value;
    }},
    { key: 'created_at', label: '时间', render: (value) => new Date(value as string).toLocaleString() },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Coins className="w-6 h-6 text-primary-600" />
            <h2 className="text-xl font-semibold text-gray-800">积分管理</h2>
          </div>
        </div>

        <Table
          data={students}
          columns={studentColumns}
          searchPlaceholder="搜索学生姓名..."
          onSearch={handleSearch}
        />
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-card p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {selectedStudent ? `${selectedStudent.name} 的积分记录` : '选择学生查看积分记录'}
          </h3>
          {selectedStudent && (
            <div className="mb-4 p-4 bg-primary-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">当前积分</span>
                <span className="text-2xl font-bold text-primary-600">{selectedStudent.total_points}</span>
              </div>
            </div>
          )}
          <Table
            data={pointsHistory}
            columns={historyColumns}
          />
        </div>
      </div>

      <Modal isOpen={showAwardModal} onClose={() => { setShowAwardModal(false); setFormData({ amount: 0, reason: '' }); }} title={`给 ${selectedStudent?.name} 发放积分`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">发放积分</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="请输入积分数量"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">发放原因</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="请输入发放原因"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => { setShowAwardModal(false); setFormData({ amount: 0, reason: '' }); }} className="flex-1">
              取消
            </Button>
            <Button onClick={handleAward} className="flex-1">
              <Plus className="w-4 h-4" />
              确认发放
            </Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDeductModal} onClose={() => { setShowDeductModal(false); setFormData({ amount: 0, reason: '' }); }} title={`扣除 ${selectedStudent?.name} 的积分`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">扣除积分</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="请输入积分数量"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">扣除原因</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="请输入扣除原因"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => { setShowDeductModal(false); setFormData({ amount: 0, reason: '' }); }} className="flex-1">
              取消
            </Button>
            <Button variant="danger" onClick={handleDeduct} className="flex-1">
              <Minus className="w-4 h-4" />
              确认扣除
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
