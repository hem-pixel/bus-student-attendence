import React from 'react';

export const ErrorAlert = ({ message, onClose, type = 'error' }) => {
  if (!message) return null;

  const typeClasses = {
    error: 'bg-red-50 border-red-500 text-red-700',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-700',
    success: 'bg-green-50 border-green-500 text-green-700',
    info: 'bg-blue-50 border-blue-500 text-blue-700'
  };

  return (
    <div className={`border-l-4 p-4 mb-4 rounded-r-lg shadow-sm ${typeClasses[type]}`} role="alert">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{message}</span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-lg font-bold ml-4 cursor-pointer hover:opacity-75 transition-opacity"
            aria-label="Close alert"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};
export default ErrorAlert;
