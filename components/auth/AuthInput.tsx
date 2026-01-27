import React from 'react';

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: React.ReactNode;
  error?: string;
}

const AuthInput: React.FC<AuthInputProps> = ({
  label,
  icon,
  error,
  className,
  ...props
}) => {
  return (
    <div>
      <label htmlFor={props.name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative rounded-md shadow-sm">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          id={props.name}
          className={`focus:ring-lks-navy focus:border-lks-navy block w-full pl-10 pr-3 py-3 sm:text-sm border rounded-md ${error
              ? 'border-red-300'
              : 'border-gray-300'
            } ${className || ''}`}
          {...props}
        />
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default AuthInput;