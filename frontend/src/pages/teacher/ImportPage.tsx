import { useState } from 'react';
import { Upload, FileText, Check, X, AlertCircle } from 'lucide-react';
import { pointsService } from '@/services/pointsService';
import { ImportPreview } from '@/types';
import { Button } from '@/components/ui/Button';
import { useApp } from '@/store/AppContext';

export const ImportPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<ImportPreview | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { showNotification } = useApp();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (extension !== 'xlsx' && extension !== 'xls') {
        showNotification('请上传Excel文件（.xlsx或.xls格式）', 'error');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      showNotification('请先选择文件', 'warning');
      return;
    }
    setIsUploading(true);
    try {
      const result = await pointsService.importExcel(file);
      setPreviewData(result);
      showNotification('文件解析成功', 'success');
    } catch (error) {
      showNotification(error instanceof Error ? error.message : '文件解析失败', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData) return;
    const validRecords = previewData.preview.filter((item) => item.valid && item.student_id);
    if (validRecords.length === 0) {
      showNotification('没有可导入的有效记录', 'warning');
      return;
    }
    setIsImporting(true);
    try {
      const records = validRecords.map((item) => ({
        student_id: item.student_id!,
        change_amount: item.change_amount,
        reason: item.reason,
      }));
      const result = await pointsService.confirmImport({ records });
      showNotification(`导入成功！成功: ${result.success_count} 条，失败: ${result.fail_count} 条`, 'success');
      setPreviewData(null);
      setFile(null);
    } catch (error) {
      showNotification(error instanceof Error ? error.message : '导入失败', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Upload className="w-6 h-6 text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-800">积分导入</h2>
      </div>

      <div className="bg-white rounded-xl shadow-card p-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-10 h-10 text-primary-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">上传Excel文件</h3>
          <p className="text-gray-500">支持 .xlsx 和 .xls 格式</p>
        </div>

        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-primary-400 transition-colors">
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer block"
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">点击或拖拽文件到此处</p>
            <p className="text-sm text-gray-400">支持 .xlsx, .xls 格式</p>
          </label>
          {file && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg inline-block">
              <span className="text-gray-600">{file.name}</span>
              <button
                onClick={() => setFile(null)}
                className="ml-3 text-red-500 hover:text-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Button onClick={handleUpload} loading={isUploading} disabled={!file}>
            <Upload className="w-4 h-4" />
            上传并解析
          </Button>
        </div>

        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">Excel文件格式要求：</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 列顺序：学号、姓名、班级、积分变动、原因</li>
            <li>• 积分变动列使用正数表示增加，负数表示扣除（如：+100 或 -50）</li>
            <li>• 学号列用于匹配已存在的学生</li>
          </ul>
        </div>
      </div>

      {previewData && (
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">导入预览</h3>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-green-600">
                <Check className="w-4 h-4 inline mr-1" />
                有效: {previewData.valid_count} 条
              </span>
              <span className="text-red-600">
                <X className="w-4 h-4 inline mr-1" />
                无效: {previewData.invalid_count} 条
              </span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">行号</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">学号</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">姓名</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">班级</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">积分变动</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">原因</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">状态</th>
                </tr>
              </thead>
              <tbody>
                {previewData.preview.map((item) => (
                  <tr
                    key={item.row}
                    className={`border-b ${item.valid ? 'bg-green-50/50' : 'bg-red-50/50'}`}
                  >
                    <td className="px-4 py-3 text-sm">{item.row}</td>
                    <td className="px-4 py-3 text-sm">{item.student_id || '-'}</td>
                    <td className="px-4 py-3 text-sm">{item.name}</td>
                    <td className="px-4 py-3 text-sm">{item.class}</td>
                    <td className={`px-4 py-3 text-sm font-bold ${item.change_amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {item.change_amount > 0 ? '+' : ''}{item.change_amount}
                    </td>
                    <td className="px-4 py-3 text-sm">{item.reason}</td>
                    <td className="px-4 py-3">
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
          <div className="p-4 border-t flex justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setPreviewData(null);
                setFile(null);
              }}
            >
              取消
            </Button>
            <Button onClick={handleConfirmImport} loading={isImporting}>
              <Check className="w-4 h-4" />
              确认导入
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
