import { useApp } from '@/store/AppContext';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
};

const colorMap = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconColorMap = {
  success: 'text-green-500',
  error: 'text-red-500',
  warning: 'text-yellow-500',
  info: 'text-blue-500',
};

export const Notification = () => {
  const { notification, showNotification } = useApp();

  if (!notification) return null;

  const Icon = iconMap[notification.type];

  const handleClose = () => {
    showNotification('', 'info');
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-fade-in">
      <div
        className={`max-w-sm w-full p-4 border rounded-lg shadow-lg ${colorMap[notification.type]} flex items-center gap-3`}
      >
        <Icon className={`w-5 h-5 ${iconColorMap[notification.type]} flex-shrink-0`} />
        <span className="flex-1 text-sm font-medium">{notification.message}</span>
        <button
          onClick={handleClose}
          className="p-1 hover:bg-black/5 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
