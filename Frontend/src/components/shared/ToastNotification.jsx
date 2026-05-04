import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, XCircle, X } from 'lucide-react';

const ToastNotification = ({ message, type = 'info', duration = 5000, onClose }) => {
  useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'error':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      default:
        return 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg ${getBgColor()}`}>
        {getIcon()}
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 max-w-xs">{message}</p>
        <button
          onClick={onClose}
          className="ml-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;