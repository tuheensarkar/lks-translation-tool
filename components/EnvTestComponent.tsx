import React from 'react';

const EnvTestComponent = () => {
  const envVars = {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_TRANSLATION_API_KEY: import.meta.env.VITE_TRANSLATION_API_KEY,
    VITE_TRANSLATION_BACKEND_URL: import.meta.env.VITE_TRANSLATION_BACKEND_URL,
    ALL_VARS: import.meta.env
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Environment Variable Test</h1>
      <div style={{ 
        border: '1px solid #ddd', 
        borderRadius: '4px', 
        padding: '15px',
        backgroundColor: '#f8f9fa'
      }}>
        <h3>Current Environment Variables:</h3>
        <p><strong>VITE_API_URL:</strong> {envVars.VITE_API_URL}</p>
        <p><strong>VITE_TRANSLATION_API_KEY:</strong> {envVars.VITE_TRANSLATION_API_KEY ? 'SET' : 'NOT SET'}</p>
        <p><strong>VITE_TRANSLATION_BACKEND_URL:</strong> {envVars.VITE_TRANSLATION_BACKEND_URL}</p>
        
        <h3 style={{ marginTop: '20px' }}>All Environment Variables:</h3>
        <pre style={{ 
          backgroundColor: 'white', 
          padding: '10px', 
          borderRadius: '4px',
          maxHeight: '200px',
          overflow: 'auto'
        }}>
          {JSON.stringify(envVars.ALL_VARS, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default EnvTestComponent;