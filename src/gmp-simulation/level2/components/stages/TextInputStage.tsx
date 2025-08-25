import React, { useEffect, useRef } from 'react';
import { CheckCircle } from 'lucide-react';

interface TextInputStageProps {
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  isMobileHorizontal: boolean;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  shadowColor: string;
}

const TextInputStage: React.FC<TextInputStageProps> = ({
  title,
  description,
  value,
  onChange,
  isMobileHorizontal,
  icon: Icon,
  color,
  bgColor,
  borderColor,
  shadowColor
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Focus the textarea when the component mounts (stage changes)
  useEffect(() => {
    const focusTimeout = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
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
                <div className={`pixel-border-thick bg-gradient-to-br ${bgColor} ${isMobileHorizontal ? 'p-1' : 'p-2'} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                  <div className="relative z-10">
                    <div className={`flex items-center justify-center ${isMobileHorizontal ? 'space-x-0.5' : 'space-x-1'} ${isMobileHorizontal ? 'mb-1' : 'mb-2'}`}>
                      <div className={`pixel-border bg-gradient-to-br ${color} ${isMobileHorizontal ? 'p-0.5' : 'p-1.5'} relative overflow-hidden`}>
                        <Icon className={isMobileHorizontal ? 'w-4 h-4 text-white' : 'w-5 h-5 text-white'} />
                        <div className={`absolute inset-0 bg-gradient-to-br ${color} blur-sm opacity-50 -z-10`}></div>
                      </div>
                      <div>
                        <h2 className={`pixel-text ${isMobileHorizontal ? 'text-xs' : 'text-xl'} font-black text-white ${isMobileHorizontal ? 'mb-0' : 'mb-0.5'}`} style={{ textShadow: `1.5px 1.5px 0px rgba(0,0,0,0.7), 0 0 6px ${shadowColor}` }}>
                          {title}
                        </h2>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <p className={`pixel-text text-gray-300 font-bold ${isMobileHorizontal ? 'text-sm' : 'text-base'} mb-4 leading-relaxed`}>
                {description}
              </p>
              
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  className={`pixel-text w-full bg-gray-800/80 text-white font-semibold resize-none focus:outline-none transition-all duration-300 group-hover:bg-gray-800 ${isMobileHorizontal ? 'p-3 min-h-[80px] text-sm' : 'p-5 min-h-[120px] text-base'} border-2 focus:border-${borderColor} hover:border-${borderColor}`}
                  style={{ 
                    borderColor: value.length > 0 ? borderColor : '#6b7280',
                    fontFamily: 'Verdana, Geneva, Tahoma, sans-serif',
                    backgroundColor: value.length > 0 ? 'rgba(31, 41, 55, 0.9)' : 'rgba(31, 41, 55, 0.8)',
                    boxShadow: value.length > 0 ? `0 0 20px ${shadowColor}, inset 0 0 20px ${shadowColor}` : 'none'
                  }}
                  value={value}
                  onChange={e => onChange(e.target.value)}
                  placeholder=""
                />
                
                {/* Progress Indicator */}
                <div className="absolute top-2 right-2">
                  {value.length > 0 ? (
                    <div className="flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4 text-green-400" />
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
  );
};

export default TextInputStage;
