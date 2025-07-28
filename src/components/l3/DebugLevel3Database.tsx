import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Level3Service from './services/level3Service';

interface TestResult {
  test: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

export const DebugLevel3Database: React.FC = () => {
  const { user } = useAuth();
  const [results, setResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const addResult = (test: string, status: 'success' | 'error', message: string, data?: any) => {
    setResults(prev => [...prev, { test, status, message, data }]);
  };

  const runDatabaseTests = async () => {
    setIsRunning(true);
    setResults([]);

    try {
      // Test 1: Authentication
      addResult('Authentication', 'pending', 'Checking user authentication...');
      
      if (!user) {
        addResult('Authentication', 'error', 'User not authenticated');
        return;
      }
      
      addResult('Authentication', 'success', `User authenticated: ${user.email}`);

      // Test 2: Direct Supabase connection
      addResult('Supabase Connection', 'pending', 'Testing direct Supabase connection...');
      
      const { data: authData, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        addResult('Supabase Connection', 'error', `Auth error: ${authError.message}`);
        return;
      }
      
      addResult('Supabase Connection', 'success', 'Supabase connection successful');

      // Test 3: Table access
      addResult('Table Access', 'pending', 'Testing level3_progress table access...');
      
      const { data: tableData, error: tableError } = await supabase
        .from('level3_progress')
        .select('count', { count: 'exact', head: true });
      
      if (tableError) {
        addResult('Table Access', 'error', `Table error: ${tableError.message}`);
        return;
      }
      
      addResult('Table Access', 'success', 'Table accessible');

      // Test 4: RPC Function
      addResult('RPC Function', 'pending', 'Testing upsert_level3_progress_with_history function...');
      
      const { data: rpcData, error: rpcError } = await supabase.rpc('upsert_level3_progress_with_history', {
        p_user_id: user.id,
        p_module: 'debug-test',
        p_level: 3,
        p_scenario_index: 0,
        p_score: 100,
        p_placed_pieces: { test: true, timestamp: new Date().toISOString() },
        p_is_completed: true,
        p_time_taken: 60
      });
      
      if (rpcError) {
        addResult('RPC Function', 'error', `RPC error: ${rpcError.message}`, rpcError);
        return;
      }
      
      addResult('RPC Function', 'success', 'RPC function successful', rpcData);

      // Test 5: Level3Service
      addResult('Level3Service', 'pending', 'Testing Level3Service.saveGameCompletion...');
      
      const testData = {
        userId: user.id,
        module: 'debug-service-test',
        level: 3,
        scenario_index: 1,
        finalScore: 150,
        finalTime: 90,
        placedPieces: { 
          test: true,
          scenario: 1,
          timestamp: new Date().toISOString()
        },
        isCompleted: true
      };

      const serviceResult = await Level3Service.saveGameCompletion(testData);
      
      if (serviceResult.error) {
        addResult('Level3Service', 'error', `Service error: ${serviceResult.error.message}`, serviceResult.error);
        return;
      }
      
      addResult('Level3Service', 'success', `Service successful. New high score: ${serviceResult.isNewHighScore}`, serviceResult.data);

      // Test 6: Data verification
      addResult('Data Verification', 'pending', 'Verifying saved data...');
      
      const { data: verifyData, error: verifyError } = await supabase
        .from('level3_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('module', 'debug-service-test')
        .eq('scenario_index', 1);
      
      if (verifyError) {
        addResult('Data Verification', 'error', `Verification error: ${verifyError.message}`);
        return;
      }
      
      addResult('Data Verification', 'success', 'Data saved and verified successfully', verifyData);

    } catch (error) {
      addResult('General Error', 'error', `Unexpected error: ${error instanceof Error ? error.message : 'Unknown error'}`, error);
    } finally {
      setIsRunning(false);
    }
  };

  const testGameCompletion = async () => {
    if (!user) {
      alert('Please log in first');
      return;
    }

    setIsRunning(true);
    
    try {
      const testData = {
        userId: user.id,
        module: '1', // Module 1
        level: 3,
        scenario_index: 2, // Scenario 3
        finalScore: 200,
        finalTime: 120,
        placedPieces: {
          violations: ['v1', 'v2'],
          actions: ['a1', 'a2'],
          timestamp: new Date().toISOString()
        },
        isCompleted: true
      };

      console.log('Testing game completion with data:', testData);
      
      const result = await Level3Service.saveGameCompletion(testData);
      
      if (result.error) {
        alert(`Save failed: ${result.error.message}`);
      } else {
        alert(`Save successful! New high score: ${result.isNewHighScore}`);
      }
      
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2>Level 3 Database Debug Tool</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={runDatabaseTests} 
          disabled={isRunning}
          style={{ 
            padding: '10px 20px', 
            marginRight: '10px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          {isRunning ? 'Running Tests...' : 'Run Database Tests'}
        </button>
        
        <button 
          onClick={testGameCompletion} 
          disabled={isRunning}
          style={{ 
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isRunning ? 'not-allowed' : 'pointer'
          }}
        >
          Test Game Completion
        </button>
      </div>

      <div>
        {results.map((result, index) => (
          <div 
            key={index}
            style={{
              padding: '10px',
              margin: '10px 0',
              border: '1px solid #ddd',
              borderRadius: '4px',
              backgroundColor: 
                result.status === 'success' ? '#d4edda' :
                result.status === 'error' ? '#f8d7da' : '#d1ecf1'
            }}
          >
            <h4>{result.test}</h4>
            <p>{result.message}</p>
            {result.data && (
              <pre style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '10px', 
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '12px'
              }}>
                {JSON.stringify(result.data, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugLevel3Database;
