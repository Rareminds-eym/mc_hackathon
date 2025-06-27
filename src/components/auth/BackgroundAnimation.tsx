import React from 'react'

const BackgroundAnimation: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"></div>
      
      {/* Animated Geometric Shapes */}
      <div className="absolute inset-0">
        {/* Large floating circles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-200 to-blue-300 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-3/4 right-1/4 w-48 h-48 bg-gradient-to-r from-purple-200 to-purple-300 rounded-full opacity-20 animate-float-delayed"></div>
        <div className="absolute bottom-1/4 left-1/3 w-32 h-32 bg-gradient-to-r from-green-200 to-green-300 rounded-full opacity-20 animate-float-slow"></div>
        
        {/* Quality control themed shapes */}
        <div className="absolute top-1/3 right-1/3 w-24 h-24 border-4 border-blue-200 rounded-lg rotate-45 opacity-30 animate-spin-very-slow"></div>
        <div className="absolute bottom-1/3 right-1/4 w-16 h-16 border-2 border-green-200 rounded-full opacity-40 animate-pulse"></div>
        
        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-300 rounded-full opacity-30 animate-float-particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          ></div>
        ))}
        
        {/* Manufacturing process lines */}
        <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-200 to-transparent opacity-20"></div>
        <div className="absolute top-0 right-1/3 w-px h-full bg-gradient-to-b from-transparent via-purple-200 to-transparent opacity-20"></div>
        
        {/* Quality badges floating */}
        <div className="absolute top-1/5 left-1/5 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center opacity-40 animate-bounce-slow">
          <span className="text-green-600 font-bold text-xs">✓</span>
        </div>
        <div className="absolute bottom-1/5 right-1/5 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center opacity-40 animate-bounce-slow" style={{ animationDelay: '1s' }}>
          <span className="text-blue-600 font-bold text-xs">★</span>
        </div>
      </div>
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
    </div>
  )
}

export default BackgroundAnimation