import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, ProtectedRoute } from './contexts/AuthContext';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import TranslatorApp from './components/TranslatorApp';
import ResetPassword from './pages/ResetPassword';
import TranslationHistoryPage from './pages/TranslationHistoryPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <TranslatorApp />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <TranslationHistoryPage />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect to signin */}
          <Route path="*" element={<Navigate to="/signin" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
