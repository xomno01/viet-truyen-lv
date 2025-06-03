
import React from 'react';
import { SelectOption } from '../types';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  id: string;
  options: SelectOption[];
}

const Select: React.FC<SelectProps> = ({ 
  label, 
  id, 
  options, 
  className = '', 
  children: _children, 
  ...rest 
}) => {
  return (
    <div className="flex flex-col mb-2.5">
      <label htmlFor={id} className="mb-2 font-semibold text-[var(--theme-text-primary)]">
        {label}
      </label>
      <select
        id={id}
        className={`w-full p-3 border border-[var(--theme-border-primary)] rounded-lg text-base box-border transition-colors duration-200 min-h-[50px] appearance-none bg-[var(--theme-bg-input)] text-[var(--theme-text-primary)] bg-no-repeat bg-right pr-8 focus:outline-none focus:border-[var(--theme-border-accent)] focus:ring-2 focus:ring-[var(--theme-ring-focus)] focus:ring-opacity-50 disabled:bg-[var(--theme-bg-tertiary)] disabled:text-[var(--theme-text-secondary)] disabled:cursor-not-allowed ${className}`}
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, 
          filter: `var(--theme-icon-filter, none)`, // Apply theme filter to SVG
          backgroundPosition: 'right 0.5rem center', 
          backgroundSize: '1.5em 1.5em',
        }}
        {...rest}
      >
        {options.map((option) => (
          <option 
            key={option.value} 
            value={option.value} 
            className="text-[var(--theme-text-primary)] bg-[var(--theme-bg-input)]"
          >
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Select;
