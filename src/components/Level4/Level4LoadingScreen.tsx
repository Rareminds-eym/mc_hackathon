import React, { useEffect, useState } from "react";
import { useDeviceLayout } from "../../hooks/useOrientation";
import Animation_manufacture from './animated_manufacture';

interface Level4LoadingScreenProps {
  onComplete?: () => void;
}

const Level4LoadingScreen: React.FC<Level4LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const { isMobile, isHorizontal } = useDeviceLayout();
  
  // GMP tips to display during loading
  const gmpTips = [
    "GMP ensures products are consistently produced according to quality standards",
    "Document everything: If it's not written down, it didn't happen",
    "Risk assessment is a critical part of GMP compliance",
    "Cross-contamination prevention is essential in manufacturing facilities",
    "Proper personnel training is fundamental to GMP compliance",
    "Quality cannot be tested into a product, it must be built in",
    "Always follow established SOPs to maintain consistency",
    "Equipment validation ensures reliable manufacturing processes",
    "Change control procedures protect product quality",
    "Root cause analysis helps prevent recurrence of deviations"
  ];
  
  const [currentTip, setCurrentTip] = useState(0);

  useEffect(() => {
    if (progress < 100) {
      // Progress loading effect
      const timer = setTimeout(() => setProgress(progress + 2 + Math.random() * 3), 320);
      return () => clearTimeout(timer);
    } else {
      // Complete loading
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  // Cycle through GMP tips every 3 seconds
  useEffect(() => {
    const tipTimer = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % gmpTips.length);
    }, 3000);
    
    return () => clearInterval(tipTimer);
  }, []);

  // Prevent scrolling when loading screen is visible
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full flex items-center justify-center" style={{minHeight: '100vh', minWidth: '100vw', position: 'relative'}}>
      {/* Animated manufacturing background */}
      <div className="absolute inset-0 w-full h-full z-0 pointer-events-none select-none">
        <Animation_manufacture />
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 to-indigo-900/50 z-10" />
      
      {/* Main loading container */}
      <div
        className="z-20 rounded-2xl mb-[16px] backdrop-blur-sm flex flex-col justify-center items-center"
        style={{
          backgroundColor: "rgba(22, 79, 95, 0.7)",
          boxShadow: "0 8px 32px rgba(31, 38, 135, 0.4)",
          border: "1px solid rgba(59, 130, 246, 0.5)",
          borderRadius: "1.5rem",
          width: isMobile ? "96vw" : "440px",
          maxWidth: isMobile ? "98vw" : "440px",
          minWidth: isMobile ? "220px" : "320px",
          height: isMobile ? "auto" : "280px",
          maxHeight: isMobile ? "90vh" : "none",
          overflowY: isMobile ? "auto" : "visible",
          padding: isMobile ? "10px 8px" : "28px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        <style>
          {`
          .gmp-loader {
            width: 36px;
            height: 36px;
            border: 4px solid #FFF;
            border-bottom-color: transparent;
            border-radius: 50%;
            display: inline-block;
            box-sizing: border-box;
            animation: gmp-rotation 1s linear infinite;
          }
          @media (min-width: 640px) {
            .gmp-loader {
              width: 48px;
              height: 48px;
              border-width: 5px;
            }
          }
          @keyframes gmp-rotation {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateY(10px); }
            10% { opacity: 1; transform: translateY(0); }
            90% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-10px); }
          }
          .tip-text {
            animation: fadeInOut 3s ease-in-out infinite;
          }
          `}
        </style>
        
        {/* GMP loading header */}
        <div className="text-center mb-2 w-full">
          <h2 className="text-white font-bold mb-1 w-full text-center" style={{fontSize: isMobile ? '1.1rem' : '1.5rem'}}>
            GMP Inspector Simulator
          </h2>
          <h3 className="text-blue-200 w-full text-center" style={{fontSize: isMobile ? '0.95rem' : '1.15rem'}}>
            Level 4: Risk Assessment
          </h3>
        </div>
        
        {/* Loading animation */}
        <img 
          src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0Ij48Y2lyY2xlIGN4PSIxMiIgY3k9IjIiIHI9IjAiIGZpbGw9ImN1cnJlbnRDb2xvciI+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0iciIgYmVnaW49IjAiIGNhbGNNb2RlPSJzcGxpbmUiIGR1cj0iMXMiIGtleVNwbGluZXM9IjAuMiAwLjIgMC40IDAuODswLjIgMC4yIDAuNCAwLjg7MC4yIDAuMiAwLjQgMC44IiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgdmFsdWVzPSIwOzI7MDswIi8+PC9jaXJjbGU+PGNpcmNsZSBjeD0iMTIiIGN5PSIyIiByPSIwIiBmaWxsPSJjdXJyZW50Q29sb3IiIHRyYW5zZm9ybT0icm90YXRlKDQ1IDEyIDEyKSI+PGFuaW1hdGUgYXR0cmlidXRlTmFtZT0iciIgYmVnaW49IjAuMTI1cyIgY2FsY01vZGU9InNwbGluZSIgZHVyPSIxcyIga2V5U3BsaW5lcz0iMC4yIDAuMiAwLjQgMC44OzAuMiAwLjIgMC40IDAuODswLjIgMC4yIDAuNCAwLjgiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIiB2YWx1ZXM9IjA7MjswOzAiLz48L2NpcmNsZT48Y2lyY2xlIGN4PSIxMiIgY3k9IjIiIHI9IjAiIGZpbGw9ImN1cnJlbnRDb2xvciIgdHJhbnNmb3JtPSJyb3RhdGUoOTAgMTIgMTIpIj48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJyIiBiZWdpbj0iMC4yNXMiIGNhbGNNb2RlPSJzcGxpbmUiIGR1cj0iMXMiIGtleVNwbGluZXM9IjAuMiAwLjIgMC40IDAuODswLjIgMC4yIDAuNCAwLjg7MC4yIDAuMiAwLjQgMC44IiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgdmFsdWVzPSIwOzI7MDswIi8+PC9jaXJjbGU+PGNpcmNsZSBjeD0iMTIiIGN5PSIyIiByPSIwIiBmaWxsPSJjdXJyZW50Q29sb3IiIHRyYW5zZm9ybT0icm90YXRlKDEzNSAxMiAxMikiPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9InIiIGJlZ2luPSIwLjM3NXMiIGNhbGNNb2RlPSJzcGxpbmUiIGR1cj0iMXMiIGtleVNwbGluZXM9IjAuMiAwLjIgMC40IDAuODswLjIgMC4yIDAuNCAwLjg7MC4yIDAuMiAwLjQgMC44IiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgdmFsdWVzPSIwOzI7MDswIi8+PC9jaXJjbGU+PGNpcmNsZSBjeD0iMTIiIGN5PSIyIiByPSIwIiBmaWxsPSJjdXJyZW50Q29sb3IiIHRyYW5zZm9ybT0icm90YXRlKDE4MCAxMiAxMikiPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9InIiIGJlZ2luPSIwLjVzIiBjYWxjTW9kZT0ic3BsaW5lIiBkdXI9IjFzIiBrZXlTcGxpbmVzPSIwLjIgMC4yIDAuNCAwLjg7MC4yIDAuMiAwLjQgMC44OzAuMiAwLjIgMC40IDAuOCIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIHZhbHVlcz0iMDsyOzA7MCIvPjwvY2lyY2xlPjxjaXJjbGUgY3g9IjEyIiBjeT0iMiIgcj0iMCIgZmlsbD0iY3VycmVudENvbG9yIiB0cmFuc2Zvcm09InJvdGF0ZSgyMjUgMTIgMTIpIj48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJyIiBiZWdpbj0iMC42MjVzIiBjYWxjTW9kZT0ic3BsaW5lIiBkdXI9IjFzIiBrZXlTcGxpbmVzPSIwLjIgMC4yIDAuNCAwLjg7MC4yIDAuMiAwLjQgMC44OzAuMiAwLjIgMC40IDAuOCIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiIHZhbHVlcz0iMDsyOzA7MCIvPjwvY2lyY2xlPjxjaXJjbGUgY3g9IjEyIiBjeT0iMiIgcj0iMCIgZmlsbD0iY3VycmVudENvbG9yIiB0cmFuc2Zvcm09InJvdGF0ZSgyNzAgMTIgMTIpIj48YW5pbWF0ZSBhdHRyaWJ1dGVOYW1lPSJyIiBiZWdpbj0iMC43NXMiIGNhbGNNb2RlPSJzcGxpbmUiIGR1cj0iMXMiIGtleVNwbGluZXM9IjAuMiAwLjIgMC40IDAuODswLjIgMC4yIDAuNCAwLjg7MC4yIDAuMiAwLjQgMC44IiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgdmFsdWVzPSIwOzI7MDswIi8+PC9jaXJjbGU+PGNpcmNsZSBjeD0iMTIiIGN5PSIyIiByPSIwIiBmaWxsPSJjdXJyZW50Q29sb3IiIHRyYW5zZm9ybT0icm90YXRlKDMxNSAxMiAxMikiPjxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9InIiIGJlZ2luPSIwLjg3NXMiIGNhbGNNb2RlPSJzcGxpbmUiIGR1cj0iMXMiIGtleVNwbGluZXM9IjAuMiAwLjIgMC40IDAuODswLjIgMC4yIDAuNCAwLjg7MC4yIDAuMiAwLjQgMC44IiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIgdmFsdWVzPSIwOzI7MDswIi8+PC9jaXJjbGU+PC9zdmc+"
          alt="Loading"
          className="w-12 h-12 mb-4 text-white"
          style={{ filter: 'brightness(0) invert(1)' }}
        />
        
        {/* Progress bar */}
        <div className="w-full bg-gray-200/20 rounded-full h-2 mb-3">
          <div
            className="bg-blue-400 rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, height: '100%' }}
          />
        </div>
        
        {/* Loading status */}
        <div className="text-white mb-2 w-full text-center" style={{fontSize: isMobile ? '0.85rem' : '1rem'}}>
          Loading GMP scenarios... {Math.min(Math.floor(progress), 100)}%
        </div>
        
        {/* GMP tips */}
        <div className="mt-1 text-center px-1 w-full">
          <p className="text-blue-100 italic tip-text w-full text-center" style={{fontSize: isMobile ? '0.8rem' : '1rem'}}>
            Tip: {gmpTips[currentTip]}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Level4LoadingScreen;
