import React from 'react';
import { Icon } from '@iconify/react';

const Background: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none">
      <style>
        {`
          @keyframes carDrive {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(120vw); }
          }

          @keyframes forkliftMove {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(-40vw); }
          }

          @keyframes boxSlide {
            0% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0); }
          }

          @keyframes spinSlow {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes spinReverse {
            0% { transform: rotate(360deg); }
            100% { transform: rotate(0deg); }
          }
        `}
      </style>

      {/* Moving Car */}
      <Icon
        icon="mdi:car"
        className="text-gray-100 text-opacity-30 absolute top-10 w-10 h-10 md:w-12 md:h-12"
        style={{
          animation: 'carDrive 15s linear infinite',
          left: '-10%',
        }}
      />

      {/* Moving Forklift */}
      <Icon
        icon="mdi:forklift"
        className="text-yellow-300 text-opacity-30 absolute top-1/3 w-10 h-10 md:w-12 md:h-12"
        style={{
          animation: 'forkliftMove 12s ease-in-out infinite',
          right: '-10%',
        }}
      />

      {/* Conveyor Box */}
      <Icon
        icon="mdi:package-variant-closed"
        className="text-orange-200 text-opacity-30 absolute w-8 h-8 md:w-10 md:h-10"
        style={{
          animation: 'boxSlide 10s ease-in-out infinite',
          top: '80%',
          left: '50%',
        }}
      />

      {/* Gear (slow spin) */}
      <Icon
        icon="mdi:cog-outline"
        className="text-blue-100 text-opacity-20 absolute w-12 h-12"
        style={{
          animation: 'spinSlow 20s linear infinite',
          top: '60%',
          left: '20%',
        }}
      />

      {/* Gear (reverse spin) */}
      <Icon
        icon="mdi:cog-outline"
        className="text-blue-100 text-opacity-20 absolute w-10 h-10"
        style={{
          animation: 'spinReverse 25s linear infinite',
          top: '20%',
          right: '15%',
        }}
      />
    </div>
  );
};

export default Background;
