import React from 'react'
import { Package, CheckCircle, Award, Target } from 'lucide-react'
import { useDeviceLayout } from '../../hooks/useOrientation' // Add this import

const AnimatedLogo: React.FC = () => {
  const { isHorizontal, isMobile } = useDeviceLayout();
  const isMobileLandscape = isMobile && isHorizontal;

  return (
    <div className={`flex flex-col items-center ${isMobileLandscape ? 'space-y-2 mb-4' : 'space-y-4 mb-8'}`}>
      {/* Only show animated title in mobile landscape, else show full logo */}
      {isMobileLandscape ? (
        <div className="text-center">
          <h1 className={`text-2xl font-bold bg-gradient-to-r from-green-500 via-cyan-200 to-emerald-600 bg-clip-text text-transparent animate-gradient-x mb-1`}>
            GMP Quest
          </h1>
          <p className={`text-xs text-gray-200 font-medium animate-fade-in-up`}>
            Good Manufacturing Practices
          </p>
          <div className="flex items-center justify-center space-x-1 mt-1">
            <div className="bg-blue-500 rounded-full animate-pulse w-1.5 h-1.5"></div>
            <div className="bg-green-500 rounded-full animate-pulse w-1.5 h-1.5" style={{ animationDelay: '0.2s' }}></div>
            <div className="bg-purple-500 rounded-full animate-pulse w-1.5 h-1.5" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>
      ) : (
        <>
          {/* Main Logo Container */}
          <div className="relative">
            {/* Outer rotating ring */}
            <div className="absolute inset-0 w-24 h-24 border-4 border-blue-200 rounded-full animate-spin-slow opacity-30"></div>
            {/* Middle pulsing ring */}
            <div className="absolute inset-2 w-20 h-20 border-2 border-green-300 rounded-full animate-pulse"></div>
            {/* Inner logo container */}
            <div className="relative w-24 h-24 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300">
              <Package className="h-12 w-12 text-white animate-pulse" />
            </div>
            {/* Floating quality icons */}
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
              <CheckCircle className="h-4 w-4 text-white" />
            </div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center animate-bounce shadow-lg" style={{ animationDelay: '0.5s' }}>
              <Award className="h-4 w-4 text-white" />
            </div>
            <div className="absolute top-1/2 -right-4 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center animate-bounce shadow-lg" style={{ animationDelay: '1s' }}>
              <Target className="h-3 w-3 text-white" />
            </div>
          </div>
          {/* Animated Title */}
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-500 via-cyan-200 to-emerald-600 bg-clip-text text-transparent animate-gradient-x mb-1">
              GMP Quest
            </h1>
            <p className="text-lg text-gray-200 font-medium animate-fade-in-up">
              Good Manufacturing Practices
            </p>
            <div className="flex items-center justify-center space-x-1 mt-1">
              <div className="bg-blue-500 rounded-full animate-pulse w-2 h-2"></div>
              <div className="bg-green-500 rounded-full animate-pulse w-2 h-2" style={{ animationDelay: '0.2s' }}></div>
              <div className="bg-purple-500 rounded-full animate-pulse w-2 h-2" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default AnimatedLogo