import React from 'react';
import { X, Clock, Trophy, Target } from 'lucide-react';
import { Module } from './types/GameData';
import { StarRating } from './StarRating';
import * as LucideIcons from 'lucide-react';

interface LevelDetailsModalProps {
  module: Module | null;
  isOpen: boolean;
  onClose: () => void;
}

export const LevelDetailsModal: React.FC<LevelDetailsModalProps> = ({ module, isOpen, onClose }) => {
  if (!isOpen || !module) return null;

  const IconComponent = LucideIcons[module.icon as keyof typeof LucideIcons] as React.ComponentType<any>;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50
                    p-4
                    mobile-portrait:p-2
                    mobile-landscape:p-1">
      <div className="bg-white rounded-3xl shadow-2xl animate-in fade-in-0 zoom-in-95 duration-300
                      max-w-4xl w-full
                      h-[90vh] max-h-[90vh]
                      mobile-portrait:max-w-full mobile-portrait:h-[95vh] mobile-portrait:max-h-[95vh] mobile-portrait:rounded-2xl
                      mobile-landscape:max-w-full mobile-landscape:h-[95vh] mobile-landscape:max-h-[95vh] mobile-landscape:rounded-xl
                      flex flex-col">
        {/* Header - Fixed */}  
        <div className={`${module.gradient} text-white relative overflow-hidden flex-shrink-0
                         p-6
                         mobile-portrait:p-4
                         mobile-landscape:p-2`}>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 rounded-full bg-white transform translate-x-12 -translate-y-12
                            w-32 h-32
                            mobile-portrait:w-24 mobile-portrait:h-24 mobile-portrait:translate-x-8 mobile-portrait:-translate-y-8
                            mobile-landscape:w-16 mobile-landscape:h-16 mobile-landscape:translate-x-6 mobile-landscape:-translate-y-6"></div>
            <div className="absolute bottom-0 left-0 rounded-full bg-white transform -translate-x-8 translate-y-8
                            w-24 h-24
                            mobile-portrait:w-20 mobile-portrait:h-20 mobile-portrait:-translate-x-6 mobile-portrait:translate-y-6
                            mobile-landscape:w-12 mobile-landscape:h-12 mobile-landscape:-translate-x-4 mobile-landscape:translate-y-4"></div>
          </div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center
                            space-x-4
                            mobile-portrait:space-x-3
                            mobile-landscape:space-x-2">
              <div className="bg-white/20 rounded-xl backdrop-blur-sm
                              p-4
                              mobile-portrait:p-3
                              mobile-landscape:p-1.5">
                <IconComponent className="text-white
                                         w-8 h-8
                                         mobile-portrait:w-6 mobile-portrait:h-6
                                         mobile-landscape:w-4 mobile-landscape:h-4" />
              </div>
              <div>
                <h2 className="font-bold
                               text-3xl
                               mobile-portrait:text-2xl
                               mobile-landscape:text-lg">{module.name}</h2>
                <p className="text-white/80
                              text-base
                              mobile-portrait:text-sm
                              mobile-landscape:text-xs">{module.category}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm
                         p-2
                         mobile-portrait:p-1.5
                         mobile-landscape:p-1"
            >
              <X className="text-white
                           w-6 h-6
                           mobile-portrait:w-5 mobile-portrait:h-5
                           mobile-landscape:w-3 mobile-landscape:h-3" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Levels Grid - Fixed Height */}
          <div className="flex-1 p-6
                          mobile-portrait:p-4
                          mobile-landscape:p-2">
            <div className="grid gap-4 h-full
                            grid-cols-1 md:grid-cols-2
                            mobile-portrait:grid-cols-2 mobile-portrait:grid-rows-2 mobile-portrait:gap-2
                            mobile-landscape:grid-cols-2 mobile-landscape:grid-rows-2 mobile-landscape:gap-2">
              {module.levels.map((level) => (
                <div
                  key={level.id}
                  className={`rounded-2xl transition-all duration-300 hover:shadow-lg border flex flex-col
                             p-4
                             mobile-portrait:p-3 mobile-portrait:rounded-xl
                             mobile-landscape:p-2 mobile-landscape:rounded-lg ${
                    level.completed
                      ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-green-200'
                      : 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3
                                  mobile-portrait:mb-2
                                  mobile-landscape:mb-1">
                    <div className="flex items-center
                                    space-x-2
                                    mobile-portrait:space-x-2
                                    mobile-landscape:space-x-1">
                      <div className={`rounded-full flex items-center justify-center font-bold
                                       w-10 h-10 text-sm
                                       mobile-portrait:w-8 mobile-portrait:h-8 mobile-portrait:text-xs
                                       mobile-landscape:w-6 mobile-landscape:h-6 mobile-landscape:text-xs ${
                        level.completed 
                          ? 'bg-green-500 text-white' 
                          : 'bg-gray-300 text-gray-600'
                      }`}>
                        {level.id}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800
                                       text-sm
                                       mobile-portrait:text-xs
                                       mobile-landscape:text-xs">Level {level.id}</h3>
                        <p className="text-gray-600
                                      text-xs
                                      mobile-portrait:text-xs
                                      mobile-landscape:text-xs">
                          {level.completed ? 'Completed' : 'Not Started'}
                        </p>
                      </div>
                    </div>
                    {level.completed && (
                      <div className="text-right">
                        <StarRating rating={level.stars} size="sm" />
                      </div>
                    )}
                  </div>

                  {level.completed ? (
                    <div className="space-y-2 flex-1
                                    mobile-portrait:space-y-1
                                    mobile-landscape:space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center
                                        space-x-1
                                        mobile-portrait:space-x-1
                                        mobile-landscape:space-x-1">
                          <Trophy className="text-yellow-500
                                            w-4 h-4
                                            mobile-portrait:w-3 mobile-portrait:h-3
                                            mobile-landscape:w-3 mobile-landscape:h-3" />
                          <span className="text-gray-700
                                          text-xs
                                          mobile-portrait:text-xs
                                          mobile-landscape:text-xs">Score</span>
                        </div>
                        <span className="font-bold text-gray-800
                                        text-lg
                                        mobile-portrait:text-base
                                        mobile-landscape:text-sm">{level.score}/100</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center
                                        space-x-1
                                        mobile-portrait:space-x-1
                                        mobile-landscape:space-x-1">
                          <Clock className="text-blue-500
                                           w-4 h-4
                                           mobile-portrait:w-3 mobile-portrait:h-3
                                           mobile-landscape:w-3 mobile-landscape:h-3" />
                          <span className="text-gray-700
                                          text-xs
                                          mobile-portrait:text-xs
                                          mobile-landscape:text-xs">Time</span>
                        </div>
                        <span className="font-semibold text-gray-800
                                        text-sm
                                        mobile-portrait:text-xs
                                        mobile-landscape:text-xs">{level.timeSpent}</span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full
                                      h-1.5
                                      mobile-portrait:h-1
                                      mobile-landscape:h-1">
                        <div 
                          className="bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-1000 ease-out
                                     h-1.5
                                     mobile-portrait:h-1
                                     mobile-landscape:h-1"
                          style={{ width: `${level.score}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 flex-1 flex flex-col justify-center
                                    mobile-portrait:py-2
                                    mobile-landscape:py-1">
                      <Target className="text-gray-400 mx-auto mb-2
                                        w-8 h-8
                                        mobile-portrait:w-6 mobile-portrait:h-6 mobile-portrait:mb-1
                                        mobile-landscape:w-4 mobile-landscape:h-4 mobile-landscape:mb-1" />
                      <p className="text-gray-500 font-medium mb-2
                                    text-sm
                                    mobile-portrait:text-xs mobile-portrait:mb-1
                                    mobile-landscape:text-xs mobile-landscape:mb-1">Ready to start?</p>
                      <button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105
                                         px-4 py-1.5 text-sm
                                         mobile-portrait:px-3 mobile-portrait:py-1 mobile-portrait:text-xs
                                         mobile-landscape:px-2 mobile-landscape:py-0.5 mobile-landscape:text-xs">
                        Begin Level
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Module Summary - Fixed at Bottom */}
          <div className="flex-shrink-0 bg-gradient-to-r from-indigo-50 to-purple-50 border-t border-indigo-200
                          p-4
                          mobile-portrait:p-3
                          mobile-landscape:p-2">
            <h3 className="font-bold text-gray-800 mb-3 text-center
                           text-lg
                           mobile-portrait:text-base mobile-portrait:mb-2
                           mobile-landscape:text-sm mobile-landscape:mb-1">Module Summary</h3>
            <div className="grid gap-4
                            grid-cols-3
                            mobile-portrait:grid-cols-3 mobile-portrait:gap-3
                            mobile-landscape:grid-cols-3 mobile-landscape:gap-2">
              <div className="text-center">
                <div className="font-bold text-indigo-600
                                text-2xl
                                mobile-portrait:text-xl
                                mobile-landscape:text-lg">{module.completedLevels}/4</div>
                <p className="text-gray-600
                              text-sm
                              mobile-portrait:text-xs
                              mobile-landscape:text-xs">Levels Completed</p>
              </div>
              <div className="text-center">
                <div className="font-bold text-green-600
                                text-2xl
                                mobile-portrait:text-xl
                                mobile-landscape:text-lg">{module.totalScore}</div>
                <p className="text-gray-600
                              text-sm
                              mobile-portrait:text-xs
                              mobile-landscape:text-xs">Total Score</p>
              </div>
              <div className="text-center">
                <div className="font-bold text-purple-600
                                text-2xl
                                mobile-portrait:text-xl
                                mobile-landscape:text-lg">
                  {Math.round((module.completedLevels / 4) * 100)}%
                </div>
                <p className="text-gray-600
                              text-sm
                              mobile-portrait:text-xs
                              mobile-landscape:text-xs">Progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};