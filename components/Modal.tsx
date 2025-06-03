
import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  let sizeClass = 'max-w-md'; // default md
  if (size === 'sm') sizeClass = 'max-w-sm';
  if (size === 'lg') sizeClass = 'max-w-lg';
  if (size === 'xl') sizeClass = 'max-w-xl';


  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4 overflow-y-auto"
        onClick={onClose} // Allow closing by clicking backdrop
    >
      <div
        className={`bg-[var(--theme-bg-secondary)] rounded-xl shadow-2xl p-6 sm:p-8 w-full ${sizeClass} text-left transform transition-all duration-300 ease-out`}
        onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing it
      >
        {title && (
          <h3 className="text-xl sm:text-2xl font-bold text-[var(--theme-text-primary)] mb-4 sm:mb-6 text-center">
            {title}
          </h3>
        )}
        {children}
      </div>
    </div>
  );
};

export default Modal;
