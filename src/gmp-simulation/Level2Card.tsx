
import React, { useState } from 'react';
import Level2Screen1_CaseSelection from './level2/Level2Screen1_CaseSelection';
import Level2Screen2 from './level2/Level2Screen2';
import Level2Screen3 from './level2/Level2Screen3';

interface TeamMember {
  name?: string;
  email: string;
}

interface Level2CardProps {
  teamName: string;
  teamMembers: TeamMember[];
}




interface Level2CardExtraProps {
  screen: number;
  onAdvanceScreen: () => void;
}

const Level2Card: React.FC<Level2CardProps & Level2CardExtraProps> = ({ teamName, teamMembers, screen, onAdvanceScreen }) => {
  const [selectedCases, setSelectedCases] = useState<{ [email: string]: number }>({});

  const handleSelectCase = (email: string, caseId: number) => {
    setSelectedCases((prev) => ({ ...prev, [email]: caseId }));
  };

  if (screen === 1) {
    return (
      <Level2Screen1_CaseSelection
        teamName={teamName}
        teamMembers={teamMembers}
        selectedCases={selectedCases}
        onSelectCase={handleSelectCase}
        onContinue={onAdvanceScreen}
      />
    );
  }
  if (screen === 2) return <Level2Screen2 onProceedConfirmed={onAdvanceScreen} />;
  if (screen === 3) return <Level2Screen3 />;
  return null;
};

export default Level2Card;
