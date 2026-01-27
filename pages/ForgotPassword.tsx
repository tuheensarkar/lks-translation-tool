import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import { Mail, ArrowRight, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    
    setError('');
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
    } catch (err) {
      setError('Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout 
        title="Check your email" 
        subtitle="We have sent a password reset link to your email address."
      >
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle2 size={32} />
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            If you don't see the email, check your spam folder or make sure you entered the correct address.
          </p>

          <Link 
            to="/signin"
            className="w-full bg-lks-navy hover:bg-lks-navyLight text-white font-medium py-2.5 rounded-lg
            transition-all duration-200 shadow-md hover:shadow-lg
            flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Reset Password" 
      subtitle="Enter your email to receive a secure reset link"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-start gap-2">
             <span>{error}</span>
          </div>
        )}

        <AuthInput
          label="Official Email Address"
          type="email"
          placeholder="name@lakshmisri.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={error ? undefined : undefined} // Only show general error for now
          icon={<Mail size={18} />}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-lks-navy hover:bg-lks-navyLight text-white font-medium py-2.5 rounded-lg
            transition-all duration-200 shadow-md hover:shadow-lg
            flex items-center justify-center gap-2
            disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <>
              <span>Send Reset Link</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <div className="text-center">
          <Link 
            to="/signin" 
            className="text-sm text-gray-500 hover:text-lks-navy font-medium flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;
