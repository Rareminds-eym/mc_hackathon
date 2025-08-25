import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, FileText, Star } from 'lucide-react';
import { StageProps } from '../../types';

const FinalStatementStage: React.FC<StageProps> = ({ formData, onFormDataChange, isMobileHorizontal }) => {
  // Use ref to store the onChange function to avoid infinite loops
  const onChangeRef = useRef(onFormDataChange);
  const firstInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    onChangeRef.current = onFormDataChange;
  }, [onFormDataChange]);
  
  // Parse the existing values into separate parts
  const [parts, setParts] = useState(() => {
    return {
      problem: formData.finalProblem || '',
      technology: formData.finalTechnology || '',
      collaboration: formData.finalCollaboration || '',
      creativity: formData.finalCreativity || '',
      speedScale: formData.finalSpeedScale || '',
      impact: formData.finalImpact || ''
    };
  });

  // Update individual form data fields whenever parts change
  useEffect(() => {
    if (onChangeRef.current) {
      onChangeRef.current('finalProblem', parts.problem);
      onChangeRef.current('finalTechnology', parts.technology);
      onChangeRef.current('finalCollaboration', parts.collaboration);
      onChangeRef.current('finalCreativity', parts.creativity);
      onChangeRef.current('finalSpeedScale', parts.speedScale);
      onChangeRef.current('finalImpact', parts.impact);
    }
  }, [parts]);

  const updatePart = (field: keyof typeof parts, value: string) => {
    setParts(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isComplete = parts.problem.length > 0 && parts.technology.length > 0 && 
                    parts.collaboration.length > 0 && parts.creativity.length > 0 && 
                    parts.speedScale.length > 0 && parts.impact.length > 0;
  const hasAnyContent = Object.values(parts).some(part => part.length > 0);
  const completedCount = Object.values(parts).filter(part => part.length > 0).length;
  
  // Focus the first input when the component mounts (stage changes)
  useEffect(() => {
    const focusTimeout = setTimeout(() => {
      if (firstInputRef.current) {
        firstInputRef.current.focus();
      }
    }, 100); // Small delay to ensure the component is fully rendered
    
    return () => clearTimeout(focusTimeout);
  }, []); // Empty dependency array means this runs once when component mounts

  return (
    <div className={`${isMobileHorizontal ? 'space-y-0.5' : 'space-y-2'} animate-fadeIn`}>
      <div className="space-y-6">
        <div className="group">
          <div className="pixel-border-thick bg-gray-900/50 p-4 relative overflow-hidden group-hover:bg-gray-900/70 transition-all duration-300">
            <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
            <div className="relative z-10">
              {/* Stage Header moved inside */}
              <div className={`text-center ${isMobileHorizontal ? 'mb-2' : 'mb-4'}`}>
                <div className={`pixel-border-thick bg-gradient-to-br from-indigo-900/30 to-purple-900/30 ${isMobileHorizontal ? 'p-1' : 'p-2'} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                  <div className="relative z-10">
                    <div className={`flex items-center justify-center ${isMobileHorizontal ? 'space-x-0.5' : 'space-x-1'} ${isMobileHorizontal ? 'mb-1' : 'mb-2'}`}>
                      <div className={`pixel-border bg-gradient-to-br from-indigo-500 to-purple-500 ${isMobileHorizontal ? 'p-0.5' : 'p-1.5'} relative overflow-hidden`}>
                        <FileText className={isMobileHorizontal ? 'w-4 h-4 text-white' : 'w-5 h-5 text-white'} />
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 blur-sm opacity-50 -z-10"></div>
                      </div>
                      <div>
                        <h2 className={`pixel-text ${isMobileHorizontal ? 'text-xs' : 'text-xl'} font-black text-white ${isMobileHorizontal ? 'mb-0' : 'mb-0.5'}`} style={{ textShadow: '1.5px 1.5px 0px rgba(0,0,0,0.7), 0 0 6px rgba(99, 102, 241, 0.2)' }}>
                          FINAL STATEMENT
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className={`pixel-text text-gray-300 font-bold ${isMobileHorizontal ? 'text-sm' : 'text-base'} mb-4 leading-relaxed`}>
                Combine all your ideas into one powerful final statement:
              </p>
              
              <div className={`space-y-4 ${isMobileHorizontal ? 'text-sm' : 'text-lg'}`}>
                {/* Fill-in-the-blanks sentence */}
                <div className="pixel-border bg-gray-800/50 p-4 relative">
                  <div className="flex flex-wrap items-center gap-2 pixel-text font-bold text-white">
                    <span className="text-indigo-300">"Our innovation solves</span>
                    <input
                      ref={firstInputRef}
                      type="text"
                      className={`pixel-border bg-red-700/80 text-red-300 font-semibold px-3 py-2 focus:outline-none focus:bg-red-700 transition-all duration-300 ${isMobileHorizontal ? 'min-w-[180px] text-sm' : 'min-w-[280px] text-base'}`}
                      style={{ 
                        borderColor: parts.problem.length > 0 ? '#ef4444' : '#6b7280',
                        boxShadow: parts.problem.length > 0 ? '0 0 10px rgba(239, 68, 68, 0.3)' : 'none'
                      }}
                      value={parts.problem}
                      onChange={e => updatePart('problem', e.target.value)}
                      placeholder="problem/need"
                    />
                    <span className="text-indigo-300">by using</span>
                    <input
                      type="text"
                      className={`pixel-border bg-blue-700/80 text-blue-300 font-semibold px-3 py-2 focus:outline-none focus:bg-blue-700 transition-all duration-300 ${isMobileHorizontal ? 'min-w-[160px] text-sm' : 'min-w-[240px] text-base'}`}
                      style={{ 
                        borderColor: parts.technology.length > 0 ? '#3b82f6' : '#6b7280',
                        boxShadow: parts.technology.length > 0 ? '0 0 10px rgba(59, 130, 246, 0.3)' : 'none'
                      }}
                      value={parts.technology}
                      onChange={e => updatePart('technology', e.target.value)}
                      placeholder="technology"
                    />
                    <span className="text-indigo-300">, built with</span>
                    <input
                      type="text"
                      className={`pixel-border bg-green-700/80 text-green-300 font-semibold px-3 py-2 focus:outline-none focus:bg-green-700 transition-all duration-300 ${isMobileHorizontal ? 'min-w-[160px] text-sm' : 'min-w-[260px] text-base'}`}
                      style={{ 
                        borderColor: parts.collaboration.length > 0 ? '#10b981' : '#6b7280',
                        boxShadow: parts.collaboration.length > 0 ? '0 0 10px rgba(16, 185, 129, 0.3)' : 'none'
                      }}
                      value={parts.collaboration}
                      onChange={e => updatePart('collaboration', e.target.value)}
                      placeholder="collaboration"
                    />
                    <span className="text-indigo-300">, adding</span>
                    <input
                      type="text"
                      className={`pixel-border bg-purple-700/80 text-purple-300 font-semibold px-3 py-2 focus:outline-none focus:bg-purple-700 transition-all duration-300 ${isMobileHorizontal ? 'min-w-[160px] text-sm' : 'min-w-[240px] text-base'}`}
                      style={{ 
                        borderColor: parts.creativity.length > 0 ? '#a855f7' : '#6b7280',
                        boxShadow: parts.creativity.length > 0 ? '0 0 10px rgba(168, 85, 247, 0.3)' : 'none'
                      }}
                      value={parts.creativity}
                      onChange={e => updatePart('creativity', e.target.value)}
                      placeholder="creative twist"
                    />
                    <span className="text-indigo-300">. It can grow with</span>
                    <input
                      type="text"
                      className={`pixel-border bg-orange-700/80 text-orange-300 font-semibold px-3 py-2 focus:outline-none focus:bg-orange-700 transition-all duration-300 ${isMobileHorizontal ? 'min-w-[160px] text-sm' : 'min-w-[250px] text-base'}`}
                      style={{ 
                        borderColor: parts.speedScale.length > 0 ? '#f97316' : '#6b7280',
                        boxShadow: parts.speedScale.length > 0 ? '0 0 10px rgba(249, 115, 22, 0.3)' : 'none'
                      }}
                      value={parts.speedScale}
                      onChange={e => updatePart('speedScale', e.target.value)}
                      placeholder="speed & scale"
                    />
                    <span className="text-indigo-300">and will create</span>
                    <input
                      type="text"
                      className={`pixel-border bg-teal-700/80 text-teal-300 font-semibold px-3 py-2 focus:outline-none focus:bg-teal-700 transition-all duration-300 ${isMobileHorizontal ? 'min-w-[160px] text-sm' : 'min-w-[260px] text-base'}`}
                      style={{ 
                        borderColor: parts.impact.length > 0 ? '#14b8a6' : '#6b7280',
                        boxShadow: parts.impact.length > 0 ? '0 0 10px rgba(20, 184, 166, 0.3)' : 'none'
                      }}
                      value={parts.impact}
                      onChange={e => updatePart('impact', e.target.value)}
                      placeholder="purpose/impact"
                    />
                    <span className="text-indigo-300">."</span>
                  </div>
                </div>

                {/* Example */}
                <div className="pixel-border bg-indigo-900/20 p-3 relative">
                  <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                  <div className="relative z-10">
                    <p className={`pixel-text ${isMobileHorizontal ? 'text-xs' : 'text-sm'} text-indigo-300 font-bold mb-2`}>
                      ✨ Example:
                    </p>
                    <p className={`pixel-text ${isMobileHorizontal ? 'text-xs' : 'text-sm'} text-indigo-200 italic`}>
                      "Our innovation solves <span className="font-bold text-red-300">food waste in college cafeterias</span> by using <span className="font-bold text-blue-300">AI-powered demand prediction</span>, built with <span className="font-bold text-green-300">student volunteers and cafeteria staff</span>, adding <span className="font-bold text-purple-300">gamification and rewards</span>. It can grow with <span className="font-bold text-orange-300">campus-wide deployment and cloud scaling</span> and will create <span className="font-bold text-teal-300">environmental impact and cost savings</span>."
                    </p>
                  </div>
                </div>

                {/* Preview of completed statement */}
                {hasAnyContent && (
                  <div className="pixel-border bg-gray-800/30 p-3 relative">
                    <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                    <div className="relative z-10">
                      <p className={`pixel-text ${isMobileHorizontal ? 'text-xs' : 'text-sm'} text-gray-400 font-bold mb-2 flex items-center gap-2`}>
                        <Star className="w-4 h-4 text-yellow-400" />
                        Your final statement:
                      </p>
                      <p className={`pixel-text ${isMobileHorizontal ? 'text-sm' : 'text-base'} font-bold ${isComplete ? 'text-indigo-200' : 'text-gray-300'}`}>
                        "Our innovation solves {parts.problem || '___'} by using {parts.technology || '___'}, built with {parts.collaboration || '___'}, adding {parts.creativity || '___'}. It can grow with {parts.speedScale || '___'} and will create {parts.impact || '___'}."
                      </p>
                    </div>
                  </div>
                )}

                {/* Progress Indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded border-2 ${parts.problem.length > 0 ? 'bg-red-500 border-red-400' : 'border-gray-500'}`}></div>
                    <div className={`w-3 h-3 rounded border-2 ${parts.technology.length > 0 ? 'bg-blue-500 border-blue-400' : 'border-gray-500'}`}></div>
                    <div className={`w-3 h-3 rounded border-2 ${parts.collaboration.length > 0 ? 'bg-green-500 border-green-400' : 'border-gray-500'}`}></div>
                    <div className={`w-3 h-3 rounded border-2 ${parts.creativity.length > 0 ? 'bg-purple-500 border-purple-400' : 'border-gray-500'}`}></div>
                    <div className={`w-3 h-3 rounded border-2 ${parts.speedScale.length > 0 ? 'bg-orange-500 border-orange-400' : 'border-gray-500'}`}></div>
                    <div className={`w-3 h-3 rounded border-2 ${parts.impact.length > 0 ? 'bg-teal-500 border-teal-400' : 'border-gray-500'}`}></div>
                    <span className={`pixel-text ${isMobileHorizontal ? 'text-xs' : 'text-sm'} text-gray-400 font-bold ml-2`}>
                      {completedCount}/6 completed
                    </span>
                  </div>
                  
                  <div>
                    {isComplete ? (
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className={`pixel-text ${isMobileHorizontal ? 'text-xs' : 'text-sm'} text-green-400 font-bold`}>
                          Complete!
                        </span>
                      </div>
                    ) : (
                      <div className="w-3 h-3 border-2 border-gray-500 animate-pulse"></div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinalStatementStage;
