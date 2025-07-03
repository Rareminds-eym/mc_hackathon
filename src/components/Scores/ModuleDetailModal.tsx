import React from 'react';
import { X, Star, Trophy, Target } from 'lucide-react';
import { ModuleDetailModalProps, Level } from './types/GameData';

const ModuleDetailModal: React.FC<ModuleDetailModalProps> = ({ isOpen, module, onClose }) => {
  if (!isOpen || !module) return null;

  const getScoreColor = (score: number): string => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score > 0) return 'text-orange-600';
    return 'text-gray-400';
  };

  const getScoreIcon = (score: number): JSX.Element => {
    if (score >= 90) return <Trophy size={16} className="text-green-600" />;
    if (score >= 70) return <Target size={16} className="text-yellow-600" />;
    if (score > 0) return <Star size={16} className="text-orange-600" />;
    return <div className="w-4 h-4 rounded-full bg-gray-300"></div>;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl shadow-2xl max-w-md w-full transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-orange-200">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {module.id}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Module {module.id}
              </h2>
              <div className="flex items-center space-x-1 mt-1">
                {[...Array(3)].map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    fill={i < module.stars ? '#F59E0B' : 'none'}
                    stroke={i < module.stars ? '#F59E0B' : '#D1D5DB'}
                    strokeWidth="2"
                  />
                ))}
                <span className="text-sm text-gray-600 ml-2">
                  {module.stars}/3 stars
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-orange-200 rounded-full transition-colors duration-200"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Target size={20} className="mr-2 text-orange-500" />
            Level Progress
          </h3>
          
          <div className="space-y-3">
            {module.levels.map((level: Level) => (
              <div 
                key={level.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm border border-orange-100 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center space-x-3">
                  {getScoreIcon(level.score)}
                  <div>
                    <h4 className="font-medium text-gray-800">
                      {level.name}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Level {level.id}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-bold ${getScoreColor(level.score)}`}>
                    {level.score > 0 ? `${level.score}%` : 'Not started'}
                  </div>
                  {level.score > 0 && (
                    <div className="w-16 h-2 bg-gray-200 rounded-full mt-1">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          level.score >= 90 ? 'bg-green-500' :
                          level.score >= 70 ? 'bg-yellow-500' : 'bg-orange-500'
                        }`}
                        style={{ width: `${level.score}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 bg-gradient-to-r from-orange-100 to-amber-100 rounded-b-2xl border-t border-orange-200">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Status: <span className="font-medium capitalize text-gray-800">{module.status}</span>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModuleDetailModal;