import React, { useEffect, useState } from 'react';

// Sparkle Animation Component
interface SparkleProps {
  x: number;
  y: number;
  delay?: number;
  size?: number;
}

export const Sparkle: React.FC<SparkleProps> = ({ x, y, delay = 0, size = 4 }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <g transform={`translate(${x}, ${y})`}>
      <g className={`sparkle ${isVisible ? 'animate-pulse' : ''}`}>
        {/* Main sparkle star */}
        <path
          d={`M 0 -${size} L ${size * 0.3} -${size * 0.3} L ${size} 0 L ${size * 0.3} ${size * 0.3} L 0 ${size} L -${size * 0.3} ${size * 0.3} L -${size} 0 L -${size * 0.3} -${size * 0.3} Z`}
          fill="#FBBF24"
          opacity={isVisible ? "0.8" : "0"}
          style={{
            transition: 'opacity 0.5s ease-in-out',
            filter: 'drop-shadow(0 0 4px #F59E0B)'
          }}
        />
        
        {/* Inner sparkle */}
        <circle
          cx="0"
          cy="0"
          r={size * 0.3}
          fill="#FEF3C7"
          opacity={isVisible ? "0.9" : "0"}
          style={{ transition: 'opacity 0.5s ease-in-out' }}
        />
      </g>
    </g>
  );
};

// Moving Sparkles Container
interface MovingSparklesProps {
  count?: number;
  bounds: { width: number; height: number };
}

export const MovingSparkles: React.FC<MovingSparklesProps> = ({ count = 8, bounds }) => {
  const [sparkles, setSparkles] = useState<Array<{ id: number; x: number; y: number; delay: number; size: number }>>([]);

  useEffect(() => {
    const newSparkles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: Math.random() * bounds.width,
      y: Math.random() * bounds.height,
      delay: Math.random() * 2000,
      size: 3 + Math.random() * 3
    }));
    setSparkles(newSparkles);
  }, [count, bounds]);

  return (
    <g className="moving-sparkles">
      {sparkles.map(sparkle => (
        <Sparkle
          key={sparkle.id}
          x={sparkle.x}
          y={sparkle.y}
          delay={sparkle.delay}
          size={sparkle.size}
        />
      ))}
    </g>
  );
};

// Progress Trail Component
interface ProgressTrailProps {
  pathData: string;
  progress: number; // 0 to 1
}

export const ProgressTrail: React.FC<ProgressTrailProps> = ({ pathData, progress }) => {
  return (
    <g>
      {/* Base trail */}
      <path
        d={pathData}
        fill="none"
        stroke="#E5E7EB"
        strokeWidth="20"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.5"
      />
      
      {/* Progress trail */}
      <path
        d={pathData}
        fill="none"
        stroke="url(#pathGradient)"
        strokeWidth="16"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1000"
        strokeDashoffset={1000 * (1 - progress)}
        opacity="0.8"
        style={{
          transition: 'stroke-dashoffset 1s ease-in-out'
        }}
      />
      
      {/* Glowing progress trail */}
      <path
        d={pathData}
        fill="none"
        stroke="#FBBF24"
        strokeWidth="8"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="1000"
        strokeDashoffset={1000 * (1 - progress)}
        opacity="0.6"
        filter="url(#glowEffect)"
        style={{
          transition: 'stroke-dashoffset 1s ease-in-out'
        }}
      />
    </g>
  );
};

// Level Badge Component
interface LevelBadgeProps {
  x: number;
  y: number;
  stars: number; // 0-3 stars
  size?: number;
}

export const LevelBadge: React.FC<LevelBadgeProps> = ({ x, y, stars, size = 60 }) => {
  const starPositions = [
    { x: 0, y: -size * 0.2 },
    { x: -size * 0.15, y: size * 0.1 },
    { x: size * 0.15, y: size * 0.1 }
  ];

  return (
    <g transform={`translate(${x}, ${y})`}>
      {/* Badge background */}
      <circle
        cx="0"
        cy="0"
        r={size * 0.4}
        fill="url(#levelCompleteGradient)"
        stroke="#065F46"
        strokeWidth="3"
        filter="url(#levelShadow)"
      />
      
      {/* Badge inner ring */}
      <circle
        cx="0"
        cy="0"
        r={size * 0.3}
        fill="none"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth="2"
      />
      
      {/* Stars */}
      {starPositions.slice(0, stars).map((pos, index) => (
        <g key={index} transform={`translate(${pos.x}, ${pos.y})`}>
          <path
            d="M 0 -6 L 2 -2 L 6 -2 L 3 1 L 4 5 L 0 3 L -4 5 L -3 1 L -6 -2 L -2 -2 Z"
            fill="#FEF3C7"
            stroke="#F59E0B"
            strokeWidth="1"
            filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))"
          />
        </g>
      ))}
    </g>
  );
};

// Floating Number Animation
interface FloatingNumberProps {
  x: number;
  y: number;
  value: number;
  color?: string;
  duration?: number;
}

export const FloatingNumber: React.FC<FloatingNumberProps> = ({ 
  x, 
  y, 
  value, 
  color = "#10B981",
  duration = 2000 
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  return (
    <g transform={`translate(${x}, ${y})`}>
      <text
        x="0"
        y="0"
        textAnchor="middle"
        dominantBaseline="central"
        fill={color}
        fontSize="24"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
        opacity={isAnimating ? "0" : "1"}
        transform={isAnimating ? "translate(0, -30) scale(1.2)" : "translate(0, 0) scale(1)"}
        style={{
          transition: `all ${duration}ms ease-out`,
          filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))'
        }}
      >
        +{value}
      </text>
    </g>
  );
};

// Particle Burst Effect
interface ParticleBurstProps {
  x: number;
  y: number;
  particleCount?: number;
  trigger: boolean;
}

export const ParticleBurst: React.FC<ParticleBurstProps> = ({ 
  x, 
  y, 
  particleCount = 12,
  trigger 
}) => {
  const [particles, setParticles] = useState<Array<{
    id: number;
    angle: number;
    distance: number;
    size: number;
    color: string;
  }>>([]);

  useEffect(() => {
    if (trigger) {
      const colors = ['#FBBF24', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];
      const newParticles = Array.from({ length: particleCount }, (_, i) => ({
        id: i,
        angle: (360 / particleCount) * i,
        distance: 30 + Math.random() * 20,
        size: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)]
      }));
      setParticles(newParticles);
      
      // Clear particles after animation
      setTimeout(() => setParticles([]), 1000);
    }
  }, [trigger, particleCount]);

  return (
    <g transform={`translate(${x}, ${y})`}>
      {particles.map(particle => {
        const radians = (particle.angle * Math.PI) / 180;
        const endX = Math.cos(radians) * particle.distance;
        const endY = Math.sin(radians) * particle.distance;
        
        return (
          <circle
            key={particle.id}
            cx="0"
            cy="0"
            r={particle.size}
            fill={particle.color}
            opacity="1"
            transform={`translate(${endX}, ${endY}) scale(0)`}
            style={{
              animation: 'particleBurst 0.8s ease-out forwards',
              animationDelay: `${Math.random() * 0.2}s`
            }}
          />
        );
      })}
      
      <style jsx>{`
        @keyframes particleBurst {
          0% {
            transform: translate(0, 0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(var(--end-x, 0), var(--end-y, 0)) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </g>
  );
};

export default {
  Sparkle,
  MovingSparkles,
  ProgressTrail,
  LevelBadge,
  FloatingNumber,
  ParticleBurst
};
