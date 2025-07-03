import React, { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { GMP_MODULES } from '../data/gmpModules';
import type { Level } from '../types';

function LevelList() {
  const navigate = useNavigate();
  const { moduleId } = useParams<{ moduleId: string }>();

  // Get the current module data
  const currentModule = GMP_MODULES.find(module => module.id === parseInt(moduleId || '1'));
  const levels = currentModule?.levels || [];

  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [currentTranslateX, setCurrentTranslateX] = useState(0);
  const [baseTranslateX, setBaseTranslateX] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const [lastMoveX, setLastMoveX] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();
  const touchStartTimeRef = useRef<number>(0);
  const velocityHistoryRef = useRef<Array<{velocity: number, time: number}>>([]);

  // Responsive card dimensions - updated for new design
  const getCardDimensions = () => {
    const isLandscape = window.innerHeight < window.innerWidth && window.innerWidth < 1024;
    const isMobile = window.innerWidth < 768;

    if (isLandscape && isMobile) {
      return { width: 160, gap: 12 }; // Mobile landscape - much smaller cards
    } else if (isMobile) {
      return { width: 280, gap: 20 }; // Mobile portrait
    }
    return { width: 350, gap: 28 }; // Desktop - wider cards for new design
  };

  const { width: cardWidth, gap: cardGap } = getCardDimensions();
  const totalWidth = cardWidth + cardGap;

  // Helper function to get level styling based on difficulty - updated to match new design
  const getLevelStyling = (level: Level, index: number) => {
    const styles = [
      { 
        bg: "bg-pink-500", 
        color: "text-white", 
        levelColor: "bg-green-500",
        number: "1",
        label: "Recall",
        difficulty: "Beginner",
        minutes: "15 min",
        name: "Introduction to GMP"
      },
      { 
        bg: "bg-amber-500", 
        color: "text-white", 
        levelColor: "bg-amber-500",
        number: "2", 
        label: "Classify",
        difficulty: "Intermediate",
        minutes: "20 min",
        name: "Regulatory Bodies"
      },
      { 
        bg: "bg-emerald-500", 
        color: "text-white", 
        levelColor: "bg-red-500",
        number: "3",
        label: "Apply",
        difficulty: "Advanced",
        minutes: "25 min",
        name: "GMP Guidelines"
      },
      { 
        bg: "bg-violet-500", 
        color: "text-white", 
        levelColor: "bg-violet-500",
        number: "4",
        label: "Analyze",
        difficulty: "Expert",
        minutes: "30 min",
        name: "GMP Analysis"
      }
    ];
    return styles[index % styles.length];
  };

  // Handle card click to navigate to specific level
  const handleCardClick = (level: Level) => {
    navigate(`/modules/${moduleId}/levels/${level.id}`);
  };

  // Handle back button click
  const handleBackClick = () => {
    navigate('/modules');
  };

  const getPositionX = (event: TouchEvent | MouseEvent): number => {
    return 'touches' in event ? event.touches[0].clientX : event.clientX;
  };

  const updateTransform = (translateX: number) => {
    if (containerRef.current) {
      containerRef.current.style.transform = `translateX(${translateX}px)`;
    }
    if (progressRef.current) {
      progressRef.current.style.transform = `translateX(${translateX}px)`;
    }
  };

  const applyBoundaries = (translateX: number) => {
    const maxTranslate = 100;
    const minTranslate = -(levels.length * totalWidth) - 100;
    return Math.max(minTranslate, Math.min(maxTranslate, translateX));
  };

  const calculateAverageVelocity = () => {
    const history = velocityHistoryRef.current;
    if (history.length === 0) return 0;
    
    // Use recent velocity samples for more accurate momentum
    const recentHistory = history.slice(-5);
    const totalVelocity = recentHistory.reduce((sum, item) => sum + item.velocity, 0);
    return totalVelocity / recentHistory.length;
  };

  const startMomentumAnimation = (initialVelocity: number) => {
    // Use average velocity for smoother momentum
    const avgVelocity = calculateAverageVelocity();
    let currentVelocity = Math.abs(avgVelocity) > Math.abs(initialVelocity) ? avgVelocity : initialVelocity;
    
    // Minimum velocity threshold for momentum
    if (Math.abs(currentVelocity) < 0.5) return;

    const animate = () => {
      // Enhanced friction curve for more natural feel
      const friction = 0.92;
      currentVelocity *= friction;
      
      const newTranslateX = applyBoundaries(currentTranslateX + currentVelocity);
      
      setCurrentTranslateX(newTranslateX);
      setBaseTranslateX(newTranslateX);
      updateTransform(newTranslateX);

      // Continue animation if velocity is significant
      if (Math.abs(currentVelocity) > 0.1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsScrolling(false);
      }
    };

    setIsScrolling(true);
    animationRef.current = requestAnimationFrame(animate);
  };

  const handleDragStart = (event: React.TouchEvent | React.MouseEvent) => {
    // Cancel any ongoing momentum animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    setIsDragging(true);
    setIsScrolling(false);
    const clientX = getPositionX(event.nativeEvent);
    const currentTime = Date.now();
    
    setStartX(clientX);
    setLastMoveX(clientX);
    setLastMoveTime(currentTime);
    setVelocity(0);
    touchStartTimeRef.current = currentTime;
    velocityHistoryRef.current = [];
    
    // Remove transitions for immediate response
    if (containerRef.current) {
      containerRef.current.style.transition = 'none';
    }
    if (progressRef.current) {
      progressRef.current.style.transition = 'none';
    }

    // Prevent default touch behaviors
    if ('touches' in event.nativeEvent) {
      event.preventDefault();
    }
  };

  const handleDragMove = (event: TouchEvent | MouseEvent) => {
    if (!isDragging) return;

    event.preventDefault();

    const clientX = getPositionX(event);
    const currentTime = Date.now();
    const deltaX = clientX - startX;
    const newTranslateX = baseTranslateX + deltaX;

    // Calculate velocity
    const timeDelta = currentTime - lastMoveTime;
    if (timeDelta > 0) {
      const moveDelta = clientX - lastMoveX;
      const instantVelocity = moveDelta / timeDelta * 16;

      velocityHistoryRef.current.push({
        velocity: instantVelocity,
        time: currentTime
      });

      velocityHistoryRef.current = velocityHistoryRef.current.filter(
        item => currentTime - item.time < 100
      );

      setVelocity(instantVelocity);
    }

    setLastMoveX(clientX);
    setLastMoveTime(currentTime);

    // Apply boundaries
    let boundedTranslate = newTranslateX;
    const maxTranslate = 100;
    const minTranslate = -(levels.length * totalWidth) - 100;

    if (newTranslateX > maxTranslate) {
      const overscroll = newTranslateX - maxTranslate;
      boundedTranslate = maxTranslate + overscroll * 0.25;
    } else if (newTranslateX < minTranslate) {
      const overscroll = newTranslateX - minTranslate;
      boundedTranslate = minTranslate + overscroll * 0.25;
    }

    setCurrentTranslateX(boundedTranslate);
    updateTransform(boundedTranslate);
  };



  const navigateLeft = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const newTranslateX = Math.min(baseTranslateX + totalWidth, 0);
    setBaseTranslateX(newTranslateX);
    setCurrentTranslateX(newTranslateX);
    
    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }
    if (progressRef.current) {
      progressRef.current.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }
    updateTransform(newTranslateX);
    
    // Clear transition after animation
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.transition = 'none';
      }
      if (progressRef.current) {
        progressRef.current.style.transition = 'none';
      }
    }, 400);
  };

  const navigateRight = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const maxTranslate = -(levels.length - 1) * totalWidth;
    const newTranslateX = Math.max(baseTranslateX - totalWidth, maxTranslate);
    setBaseTranslateX(newTranslateX);
    setCurrentTranslateX(newTranslateX);
    
    if (containerRef.current) {
      containerRef.current.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }
    if (progressRef.current) {
      progressRef.current.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    }
    updateTransform(newTranslateX);
    
    // Clear transition after animation
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.style.transition = 'none';
      }
      if (progressRef.current) {
        progressRef.current.style.transition = 'none';
      }
    }, 400);
  };

  useEffect(() => {
    
    const handleDragEnd = () => {
      if (!isDragging) return;
      
      setIsDragging(false);
      
      // Calculate final velocity from recent movement
      const history = velocityHistoryRef.current;
      let finalVelocity = 0;
      
      if (history.length > 0) {
        const recentHistory = history.slice(-5);
        const totalVelocity = recentHistory.reduce((sum, item) => sum + item.velocity, 0);
        finalVelocity = totalVelocity / recentHistory.length;
      }
      
      // Apply boundaries
      const maxTranslate = 100;
      const minTranslate = -(levels.length * totalWidth) - 100;
      const boundedTranslateX = Math.max(minTranslate, Math.min(maxTranslate, currentTranslateX));
      
      if (boundedTranslateX !== currentTranslateX) {
        // Smooth spring-back animation to boundaries
        setCurrentTranslateX(boundedTranslateX);
        setBaseTranslateX(boundedTranslateX);
        
        if (containerRef.current) {
          containerRef.current.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }
        if (progressRef.current) {
          progressRef.current.style.transition = 'transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        }
        
        if (containerRef.current) {
          containerRef.current.style.transform = `translateX(${boundedTranslateX}px)`;
        }
        if (progressRef.current) {
          progressRef.current.style.transform = `translateX(${boundedTranslateX}px)`;
        }
        
        // Clear transition after animation
        setTimeout(() => {
          if (containerRef.current) {
            containerRef.current.style.transition = 'none';
          }
          if (progressRef.current) {
            progressRef.current.style.transition = 'none';
          }
        }, 500);
      } else {
        // Start momentum animation
        setBaseTranslateX(currentTranslateX);
        
        // Use average velocity for smoother momentum
        let currentVelocity = finalVelocity;
        
        // Minimum velocity threshold for momentum
        if (Math.abs(currentVelocity) < 0.5) return;
    
        const animate = () => {
          // Enhanced friction curve for more natural feel
          const friction = 0.92;
          currentVelocity *= friction;
          
          const newTranslateX = Math.max(minTranslate, Math.min(maxTranslate, currentTranslateX + currentVelocity));
          
          setCurrentTranslateX(newTranslateX);
          setBaseTranslateX(newTranslateX);
          
          if (containerRef.current) {
            containerRef.current.style.transform = `translateX(${newTranslateX}px)`;
          }
          if (progressRef.current) {
            progressRef.current.style.transform = `translateX(${newTranslateX}px)`;
          }
    
          // Continue animation if velocity is significant
          if (Math.abs(currentVelocity) > 0.1) {
            animationRef.current = requestAnimationFrame(animate);
          } else {
            setIsScrolling(false);
          }
        };
    
        setIsScrolling(true);
        animationRef.current = requestAnimationFrame(animate);
      }
      
      // Clear velocity history
      velocityHistoryRef.current = [];
    };

    if (isDragging) {
      // Use passive: false to allow preventDefault
      document.addEventListener('mousemove', handleDragMove, { passive: false });
      document.addEventListener('mouseup', handleDragEnd, { passive: false });
      document.addEventListener('touchmove', handleDragMove, { passive: false });
      document.addEventListener('touchend', handleDragEnd, { passive: false });

      // Prevent context menu on long press
      document.addEventListener('contextmenu', (e) => e.preventDefault(), { passive: false });
    }

    return () => {
      document.removeEventListener('mousemove', handleDragMove);
      document.removeEventListener('mouseup', handleDragEnd);
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
      document.removeEventListener('contextmenu', (e) => e.preventDefault());
    };
  }, [isDragging, startX, baseTranslateX, lastMoveTime, lastMoveX, currentTranslateX, levels.length, totalWidth, handleDragMove]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      updateTransform(currentTranslateX);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentTranslateX]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const isLandscape = window.innerHeight < window.innerWidth && window.innerWidth < 1024;
  const isMobile = window.innerWidth < 768;
  const isMobileLandscape = isLandscape && isMobile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Fixed Header */}
      <div className={`fixed top-0 left-0 right-0 z-30 px-4 ${isMobileLandscape ? 'py-2' : 'py-6'} sm:px-6 lg:px-8 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900`}>
        <div className="flex items-center max-w-7xl mx-auto">
          <button
            onClick={handleBackClick}
            className={`flex items-center gap-2 px-2 ${isMobileLandscape ? 'py-1' : 'py-2'} bg-slate-700/50 hover:bg-slate-700/70 rounded-xl backdrop-blur-sm transition-all duration-200 hover:scale-105`}
          >
            <ChevronLeft className={`${isMobileLandscape ? 'w-3 h-3' : 'w-5 h-5'}`} />
            <span className={`${isMobileLandscape ? 'text-xs' : 'text-sm'} font-medium`}>Back</span>
          </button>

          <h1 className={`${isMobileLandscape ? 'text-base' : 'text-xl sm:text-2xl lg:text-3xl'} font-bold text-center flex-1`}>
            GMP & Regulations
          </h1>
        </div>
      </div>

      {/* Progress Indicators that Move with Cards */}
      <div className={`fixed ${isMobileLandscape ? 'top-12' : 'top-20 sm:top-24 lg:top-28'} left-0 right-0 z-20 px-4 sm:px-6 lg:px-8 pointer-events-none overflow-hidden`}>
        <div className="max-w-7xl mx-auto">
          
        </div>
      </div>

      {/* Cards Container with Navigation */}
      <div className={`relative ${isMobileLandscape ? 'pt-20 pb-2' : 'pt-36 sm:pt-40 lg:pt-44 pb-8'} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-7xl mx-auto">
          {/* Navigation Buttons */}
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none z-20">
            <button
              onClick={navigateLeft}
              className={`${isMobileLandscape ? 'w-6 h-6 ml-1' : 'w-12 h-12 ml-4'} bg-slate-800/80 hover:bg-slate-700/90 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 hover:scale-110 pointer-events-auto shadow-lg border border-slate-600/50`}
            >
              <ChevronLeft className={`${isMobileLandscape ? 'w-3 h-3' : 'w-6 h-6'} text-white`} />
            </button>
            
            <button
              onClick={navigateRight}
              className={`${isMobileLandscape ? 'w-6 h-6 mr-1' : 'w-12 h-12 mr-4'} bg-slate-800/80 hover:bg-slate-700/90 rounded-full flex items-center justify-center backdrop-blur-sm transition-all duration-200 hover:scale-110 pointer-events-auto shadow-lg border border-slate-600/50`}
            >
              <ChevronRight className={`${isMobileLandscape ? 'w-3 h-3' : 'w-6 h-6'} text-white`} />
            </button>
          </div>

          <div className="overflow-hidden">
          <div
            ref={progressRef}
            className="relative flex items-center will-change-transform"
            style={{
              transform: `translateX(${currentTranslateX}px)`,
              width: `${levels.length * totalWidth}px`,
              gap: `${cardGap}px`
            }}
          >
            {/* Progress Line that spans across all cards */}
            <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-800/50 rounded-full transform -translate-y-1/2">
              <div className="h-full bg-gradient-to-r from-pink-500 via-amber-500 via-emerald-500 to-purple-500 rounded-full" />
            </div>

            {/* Step Indicators that move with cards */}
            {levels.map((level, index) => {
              const styling = getLevelStyling(level, index);
              return (
                <div
                  key={level.id}
                  className="flex-none relative z-10"
                  style={{
                    width: `${cardWidth}px`,
                    marginRight: index < levels.length - 1 ? `${cardGap}px` : '0',
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  {/* Add horizontal connecting lines using SVG with gradients */}
                  {index < levels.length - 1 && (
                    <div className="absolute top-1/2 transform -translate-y-1/2 left-1/2 z-0">
                      <svg 
                        width={cardGap} 
                        height="4" 
                        style={{
                          overflow: 'visible',
                        }}
                      >
                        <defs>
                          <linearGradient id={`gradient-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={index === 0 ? '#ec4899' : index === 1 ? '#f59e0b' : index === 2 ? '#10b981' : '#8b5cf6'} />
                            <stop offset="100%" stopColor={index === 0 ? '#f59e0b' : index === 1 ? '#10b981' : index === 2 ? '#8b5cf6' : '#8b5cf6'} />
                          </linearGradient>
                        </defs>
                        <line 
                          x1="0" 
                          y1="0" 
                          x2={cardGap} 
                          y2="0" 
                          stroke={`url(#gradient-${index})`}
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  )}
                  <div 
                    className={`${isMobileLandscape ? 'w-6 h-6 text-xs' : 'w-8 h-8 sm:w-10 sm:h-10 text-sm'} 
                    rounded-sm flex items-center justify-center font-bold ${styling.bg} text-white shadow-lg`}
                    style={{
                      boxShadow: `0 0 8px 0 ${index === 0 ? 'rgba(236, 72, 153, 0.7)' : 
                                              index === 1 ? 'rgba(245, 158, 11, 0.7)' : 
                                              index === 2 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(139, 92, 246, 0.7)'}`,
                    }}
                  >
                    {styling.number}
                  </div>
                  
                  {/* Add vertical dotted line using SVG */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 z-0">
                    <svg 
                      width="4" 
                      height="30" 
                      style={{
                        overflow: 'visible'
                      }}
                    >
                      <line 
                        x1="1" 
                        y1="0" 
                        x2="1" 
                        y2="30" 
                        stroke={index === 0 ? '#ec4899' : index === 1 ? '#f59e0b' : index === 2 ? '#10b981' : '#8b5cf6'} 
                        strokeWidth="2" 
                        strokeDasharray="1 3"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>
                  
                  <div className={`absolute -bottom-8 text-xs font-medium text-white/80`}>
                    {styling.number} {styling.label}
                  </div>
                </div>
              );
            })}
          </div>
            <div
              ref={containerRef}
              className={`flex will-change-transform touch-pan-x select-none ${
                isDragging ? 'cursor-grabbing' : 'cursor-grab'
              } ${isScrolling ? 'pointer-events-none' : ''}`}
              style={{
                gap: `${cardGap}px`,
                width: `${levels.length * totalWidth}px`,
                transform: `translateX(${currentTranslateX}px)`,
                touchAction: 'pan-x',
                WebkitUserSelect: 'none',
                userSelect: 'none'
              }}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              {levels.map((level, index) => {
                const styling = getLevelStyling(level, index);
                return (
                  <div
                    key={level.id}
                    onClick={() => handleCardClick(level)}
                    className={`flex-none rounded-2xl ${styling.bg} shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 select-none cursor-pointer overflow-hidden`}
                    style={{
                      width: `${cardWidth}px`,
                      height: isMobileLandscape ? '180px' : isMobile ? '300px' : '350px',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      WebkitTouchCallout: 'none'
                    }}
                  >
                    {/* Label at top */}
                    <div className={`bg-white/10 ${isMobileLandscape ? 'py-1 px-1.5' : 'py-1.5 px-3'} flex justify-between items-center`}>
                      <div className="flex items-center gap-1.5">
                        <div className={`${isMobileLandscape ? 'w-4 h-4 text-xs' : 'w-6 h-6 text-sm'} rounded-sm flex items-center justify-center text-white font-bold ${styling.bg}`}>
                          {styling.number}
                        </div>
                        <span className={`text-white font-medium ${isMobileLandscape ? 'text-xs' : ''}`}>{styling.label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className={`${isMobileLandscape ? 'w-2 h-2' : 'w-3 h-3'} bg-yellow-400 rounded-full`} />
                        ))}
                      </div>
                    </div>
                    
                    {/* Main content */}
                    <div className={`${isMobileLandscape ? 'p-2' : 'p-5'} flex flex-col h-[calc(100%-4rem)]`}>
                      {/* Title */}
                      <h2 className={`${isMobileLandscape ? 'text-base' : 'text-2xl'} font-bold text-white leading-tight ${isMobileLandscape ? 'mb-1' : 'mb-4'}`}>
                        {styling.name}
                      </h2>

                      {/* Level Badge */}
                      <div className={`${isMobileLandscape ? 'mb-1' : 'mb-4'}`}>
                        <span className={`${isMobileLandscape ? 'px-1.5 py-0.5 text-xs' : 'px-3 py-1 text-sm'} ${styling.levelColor} rounded-md text-white font-medium`}>
                          {styling.difficulty}
                        </span>
                      </div>

                      {/* Spacer */}
                      <div className="flex-1"></div>

                      {/* Bottom Info */}
                      <div className={`bg-black/20 backdrop-blur-sm rounded-lg ${isMobileLandscape ? 'p-1' : 'p-3'} mt-auto`}>
                        <div className="flex items-center justify-between">
                          <span className={`text-white/90 ${isMobileLandscape ? 'text-2xs' : 'text-sm'}`}>
                            Bloom's: {styling.label}
                          </span>
                          <span className={`text-white font-semibold ${isMobileLandscape ? 'text-2xs' : 'text-sm'}`}>
                            {styling.minutes}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export {LevelList};
