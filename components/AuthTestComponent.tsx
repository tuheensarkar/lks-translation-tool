// Test component to isolate authentication issues
import React, { useState, useEffect } from 'react';
import AuthService from '../services/AuthService';

const AuthTestComponent = () => {
  const [testResults, setTestResults] = useState([]);
  const [isTesting, setIsTesting] = useState(false);

  const addResult = (test, status, details = '') => {
    setTestResults(prev => [...prev, { test, status, details, timestamp: new Date().toISOString() }]);
  };

  const runTests = async () => {
    setIsTesting(true);
    setTestResults([]);
    
    try {
      // Test 1: Environment variables
      addResult('Environment Variables', 'Testing');
      console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
      console.log('VITE_TRANSLATION_API_KEY:', import.meta.env.VITE_TRANSLATION_API_KEY);
      addResult('Environment Variables', 'Success', `API_URL: ${import.meta.env.VITE_API_URL}, API_KEY: ${import.meta.env.VITE_TRANSLATION_API_KEY ? 'SET' : 'NOT SET'}`);
      
      // Test 2: AuthService import
      addResult('AuthService Import', 'Testing');
      console.log('AuthService:', AuthService);
      addResult('AuthService Import', 'Success', 'AuthService imported successfully');
      
      // Test 3: Login method exists
      addResult('Login Method', 'Testing');
      console.log('Login method exists:', typeof AuthService.login === 'function');
      addResult('Login Method', 'Success', 'Login method is available');
      
      // Test 4: Actual login attempt
      addResult('Login Attempt', 'Testing');
      try {
        const result = await AuthService.login({
          email: 'test@example.com',
          password: 'Password123!'
        });
        addResult('Login Attempt', 'Success', `Login successful: ${JSON.stringify(result)}`);
      } catch (error) {
        addResult('Login Attempt', 'Failed', `Error: ${error.message}`);
        console.error('Login error details:', error);
      }
      
      // Test 5: Register method
      addResult('Register Method', 'Testing');
      try {
        const result = await AuthService.register({
          email: 'test2@example.com',
          password: 'Password123!',
          name: 'Test User',
          role: 'client'
        });
        addResult('Register Method', 'Success', `Registration successful: ${JSON.stringify(result)}`);
      } catch (error) {
        addResult('Register Method', 'Failed', `Error: ${error.message}`);
        console.error('Registration error details:', error);
      }
      
    } catch (error) {
      addResult('Overall Test', 'Failed', `Critical error: ${error.message}`);
      console.error('Test error:', error);
    } finally {
      setIsTesting(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Authentication Test Results</h1>
      <button 
        onClick={runTests} 
        disabled={isTesting}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '4px',
          cursor: isTesting ? 'not-allowed' : 'pointer',
          marginBottom: '20px'
        }}
      >
        {isTesting ? 'Testing...' : 'Run Tests Again'}
      </button>
      
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '4px', 
        padding: '15px',
        backgroundColor: '#f8f9fa'
      }}>
        {testResults.map((result, index) => (
          <div 
            key={index} 
            style={{ 
              padding: '10px', 
              marginBottom: '10px', 
              backgroundColor: 'white',
              border: '1px solid #eee',
              borderRadius: '4px',
              display: 'flex',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <strong>{result.test}:</strong> 
              <span style={{ 
                marginLeft: '10px',
                color: result.status === 'Success' ? 'green' : 
                       result.status === 'Failed' ? 'red' : 
                       result.status === 'Testing' ? 'orange' : 'blue'
              }}>
                {result.status}
              </span>
            </div>
            {result.details && (
              <div style={{ fontSize: '0.9em', color: '#666' }}>
                {result.details}
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
        <h3>Debug Information:</h3>
        <p><strong>Current Time:</strong> {new Date().toISOString()}</p>
        <p><strong>Test Results Count:</strong> {testResults.length}</p>
        <p><strong>Is Testing:</strong> {isTesting ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

export default AuthTestComponent;