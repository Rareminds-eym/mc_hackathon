import React, { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { useDeviceLayout } from '../../hooks/useOrientation' // Add this import

interface AuthFormProps {
  mode: 'login' | 'signup'
  onToggleMode: () => void
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onToggleMode }) => {
  const teamMemberRefs = [React.createRef<HTMLInputElement>(), React.createRef<HTMLInputElement>(), React.createRef<HTMLInputElement>()];
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
    phone: '',
    teamName: '',
    collegeCode: '',
    teamLead: '',
    teamMembers: ['', '', ''] // 3 members (excluding leader)
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { signIn, signUp } = useAuth()
  const { isHorizontal, isMobile } = useDeviceLayout(); // Add this line
  const isMobileLandscape = isMobile && isHorizontal;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
    setSuccess('')
  }

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all required fields')
      return false
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }

    if (mode === 'signup') {
      if (!formData.fullName.trim()) {
        setError('Please enter your full name')
        return false
      }
      if (!formData.phone.trim()) {
        setError('Please enter your phone number')
        return false
      }
      if (!/^\d{10}$/.test(formData.phone.trim())) {
        setError('Please enter a valid 10-digit phone number')
        return false
      }
      if (!formData.teamName.trim()) {
        setError('Please enter your team name')
        return false
      }
      if (!formData.collegeCode.trim()) {
        setError('Please enter your college code')
        return false
      }
      if (!formData.teamLead.trim()) {
        setError('Please enter the team leader name')
        return false
      }
      // Team members validation
      const members = [formData.teamLead, ...formData.teamMembers.filter(m => m.trim() !== '')]
      if (members.length < 2) {
        setError('Minimum 2 members required (including Team Leader)')
        return false
      }
      if (members.length > 4) {
        setError('Maximum 4 members allowed (including Team Leader)')
        return false
      }
      // Team member names should not be empty strings
      if (formData.teamMembers.some((m, i) => m.trim() === '' && i < members.length - 1)) {
        setError('Please fill all team member names or leave unused fields empty at the end')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return false
      }
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      if (mode === 'login') {
        const { error } = await signIn(formData.email, formData.password)
        if (error) {
          setError(error.message)
        }
      } else {
        // Check if team name already exists
        const { data: existingTeams, error: teamCheckError } = await supabase
          .from('teams')
          .select('team_name')
          .ilike('team_name', formData.teamName);
        if (teamCheckError) {
          setError('Error checking team name. Please try again.');
          console.error('[AuthForm] Team name check error:', teamCheckError);
          return;
        }
        if (existingTeams && existingTeams.length > 0) {
          setError('Team name already exists, try a different name');
          return;
        }
        // Pass all signup fields to signUp
        console.log('[AuthForm] Attempting signup with:', formData);
        const { error } = await signUp(
          formData.email,
          formData.password,
          formData.fullName,
          {
            phone: formData.phone,
            teamName: formData.teamName,
            collegeCode: formData.collegeCode,
            teamLead: formData.teamLead,
            teamMembers: formData.teamMembers
          }
        )
        if (error) {
          setError(error.message)
          console.error('[AuthForm] Signup error:', error);
        } else {
          // Insert into teams table immediately after signup
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          const { fullName, phone, teamName, collegeCode, teamLead, teamMembers, email } = formData;
          let teamRow = {
            email,
            full_name: fullName,
            phone,
            team_name: teamName,
            college_code: collegeCode,
            team_lead: teamLead,
            team_member_1: teamMembers[0] || null,
            team_member_2: teamMembers[1] || null,
            team_member_3: teamMembers[2] || null,
          };
          if (user && user.id) {
            teamRow.user_id = user.id;
          }
          console.log('[AuthForm] Inserting into teams table:', teamRow);
          const { error: insertError, data: insertData } = await supabase.from('teams').insert([teamRow]);
          console.log('[AuthForm] Teams insert response:', { insertError, insertData });
          if (insertError) {
            if (
              insertError.message &&
              insertError.message.includes('duplicate key value violates unique constraint')
            ) {
              setError('Team Name is taken, use a different name');
            } else {
              setError('Team creation failed: ' + insertError.message);
            }
            console.error('[AuthForm] Insert error:', insertError);
            return;
          }
          if (!insertData) {
            console.warn('[AuthForm] Insert returned no data.');
          }
          setSuccess('Account created successfully! Please check your email to verify your account.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('[AuthForm] Unexpected error:', err);
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`w-full mx-auto ${
      mode === 'login'
        ? 'max-w-md'
        : (isMobileLandscape && mode === 'signup'
            ? 'max-w-4xl flex justify-center items-center'
            : isMobileLandscape
              ? 'max-w-md'
              : 'max-w-5xl')
    }`}>
      {/* Error/Success Alerts: Toast for mobile, alert for desktop */}
      {(error || success) && (
        isMobile ? (
          <div className="fixed top-4 left-1/2 z-50 transform -translate-x-1/2 w-[90vw] max-w-xs">
            {error && (
              <div className="flex items-center gap-2 bg-red-700/90 border border-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
                <AlertCircle className="h-5 w-5 text-red-300" />
                <span className="font-medium">{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 bg-green-700/90 border border-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-fade-in">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span className="font-medium">{success}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="w-full flex justify-center mb-4">
            {error && (
              <div className="flex items-center gap-2 bg-red-700/80 border border-red-500 text-white px-4 py-2 rounded-md shadow-md animate-fade-in">
                <AlertCircle className="h-5 w-5 text-red-300" />
                <span className="font-medium">{error}</span>
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 bg-green-700/80 border border-green-500 text-white px-4 py-2 rounded-md shadow-md animate-fade-in">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span className="font-medium">{success}</span>
              </div>
            )}
          </div>
        )
      )}
      <div
        className={`bg-gray-800/60 rounded-lg shadow-2xl relative z-10 w-full mx-auto
        ${
          mode === 'login' && isMobile
            ? 'p-8 max-w-sm'
            : (isMobileLandscape && mode === 'signup'
                ? 'p-6 max-w-4xl flex flex-col justify-center items-center'
                : isMobileLandscape
                  ? 'p-4 max-w-md'
                  : 'p-8 max-w-5xl')
        }`}
      >
        {/* Form Header */}
        <div className={`text-center ${isMobileLandscape ? 'mb-6' : 'mb-8'}`}>
          <h2 className={`${isMobileLandscape ? 'text-base' : 'text-3xl'} font-bold text-white mb-1`}>
            {mode === 'login' ? 'Welcome Back' : 'Join GMP Quest'}
          </h2>
          <p className={`${isMobileLandscape ? 'text-xs text-white' : (mode === 'login' ? 'text-gray-300' : 'text-white')}`}>
            {mode === 'login' 
              ? 'Sign in to continue your quality journey' 
              : 'Start your manufacturing excellence adventure'
            }
          </p>
        </div>
        {mode === 'signup' ? (
          <form
            onSubmit={handleSubmit}
            className={`grid grid-cols-1 md:grid-cols-3 ${isMobile ? 'gap-4' : 'gap-6'} w-full`}
            style={{ width: '100%' }}
          >
            {/* Column 1 */}
            <div className={`flex flex-col gap-4 ${isMobile ? 'text-xs' : ''}`}> 
              {/* Full Name */}
              <React.Fragment>
                <label className={`block font-medium text-white mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>Full Name</label>
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-blue-300" />
                  </div>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className={`w-full ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2'} bg-white/10 border border-slate-700/50 rounded-md shadow-sm placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white pl-10`}
                    placeholder="Enter your full name"
                  />
                </div>
              </React.Fragment>
              {/* College Code */}
              <React.Fragment>
                <label className={`block font-medium text-white mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>College Code</label>
                <div className="relative w-full">
                  <input
                    id="collegeCode"
                    name="collegeCode"
                    type="text"
                    value={formData.collegeCode}
                    onChange={handleInputChange}
                    required
                    className={`w-full ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2'} bg-white/10 border border-slate-700/50 rounded-md shadow-sm placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white`}
                    placeholder="Enter college code"
                  />
                </div>
              </React.Fragment>
              {/* Phone Number */}
              <React.Fragment>
                <label className={`block font-medium text-white mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>Phone Number</label>
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-sm text-blue-300">+91</span>
                  </div>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className={`w-full ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2'} bg-white/10 border border-slate-700/50 rounded-md shadow-sm placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white pl-10`}
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                    pattern="[0-9]{10}"
                  />
                </div>
              </React.Fragment>
            </div>
            {/* Column 2 */}
            <div className={`flex flex-col gap-4 ${isMobile ? 'text-xs' : ''}`}> 
              {/* Team Name */}
              <React.Fragment>
                <label className={`block font-medium text-white mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>Team Name</label>
                <div className="relative w-full">
                  <input
                    id="teamName"
                    name="teamName"
                    type="text"
                    value={formData.teamName}
                    onChange={handleInputChange}
                    required
                    className={`w-full ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2'} bg-white/10 border border-slate-700/50 rounded-md shadow-sm placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white`}
                    placeholder="Enter team name"
                  />
                </div>
              </React.Fragment>
              {/* Team Lead */}
              <React.Fragment>
                <label className={`block font-medium text-white mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>Team Leader Name</label>
                <div className="relative w-full">
                  <input
                    id="teamLead"
                    name="teamLead"
                    type="text"
                    value={formData.teamLead}
                    onChange={handleInputChange}
                    required
                    className={`w-full ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2'} bg-white/10 border border-slate-700/50 rounded-md shadow-sm placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white`}
                    placeholder="Enter team leader name"
                  />
                </div>
              </React.Fragment>
              {/* Team Members (progressive fields) */}
              <React.Fragment>
                <label className={`block font-medium text-white mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>Team Members (up to 3)</label>
                {[0, 1, 2].map((idx) => {
                  // Only show the first empty field or all filled fields
                  if (idx === 0 || (formData.teamMembers[idx - 1] && formData.teamMembers[idx - 1].trim() !== '')) {
                    return (
                      <div key={idx} className="relative w-full mb-2">
                        <input
                          ref={teamMemberRefs[idx]}
                          id={`teamMember${idx+1}`}
                          name={`teamMembers`}
                          type="text"
                          value={formData.teamMembers[idx]}
                          onChange={e => {
                            const value = e.target.value;
                            setFormData(prev => {
                              const updated = { ...prev, teamMembers: prev.teamMembers.map((m, i) => i === idx ? value : m) };
                              // If filled, focus next field
                              if (value.trim() && idx < 2 && !prev.teamMembers[idx + 1]) {
                                setTimeout(() => {
                                  teamMemberRefs[idx + 1].current?.focus();
                                }, 100);
                              }
                              return updated;
                            });
                            setError('');
                            setSuccess('');
                          }}
                          className={`w-full ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2'} bg-white/10 border border-slate-700/50 rounded-md shadow-sm placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white`}
                          placeholder={`Team Member ${idx+1} Name`}
                        />
                      </div>
                    );
                  }
                  return null;
                })}
              </React.Fragment>
            </div>
            {/* Column 3 */}
            <div className={`flex flex-col gap-4 ${isMobile ? 'text-xs' : ''}`}> 
              {/* Email */}
              <label className={`block font-medium text-white mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>Email Address</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-blue-300" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`w-full ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2'} bg-white/10 border border-slate-700/50 rounded-md shadow-sm placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white pl-10`}
                  placeholder="Enter your email"
                />
              </div>
              {/* Password */}
              <label className={`block font-medium text-white mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>Password</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-300" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className={`w-full ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2'} bg-white/10 border border-slate-700/50 rounded-md shadow-sm placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white pl-10 pr-10`}
                  placeholder="Enter Password"
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
              {/* Confirm Password (Signup only) */}
              <React.Fragment>
                <label className={`block font-medium text-white mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>Confirm Password</label>
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-blue-300" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    className={`w-full ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2'} bg-white/10 border border-slate-700/50 rounded-md shadow-sm placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white pl-10 pr-10`}
                    placeholder="Confirm Password"
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
              </React.Fragment>
            </div>
            {/* Submit Button */}
            <div className="col-span-1 md:col-span-3 flex justify-center mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex justify-center items-center rounded-lg shadow-sm font-medium text-white bg-gradient-to-r from-green-400 via-cyan-600 to-emerald-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 w-full max-w-xs ${isMobile ? 'py-1 px-2 text-xs' : 'py-2 px-3 text-base'}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    {mode === 'login' ? 'Signing In...' : 'Creating Account...'}
                  </>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 w-full">
            <div className="space-y-2">
              <label className={`block font-medium text-white mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>Email Address</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-blue-300" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`w-full ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2'} bg-white/10 border border-slate-700/50 rounded-md shadow-sm placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white pl-10`}
                  placeholder="Enter your email"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className={`block font-medium text-white mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>Password</label>
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-blue-300" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className={`w-full ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2'} bg-white/10 border border-slate-700/50 rounded-md shadow-sm placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white pl-10 pr-10`}
                  placeholder="Enter Password"
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
            <div className="flex justify-center mt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex justify-center items-center rounded-lg shadow-sm font-medium text-white bg-gradient-to-r from-green-400 via-cyan-600 to-emerald-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 w-full max-w-xs ${isMobile ? 'py-1 px-2 text-xs' : 'py-2 px-3 text-base'}`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                    {'Signing In...'}
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>
        )}

        {/* Toggle Mode */}
        <div className="mt-4 text-center">
          <p className={`${isMobileLandscape ? 'text-xs' : 'text-sm'} text-gray-600`}>
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            <button
              type="button"
              onClick={onToggleMode}
              className="ml-1 font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              {mode === 'login' ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthForm