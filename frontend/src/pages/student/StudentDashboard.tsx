import { useState, useEffect } from 'react';
import { Coins, History, ArrowRight } from 'lucide-react';
import { studentService } from '@/services/studentService';
import { Student, PointsRecord } from '@/types';

export const StudentDashboard = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [pointsHistory, setPointsHistory] = useState<PointsRecord[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await studentService.getStudents({ page: 1, pageSize: 20 });
        setStudents(response.list);
      } catch (error) {
        console.error('获取学生列表失败:', error);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      const fetchHistory = async () => {
        try {
          const response = await studentService.getPointsHistory(selectedStudent.id);
          setPointsHistory(response.list);
        } catch (error) {
          console.error('获取积分历史失败:', error);
        }
      };
      fetchHistory();
    }
  }, [selectedStudent]);

  const sortedStudents = [...students].sort((a, b) => b.total_points - a.total_points);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-card p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">积分排行榜</h2>
        <div className="space-y-3">
          {sortedStudents.slice(0, 5).map((student, index) => (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                selectedStudent?.id === student.id
                  ? 'bg-primary-50 border-2 border-primary-500'
                  : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                  index === 0 ? 'bg-yellow-400 text-white' :
                  index === 1 ? 'bg-gray-300 text-white' :
                  index === 2 ? 'bg-orange-400 text-white' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-gray-800">{student.name}</p>
                  <p className="text-sm text-gray-500">{student.class_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-500" />
                <span className="font-bold text-lg text-primary-600">{student.total_points}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedStudent && (
        <div className="bg-white rounded-xl shadow-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">
              {selectedStudent.name} 的积分记录
            </h2>
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-500" />
              <span className="font-bold text-xl text-primary-600">{selectedStudent.total_points}</span>
            </div>
          </div>
          <div className="space-y-3">
            {pointsHistory.length > 0 ? (
              pointsHistory.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-800">{record.reason}</p>
                      <p className="text-sm text-gray-500">{record.created_at}</p>
                    </div>
                  </div>
                  <span className={`font-bold ${record.change_amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {record.change_amount > 0 ? '+' : ''}{record.change_amount}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">暂无积分记录</p>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100">总学生数</p>
              <p className="text-3xl font-bold mt-2">{students.length}</p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-secondary-100">总积分</p>
              <p className="text-3xl font-bold mt-2">
                {students.reduce((sum, s) => sum + s.total_points, 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">全部学生</h2>
        </div>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {students.map((student) => (
            <div
              key={student.id}
              onClick={() => setSelectedStudent(student)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedStudent?.id === student.id
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-100 hover:border-primary-200 hover:bg-gray-50'
              }`}
            >
              <p className="font-medium text-gray-800">{student.name}</p>
              <p className="text-sm text-gray-500">{student.class_name}</p>
              <div className="flex items-center gap-1 mt-2">
                <Coins className="w-4 h-4 text-yellow-500" />
                <span className="font-bold text-primary-600">{student.total_points}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800">商品兑换</h2>
          <button className="flex items-center gap-1 text-primary-600 hover:text-primary-700 font-medium">
            浏览商品 <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <p className="text-gray-500 mt-2">查看可兑换的商品，为学生兑换心仪的奖品</p>
      </div>
    </div>
  );
};
