import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import { saveLevel2TimerState } from './level2ProgressHelpers';
import { useDeviceLayout } from '../../hooks/useOrientation';
import { saveSelectedCase } from './supabaseHelpers';
import { saveLevel2Progress, getLevel2Progress } from './level2ProgressHelpers';
import { supabase } from '../../lib/supabase';
import { fetchLevel1CasesForTeam, AttemptDetail } from './fetchLevel1Cases';
import { hackathonData } from '../HackathonData';
import ConfirmModal from './ui/ConfirmModal';
import CaseQuestionModal from './ui/CaseQuestionModal';

import LoadingScreen from './components/LoadingScreen';

interface TeamMember {
  name: string;
  email: string;
  full_name?: string;
}

interface Level2Screen1Props {
  teamName: string;
  teamMembers: TeamMember[];
  selectedCases: { [email: string]: number };
  onSelectCase: (email: string, caseId: number) => void;
  onContinue: () => void;
}


const Level2Screen1_CaseSelection: React.FC<Level2Screen1Props> = ({
  teamName,
  teamMembers,
  selectedCases,
  onSelectCase,
  onContinue,
}) => {
  // Device layout detection
  const { isMobile, isHorizontal } = useDeviceLayout();
  const [loading, setLoading] = useState(true);
  const [allCases, setAllCases] = useState<{ member: { email: string }, attempt: AttemptDetail }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ open: boolean; email: string | null; caseId: number | null }>({ open: false, email: null, caseId: null });

  // Timer logic: read persistent start time and calculate elapsed
  const [savedTimer, setSavedTimer] = useState<number | null>(null);
  useEffect(() => {
    const timerStart = window.sessionStorage.getItem('level2_timer_start');
    if (timerStart) {
      const elapsed = Math.floor((Date.now() - parseInt(timerStart, 10)) / 1000);
      setSavedTimer(elapsed > 0 ? elapsed : 0);
    }
  }, []);

  // Auto-save timer handler
  const handleSaveTimer = React.useCallback(
    async (time: number) => {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user || !user.id) return;
      try {
        await saveLevel2TimerState(user.id, time);
      } catch (err) {
        // Optionally handle error (e.g., show toast)
        console.error('[Level2Screen1] Failed to auto-save timer:', err);
      }
    },
    []
  );

  // mobile modal for viewing/navigating cases
  const [mobileCaseIndex, setMobileCaseIndex] = useState<number | null>(null);

  // For desktop: show question modal on click
  const [modalCase, setModalCase] = useState<null | { question: string; member: TeamMember; attempt: AttemptDetail; idx: number }>(null);

  useEffect(() => {
    setLoading(true);
    console.log('[Level2Screen1_CaseSelection] Fetching Level 1 cases for teamMembers:', teamMembers);
    // Restore progress for this user
    (async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user || !user.id) throw new Error('User not authenticated');
        const progress = await getLevel2Progress(user.id);
        console.log('[Level2Screen1] Restored progress:', progress);
        // You can use progress.current_screen, progress.completed_screens, progress.timer as needed
      } catch (err) {
        console.warn('[Level2Screen1] No progress found or error restoring:', err);
      }
      fetchLevel1CasesForTeam(teamMembers)
        .then((result) => {
          console.log('[Level2Screen1_CaseSelection] fetchLevel1CasesForTeam result:', result);
          setAllCases(result);
          setLoading(false);
        })
        .catch((err) => {
          console.error('[Level2Screen1_CaseSelection] Failed to load cases:', err);
          setError('Failed to load cases.');
          setLoading(false);
        });
    })();
  }, [teamMembers]);

  useEffect(() => {
    if (confirmModal.open || mobileCaseIndex !== null) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [confirmModal.open, mobileCaseIndex]);

  // Helper to save selected case to Supabase
  const handleSaveSelectedCase = async (_email: string, attemptOrCaseId: number | AttemptDetail) => {
    try {
      console.log('[handleSaveSelectedCase] attemptOrCaseId:', attemptOrCaseId);
      // Always resolve the hackathonData id, prefer attempt.hackathon_id if present
      let hackathonId: number | undefined;
      if (typeof attemptOrCaseId === 'number') {
        hackathonId = hackathonData.find(q => q.id === attemptOrCaseId)?.id;
      } else if ('hackathon_id' in attemptOrCaseId && typeof attemptOrCaseId.hackathon_id === 'number' && attemptOrCaseId.hackathon_id > 0) {
        // Use hackathon_id directly if present and valid (from DB row)
        hackathonId = attemptOrCaseId.hackathon_id;
      } else {
        // Fallback to extracting from question
        let qid: number | undefined;
        if (typeof attemptOrCaseId.question === 'object' && attemptOrCaseId.question.id) {
          qid = attemptOrCaseId.question.id;
        } else if (typeof attemptOrCaseId.question === 'string') {
          try {
            const parsed = JSON.parse(attemptOrCaseId.question);
            if (parsed && parsed.id) qid = parsed.id;
          } catch (e) {
            console.warn('[handleSaveSelectedCase] Failed to parse question string:', attemptOrCaseId.question, e);
          }
        }
        if (qid) hackathonId = hackathonData.find(q => q.id === qid)?.id;
      }
      if (!hackathonId) {
        console.error('[handleSaveSelectedCase] Could not resolve hackathonData id for selected case', { attemptOrCaseId, hackathonDataIds: hackathonData.map(q => q.id) });
        throw new Error('Could not resolve hackathonData id for selected case');
      }
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();
      if (authError || !user || !user.email) {
        console.error('[handleSaveSelectedCase] User not authenticated or email not found', { authError, user });
        throw new Error('User not authenticated or email not found');
      }
      console.log('[handleSaveSelectedCase] Saving selected case:', { email: user.email, caseId: hackathonId });
      const result = await saveSelectedCase({ email: user.email, caseId: hackathonId });
      console.log('[handleSaveSelectedCase] Save successful:', result);
      // Optionally show a toast or update UI
    } catch (err) {
      // Optionally handle error (show toast, etc)
      console.error('[handleSaveSelectedCase] Failed to save selected case:', err);
    }
  };
  // allCases is now set by fetchLevel1CasesForTeam and includes member.email for each case

  if (loading) {
    return <LoadingScreen title="CASE SELECTION QUEST" message="Loading cases from Level 1..." isMobileHorizontal={isMobile && isHorizontal} />;
  }
  if (error) {
    return <div className="p-6 text-red-400">{error}</div>;
  }

  // Add smooth fade-in and subtle pulse animation style
  const infoAnimStyle = `\n@keyframes fadePulse {\n  0% { opacity: 0; transform: scale(0.98); }\n  20% { opacity: 1; transform: scale(1.01); }\n  60% { opacity: 1; transform: scale(1); }\n  100% { opacity: 1; transform: scale(0.98); }\n}\n.info-animate {\n  animation: fadePulse 3.5s cubic-bezier(0.4,0,0.2,1) 1;\n}\n`;

  return (
    <>
      <style>{infoAnimStyle}</style>
      {/* Header for Case Selection */}
        <Header
          currentStageData={{
            icon: () => <span className="text-yellow-300">🗂️</span>,
            title: 'Case Selection',
            subtitle: 'Select',
            color: 'from-yellow-500 to-yellow-400',
            bgColor: 'from-yellow-900/20 to-yellow-900/10',
            accent: 'yellow',
            description: 'Select a case for the solution round',
            caseNumber: 1
          }}
          isMobileHorizontal={isMobile && isHorizontal}
          titleText="CASE SELECTION QUEST"
          savedTimer={savedTimer}
          autoSave={true}
          onSaveTimer={handleSaveTimer}
        />
      <div className="flex flex-col items-center justify-center bg-gray-800 overflow-hidden relative" style={{ height: 'calc(100vh - 80px)' }}>
        
        <div
          className={`w-full ${isMobile ? '' : 'max-w-3xl'} rounded-lg shadow-lg p-2 sm:p-4 flex flex-col items-center glass-3d-effect`}
          style={{ height: '100%', overflow: 'hidden', margin: '0 auto' }}
        >
          {/* Glassmorphism style for container */}
          <style>{`
            .glass-3d-effect {
              background: rgba(59, 130, 246, 0.12);
              box-shadow:
                0 8px 32px 0 rgba(31, 38, 135, 0.37),
                0 0 40px 8px #60a5fa88,
                0 0 80px 16px #a5b4fc55;
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
              border-radius: 1rem;
              border: 1.5px solid rgba(255, 255, 255, 0.18);
              transition: box-shadow 0.4s;
            }
          `}</style>
          <div className="mb-4 text-center font-[Verdana,Arial,sans-serif] w-full">
            <h1 className="text-xl font-bold mb-1 pixel-text text-white">Welcome Team <span className="team-highlight-animate">{teamName}</span></h1>
            {/* Team name highlight animation */}
            <style>{`
              .team-highlight-animate {
                color: #fde047;
                background: linear-gradient(90deg, #fde047 0%, #fbbf24 100%);
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-fill-color: transparent;
                font-weight: 900;
                text-shadow: 0 0 16px #fde047, 0 0 32px #fbbf24;
                filter: brightness(1.3);
              }
            `}</style>
            <div className="inline-block px-3 py-2 rounded-lg shadow bg-white bg-opacity-80 border border-yellow-200 mb-0.5">
              <h2 className="text-sm font-semibold info-animate pixel-text text-gray-900 m-0">
                Below are a set of cases that your team solved in level 1. Carefully select one case for the solution round based on which you want to show your innovation.
              </h2>
            </div>
          </div>

          {/* Responsive Case Grid */}
          {isMobile ? (
            <div className="w-full mb-2 px-1" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              <div className="grid grid-cols-5 gap-3 w-full">
                {allCases.map((_, idx) => (
                  <div
                    key={idx}
                    className="pixel-border-thick w-full min-h-[40px] flex flex-col items-center justify-center p-1 rounded-md bg-white border-gray-400 text-gray-900 font-black text-xs select-none shadow transition-transform duration-200 cursor-pointer hover:scale-105 hover:z-10 hover:shadow-2xl hover:bg-yellow-100"
                    style={{ fontFamily: 'Verdana,Arial,sans-serif' }}
                    onClick={() => setMobileCaseIndex(idx)}
                  >
                    Case {idx + 1}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="w-full px-2 py-2">
              <div className="grid grid-cols-5 gap-3 items-start justify-center">
                {allCases.map(({ member, attempt }, idx) => {
                  let q = '';
                  try {
                    const parsed = typeof attempt.question === 'string' ? JSON.parse(attempt.question) : attempt.question;
                    q = parsed.caseFile || parsed.text || 'No question text';
                  } catch {
                    q = 'No question text';
                  }
                  return (
                    <div
                      key={attempt.id + '-' + idx}
                      className={`pixel-border-thick w-full min-h-[80px] max-w-[160px] mx-auto flex flex-col items-center justify-between p-2 rounded-xl relative transition-all duration-200 cursor-pointer select-none shadow-lg ${
                        Object.values(selectedCases).includes(attempt.id)
                          ? 'border-amber-400 bg-amber-100' : 'border-gray-400 bg-white'
                      } hover:scale-105 hover:shadow-2xl`}
                      style={{ fontFamily: 'Verdana,Arial,sans-serif' }}
                    >
                      <div className="mb-1 mt-1">
                        <span className="font-black text-gray-900 pixel-text text-xs">Case {idx + 1}</span>
                      </div>
                      {/* Removed email display as requested */}
                      <button
                        className="pixel-border bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-gray-900 font-black pixel-text transition-all duration-200 flex items-center space-x-2 py-1 px-2 transform hover:scale-105 shadow-lg mt-2 mx-auto text-xs"
                        onClick={() => setModalCase({ question: q, member, attempt, idx })}
                      >
                        <span className="text-xs">Read Case</span>
                      </button>
                    </div>
                  );
                })}
                {/* Case Question Modal for desktop click */}
                <CaseQuestionModal
                  open={!!modalCase}
                  question={modalCase?.question || ''}
                  caseNumber={typeof modalCase?.idx === 'number' ? modalCase.idx + 1 : undefined}
                  onClose={() => setModalCase(null)}
                  onConfirm={() => {
                    if (modalCase) {
                      // Use attempt.hackathon_id if present, else fallback to attempt.question.id
                      const hackathonId = (modalCase.attempt as any).hackathon_id ?? (typeof modalCase.attempt.question === 'object' ? modalCase.attempt.question.id : undefined);
                      setConfirmModal({ open: true, email: modalCase.member.email, caseId: hackathonId });
                      setModalCase(null);
                    }
                  }}
                  onPrev={modalCase && modalCase.idx > 0 ? () => {
                    const prevIdx = modalCase.idx - 1;
                    const prevCase = allCases[prevIdx];
                    let q = '';
                    try {
                      const parsed = typeof prevCase.attempt.question === 'string' ? JSON.parse(prevCase.attempt.question) : prevCase.attempt.question;
                      q = parsed.caseFile || parsed.text || 'No question text';
                    } catch {
                      q = 'No question text';
                    }
                    setModalCase({ question: q, member: prevCase.member, attempt: prevCase.attempt, idx: prevIdx });
                  } : undefined}
                  onNext={modalCase && modalCase.idx < allCases.length - 1 ? () => {
                    const nextIdx = modalCase.idx + 1;
                    const nextCase = allCases[nextIdx];
                    let q = '';
                    try {
                      const parsed = typeof nextCase.attempt.question === 'string' ? JSON.parse(nextCase.attempt.question) : nextCase.attempt.question;
                      q = parsed.caseFile || parsed.text || 'No question text';
                    } catch {
                      q = 'No question text';
                    }
                    setModalCase({ question: q, member: nextCase.member, attempt: nextCase.attempt, idx: nextIdx });
                  } : undefined}
                  disablePrev={modalCase ? modalCase.idx === 0 : true}
                  disableNext={modalCase ? modalCase.idx === allCases.length - 1 : true}
                />
              </div>
            </div>
          )}

          {/* Confirm Modal (shared) */}
          <ConfirmModal
            open={confirmModal.open}
            onClose={() => setConfirmModal({ open: false, email: null, caseId: null })}
            onConfirm={async () => {
              if (confirmModal.email && confirmModal.caseId !== null) {
                onSelectCase(confirmModal.email, confirmModal.caseId);
                // Always pass hackathon_id, not attempt.id
                const hackathonId = (modalCase?.attempt as any)?.hackathon_id ?? (typeof modalCase?.attempt?.question === 'object' ? modalCase.attempt.question.id : confirmModal.caseId);
                await handleSaveSelectedCase(confirmModal.email, hackathonId);
                // Save HL2 progress for screen 1
                try {
                  const { data: { user }, error: authError } = await supabase.auth.getUser();
                  if (authError || !user || !user.id) throw new Error('User not authenticated');
                  const progressToSave = {
                    user_id: user.id,
                    current_screen: 1,
                    completed_screens: [1],
                    timer: 0, // Set actual timer value if available
                  };
                  console.log('[Level2Screen1] Saving progress:', progressToSave);
                  await saveLevel2Progress(progressToSave);
                } catch (err) {
                  console.error('[Level2Screen1] Failed to save progress:', err);
                }
                setConfirmModal({ open: false, email: null, caseId: null });
                onContinue();
                return;
              }
              setConfirmModal({ open: false, email: null, caseId: null });
            }}
            confirmText="CONFIRM & SELECT"
            title="Confirm Selection"
            message="Are you sure you want to select this case? This cannot be changed."
          />

          {/* Mobile Case Modal using CaseQuestionModal */}
          {isMobile && mobileCaseIndex !== null && (
            <CaseQuestionModal
              open={true}
              question={(() => {
                try {
                  const q = typeof allCases[mobileCaseIndex].attempt.question === 'string'
                    ? JSON.parse(allCases[mobileCaseIndex].attempt.question)
                    : allCases[mobileCaseIndex].attempt.question;
                  return q.caseFile || q.text || 'No question text';
                } catch {
                  return 'No question text';
                }
              })()}
              caseNumber={mobileCaseIndex + 1}
              onClose={() => setMobileCaseIndex(null)}
              onConfirm={() => {
                const { member, attempt } = allCases[mobileCaseIndex];
                setMobileCaseIndex(null); // Close modal before opening confirm
                setTimeout(() => {
                  // Use attempt.hackathon_id if present, else fallback to attempt.question.id
                  const hackathonId = (attempt as any).hackathon_id ?? (typeof attempt.question === 'object' ? attempt.question.id : undefined);
                  setConfirmModal({ open: true, email: member.email, caseId: hackathonId });
                }, 0);
              }}
              onPrev={mobileCaseIndex > 0 ? () => setMobileCaseIndex(mobileCaseIndex - 1) : undefined}
              onNext={mobileCaseIndex < allCases.length - 1 ? () => setMobileCaseIndex(mobileCaseIndex + 1) : undefined}
              disablePrev={mobileCaseIndex === 0}
              disableNext={mobileCaseIndex === allCases.length - 1}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Level2Screen1_CaseSelection;
