import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface AuthStatus {
  contextUser: any;
  sessionUser: any;
  sessionValid: boolean;
  error: string | null;
}

export const AuthStatusChecker: React.FC = () => {
  const { user } = useAuth();
  const [authStatus, setAuthStatus] = useState<AuthStatus>({
    contextUser: null,
    sessionUser: null,
    sessionValid: false,
    error: null
  });
  const [isChecking, setIsChecking] = useState(false);

  const checkAuthStatus = async () => {
    setIsChecking(true);
    try {
      // Check session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      // Check user
      const { data: userData, error: userError } = await supabase.auth.getUser();

      setAuthStatus({
        contextUser: user,
        sessionUser: userData?.user || null,
        sessionValid: !sessionError && !!sessionData.session,
        error: sessionError?.message || userError?.message || null
      });

      console.log('🔍 Auth Status Check:', {
        contextUser: user ? { id: user.id, email: user.email } : null,
        sessionUser: userData?.user ? { id: userData.user.id, email: userData.user.email } : null,
        sessionValid: !sessionError && !!sessionData.session,
        sessionError,
        userError
      });

    } catch (error) {
      setAuthStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    } finally {
      setIsChecking(false);
    }
  };

  const refreshSession = async () => {
    setIsChecking(true);
    try {
      const { error } = await supabase.auth.refreshSession();
      if (error) {
        throw error;
      }
      console.log('✅ Session refreshed successfully');
      await checkAuthStatus();
    } catch (error) {
      console.error('❌ Session refresh failed:', error);
      setAuthStatus(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Session refresh failed'
      }));
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, [user]);

  const getStatusColor = (isValid: boolean) => isValid ? 'text-green-600' : 'text-red-600';
  const getStatusIcon = (isValid: boolean) => isValid ? '✅' : '❌';

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid #ccc', 
      borderRadius: '8px', 
      padding: '15px', 
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      zIndex: 9999,
      maxWidth: '300px',
      fontSize: '12px'
    }}>
      <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', fontWeight: 'bold' }}>
        🔐 Auth Status
      </h4>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Context User:</strong>{' '}
        <span className={getStatusColor(!!authStatus.contextUser)}>
          {getStatusIcon(!!authStatus.contextUser)} {authStatus.contextUser?.email || 'None'}
        </span>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Session User:</strong>{' '}
        <span className={getStatusColor(!!authStatus.sessionUser)}>
          {getStatusIcon(!!authStatus.sessionUser)} {authStatus.sessionUser?.email || 'None'}
        </span>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <strong>Session Valid:</strong>{' '}
        <span className={getStatusColor(authStatus.sessionValid)}>
          {getStatusIcon(authStatus.sessionValid)} {authStatus.sessionValid ? 'Yes' : 'No'}
        </span>
      </div>

      {authStatus.error && (
        <div style={{ marginBottom: '8px', color: 'red', fontSize: '11px' }}>
          <strong>Error:</strong> {authStatus.error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
        <button
          onClick={checkAuthStatus}
          disabled={isChecking}
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isChecking ? 'not-allowed' : 'pointer'
          }}
        >
          {isChecking ? 'Checking...' : 'Check'}
        </button>
        
        <button
          onClick={refreshSession}
          disabled={isChecking}
          style={{
            padding: '4px 8px',
            fontSize: '11px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isChecking ? 'not-allowed' : 'pointer'
          }}
        >
          Refresh
        </button>
      </div>

      <div style={{ marginTop: '8px', fontSize: '10px', color: '#666' }}>
        IDs Match: {authStatus.contextUser?.id === authStatus.sessionUser?.id ? '✅' : '❌'}
      </div>
    </div>
  );
};

export default AuthStatusChecker;
