import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AnimatedLogo from '../components/auth/AnimatedLogo'
import BackgroundAnimation from '../components/auth/BackgroundAnimation'
import AuthForm from '../components/auth/AuthForm'
// import { InstallPrompt } from '../components/PWA'
import '../components/auth/auth-blur.css'
import { InstallPrompt } from '../components/PWA'
import { usePWA } from '../hooks/usePWA'
import '../components/auth/auth-blur.css'
import { useAuth } from '../contexts/AuthContext' // Import useAuth

const AuthPage: React.FC = () => {
  // Toggle between login and signup modes
  const toggleAuthMode = () => {
    setAuthMode((prev) =>
      prev === 'login' ? 'signup' : 'login'
    );
  };

  // Switch to forgot-password mode
  const handleForgotPassword = () => {
    setAuthMode('forgot-password');
  };
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot-password'>('login')
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const navigate = useNavigate()
  const { user } = useAuth() // Get user from auth context

  useEffect(() => {
    if (user) {
      navigate('/home', { replace: true });
    }
  }, [user, navigate]);

  return (
    <div 
      className="h-screen relative bg-gradient-to-b from-slate-950 to-slate-900"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: 'hidden'
      }}
    >
      <BackgroundAnimation />
      {/* Blur overlay when install prompt is visible */}
      {showInstallPrompt && <div className="auth-blur-overlay" />}
      {/* InstallPrompt controls the overlay via callback */}
      <InstallPrompt
        className={showInstallPrompt ? '' : 'hidden'}
        onShow={() => setShowInstallPrompt(true)}
        onHide={() => setShowInstallPrompt(false)}
      />
      <div
        className={`relative z-10 h-full overflow-y-scroll ${
          window.innerWidth > window.innerHeight
            ? (authMode === 'signup' ? 'px-16' : 'p-1')
            : 'p-4'
        }`}
        style={{
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          scrollBehavior: 'smooth',
          // Force hardware acceleration
          transform: 'translateZ(0)',
          willChange: 'scroll-position',
          // Oppo-specific fixes
          touchAction: 'pan-y',
          // Ensure minimum height for scrolling
          minHeight: '100vh',
          height: '100%'
        }}
      >
        <div 
          className="w-full max-w-4xl mx-auto py-8"
          style={{
            minHeight: 'calc(100vh + 1px)', // Force content to be slightly taller than viewport
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <div className="flex-shrink-0 mb-4">
            <AnimatedLogo />
          </div>
          <div className="flex-shrink-0 mb-4">
            <AuthForm mode={authMode} onToggleMode={toggleAuthMode} onForgotPassword={handleForgotPassword} />
          </div>
          {/* Footer */}
          <div className="text-center mt-8 flex-shrink-0">
            <p className="text-sm text-gray-500">
              <span className="block md:inline-block text-xs sm:text-sm">
                © 2025 Rareminds. All rights reserved.
              </span>
            </p>
          </div>
          {/* Invisible spacer to ensure scrollability */}
          <div style={{ height: '1px', flexShrink: 0 }}></div>
        </div>
      </div>
    </div>
  );
}

export default AuthPage