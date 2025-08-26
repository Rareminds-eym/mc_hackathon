import { FileText, Globe, Lightbulb, Rocket, Sparkles, Target, Upload, Users, Zap } from 'lucide-react';
import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeviceLayout } from '../../hooks/useOrientation';
import { supabase } from '../../lib/supabase';
import { hackathonData } from '../HackathonData';
import { useAuth } from './../../contexts/AuthContext';
import BriefPopup from './components/BriefPopup';
import ConfirmationModal from './components/ConfirmationModal';
import Header from './components/Header';
import LevelCompletionPopup from './components/LevelCompletionPopup';
import NavigationBar from './components/NavigationBar';
import ProgressTrack from './components/ProgressTrack';
import StageContent from './components/StageContent';
import type { PrototypeStageRef } from './components/stages/PrototypeStage';
import { StageData, StageFormData } from './types';
// import ProgressIndicator from './components/ProgressIndicator';
import LoadingScreen from './components/LoadingScreen';
import ResetProgressModal from './components/ResetProgressModal';
import Toast from './components/Toast';
import { convertProgressToFormData, useLevel2Screen3Progress } from './hooks/useLevel2Screen3Progress';
import { saveLevel2TimerState } from './level2ProgressHelpers';

interface Level2Screen3Props {}

const Level2Screen3: React.FC<Level2Screen3Props> = () => {
  const [selectedCase, setSelectedCase] = useState<{ email: string; case_id: number; updated_at: string, description?: string } | null>(null);
  const navigate = useNavigate();
  const [showBrief, setShowBrief] = useState(false);
  const [loadingCase, setLoadingCase] = useState(true);
  const [caseError, setCaseError] = useState<string | null>(null);
  // Fetch selected case on mount
  const { user } = useAuth();
  // Ref to call upload from Stage 9 before proceeding
  const prototypeStageRef = useRef<PrototypeStageRef | null>(null);

  // Move isStageComplete here so it is defined before any usage
  const isStageComplete = (stageNum: number) => {
    switch(stageNum) {
      case 1: {
        // For the idea statement, we need to validate that all three parts are filled
        if (!formData.ideaStatement || formData.ideaStatement.length === 0) return false;
        
        // Parse the idea statement to check if all three parts are present
        const match = formData.ideaStatement.match(/I want to solve (.+) for (.+) by (.+)/);
        if (match) {
          const what = match[1]?.trim() || '';
          const who = match[2]?.trim() || '';
          const how = match[3]?.trim() || '';
          return what.length > 0 && who.length > 0 && how.length > 0;
        }
        return false;
      }
      case 2: return formData.problem.length > 0;
      case 3: return formData.technology.length > 0;
      case 4: return formData.collaboration.length > 0;
      case 5: return formData.creativity.length > 0;
      case 6: return formData.speedScale.length > 0;
      case 7: return formData.impact.length > 0;
      case 8:
        // All final statement fields must be filled (use unique keys)
        return (
          !!formData.finalProblem && formData.finalProblem.trim() !== '' &&
          !!formData.finalTechnology && formData.finalTechnology.trim() !== '' &&
          !!formData.finalCollaboration && formData.finalCollaboration.trim() !== '' &&
          !!formData.finalCreativity && formData.finalCreativity.trim() !== '' &&
          !!formData.finalSpeedScale && formData.finalSpeedScale.trim() !== '' &&
          !!formData.finalImpact && formData.finalImpact.trim() !== ''
        );
      case 9: return true; // Prototype/Demo/Sketch is optional
      case 10: return formData.reflection.length > 0;
      default: return false;
    }
  };
  useEffect(() => {
    if (!user) return;
    // Fetch selected_cases data for the current user from Supabase
    const fetchSelectedCase = async () => {
      setLoadingCase(true);
      setCaseError(null);
      try {
        const userEmail = user.email;
        if (!userEmail) throw new Error('User email not found');
        // Fetch the selected case for the user
        const { data, error } = await supabase
          .from('selected_cases')
          .select('*')
          .eq('email', userEmail)
          .order('updated_at', { ascending: false })
          .limit(1);
        if (error) throw error;
        if (Array.isArray(data) && data.length > 0) {
          const selected = data[0];
          // Find the question in hackathonData by id (case_id)
          const question = hackathonData.find(q => q.id === selected.case_id);
          setSelectedCase({ ...selected, description: question ? question.caseFile : undefined });
        } else {
          setSelectedCase(null);
        }
      } catch (error: any) {
        setSelectedCase(null);
        setCaseError(error.message || error.toString() || 'Unknown error');
      } finally {
        setLoadingCase(false);
      }
    };
    fetchSelectedCase();
  }, [user]);
  const [stage, setStage] = useState(1);
  const [showProceedWarning, setShowProceedWarning] = useState(false);
  const [formData, setFormData] = useState<StageFormData>({
    ideaStatement: '',
    problem: '',
    technology: '',
    collaboration: '',
    creativity: '',
    speedScale: '',
    impact: '',
    reflection: '',
    file: null,
    finalProblem: '',
    finalTechnology: '',
    finalCollaboration: '',
    finalCreativity: '',
    finalSpeedScale: '',
    finalImpact: '',
  });
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showResetModal, setShowResetModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; type: 'success' | 'error'; message: string }>({
    show: false,
    type: 'success',
    message: ''
  });
  const [hasRestoredProgress, setHasRestoredProgress] = useState(false);
  const [isLevelCompleted, setIsLevelCompleted] = useState(false);
  const [isInitialPageLoad, setIsInitialPageLoad] = useState(true);
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;
  // Timer logic: read persistent start time and calculate elapsed


  // Handle timer reaching zero: end test and show final modal
  const handleTimerTimeUp = useCallback(() => {
    setIsLevelCompleted(true);
    setShowCompletionPopup(true);
  }, []);

  // Auto-save timer handler
  const handleSaveTimer = useCallback(
    async (time: number) => {
      if (user && user.id) {
        try {
          await saveLevel2TimerState(user.id, time);
        } catch (err) {
          // Optionally handle error (e.g., show toast)
          console.error('[Level2Screen3] Failed to auto-save timer:', err);
        }
      }
    },
    [user]
  );

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ show: true, type, message });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, show: false }));
  }, []);
  
  // Progress management hook
  const {
    progress: savedProgress,
    isLoading: isProgressLoading,
    error: progressError,
    saveProgress,
    loadProgress,
    markCompleted,
    resetProgress,
    hasExistingProgress
  } = useLevel2Screen3Progress();

  // Calculate progress based on completed stages
  useEffect(() => {
    // Only count stages that require user input (exclude always-complete/optional stages 8 and 9)
    const inputStages = [1, 2, 3, 4, 5, 6, 7, 10];
    let completed = 0;
    for (const i of inputStages) {
      if (isStageComplete(i)) completed++;
    }
    setProgress(completed === 0 ? 0 : (completed / inputStages.length) * 100);
  }, [formData]);

  // Fix for OPPO and other problematic Android devices
  useEffect(() => {
    const isAndroid = /Android/i.test(navigator.userAgent);
    const isOPPO = /OPPO/i.test(navigator.userAgent) || /OppoR/i.test(navigator.userAgent);
    const isProblematicDevice = isOPPO || /ColorOS/i.test(navigator.userAgent) || /OnePlus/i.test(navigator.userAgent);
    
    if (isAndroid || isProblematicDevice) {
      // Force enable touch scrolling for problematic devices
      const mainContainer = document.querySelector('[data-scroll-container]') || document.body;
      
      // Add CSS fixes directly to the DOM for maximum compatibility
      const style = document.createElement('style');
      style.textContent = `
        * {
          -webkit-overflow-scrolling: touch !important;
          overscroll-behavior: contain;
        }
        
        body, html {
          overflow: auto !important;
          height: 100% !important;
          touch-action: pan-y !important;
          -webkit-overflow-scrolling: touch !important;
        }
        
        .compact-all {
          overflow-y: auto !important;
          -webkit-overflow-scrolling: touch !important;
          transform: translateZ(0) !important;
          will-change: scroll-position !important;
          scroll-behavior: smooth !important;
        }
        
        /* Prevent nested scrolling */
        .compact-all .pixel-border-thick {
          overflow: visible !important;
        }
        
        .compact-all .relative.z-10 {
          overflow: visible !important;
        }
      `;
      document.head.appendChild(style);
      
      // Force reflow for OPPO devices
      if (isProblematicDevice) {
        setTimeout(() => {
          const container = document.querySelector('.min-h-screen');
          if (container && container instanceof HTMLElement) {
            container.style.overflow = 'auto';
            container.style.WebkitOverflowScrolling = 'touch';
            container.style.transform = 'translate3d(0,0,0)';
            // Force a reflow
            container.offsetHeight;
          }
        }, 100);
      }
      
      return () => {
        document.head.removeChild(style);
      };
    }
  }, []);
  // Remove auto-save - we'll save only on explicit user action

  // Debug stage changes
  useEffect(() => {
    console.log('🎪 Stage changed to:', stage);
  }, [stage]);

  // Manage initial page load state
  useEffect(() => {
    // Set a minimum loading time for smooth UX, then check if all loading is complete
    const timer = setTimeout(() => {
      if (user && !isProgressLoading && !loadingCase) {
        console.log('🎮 Initial page load complete');
        setIsInitialPageLoad(false);
      }
    }, 1000); // Minimum 1 second loading time

    return () => clearTimeout(timer);
  }, [user, isProgressLoading, loadingCase]);


  // Load saved progress on component mount (only once)
  useEffect(() => {
    if (savedProgress && hasExistingProgress && user && !hasRestoredProgress) {
      console.log('📥 Restoring saved progress:');
      console.log('   - Saved stage:', savedProgress.current_stage);
      console.log('   - Saved completed stages:', savedProgress.completed_stages);
      console.log('   - Is completed:', savedProgress.is_completed);
      console.log('   - Raw savedProgress object:', savedProgress);
      
      const restoredFormData = convertProgressToFormData(savedProgress);
      console.log('   - Restored form data:', restoredFormData);
      
      setFormData(restoredFormData);
      console.log('   - Setting stage to:', savedProgress.current_stage);
      setStage(savedProgress.current_stage);
      
      // Check if level was already completed
      if (savedProgress.is_completed) {
        console.log('🏆 Level was already completed! Stopping timer and showing completion popup.');
        setIsLevelCompleted(true);
        setShowCompletionPopup(true);
      }
      
      setHasRestoredProgress(true);
    }
  }, [savedProgress, hasExistingProgress, user, hasRestoredProgress]);

  const handleFormDataChange = (field: keyof StageFormData, value: string | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const stages: StageData[] = [
    { 
      icon: Lightbulb, 
      title: "Idea Statement", 
      subtitle: "Define",
      color: "from-amber-500 to-yellow-500", 
      bgColor: "from-amber-900/20 to-yellow-900/20",
      accent: "amber",
      description: "Write your idea in one line: 'I want to solve ___ for ___ by ___'",
      caseNumber: 1
    },
    { 
      icon: Target, 
      title: "Problem", 
      subtitle: "Identify",
      color: "from-red-500 to-pink-500", 
      bgColor: "from-red-900/20 to-pink-900/20",
      accent: "red",
      description: "Define the core issue you're solving",
      caseNumber: 2
    },
    { 
      icon: Zap, 
      title: "Technology", 
      subtitle: "Amplify",
      color: "from-blue-500 to-cyan-500", 
      bgColor: "from-blue-900/20 to-cyan-900/20",
      accent: "blue",
      description: "Choose your tech stack wisely",
      caseNumber: 3
    },
    { 
      icon: Users, 
      title: "Collaboration", 
      subtitle: "Unite",
      color: "from-green-500 to-emerald-500", 
      bgColor: "from-green-900/20 to-emerald-900/20",
      accent: "green",
      description: "Build strategic partnerships",
      caseNumber: 4
    },
    { 
      icon: Sparkles, 
      title: "Creativity", 
      subtitle: "Innovate",
      color: "from-purple-500 to-violet-500", 
      bgColor: "from-purple-900/20 to-violet-900/20",
      accent: "purple",
      description: "Add your unique twist",
      caseNumber: 5
    },
    { 
      icon: Rocket, 
      title: "Speed & Scale", 
      subtitle: "Deploy",
      color: "from-orange-500 to-red-500", 
      bgColor: "from-orange-900/20 to-red-900/20",
      accent: "orange",
      description: "Plan for rapid growth",
      caseNumber: 6
    },
    { 
      icon: Globe, 
      title: "Purpose & Impact", 
      subtitle: "Transform",
      color: "from-teal-500 to-cyan-500", 
      bgColor: "from-teal-900/20 to-cyan-900/20",
      accent: "teal",
      description: "Measure meaningful change",
      caseNumber: 7
    },
    { 
      icon: FileText, 
      title: "Mission Statement", 
      subtitle: "Synthesize",
      color: "from-indigo-500 to-purple-500", 
      bgColor: "from-indigo-900/20 to-purple-900/20",
      accent: "indigo",
      description: "Craft your innovation story",
      caseNumber: 8
    },
    { 
      icon: Upload, 
      title: "Prototype", 
      subtitle: "Demonstrate",
      color: "from-pink-500 to-yellow-500", 
      bgColor: "from-pink-900/20 to-yellow-900/20",
      accent: "pink",
      description: "Optional: Show your solution in action",
      caseNumber: 9,
      isOptional: true
    },
    { 
      icon: Lightbulb, 
      title: "Reflection", 
      subtitle: "Learn",
      color: "from-yellow-500 to-amber-500", 
      bgColor: "from-yellow-900/20 to-amber-900/20",
      accent: "yellow",
      description: "Document your journey",
      caseNumber: 10
    }
  ];

  const currentStageData = stages[stage - 1];

  const canProceed = isStageComplete(stage);

  const handleProceed = () => {
    if (canProceed) {
      setShowProceedWarning(true);
    }
  };

  const handleConfirmProceed = useCallback(async () => {
    console.log('🎯 handleConfirmProceed started - Current stage:', stage);
    setIsSaving(true);
    
    // Calculate completed stages including current stage
    const completedStages: number[] = [];
    for (let i = 1; i <= stage; i++) {
      if (isStageComplete(i)) completedStages.push(i);
    }
    console.log('📊 Completed stages:', completedStages);
    
    try {
      // Determine the next stage before saving
      let nextStage = stage;
      if (stage === 9) {
        // Before proceeding from Stage 9, attempt the PDF upload if a file is selected
        try {
          if (prototypeStageRef.current && typeof prototypeStageRef.current.uploadSelectedFile === 'function') {
            const uploaded = await prototypeStageRef.current.uploadSelectedFile();
            if (!uploaded) {
              console.error('❌ PDF upload failed - not proceeding to next stage');
              const lastErr = prototypeStageRef.current?.getLastUploadError?.();
              setShowProceedWarning(false); // close modal so toast is visible
              showToast('error', lastErr || 'Failed to upload your PDF. Please try again.');
              setIsSaving(false);
              return;
            }
          }
        } catch (uploadErr) {
          console.error('💥 Error during PDF upload from stage 9:', uploadErr);
          setShowProceedWarning(false); // close modal so toast is visible
          showToast('error', 'Failed to upload your PDF. Please try again.');
          setIsSaving(false);
          return;
        }
        nextStage = 10;
      } else if (stage === 10) {
        nextStage = 10; // Stay on 10 for completion
      } else {
        nextStage = stage + 1;
      }
      
      console.log(`💾 Attempting to save progress with next stage: ${nextStage}`);
      // Save progress with the NEXT stage, not current stage
      const saveSuccessful = await saveProgress(formData, nextStage, completedStages);
      console.log('💾 Save result:', saveSuccessful);
      
      if (!saveSuccessful) {
        // Show error and don't proceed
        console.error('❌ Failed to save progress - not proceeding to next stage');
        showToast('error', 'Failed to save your progress. Please check your connection and try again.');
        setIsSaving(false);
        return;
      }
      
      console.log('✅ Save successful, proceeding with stage advancement');
      // Only proceed if save was successful
      setShowProceedWarning(false);
      
      if (stage === 9) {
        console.log('🎭 Moving from stage 9 to 10');
        setStage(10);
      } else if (stage === 10) {
        console.log('🏁 Completing final stage');
        // User is completing the last stage, mark as completed and show completion popup
        const completionSuccessful = await markCompleted();
        if (completionSuccessful) {
          console.log('✅ Level completed! Stopping timer.');
          setIsLevelCompleted(true);
          showToast('success', 'Progress saved successfully! 🎉');
          setShowCompletionPopup(true);
        } else {
          console.error('Failed to mark completion - please try again');
          showToast('error', 'Failed to mark completion. Please try again.');
        }
      } else {
        console.log(`🚀 Moving from stage ${stage} to ${nextStage}`);
        showToast('success', 'Progress saved successfully!');
        console.log('🎯 About to call setStage with:', nextStage);
        setStage(nextStage);
        console.log('🎯 setStage called, should advance to stage:', nextStage);
      }
      
    } catch (error) {
      console.error('💥 Error saving progress:', error);
      showToast('error', 'An error occurred while saving. Please try again.');
      // Don't proceed to next stage if save failed
    } finally {
      console.log('🏁 handleConfirmProceed finished');
      setIsSaving(false);
    }
  }, [stage, markCompleted, saveProgress, formData, isStageComplete, showToast]);

  // Handle loading saved progress
  const handleLoadProgress = useCallback(async () => {
    const loaded = await loadProgress();
    if (loaded) {
      const restoredFormData = convertProgressToFormData(loaded);
      setFormData(restoredFormData);
      setStage(loaded.current_stage);
    }
  }, [loadProgress]);

  // Handle resetting progress
  const handleResetProgress = useCallback(async () => {
    const success = await resetProgress();
    if (success) {
      // Reset form data and stage
      setFormData({
        ideaStatement: '',
        problem: '',
        technology: '',
        collaboration: '',
        creativity: '',
        speedScale: '',
        impact: '',
        reflection: '',
        file: null,
        finalProblem: '',
        finalTechnology: '',
        finalCollaboration: '',
        finalCreativity: '',
        finalSpeedScale: '',
        finalImpact: '',
      });
      setStage(1);
    }
    setShowResetModal(false);
  }, [resetProgress]);

  // Determine loading message and show loading screen for various scenarios
  const getLoadingMessage = () => {
    if (!user) return "Authenticating...";
    if (isInitialPageLoad) return "Initializing Innovation Quest...";
    if (isProgressLoading) return "Loading your progress...";
    if (loadingCase) return "Loading your selected case...";
    return "Loading...";
  };

  // Show loading screen for various loading states (excluding saving progress)
  // Note: isSaving is handled by the ConfirmationModal with loading state
  if (!user || isInitialPageLoad || (user && isProgressLoading) || loadingCase) {
    return (
      <LoadingScreen 
        message={getLoadingMessage()} 
        isMobileHorizontal={isMobileHorizontal} 
      />
    );
  }

  return (
    <>
      <div
        className={`min-h-screen bg-gray-800 relative flex flex-col compact-all${isMobileHorizontal ? ' compact-mobile-horizontal' : ''}`}
        style={{ 
          fontFamily: 'Verdana, Geneva, Tahoma, sans-serif', 
          fontSize: isMobileHorizontal ? '12px' : '13px', 
          lineHeight: 1.2,
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-y',
          scrollBehavior: 'smooth',
          // Additional fixes for OPPO and problematic Android devices
          transform: 'translate3d(0,0,0)', // Force hardware acceleration
          willChange: 'scroll-position',
          // Ensure momentum scrolling works
          msOverflowStyle: '-ms-autohiding-scrollbar'
        }}
      >
        {/* Background Pattern */}
        <div className="fixed inset-0 bg-pixel-pattern opacity-10"></div>
        <div className="fixed inset-0 bg-scan-lines opacity-20"></div>
        <div
          className={`relative z-10 max-w-6xl mx-auto flex flex-col w-full ${isMobileHorizontal ? 'px-0 py-1 pb-5' : 'px-1 xs:px-2 sm:px-4 py-2 xs:py-3 sm:py-6 pb-5'}`}
        >
          {/* Header */}
          <Header 
            currentStageData={currentStageData}
            isMobileHorizontal={isMobileHorizontal}
            selectedCase={selectedCase}
            onShowBrief={() => setShowBrief(true)}
            progress={progress}
            timerStopped={isLevelCompleted}
            autoSave={true}
            onSaveTimer={handleSaveTimer}
            onTimerTimeUp={handleTimerTimeUp}
          />
          
          {/* Loading/Error for Brief Button */}
          {loadingCase && (
            <div className="text-xs text-cyan-300 mt-2">Loading previously selected case...</div>
          )}
          {caseError && (
            <div className="text-xs text-red-400 mt-2">Error loading case: {caseError} (showing fallback)</div>
          )}

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
            prototypeStageRef={prototypeStageRef}
          />

          {/* Navigation Bar */}
          <NavigationBar 
            stage={stage}
            canProceed={canProceed}
            currentStageData={currentStageData}
            isMobileHorizontal={isMobileHorizontal}
            onProceed={handleProceed}
          />

          {/* Brief Popup as component */}
          <BriefPopup
            show={showBrief && !!selectedCase}
            description={selectedCase?.description}
            isMobileHorizontal={isMobileHorizontal}
            onClose={() => setShowBrief(false)}
          />

          {/* Confirmation Modal */}
          <ConfirmationModal 
            show={showProceedWarning}
            onClose={() => !isSaving && setShowProceedWarning(false)}
            onConfirm={handleConfirmProceed}
            isLoading={isSaving}
          />

          {/* Level Completion Popup */}
          <LevelCompletionPopup
            show={showCompletionPopup && isLevelCompleted}
            onContinue={() => navigate('/modules')}
            message={
              <>
                Congratulations! You have completed all stages of Level 2.
                <br />
                The results will be announced via email, and you can also check them on our website: <a href="https://rareminds.in/hackathons" target="_blank" rel="noopener noreferrer" style={{ color: '#38bdf8', textDecoration: 'underline' }}>rareminds.in/hackathons</a>
              </>
            }
          />

          {/* Reset Progress Modal */}
          <ResetProgressModal
            show={showResetModal}
            onClose={() => setShowResetModal(false)}
            onConfirm={handleResetProgress}
          />

          {/* Toast Notifications */}
          <Toast
            show={toast.show}
            type={toast.type}
            message={toast.message}
            onClose={hideToast}
          />

        </div>
      </div>
    </>
  );
};

export default Level2Screen3;
