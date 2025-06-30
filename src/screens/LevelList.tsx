import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { GMP_MODULES } from '../data/gmpModules';
import { useGameRedux } from '../store/useGameRedux';
import { Button, DifficultyBadge, StarRating } from '../components/ui';
import { useDeviceLayout } from '../hooks/useOrientation';
import type { Level, Module } from '../types';

const LevelList: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isLevelCompleted, getLevelScore } = useGameRedux();
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileLandscape = isMobile && isHorizontal;

  // Get module from location state or find by ID
  const module: Module = location.state?.module ||
    GMP_MODULES.find(m => m.id === parseInt(moduleId || '0'));

  if (!module) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--cosmic-bg-gradient)',
        padding: '20px',
        color: 'var(--cosmic-text-main)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '20px' }}>Module not found</h1>
        <Button onClick={() => navigate('/modules')}>
          Back to Modules
        </Button>
      </div>
    );
  }

  const selectLevel = (level: Level) => {
    navigate(`/modules/${module.id}/levels/${level.id}`, {
      state: { module, level }
    });
  };

  // Define gradient colors for each level position
  const levelColors = [
    { bg: 'linear-gradient(135deg, #ff6b9d 0%, #ff8a9b 50%, #ffa8a8 100%)', square: '#ff6b9d' }, // Pink
    { bg: 'linear-gradient(135deg, #ffa726 0%, #ffb74d 50%, #ffcc80 100%)', square: '#ffa726' }, // Orange/Yellow
    { bg: 'linear-gradient(135deg, #26a69a 0%, #4db6ac 50%, #80cbc4 100%)', square: '#26a69a' }, // Teal
    { bg: 'linear-gradient(135deg, #7e57c2 0%, #9575cd 50%, #b39ddb 100%)', square: '#7e57c2' }, // Purple
  ];

  return (
    <div style={{
      minHeight: '100vh',
      height: isMobileLandscape ? '100vh' : 'auto',
      width: '100vw',
      position: 'relative',
      overflow: 'hidden',
      color: 'var(--cosmic-text-main)',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Simplified cosmic background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        }}
      >
        {/* Subtle star field */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                background: 'rgba(255, 255, 255, 0.6)',
                borderRadius: '50%',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 2 + 1}px`,
                height: `${Math.random() * 2 + 1}px`,
                opacity: Math.random() * 0.8 + 0.2,
                animation: 'pulse',
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 3 + 2}s`,
              }}
            />
          ))}
        </div>
      </div>
      {/* Main content wrapper */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        padding: isMobileLandscape ? '8px 12px' : '20px',
        maxWidth: '1400px',
        margin: '0 auto',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: isMobileLandscape ? '15px' : '60px',
          position: 'relative'
        }}>
          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              fontSize: isMobileLandscape ? '1.4rem' : '2.5rem',
              fontWeight: 700,
              color: '#fff',
              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
              marginBottom: isMobileLandscape ? '0.25rem' : '0.5rem',
              textAlign: 'center',
              lineHeight: isMobileLandscape ? '1.2' : '1.1'
            }}>
              {module.title}
            </h1>
          </div>
          {/* Back Button */}
          <button
            onClick={() => navigate("/modules")}
            style={{
              position: "absolute",
              top: isMobileLandscape ? -5 : -10,
              left: isMobileLandscape ? -5 : -10,
              zIndex: 40,
              background: "rgba(255, 255, 255, 0.1)",
              color: "#fff",
              border: "2px solid rgba(255, 255, 255, 0.2)",
              borderRadius: isMobileLandscape ? "8px" : "12px",
              backdropFilter: "blur(10px)",
              padding: isMobileLandscape ? "0.5rem 1rem" : "0.75rem 1.5rem",
              fontWeight: 600,
              fontSize: isMobileLandscape ? "0.8rem" : "1rem",
              cursor: "pointer",
              outline: "none",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: isMobileLandscape ? "0.25rem" : "0.5rem"
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            aria-label="Back to Modules"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back
          </button>
        </div>

        {/* Horizontal Timeline */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: isMobileLandscape ? '60px' : '120px',
          width: '100%',
          flex: 1
        }}>
          {/* Timeline Bar */}
          <div style={{
            position: 'relative',
            width: isMobileLandscape ? '95%' : '85%',
            maxWidth: isMobileLandscape ? '100%' : '900px',
            height: isMobileLandscape ? '6px' : '10px',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: isMobileLandscape ? '3px' : '5px',
            margin: isMobileLandscape ? '10px 0' : '20px 0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
          }}>
            {/* Progress line */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              background: 'linear-gradient(90deg, #ff6b9d 0%, #ffa726 33%, #26a69a 66%, #7e57c2 100%)',
              borderRadius: isMobileLandscape ? '3px' : '5px',
              width: '100%',
              boxShadow: isMobileLandscape ? '0 0 8px rgba(255, 107, 157, 0.2)' : '0 0 15px rgba(255, 107, 157, 0.3)'
            }} />

            {/* Level indicators on timeline */}
            {module.levels.map((level: Level, index: number) => {
              const isCompleted = isLevelCompleted(module.id, level.id);
              const colorIndex = index % levelColors.length;
              const position = (index / (module.levels.length - 1)) * 100;

              return (
                <div key={level.id}>
                  {/* Timeline square */}
                  <div
                    style={{
                      position: 'absolute',
                      top: isMobileLandscape ? '-8px' : '-12px',
                      left: `${position}%`,
                      transform: 'translateX(-50%)',
                      width: isMobileLandscape ? '20px' : '32px',
                      height: isMobileLandscape ? '20px' : '32px',
                      background: levelColors[colorIndex].square,
                      borderRadius: isMobileLandscape ? '5px' : '8px',
                      border: isMobileLandscape ? '2px solid #fff' : '3px solid #fff',
                      boxShadow: isMobileLandscape ? '0 2px 6px rgba(0,0,0,0.2)' : '0 4px 12px rgba(0,0,0,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      zIndex: 10
                    }}
                    onClick={() => selectLevel(level)}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateX(-50%) scale(1.2)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateX(-50%) scale(1)';
                    }}
                  >
                    {isCompleted ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ) : (
                      <span style={{
                        color: '#fff',
                        fontSize: isMobileLandscape ? '9px' : '12px',
                        fontWeight: 'bold'
                      }}>
                        {level.id}
                      </span>
                    )}
                  </div>

                  {/* Connecting line */}
                  <div
                    style={{
                      position: 'absolute',
                      top: isMobileLandscape ? '12px' : '20px',
                      left: `${position}%`,
                      transform: 'translateX(-50%)',
                      width: isMobileLandscape ? '2px' : '3px',
                      height: isMobileLandscape ? '40px' : '80px',
                      background: 'transparent',
                      zIndex: 5
                    }}
                  >
                    {/* Dashed line */}
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: `repeating-linear-gradient(
                          to bottom,
                          ${levelColors[colorIndex].square} 0px,
                          ${levelColors[colorIndex].square} ${isMobileLandscape ? '4px' : '6px'},
                          transparent ${isMobileLandscape ? '4px' : '6px'},
                          transparent ${isMobileLandscape ? '8px' : '12px'}
                        )`,
                        opacity: 0.8,
                        borderRadius: isMobileLandscape ? '1px' : '2px'
                      }}
                    />
                  </div>

                  {/* Small square indicator below the line */}
                  <div
                    style={{
                      position: 'absolute',
                      top: isMobileLandscape ? '55px' : '105px',
                      left: `${position}%`,
                      transform: 'translateX(-50%)',
                      width: isMobileLandscape ? '12px' : '20px',
                      height: isMobileLandscape ? '12px' : '20px',
                      background: levelColors[colorIndex].square,
                      borderRadius: isMobileLandscape ? '3px' : '6px',
                      border: isMobileLandscape ? '2px solid #fff' : '3px solid #fff',
                      boxShadow: isMobileLandscape ? '0 2px 6px rgba(0,0,0,0.3)' : '0 3px 10px rgba(0,0,0,0.4)',
                      zIndex: 8,
                      opacity: 0.9
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Level Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobileLandscape
              ? `repeat(${Math.min(module.levels.length, 4)}, 1fr)`
              : `repeat(${Math.min(module.levels.length, 4)}, 1fr)`,
            gap: isMobileLandscape ? '15px' : '30px',
            width: '100%',
            maxWidth: isMobileLandscape ? '100%' : '1200px'
          }}>
            {module.levels.map((level: Level, index: number) => {
              const levelScore = getLevelScore(module.id, level.id);
              const isCompleted = isLevelCompleted(module.id, level.id);
              const colorIndex = index % levelColors.length;

              return (
                <div
                  key={level.id}
                  onClick={() => selectLevel(level)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      selectLevel(level);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`Select ${level.name} - ${level.difficulty} level`}
                  aria-describedby={`level-${level.id}-description`}
                  style={{
                    background: levelColors[colorIndex].bg,
                    padding: isMobileLandscape ? '15px 12px' : '30px 25px',
                    borderRadius: isMobileLandscape ? '12px' : '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: isMobileLandscape
                      ? '0 5px 15px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1)'
                      : '0 10px 30px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)',
                    position: 'relative',
                    minHeight: isMobileLandscape ? '160px' : '320px',
                    color: '#fff',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                    e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.2)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0) scale(1)';
                    e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)';
                  }}
                >
                  {/* Level number badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: isMobileLandscape ? '-8px' : '-15px',
                      left: isMobileLandscape ? '12px' : '25px',
                      background: 'rgba(255, 255, 255, 0.9)',
                      color: levelColors[colorIndex].square,
                      padding: isMobileLandscape ? '4px 8px' : '8px 16px',
                      borderRadius: isMobileLandscape ? '12px' : '20px',
                      fontSize: isMobileLandscape ? '0.7rem' : '0.9rem',
                      fontWeight: 'bold',
                      boxShadow: isMobileLandscape ? '0 2px 6px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.2)',
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}
                  >
                    {index + 1}. {level.taxonomy}
                  </div>

                  {/* Completion badge */}
                  {isCompleted && (
                    <div style={{
                      position: 'absolute',
                      top: isMobileLandscape ? '-8px' : '-15px',
                      right: isMobileLandscape ? '12px' : '25px',
                      backgroundColor: 'rgba(16, 185, 129, 0.9)',
                      color: 'white',
                      padding: isMobileLandscape ? '4px 8px' : '8px 12px',
                      borderRadius: isMobileLandscape ? '12px' : '20px',
                      fontSize: isMobileLandscape ? '0.65rem' : '0.8rem',
                      fontWeight: 'bold',
                      boxShadow: isMobileLandscape ? '0 2px 6px rgba(0,0,0,0.15)' : '0 4px 12px rgba(0,0,0,0.2)',
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}>
                      ✓ Completed
                    </div>
                  )}

                  {/* Level content */}
                  <div style={{ marginTop: isMobileLandscape ? '12px' : '20px' }}>
                    <h3 style={{
                      fontSize: isMobileLandscape ? '1rem' : '1.5rem',
                      marginBottom: isMobileLandscape ? '6px' : '12px',
                      fontWeight: 'bold',
                      textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                      lineHeight: isMobileLandscape ? '1.2' : '1.3'
                    }}>
                      {level.name}
                    </h3>

                   

                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: isMobileLandscape ? '10px' : '20px',
                      gap: isMobileLandscape ? '8px' : '12px'
                    }}>
                      <DifficultyBadge difficulty={level.difficulty} />
                      <StarRating stars={levelScore?.stars || level.stars} />
                    </div>

                    {/* Bottom info */}
                    <div style={{
                      position: 'absolute',
                      bottom: isMobileLandscape ? '12px' : '20px',
                      left: isMobileLandscape ? '12px' : '25px',
                      right: isMobileLandscape ? '12px' : '25px',
                      backgroundColor: 'rgba(0,0,0,0.3)',
                      padding: isMobileLandscape ? '6px' : '12px',
                      borderRadius: isMobileLandscape ? '8px' : '12px',
                      fontSize: isMobileLandscape ? '0.7rem' : '0.9rem',
                      textAlign: 'center',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                      <span style={{ fontWeight: '600' }}>Bloom's: {level.taxonomy}</span>
                      <span style={{ fontWeight: '600' }}>{level.time} min</span>
                      {levelScore && (
                        <span style={{ color: '#10b981', fontWeight: '600' }}>
                          Score: {levelScore.score}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export {LevelList};
