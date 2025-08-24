import React from 'react';
import { Question } from './HackathonData';
import { Level1Card } from './Level1Card';
import Level2Card from './Level2Card';
import { useEffect, useState } from 'react';
import { getTeamMembersBySession, getTeamNameBySession, TeamMember } from './level2/getTeamMembersBySession';

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

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [teamName, setTeamName] = useState<string>('');

  useEffect(() => {
    if (session_id) {
      getTeamMembersBySession(session_id).then(setTeamMembers);
      getTeamNameBySession(session_id).then(setTeamName);
    }
  }, [session_id]);

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

  if (level === 2) {
    if (!session_id || teamMembers.length === 0 || !teamName) {
      return <div className="p-6 text-white">Loading team members...</div>;
    }
    return <Level2Card teamName={teamName} teamMembers={teamMembers} />;
  }
};

export { QuestionCard };
export default QuestionCard;
