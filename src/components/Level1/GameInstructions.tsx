import React, { useState, useEffect } from 'react';

// Use placeholder images for Trainer and Intern
const TRAINER_IMG = "https://via.placeholder.com/40x40?text=T";
const INTERN_IMG = "https://via.placeholder.com/40x40?text=I";

interface GameInstructionsProps {
  selectedDefinition: string;
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

const GameInstructions: React.FC<GameInstructionsProps> = ({ selectedDefinition }) => {
  const [step, setStep] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

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

  // Tailwind classes for pointer tail
  const tailBase = "absolute z-10 transition-all";
  let tailClass = "";
  let tailStyle = {};
  if (pointerDirection === "left") {
    tailClass = `${tailBase} left-[-24px] bottom-[18px]`;
    tailStyle = {
      borderTop: "16px solid transparent",
      borderRight: "24px solid #fff",
      borderBottom: "16px solid transparent",
      filter: "drop-shadow(-2px 0 0 #000)",
      width: 0,
      height: 0,
    };
  } else if (pointerDirection === "right") {
    tailClass = `${tailBase} right-[-24px] bottom-[18px]`;
    tailStyle = {
      borderTop: "16px solid transparent",
      borderLeft: "24px solid #fff",
      borderBottom: "16px solid transparent",
      filter: "drop-shadow(2px 0 0 #000)",
      width: 0,
      height: 0,
    };
  } else if (pointerDirection === "down") {
    tailClass = `${tailBase} left-[40px] bottom-[-24px]`;
    tailStyle = {
      borderLeft: "16px solid transparent",
      borderRight: "16px solid transparent",
      borderTop: "24px solid #fff",
      filter: "drop-shadow(0 2px 0 #000)",
      width: 0,
      height: 0,
    };
  } else {
    tailClass = "hidden";
  }

  return (
    <div className="relative inline-block">
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          @keyframes fairyGlow {
            0% {
              box-shadow: 0 0 0 8px rgba(59,130,246,0.10), 0 2px 8px rgba(0,0,0,0.08);
            }
            50% {
              box-shadow: 0 0 16px 12px rgba(59,130,246,0.28), 0 2px 8px rgba(0,0,0,0.08);
            }
            100% {
              box-shadow: 0 0 0 8px rgba(59,130,246,0.10), 0 2px 8px rgba(0,0,0,0.08);
            }
          }
        `}
      </style>
      <div
        className={`relative bg-white border-4 ${
          inConversation ? "border-blue-500 animate-[fairyGlow_1.2s_infinite_alternate]" : "border-black"
        } rounded-[2rem_2rem_2rem_0.5rem] p-4 text-base min-w-full min-h-[72px] ml-[0.1rem] shadow-lg transition-shadow`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
              current.speaker === "Trainer" ? "bg-blue-500" : "bg-emerald-500"
            }`}
          >
            <img
              src={current.icon}
              alt={current.speaker}
              className="w-8 h-8 rounded-full object-cover"
            />
          </div>
          <div className="flex-1">
            <div>
              <p className="text-gray-800 leading-7 font-semibold text-base">
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
                <div className="flex gap-2 mt-2">
                  <button
                    className={`mt-2 px-3 py-1.5 rounded-xl bg-blue-500 text-white font-bold text-sm shadow transition-opacity outline-none mr-2 ${
                      isTyping ? "opacity-60 cursor-not-allowed" : "hover:bg-blue-600"
                    }`}
                    onClick={() => setStep((s) => s + 1)}
                    disabled={isTyping}
                    aria-label="Next"
                  >
                    {current.isLetsPlay ? "Show Definition" : "Next"}
                  </button>
                  <button
                    className={`mt-2 px-3 py-1.5 rounded-xl bg-gray-200 text-gray-800 font-semibold text-sm shadow transition-opacity outline-none ${
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
        {/* Pointer Tail */}
        <div className={tailClass} style={tailStyle}></div>
      </div>
    </div>
  );
};

export default GameInstructions;