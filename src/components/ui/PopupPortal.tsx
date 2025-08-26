import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PopupPortalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
  preventBodyScroll?: boolean;
  closeOnBackdropClick?: boolean;
}

export const PopupPortal: React.FC<PopupPortalProps> = ({
  isOpen,
  onClose,
  children,
  className = '',
  preventBodyScroll = true,
  closeOnBackdropClick = true,
}) => {
  const [portalElement, setPortalElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create or get the portal container
    let portal = document.getElementById('popup-portal');
    if (!portal) {
      portal = document.createElement('div');
      portal.id = 'popup-portal';
      portal.style.position = 'fixed';
      portal.style.top = '0';
      portal.style.left = '0';
      portal.style.right = '0';
      portal.style.bottom = '0';
      portal.style.pointerEvents = 'none';
      portal.style.zIndex = '9999';
      document.body.appendChild(portal);
    }
    setPortalElement(portal);

    return () => {
      // Don't remove the portal on unmount as other popups might be using it
    };
  }, []);

  useEffect(() => {
    if (!isOpen || !preventBodyScroll) return;

    // Store original body styles
    const originalStyle = window.getComputedStyle(document.body);
    const originalOverflow = document.body.style.overflow;
    const originalPosition = document.body.style.position;
    const originalTop = document.body.style.top;
    const originalWidth = document.body.style.width;

    // Get current scroll position
    const scrollY = window.scrollY;

    // Prevent scrolling
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';

    return () => {
      // Restore original styles
      document.body.style.overflow = originalOverflow;
      document.body.style.position = originalPosition;
      document.body.style.top = originalTop;
      document.body.style.width = originalWidth;

      // Restore scroll position
      window.scrollTo(0, scrollY);
    };
  }, [isOpen, preventBodyScroll]);

  if (!isOpen || !portalElement) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const popupContent = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}
      style={{ pointerEvents: 'all' }}
      onClick={handleBackdropClick}
    >
      {children}
    </div>
  );

  return createPortal(popupContent, portalElement);
};

export default PopupPortal;
