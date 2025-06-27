import React from 'react'
import { Shield, CheckCircle, Award, Target } from 'lucide-react'

const AnimatedLogo: React.FC = () => {
  return (
    <div className="flex flex-col items-center space-y-4 mb-8">
      {/* Main Logo Container */}
      <div className="relative">
        {/* Outer rotating ring */}
        <div className="absolute inset-0 w-24 h-24 border-4 border-blue-200 rounded-full animate-spin-slow opacity-30"></div>
        
        {/* Middle pulsing ring */}
        <div className="absolute inset-2 w-20 h-20 border-2 border-green-300 rounded-full animate-pulse"></div>
        
        {/* Inner logo container */}
        <div className="relative w-24 h-24 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-800 rounded-full flex items-center justify-center shadow-2xl transform hover:scale-110 transition-all duration-300">
          <Shield className="h-12 w-12 text-white animate-pulse" />
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
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent animate-gradient-x mb-2">
          GMP Quest
        </h1>
        <p className="text-lg text-gray-600 font-medium animate-fade-in-up">
          Good Manufacturing Practices
        </p>
        <div className="flex items-center justify-center space-x-2 mt-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  )
}

export default AnimatedLogo