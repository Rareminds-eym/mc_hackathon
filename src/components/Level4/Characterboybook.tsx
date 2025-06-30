import React, { useState, useRef, useCallback, useEffect } from 'react';
import Boybook from './boybook';

const AUTO_ROTATE_DELAY = 10000; // 10 seconds
const AUTO_ROTATE_DURATION = 3000; // ms for 360 rotation (slower)
const SNAP_BACK_DURATION = 800; // ms for snap back

const CharacterRotator = () => {
  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const startXRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastRotationRef = useRef(0);
  const inactivityTimeout = useRef<number | null>(null);
  const animatingRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  const clearInactivityTimeout = () => {
    if (inactivityTimeout.current !== null) {
      window.clearTimeout(inactivityTimeout.current);
      inactivityTimeout.current = null;
    }
  };

  // --- Animation logic ---
  const cancelAnimation = () => {
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    animatingRef.current = false;
  };

  const animateTo = (from: number, to: number, duration: number, onDone?: () => void) => {
    animatingRef.current = true;
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 0.5 - 0.5 * Math.cos(Math.PI * progress); // easeInOut
      setRotationY(from + (to - from) * eased);
      if (progress < 1 && !isDragging) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setRotationY(to);
        animatingRef.current = false;
        if (onDone) onDone();
      }
    };
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const startAutoRotate = useCallback(() => {
    if (isDragging || zoomed) return;
    const start = lastRotationRef.current;
    const end = start + 360;
    animateTo(start, end, AUTO_ROTATE_DURATION, () => {
      if (!isDragging && !zoomed) {
        lastRotationRef.current = end; // Do not use % 360, let it accumulate
        inactivityTimeout.current = window.setTimeout(() => {
          startAutoRotate(); // loop after delay
        }, AUTO_ROTATE_DELAY);
      }
    });
  }, [isDragging, zoomed]);

  const resetInactivityTimeout = useCallback(() => {
    clearInactivityTimeout();
    if (!isDragging && !animatingRef.current && !zoomed) {
      inactivityTimeout.current = window.setTimeout(() => {
        startAutoRotate();
      }, AUTO_ROTATE_DELAY);
    }
  }, [isDragging, startAutoRotate, zoomed]);

  // --- Drag logic ---
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
    clearInactivityTimeout();
    if (animatingRef.current) {
      cancelAnimation();
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    setRotationY(prev => {
      const newRotation = prev + deltaX * 0.5;
      lastRotationRef.current = newRotation % 360;
      return newRotation % 360;
    });
    startXRef.current = e.clientX;
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    resetInactivityTimeout();
  }, [resetInactivityTimeout]);

  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    clearInactivityTimeout();
    if (animatingRef.current) {
      cancelAnimation();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - startXRef.current;
    setRotationY(prev => {
      const newRotation = prev + deltaX * 0.5;
      lastRotationRef.current = newRotation % 360;
      return newRotation % 360;
    });
    startXRef.current = e.touches[0].clientX;
  };

  const handleDoubleClick = () => {
    setZoomed(true);
  };

  const handleZoomEnd = () => {
    setZoomed(false);
  };

  // --- Effect: mouse events ---
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // --- Effect: inactivity timer ---
  useEffect(() => {
    resetInactivityTimeout();
    return clearInactivityTimeout;
  }, [isDragging, resetInactivityTimeout]);

  // --- Effect: cleanup on unmount ---
  useEffect(() => {
    return () => {
      clearInactivityTimeout();
      cancelAnimation();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-[50%] h-[40%] ${isDragging ? 'cursor-grabbing' : 'cursor-grab'} \
                 rounded-2xl flex items-center justify-center overflow-hidden`}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onDoubleClick={handleDoubleClick}
      onMouseUp={handleZoomEnd}
      onTouchEnd={handleZoomEnd}
      style={{ perspective: '1000px' }}
    >
      <div
        className="w-[60%] h-[60%] flex items-center justify-center transition-transform duration-700 ease-in-out"
        style={{
          transform: `rotateY(${rotationY}deg) scale(${zoomed ? 1.7 : 1})`,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Replace SVG with Boy character */}
        <Boybook width="100%" height="100%" style={{ maxWidth: '100%', maxHeight: '100%' }} />
      </div>
    </div>
  );
};

export default CharacterRotator;
