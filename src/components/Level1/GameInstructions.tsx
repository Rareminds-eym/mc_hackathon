import React, { useState, useEffect} from 'react';
import { useDeviceLayout } from '../../hooks/useOrientation';

// Use placeholder image for Trainer and use selected avatar for Intern
const TRAINER_IMG = "/characters/Trainer2.png";
// Get avatar from localStorage, fallback to Intern1
const INTERN_IMG = typeof window !== "undefined"
  ? (localStorage.getItem("selectedAvatar") || "/characters/Intern1.png")
  : "/characters/Intern1.png";

interface GameInstructionsProps {
  selectedDefinition: string;
  onDefinitionsStart?: () => void; // Renamed for clarity
  resetKey?: number;
}

// Updated conversation with interactive instructions and new icons
const conversation = [
  {
    speaker: 'Trainer',
    icon: TRAINER_IMG,
    text: "Welcome onboard! I’m your Trainer — here to help you master Good Manufacturing Practices.",
    pointer: 'left',
  },
  {
    speaker: 'Intern',
    icon: INTERN_IMG,
    text: "Hi Trainer! I’m ready to give my best. What’s today’s challenge?",
    pointer: 'right',
  },
  {
    speaker: 'Trainer',
    icon: TRAINER_IMG,
    text: "Your mission: stay sharp, think fast, and keep every batch compliant.",
    pointer: 'left',
  },
  {
    speaker: 'Trainer',
    icon: TRAINER_IMG,
    text: "Remember, in GMP, every detail counts — one mistake can stop the whole line.",
    pointer: 'left',
  },
  {
    speaker: 'Intern',
    icon: INTERN_IMG,
    text: "No pressure! Let’s make zero mistakes and ace this.",
    pointer: 'right',
  },
  {
    speaker: 'Trainer',
    icon: TRAINER_IMG,
    text: "Good spirit! Ready to jump in?",
    pointer: 'left',
  },
  {
    speaker: 'Intern',
    icon: INTERN_IMG,
    text: "I’m ready — let’s play!",
    isLetsPlay: true,
    pointer: 'right',
  },
  // Countdown step (no speaker, just countdown text)
  {
    speaker: null,
    icon: null,
    text: '', // Will be set dynamically
    isCountdown: true,
    pointer: null,
  },
];


const GameInstructions: React.FC<GameInstructionsProps & { tutorialStep?: number, forceStep?: number | string, onStepChange?: (step: number, atDefinitions?: boolean) => void }> = ({ selectedDefinition, onDefinitionsStart, tutorialStep, forceStep, onStepChange }) => {
  const [step, setStep] = useState(0); // Always start at 0
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const { isHorizontal, isMobile } = useDeviceLayout();
  const isMobileLandscape = isMobile && isHorizontal;

  // Determine if we're in conversation, countdown, or showing the definition
  const inConversation = step < conversation.length - 1;
  const inCountdown = step === conversation.length - 1;
  const current = inConversation
    ? conversation[step]
    : inCountdown
      ? { speaker: null, icon: null, text: `Starting in ${countdown}...`, pointer: null }
      : { speaker: 'Trainer', icon: TRAINER_IMG, text: selectedDefinition, pointer: 'left' };

  // Pointer direction for speech bubble
  const pointerDirection = current.pointer;

  // Countdown effect: reset countdown when entering countdown step
  useEffect(() => {
    if (inCountdown) {
      setCountdown(3);
    }
  }, [inCountdown]);

  // Countdown interval effect
  useEffect(() => {
    if (inCountdown && countdown > 0) {
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev > 1) {
            return prev - 1;
          } else {
            clearInterval(interval);
            setStep((s) => s + 1); // Move to definition
            return 0;
          }
        });
      }, 800);
      return () => clearInterval(interval);
    }
  }, [inCountdown, countdown]);

  useEffect(() => {
    if (!inCountdown) {
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
    }
  }, [step, selectedDefinition, current.text, inCountdown]);

  // Call onDefinitionsStart when definitions are shown
  useEffect(() => {
    if (step === conversation.length && onDefinitionsStart) {
      onDefinitionsStart();
    }
  }, [step, onDefinitionsStart]);

  // Jump to definitions if forceStep === 'definitions'
  useEffect(() => {
    if (forceStep === 'definitions') {
      setStep(conversation.length);
    } else if (forceStep === 0) {
      setStep(0);
    }
  }, [forceStep]);

  // Notify parent of step changes
  useEffect(() => {
    if (onStepChange) {
      onStepChange(step, step === conversation.length);
    }
  }, [step, onStepChange]);

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
            : inCountdown
              ? "border-4 border-blue-400 animate-[fairyGlow_1.2s_infinite_alternate]"
              : "border-2 border-black"
        } rounded-[2rem_2rem_2rem_0.5rem] shadow-lg transition-shadow ml-[0.1rem] ${
          isMobileLandscape
            ? "p-2 text-xs min-h-[40px]"
            : "p-4 text-base min-h-[72px]"
        } min-w-full ${
          (inConversation || inCountdown || (!inConversation && !inCountdown)) && tutorialStep === 2 ? 'tutorial-highlight' : ''
        }`}
      >
        <div className={`flex items-start ${isMobileLandscape ? "gap-2" : "gap-4"}`}>
          {current.icon && (
            <div
              className={`flex-shrink-0 rounded-full flex items-center justify-center ${
                current.speaker === "Trainer" ? "bg-yellow-500" : ""
              } ${isMobileLandscape ? "w-14 h-14" : "w-16 h-16"}`}
            >
              <img
                src={current.icon}
                alt={current.speaker || ''}
                className={`${isMobileLandscape ? "w-14 h-14" : "w-16 h-16"} rounded-full object-cover `}
              />
            </div>
          )}
          <div className="flex-1">
            <div>
              <p className={`text-gray-800 leading-7 font-semibold ${isMobileLandscape ? "text-xs" : "text-base"}`}>
                {inCountdown ? `Starting in ${countdown}...` : displayedText}
                {isTyping && !inCountdown && (
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
                    {current && 'isLetsPlay' in current && current.isLetsPlay ? "Show Countdown" : "Next"}
                  </button>
                  <button
                    className={`mt-2 px-3 py-1.5 rounded-xl bg-gray-200 text-gray-800 font-semibold ${isMobileLandscape ? "text-xs" : "text-sm"} shadow transition-opacity outline-none ${
                      isTyping ? "opacity-60 cursor-not-allowed" : "hover:bg-gray-300"
                    }`}
                    onClick={() => setStep(conversation.length - 1)}
                    disabled={isTyping}
                    aria-label="Skip Conversation"
                  >
                    Skip Conversation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        {/* Pointer Tail - hidden in landscape mode */}
        {!isMobileLandscape && pointerDirection && <div className={tailClass} style={tailStyle}></div>}
      </div>
    </div>
  );
};

export default GameInstructions;