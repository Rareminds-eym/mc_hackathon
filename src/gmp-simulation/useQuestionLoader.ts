// Shared hook for Level1 and Level2 simulation components
// Provides: hasSavedProgress, progressLoaded, savedProgressInfo, loadSavedProgress, clearSavedProgress, selectRandomQuestions, restoreQuestionsAnswers
import { useState, useCallback } from "react";
import { hackathonData } from "./HackathonData";
import { supabase } from "../lib/supabase";


import type { Question } from "./HackathonData";

// Generic game state for Level1/Level2
export type GameStateBase = {
  questions: Question[];
  answers: { violation: string; rootCause: string; solution: string }[];
  currentQuestion: number;
  gameStarted: boolean;
  gameCompleted: boolean;
  [key: string]: unknown;
};

export interface SavedAttemptDetail {
  question_index: number;
  question: Question;
  answer: { violation: string; rootCause: string; solution: string };
}

export function useQuestionLoader(
  session_id: string | null,
  email: string | null,
  moduleNumber: number
) {
  const [hasSavedProgress, setHasSavedProgress] = useState<boolean>(false);
  const [progressLoaded, setProgressLoaded] = useState<boolean>(false);
  const [savedProgressInfo, setSavedProgressInfo] = useState<SavedAttemptDetail[] | null>(null);

  // Select 5 random questions
  const selectRandomQuestions = useCallback((): Question[] => {
    const shuffled = [...hackathonData].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }, []);

  // Load saved progress from DB
  const loadSavedProgress = useCallback(
  async (setGameState: (cb: (prev: GameStateBase) => GameStateBase) => void) => {
      if (!session_id || !email || progressLoaded) return;
      const { data: attemptDetails, error } = await supabase
        .from("attempt_details")
        .select("*")
        .eq("email", email)
        .eq("session_id", session_id)
        .eq("module_number", moduleNumber)
        .order("question_index", { ascending: true });
      if (error) {
        setProgressLoaded(true);
        return;
      }
      if (attemptDetails && attemptDetails.length > 0) {
        setHasSavedProgress(true);
        // Reconstruct questions/answers arrays
        const savedQuestionData = (attemptDetails as SavedAttemptDetail[]).map(detail => ({
          index: detail.question_index,
          question: detail.question,
          answer: detail.answer
        })).sort((a, b) => a.index - b.index);
        let finalQuestions: Question[], finalAnswers: { violation: string; rootCause: string; solution: string }[];
        if (savedQuestionData.length < 5) {
          const allQuestions = selectRandomQuestions();
          const allAnswers = allQuestions.map(() => ({ violation: "", rootCause: "", solution: "" }));
          savedQuestionData.forEach(({ index, question, answer }) => {
            if (index < 5 && question) {
              allQuestions[index] = question;
              allAnswers[index] = answer || { violation: "", rootCause: "", solution: "" };
            }
          });
          finalQuestions = allQuestions;
          finalAnswers = allAnswers;
        } else {
          finalQuestions = savedQuestionData.map(item => item.question).filter(q => q) as Question[];
          finalAnswers = savedQuestionData.map(item => item.answer || { violation: "", rootCause: "", solution: "" });
          if (finalQuestions.length < 5) {
            const additionalQuestions = selectRandomQuestions();
            while (finalQuestions.length < 5) {
              finalQuestions.push(additionalQuestions[finalQuestions.length]);
              finalAnswers.push({ violation: "", rootCause: "", solution: "" });
            }
          }
        }
  setGameState((prev: GameStateBase) => ({
          ...prev,
          questions: finalQuestions,
          answers: finalAnswers,
          currentQuestion: 0,
          gameStarted: false,
          gameCompleted: false,
        }));
        setSavedProgressInfo(attemptDetails as SavedAttemptDetail[]);
      }
      setProgressLoaded(true);
    },
    [session_id, email, moduleNumber, progressLoaded, selectRandomQuestions]
  );

  // Clear saved progress
  const clearSavedProgress = useCallback(async () => {
    if (!session_id || !email) return;
    await supabase
      .from("attempt_details")
      .delete()
      .eq("email", email)
      .eq("session_id", session_id)
      .eq("module_number", moduleNumber);
    setHasSavedProgress(false);
    setProgressLoaded(false);
    setSavedProgressInfo(null);
  }, [session_id, email, moduleNumber]);

  // Restore questions/answers (for future extensibility)
  const restoreQuestionsAnswers = useCallback(
    (questions: Question[], answers: { violation: string; rootCause: string; solution: string }[]) => {
      return { questions, answers };
    },
    []
  );

  return {
    hasSavedProgress,
    progressLoaded,
    savedProgressInfo,
    loadSavedProgress,
    clearSavedProgress,
    selectRandomQuestions,
    restoreQuestionsAnswers,
  };
}
