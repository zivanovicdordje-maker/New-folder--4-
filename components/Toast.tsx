
import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bg = type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600';

  return (
    <div className={`${bg} text-white px-6 py-3 rounded-full shadow-2xl pointer-events-auto animate-fade-up`}>
      <span className="text-[10px] font-black uppercase tracking-widest">{message}</span>
    </div>
  );
};

export default Toast;
