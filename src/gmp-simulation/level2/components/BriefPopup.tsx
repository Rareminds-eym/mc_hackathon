import React from 'react';
import PopupPortal from '../../../components/ui/PopupPortal';

interface BriefPopupProps {
  show: boolean;
  description?: string;
  isMobileHorizontal: boolean;
  onClose: () => void;
}

const BriefPopup: React.FC<BriefPopupProps> = ({ show, description, isMobileHorizontal, onClose }) => {
  if (!show) return null;
  return (
    <PopupPortal
      isOpen={show}
      onClose={onClose}
      className="bg-black bg-opacity-60 p-2 sm:p-4 font-[Verdana,Arial,sans-serif]"
      closeOnBackdropClick={true}
    >
      <div
        className={
          `pixel-border-thick bg-blue-100 w-full ` +
          `max-w-2xl text-center relative overflow-hidden animate-slideIn flex flex-col ` +
          (isMobileHorizontal ? 'p-4 max-w-lg text-base' : 'p-10')
        }
        style={{
          fontSize: isMobileHorizontal ? '15px' : undefined,
          borderRadius: isMobileHorizontal ? 12 : undefined,
          height: 'fit-content',
          maxHeight: isMobileHorizontal ? '70vh' : '60vh',
          minHeight: isMobileHorizontal ? 0 : 0,
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
        <div className="absolute inset-0 bg-scan-lines opacity-20"></div>
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 z-20 bg-blue-200 hover:bg-blue-300 text-blue-900 rounded-full p-1 shadow pixel-border"
          aria-label="Close case brief"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        {/* Brief Content */}
  <div className="relative z-10 flex flex-col items-center justify-center w-full">
          <h2 className="pixel-text text-lg font-black text-blue-900 mb-2">Case Brief</h2>
          <div
            className="text-blue-900 text-base whitespace-pre-line break-words px-2 w-full"
            style={{
              maxWidth: isMobileHorizontal ? '96vw' : '52rem',
              maxHeight: isMobileHorizontal ? '50vh' : '40vh',
              overflowY: 'auto',
              wordBreak: 'break-word',
              whiteSpace: 'pre-line',
              background: 'inherit',
              borderRadius: 8,
            }}
          >
            <span style={{display: 'block', width: '100%'}}>{description || 'No brief available.'}</span>
          </div>
        </div>
      </div>
    </PopupPortal>
  );
};

export default BriefPopup;
