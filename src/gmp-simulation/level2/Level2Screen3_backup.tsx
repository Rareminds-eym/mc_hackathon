import React, { useState, useEffect } from 'react';
import { useDeviceLayout } from '../../hooks/useOrientation';
import { Lightbulb, Users, Zap, Target, Rocket, Globe, FileText, Sparkles, Upload } from 'lucide-react';
import { StageData, StageFormData } from './types';
import Header from './components/Header';
import ProgressTrack from './components/ProgressTrack';
import StageContent from './components/StageContent';
import NavigationBar from './components/NavigationBar';
import ConfirmationModal from './components/ConfirmationModal';

const Level2Screen3: React.FC = () => {
  const [stage, setStage] = useState(1);
  const [showProceedWarning, setShowProceedWarning] = useState(false);
  const [formData, setFormData] = useState<StageFormData>({
    problem: '',
    technology: '',
    collaboration: '',
    creativity: '',
    speedScale: '',
    impact: '',
    reflection: '',
    file: null
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;

  // Calculate progress based on completed stages
  useEffect(() => {
    let completed = 0;
    for (let i = 1; i <= 9; i++) {
      if (isStageComplete(i)) completed++;
    }
    setProgress((completed / 9) * 100);
  }, [formData]);

  const handleFormDataChange = (field: keyof StageFormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const stages: StageData[] = [
    { 
      icon: Target, 
      title: "Problem", 
      subtitle: "Identify",
      color: "from-red-500 to-pink-500", 
      bgColor: "from-red-900/20 to-pink-900/20",
      accent: "red",
      description: "Define the core issue you're solving"
    },
    { 
      icon: Zap, 
      title: "Technology", 
      subtitle: "Amplify",
      color: "from-blue-500 to-cyan-500", 
      bgColor: "from-blue-900/20 to-cyan-900/20",
      accent: "blue",
      description: "Choose your tech stack wisely"
    },
    { 
      icon: Users, 
      title: "Collaboration", 
      subtitle: "Unite",
      color: "from-green-500 to-emerald-500", 
      bgColor: "from-green-900/20 to-emerald-900/20",
      accent: "green",
      description: "Build strategic partnerships"
    },
    { 
      icon: Sparkles, 
      title: "Creativity", 
      subtitle: "Innovate",
      color: "from-purple-500 to-violet-500", 
      bgColor: "from-purple-900/20 to-violet-900/20",
      accent: "purple",
      description: "Add your unique twist"
    },
    { 
      icon: Rocket, 
      title: "Speed & Scale", 
      subtitle: "Deploy",
      color: "from-orange-500 to-red-500", 
      bgColor: "from-orange-900/20 to-red-900/20",
      accent: "orange",
      description: "Plan for rapid growth"
    },
    { 
      icon: Globe, 
      title: "Purpose & Impact", 
      subtitle: "Transform",
      color: "from-teal-500 to-cyan-500", 
      bgColor: "from-teal-900/20 to-cyan-900/20",
      accent: "teal",
      description: "Measure meaningful change"
    },
    { 
      icon: FileText, 
      title: "Mission Statement", 
      subtitle: "Synthesize",
      color: "from-indigo-500 to-purple-500", 
      bgColor: "from-indigo-900/20 to-purple-900/20",
      accent: "indigo",
      description: "Craft your innovation story"
    },
    { 
      icon: Upload, 
      title: "Prototype", 
      subtitle: "Demonstrate",
      color: "from-gray-500 to-slate-500", 
      bgColor: "from-gray-900/20 to-slate-900/20",
      accent: "gray",
      description: "Optional: Show your solution in action"
    },
    { 
      icon: Lightbulb, 
      title: "Reflection", 
      subtitle: "Learn",
      color: "from-yellow-500 to-amber-500", 
      bgColor: "from-yellow-900/20 to-amber-900/20",
      accent: "yellow",
      description: "Document your journey"
    }
  ];

  const currentStageData = stages[stage - 1];


  const isStageComplete = (stageNum: number) => {
    switch(stageNum) {
      case 1: return formData.problem.length > 0;
      case 2: return formData.technology.length > 0;
      case 3: return formData.collaboration.length > 0;
      case 4: return formData.creativity.length > 0;
      case 5: return formData.speedScale.length > 0;
      case 6: return formData.impact.length > 0;
      case 7: return true; // Final statement is always complete
      case 8: return true; // Prototype/Demo/Sketch is optional
      case 9: return formData.reflection.length > 0;
      default: return false;
    }
  };

  const canProceed = isStageComplete(stage);

  const handleProceed = () => {
    if (canProceed && stage !== 9) {
      setShowProceedWarning(true);
    }
  };

  const handleConfirmProceed = () => {
    setShowProceedWarning(false);
    setStage(stage + 1);
  };

  return (
  <div
    className={`min-h-screen bg-gray-800 relative flex flex-col${isMobileHorizontal ? ' compact-mobile-horizontal' : ''}`}
    style={{ fontFamily: 'Verdana, Geneva, Tahoma, sans-serif' }}
  >
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-pixel-pattern opacity-10"></div>
      <div className="fixed inset-0 bg-scan-lines opacity-20"></div>
      
  <div
    className={`relative z-10 max-w-6xl mx-auto flex flex-col w-full ${isMobileHorizontal ? 'px-0 py-1 pb-20' : 'px-1 xs:px-2 sm:px-4 py-2 xs:py-3 sm:py-6 pb-24'}`}
  >
        {/* Header */}
        <Header 
          currentStageData={currentStageData}
          progress={progress}
          isMobileHorizontal={isMobileHorizontal}
        />



        {/* Progress Track */}
        <ProgressTrack 
          stages={stages}
          currentStage={stage}
          isStageComplete={isStageComplete}
          onStageClick={setStage}
          progress={progress}
          isMobileHorizontal={isMobileHorizontal}
          isAnimating={isAnimating}
          setIsAnimating={setIsAnimating}
        />

        {/* Stage Content */}
        <StageContent 
          stage={stage}
          formData={formData}
          onFormDataChange={handleFormDataChange}
          isMobileHorizontal={isMobileHorizontal}
          isAnimating={isAnimating}
        />
            {stage === 1 && (
              <div className={`${isMobileHorizontal ? 'space-y-3' : 'space-y-8'} animate-fadeIn`}>
                <div className={`text-center ${isMobileHorizontal ? 'mb-3' : 'mb-8'}`}>
                  <div className="pixel-border-thick bg-gradient-to-br from-red-900/30 to-pink-900/30 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="pixel-border bg-gradient-to-br from-red-500 to-pink-500 p-3 relative overflow-hidden">
                          <Target className="w-8 h-8 text-white" />
                          <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-pink-500 blur-sm opacity-50 -z-10"></div>
                        </div>
                        <div>
                          <h2 className={`pixel-text ${isMobileHorizontal ? 'text-xl' : 'text-4xl'} font-black text-white mb-1`} style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.7), 0 0 20px rgba(239,68,68,0.3)' }}>
                            PROBLEM YOU ARE SOLVING
                          </h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="group">
                    <div className="pixel-border-thick bg-gray-900/50 p-4 relative overflow-hidden group-hover:bg-gray-900/70 transition-all duration-300">
                      <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                      <div className="relative z-10">
                        <p className={`pixel-text text-gray-300 font-bold ${isMobileHorizontal ? 'text-sm' : 'text-base'} mb-4 leading-relaxed`}>
                          What issue or need are you addressing?<br/>
                          Who faces this problem?
                        </p>
                        
                        <div className="relative">
                          <textarea
                            className={`pixel-text w-full bg-gray-800/80 text-white font-semibold resize-none focus:outline-none transition-all duration-300 group-hover:bg-gray-800 ${isMobileHorizontal ? 'p-3 min-h-[80px] text-sm' : 'p-5 min-h-[120px] text-base'} border-2 focus:border-red-400 hover:border-red-500`}
                            style={{ 
                              borderColor: problem.length > 0 ? '#ef4444' : '#6b7280',
                              fontFamily: 'Verdana, Geneva, Tahoma, sans-serif',
                              backgroundColor: problem.length > 0 ? 'rgba(31, 41, 55, 0.9)' : 'rgba(31, 41, 55, 0.8)',
                              boxShadow: problem.length > 0 ? '0 0 20px rgba(239, 68, 68, 0.2), inset 0 0 20px rgba(239, 68, 68, 0.1)' : 'none'
                            }}
                            value={problem}
                            onChange={e => setProblem(e.target.value)}
                            placeholder=""
                          />
                          
                          {/* Progress Indicator */}
                          <div className="absolute top-2 right-2">
                            {problem.length > 0 ? (
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
            )}

            {stage === 2 && (
              <div className={`${isMobileHorizontal ? 'space-y-3' : 'space-y-8'} animate-fadeIn`}>
                <div className={`text-center ${isMobileHorizontal ? 'mb-3' : 'mb-8'}`}>
                  <div className="pixel-border-thick bg-gradient-to-br from-blue-900/30 to-cyan-900/30 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="pixel-border bg-gradient-to-br from-blue-500 to-cyan-500 p-3 relative overflow-hidden">
                          <Zap className="w-8 h-8 text-white" />
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 blur-sm opacity-50 -z-10"></div>
                        </div>
                        <div>
                          <h2 className={`pixel-text ${isMobileHorizontal ? 'text-xl' : 'text-4xl'} font-black text-white mb-1`} style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.7), 0 0 20px rgba(59,130,246,0.3)' }}>
                            TECHNOLOGY YOU CAN USE
                          </h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="group">
                    <div className="pixel-border-thick bg-gray-900/50 p-4 relative overflow-hidden group-hover:bg-gray-900/70 transition-all duration-300">
                      <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                      <div className="relative z-10">
                        <p className={`pixel-text text-gray-300 font-bold ${isMobileHorizontal ? 'text-sm' : 'text-base'} mb-4 leading-relaxed`}>
                          What tool, app, software, machine, or digital aid can make your solution stronger?
                        </p>
                        
                        <div className="relative">
                          <textarea
                            className={`pixel-text w-full bg-gray-800/80 text-white font-semibold resize-none focus:outline-none transition-all duration-300 group-hover:bg-gray-800 ${isMobileHorizontal ? 'p-3 min-h-[80px] text-sm' : 'p-5 min-h-[120px] text-base'} border-2 focus:border-blue-400 hover:border-blue-500`}
                            style={{ 
                              borderColor: technology.length > 0 ? '#3b82f6' : '#6b7280',
                              fontFamily: 'Verdana, Geneva, Tahoma, sans-serif',
                              backgroundColor: technology.length > 0 ? 'rgba(31, 41, 55, 0.9)' : 'rgba(31, 41, 55, 0.8)',
                              boxShadow: technology.length > 0 ? '0 0 20px rgba(59, 130, 246, 0.2), inset 0 0 20px rgba(59, 130, 246, 0.1)' : 'none'
                            }}
                            value={technology}
                            onChange={e => setTechnology(e.target.value)}
                            placeholder=""
                          />
                          
                          {/* Progress Indicator */}
                          <div className="absolute top-2 right-2">
                            {technology.length > 0 ? (
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
            )}

            {stage === 3 && (
              <div className={`${isMobileHorizontal ? 'space-y-3' : 'space-y-8'} animate-fadeIn`}>
                <div className={`text-center ${isMobileHorizontal ? 'mb-3' : 'mb-8'}`}>
                  <div className="pixel-border-thick bg-gradient-to-br from-green-900/30 to-emerald-900/30 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="pixel-border bg-gradient-to-br from-green-500 to-emerald-500 p-3 relative overflow-hidden">
                          <Users className="w-8 h-8 text-white" />
                          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 blur-sm opacity-50 -z-10"></div>
                        </div>
                        <div>
                          <h2 className={`pixel-text ${isMobileHorizontal ? 'text-xl' : 'text-4xl'} font-black text-white mb-1`} style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.7), 0 0 20px rgba(34,197,94,0.3)' }}>
                            COLLABORATION ANGLE
                          </h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="group">
                    <div className="pixel-border-thick bg-gray-900/50 p-4 relative overflow-hidden group-hover:bg-gray-900/70 transition-all duration-300">
                      <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                      <div className="relative z-10">
                        <p className={`pixel-text text-gray-300 font-bold ${isMobileHorizontal ? 'text-sm' : 'text-base'} mb-4 leading-relaxed`}>
                          Who can you team up with (friends, other departments, communities) to make this idea bigger?
                        </p>
                        
                        <div className="relative">
                          <textarea
                            className={`pixel-text w-full bg-gray-800/80 text-white font-semibold resize-none focus:outline-none transition-all duration-300 group-hover:bg-gray-800 ${isMobileHorizontal ? 'p-3 min-h-[80px] text-sm' : 'p-5 min-h-[120px] text-base'} border-2 focus:border-green-400 hover:border-green-500`}
                            style={{ 
                              borderColor: collaboration.length > 0 ? '#10b981' : '#6b7280',
                              fontFamily: 'Verdana, Geneva, Tahoma, sans-serif',
                              backgroundColor: collaboration.length > 0 ? 'rgba(31, 41, 55, 0.9)' : 'rgba(31, 41, 55, 0.8)',
                              boxShadow: collaboration.length > 0 ? '0 0 20px rgba(16, 185, 129, 0.2), inset 0 0 20px rgba(16, 185, 129, 0.1)' : 'none'
                            }}
                            value={collaboration}
                            onChange={e => setCollaboration(e.target.value)}
                            placeholder=""
                          />
                          
                          {/* Progress Indicator */}
                          <div className="absolute top-2 right-2">
                            {collaboration.length > 0 ? (
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
            )}

            {stage === 4 && (
              <div className={`${isMobileHorizontal ? 'space-y-3' : 'space-y-8'} animate-fadeIn`}>
                <div className={`text-center ${isMobileHorizontal ? 'mb-3' : 'mb-8'}`}>
                  <div className="pixel-border-thick bg-gradient-to-br from-purple-900/30 to-violet-900/30 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="pixel-border bg-gradient-to-br from-purple-500 to-violet-500 p-3 relative overflow-hidden">
                          <Sparkles className="w-8 h-8 text-white" />
                          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-violet-500 blur-sm opacity-50 -z-10"></div>
                        </div>
                        <div>
                          <h2 className={`pixel-text ${isMobileHorizontal ? 'text-xl' : 'text-4xl'} font-black text-white mb-1`} style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.7), 0 0 20px rgba(168,85,247,0.3)' }}>
                            CREATIVITY TWIST
                          </h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="group">
                    <div className="pixel-border-thick bg-gray-900/50 p-4 relative overflow-hidden group-hover:bg-gray-900/70 transition-all duration-300">
                      <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                      <div className="relative z-10">
                        <p className={`pixel-text text-gray-300 font-bold ${isMobileHorizontal ? 'text-sm' : 'text-base'} mb-4 leading-relaxed`}>
                          What unique feature, design, or new approach makes your idea stand out?
                        </p>
                        
                        <div className="relative">
                          <textarea
                            className={`pixel-text w-full bg-gray-800/80 text-white font-semibold resize-none focus:outline-none transition-all duration-300 group-hover:bg-gray-800 ${isMobileHorizontal ? 'p-3 min-h-[80px] text-sm' : 'p-5 min-h-[120px] text-base'} border-2 focus:border-purple-400 hover:border-purple-500`}
                            style={{ 
                              borderColor: creativity.length > 0 ? '#a855f7' : '#6b7280',
                              fontFamily: 'Verdana, Geneva, Tahoma, sans-serif',
                              backgroundColor: creativity.length > 0 ? 'rgba(31, 41, 55, 0.9)' : 'rgba(31, 41, 55, 0.8)',
                              boxShadow: creativity.length > 0 ? '0 0 20px rgba(168, 85, 247, 0.2), inset 0 0 20px rgba(168, 85, 247, 0.1)' : 'none'
                            }}
                            value={creativity}
                            onChange={e => setCreativity(e.target.value)}
                            placeholder=""
                          />
                          
                          {/* Progress Indicator */}
                          <div className="absolute top-2 right-2">
                            {creativity.length > 0 ? (
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
            )}

            {stage === 5 && (
              <div className={`${isMobileHorizontal ? 'space-y-3' : 'space-y-8'} animate-fadeIn`}>
                <div className={`text-center ${isMobileHorizontal ? 'mb-3' : 'mb-8'}`}>
                  <div className="pixel-border-thick bg-gradient-to-br from-orange-900/30 to-red-900/30 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="pixel-border bg-gradient-to-br from-orange-500 to-red-500 p-3 relative overflow-hidden">
                          <Rocket className="w-8 h-8 text-white" />
                          <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500 blur-sm opacity-50 -z-10"></div>
                        </div>
                        <div>
                          <h2 className={`pixel-text ${isMobileHorizontal ? 'text-xl' : 'text-4xl'} font-black text-white mb-1`} style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.7), 0 0 20px rgba(249,115,22,0.3)' }}>
                            SPEED & SCALE
                          </h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="group">
                    <div className="pixel-border-thick bg-gray-900/50 p-4 relative overflow-hidden group-hover:bg-gray-900/70 transition-all duration-300">
                      <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                      <div className="relative z-10">
                        <p className={`pixel-text text-gray-300 font-bold ${isMobileHorizontal ? 'text-sm' : 'text-base'} mb-4 leading-relaxed`}>
                          How can your solution be applied quickly?<br/>
                          Can it be scaled to help many people (beyond your college/community)?
                        </p>
                        
                        <div className="relative">
                          <textarea
                            className={`pixel-text w-full bg-gray-800/80 text-white font-semibold resize-none focus:outline-none transition-all duration-300 group-hover:bg-gray-800 ${isMobileHorizontal ? 'p-3 min-h-[80px] text-sm' : 'p-5 min-h-[120px] text-base'} border-2 focus:border-orange-400 hover:border-orange-500`}
                            style={{ 
                              borderColor: speedScale.length > 0 ? '#f97316' : '#6b7280',
                              fontFamily: 'Verdana, Geneva, Tahoma, sans-serif',
                              backgroundColor: speedScale.length > 0 ? 'rgba(31, 41, 55, 0.9)' : 'rgba(31, 41, 55, 0.8)',
                              boxShadow: speedScale.length > 0 ? '0 0 20px rgba(249, 115, 22, 0.2), inset 0 0 20px rgba(249, 115, 22, 0.1)' : 'none'
                            }}
                            value={speedScale}
                            onChange={e => setSpeedScale(e.target.value)}
                            placeholder=""
                          />
                          
                          {/* Progress Indicator */}
                          <div className="absolute top-2 right-2">
                            {speedScale.length > 0 ? (
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
            )}

            {stage === 6 && (
              <div className={`${isMobileHorizontal ? 'space-y-3' : 'space-y-8'} animate-fadeIn`}>
                <div className={`text-center ${isMobileHorizontal ? 'mb-3' : 'mb-8'}`}>
                  <div className="pixel-border-thick bg-gradient-to-br from-teal-900/30 to-cyan-900/30 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="pixel-border bg-gradient-to-br from-teal-500 to-cyan-500 p-3 relative overflow-hidden">
                          <Globe className="w-8 h-8 text-white" />
                          <div className="absolute inset-0 bg-gradient-to-br from-teal-500 to-cyan-500 blur-sm opacity-50 -z-10"></div>
                        </div>
                        <div>
                          <h2 className={`pixel-text ${isMobileHorizontal ? 'text-xl' : 'text-4xl'} font-black text-white mb-1`} style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.7), 0 0 20px rgba(20,184,166,0.3)' }}>
                            PURPOSE & IMPACT
                          </h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="group">
                    <div className="pixel-border-thick bg-gray-900/50 p-4 relative overflow-hidden group-hover:bg-gray-900/70 transition-all duration-300">
                      <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                      <div className="relative z-10">
                        <p className={`pixel-text text-gray-300 font-bold ${isMobileHorizontal ? 'text-sm' : 'text-base'} mb-4 leading-relaxed`}>
                          How does your idea create value? (Social, environmental, educational, or economic impact?)
                        </p>
                        
                        <div className="relative">
                          <textarea
                            className={`pixel-text w-full bg-gray-800/80 text-white font-semibold resize-none focus:outline-none transition-all duration-300 group-hover:bg-gray-800 ${isMobileHorizontal ? 'p-3 min-h-[80px] text-sm' : 'p-5 min-h-[120px] text-base'} border-2 focus:border-teal-400 hover:border-teal-500`}
                            style={{ 
                              borderColor: impact.length > 0 ? '#14b8a6' : '#6b7280',
                              fontFamily: 'Verdana, Geneva, Tahoma, sans-serif',
                              backgroundColor: impact.length > 0 ? 'rgba(31, 41, 55, 0.9)' : 'rgba(31, 41, 55, 0.8)',
                              boxShadow: impact.length > 0 ? '0 0 20px rgba(20, 184, 166, 0.2), inset 0 0 20px rgba(20, 184, 166, 0.1)' : 'none'
                            }}
                            value={impact}
                            onChange={e => setImpact(e.target.value)}
                            placeholder=""
                          />
                          
                          {/* Progress Indicator */}
                          <div className="absolute top-2 right-2">
                            {impact.length > 0 ? (
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
            )}

            {stage === 7 && (
              <div className={`${isMobileHorizontal ? 'space-y-3' : 'space-y-8'} animate-fadeIn`}>
                <div className={`text-center ${isMobileHorizontal ? 'mb-3' : 'mb-8'}`}>
                  <div className="pixel-border-thick bg-gradient-to-br from-indigo-900/30 to-purple-900/30 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="pixel-border bg-gradient-to-br from-indigo-500 to-purple-500 p-3 relative overflow-hidden">
                          <FileText className="w-8 h-8 text-white" />
                          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-500 blur-sm opacity-50 -z-10"></div>
                        </div>
                        <div>
                          <h2 className={`pixel-text ${isMobileHorizontal ? 'text-xl' : 'text-4xl'} font-black text-white mb-1`} style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.7), 0 0 20px rgba(99,102,241,0.3)' }}>
                            FINAL STATEMENT
                          </h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="pixel-border-thick bg-gray-900/50 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                    <div className="relative z-10">
                      <div 
                        className={`pixel-border bg-gradient-to-r from-indigo-900 to-purple-900 relative overflow-hidden ${isMobileHorizontal ? 'p-4' : 'p-6'}`}
                      >
                        <div className="absolute inset-0 opacity-20">
                          <div className="absolute inset-0" style={{
                            backgroundImage: `repeating-linear-gradient(
                              45deg,
                              transparent,
                              transparent 4px,
                              rgba(255,255,255,0.1) 4px,
                              rgba(255,255,255,0.1) 8px
                            )`
                          }}></div>
                        </div>
                        <div className="relative z-10 text-lg text-white leading-relaxed font-bold">
                          <span className="text-indigo-300 font-black">"Our innovation solves </span>
                          <span className="text-red-400 font-black bg-red-900/30 px-2 py-1">
                            {problem || '________'}
                          </span>
                          <span className="text-indigo-300 font-black"> by using </span>
                          <span className="text-blue-400 font-black bg-blue-900/30 px-2 py-1">
                            ({technology || 'technology'})
                          </span>
                          <span className="text-indigo-300 font-black">, built with </span>
                          <span className="text-green-400 font-black bg-green-900/30 px-2 py-1">
                            ({collaboration || 'collaboration'})
                          </span>
                          <span className="text-indigo-300 font-black">, adding </span>
                          <span className="text-purple-400 font-black bg-purple-900/30 px-2 py-1">
                            ({creativity || 'creative twist'})
                          </span>
                          <span className="text-indigo-300 font-black">. It can grow with </span>
                          <span className="text-orange-400 font-black bg-orange-900/30 px-2 py-1">
                            ({speedScale || 'speed & scale'})
                          </span>
                          <span className="text-indigo-300 font-black"> and will create </span>
                          <span className="text-teal-400 font-black bg-teal-900/30 px-2 py-1">
                            ({impact || 'purpose/impact'})
                          </span>
                          <span className="text-indigo-300 font-black">."</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {stage === 8 && (
              <div className={`${isMobileHorizontal ? 'space-y-3' : 'space-y-8'} animate-fadeIn`}>
                <div className={`text-center ${isMobileHorizontal ? 'mb-3' : 'mb-8'}`}>
                  <div className="pixel-border-thick bg-gradient-to-br from-gray-900/30 to-slate-900/30 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="pixel-border bg-gradient-to-br from-gray-500 to-slate-500 p-3 relative overflow-hidden">
                          <Upload className="w-8 h-8 text-white" />
                          <div className="absolute inset-0 bg-gradient-to-br from-gray-500 to-slate-500 blur-sm opacity-50 -z-10"></div>
                        </div>
                        <div>
                          <h2 className={`pixel-text ${isMobileHorizontal ? 'text-xl' : 'text-4xl'} font-black text-white mb-1`} style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.7), 0 0 20px rgba(100,116,139,0.3)' }}>
                            PROTOTYPE/DEMO/SKETCH
                          </h2>
                          <div className="flex items-center justify-center space-x-2">
                            <span className="pixel-text text-xs font-bold text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">
                              OPTIONAL
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="group">
                    <div className="pixel-border-thick bg-gray-900/50 p-4 relative overflow-hidden group-hover:bg-gray-900/70 transition-all duration-300">
                      <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                      <div className="relative z-10">
                        <p className={`pixel-text text-gray-300 font-bold ${isMobileHorizontal ? 'text-sm' : 'text-base'} mb-4 leading-relaxed text-center`}>
                          As PDF attachment submission.
                        </p>
                        
                        <div 
                          className={`border-2 border-dashed border-gray-600 text-center hover:border-gray-500 transition-colors duration-300 bg-gray-900/50 ${isMobileHorizontal ? 'p-4' : 'p-8'} relative`}
                        >
                          <Upload className={`${isMobileHorizontal ? 'w-12 h-12' : 'w-16 h-16'} text-gray-400 mx-auto mb-4`} />
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <span className={`${isMobileHorizontal ? 'text-base' : 'text-lg'} font-black text-white mb-2 block`}>UPLOAD PDF PROTOTYPE</span>
                            <span className={`text-gray-400 block mb-4 font-bold ${isMobileHorizontal ? 'text-sm' : ''}`}>DRAG & DROP OR CLICK TO BROWSE</span>
                            <input
                              id="file-upload"
                              type="file"
                              accept="application/pdf"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                            <div 
                              className="pixel-border inline-flex items-center px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white transition-colors duration-300 font-black"
                            >
                              <Upload className="w-5 h-5 mr-2" />
                              SELECT FILE
                            </div>
                          </label>
                          {file && (
                            <div 
                              className={`pixel-border mt-4 bg-green-900/30 relative overflow-hidden ${isMobileHorizontal ? 'p-3' : 'p-4'}`}
                            >
                              <div className="absolute inset-0 opacity-20">
                                <div className="absolute inset-0" style={{
                                  backgroundImage: `repeating-linear-gradient(
                                    45deg,
                                    transparent,
                                    transparent 4px,
                                    rgba(0,255,0,0.1) 4px,
                                    rgba(0,255,0,0.1) 8px
                                  )`
                                }}></div>
                              </div>
                              <div className="relative z-10">
                                <CheckCircle className="w-6 h-6 text-green-400 mx-auto mb-2" />
                                <span className="text-green-400 font-black">{file.name}</span>
                                <p className="text-green-300 text-sm mt-1 font-bold">FILE UPLOAD SUCCESSFUL</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Progress Indicator */}
                          <div className="absolute top-2 right-2">
                            {file ? (
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
            )}

            {stage === 9 && (
              <div className={`${isMobileHorizontal ? 'space-y-3' : 'space-y-8'} animate-fadeIn`}>
                <div className={`text-center ${isMobileHorizontal ? 'mb-3' : 'mb-8'}`}>
                  <div className="pixel-border-thick bg-gradient-to-br from-yellow-900/30 to-amber-900/30 p-6 relative overflow-hidden">
                    <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                    <div className="relative z-10">
                      <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="pixel-border bg-gradient-to-br from-yellow-500 to-amber-500 p-3 relative overflow-hidden">
                          <Lightbulb className="w-8 h-8 text-white" />
                          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 to-amber-500 blur-sm opacity-50 -z-10"></div>
                        </div>
                        <div>
                          <h2 className={`pixel-text ${isMobileHorizontal ? 'text-xl' : 'text-4xl'} font-black text-white mb-1`} style={{ textShadow: '3px 3px 0px rgba(0,0,0,0.7), 0 0 20px rgba(245,158,11,0.3)' }}>
                            REFLECTION
                          </h2>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="group">
                    <div className="pixel-border-thick bg-gray-900/50 p-4 relative overflow-hidden group-hover:bg-gray-900/70 transition-all duration-300">
                      <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
                      <div className="relative z-10">
                        <p className={`pixel-text text-gray-300 font-bold ${isMobileHorizontal ? 'text-sm' : 'text-base'} mb-4 leading-relaxed`}>
                          (what did you learn, what would you improve?).
                        </p>
                        
                        <div className="relative">
                          <textarea
                            className={`pixel-text w-full bg-gray-800/80 text-white font-semibold resize-none focus:outline-none transition-all duration-300 group-hover:bg-gray-800 ${isMobileHorizontal ? 'p-3 min-h-[80px] text-sm' : 'p-5 min-h-[120px] text-base'} border-2 focus:border-yellow-400 hover:border-yellow-500`}
                            style={{ 
                              borderColor: reflection.length > 0 ? '#f59e0b' : '#6b7280',
                              fontFamily: 'Verdana, Geneva, Tahoma, sans-serif',
                              backgroundColor: reflection.length > 0 ? 'rgba(31, 41, 55, 0.9)' : 'rgba(31, 41, 55, 0.8)',
                              boxShadow: reflection.length > 0 ? '0 0 20px rgba(245, 158, 11, 0.2), inset 0 0 20px rgba(245, 158, 11, 0.1)' : 'none'
                            }}
                            value={reflection}
                            onChange={e => setReflection(e.target.value)}
                            placeholder=""
                          />
                          
                          {/* Progress Indicator */}
                          <div className="absolute top-2 right-2">
                            {reflection.length > 0 ? (
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
            )}
          </div>
        </div>

        {/* Fixed Bottom Navigation Bar */}
        <div className={`fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-gray-900 via-gray-800/95 to-transparent ${isMobileHorizontal ? 'p-1' : 'p-4'}`}>
          <div className="max-w-6xl mx-auto">
            <div className={`pixel-border-thick bg-gray-900/90 relative overflow-hidden ${isMobileHorizontal ? 'p-2' : 'p-4'}`}>
              <div className="absolute inset-0 bg-pixel-pattern opacity-5"></div>
              <div className="absolute inset-0 bg-scan-lines opacity-10"></div>
              
              <div className={`relative z-10 flex items-center ${isMobileHorizontal ? 'justify-center' : 'justify-between'}`}>
                {/* Progress Info - Hidden on mobile horizontal */}
                {!isMobileHorizontal && (
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 transition-all duration-300 ${
                        canProceed ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
                      } pixel-border`}></div>
                      <div className="pixel-text text-sm font-bold">
                        <span className={canProceed ? 'text-green-400' : 'text-gray-400'}>
                          {canProceed ? "READY TO PROCEED" : "COMPLETE CURRENT STEP"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="hidden sm:flex items-center space-x-2">
                      <span className="pixel-text text-sm font-bold text-cyan-300">STAGE {stage}/9</span>
                      <div className="w-20 h-2 bg-gray-700 pixel-border">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
                          style={{ width: `${(stage / 9) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Mobile horizontal compact status */}
                {isMobileHorizontal && (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 transition-all duration-300 ${
                        canProceed ? 'bg-green-400 animate-pulse' : 'bg-gray-600'
                      } pixel-border`}></div>
                      <span className="pixel-text text-xs font-bold text-cyan-300">{stage}/9</span>
                    </div>
                  </div>
                )}
                
                {/* Proceed Button */}
                <button
                  className={`pixel-border-thick pixel-text flex items-center justify-center transition-all duration-300 font-black relative overflow-hidden group ${
                    isMobileHorizontal 
                      ? 'px-4 py-2 text-xs space-x-1' 
                      : 'px-8 py-4 text-lg space-x-2'
                  } ${
                    canProceed 
                      ? `bg-gradient-to-r ${currentStageData.color} hover:scale-105 shadow-lg` 
                      : 'bg-gray-700 cursor-not-allowed opacity-50'
                  }`}
                  style={{ 
                    minWidth: isMobileHorizontal ? '100px' : '200px',
                    boxShadow: canProceed ? `0 0 20px rgba(6,182,212,0.3)` : 'none'
                  }}
                  onClick={() => {
                    if (canProceed && stage !== 9) {
                      setShowProceedWarning(true);
                    }
                  }}
                  disabled={stage === 9 || !canProceed}
                >
                  {/* Animated Background */}
                  {canProceed && (
                    <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 animate-pulse opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  )}
                  
                  <div className={`relative z-10 flex items-center ${isMobileHorizontal ? 'space-x-1' : 'space-x-2'}`}>
                    {stage === 9 ? (
                      <>
                        <CheckCircle className={`${isMobileHorizontal ? 'w-3 h-3' : 'w-5 h-5'}`} />
                        <span>{isMobileHorizontal ? 'DONE' : 'COMPLETE'}</span>
                      </>
                    ) : (
                      <>
                        <span>{isMobileHorizontal ? 'NEXT' : 'PROCEED'}</span>
                        {canProceed && !isMobileHorizontal && (
                          <div className="flex space-x-1">
                            <div className="w-1 h-1 bg-current rounded-full animate-bounce"></div>
                            <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Proceed Warning Modal */}
      {showProceedWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4" style={{ fontFamily: 'Verdana, Geneva, Tahoma, sans-serif' }}>
          <div className="pixel-border-thick bg-yellow-100 w-full max-w-md text-center relative overflow-hidden animate-slideIn p-6" style={{ fontFamily: 'Verdana, Geneva, Tahoma, sans-serif' }}>
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-pixel-pattern opacity-10"></div>
            <div className="absolute inset-0 bg-scan-lines opacity-20"></div>
            {/* Close Button */}
            <button
              onClick={() => setShowProceedWarning(false)}
              className="absolute top-2 right-2 z-20 bg-yellow-200 hover:bg-yellow-300 text-yellow-900 rounded-full p-1 shadow pixel-border"
              aria-label="Close warning modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="bg-yellow-400 pixel-border flex items-center justify-center w-8 h-8 animate-bounce relative">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-yellow-300 opacity-60 animate-ping"></span>
                  <AlertTriangle className="text-yellow-900 w-5 h-5 relative z-10" />
                </div>
                <h2 className="font-black text-yellow-900 pixel-text text-lg">CAUTION</h2>
              </div>
              <div className="mb-6">
                <span className="font-bold text-yellow-900 pixel-text text-base">
                  Action cannot be undone. Are you sure you want to proceed?
                </span>
              </div>
              <div className="flex justify-center">
                <button
                  className="pixel-border bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-300 hover:to-yellow-400 text-yellow-900 font-black pixel-text transition-all duration-200 py-3 px-6 transform hover:scale-105 shadow-lg"
                  onClick={() => {
                    setShowProceedWarning(false);
                    setStage(stage + 1);
                  }}
                >
                  <span className="text-sm">Yes, Proceed</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Level2Screen3;