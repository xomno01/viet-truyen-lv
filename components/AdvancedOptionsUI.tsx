
import React from 'react';
import { StoryOptions } from '../types';
import { GENRE_OPTIONS, STYLE_OPTIONS, TONE_OPTIONS, AUDIENCE_OPTIONS, CHAPTERS_PER_GEN_OPTIONS } from '../constants';
import Input from './Input';
import Select from './Select';

interface AdvancedOptionsUIProps {
  options: StoryOptions;
  onOptionChange: <K extends keyof StoryOptions>(key: K, value: StoryOptions[K]) => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isDisabled: boolean;
}

const AdvancedOptionsUI: React.FC<AdvancedOptionsUIProps> = ({
  options,
  onOptionChange,
  isExpanded,
  onToggleExpand,
  isDisabled,
}) => {
  const handleChaptersPerGenChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onOptionChange('chaptersPerGen', value);
    if (value !== 'custom') {
      onOptionChange('customChaptersPerGen', null);
    }
  };
  
  const handleNumericInputChange = (
    key: keyof StoryOptions, 
    value: string
  ) => {
    const numValue = value === '' ? null : parseInt(value, 10);
    if (numValue === null || (!isNaN(numValue) && numValue >=1) ) {
         onOptionChange(key, numValue as StoryOptions[typeof key]);
    } else if (value === '') {
         onOptionChange(key, null as StoryOptions[typeof key]);
    }
  };


  return (
    <>
      <div
        onClick={!isDisabled ? onToggleExpand : undefined}
        className={`p-3 rounded-lg cursor-pointer font-semibold text-center mb-4 transition-colors duration-200 
                    bg-[var(--theme-bg-advanced-toggle)] text-[var(--theme-text-advanced-toggle)] hover:bg-[var(--theme-bg-advanced-toggle-hover)]
                    ${isDisabled ? 'opacity-70 cursor-not-allowed bg-[var(--theme-bg-advanced-toggle-disabled)] text-[var(--theme-text-advanced-toggle-disabled)] hover:bg-[var(--theme-bg-advanced-toggle-disabled)]' : ''}`}
      >
        Tùy chọn nâng cao <span className="ml-1">{isExpanded ? '▲' : '▼'}</span>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-0 p-4 border border-dashed border-[var(--theme-border-advanced)] rounded-lg mb-4 bg-[var(--theme-bg-secondary)] shadow-sm">
          <Select
            id="genreSelect"
            label="Chọn thể loại:"
            options={GENRE_OPTIONS}
            value={options.genre}
            onChange={(e) => onOptionChange('genre', e.target.value)}
            disabled={isDisabled}
          />
          <Select
            id="styleSelect"
            label="Chọn phong cách viết:"
            options={STYLE_OPTIONS}
            value={options.style}
            onChange={(e) => onOptionChange('style', e.target.value)}
            disabled={isDisabled}
          />
          <Select
            id="toneSelect"
            label="Chọn tông/tâm trạng:"
            options={TONE_OPTIONS}
            value={options.tone}
            onChange={(e) => onOptionChange('tone', e.target.value)}
            disabled={isDisabled}
          />
          <Select
            id="audienceSelect"
            label="Chọn đối tượng độc giả:"
            options={AUDIENCE_OPTIONS}
            value={options.audience}
            onChange={(e) => onOptionChange('audience', e.target.value)}
            disabled={isDisabled}
          />
          <Input
            type="number"
            id="totalChaptersInput"
            label="Tổng số chương dự kiến (tùy chọn):"
            placeholder="Ví dụ: 10"
            min="1"
            value={options.totalChapters === null ? '' : String(options.totalChapters)}
            onChange={(e) => handleNumericInputChange('totalChapters', e.target.value)}
            disabled={isDisabled}
          />
          <Select
            id="chaptersPerGenSelect"
            label="Số chương viết mỗi lần:"
            options={CHAPTERS_PER_GEN_OPTIONS}
            value={options.chaptersPerGen}
            onChange={handleChaptersPerGenChange}
            disabled={isDisabled}
          />
          {options.chaptersPerGen === 'custom' && (
            <Input
              type="number"
              id="customChaptersPerGenInput"
              label="Nhập số chương tùy chỉnh:"
              placeholder="Ví dụ: 4"
              min="1"
              value={options.customChaptersPerGen === null ? '' : String(options.customChaptersPerGen)}
              onChange={(e) => handleNumericInputChange('customChaptersPerGen', e.target.value)}
              disabled={isDisabled}
              className="sm:col-start-2" 
            />
          )}
        </div>
      )}
    </>
  );
};

export default AdvancedOptionsUI;
