
import React from 'react';

interface LoadingSpinnerProps {
  size?: string; // e.g., 'w-10 h-10'
  className?: string;
}

// Note: The animation class 'loading-spinner-animation' is defined in index.html 
// and already uses CSS variables: --theme-bg-tertiary and --theme-accent-primary.
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'w-10 h-10',
  className = '' 
}) => {
  return (
    <div className={`loading-spinner-animation ${size} ${className}`} />
  );
};

export default LoadingSpinner;
