import { AuthError, Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface SignupExtraFields {
  phone: string;
  teamName: string;
  collegeCode: string;
  teamLead: string;
  teamMembers: string[];
}

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signUp: (
    email: string,
    password: string,
    fullName: string,
    extraFields?: SignupExtraFields
  ) => Promise<{ error: AuthError | null }>
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  logout: () => void // Add logout to the context type
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) {
        console.error('Error getting session:', error)
      } else {
        // Check if this is a password reset session by looking at the current URL
        const isPasswordResetPage = window.location.pathname === '/reset-password'
        const hasResetParams = window.location.search.includes('type=recovery')

        // Don't set user state if we're on password reset page with reset parameters
        if (isPasswordResetPage && hasResetParams) {
          setSession(session)
          setUser(null) // Don't set user to prevent auto-redirect
        } else {
          setSession(session)
          setUser(session?.user ?? null)
        }
      }
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // console.log('Auth state changed:', event, session)

        // Check if this is a password reset session
        const isPasswordResetPage = window.location.pathname === '/reset-password'
        const hasResetParams = window.location.search.includes('type=recovery')

        // Handle different auth events
        if (event === 'PASSWORD_RECOVERY') {
          // This is a password recovery session, don't set user to prevent auto-redirect
          setSession(session)
          setUser(null)
        } else if (isPasswordResetPage && hasResetParams && session) {
          // We're on reset password page with reset params, don't set user
          setSession(session)
          setUser(null)
        } else {
          // Normal auth flow
          setSession(session)
          setUser(session?.user ?? null)
        }

        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (
    email: string,
    password: string,
    fullName: string,
    extraFields?: SignupExtraFields
  ) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            ...(extraFields ? {
              phone: extraFields.phone,
              team_name: extraFields.teamName,
              college_code: extraFields.collegeCode,
              team_lead: extraFields.teamLead,
              team_members: extraFields.teamMembers,
              join_code: (extraFields as any).joinCode,
            } : {})
          }
        }
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error: error as AuthError }
    } finally {
      setLoading(false)
    }
  }

  // Add logout function for UI usage
  const logout = () => {
    signOut();
    localStorage.removeItem("authToken");
    setUser(null);
    setSession(null);
  }

  const resetPassword = async (email: string) => {
    try {
      // Check if email exists in auth.users table using RPC function
      const { data: userExists, error: checkError } = await supabase
        .rpc('check_user_exists_by_email', { p_email: email.trim() })

      if (checkError) {
        console.error('Error checking user existence:', checkError)
        return {
          error: {
            message: 'Unable to process request. Please try again later.',
            name: 'DatabaseError',
            status: 500
          } as AuthError
        }
      }

      // If no user found with this email in auth.users
      if (!userExists) {
        return {
          error: {
            message: 'No account found with this email address. Please check your email or sign up for a new account.',
            name: 'UserNotFound',
            status: 404
          } as AuthError
        }
      }

      // Email exists in teams table, proceed with password reset
      const redirectUrl = `${window.location.origin}/reset-password`

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: redirectUrl,
        captchaToken: undefined
      })

      if (error) {
        // Handle rate limiting
        if (error.message.includes('rate limit') ||
            error.message.includes('too many') ||
            error.message.includes('Email rate limit exceeded')) {
          return {
            error: {
              message: 'Too many requests. Please wait a few minutes before trying again.',
              name: 'RateLimited',
              status: 429
            } as AuthError
          }
        }

        // Handle other errors
        return {
          error: {
            message: 'Unable to send reset email. Please try again later.',
            name: 'ResetError',
            status: 400
          } as AuthError
        }
      }

      return { error: null }
    } catch (error) {
      return {
        error: {
          message: 'An unexpected error occurred. Please try again.',
          name: 'UnexpectedError',
          status: 500
        } as AuthError
      }
    }
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    logout // Add logout to context value
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}