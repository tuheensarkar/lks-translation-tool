import React from 'react';
import { STEPS } from '../constants';

interface StepIndicatorProps {
  currentStep: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  return (
    <div className="w-full py-6 mb-8">
      <div className="flex items-center justify-between relative max-w-3xl mx-auto px-4">
        {/* Connector Line */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-gray-200 -z-10" />
        
        {STEPS.map((step) => {
          const isCompleted = currentStep > step.id;
          const isCurrent = currentStep === step.id;
          
          return (
            <div key={step.id} className="flex flex-col items-center bg-transparent">
              <div 
                className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300
                  ${isCompleted ? 'bg-green-600 text-white border-green-600' : 
                    isCurrent ? 'bg-lks-navy text-white border-lks-navy ring-4 ring-blue-100' : 
                    'bg-white text-gray-400 border-2 border-gray-300'}
                `}
              >
                {isCompleted ? '✓' : step.id}
              </div>
              <span 
                className={`
                  mt-2 text-xs font-medium uppercase tracking-wider transition-colors duration-300 bg-[#F8FAFC] px-1
                  ${isCurrent ? 'text-lks-navy' : 'text-gray-400'}
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;