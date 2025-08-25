import React, { useEffect, useState } from "react";
import { useDeviceLayout } from "../../hooks/useOrientation";
import BriefPopup from "./components/BriefPopup";
import LoadingScreen from "./components/LoadingScreen";
import { supabase } from "../../lib/supabase";
import { hackathonData } from "../HackathonData";
import Level2SolutionCard from "./Level2SolutionCard";
import Header from "./components/Header";
import ConfirmModal from "./ui/ConfirmModal";
import { saveLevel2TimerState } from "./level2ProgressHelpers";
import {
  restoreHL2Progress,
  saveHL2Progress,
} from "./level2Services";

interface Level2Screen2Props {
  onProceedConfirmed?: () => void;
}

const Level2Screen2: React.FC<Level2Screen2Props> = ({ onProceedConfirmed }) => {
  const [selectedCaseId, setSelectedCaseId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showBrief, setShowBrief] = useState(false);
  const [selectedSolution, setSelectedSolution] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  // Track drag interaction time (in seconds)
  const [dragInteractionTime, setDragInteractionTime] = useState<number>(0);
  const { isMobile, isHorizontal } = useDeviceLayout();
  const isMobileHorizontal = isMobile && isHorizontal;

  // Timer logic: read persistent start time and calculate elapsed
  const [savedTimer, setSavedTimer] = useState<number | null>(null);
  useEffect(() => {
    const timerStart = window.sessionStorage.getItem("level2_timer_start");
    if (timerStart) {
      const elapsed = Math.floor(
        (Date.now() - parseInt(timerStart, 10)) / 1000
      );
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
        console.error('[Level2Screen2] Failed to auto-save timer:', err);
      }
    },
    []
  );

  useEffect(() => {
    const fetchProgressAndCase = async () => {
      setLoading(true);
      setError(null);
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError || !user || !user.id)
          throw new Error("User not authenticated");

        // Restore progress
        const progress = await restoreHL2Progress(user.id);
        console.log("[Level2Screen2] Restored progress:", progress);

        // Fetch selected case
        const { data, error } = await supabase
          .from("selected_cases")
          .select("case_id")
          .eq("email", user.email)
          .maybeSingle();
        if (error) throw error;

        if (data) {
          setSelectedCaseId(data.case_id);
        } else {
          setSelectedCaseId(null);
        }
      } catch (err: any) {
        console.error("[Level2Screen2] Error fetching case:", err);
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchProgressAndCase();

    // Hide brief if not in mobile horizontal
    if (!isMobileHorizontal && showBrief) {
      setShowBrief(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobileHorizontal]);

    // Save selected solution to Supabase (solution + timer + drag_interaction_time)
  // Helper to format seconds as HH:MM:SS
  function formatSecondsToHHMMSS(seconds: number | null | undefined): string | null {
    if (typeof seconds !== 'number' || isNaN(seconds)) return null;
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [h, m, s]
      .map((v) => v.toString().padStart(2, '0'))
      .join(':');
  }

  const saveSelectedSolution = async (solution: string, timer?: number | null, dragInteractionTime?: number | null) => {
    const session_id = window.sessionStorage.getItem("session_id") || "";
    const email = window.sessionStorage.getItem("email") || "";
    const module_number = 6;
    const question_index = 0;

    if (!session_id || !email) {
      console.warn(
        "[DEBUG] Missing session_id or email, aborting save."
      );
      return;
    }

    const question = hackathonData.find((q) => q.id === selectedCaseId);
    if (!question) return;

    const is_correct = solution === question.correctSolution;
    const score = is_correct ? 30 : 0;

    const dragInteractionTimeFormatted = formatSecondsToHHMMSS(dragInteractionTime);
    console.log('[DEBUG] Saving solution:', {
      solution,
      timer,
      dragInteractionTime,
      dragInteractionTimeFormatted,
      typeofDragInteractionTime: typeof dragInteractionTime,
    });

    const { error } = await supabase.from("selected_solution").upsert(
      [
        {
          session_id,
          email,
          module_number,
          question_index,
          solution,
          is_correct,
          score,
          timer: typeof timer === 'number' ? timer : null,
          drag_interaction_time: dragInteractionTimeFormatted,
        },
      ],
      { onConflict: "session_id,email,module_number" }
    );

    if (error) {
      console.error(
        "[DEBUG] Error saving selected solution:",
        error.message,
        error.details
      );
    }
  };

  const handleProceed = async () => {
    setLoading(true);
    try {
      // Pass savedTimer to saveSelectedSolution
      await saveSelectedSolution(selectedSolution, savedTimer, dragInteractionTime);
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user || !user.id)
        throw new Error("User not authenticated");

      // Get existing progress to merge completed screens
      const existingProgress = await restoreHL2Progress(user.id);
      const existingCompletedScreens =
        existingProgress?.completed_screens || [];

      // Merge current screen with existing completed screens
      const completedScreens = [...existingCompletedScreens];
      if (!completedScreens.includes(2)) {
        completedScreens.push(2);
      }

      const progressToSave = {
        user_id: user.id,
        current_screen: 3, // Move to next screen
        completed_screens: completedScreens,
      };

      console.log("[Level2Screen2] Saving progress:", progressToSave);
      await saveHL2Progress(progressToSave);

      if (onProceedConfirmed) onProceedConfirmed();
    } catch (err: any) {
      console.error("[Level2Screen2] Error saving progress:", err);
      setError("Failed to save progress: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <LoadingScreen
        title="SOLUTION QUEST"
        message="Preparing selected case for solution round..."
        isMobileHorizontal={isMobileHorizontal}
      />
    );

  if (error) return <div className="p-6 text-red-400">{error}</div>;
  if (selectedCaseId == null)
    return <div className="p-6 text-yellow-300">No case selected.</div>;

  // Find the question data for the selected case
  const question = hackathonData.find((q) => q.id === selectedCaseId);
  if (!question)
    return <div className="p-6 text-red-400">Selected case not found.</div>;

  return (
    <>
      {/* Header for Solution Round */}
      <Header
        currentStageData={{
          icon: () => <span className="text-blue-300">💡</span>,
          title: "Solution Round",
          subtitle: "Solve",
          color: "from-blue-500 to-blue-400",
          bgColor: "from-blue-900/20 to-blue-900/10",
          accent: "blue",
          description: "Submit your solution for the selected case",
          caseNumber: 2,
        }}
        isMobileHorizontal={isMobileHorizontal}
        selectedCase={
          selectedCaseId
            ? { email: "", case_id: selectedCaseId, updated_at: "" }
            : undefined
        }
        titleText="SOLUTION QUEST"
        onShowBrief={() => setShowBrief(true)}
        onProceed={selectedSolution ? () => setShowConfirm(true) : undefined}
        canProceed={!!selectedSolution}
        savedTimer={savedTimer || undefined}
        autoSave={true}
        onSaveTimer={handleSaveTimer}
      />

       {/* Confirm Modal for Proceed */}
      <ConfirmModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={() => {
          setShowConfirm(false);
          handleProceed();
        }}
        confirmText="CONFIRM & PROCEED"
        title="CAUTION"
        message="Are you sure you want to submit your solution? This action cannot be undone."
      />

      {/* Mobile Brief Popup (only in mobile horizontal) */}
      <BriefPopup
        show={showBrief}
        description={question.caseFile}
        isMobileHorizontal={isMobileHorizontal}
        onClose={() => setShowBrief(false)}
      />

      <Level2SolutionCard
        question={question}
        selectedSolution={selectedSolution}
        setSelectedSolution={setSelectedSolution}
        onDragInteraction={setDragInteractionTime}
      />
    </>
  );
};

export default Level2Screen2;
