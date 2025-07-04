import React from 'react';
import { X, Trophy, Target } from 'lucide-react';
import { ModuleDetailModalProps, Level } from './types/GameData';
import { useDeviceLayout } from '../../hooks/useOrientation';

const ModuleDetailModal: React.FC<ModuleDetailModalProps> = ({ isOpen, module, onClose }) => {
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileLandscape = isMobile && isHorizontal;

  if (!isOpen || !module) return null;

  const getScoreIcon = (score: number): JSX.Element => {
    if (score >= 90) return <Trophy size={16} className="text-green-600" />;
    if (score >= 70) return <Target size={16} className="text-yellow-600" />;
    if (score > 0) return <Target size={16} className="text-orange-600" />;
    return <div className="w-4 h-4 rounded-full bg-gray-300"></div>;
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${
      isMobileLandscape ? 'p-1' : isMobile ? 'p-2' : 'p-4'
    }`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative bg-gradient-to-br from-amber-50 to-orange-100 rounded-2xl shadow-2xl w-full transform transition-all duration-300 scale-100 ${
        isMobileLandscape ? 'max-w-sm mx-1 max-h-[85vh] overflow-hidden flex flex-col' :
        isMobile ? 'max-w-xs mx-2' : 'max-w-md'
      }`}>
        {/* Header */}
        <div className={`flex items-center justify-between border-b border-orange-200 ${
          isMobileLandscape ? 'p-2' : isMobile ? 'p-3' : 'p-6'
        }`}>
          <div className={`flex items-center ${
            isMobileLandscape ? 'space-x-1.5' : isMobile ? 'space-x-2' : 'space-x-3'
          }`}>
            <div className={`bg-gradient-to-br from-orange-400 to-amber-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg ${
              isMobileLandscape ? 'w-6 h-6 text-xs' : isMobile ? 'w-8 h-8 text-sm' : 'w-12 h-12 text-lg'
            }`}>
              {module.id}
            </div>
            <div>
              <h2 className={`font-bold text-gray-800 ${
                isMobileLandscape ? 'text-sm' : isMobile ? 'text-lg' : 'text-xl'
              }`}>
                Module {module.id}
              </h2>

            </div>
          </div>
          <button
            onClick={onClose}
            className={`hover:bg-orange-200 rounded-full transition-colors duration-200 ${
              isMobileLandscape ? 'p-0.5' : isMobile ? 'p-1' : 'p-2'
            }`}
          >
            <X size={isMobileLandscape ? 14 : isMobile ? 16 : 20} className="text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className={`${
          isMobileLandscape ? 'p-2 overflow-y-auto flex-1' : isMobile ? 'p-3' : 'p-6'
        }`}>
          <h3 className={`font-semibold text-gray-800 flex items-center ${
            isMobileLandscape ? 'text-xs mb-2' : isMobile ? 'text-xs mb-3' : 'text-lg mb-4'
          }`}>
            <Target size={isMobileLandscape ? 14 : isMobile ? 16 : 20} className="mr-2 text-orange-500" />
            Level Progress
          </h3>

          <div className={isMobileLandscape ? 'space-y-1.5' : isMobile ? 'space-y-2' : 'space-y-3'}>
            {module.levels.map((level: Level) => (
              <div
                key={level.id}
                className={`flex items-center justify-between bg-white rounded-lg shadow-sm border border-orange-100 hover:shadow-md transition-shadow duration-200 ${
                  isMobileLandscape ? 'p-1.5' : isMobile ? 'p-2' : 'p-4'
                }`}
              >
                <div className={`flex items-center ${
                  isMobileLandscape ? 'space-x-1.5' : isMobile ? 'space-x-2' : 'space-x-3'
                }`}>
                  {getScoreIcon(level.score)}
                  <div>
                    <h4 className={`font-medium text-gray-800 ${
                      isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-base'
                    }`}>
                      {level.name}
                    </h4>
                    <p className={`text-gray-500 ${
                      isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'
                    }`}>
                      Level {level.id}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className={`font-bold text-gray-600 ${
                    isMobileLandscape ? 'text-xs' : isMobile ? 'text-xs' : 'text-lg'
                  }`}>
                    {level.score > 0 ? 'Completed' : 'Not started'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
       {
        !isMobileLandscape && !isMobile &&
        <div className={`bg-gradient-to-r from-orange-100 to-amber-100 rounded-b-2xl border-t border-orange-200 ${
          isMobile ? 'px-3 py-3' : 'px-6 py-4'
        }`}>
          <div className="flex justify-between items-center">
            <div className={`text-gray-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Status: <span className="font-medium capitalize text-gray-800">{module.status}</span>
            </div>
            <button
              onClick={onClose}
              className={`bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors duration-200 shadow-sm hover:shadow-md ${
                isMobile ? 'px-3 py-1.5 text-sm' : 'px-4 py-2'
              }`}
            >
              Close
            </button>
          </div>
        </div>
        }
      </div>
    </div>
  );
};

export default ModuleDetailModal;