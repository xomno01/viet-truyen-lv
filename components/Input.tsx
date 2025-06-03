
import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id: string;
}

const Input: React.FC<InputProps> = ({ label, id, className = '', ...props }) => {
  return (
    <div className="flex flex-col mb-2.5">
      <label htmlFor={id} className="mb-2 font-semibold text-[var(--theme-text-primary)]">
        {label}
      </label>
      <input
        id={id}
        className={`w-full p-3 border border-[var(--theme-border-primary)] bg-[var(--theme-bg-input)] text-[var(--theme-text-primary)] rounded-lg text-base box-border transition-colors duration-200 min-h-[50px] focus:outline-none focus:border-[var(--theme-border-accent)] focus:ring-2 focus:ring-[var(--theme-ring-focus)] focus:ring-opacity-50 disabled:bg-[var(--theme-bg-tertiary)] disabled:cursor-not-allowed disabled:text-[var(--theme-text-secondary)] ${className}`}
        {...props}
      />
    </div>
  );
};

export default Input;
