import { Tick01Icon } from '@hugeicons/core-free-icons';
import type { IconSvgElement } from '@hugeicons/react';
import { HugeiconsIcon } from '@hugeicons/react';

interface Step {
  icon: IconSvgElement;
  label: string;
  color: string;
}

interface StepIndicatorProps {
  currentStep: number;
  steps: Step[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
  const getCurrentStepDescription = () => {
    switch (currentStep) {
      case 1:
        return 'Choose a unique name that represents your community';
      case 2:
        return 'Describe your hub and configure basic settings';
      case 3:
        return 'Set up welcome message and community rules';
      default:
        return '';
    }
  };

  return (
    <div className="mb-8">
      <div className="mb-4 flex items-center justify-between">
        {steps.map((step, index) => {
          const _StepIcon = step.icon;
          const isActive = currentStep === index + 1;
          const isCompleted = currentStep > index + 1;

          return (
            <div key={step.label} className="flex items-center">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'border-green-500 bg-green-500 text-white'
                    : isActive
                      ? `border-indigo-500 bg-indigo-500/10 ${step.color}`
                      : 'border-gray-600 bg-gray-800/50 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <HugeiconsIcon icon={Tick01Icon} className="h-6 w-6" />
                ) : (
                  <HugeiconsIcon icon={step.icon} className="h-6 w-6" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`mx-4 h-0.5 w-16 transition-all duration-300 ${
                    currentStep > index + 1 ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="text-center">
        <h3 className="mb-1 font-semibold text-lg text-white">
          Step {currentStep} of {steps.length}: {steps[currentStep - 1].label}
        </h3>
        <p className="text-gray-400 text-sm">{getCurrentStepDescription()}</p>
      </div>
    </div>
  );
}
