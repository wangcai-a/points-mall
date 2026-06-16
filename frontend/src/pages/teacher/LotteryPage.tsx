import { useState, useEffect } from 'react';
import { Ticket, RotateCcw, Sparkles, Search } from 'lucide-react';
import { studentService } from '@/services/studentService';
import { lotteryService } from '@/services/lotteryService';
import { Student, Prize, LotteryRecord, LotteryResult } from '@/types';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Table } from '@/components/ui/Table';
import { useApp } from '@/store/AppContext';

export const LotteryPage = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [records, setRecords] = useState<LotteryRecord[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [costPoints, setCostPoints] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lotteryResult, setLotteryResult] = useState<LotteryResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const { showNotification } = useApp();

  useEffect(() => {
    fetchStudents();
    fetchPrizes();
    fetchRecords();
  }, []);

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

  const fetchPrizes = async () => {
    try {
      const response = await lotteryService.getPrizes();
      setPrizes(response);
    } catch (error) {
      showNotification('获取奖品列表失败', 'error');
    }
  };

  const fetchRecords = async () => {
    try {
      const response = await lotteryService.getRecords({ page: 1, pageSize: 20 });
      setRecords(response.list);
    } catch (error) {
      showNotification('获取抽奖记录失败', 'error');
    }
  };

  const handleSearch = (keyword: string) => {
    setSearchKeyword(keyword);
    fetchStudents(keyword);
  };

  const handleDraw = async () => {
    if (!selectedStudent) {
      showNotification('请选择学生', 'warning');
      return;
    }
    if (selectedStudent.total_points < costPoints) {
      showNotification('学生积分不足', 'warning');
      return;
    }
    setIsDrawing(true);
    try {
      const result = await lotteryService.draw({
        student_id: selectedStudent.id,
        cost_points: costPoints,
      });
      setLotteryResult(result);
      setShowResultModal(true);
      fetchStudents();
      fetchRecords();
    } catch (error) {
      showNotification(error instanceof Error ? error.message : '抽奖失败', 'error');
    } finally {
      setIsDrawing(false);
    }
  };

  const studentColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '姓名' },
    { key: 'class_name', label: '班级' },
    {
      key: 'total_points',
      label: '积分',
      render: (value) => (
        <span className={`font-bold ${(value as number) >= costPoints ? 'text-primary-600' : 'text-red-600'}`}>
          {value}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '操作',
      render: (_value, row) => (
        <button
          onClick={() => setSelectedStudent(row)}
          disabled={row.total_points < costPoints}
          className={`px-3 py-1 rounded-lg text-sm transition-colors ${
            row.total_points >= costPoints
              ? 'bg-primary-50 text-primary-600 hover:bg-primary-100'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          选择
        </button>
      ),
    },
  ];

  const recordColumns = [
    { key: 'student_name', label: '学生' },
    { key: 'cost_points', label: '消耗积分', render: (value) => <span className="text-red-600">{value}</span> },
    {
      key: 'is_win',
      label: '是否中奖',
      render: (value) => (
        <span className={`font-medium ${(value as boolean) ? 'text-green-600' : 'text-gray-500'}`}>
          {(value as boolean) ? '中奖' : '未中奖'}
        </span>
      ),
    },
    { key: 'prize_name', label: '奖品', render: (value) => value || '-' },
    { key: 'teacher_name', label: '操作教师' },
    { key: 'created_at', label: '时间', render: (value) => new Date(value as string).toLocaleString() },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Ticket className="w-6 h-6 text-primary-600" />
          <h2 className="text-xl font-semibold text-gray-800">抽奖功能</h2>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <h3 className="font-semibold text-gray-800 mb-4">奖品池</h3>
          <div className="grid grid-cols-2 gap-3">
            {prizes.map((prize) => (
              <div key={prize.id} className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-800">{prize.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-sm text-gray-500">概率: {Math.round(prize.probability * 100)}%</span>
                  <span className="text-sm text-gray-500">库存: {prize.stock}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <h3 className="font-semibold text-gray-800 mb-4">抽奖设置</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">抽奖消耗积分</label>
              <input
                type="number"
                value={costPoints}
                onChange={(e) => setCostPoints(parseInt(e.target.value) || 20)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            {selectedStudent && (
              <div className="p-4 bg-primary-50 rounded-lg">
                <p className="text-gray-600">已选择: <span className="font-semibold">{selectedStudent.name}</span> ({selectedStudent.class_name})</p>
                <p className="text-gray-600 mt-1">当前积分: <span className="font-bold text-primary-600">{selectedStudent.total_points}</span></p>
              </div>
            )}

            <Button onClick={handleDraw} loading={isDrawing} className="w-full">
              {isDrawing ? (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" />
                  抽奖中...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  开始抽奖
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-card p-6">
          <h3 className="font-semibold text-gray-800 mb-4">选择学生</h3>
          <Table
            data={students}
            columns={studentColumns}
            searchPlaceholder="搜索学生姓名..."
            onSearch={handleSearch}
          />
        </div>

        <div className="bg-white rounded-xl shadow-card p-6">
          <h3 className="font-semibold text-gray-800 mb-4">抽奖记录</h3>
          <Table
            data={records}
            columns={recordColumns}
          />
        </div>
      </div>

      <Modal isOpen={showResultModal} onClose={() => { setShowResultModal(false); setLotteryResult(null); }} title="抽奖结果">
        {lotteryResult && (
          <div className="text-center py-8">
            {lotteryResult.is_win ? (
              <>
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">恭喜中奖！</h3>
                <p className="text-gray-600 mb-4">获得奖品: <span className="font-semibold">{lotteryResult.prize_name}</span></p>
                <p className="text-gray-500">剩余积分: <span className="font-bold text-primary-600">{lotteryResult.remaining_points}</span></p>
              </>
            ) : (
              <>
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Ticket className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-600 mb-2">很遗憾，未中奖</h3>
                <p className="text-gray-500">剩余积分: <span className="font-bold text-primary-600">{lotteryResult.remaining_points}</span></p>
              </>
            )}
            <Button onClick={() => { setShowResultModal(false); setLotteryResult(null); }} className="mt-6">
              确定
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
