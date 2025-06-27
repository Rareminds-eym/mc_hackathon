import React from 'react';
import { Bot } from 'lucide-react';

interface CharacterSpriteProps {
  moduleId: number;
  platformWidth: number;
  platformSpacing: number;
}

const CharacterSprite: React.FC<CharacterSpriteProps> = ({ 
  moduleId, 
  platformWidth, 
  platformSpacing 
}) => {
  // Calculate position based on module ID
  const xPosition = (moduleId - 1) * (platformWidth + platformSpacing) + platformWidth / 2;

  return (
    <div
      className="absolute z-20 transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] top-1/2"
      style={{
        left: `${xPosition}px`,
        transform: 'translateX(-50%)',
        marginTop: '-140px',
      }}
    >
      <div className="relative">
        {/* Character shadow */}
        <div
          className="absolute left-1/2 w-10 h-5 bg-black opacity-40 rounded-full blur-sm"
          style={{ top: 80, transform: 'translateX(-50%)' }}
        ></div>
        {/* Character body - astronaut style */}
        <div className="relative">
          {/* Main body */}
          <div className="bg-gradient-to-b from-white to-gray-200 rounded-2xl p-4 shadow-2xl border-4 border-gray-300 flex items-center justify-center">
            <Bot size={32} color="#2563eb" style={{ filter: 'drop-shadow(0 2px 8px #2563eb88)' }} />
          </div>
          {/* Helmet glow */}
          <div className="absolute inset-0 bg-cyan-400 rounded-2xl opacity-20 animate-pulse"></div>
          {/* Floating animation */}
          <div className="absolute -top-2 -left-2 -right-2 -bottom-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl opacity-10 animate-ping"></div>
        </div>
        {/* Jetpack particles */}
        <div
          className="absolute left-1/2"
          style={{ top: 64, transform: 'translateX(-50%)' }}
        >
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-orange-400 rounded-full animate-bounce"
              style={{ left: `${(i - 1) * 4}px`, animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.4; }
        }
        @keyframes ping {
          0% { transform: scale(1); opacity: 0.1; }
          75%, 100% { transform: scale(1.5); opacity: 0; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
      `}</style>
    </div>
  );
};

export default CharacterSprite;