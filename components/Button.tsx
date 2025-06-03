
import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'warning' | 'info' | 'neutral';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = true,
  className = '',
  ...props
}) => {
  const baseStyle = "font-bold py-3 px-6 rounded-full text-lg transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2";
  const widthStyle = fullWidth ? "w-full" : "";
  const focusRingOffsetStyle = "focus:ring-offset-[var(--theme-bg-secondary,white)]";


  let variantStyle = '';
  switch (variant) {
    case 'primary':
      variantStyle = 'bg-[var(--theme-accent-primary)] text-[var(--theme-text-button-primary)] hover:shadow-lg hover:bg-[var(--theme-accent-primary-hover)] hover:translate-y-[-2px] focus:ring-[var(--theme-accent-primary)]';
      break;
    case 'secondary': // Specific semantic color (green)
      variantStyle = 'bg-green-500 text-[var(--theme-text-button-primary)] hover:bg-green-600 hover:shadow-lg hover:translate-y-[-2px] focus:ring-green-500';
      break;
    case 'danger': // Specific semantic color (red)
      variantStyle = 'bg-red-500 text-[var(--theme-text-button-primary)] hover:bg-red-600 hover:shadow-lg hover:translate-y-[-2px] focus:ring-red-500';
      break;
    case 'warning': // Specific semantic color (amber)
      variantStyle = 'bg-amber-500 text-[var(--theme-text-button-primary)] hover:bg-amber-600 hover:shadow-lg hover:translate-y-[-2px] focus:ring-amber-500';
      break;
    case 'info': // Specific semantic color (blue)
      variantStyle = 'bg-blue-500 text-[var(--theme-text-button-primary)] hover:bg-blue-600 hover:shadow-lg hover:translate-y-[-2px] focus:ring-blue-500';
      break;
    case 'neutral':
        variantStyle = 'bg-[var(--theme-bg-tertiary)] text-[var(--theme-text-secondary)] hover:bg-[var(--theme-border-primary)] hover:text-[var(--theme-text-accent)] hover:shadow-md hover:translate-y-[-1px] focus:ring-[var(--theme-accent-secondary)]';
        break;
  }

  const disabledStyle = 'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none';

  return (
    <button
      className={`${baseStyle} ${variantStyle} ${widthStyle} ${disabledStyle} ${focusRingOffsetStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
