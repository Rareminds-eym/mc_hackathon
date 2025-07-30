// src/components/l3/components/PerformanceTest.tsx

import React, { useEffect, useState } from 'react';

/**
 * Simple performance test component to verify render optimization
 */
export const PerformanceTest: React.FC = () => {
  const [renderCount, setRenderCount] = useState(0);
  const [startTime] = useState(Date.now());

  // Count renders
  useEffect(() => {
    setRenderCount(prev => prev + 1);
  });

  const uptime = ((Date.now() - startTime) / 1000).toFixed(1);
  const rendersPerSecond = (renderCount / parseFloat(uptime)).toFixed(1);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50 bg-red-900/90 text-white p-3 rounded text-sm font-mono">
      <div className="font-bold text-yellow-300 mb-1">Performance Test</div>
      <div>Renders: {renderCount}</div>
      <div>Uptime: {uptime}s</div>
      <div>Rate: {rendersPerSecond}/s</div>
      {parseFloat(rendersPerSecond) > 10 && (
        <div className="text-red-300 mt-1">⚠️ High render rate!</div>
      )}
      {renderCount > 1000 && (
        <div className="text-red-300 mt-1">🚨 Excessive renders!</div>
      )}
    </div>
  );
};
