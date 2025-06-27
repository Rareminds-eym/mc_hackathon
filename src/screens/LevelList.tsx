import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { GMP_MODULES } from '../data/gmpModules';
import { useGameRedux } from '../store/useGameRedux';
import { Button, DifficultyBadge, StarRating } from '../components/ui';
import type { Level, Module } from '../types';

const LevelList: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isLevelCompleted, getLevelScore } = useGameRedux();
  
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
        <Button onClick={() => navigate('/roadmap')}>
          Back to Roadmap
        </Button>
      </div>
    );
  }

  const selectLevel = (level: Level) => {
    navigate(`/module/${module.id}/level/${level.id}`, { 
      state: { module, level } 
    });
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw',
      position: 'relative',
      overflow: 'hidden',
      color: 'var(--cosmic-text-main)'
    }}>
      {/* Cosmic animated background */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          background: 'var(--cosmic-bg-gradient)',
        }}
      >
        {/* Large planet */}
        <div
          style={{
            position: 'absolute',
            width: '28rem',
            height: '28rem',
            borderRadius: '50%',
            background: 'var(--cosmic-planet-gradient)',
            opacity: 0.22,
            filter: 'blur(12px)',
            right: '8%',
            top: '18%',
            transform: 'translate(50%, -50%)',
            zIndex: 1
          }}
        />
        {/* Smaller celestial body */}
        <div
          style={{
            position: 'absolute',
            width: '10rem',
            height: '10rem',
            borderRadius: '50%',
            background: 'var(--cosmic-celestial-gradient)',
            opacity: 0.32,
            left: '12%',
            top: '12%',
            zIndex: 1
          }}
        />
        {/* Star field */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          {[...Array(120)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                background: 'var(--cosmic-star)',
                borderRadius: '50%',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 2.5 + 1}px`,
                height: `${Math.random() * 2.5 + 1}px`,
                opacity: Math.random() * 0.7 + 0.3,
                filter: 'blur(0.5px)',
                animation: 'pulse',
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${Math.random() * 2 + 2}s`,
              }}
            />
          ))}
        </div>
        {/* Floating cosmic particles */}
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}>
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                width: '4px',
                height: '4px',
                background: 'var(--cosmic-particle)',
                borderRadius: '50%',
                opacity: 0.6,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `float ${Math.random() * 15 + 15}s infinite linear`,
                animationDelay: `${Math.random() * 15}s`,
              }}
            />
          ))}
        </div>
      </div>
      {/* Main content wrapper */}
      <div style={{ position: 'relative', zIndex: 2, padding: '20px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '30px' 
        }}>
          <div style={{ textAlign: 'center', width: '100%' }}>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#fff',
              textShadow: '0 2px 8px #0008',
              marginBottom: '0.5rem',
              textAlign: 'center'
            }}>
              {module.title}
            </h1>
            <p style={{
              fontSize: '1rem',
              color: '#67e8f9',
              textShadow: '0 1px 4px #0006',
              textAlign: 'center'
            }}>
              {module.description}
            </p>
          </div>
          {/* Gamified Back Button */}
          <button
            onClick={() => navigate("/roadmap")}
            style={{
              position: "absolute",
              top: 24,
              left: 24,
              zIndex: 40,
              background: "#5f00b6", // deep purple
              color: "#fff",
              border: "none",
              borderRadius: "9999px",
              boxShadow: "0 0 12px 2px #a78bfa, 0 1px 4px rgba(95,0,182,0.10)", // reduced purple glow + softer shadow
              padding: "0.5rem 1rem", // reduced padding for less width
              fontWeight: 700,
              fontSize: "1.1rem",
              letterSpacing: "0.05em",
              fontFamily: "inherit", // Ensure default font is used
              cursor: "pointer",
              outline: "none",
              transition: "transform 0.15s, box-shadow 0.15s, background 0.2s, color 0.2s",
              textShadow: "0 2px 8px #a78bfa, 0 2px 8px #0004",
              animation: "glow 2s infinite alternate",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            onMouseDown={e => (e.currentTarget.style.transform = "scale(0.96)")}
            onMouseUp={e => (e.currentTarget.style.transform = "scale(1)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            onMouseOver={e => {
              e.currentTarget.style.background = "#7c3aed"; // lighter purple
              e.currentTarget.style.color = "#fff";
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = "#5f00b6";
              e.currentTarget.style.color = "#fff";
            }}
            aria-label="Back to Home"
          >
            {/* Gamified back pixel arrow icon */}
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" style={{ display: 'block' }}>
              <rect x="2" y="2" width="20" height="20" rx="6" fill="#a78bfa" opacity="0.18" />
              <path d="M14 7l-5 5 5 5" stroke="#fff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="7" y="11" width="7" height="2" rx="1" fill="#fff" opacity="0.7" />
            </svg>
            Back
          </button>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '20px',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {module.levels.map((level: Level) => {
            const levelScore = getLevelScore(module.id, level.id);
            const isCompleted = isLevelCompleted(module.id, level.id);
            
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
                  backgroundColor: 'var(--cosmic-scroll-btn-bg)',
                  padding: '25px',
                  borderRadius: '15px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 8px 25px rgba(0,0,0,0.3)',
                  border: '3px solid var(--cosmic-scroll-btn-icon)',
                  position: 'relative',
                  minHeight: '200px',
                  color: 'var(--cosmic-text-main)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.backgroundColor = 'var(--cosmic-scroll-btn-bg-hover)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.backgroundColor = 'var(--cosmic-scroll-btn-bg)';
                }}
              >
                  <div
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    left: '20px',
                    background: 'var(--cosmic-celestial-gradient)',
                    color: 'var(--cosmic-text-main)',
                    padding: '5px 15px',
                    borderRadius: '20px',
                    fontSize: '0.8rem',
                    fontWeight: 'bold',
                    boxShadow: '0 0 8px var(--cosmic-back-btn-glow1), 0 1px 4px var(--cosmic-back-btn-shadow)',
                    textShadow: '0 2px 8px var(--cosmic-text-accent-shadow)'
                  }}
                  >
                  Level {level.id}: {level.taxonomy}
                  </div>
                
                {isCompleted && (
                  <div style={{ 
                    position: 'absolute', 
                    top: '-10px', 
                    right: '20px', 
                    backgroundColor: '#10b981', 
                    color: 'white', 
                    padding: '5px 10px', 
                    borderRadius: '20px', 
                    fontSize: '0.7rem', 
                    fontWeight: 'bold' 
                  }}>
                    ✓ Completed
                  </div>
                )}
                
                <h3 style={{ 
                  fontSize: '1.4rem', 
                  marginBottom: '10px', 
                  marginTop: '15px', 
                  fontWeight: 'bold' 
                }}>
                  {level.name}
                </h3>
                
                <p style={{ 
                  fontSize: '0.9rem', 
                  opacity: 0.8, 
                  marginBottom: '15px', 
                  lineHeight: '1.4' 
                }}
                id={`level-${level.id}-description`}
                >
                  {level.description}
                </p>
                
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  marginBottom: '15px' 
                }}>
                  <DifficultyBadge difficulty={level.difficulty} />
                  <StarRating stars={levelScore?.stars || level.stars} />
                </div>
                
                <div style={{ 
                  position: 'absolute',
                  bottom: '15px',
                  left: '25px',
                  right: '25px',
                  backgroundColor: 'rgba(0,0,0,0.2)', 
                  padding: '8px', 
                  borderRadius: '8px', 
                  fontSize: '0.8rem',
                  textAlign: 'center',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span>Bloom's: {level.taxonomy}</span>
                  <span>{level.time} min</span>
                  {levelScore && (
                    <span style={{ color: '#10b981' }}>
                      Score: {levelScore.score}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export {LevelList};
