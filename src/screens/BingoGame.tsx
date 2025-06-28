import React, { useRef, useState } from 'react';
import { useBingoGame } from '../hooks/useBingoGame';
import { useTutorial } from '../hooks/useTutorial';
import Navbar from '../components/Level1/Navbar';
import BingoGrid from '../components/Level1/BingoGrid';
import GameInstructions from '../components/Level1/GameInstructions';
import GameCompleteModal from '../components/Level1/GameCompleteModal';
import AnswerModal from '../components/Level1/AnswerModal';
import TutorialToast from '../components/Level1/TutorialToast';
import { Clock } from 'lucide-react';

const BingoGame: React.FC = () => {
  const {
    cells,
    completedLines,
    score,
    selectedDefinition,
    answerFeedback,
    rowsSolved,
    gameComplete,
    toggleCell,
    resetGame,
    closeAnswerModal,
    isInCompletedLine,
  } = useBingoGame();

  const {
    isActive: tutorialActive,
    currentStep,
    nextStep,
    skipTutorial,
    onUserInteraction,
    resetTutorial,
    waitingForInteraction
  } = useTutorial();

  // Timer state for this component
  const [timer, setTimer] = React.useState(0);

  React.useEffect(() => {
    if (gameComplete) return; // Stop timer when game is complete
    const interval = setInterval(() => {
      setTimer((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [gameComplete]);

  const handleBackClick = () => {
    console.log('Back button clicked');
    // Add navigation logic here
  };

  const handleHomeClick = () => {
    console.log('Home button clicked');
    // Add navigation logic here
  };

  const handleCellClick = (id: number) => {
    toggleCell(id);
    if (waitingForInteraction) {
      onUserInteraction();
    }
  };

  // Inline styles for layout (matching the requested flex/grid structure)
  const rootStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: 'url("/backgrounds/BingoBg3.jpg") center center / cover no-repeat',
    display: 'flex',
    flexDirection: 'column',
  };
  const mainStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
  };
  const gridStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '36rem', // 768px
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    height: '100%',
  };
  const colStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };
  const colInnerStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '48rem', // 448px
  };
  const footerStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '1rem 0',
    color: 'white',
    fontSize: '1.2rem',
    opacity: 0.75,
  };

  // Timer formatting (copied from Navbar)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Background music state and ref
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrack, setCurrentTrack] = useState('/sounds/bgm.mp3');
  const [isEnabled] = useState(true); // You can control this with a mute button if needed
  const effectiveVolume = 0.25;

  React.useEffect(() => {
    // Play sound when BingoGame mounts or settings change
    const audio = audioRef.current;
    if (audio && isEnabled) {
      audio.volume = effectiveVolume;
      setCurrentTrack('/bgm.mp3');
      // Try to play on user interaction for autoplay policy
      const playAudio = () => {
        audio.play().catch(() => {});
        window.removeEventListener('pointerdown', playAudio);
        window.removeEventListener('keydown', playAudio);
      };
      window.addEventListener('pointerdown', playAudio);
      window.addEventListener('keydown', playAudio);
      // Try to play immediately
      audio.play().catch(() => {});
      return () => {
        audio.pause();
        audio.currentTime = 0;
        window.removeEventListener('pointerdown', playAudio);
        window.removeEventListener('keydown', playAudio);
      };
    }
  }, [isEnabled, effectiveVolume, setCurrentTrack]);

  return (
    <div style={rootStyle}>
      <Navbar 
        score={score}
        rowsSolved={rowsSolved}
        onBackClick={handleBackClick}
        onHomeClick={handleHomeClick}
        onResetTutorial={resetTutorial}
      />
      <div style={mainStyle}>
        <div style={{ ...gridStyle, position: 'relative' }}>
          {/* Trainer character image on the left */}
          <img
            src="/characters/trainer.png"
            alt="Trainer Character"
            style={{
              height: '340px',
              position: 'absolute',
              left: '-360px',
              top: '70%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          />
          <img
            src="/logos/Bingo.png"
            alt="Bingo Logo"
            style={{
              height: '200px',
              position: 'absolute',
              left: '-340px',
              top: '20%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              pointerEvents: 'none',
            }}
          />
          {/* Timer clock above intern character */}
          <div
            style={{
              position: 'absolute',
              right: '-260px',
              top: '30%',
              transform: 'translateY(-100%)',
              zIndex: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <div
              style={{
                background: '#fff',
                border: '2px solid #2563eb',
                borderRadius: '1.5rem',
                padding: '0.5rem 1.25rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: 700,
                fontSize: '1.75rem',
                color: '#2563eb',
              }}
            >
              <Clock style={{ width: 36, height: 36, color: '#2563eb' }} />
              <span>{formatTime(timer)}</span>
            </div>
          </div>
          {/* Top - Instructions */}
          <div style={colStyle}>
            <div style={colInnerStyle}>
              <GameInstructions selectedDefinition={selectedDefinition} />
            </div>
          </div>
          {/* Bottom - Bingo Grid with intern character on the right */}
          <div style={{ ...colStyle, position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={colInnerStyle}>
              <BingoGrid
                cells={cells}
                completedLines={completedLines}
                gameComplete={gameComplete}
                onCellClick={handleCellClick}
                isInCompletedLine={isInCompletedLine}
              />
            </div>
            {/* Intern character image on the right */}
            <img
              src="/characters/intern.png"
              alt="Intern Character"
              style={{
                height: '340px',
                position: 'absolute',
                right: '-360px',
                top: '64%',
                transform: 'translateY(-50%)',
                zIndex: 2,
                pointerEvents: 'none',
              }}
            />
          </div>
        </div>
      </div>
      <GameCompleteModal isVisible={gameComplete} onPlayAgain={resetGame} score={score} />
      <AnswerModal
        isVisible={answerFeedback.isVisible}
        isCorrect={answerFeedback.isCorrect}
        selectedTerm={answerFeedback.selectedTerm}
        correctDefinition={answerFeedback.correctDefinition}
        onClose={closeAnswerModal}
      />
      
      {/* Tutorial Toast */}
      <TutorialToast
        step={currentStep}
        onNext={nextStep}
        onSkip={skipTutorial}
        isVisible={tutorialActive}
      />

      <div style={footerStyle}>
        Copyright © 2025 Rareminds.
      </div>
      {/* Background music audio element */}
      <audio ref={audioRef} src={currentTrack} loop />
    </div>
  );
};

export default BingoGame;