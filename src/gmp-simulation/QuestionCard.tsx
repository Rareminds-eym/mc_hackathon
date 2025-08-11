import React from 'react';
import { Question } from './HackathonData';
import { Level1Card } from './Level1Card';
import { Level2Card } from './Level2Card';

interface QuestionCardProps {
  question: Question;
  level: number;
  onAnswer: (answer: Partial<{ violation: string; rootCause: string; solution: string }>) => void;
  onNext: () => void;
  currentAnswer?: { violation?: string; rootCause?: string; solution?: string };
  level1Answers?: { violation?: string; rootCause?: string; solution?: string };
  session_id?: string | null;
  email?: string | null;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  level,
  onAnswer,
  onNext,
  currentAnswer,
  level1Answers,
  session_id,
  email
}) => {

  if (level === 1) {
    return (
      <Level1Card
        question={question}
        onAnswer={onAnswer}
        onNext={onNext}
        currentAnswer={currentAnswer}
        session_id={session_id}
        email={email}
      />
    );
  }

  // Level 2
  return (
    <Level2Card
      question={question}
      onAnswer={onAnswer}
      onNext={onNext}
      currentAnswer={currentAnswer}
      level1Answers={level1Answers}
      session_id={session_id}
      email={email}
    />
  );
};

export { QuestionCard };
export default QuestionCard;
