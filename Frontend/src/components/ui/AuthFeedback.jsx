import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

const AuthFeedback = ({ message, type }) => {
  if (!message) return null;
  const isError = type === 'error';
  const Icon = isError ? AlertCircle : CheckCircle;
  const containerClasses = isError
    ? 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800'
    : 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
  return (
    <div className={`flex items-center p-3 mb-4 text-sm rounded-lg border ${containerClasses}`} role="alert">
      <Icon className="w-5 h-5 mr-2 flex-shrink-0" />
      <span className="font-medium">{message}</span>
    </div>
  );
};

export default AuthFeedback;
