import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import { Lock, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams(); // To simulate token reading
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (formData.password.length < 12) {
      setError('Password must be at least 12 characters');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSuccess(true);
      
      // Redirect after success
      setTimeout(() => {
        navigate('/signin');
      }, 3000);
    } catch (err) {
      setError('Failed to reset password. Link may be expired.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout 
        title="Password Reset" 
        subtitle="Your password has been successfully updated"
      >
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <CheckCircle2 size={32} />
            </div>
          </div>
          
          <p className="text-sm text-gray-600">
            You will be redirected to the sign in page in a few seconds...
          </p>
          
          <button
            onClick={() => navigate('/signin')}
            className="w-full bg-lks-navy hover:bg-lks-navyLight text-white font-medium py-2.5 rounded-lg
            transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Sign In Now
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Set New Password" 
      subtitle="Create a strong, secure password for your account"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-start gap-2">
             <span>{error}</span>
          </div>
        )}

        <AuthInput
          label="New Password"
          type="password"
          name="password"
          placeholder="New password"
          value={formData.password}
          onChange={handleChange}
          icon={<Lock size={18} />}
        />

        <AuthInput
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="Confirm new password"
          value={formData.confirmPassword}
          onChange={handleChange}
          icon={<Lock size={18} />}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-lks-navy hover:bg-lks-navyLight text-white font-medium py-2.5 rounded-lg
            transition-all duration-200 shadow-md hover:shadow-lg
            flex items-center justify-center gap-2 mt-2
            disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Updating...</span>
            </>
          ) : (
            <>
              <span>Update Password</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
