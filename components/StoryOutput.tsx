
import React, { useState, useEffect, useCallback, useRef } from 'react';
import LoadingSpinner from './LoadingSpinner';
import Button from './Button';
import Select from './Select'; 
import { SelectOption } from '../types';

interface StoryOutputProps {
  storyText: string;
  isLoading: boolean;
  // message prop removed
}

const StoryOutput: React.FC<StoryOutputProps> = ({ storyText, isLoading }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [speechRate, setSpeechRate] = useState<number>(1);

  useEffect(() => {
    const handleVoicesChanged = () => {
        if (typeof window.speechSynthesis === 'undefined') {
            console.warn("Speech synthesis not supported.");
            return;
        }
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);

        setSelectedVoiceURI(prevSelectedURI => {
            const currentSelectedVoiceIsValid = voices.some(v => v.voiceURI === prevSelectedURI);
            if (!currentSelectedVoiceIsValid && voices.length > 0) {
                const vietnameseVoice = voices.find(v => v.lang.startsWith('vi'));
                return vietnameseVoice ? vietnameseVoice.voiceURI : voices[0].voiceURI;
            }
            if (voices.length === 0) return '';
            // If current selection is valid, or if it was empty and a default was set, keep it.
            // If prevSelectedURI was empty and voices.length > 0, the above condition sets it.
            // If prevSelectedURI was valid, it remains.
            return prevSelectedURI; 
        });
    };

    if (typeof window.speechSynthesis !== 'undefined') {
        // Voices might be loaded asynchronously.
        // 'onvoiceschanged' is the reliable event.
        // Initial check in case voices are already loaded
        if (window.speechSynthesis.getVoices().length > 0) {
            handleVoicesChanged();
        }
        // Listen for changes
        window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
    }

    return () => { // Cleanup
        if (typeof window.speechSynthesis !== 'undefined') {
            window.speechSynthesis.onvoiceschanged = null;
        }
        if (typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel(); // Cancel speech on component unmount
        }
    };
  }, []); // Empty dependency array: run once on mount to set up listener and initial load.

  const speakStory = useCallback(() => {
    if (!storyText || typeof window.speechSynthesis === 'undefined') return;

    if (speechSynthesis.speaking) {
      speechSynthesis.cancel(); // Cancel any ongoing speech before starting new
    }
    
    const utterance = new SpeechSynthesisUtterance(storyText);
    utterance.lang = 'vi-VN'; // Default to Vietnamese, voice selection overrides

    if (selectedVoiceURI) {
      const selectedVoice = availableVoices.find(v => v.voiceURI === selectedVoiceURI);
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        utterance.lang = selectedVoice.lang; // Use the language of the selected voice
      }
    }
    utterance.rate = speechRate;
    
    utterance.onstart = () => setIsSpeaking(true);
    
    utterance.onend = () => {
      setIsSpeaking(false);
      utteranceRef.current = null; 
    };
    
    utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
      if (event.error !== 'interrupted' && event.error !== 'canceled') {
        console.error('Speech synthesis error:', event.error, event);
      }
      setIsSpeaking(false);
      utteranceRef.current = null; 
    };
    
    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [storyText, selectedVoiceURI, speechRate, availableVoices]);

  const stopSpeaking = useCallback(() => {
    if (typeof window.speechSynthesis === 'undefined') return;
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    // setIsSpeaking(false); // Let onend or onerror handle this
  }, []);

  // This specific unmount cleanup for the component instance.
  useEffect(() => {
    return () => {
      if (utteranceRef.current && typeof window.speechSynthesis !== 'undefined' && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const voiceOptions: SelectOption[] = availableVoices.map(voice => ({
    value: voice.voiceURI,
    label: `${voice.name} (${voice.lang})`
  }));

  return (
    <div className="bg-[var(--theme-bg-tertiary)] border border-dashed border-[var(--theme-border-dashed)] rounded-lg p-5 mt-5 min-h-[150px] text-[var(--theme-text-primary)] leading-relaxed">
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-full">
          <LoadingSpinner />
          <p className="mt-3 text-[var(--theme-text-secondary)]">AI đang viết câu chuyện...</p>
        </div>
      )}
      {!isLoading && storyText && (
        <>
          <div className="flex flex-col sm:flex-row justify-end items-center mb-4 gap-3 sm:gap-4">
            <div className="w-full sm:w-auto sm:min-w-[200px]">
              <Select
                id="voiceSelect"
                label="Giọng đọc:"
                options={voiceOptions}
                value={selectedVoiceURI}
                onChange={(e) => {
                    stopSpeaking(); // Stop current speech if voice changes
                    setSelectedVoiceURI(e.target.value);
                }}
                disabled={isLoading || !storyText || availableVoices.length === 0}
                className="text-sm py-1.5"
              />
            </div>
            <div className="w-full sm:w-auto flex flex-col items-start sm:items-center">
              <label htmlFor="speechRate" className="text-sm font-medium text-[var(--theme-text-secondary)] mb-1">Tốc độ: {speechRate.toFixed(1)}x</label>
              <input
                type="range"
                id="speechRate"
                min="0.5"
                max="2"
                step="0.1"
                value={speechRate}
                onChange={(e) => {
                    stopSpeaking(); // Stop current speech if rate changes
                    setSpeechRate(parseFloat(e.target.value));
                }}
                disabled={isLoading || !storyText}
                className="w-full h-2 bg-[var(--theme-bg-input)] rounded-lg appearance-none cursor-pointer accent-[var(--theme-accent-primary)]"
              />
            </div>
            {isSpeaking ? (
               <Button onClick={stopSpeaking} variant="warning" fullWidth={false} className="px-3 py-1.5 text-xs sm:text-sm w-full sm:w-auto">
                 Dừng Đọc
               </Button>
            ) : (
              <Button onClick={speakStory} variant="info" fullWidth={false} className="px-3 py-1.5 text-xs sm:text-sm w-full sm:w-auto">
                Đọc Truyện
              </Button>
            )}
          </div>
          <pre className="whitespace-pre-wrap break-words text-left">{storyText}</pre>
        </>
      )}
      {!isLoading && !storyText && (
        <p className="text-center text-[var(--theme-text-secondary)]">Câu chuyện sẽ xuất hiện ở đây.</p>
      )}
    </div>
  );
};

export default StoryOutput;
