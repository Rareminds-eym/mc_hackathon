import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, Lightbulb } from 'lucide-react';

interface FillInBlanksStageProps {
  value: string;
  onChange: (value: string) => void;
  isMobileHorizontal: boolean;
}

const FillInBlanksStage: React.FC<FillInBlanksStageProps> = ({
  value,
  onChange,
  isMobileHorizontal
}) => {
  // Use ref to store the onChange function to avoid infinite loops
  const onChangeRef = useRef(onChange);
  const firstInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);
  
  // Parse the existing value into three parts
  const [parts, setParts] = useState(() => {
    if (value) {
      // Try to parse the existing format: "I want to solve X for Y by Z"
      const match = value.match(/I want to solve (.+) for (.+) by (.+)/);
      if (match) {
        return {
          what: match[1]?.trim() || '',
          who: match[2]?.trim() || '',
          how: match[3]?.trim() || ''
        };
      }
      // If it doesn't match the expected format, try to split by common separators
      const splitParts = value.split(/\s+for\s+|\s+by\s+/);
      if (splitParts.length === 3) {
        return {
          what: splitParts[0]?.replace('I want to solve ', '').trim() || '',
          who: splitParts[1]?.trim() || '',
          how: splitParts[2]?.trim() || ''
        };
      }
    }
    return { what: '', who: '', how: '' };
  });

  // Update the combined value whenever parts change
  useEffect(() => {
    if (parts.what || parts.who || parts.how) {
      const combinedValue = `I want to solve ${parts.what} for ${parts.who} by ${parts.how}`;
      onChangeRef.current(combinedValue);
    } else {
      onChangeRef.current('');
    }
  }, [parts]);

  const updatePart = (field: 'what' | 'who' | 'how', value: string) => {
    setParts(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const isComplete = parts.what.length > 0 && parts.who.length > 0 && parts.how.length > 0;
  const hasAnyContent = parts.what.length > 0 || parts.who.length > 0 || parts.how.length > 0;
  
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
                <div className={`pixel-border-thick bg-gradient-to-br from-amber-900/30 to-yellow-900/30 ${isMobileHorizontal ? 'p-1' : 'p-2'} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                  <div className="relative z-10">
                    <div className={`flex items-center justify-center ${isMobileHorizontal ? 'space-x-0.5' : 'space-x-1'} ${isMobileHorizontal ? 'mb-1' : 'mb-2'}`}>
                      <div className={`pixel-border bg-gradient-to-br from-amber-500 to-yellow-500 ${isMobileHorizontal ? 'p-0.5' : 'p-1.5'} relative overflow-hidden`}>
                        <Lightbulb className={isMobileHorizontal ? 'w-4 h-4 text-white' : 'w-5 h-5 text-white'} />
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-yellow-500 blur-sm opacity-50 -z-10"></div>
                      </div>
                      <div>
                        <h2 className={`pixel-text ${isMobileHorizontal ? 'text-xs' : 'text-xl'} font-black text-white ${isMobileHorizontal ? 'mb-0' : 'mb-0.5'}`} style={{ textShadow: '1.5px 1.5px 0px rgba(0,0,0,0.7), 0 0 6px rgba(245, 158, 11, 0.2)' }}>
                          YOUR INNOVATION IDEA
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className={`pixel-text text-gray-300 font-bold ${isMobileHorizontal ? 'text-sm' : 'text-base'} mb-4 leading-relaxed`}>
                Complete this sentence to define your innovation idea:
              </p>
              
              <div className={`space-y-4 ${isMobileHorizontal ? 'text-sm' : 'text-lg'}`}>
                {/* Fill-in-the-blanks sentence */}
                <div className="pixel-border bg-gray-800/50 p-4 relative">
                  <div className="flex flex-wrap items-center gap-2 pixel-text font-bold text-white">
                    <span>I want to solve</span>
                    <input
                      ref={firstInputRef}
                      type="text"
                      className={`pixel-border bg-gray-700/80 text-amber-300 font-semibold px-3 py-2 focus:outline-none focus:bg-gray-700 transition-all duration-300 ${isMobileHorizontal ? 'min-w-[150px] text-sm' : 'min-w-[250px] text-base'}`}
                      style={{ 
                        borderColor: parts.what.length > 0 ? '#f59e0b' : '#6b7280',
                        boxShadow: parts.what.length > 0 ? '0 0 10px rgba(245, 158, 11, 0.3)' : 'none'
                      }}
                      value={parts.what}
                      onChange={e => updatePart('what', e.target.value)}
                      placeholder="problem/need"
                    />
                    <span>for</span>
                    <input
                      type="text"
                      className={`pixel-border bg-gray-700/80 text-amber-300 font-semibold px-3 py-2 focus:outline-none focus:bg-gray-700 transition-all duration-300 ${isMobileHorizontal ? 'min-w-[150px] text-sm' : 'min-w-[220px] text-base'}`}
                      style={{ 
                        borderColor: parts.who.length > 0 ? '#f59e0b' : '#6b7280',
                        boxShadow: parts.who.length > 0 ? '0 0 10px rgba(245, 158, 11, 0.3)' : 'none'
                      }}
                      value={parts.who}
                      onChange={e => updatePart('who', e.target.value)}
                      placeholder="target audience"
                    />
                    <span>by</span>
                    <input
                      type="text"
                      className={`pixel-border bg-gray-700/80 text-amber-300 font-semibold px-3 py-2 focus:outline-none focus:bg-gray-700 transition-all duration-300 ${isMobileHorizontal ? 'min-w-[150px] text-sm' : 'min-w-[280px] text-base'}`}
                      style={{ 
                        borderColor: parts.how.length > 0 ? '#f59e0b' : '#6b7280',
                        boxShadow: parts.how.length > 0 ? '0 0 10px rgba(245, 158, 11, 0.3)' : 'none'
                      }}
                      value={parts.how}
                      onChange={e => updatePart('how', e.target.value)}
                      placeholder="solution method"
                    />
                  </div>
                </div>

                {/* Example */}
                <div className="pixel-border bg-yellow-900/20 p-3 relative">
                  <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                  <div className="relative z-10">
                    <p className={`pixel-text ${isMobileHorizontal ? 'text-xs' : 'text-sm'} text-yellow-300 font-bold mb-2`}>
                      💡 Example:
                    </p>
                    <p className={`pixel-text ${isMobileHorizontal ? 'text-xs' : 'text-sm'} text-yellow-200 italic`}>
                      "I want to solve <span className="font-bold text-amber-300">food waste in college cafeterias</span> for <span className="font-bold text-amber-300">students and cafeteria staff</span> by <span className="font-bold text-amber-300">creating an AI-powered demand prediction app</span>"
                    </p>
                  </div>
                </div>

                {/* Preview of completed statement */}
                {hasAnyContent && (
                  <div className="pixel-border bg-gray-800/30 p-3 relative">
                    <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                    <div className="relative z-10">
                      <p className={`pixel-text ${isMobileHorizontal ? 'text-xs' : 'text-sm'} text-gray-400 font-bold mb-2`}>
                        Your idea statement:
                      </p>
                      <p className={`pixel-text ${isMobileHorizontal ? 'text-sm' : 'text-base'} font-bold ${isComplete ? 'text-green-300' : 'text-gray-300'}`}>
                        "I want to solve {parts.what || '___'} for {parts.who || '___'} by {parts.how || '___'}"
                      </p>
                    </div>
                  </div>
                )}

                {/* Progress Indicator */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded border-2 ${parts.what.length > 0 ? 'bg-amber-500 border-amber-400' : 'border-gray-500'}`}></div>
                    <div className={`w-3 h-3 rounded border-2 ${parts.who.length > 0 ? 'bg-amber-500 border-amber-400' : 'border-gray-500'}`}></div>
                    <div className={`w-3 h-3 rounded border-2 ${parts.how.length > 0 ? 'bg-amber-500 border-amber-400' : 'border-gray-500'}`}></div>
                    <span className={`pixel-text ${isMobileHorizontal ? 'text-xs' : 'text-sm'} text-gray-400 font-bold ml-2`}>
                      {Object.values(parts).filter(p => p.length > 0).length}/3 completed
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

export default FillInBlanksStage;
