import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Module } from './types/GameData';
import { StarRating } from './StarRating';

interface ModuleCardProps {
  module: Module;
  onClick: () => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ module, onClick }) => {
  const IconComponent = LucideIcons[module.icon as keyof typeof LucideIcons] as React.ComponentType<any>;
  const progressPercentage = (module.completedLevels / 4) * 100;
  const averageStars = module.levels.reduce((sum, level) => sum + level.stars, 0) / 4;

  return (
    <div onClick={onClick} className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2 w-full h-full relative z-10 hover:z-30 focus:z-30">
      <div className="rounded-xl shadow-2xl hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] transition-all duration-300 relative overflow-hidden h-full p-3 mobile-portrait:p-1 mobile-portrait:rounded-md mobile-portrait:shadow-md mobile-landscape:p-0.5 mobile-landscape:rounded mobile-landscape:shadow-sm border border-white/30 bg-white/10 backdrop-blur-lg" style={{boxShadow: '0 8px 32px 0 rgba(31,38,135,0.37), 0 1.5px 8px 0 rgba(255,255,255,0.10)'}}>
        {/* Mirror/Glassmorphism Background Pattern */}
        <div className="absolute inset-0 pointer-events-none opacity-30" style={{background: 'linear-gradient(120deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%)'}}></div>
        <div className="relative z-10 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-2 mobile-portrait:mb-0.5 mobile-landscape:mb-0.5">
            <div className="bg-white/20 rounded-xl backdrop-blur-sm p-2 mobile-portrait:p-0.5 mobile-landscape:p-0.5">
              <IconComponent className="text-white w-4 h-4 mobile-portrait:w-2.5 mobile-portrait:h-2.5 mobile-landscape:w-2 mobile-landscape:h-2" />
            </div>
            <div className="bg-white/20 rounded-full backdrop-blur-sm px-2 py-0.5 mobile-portrait:px-0.5 mobile-portrait:py-0.5 mobile-landscape:px-0.5 mobile-landscape:py-0.5">
              <span className="font-semibold text-white text-xs mobile-portrait:text-[9px] mobile-landscape:text-[8px]">{module.category}</span>
            </div>
          </div>
          {/* Module Name */}
          <h3 className="font-bold text-white mb-1 group-hover:text-yellow-100 transition-colors text-base mobile-portrait:text-[10px] mobile-landscape:text-[9px]">
            {module.name}
          </h3>
          {/* Star Rating */}
          <div className="mb-2 mobile-portrait:mb-0.5 mobile-landscape:mb-0.5">
            <StarRating rating={averageStars} size="sm" />
          </div>
          {/* Progress Section */}
          <div className="mb-2 flex-grow mobile-portrait:mb-0.5 mobile-landscape:mb-0.5">
            <div className="flex justify-between items-center mb-1">
              <span className="text-white/80 text-xs mobile-portrait:text-[9px] mobile-landscape:text-[8px]">Progress</span>
              <span className="text-white font-semibold text-xs mobile-portrait:text-[9px] mobile-landscape:text-[8px]">{module.completedLevels}/4</span>
            </div>
            <div className="w-full bg-white/20 rounded-full backdrop-blur-sm h-1.5 mobile-portrait:h-0.5 mobile-landscape:h-0.5">
              <div className="bg-white rounded-full transition-all duration-1000 ease-out h-1.5 mobile-portrait:h-0.5 mobile-landscape:h-0.5" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
          {/* Score */}
          <div className="flex justify-between items-center mt-auto min-w-0 gap-1">
            <span className="text-white/80 text-xs truncate mobile-portrait:text-[8px] mobile-landscape:text-[7px]">Best Score</span>
            <span className="text-white font-bold text-base truncate mobile-portrait:text-[9px] mobile-landscape:text-[8px] max-w-[40px] text-right">{module.totalScore}</span>
          </div>
        </div>
      </div>
    </div>
  );
};