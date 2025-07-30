// src/components/l3/components/PerformanceMonitor.tsx

import React, { useEffect, useState, useRef } from 'react';

interface PerformanceStats {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  memoryUsage?: number;
}

/**
 * Performance monitoring component for debugging render issues
 */
export const PerformanceMonitor: React.FC<{ componentName?: string }> = ({ 
  componentName = 'Component' 
}) => {
  const [stats, setStats] = useState<PerformanceStats>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
  });
  
  const renderStartTime = useRef<number>(0);
  const renderTimes = useRef<number[]>([]);
  const mountTime = useRef<number>(Date.now());

  // Track render start
  renderStartTime.current = performance.now();

  useEffect(() => {
    // Track render end
    const renderEndTime = performance.now();
    const renderDuration = renderEndTime - renderStartTime.current;
    
    // Update render times array (keep last 10 renders)
    renderTimes.current.push(renderDuration);
    if (renderTimes.current.length > 10) {
      renderTimes.current.shift();
    }
    
    // Calculate average
    const averageRenderTime = renderTimes.current.reduce((sum, time) => sum + time, 0) / renderTimes.current.length;
    
    // Get memory usage if available
    let memoryUsage: number | undefined;
    if ('memory' in performance) {
      memoryUsage = (performance as any).memory.usedJSHeapSize / 1024 / 1024; // MB
    }
    
    setStats(prev => ({
      renderCount: prev.renderCount + 1,
      lastRenderTime: renderDuration,
      averageRenderTime,
      memoryUsage,
    }));
    
    // Log performance warnings
    if (renderDuration > 16) { // More than 16ms (60fps threshold)
      console.warn(`🐌 Slow render detected in ${componentName}:`, {
        renderTime: `${renderDuration.toFixed(2)}ms`,
        renderCount: stats.renderCount + 1,
        averageTime: `${averageRenderTime.toFixed(2)}ms`,
      });
    }
  });

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const uptime = ((Date.now() - mountTime.current) / 1000).toFixed(1);

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white p-2 rounded text-xs font-mono max-w-xs">
      <div className="font-bold text-yellow-300 mb-1">{componentName} Performance</div>
      <div>Renders: {stats.renderCount}</div>
      <div>Last: {stats.lastRenderTime.toFixed(2)}ms</div>
      <div>Avg: {stats.averageRenderTime.toFixed(2)}ms</div>
      <div>Uptime: {uptime}s</div>
      {stats.memoryUsage && (
        <div>Memory: {stats.memoryUsage.toFixed(1)}MB</div>
      )}
      {stats.lastRenderTime > 16 && (
        <div className="text-red-400 mt-1">⚠️ Slow render!</div>
      )}
      {stats.renderCount > 100 && (
        <div className="text-orange-400 mt-1">⚠️ High render count!</div>
      )}
    </div>
  );
};
