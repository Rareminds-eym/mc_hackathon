import React from 'react';
import { Factory, Users, FlaskConical, Settings, AlertTriangle, CheckCircle, Microscope, Shield, Thermometer } from 'lucide-react';

interface FacilityLayout2DProps {
  currentPhase: string;
  deviationArea?: 'production' | 'quality' | 'warehouse' | 'lab';
}

export const FacilityLayout2D: React.FC<FacilityLayout2DProps> = ({ 
  currentPhase, 
  deviationArea = 'production' 
}) => {
  const getAreaStatus = (area: string) => {
    if (area === deviationArea) return 'deviation';
    if (currentPhase === 'feedback') return 'resolved';
    return 'normal';
  };

  const getAreaColor = (status: string) => {
    switch (status) {
      case 'deviation': return 'border-red-500 bg-red-50 animate-pulse';
      case 'resolved': return 'border-green-500 bg-green-50';
      default: return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-gray-900 mb-4 text-center">Manufacturing Facility Layout</h3>
      
      <div className="relative w-full h-64 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-gray-200 overflow-hidden">
        {/* Production Area */}
        <div className={`absolute top-4 left-4 w-20 h-16 border-2 rounded-lg flex flex-col items-center justify-center ${getAreaColor(getAreaStatus('production'))}`}>
          <Factory className="w-6 h-6 text-gray-700 mb-1" />
          <span className="text-xs font-semibold">Production</span>
          {deviationArea === 'production' && (
            <AlertTriangle className="absolute -top-1 -right-1 w-4 h-4 text-red-500" />
          )}
        </div>

        {/* Quality Control Lab */}
        <div className={`absolute top-4 right-4 w-20 h-16 border-2 rounded-lg flex flex-col items-center justify-center ${getAreaColor(getAreaStatus('quality'))}`}>
          <FlaskConical className="w-6 h-6 text-gray-700 mb-1" />
          <span className="text-xs font-semibold">QC Lab</span>
          {deviationArea === 'quality' && (
            <AlertTriangle className="absolute -top-1 -right-1 w-4 h-4 text-red-500" />
          )}
        </div>

        {/* Warehouse */}
        <div className={`absolute bottom-4 left-4 w-20 h-16 border-2 rounded-lg flex flex-col items-center justify-center ${getAreaColor(getAreaStatus('warehouse'))}`}>
          <Shield className="w-6 h-6 text-gray-700 mb-1" />
          <span className="text-xs font-semibold">Warehouse</span>
          {deviationArea === 'warehouse' && (
            <AlertTriangle className="absolute -top-1 -right-1 w-4 h-4 text-red-500" />
          )}
        </div>

        {/* Cleanroom/Environmental */}
        <div className={`absolute bottom-4 right-4 w-20 h-16 border-2 rounded-lg flex flex-col items-center justify-center ${getAreaColor(getAreaStatus('lab'))}`}>
          <Thermometer className="w-6 h-6 text-gray-700 mb-1" />
          <span className="text-xs font-semibold">Cleanroom</span>
          {deviationArea === 'lab' && (
            <AlertTriangle className="absolute -top-1 -right-1 w-4 h-4 text-red-500" />
          )}
        </div>

        {/* Central Quality Office */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-blue-500 bg-blue-100 rounded-lg flex flex-col items-center justify-center">
          <Microscope className="w-6 h-6 text-blue-700 mb-1" />
          <span className="text-xs font-semibold text-blue-700">QA</span>
          {currentPhase === 'investigation' && (
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
          )}
        </div>

        {/* Personnel */}
        <div className="absolute top-12 left-28 w-4 h-4 bg-blue-400 rounded-full flex items-center justify-center">
          <Users className="w-3 h-3 text-white" />
        </div>
        <div className="absolute bottom-12 right-28 w-4 h-4 bg-green-400 rounded-full flex items-center justify-center">
          <Users className="w-3 h-3 text-white" />
        </div>

        {/* Equipment */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
          <Settings className="w-4 h-4 text-gray-500 animate-spin" />
        </div>

        {/* Flow arrows */}
        <div className="absolute top-12 left-16 w-8 h-0.5 bg-gray-400"></div>
        <div className="absolute top-12 left-23 w-0 h-0 border-l-2 border-l-gray-400 border-t-1 border-t-transparent border-b-1 border-b-transparent"></div>
        
        {/* Status indicator */}
        <div className="absolute top-2 left-2">
          {currentPhase === 'feedback' ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : deviationArea ? (
            <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
          ) : (
            <CheckCircle className="w-5 h-5 text-blue-500" />
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center space-x-4 mt-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-red-50 border border-red-500 rounded"></div>
          <span>Deviation Area</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-100 border border-blue-500 rounded"></div>
          <span>Investigation Active</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-50 border border-green-500 rounded"></div>
          <span>Resolved</span>
        </div>
      </div>
    </div>
  );
};
