import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ResetProgressModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

const ResetProgressModal: React.FC<ResetProgressModalProps> = ({
  show,
  onClose,
  onConfirm
}) => {
  if (!show) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 border border-red-500/30 rounded-lg p-5 max-w-md w-full shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="text-red-500 w-6 h-6" />
          <h3 className="text-lg font-semibold text-red-400">Reset Progress?</h3>
        </div>
        
        <div className="mb-6 text-gray-300 space-y-2">
          <p>
            Are you sure you want to reset your progress? This will delete all your saved work in this module.
          </p>
          <p className="text-red-300 text-sm">
            This action cannot be undone.
          </p>
        </div>
        
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-red-600/30 hover:bg-red-600/50 text-red-300 hover:text-red-200 border border-red-500/30 transition-all"
          >
            Reset Progress
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetProgressModal;
