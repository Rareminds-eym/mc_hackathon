import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface LoaderScreenProps {
  onComplete?: () => void;
}

function isAuthenticated() {
  return !!localStorage.getItem("authToken");
}

const LoaderScreen: React.FC<LoaderScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    if (progress < 100) {
      const timer = setTimeout(() => setProgress(progress + 2 + Math.random() * 3), 360);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        if (isAuthenticated()) {
          navigate("/home");
        } else {
          navigate("/auth");
        }
        if (onComplete) onComplete();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete, navigate]);

  return (
    <div
      className="fixed inset-0 w-full h-full flex items-center justify-center bg-cover bg-center bg-no-repeat min-h-screen min-w-screen"
      style={{
        backgroundImage: `url('/backgrounds/LoaderBg.svg')`,
      }}
    >
      {/* Loader animation keyframes and styles */}
      <style>
        {`
          /* From Uiverse.io by Shoh2008 */
          .loader {
            width: 48px;
            height: 48px;
            background: #353535;
            display: block;
            margin: 20px auto;
            position: relative;
            box-sizing: border-box;
            animation: rotationBack 1s ease-in-out infinite reverse;
          }
          .loader::before {
            content: '';
            box-sizing: border-box;
            left: 0;
            top: 0;
            transform: rotate(45deg);
            position: absolute;
            width: 48px;
            height: 48px;
            background: #2e2e2e;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.15);
          }
          .loader::after {
            content: '';
            box-sizing: border-box;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            position: absolute;
            left: 50%;
            top: 50%;
            background: rgb(0, 0, 0);
            transform: translate(-50%, -50%);
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.15);
          }
          @keyframes rotationBack {
            0% { transform: rotate(0deg);}
            100% { transform: rotate(-360deg);}
          }
        `}
      </style>
      <div
        className="z-20 text-6xl font-bold rounded-2xl mb-4 bg-cyan-900/70 shadow-lg border border-blue-400/50 w-1/5 h-32 text-center p-6 flex flex-col justify-center items-center absolute top-[60%] left-1/2 -translate-x-1/2 -translate-y-full"
        style={{ color: "#0a2240" }}
      >
        <div className="mb-4 text-xl font-semibold">
          SYSTEM LOADING... {Math.min(Math.floor(progress), 100)}%
        </div>
        {/* Loader animation */}
        <span className="loader" />
        <div className="w-full bg-gray-200/30 rounded-full h-2 mt-4">
          <div
            className="bg-white text-xl rounded-full transition-all duration-300"
            style={{ width: `${progress}%`, height: "100%" }}
          />
        </div>
      </div>
    </div>
  );
};

export default LoaderScreen;