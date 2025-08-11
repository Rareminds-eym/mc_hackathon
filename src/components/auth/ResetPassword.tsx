import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useDeviceLayout } from '../../hooks/useOrientation'

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { isMobile } = useDeviceLayout()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isValidSession, setIsValidSession] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)

  useEffect(() => {
    // Check if we have valid session from the reset link
    const checkSession = async () => {
      try {
        // Get URL parameters to check if this is a password reset flow
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const type = searchParams.get('type')

        // If we have the reset parameters, this is a valid reset link
        if (accessToken && refreshToken && type === 'recovery') {
          // Set the session using the tokens from the URL
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            console.error('Session error:', error)
            setError('Invalid or expired reset link. Please request a new password reset.')
            setIsCheckingSession(false)
            return
          }

          if (data.session) {
            setIsValidSession(true)
          } else {
            setError('Invalid or expired reset link. Please request a new password reset.')
          }
        } else {
          // Fallback: check if we already have a valid session
          const { data: { session }, error } = await supabase.auth.getSession()
          if (error) {
            console.error('Session error:', error)
            setError('Invalid or expired reset link. Please request a new password reset.')
            setIsCheckingSession(false)
            return
          }

          if (session) {
            setIsValidSession(true)
          } else {
            setError('Invalid or expired reset link. Please request a new password reset.')
          }
        }
      } catch (err) {
        console.error('Error checking session:', err)
        setError('Something went wrong. Please try again.')
      } finally {
        setIsCheckingSession(false)
      }
    }

    checkSession()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password.trim()) {
      setError('Please enter a new password.')
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) {
        setError(error.message || 'Failed to update password. Please try again.')
      } else {
        setSuccess('Password updated successfully! Redirecting to login...')

        // Sign out the user after password reset to ensure clean state
        await supabase.auth.signOut()

        setTimeout(() => {
          navigate('/auth', { replace: true })
        }, 2000)
      }
    } catch (err) {
      console.error('Error updating password:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackToLogin = () => {
    navigate('/auth', { replace: true })
  }

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center">
        <div className="flex items-center gap-3 text-white">
          <Loader2 className="animate-spin h-6 w-6" />
          <span>Verifying reset link...</span>
        </div>
      </div>
    )
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-gray-800/60 rounded-lg shadow-2xl p-8 max-w-md w-full">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-4">Invalid Reset Link</h2>
            <p className="text-gray-300 mb-6">
              {error || 'This password reset link is invalid or has expired. Please request a new one.'}
            </p>
            <button
              onClick={handleBackToLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-gray-800/60 rounded-lg shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Reset Password</h2>
          <p className="text-gray-300">Enter your new password below</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-700/90 border border-red-500 text-white">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-300" />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-700/90 border border-green-500 text-white">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-300" />
              <span className="font-medium">{success}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div className="space-y-2">
            <label className={`block font-medium text-white mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              New Password
            </label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-blue-300" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className={`w-full ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2'} bg-white/10 border border-slate-700/50 rounded-md shadow-sm placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white pl-10 pr-10`}
                placeholder="Enter new password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-blue-300 hover:text-blue-400" />
                ) : (
                  <Eye className="h-5 w-5 text-blue-300 hover:text-blue-400" />
                )}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className={`block font-medium text-white mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              Confirm New Password
            </label>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-blue-300" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className={`w-full ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2'} bg-white/10 border border-slate-700/50 rounded-md shadow-sm placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white pl-10 pr-10`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-blue-300 hover:text-blue-400" />
                ) : (
                  <Eye className="h-5 w-5 text-blue-300 hover:text-blue-400" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex justify-center items-center rounded-lg shadow-sm font-medium text-white bg-gradient-to-r from-green-400 via-cyan-600 to-emerald-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 w-full max-w-xs ${isMobile ? 'py-1 px-2 text-xs' : 'py-2 px-3 text-base'}`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  {'Updating Password...'}
                </>
              ) : (
                'Update Password'
              )}
            </button>
          </div>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={handleBackToLogin}
            className="text-sm text-blue-300 hover:text-blue-400 transition-colors duration-200"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword
