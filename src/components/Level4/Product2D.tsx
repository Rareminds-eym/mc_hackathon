import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Settings, Zap, ThermometerSun, Shield, Target } from 'lucide-react';

interface Product2DProps {
  productName: string;
  batchNumber: string;
  hasDeviation: boolean;
  deviationType?: 'cleaning' | 'calibration' | 'environmental';
  isCompleted?: boolean;
}

export const Product2D: React.FC<Product2DProps> = ({
  productName,
  batchNumber,
  hasDeviation,
  deviationType,
  isCompleted = false
}) => {
  const getDeviationIcon = () => {
    switch (deviationType) {
      case 'cleaning':
        return <Settings className="w-4 h-4 text-red-500" />;
      case 'calibration':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'environmental':
        return <ThermometerSun className="w-4 h-4 text-orange-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
    }
  };
  const getStatusIndicator = () => {
    if (isCompleted) {
      return (
        <div className="absolute top-1 right-1 w-5 h-5 md:w-6 md:h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce-subtle">
          <CheckCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
        </div>
      );
    }
    if (hasDeviation) {
      return (
        <div className="absolute top-1 right-1 w-5 h-5 md:w-6 md:h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
          <XCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
        </div>      );
    }
    return null;
  };
  return (
    <div className="w-full max-w-[80px] sm:max-w-[100px] mx-auto pt-1">
      <div className="w-full flex flex-col items-center justify-center h-full overflow-visible flex-shrink-0 flex-grow-0">
      
        {/* Product Information */}
        <div className="text-center mt-1 w-full flex flex-col items-center">
        <div className="relative w-full flex items-center justify-center h-[48px]">
            <img
              src="/background.png"
              alt={productName}
              className="w-[60%] h-auto object-cover rounded-lg"
            />
          </div>
          <h3 className="text-xs font-semibold text-gray-800">{productName}</h3>
          <p className="text-[9px] text-gray-600">Batch: {batchNumber}</p>
          <div className="mt-1">
            <span className="inline-flex items-center px-1 py-0.5 rounded-full text-[8px] font-medium bg-red-100 text-red-800 animate-pulse whitespace-nowrap">
              <AlertTriangle className="w-3 h-3 mr-1" />Deviation Detected
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
