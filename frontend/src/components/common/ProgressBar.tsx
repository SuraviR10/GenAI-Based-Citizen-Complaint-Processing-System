import React from 'react';
import { Check } from 'lucide-react';

export interface StepItem {
  step: number;
  label: string;
  shortLabel?: string;
}

export interface ProgressBarProps {
  currentStep: number;
  steps: StepItem[];
  onStepClick?: (step: number) => void;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  steps,
  onStepClick
}) => {
  return (
    <div style={{ width: '100%', margin: '0 auto 2rem auto' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative'
        }}
      >
        {/* Connecting Background Line */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '5%',
            right: '5%',
            height: '3px',
            backgroundColor: 'var(--color-border)',
            zIndex: 1
          }}
        />

        {/* Active Progress Line */}
        <div
          style={{
            position: 'absolute',
            top: '20px',
            left: '5%',
            width: `${((currentStep - 1) / (steps.length - 1)) * 90}%`,
            height: '3px',
            backgroundColor: 'var(--color-accent-500)',
            transition: 'width var(--transition-normal)',
            zIndex: 2
          }}
        />

        {steps.map((item) => {
          const isCompleted = item.step < currentStep;
          const isCurrent = item.step === currentStep;
          const isClickable = onStepClick && item.step < currentStep;

          return (
            <div
              key={item.step}
              onClick={() => isClickable && onStepClick(item.step)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
                zIndex: 3,
                cursor: isClickable ? 'pointer' : 'default',
                width: `${100 / steps.length}%`
              }}
            >
              {/* Step Circle with 3D depth */}
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-full)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  transition: 'all var(--transition-normal)',
                  backgroundColor: isCompleted
                    ? 'var(--color-accent-500)'
                    : isCurrent
                    ? 'var(--color-primary-800)'
                    : 'var(--color-bg-card)',
                  color: isCompleted || isCurrent ? '#ffffff' : 'var(--color-text-muted)',
                  border: isCompleted
                    ? '2px solid var(--color-accent-500)'
                    : isCurrent
                    ? '3px solid var(--color-accent-400)'
                    : '2px solid var(--color-border)',
                  boxShadow: isCurrent
                    ? '0 0 16px rgba(0, 173, 181, 0.4), 0 4px 10px rgba(11, 25, 44, 0.2)'
                    : isCompleted
                    ? '0 4px 10px rgba(0, 173, 181, 0.25)'
                    : 'var(--shadow-sm)'
                }}
              >
                {isCompleted ? <Check size={18} strokeWidth={3} /> : item.step}
              </div>

              {/* Step Label */}
              <span
                style={{
                  marginTop: '8px',
                  fontSize: '0.8rem',
                  fontWeight: isCurrent ? 700 : isCompleted ? 600 : 500,
                  color: isCurrent
                    ? 'var(--color-primary-800)'
                    : isCompleted
                    ? 'var(--color-text-primary)'
                    : 'var(--color-text-muted)',
                  textAlign: 'center',
                  whiteSpace: 'nowrap'
                }}
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
