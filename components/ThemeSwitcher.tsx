
import React, { useState, useEffect, useRef } from 'react';
import Button from './Button'; // Assuming Button component is in the same directory or adjust path

interface ThemeSwitcherProps {
  selectedTheme: string; // 'auto', 'dawn', 'daytime', 'dusk', 'night'
  onThemeSelect: (themeName: string) => void;
}

const THEME_OPTIONS = [
  { value: 'auto', label: 'Tự động' },
  { value: 'dawn', label: 'Bình minh' },
  { value: 'daytime', label: 'Ban ngày' },
  { value: 'dusk', label: 'Hoàng hôn' },
  { value: 'night', label: 'Ban đêm' },
];

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ selectedTheme, onThemeSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (themeValue: string) => {
    onThemeSelect(themeValue);
    setIsOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const currentThemeLabel = THEME_OPTIONS.find(t => t.value === selectedTheme)?.label || "Chọn Theme";

  return (
    <div className="relative inline-block text-left" ref={wrapperRef}>
      <div>
        <Button
          type="button"
          variant="neutral"
          onClick={toggleDropdown}
          fullWidth={false}
          className="inline-flex justify-center items-center px-3 py-1.5 text-xs sm:text-sm"
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          {currentThemeLabel}
          <svg className="-mr-0.5 ml-1.5 h-4 w-4 sm:h-5 sm:w-5 text-[var(--theme-text-secondary)]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </Button>
      </div>

      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-[var(--theme-bg-input)] ring-1 ring-[var(--theme-border-primary)] ring-opacity-5 focus:outline-none z-50"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="options-menu"
        >
          <div className="py-1" role="none">
            {THEME_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSelect(option.value)}
                className={`${
                  selectedTheme === option.value ? 'bg-[var(--theme-accent-primary)] text-[var(--theme-text-button-primary)]' : 'text-[var(--theme-text-primary)] hover:bg-[var(--theme-bg-tertiary)] hover:text-[var(--theme-text-accent)]'
                } group flex items-center w-full px-4 py-2 text-sm text-left`}
                role="menuitem"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThemeSwitcher;
