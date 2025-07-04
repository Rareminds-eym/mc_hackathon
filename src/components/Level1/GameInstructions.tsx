import React, { useState, useEffect } from 'react';
import { useDeviceLayout } from '../../hooks/useOrientation';

// Use placeholder image for Trainer and use selected avatar for Intern
const TRAINER_IMG = "https://via.placeholder.com/40x40?text=T";
// Get avatar from localStorage, fallback to Intern1
const INTERN_IMG = typeof window !== "undefined"
  ? (localStorage.getItem("selectedAvatar") || "/characters/Intern1.png")
  : "/characters/Intern1.png";

interface GameInstructionsProps {
  selectedDefinition: string;
  onTutorialEnd?: () => void;
  startAtDefinition?: boolean; // <-- Add this prop
}

// Updated conversation with interactive instructions and new icons
const conversation = [
  {
    speaker: 'Trainer',
    icon: TRAINER_IMG,
    text: "Welcome to the game! I'm your Trainer. Ready to learn how to play?",
    pointer: 'left',
  },
  {
    speaker: 'Intern',
    icon: INTERN_IMG,
    text: "Hi Trainer! Yes, I'm ready. What should I do first?",
    pointer: 'right',
  },
  {
    speaker: 'Trainer',
    icon: TRAINER_IMG,
    text: "First, look at the definition that appears here. This is your clue!",
    pointer: 'left',
  },
  {
    speaker: 'Trainer',
    icon: TRAINER_IMG,
    text: "Now, try hovering over the words in the grid below. Notice how they highlight?",
    pointer: 'down',
    action: 'hover',
  },
  {
    speaker: 'Intern',
    icon: INTERN_IMG,
    text: "Yes, I see them highlight! Should I click one?",
    pointer: 'right',
  },
  {
    speaker: 'Trainer',
    icon: TRAINER_IMG,
    text: "Exactly! Click the word you think matches the definition. Give it a try now.",
    pointer: 'down',
    action: 'click',
  },
  {
    speaker: 'Intern',
    icon: INTERN_IMG,
    text: "Great! Let's play!",
    isLetsPlay: true,
    pointer: 'right',
  },
];

const GameInstructions: React.FC<GameInstructionsProps & { tutorialStep?: number }> = ({ selectedDefinition, onTutorialEnd, startAtDefinition, tutorialStep }) => {
  const [step, setStep] = useState(startAtDefinition ? conversation.length : 0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { isHorizontal, isMobile } = useDeviceLayout();
  const isMobileLandscape = isMobile && isHorizontal;

  // Determine if we're in conversation or showing the definition
  const inConversation = step < conversation.length;
  const current = inConversation
    ? conversation[step]
    : { speaker: 'Trainer', icon: TRAINER_IMG, text: selectedDefinition, pointer: 'left' };

  // Pointer direction for speech bubble
  const pointerDirection = current.pointer;

  useEffect(() => {
    setIsTyping(true);
    setDisplayedText('');
    let currentIndex = 0;
    const text = current.text || '';
    const typingInterval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(typingInterval);
      }
    }, 30);
    return () => clearInterval(typingInterval);
  }, [step, selectedDefinition]);

  // Call onTutorialEnd when tutorial is finished
  useEffect(() => {
    if (step === conversation.length && onTutorialEnd) {
      onTutorialEnd();
    }
  }, [step, onTutorialEnd]);

  // Update step if startAtDefinition changes
  useEffect(() => {
    if (startAtDefinition) {
      setStep(conversation.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startAtDefinition]);

  // Tailwind classes for pointer tail
  const tailBase = "absolute z-10 transition-all";
  let tailClass = "";
  let tailStyle = {};
  // Use same border color as the box (blue-400 or black)
  const borderColor = inConversation ? "#60a5fa" : "#000";

  if (isMobileLandscape) {
    // Remove tails in landscape mode
    tailClass = "hidden";
  } else if (pointerDirection === "left") {
    tailClass = `${tailBase} left-[-24px] bottom-[18px]`;
    tailStyle = {
      borderTop: "16px solid transparent",
      borderRight: `24px solid ${borderColor}`,
      borderBottom: "16px solid transparent",
      filter: `drop-shadow(-2px 0 0 ${borderColor})`,
      width: 0,
      height: 0,
    };
  } else if (pointerDirection === "right") {
    tailClass = `${tailBase} right-[-24px] bottom-[18px]`;
    tailStyle = {
      borderTop: "16px solid transparent",
      borderLeft: `24px solid ${borderColor}`,
      borderBottom: "16px solid transparent",
      filter: `drop-shadow(2px 0 0 ${borderColor})`,
      width: 0,
      height: 0,
    };
  } else if (pointerDirection === "down") {
    tailClass = `${tailBase} left-[40px] bottom-[-24px]`;
    tailStyle = {
      borderLeft: "16px solid transparent",
      borderRight: "16px solid transparent",
      borderTop: `24px solid ${borderColor}`,
      filter: `drop-shadow(0 2px 0 ${borderColor})`,
      width: 0,
      height: 0,
    };
  } else {
    tailClass = "hidden";
  }

  return (
    <div className="relative inline-block w-full">
      <style>
        {`
          .tutorial-highlight {
            position: relative;
            z-index: 100;
            box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3);
            border-radius: 18px;
            animation: pulse-highlight 1.5s infinite;
          }
          @keyframes pulse-highlight {
            0%, 100% { box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.5), 0 0 20px rgba(59, 130, 246, 0.3); }
            50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0.3), 0 0 30px rgba(59, 130, 246, 0.5); }
          }
        `}
      </style>
      <div
        data-tutorial-highlight="instructions"
        className={`relative bg-white ${
          inConversation
            ? "border-4 border-blue-400 animate-[fairyGlow_1.2s_infinite_alternate]"
            : "border-2 border-black"
        } rounded-[2rem_2rem_2rem_0.5rem] shadow-lg transition-shadow ml-[0.1rem] ${
          isMobileLandscape
            ? "p-2 text-xs min-h-[40px]"
            : "p-4 text-base min-h-[72px]"
        } min-w-full ${tutorialStep === 2 ? 'tutorial-highlight' : ''}`}
      >
        <div className={`flex items-start ${isMobileLandscape ? "gap-2" : "gap-4"}`}>
          <div
            className={`flex-shrink-0 rounded-full flex items-center justify-center ${
              current.speaker === "Trainer" ? "bg-blue-500" : ""
            } ${isMobileLandscape ? "w-8 h-8" : "w-16 h-16"}`}
          >
            {current.speaker === "Intern" ? (
              <img
                src={current.icon}
                alt={current.speaker}
                className={`${isMobileLandscape ? "w-8 h-8" : "w-16 h-16"} rounded-full object-cover border-2 border-green-400 shadow-[0_0_4px_1px_rgba(34,197,94,0.5)]`}
              />
            ) : (
              <img
                src={current.icon}
                alt={current.speaker}
                className={`${isMobileLandscape ? "w-4 h-4" : "w-8 h-8"} rounded-full object-cover`}
              />
            )}
          </div>
          <div className="flex-1">
            <div>
              <p className={`text-gray-800 leading-7 font-semibold ${isMobileLandscape ? "text-xs" : "text-base"}`}>
                {displayedText}
                {isTyping && (
                  <span
                    style={{
                      marginLeft: 2,
                      animation: 'blink 1s steps(1) infinite'
                    }}
                  >
                    |
                  </span>
                )}
              </p>
              {inConversation && (
                <div className={`flex gap-2 mt-2`}>
                  <button
                    className={`mt-2 px-3 py-1.5 rounded-xl bg-blue-500 text-white font-bold ${isMobileLandscape ? "text-xs" : "text-sm"} shadow transition-opacity outline-none mr-2 ${
                      isTyping ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-600"
                    }`}
                    onClick={() => setStep((s) => s + 1)}
                    disabled={isTyping}
                    aria-label="Next"
                  >
                    {current.isLetsPlay ? "Show Definition" : "Next"}
                  </button>
                  <button
                    className={`mt-2 px-3 py-1.5 rounded-xl bg-gray-200 text-gray-800 font-semibold ${isMobileLandscape ? "text-xs" : "text-sm"} shadow transition-opacity outline-none ${
                      isTyping ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-300"
                    }`}
                    onClick={() => setStep(conversation.length)}
                    disabled={isTyping}
                    aria-label="Skip Tutorial"
                  >
                    Skip Tutorial
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Pointer Tail - hidden in landscape mode */}
        {!isMobileLandscape && <div className={tailClass} style={tailStyle}></div>}
      </div>
    </div>
  );
};

export default GameInstructions;