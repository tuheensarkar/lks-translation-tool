import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import { Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';

const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear errors when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined, general: undefined }));
    }
  };

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err: any) {
      setErrors({
        general: err.message || 'Invalid email or password. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Sign In"
      subtitle="Access the Multilingual Document Translator"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {errors.general && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 flex items-start gap-2">
            <span>{errors.general}</span>
          </div>
        )}

        <AuthInput
          label="Official Email Address"
          type="email"
          name="email"
          placeholder="name@lakshmisri.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          icon={<Mail size={18} />}
          autoComplete="email"
        />

        <div className="space-y-1">
          <AuthInput
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={<Lock size={18} />}
            autoComplete="current-password"
          />
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-sm text-lks-navy hover:text-lks-gold font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

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
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <span>Sign in securely</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <div className="pt-6 text-center">
          <p className="text-sm text-gray-500 mb-3">
            Don't have an account?{' '}
          </p>
          <Link
            to="/signup"
            className="inline-block w-full bg-lks-gold hover:bg-lks-goldLight text-lks-navy font-medium py-2.5 rounded-lg
              transition-all duration-200 shadow-md hover:shadow-lg
              text-center"
          >
            Sign Up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignIn;

