import React, { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ'
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg
        ${type === 'success' ? 'bg-green-500' :
          type === 'error' ? 'bg-red-500' : 'bg-blue-500'}
        text-white`}
    >
      <div className="flex items-center space-x-2">
        <span className="text-xl">{icons[type]}</span>
        <span>{message}</span>
      </div>
    </div>
  );
};

export default Toast;