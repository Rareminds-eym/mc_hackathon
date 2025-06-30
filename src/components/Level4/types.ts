export interface Case {
  id: number;
  title: string;
  scenario: string;
  questions: {
    violation: {
      question: string;
      options: string[];
      correct: number;
    };
    rootCause: {
      question: string;
      options: string[];
      correct: number;
    };
    impact: {
      question: string;
      options: string[];
      correct: number;
    };
  };
}

export interface GameState {
  currentCase: number;
  answers: {
    violation: number | null;
    rootCause: number | null;
    impact: number | null;
  };
  score: number;
  totalQuestions: number;
  showFeedback: boolean;
  gameComplete: boolean;
}

export interface DragItem {
  id: number;
  text: string;
  isCorrect: boolean;
}