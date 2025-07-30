import React, { useState, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid';
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { useDeviceLayout } from '../../hooks/useOrientation'
import { collegeCodes as collegeCodeList } from '../../data/collegeCodes'

interface AuthFormProps {
  mode: 'login' | 'signup'
  onToggleMode: () => void
}

const AuthForm: React.FC<AuthFormProps> = ({ mode, onToggleMode }) => {
  // Removed unused teamMemberRefs
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    confirmPassword: '',
    phone: '',
    teamName: '',
    collegeCode: '',
    isTeamLeader: null as null | boolean,
    joinCode: '', // For team members joining
  })
  // For pre-filling team name and college code for team members
  const [prefilledTeam, setPrefilledTeam] = useState<{ teamName: string; collegeCode: string } | null>(null);

  // Use imported collegeCodes and map to dropdown structure
  const collegeCodes = collegeCodeList.map(code => ({ code }));
  const [collegeSearch, setCollegeSearch] = useState('');
  const [showCollegeDropdown, setShowCollegeDropdown] = useState(false);
  const collegeInputRef = useRef<HTMLInputElement>(null);
  // Show suggestions as soon as user types, remove case sensitivity
  const filteredColleges =
    collegeSearch.trim() === ''
      ? []
      : collegeCodes.filter(c =>
          c.code.toLowerCase().includes(collegeSearch.trim().toLowerCase())
        );
  // For displaying join code to team leader after signup
  const [generatedJoinCode, setGeneratedJoinCode] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false);

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
      if (formData.isTeamLeader === null) {
        setError('Please specify if you are the team leader')
        return false
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return false
      }
      if (formData.isTeamLeader) {
        // Team leader: must provide team name and college code
        if (!formData.teamName.trim()) {
          setError('Please enter your team name')
          return false
        }
        if (!formData.collegeCode.trim()) {
          setError('Please enter your college code')
          return false
        }
      } else {
        // Team member: must provide join code
        if (!formData.joinCode.trim()) {
          setError('Please enter the join code provided by your team leader')
          return false
        }
      }
    }

    return true
  }

  const generateJoinCode = () => {
    // 6-character alphanumeric code
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  // New: Confirm details modal logic
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    if (mode === 'signup') {
      setShowConfirmModal(true);
    } else {
      // Directly login
      handleConfirmCreateAccount();
    }
  };

  // Actual account creation logic
  const handleConfirmCreateAccount = async () => {
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    setGeneratedJoinCode(null);
    setShowConfirmModal(false);
    try {
      if (mode === 'login') {
        const { error } = await signIn(formData.email, formData.password);
        if (error) {
          setError(error.message);
        }
      } else {
        if (formData.isTeamLeader) {
          // Team leader signup: create team, generate join code
          // 1. Check if email already exists in teams table
          const { data: existingEmailRows, error: emailCheckError } = await supabase
            .from('teams')
            .select('email')
            .eq('email', formData.email);
          if (emailCheckError) {
            setError('Error checking email. Please try again.');
            setIsSubmitting(false);
            return;
          }
          if (existingEmailRows && existingEmailRows.length > 0) {
            setError('An account with this email already exists. Please use a different email.');
            setIsSubmitting(false);
            return;
          }
          // 2. Check if team name already exists
          const { data: existingTeams, error: teamCheckError } = await supabase
            .from('teams')
            .select('team_name')
            .ilike('team_name', formData.teamName);
          if (teamCheckError) {
            setError('Error checking team name. Please try again.');
            setIsSubmitting(false);
            return;
          }
          if (existingTeams && existingTeams.length > 0) {
            setError('Team name already exists, try a different name');
            setIsSubmitting(false);
            return;
          }
          const joinCode = generateJoinCode().toUpperCase().trim();
          const sessionId = uuidv4();
          const { error } = await signUp(
            formData.email,
            formData.password,
            formData.fullName,
            {
              phone: formData.phone,
              teamName: formData.teamName,
              collegeCode: formData.collegeCode,
              teamLead: '',
              teamMembers: [],
            }
          );
          if (error) {
            setError(error.message);
            setIsSubmitting(false);
            return;
          }
          const { data: { user } } = await supabase.auth.getUser();
          const { fullName, phone, teamName, collegeCode, email } = formData;
          const teamRow: {
            email: string;
            full_name: string;
            phone: string;
            team_name: string;
            college_code: string;
            is_team_leader: boolean;
            session_id: string;
            join_code: string;
            user_id?: string;
          } = {
            email,
            full_name: fullName,
            phone,
            team_name: teamName,
            college_code: collegeCode,
            is_team_leader: true,
            session_id: sessionId,
            join_code: joinCode,
          };
          if (user && user.id) {
            teamRow.user_id = user.id;
          }
          const { error: insertError } = await supabase.from('teams').insert([teamRow]);
          if (insertError) {
            setError('Team creation failed: ' + insertError.message);
            setIsSubmitting(false);
            return;
          }
          setGeneratedJoinCode(joinCode);
          setSuccess('Account created! Please verify your email. Share this join code with your team: ' + joinCode.toUpperCase());
          setPrefilledTeam({ teamName: formData.teamName, collegeCode: formData.collegeCode });
        } else {
          // Team member signup: join with code
          const joinCodeInput = formData.joinCode.trim().toUpperCase();
          const { data: teamRows, error: teamError } = await supabase
            .from('teams')
            .select('*')
            .eq('join_code', joinCodeInput);
          if (teamError) {
            setError('Error finding team. Please try again.');
            setIsSubmitting(false);
            return;
          }
          if (!teamRows || teamRows.length === 0) {
            setError('Invalid join code. Please check with your team leader.');
            setIsSubmitting(false);
            return;
          }
          const { data: teamMembers, error: countError } = await supabase
            .from('teams')
            .select('id', { count: 'exact', head: true })
            .eq('join_code', joinCodeInput);
          if (countError) {
            setError('Error checking team size. Please try again.');
            setIsSubmitting(false);
            return;
          }
          if (teamMembers && teamMembers.length >= 4) {
            setError('This team already has 4 members.');
            setIsSubmitting(false);
            return;
          }
          const team = teamRows[0];
          setPrefilledTeam({ teamName: team.team_name, collegeCode: team.college_code });
          const { error } = await signUp(
            formData.email,
            formData.password,
            formData.fullName,
            {
              phone: formData.phone,
              teamName: team.team_name,
              collegeCode: team.college_code,
              teamLead: '',
              teamMembers: [],
            }
          );
          if (error) {
            setError(error.message);
            setIsSubmitting(false);
            return;
          }
          const { data: { user } } = await supabase.auth.getUser();
          const { fullName, phone, email } = formData;
          const teamRow: {
            email: string;
            full_name: string;
            phone: string;
            team_name: string;
            college_code: string;
            is_team_leader: boolean;
            session_id: string;
            join_code: string;
            user_id?: string;
          } = {
            email,
            full_name: fullName,
            phone,
            team_name: team.team_name,
            college_code: team.college_code,
            is_team_leader: false,
            session_id: team.session_id,
            join_code: team.join_code,
          };
          if (user && user.id) {
            teamRow.user_id = user.id;
          }
          const { error: insertError } = await supabase.from('teams').insert([teamRow]);
          if (insertError) {
            setError('Failed to join team: ' + insertError.message);
            setIsSubmitting(false);
            return;
          }
          setSuccess('Account created and joined team. Please go to email and verify your account.');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('[AuthForm] Unexpected error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
              {/* College Code (only for team leader or prefilled for member) */}
              {(formData.isTeamLeader || (prefilledTeam && !formData.isTeamLeader)) ? (
                <React.Fragment>
                  <label className={`block font-medium text-white mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>College Code</label>
                  <div className="relative w-full">
                    <input
                      id="collegeCode"
                      name="collegeCode"
                      type="text"
                      ref={collegeInputRef}
                      autoComplete="off"
                      value={formData.isTeamLeader ? collegeSearch : (prefilledTeam ? prefilledTeam.collegeCode : '')}
                      onChange={formData.isTeamLeader ? (e) => {
                        setCollegeSearch(e.target.value);
                        setShowCollegeDropdown(true);
                        setFormData(prev => ({ ...prev, collegeCode: e.target.value }));
                      } : undefined}
                      onFocus={formData.isTeamLeader ? () => setShowCollegeDropdown(true) : undefined}
                      onBlur={formData.isTeamLeader ? () => setTimeout(() => setShowCollegeDropdown(false), 150) : undefined}
                      required={!!formData.isTeamLeader}
                      className={`w-full ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2'} bg-white/10 border border-slate-700/50 rounded-md shadow-sm placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white ${!formData.isTeamLeader && prefilledTeam ? 'bg-gray-700/40 cursor-not-allowed' : ''}`}
                      placeholder="Search college code or name"
                      readOnly={!formData.isTeamLeader && prefilledTeam ? true : false}
                    />
                    {/* Dropdown list for college codes */}
                    {formData.isTeamLeader && showCollegeDropdown && filteredColleges.length > 0 && (
                      <ul className="absolute z-20 mt-1 w-full bg-gray-900 border border-slate-700/80 rounded-md shadow-lg max-h-40 overflow-y-auto">
                        {filteredColleges.map(college => (
                          <li
                            key={college.code}
                            className="px-3 py-2 cursor-pointer hover:bg-blue-700/40 text-white text-sm"
                            onMouseDown={() => {
                              setFormData(prev => ({ ...prev, collegeCode: college.code }));
                              setCollegeSearch(college.code);
                              setShowCollegeDropdown(false);
                              setTimeout(() => { collegeInputRef.current?.blur(); }, 100);
                            }}
                          >
                            <span className="font-semibold">{college.code}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </React.Fragment>
              ) : null}
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
              {/* Team Name (only for team leader or prefilled for member) */}
              {formData.isTeamLeader || (prefilledTeam && !formData.isTeamLeader) ? (
                <React.Fragment>
                  <label className={`block font-medium text-white mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>Team Name</label>
                  <div className="relative w-full">
                    <input
                      id="teamName"
                      name="teamName"
                      type="text"
                      value={formData.isTeamLeader ? formData.teamName : (prefilledTeam ? prefilledTeam.teamName : '')}
                      onChange={formData.isTeamLeader ? handleInputChange : undefined}
                      required={!!formData.isTeamLeader}
                      className={`w-full ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2'} bg-white/10 border border-slate-700/50 rounded-md shadow-sm placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white ${!formData.isTeamLeader && prefilledTeam ? 'bg-gray-700/40 cursor-not-allowed' : ''}`}
                      placeholder="Enter team name"
                      readOnly={!formData.isTeamLeader && prefilledTeam ? true : false}
                    />
                  </div>
                </React.Fragment>
              ) : (
                // Join code input for team members
                <React.Fragment>
                  <label className={`block font-medium text-white mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>Join Code</label>
                  <div className="relative w-full">
                    <input
                      id="joinCode"
                      name="joinCode"
                      type="text"
                      value={formData.joinCode}
                      onChange={handleInputChange}
                      required={!formData.isTeamLeader}
                      className={`w-full ${isMobile ? 'px-2 py-1 text-xs' : 'px-4 py-2'} bg-white/10 border border-slate-700/50 rounded-md shadow-sm placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-white`}
                      placeholder="Enter join code from team leader"
                      maxLength={6}
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                </React.Fragment>
              )}
              {/* Are you the team leader? Yes/No */}
              <div className="flex flex-col gap-2">
                <label className={`block font-medium text-white mb-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>Are you the team leader?</label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-md border font-medium focus:outline-none transition-colors duration-150 ${formData.isTeamLeader === true ? 'bg-blue-600 text-white border-blue-700' : 'bg-white/10 text-white border-slate-700/50 hover:bg-blue-700/30'}`}
                    onClick={() => { setFormData(prev => ({ ...prev, isTeamLeader: true, joinCode: '' })); setError(''); setSuccess(''); }}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-2 rounded-md border font-medium focus:outline-none transition-colors duration-150 ${formData.isTeamLeader === false ? 'bg-blue-600 text-white border-blue-700' : 'bg-white/10 text-white border-slate-700/50 hover:bg-blue-700/30'}`}
                    onClick={() => { setFormData(prev => ({ ...prev, isTeamLeader: false, teamName: '', collegeCode: '' })); setError(''); setSuccess(''); }}
                  >
                    No
                  </button>
                </div>
              </div>
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
              {mode === 'signup' ? (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex justify-center items-center rounded-lg shadow-sm font-medium text-white bg-gradient-to-r from-green-400 via-cyan-600 to-emerald-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 w-full max-w-xs ${isMobile ? 'py-1 px-2 text-xs' : 'py-2 px-3 text-base'}`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Confirming...
                    </>
                  ) : (
                    'Confirm Details'
                  )}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`flex justify-center items-center rounded-lg shadow-sm font-medium text-white bg-gradient-to-r from-green-400 via-cyan-600 to-emerald-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 w-full max-w-xs ${isMobile ? 'py-1 px-2 text-xs' : 'py-2 px-3 text-base'}`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
                </button>
              )}
            </div>

            {/* Confirm Details Modal */}
            {showConfirmModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                <div className="bg-gray-900 rounded-lg shadow-2xl p-6 w-full max-w-md mx-auto">
                  <h3 className="text-xl font-bold text-white mb-4">Confirm Your Details</h3>
                  <ul className="text-white space-y-2 mb-4">
                    <li><span className="font-semibold">Full Name:</span> {formData.fullName}</li>
                    <li><span className="font-semibold">Phone:</span> {formData.phone}</li>
                    {formData.isTeamLeader ? (
                      <>
                        <li><span className="font-semibold">Team Name:</span> {formData.teamName}</li>
                        <li><span className="font-semibold">College Code:</span> {formData.collegeCode}</li>
                        <li><span className="font-semibold">Role:</span> Team Leader</li>
                      </>
                    ) : (
                      <>
                        <li><span className="font-semibold">Join Code:</span> {formData.joinCode}</li>
                        <li><span className="font-semibold">Role:</span> Team Member</li>
                      </>
                    )}
                    <li><span className="font-semibold">Email:</span> {formData.email}</li>
                  </ul>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      className="px-4 py-2 rounded-md bg-gray-700 text-white hover:bg-gray-600"
                      onClick={() => setShowConfirmModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 font-semibold"
                      onClick={handleConfirmCreateAccount}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Creating Account...' : 'Create Account'}
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Show join code to team leader after signup */}
            {generatedJoinCode && formData.isTeamLeader && (
              <div className="col-span-1 md:col-span-3 flex flex-col items-center mt-4">
                <div className="bg-blue-900/80 border border-blue-500 text-white px-4 py-2 rounded-lg shadow-md">
                  <span className="font-bold">Share this join code with your team:</span>
                  <span className="ml-2 text-2xl tracking-widest">{generatedJoinCode?.toUpperCase()}</span>
                </div>
              </div>
            )}
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