import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  show: boolean;
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
  autoClose?: boolean;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({
  show,
  type,
  message,
  onClose,
  autoClose = true,
  duration = 5000
}) => {
  useEffect(() => {
    if (show && autoClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [show, autoClose, duration, onClose]);

  if (!show) return null;

  const isSuccess = type === 'success';
  const bgColor = isSuccess 
    ? 'bg-green-900/90 border-green-500/50' 
    : 'bg-red-900/90 border-red-500/50';
  const textColor = isSuccess ? 'text-green-300' : 'text-red-300';
  const iconColor = isSuccess ? 'text-green-400' : 'text-red-400';

  return (
    <div 
      className={`fixed top-4 right-4 z-[9999] ${bgColor} border rounded-lg p-4 min-w-80 max-w-md shadow-xl backdrop-blur-sm animate-slideIn`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          {isSuccess ? (
            <CheckCircle className={`w-5 h-5 ${iconColor}`} />
          ) : (
            <AlertCircle className={`w-5 h-5 ${iconColor}`} />
          )}
        </div>
        
        <div className="flex-1">
          <p className={`${textColor} text-sm font-medium leading-5`}>
            {message}
          </p>
        </div>
        
        <button
          onClick={onClose}
          className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-300 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Progress bar for auto-close */}
      {autoClose && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700 rounded-b-lg overflow-hidden">
          <div 
            className={`h-full ${isSuccess ? 'bg-green-500' : 'bg-red-500'} origin-left`}
            style={{
              animation: `toast-progress ${duration}ms linear forwards`
            }}
          />
        </div>
      )}
      
      {/* Inline styles for animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes toast-progress {
            from { transform: scaleX(1); }
            to { transform: scaleX(0); }
          }
        `
      }} />
    </div>
  );
};

export default Toast;
