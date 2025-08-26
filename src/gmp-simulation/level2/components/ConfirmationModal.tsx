import { AlertTriangle } from 'lucide-react';
import React, { useEffect } from 'react';
import { useDeviceLayout } from '../../../hooks/useOrientation';
import { ConfirmationModalProps } from '../types';
import PopupPortal from '../../../components/ui/PopupPortal';

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ show, onClose, onConfirm, isLoading = false }) => {
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;
  
  if (!show) return null;

  return (
    <PopupPortal
      isOpen={show}
      onClose={onClose}
      className="bg-black bg-opacity-60 p-2 sm:p-4"
      closeOnBackdropClick={!isLoading}
    >
      <div 
        className={`pixel-border-thick bg-yellow-100 w-full text-center relative overflow-hidden animate-slideIn ${
          isMobileHorizontal 
            ? 'max-w-lg p-3 max-h-[80vh]' 
            : isMobile 
            ? 'max-w-sm p-4 max-h-[85vh]' 
            : 'max-w-md p-6'
        }`}
        style={{ 
          fontFamily: 'Verdana, Geneva, Tahoma, sans-serif',
          ...(isMobileHorizontal ? { maxWidth: '90vw' } : {})
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-scan-lines opacity-20"></div>
        
        {/* Close Button */}
        {!isLoading && (
          <button
            onClick={onClose}
            className={`absolute top-2 right-2 z-20 bg-yellow-200 hover:bg-yellow-300 text-yellow-900 rounded-full shadow pixel-border ${isMobile ? 'p-0.5' : 'p-1'}`}
            aria-label="Close warning modal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={isMobile ? "h-4 w-4" : "h-5 w-5"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        
        {/* Content */}
        <div className="relative z-10">
          <div className={`flex items-center justify-center space-x-2 ${isMobile ? 'mb-2' : 'mb-4'}`}>
            <div className={`bg-yellow-400 pixel-border flex items-center justify-center animate-bounce relative ${
              isMobileHorizontal ? 'w-6 h-6' : isMobile ? 'w-7 h-7' : 'w-8 h-8'
            }`}>
              <span className="absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-60 animate-ping"></span>
              <AlertTriangle className={`text-yellow-900 relative z-10 ${
                isMobileHorizontal ? 'w-4 h-4' : isMobile ? 'w-4 h-4' : 'w-5 h-5'
              }`} />
            </div>
            <h2 className={`font-black text-yellow-900 pixel-text ${
              isMobileHorizontal ? 'text-sm' : isMobile ? 'text-base' : 'text-lg'
            }`}>CAUTION</h2>
          </div>
          
          <div className={`${isMobile ? 'mb-4' : 'mb-6'}`}>
            <span className={`font-bold text-yellow-900 pixel-text ${
              isMobileHorizontal ? 'text-xs' : isMobile ? 'text-sm' : 'text-base'
            }`}>
              {isLoading ? 'Saving your progress...' : 'Action cannot be undone. Are you sure you want to proceed?'}
            </span>
          </div>
          
          <div className="flex justify-center">
            <button
              className={`pixel-border ${isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 transform hover:scale-105'
              } text-yellow-900 font-black pixel-text transition-all duration-200 shadow-lg flex items-center gap-2 ${
                isMobileHorizontal ? 'py-2 px-4' : isMobile ? 'py-2 px-5' : 'py-3 px-6'
              }`}
              onClick={onConfirm}
              disabled={isLoading}
            >
              {isLoading && (
                <div className={`animate-spin rounded-full border-2 border-yellow-900 border-t-transparent ${
                  isMobile ? 'h-3 w-3' : 'h-4 w-4'
                }`} />
              )}
              <span className={isMobileHorizontal ? "text-xs" : isMobile ? "text-xs" : "text-sm"}>
                {isLoading ? 'Saving...' : 'Yes, Proceed'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </PopupPortal>
  );
};

export default ConfirmationModal;
