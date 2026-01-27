import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import AuthInput from '../components/auth/AuthInput';
import { Lock, Mail, User, ArrowRight, Check, X, Loader2 } from 'lucide-react';

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth(); // Get register function from auth context
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Password requirements
  const requirements = [
    { id: 'length', label: 'At least 12 characters', regex: /.{12,}/ },
    { id: 'upper', label: 'Uppercase letter', regex: /[A-Z]/ },
    { id: 'lower', label: 'Lowercase letter', regex: /[a-z]/ },
    { id: 'number', label: 'Number', regex: /[0-9]/ },
    { id: 'special', label: 'Special character', regex: /[^A-Za-z0-9]/ },
  ];

  useEffect(() => {
    // Calculate password strength
    const matches = requirements.filter(req => req.regex.test(formData.password)).length;
    setPasswordStrength((matches / requirements.length) * 100);
  }, [formData.password]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear field-specific error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (passwordStrength < 100) {
      newErrors.password = 'Password does not meet all security requirements';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);

    try {
      // Register via AuthContext
      await register({
        email: formData.email,
        name: formData.fullName,
        password: formData.password,
        role: 'client',
        organization: 'LKS Client' // Default for sign ups
      });

      // Success - redirect to sign in
      navigate('/signin');
    } catch (err: any) {
      setErrors({ general: err.message || 'Failed to create account. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Request Access"
      subtitle="Create your secure account"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
            {errors.general}
          </div>
        )}

        <AuthInput
          label="Full Name"
          name="fullName"
          placeholder="John Doe"
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
          icon={<User size={18} />}
        />

        <AuthInput
          label="Official Email Address"
          type="email"
          name="email"
          placeholder="name@lakshmisri.com"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          icon={<Mail size={18} />}
        />

        <div className="space-y-2">
          <AuthInput
            label="Password"
            type="password"
            name="password"
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            icon={<Lock size={18} />}
          />

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 space-y-2">
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-gray-500 font-medium">Security Strength</span>
                <span className={`font-bold ${passwordStrength === 100 ? 'text-green-600' :
                    passwordStrength > 50 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                  {passwordStrength === 100 ? 'Excellent' :
                    passwordStrength > 50 ? 'Moderate' : 'Weak'}
                </span>
              </div>
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${passwordStrength === 100 ? 'bg-green-500' :
                      passwordStrength > 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  style={{ width: `${passwordStrength}%` }}
                />
              </div>

              <div className="grid grid-cols-1 gap-1 pt-1">
                {requirements.map(req => {
                  const met = req.regex.test(formData.password);
                  return (
                    <div key={req.id} className="flex items-center gap-2 text-xs">
                      {met ? (
                        <Check size={12} className="text-green-500" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-gray-300 flex items-center justify-center">
                          <div className="w-1 h-1 bg-gray-300 rounded-full" />
                        </div>
                      )}
                      <span className={met ? 'text-gray-700' : 'text-gray-400'}>
                        {req.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <AuthInput
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          icon={<Lock size={18} />}
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-lks-navy hover:bg-lks-navyLight text-white font-medium py-2.5 rounded-lg
            transition-all duration-200 shadow-md hover:shadow-lg
            flex items-center justify-center gap-2 mt-4
            disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none"
        >
          {isLoading ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Request Secure Access</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>

        <div className="pt-4 text-center border-t border-gray-100 mt-6">
          <p className="text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/signin" className="text-lks-navy font-semibold hover:text-lks-gold transition-colors">
              Sign in securely
            </Link>
          </p>
        </div>
      </form>
    </AuthLayout>
  );
};

export default SignUp;