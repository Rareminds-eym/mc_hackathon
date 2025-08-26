import React from 'react';
import { Target, Zap, Users, Sparkles, Rocket, Globe, Lightbulb } from 'lucide-react';
import { StageContentProps } from '../types';
import TextInputStage from './stages/TextInputStage';
import FinalStatementStage from './stages/FinalStatementStage';
import PrototypeStage from './stages/PrototypeStage';
import FillInBlanksStage from './stages/FillInBlanksStage';

const StageContent: React.FC<StageContentProps> = ({ 
  stage, 
  formData, 
  onFormDataChange, 
  isMobileHorizontal, 
  isAnimating,
  prototypeStageRef
}) => {
  const handleTextChange = (field: keyof typeof formData) => (value: string) => {
    onFormDataChange(field, value);
  };

  const renderStage = () => {
    switch (stage) {
      case 1:
        return (
          <FillInBlanksStage
            value={formData.ideaStatement}
            onChange={handleTextChange('ideaStatement')}
            isMobileHorizontal={isMobileHorizontal}
          />
        );

      case 2:
        return (
          <TextInputStage
            title="PROBLEM YOU ARE SOLVING"
            description="What issue or need are you addressing? Who faces this problem?"
            value={formData.problem}
            onChange={handleTextChange('problem')}
            isMobileHorizontal={isMobileHorizontal}
            icon={Target}
            color="from-red-500 to-pink-500"
            bgColor="from-red-900/30 to-pink-900/30"
            borderColor="#ef4444"
            shadowColor="rgba(239, 68, 68, 0.2)"
          />
        );

      case 3:
        return (
          <TextInputStage
            title="TECHNOLOGY YOU CAN USE"
            description="What tool, app, software, machine, or digital aid can make your solution stronger?"
            value={formData.technology}
            onChange={handleTextChange('technology')}
            isMobileHorizontal={isMobileHorizontal}
            icon={Zap}
            color="from-blue-500 to-cyan-500"
            bgColor="from-blue-900/30 to-cyan-900/30"
            borderColor="#3b82f6"
            shadowColor="rgba(59, 130, 246, 0.2)"
          />
        );

      case 4:
        return (
          <TextInputStage
            title="COLLABORATION ANGLE"
            description="Who can you team up with (friends, other departments, communities) to make this idea bigger?"
            value={formData.collaboration}
            onChange={handleTextChange('collaboration')}
            isMobileHorizontal={isMobileHorizontal}
            icon={Users}
            color="from-green-500 to-emerald-500"
            bgColor="from-green-900/30 to-emerald-900/30"
            borderColor="#10b981"
            shadowColor="rgba(16, 185, 129, 0.2)"
          />
        );

      case 5:
        return (
          <TextInputStage
            title="CREATIVITY TWIST"
            description="What unique feature, design, or new approach makes your idea stand out?"
            value={formData.creativity}
            onChange={handleTextChange('creativity')}
            isMobileHorizontal={isMobileHorizontal}
            icon={Sparkles}
            color="from-purple-500 to-violet-500"
            bgColor="from-purple-900/30 to-violet-900/30"
            borderColor="#a855f7"
            shadowColor="rgba(168, 85, 247, 0.2)"
          />
        );

      case 6:
        return (
          <TextInputStage
            title="SPEED & SCALE"
            description="How can your solution be applied quickly? Can it be scaled to help many people (beyond your college/community)?"
            value={formData.speedScale}
            onChange={handleTextChange('speedScale')}
            isMobileHorizontal={isMobileHorizontal}
            icon={Rocket}
            color="from-orange-500 to-red-500"
            bgColor="from-orange-900/30 to-red-900/30"
            borderColor="#f97316"
            shadowColor="rgba(249, 115, 22, 0.2)"
          />
        );

      case 7:
        return (
          <TextInputStage
            title="PURPOSE & IMPACT"
            description="How does your idea create value? (Social, environmental, educational, or economic impact?)"
            value={formData.impact}
            onChange={handleTextChange('impact')}
            isMobileHorizontal={isMobileHorizontal}
            icon={Globe}
            color="from-teal-500 to-cyan-500"
            bgColor="from-teal-900/30 to-cyan-900/30"
            borderColor="#14b8a6"
            shadowColor="rgba(20, 184, 166, 0.2)"
          />
        );

      case 8:
        return <FinalStatementStage formData={formData} onFormDataChange={onFormDataChange} isMobileHorizontal={isMobileHorizontal} />;

      case 9:
        return <PrototypeStage ref={prototypeStageRef} formData={formData} onFormDataChange={onFormDataChange} isMobileHorizontal={isMobileHorizontal} />;

      case 10:
        return (
          <TextInputStage
            title="REFLECTION"
            description="(what did you learn, what would you improve?)."
            value={formData.reflection}
            onChange={handleTextChange('reflection')}
            isMobileHorizontal={isMobileHorizontal}
            icon={Lightbulb}
            color="from-yellow-500 to-amber-500"
            bgColor="from-yellow-900/30 to-amber-900/30"
            borderColor="#f59e0b"
            shadowColor="rgba(245, 158, 11, 0.2)"
          />
        );

      default:
        return null;
    }
  };

  return (
    <div 
      className={`pixel-border-thick bg-gray-800 relative ${isMobileHorizontal ? 'p-1 mb-1' : 'p-6 mb-6'}`}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 8px,
            rgba(0,255,255,0.1) 8px,
            rgba(0,255,255,0.1) 16px
          )`
        }}></div>
      </div>
      
      <div className={`relative z-10 ${isMobileHorizontal ? 'space-y-2' : ''} ${isAnimating ? 'opacity-50 pointer-events-none' : ''} transition-all duration-300`}>
        {renderStage()}
      </div>
    </div>
  );
};

export default StageContent;
