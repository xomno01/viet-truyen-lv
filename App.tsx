
import React, { useState, useEffect, useCallback } from 'react';
import { Chat } from '@google/genai';
import { StoryOptions, EvaluationResult, ExportFormat } from './types';
import { GENRE_OPTIONS, STYLE_OPTIONS, TONE_OPTIONS, AUDIENCE_OPTIONS } from './constants';
import { createChat, sendMessageToChat, evaluateStoryWithGemini, initializeGeminiClient } from './services/geminiService';

import Button from './components/Button';
import Input from './components/Input';
import Modal from './components/Modal';
import LoadingSpinner from './components/LoadingSpinner';
import AdvancedOptionsUI from './components/AdvancedOptionsUI';
import StoryOutput from './components/StoryOutput';
import EvaluationDisplay from './components/EvaluationDisplay';
import ThemeSwitcher from './components/ThemeSwitcher'; // Corrected path

const App: React.FC = () => {
  const initialStoryOptions: StoryOptions = {
    prompt: '',
    genre: '',
    style: '',
    tone: '',
    audience: '',
    totalChapters: null,
    chaptersPerGen: '1',
    customChaptersPerGen: null,
  };

  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [isGeminiClientInitialized, setIsGeminiClientInitialized] = useState<boolean>(false);
  const [apiKeyMessage, setApiKeyMessage] = useState<string>('');

  const [storyOptions, setStoryOptions] = useState<StoryOptions>(initialStoryOptions);
  const [currentStoryText, setCurrentStoryText] = useState<string>('');
  const [geminiChat, setGeminiChat] = useState<Chat | null>(null);
  const [chaptersGenerated, setChaptersGenerated] = useState<number>(0);
  
  const [isLoadingStory, setIsLoadingStory] = useState<boolean>(false);
  const [isLoadingEvaluation, setIsLoadingEvaluation] = useState<boolean>(false);
  
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [evaluationError, setEvaluationError] = useState<string | null>(null);
  
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState<boolean>(false);
  const [isAdvancedOptionsExpanded, setIsAdvancedOptionsExpanded] = useState<boolean>(false);
  
  const [appMessage, setAppMessage] = useState<string>('Nhập API Key của bạn và bắt đầu một câu chuyện.');
  const [continueStoryUserPrompt, setContinueStoryUserPrompt] = useState<string>('');

  const [userSelectedTheme, setUserSelectedTheme] = useState<string>(() => {
    return localStorage.getItem('userSelectedTheme') || 'auto';
  });

  const isStoryStarted = chaptersGenerated > 0;
  const canInteractWithApi = isGeminiClientInitialized;

  useEffect(() => {
    let themeToApply = 'theme-daytime'; // Default theme class name

    if (userSelectedTheme === 'auto') {
      const currentHour = new Date().getHours();
      if (currentHour >= 5 && currentHour < 7) themeToApply = 'theme-dawn';
      else if (currentHour >= 7 && currentHour < 17) themeToApply = 'theme-daytime';
      else if (currentHour >= 17 && currentHour < 20) themeToApply = 'theme-dusk';
      else themeToApply = 'theme-night';
    } else {
      themeToApply = `theme-${userSelectedTheme}`;
    }
    
    // Reset classes then add the new one
    document.body.className = 'flex justify-center items-start min-h-screen p-5 box-border';
    document.body.classList.add(themeToApply);

  }, [userSelectedTheme]);


  useEffect(() => {
    const storedApiKey = localStorage.getItem('geminiApiKey');
    if (storedApiKey) {
      setApiKeyInput(storedApiKey);
      const initialized = initializeGeminiClient(storedApiKey);
      setIsGeminiClientInitialized(initialized);
      setApiKeyMessage(initialized ? 'API Key đã được tải và client đã sẵn sàng.' : 'API Key đã tải không hợp lệ. Vui lòng kiểm tra lại.');
      if(initialized) setAppMessage('Câu chuyện sẽ xuất hiện ở đây.');
    } else {
      setApiKeyMessage('Vui lòng nhập Gemini API Key của bạn để sử dụng ứng dụng.');
    }
  }, []);

  const handleThemeChange = (themeName: string) => {
    setUserSelectedTheme(themeName);
    localStorage.setItem('userSelectedTheme', themeName);
  };

  const handleSaveApiKey = () => {
    if (!apiKeyInput.trim()) {
      setApiKeyMessage('API Key không được để trống.');
      setIsGeminiClientInitialized(false);
      return;
    }
    const initialized = initializeGeminiClient(apiKeyInput.trim());
    setIsGeminiClientInitialized(initialized);
    if (initialized) {
      localStorage.setItem('geminiApiKey', apiKeyInput.trim());
      setApiKeyMessage('API Key đã được lưu và client đã sẵn sàng!');
      if (!currentStoryText) setAppMessage('Câu chuyện sẽ xuất hiện ở đây.');
    } else {
      localStorage.removeItem('geminiApiKey');
      setApiKeyMessage('API Key không hợp lệ hoặc không thể khởi tạo client. Vui lòng thử lại.');
    }
  };

  const handleOptionChange = <K extends keyof StoryOptions>(key: K, value: StoryOptions[K]) => {
    setStoryOptions(prev => ({ ...prev, [key]: value }));
  };

  const getChaptersToWriteValue = useCallback((): number => {
    const { chaptersPerGen, customChaptersPerGen, totalChapters } = storyOptions;
    if (chaptersPerGen === 'custom') {
      return customChaptersPerGen || 1;
    }
    if (chaptersPerGen === 'all') {
      if (totalChapters && totalChapters > 0 && chaptersGenerated < totalChapters) {
        const remaining = totalChapters - chaptersGenerated;
        return remaining > 0 ? remaining : 1;
      }
      return 1; 
    }
    return parseInt(chaptersPerGen, 10) || 1;
  }, [storyOptions, chaptersGenerated]);


  const updateButtonLabels = useCallback(() => {
    const chaptersToWrite = getChaptersToWriteValue();
    const total = storyOptions.totalChapters;
    let startText = `Bắt Đầu (${chaptersToWrite} chương)`;
    let continueText = `Tiếp Tục (${chaptersToWrite} chương)`;

    if (isStoryStarted) {
        const progressText = total && total > 0 ? `${chaptersGenerated}/${total} đã viết` : `${chaptersGenerated} đã viết`;
        if (total && total > 0 && chaptersGenerated >= total) {
            continueText = `Đã Hoàn Thành - ${progressText}`;
        } else {
            let chaptersRemaining = (total && total > 0) ? (total - chaptersGenerated) : Infinity;
            let nextBatch = chaptersToWrite;
            if (chaptersRemaining !== Infinity && chaptersToWrite > chaptersRemaining) {
                nextBatch = chaptersRemaining;
            }
            if (nextBatch <=0 && total && total > 0 && chaptersGenerated < total) nextBatch = 1;
            else if (nextBatch <=0 && total && total > 0 && chaptersGenerated >= total) nextBatch = 0;
            
            if(nextBatch > 0) {
                continueText = `Tiếp Tục (${nextBatch} chương) - ${progressText}`;
            } else {
                 continueText = `Đã Hoàn Thành - ${progressText}`;
            }
        }
    }
    return { startText, continueText };
  }, [getChaptersToWriteValue, storyOptions.totalChapters, chaptersGenerated, isStoryStarted]);

  const { startText: startButtonText, continueText: continueButtonText } = updateButtonLabels();


  const buildStoryPrompt = useCallback((isInitial: boolean, userIdea: string, feedbackForContinuation?: string): string => {
    let fullPrompt = '';
    const { genre, style, tone, audience, totalChapters } = storyOptions;
    const chaptersToWriteNow = getChaptersToWriteValue();

    const selectedGenre = GENRE_OPTIONS.find(opt => opt.value === genre)?.label || '';
    const selectedStyle = STYLE_OPTIONS.find(opt => opt.value === style)?.label || '';
    const selectedTone = TONE_OPTIONS.find(opt => opt.value === tone)?.label || '';
    const selectedAudience = AUDIENCE_OPTIONS.find(opt => opt.value === audience)?.label || '';

    if (isInitial) {
      fullPrompt = `Bạn là một AI chuyên viết truyện. Hãy bắt đầu một câu chuyện mới.\nÝ tưởng chính: "${userIdea}".\n`;
      if (selectedGenre && genre) fullPrompt += `Thể loại: ${selectedGenre}.\n`;
      if (selectedStyle && style) fullPrompt += `Phong cách viết: ${selectedStyle}.\n`;
      if (selectedTone && tone) fullPrompt += `Tông/tâm trạng: ${selectedTone}.\n`;
      if (selectedAudience && audience) fullPrompt += `Đối tượng độc giả: ${selectedAudience}.\n`;
      if (totalChapters && totalChapters > 0) fullPrompt += `Câu chuyện này sẽ có tổng cộng ${totalChapters} chương.\n`;
      fullPrompt += `Lần này, hãy viết ${chaptersToWriteNow} chương đầu tiên.`;
      fullPrompt += ` Mỗi chương cần có tiêu đề rõ ràng theo định dạng: "Chương [Số chương]: [Tên chương]" (ví dụ: "Chương 1: Lời Kêu Gọi").`;
      fullPrompt += ` Mỗi chương nên có độ dài khoảng 300-500 từ, có mở đầu, diễn biến và một kết thúc gợi mở. Đảm bảo văn phong phù hợp với các lựa chọn đã đưa ra.`;
    } else {
      fullPrompt = `Tiếp tục câu chuyện đã bắt đầu.\n`;
      if (feedbackForContinuation) {
        fullPrompt += `Dưới đây là phản hồi từ nhà phê bình về phần trước của câu chuyện, hãy cân nhắc những điểm này khi viết phần tiếp theo:\n---\n${feedbackForContinuation}\n---\n`;
      }
      if (userIdea) fullPrompt += `Gợi ý cho các chương tiếp theo: "${userIdea}".\n`;
      fullPrompt += `Hiện tại, câu chuyện đã có ${chaptersGenerated} chương.\n`;
      if (totalChapters && totalChapters > 0) fullPrompt += `Câu chuyện này dự kiến có ${totalChapters} chương.\n`;
      fullPrompt += `Lần này, hãy viết ${chaptersToWriteNow} chương tiếp theo, bắt đầu từ chương ${chaptersGenerated + 1}.`;
      fullPrompt += ` Mỗi chương cần có tiêu đề rõ ràng theo định dạng: "Chương [Số chương]: [Tên chương]" (ví dụ: "Chương ${chaptersGenerated + 1}: [Tên chương]").`;
      fullPrompt += ` Mỗi chương nên có độ dài khoảng 300-500 từ, nối tiếp mạch truyện, có mở đầu, diễn biến và một kết thúc gợi mở. Đảm bảo văn phong phù hợp với các lựa chọn đã đưa ra.`;
    }
    return fullPrompt;
  }, [storyOptions, chaptersGenerated, getChaptersToWriteValue]);


  const handleGenerateStoryPart = async (userPromptText: string, isInitial: boolean, feedbackForContinuation?: string, isRewrite: boolean = false) => {
    if (!canInteractWithApi) {
        setAppMessage("Lỗi: API Key chưa được thiết lập hoặc không hợp lệ. Vui lòng kiểm tra cài đặt API Key.");
        return;
    }
    if (!geminiChat && !isInitial && !isRewrite) { 
      setAppMessage("Lỗi: Chat chưa được khởi tạo để tiếp tục.");
      return;
    }

    setIsLoadingStory(true);
    setAppMessage('AI đang viết câu chuyện... Vui lòng chờ.');
    setCurrentStoryText(prev => isRewrite ? '' : prev); 

    try {
      const fullPrompt = buildStoryPrompt(isInitial || isRewrite, userPromptText, feedbackForContinuation);
      let currentChatInstance = geminiChat;

      if (isInitial || isRewrite || !currentChatInstance) {
          const systemInstructionParts = [];
          if(storyOptions.genre) systemInstructionParts.push(`Thể loại: ${GENRE_OPTIONS.find(o=>o.value === storyOptions.genre)?.label}`);
          if(storyOptions.style) systemInstructionParts.push(`Phong cách: ${STYLE_OPTIONS.find(o=>o.value === storyOptions.style)?.label}`);
          if(storyOptions.tone) systemInstructionParts.push(`Tông: ${TONE_OPTIONS.find(o=>o.value === storyOptions.tone)?.label}`);
          if(storyOptions.audience) systemInstructionParts.push(`Đối tượng: ${AUDIENCE_OPTIONS.find(o=>o.value === storyOptions.audience)?.label}`);
          const systemInstruction = systemInstructionParts.length > 0 ? `Bạn là AI kể chuyện. ${systemInstructionParts.join('. ')}.` : 'Bạn là AI kể chuyện chuyên nghiệp.';

          currentChatInstance = createChat(systemInstruction);
          setGeminiChat(currentChatInstance);
          if (isRewrite) setChaptersGenerated(0); 
      }
      
      if (!currentChatInstance) throw new Error("Chat instance could not be created.");

      const newStoryPart = await sendMessageToChat(currentChatInstance, fullPrompt);
      const chaptersJustWritten = getChaptersToWriteValue();
      
      setCurrentStoryText(prev => (isRewrite ? '' : (prev ? prev + '\n\n' : '')) + newStoryPart);
      setChaptersGenerated(prev => (isRewrite ? 0 : prev) + chaptersJustWritten);
      setAppMessage('');
      setContinueStoryUserPrompt('');

    } catch (error) {
      console.error("Error generating story part:", error);
      setAppMessage(`Đã xảy ra lỗi khi tạo truyện: ${error instanceof Error ? error.message : String(error)}.`);
      if (error instanceof Error && error.message.includes("API Key")) {
        setIsGeminiClientInitialized(false); 
      }
    } finally {
      setIsLoadingStory(false);
    }
  };

  const handleStartStory = () => {
    if (!canInteractWithApi) {
         setAppMessage('Vui lòng nhập và lưu API Key hợp lệ trước khi bắt đầu.'); return;
    }
    if (!storyOptions.prompt.trim()) {
      setAppMessage('Vui lòng nhập ý tưởng để bắt đầu câu chuyện.');
      return;
    }
    setCurrentStoryText('');
    setChaptersGenerated(0);
    setEvaluationResult(null);
    setEvaluationError(null);
    setGeminiChat(null); 
    handleGenerateStoryPart(storyOptions.prompt.trim(), true);
  };

  const handleContinueStory = () => {
    if (!canInteractWithApi) {
        setAppMessage('Vui lòng nhập và lưu API Key hợp lệ trước khi tiếp tục.'); return;
    }
    if (!currentStoryText) {
      setAppMessage('Chưa có câu chuyện để tiếp tục.');
      return;
    }
    handleGenerateStoryPart(continueStoryUserPrompt.trim(), false);
  };

  const handleEvaluateStory = async () => {
    if (!canInteractWithApi) {
        setAppMessage('Vui lòng nhập và lưu API Key hợp lệ trước khi đánh giá.'); return;
    }
    if (!currentStoryText) {
      setAppMessage('Không có câu chuyện để đánh giá.');
      return;
    }
    setIsLoadingEvaluation(true);
    setEvaluationResult(null);
    setEvaluationError(null);
    setIsEvaluationModalOpen(true);
    try {
      const result = await evaluateStoryWithGemini(currentStoryText);
      setEvaluationResult(result);
    } catch (error) {
      console.error("Error evaluating story:", error);
      setEvaluationError(`Lỗi đánh giá: ${error instanceof Error ? error.message : String(error)}`);
      if (error instanceof Error && error.message.includes("API Key")) {
        setIsGeminiClientInitialized(false);
      }
    } finally {
      setIsLoadingEvaluation(false);
    }
  };

  const getFeedbackSummary = useCallback((evalRes: EvaluationResult | null): string => {
    if (!evalRes) return "";
    let summary = `Điểm số: ${evalRes.score}/10\nNhận xét tổng quan: ${evalRes.overallFeedback}\nĐiểm mạnh: ${evalRes.strengths}\nĐiểm cần cải thiện: ${evalRes.areasForImprovement}\n`;
    if (evalRes.detailedCritique) {
        summary += "Phân tích chi tiết:\n";
        for (const [key, value] of Object.entries(evalRes.detailedCritique)) {
            if (value) summary += `- ${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}\n`;
        }
    }
    return summary;
  },[]);

  const handleContinueWithFeedback = () => {
    if (!canInteractWithApi) {
        setAppMessage('Vui lòng nhập và lưu API Key hợp lệ.'); return;
    }
    if (!currentStoryText || !evaluationResult) {
      setAppMessage('Không có truyện hoặc đánh giá để tiếp tục.');
      return;
    }
    setIsEvaluationModalOpen(false);
    const feedbackSummary = getFeedbackSummary(evaluationResult);
    handleGenerateStoryPart(continueStoryUserPrompt.trim(), false, feedbackSummary);
  };
  
  const handleRewriteWithFeedback = () => {
     if (!canInteractWithApi) {
        setAppMessage('Vui lòng nhập và lưu API Key hợp lệ.'); return;
    }
    if (!storyOptions.prompt.trim() || !evaluationResult) {
        setAppMessage('Cần có ý tưởng gốc và đánh giá để viết lại từ đầu.');
        return;
    }
    setIsEvaluationModalOpen(false);
    const feedbackSummary = getFeedbackSummary(evaluationResult);
    handleGenerateStoryPart(storyOptions.prompt.trim(), true, feedbackSummary, true); 
  };


  const handleExportStory = (format: ExportFormat) => {
    if (!currentStoryText) {
      setAppMessage('Không có câu chuyện để xuất bản.');
      return;
    }
    let filename = `cau_chuyen_ai.${format}`;
    let mimeType = 'text/plain';
    if (format === 'doc') mimeType = 'application/msword';
    // Note: PDF and EPUB are text-only as per original implementation
    
    const blob = new Blob([currentStoryText], { type: `${mimeType};charset=utf-8` });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    setAppMessage(`Câu chuyện đã được tải xuống dưới dạng ${filename}. (Định dạng văn bản đơn giản)`);
    setIsExportModalOpen(false);
  };

  const handleResetStory = () => {
    setStoryOptions(initialStoryOptions);
    setCurrentStoryText('');
    setGeminiChat(null);
    setChaptersGenerated(0);
    setIsLoadingStory(false);
    setIsLoadingEvaluation(false);
    setEvaluationResult(null);
    setEvaluationError(null);
    setIsExportModalOpen(false);
    setIsEvaluationModalOpen(false);
    setIsAdvancedOptionsExpanded(false);
    setAppMessage(isGeminiClientInitialized ? 'Câu chuyện đã được đặt lại. Hãy bắt đầu một câu chuyện mới!' : 'Vui lòng nhập Gemini API Key của bạn.');
    setContinueStoryUserPrompt('');
  };
  
  const handleCopyToClipboard = async () => {
    if (!currentStoryText) {
      setAppMessage('Không có nội dung để sao chép.');
      return;
    }
    try {
      await navigator.clipboard.writeText(currentStoryText);
      setAppMessage('Đã sao chép toàn bộ nội dung truyện!');
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setAppMessage('Lỗi: Không thể sao chép nội dung.');
    }
  };

  const handleOpenAiStudioForSpeech = async () => {
    if (!currentStoryText) {
      setAppMessage('Không có nội dung để chuyển giọng nói.');
      return;
    }
    try {
      await navigator.clipboard.writeText(currentStoryText);
      window.open('https://aistudio.google.com/u/5/generate-speech', '_blank');
      setAppMessage('Nội dung truyện đã được sao chép. Hãy dán (Ctrl+V / Cmd+V) vào trang AI Studio để tạo giọng nói.');
    } catch (err) {
      console.error('Failed to copy text for AI Studio: ', err);
      setAppMessage('Lỗi: Không thể sao chép nội dung cho AI Studio.');
    }
  };

  const isContinueDisabled = 
    !canInteractWithApi ||
    isLoadingStory || 
    (storyOptions.totalChapters !== null && chaptersGenerated >= storyOptions.totalChapters);


  return (
    <div className="bg-[var(--theme-bg-secondary)] rounded-xl shadow-xl p-6 sm:p-8 w-full my-10 transition-colors duration-300">
      <div className="flex justify-between items-center mb-3">
        <h1 className="text-3xl font-bold text-center text-[var(--theme-text-primary)] flex-grow">Người Kể Chuyện AI Chuyên Nghiệp</h1>
        <ThemeSwitcher selectedTheme={userSelectedTheme} onThemeSelect={handleThemeChange} />
      </div>
      <p className="text-center text-[var(--theme-text-secondary)] mb-6">
        Định hình câu chuyện của bạn, nhận đánh giá chuyên sâu từ AI, biên tập để hoàn thiện tác phẩm, và nghe AI đọc truyện!
      </p>

      <div className="mb-6 p-4 border border-[var(--theme-accent-primary)] rounded-lg bg-[var(--theme-bg-tertiary)]">
        <h2 className="text-lg font-semibold text-[var(--theme-text-accent)] mb-2">Cài đặt API Key</h2>
        <Input
          id="apiKeyInput"
          label="Gemini API Key:"
          type="password"
          placeholder="Nhập API Key của bạn ở đây"
          value={apiKeyInput}
          onChange={(e) => setApiKeyInput(e.target.value)}
          className="mb-2"
        />
        <Button onClick={handleSaveApiKey} variant="info" fullWidth={false} className="px-4 py-2 text-sm">
          Lưu API Key
        </Button>
        {apiKeyMessage && (
          <p className={`mt-2 text-sm ${isGeminiClientInitialized && apiKeyMessage.includes("sẵn sàng") ? 'text-green-600' : 'text-red-600'}`}>
            {apiKeyMessage}
          </p>
        )}
        <p className="mt-1 text-xs text-[var(--theme-text-secondary)]">
            Bạn có thể lấy API Key từ <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-[var(--theme-accent-primary)] hover:underline">Google AI Studio</a>.
        </p>
      </div>


      <div className="space-y-4">
        <Input
          id="storyPrompt"
          label="Ý tưởng bắt đầu câu chuyện:"
          placeholder="Ví dụ: 'một con rồng cuối cùng', 'thám tử trong thành phố tương lai'..."
          value={storyOptions.prompt}
          onChange={(e) => handleOptionChange('prompt', e.target.value)}
          disabled={!canInteractWithApi || isLoadingStory || isStoryStarted}
        />

        <AdvancedOptionsUI
          options={storyOptions}
          onOptionChange={handleOptionChange}
          isExpanded={isAdvancedOptionsExpanded}
          onToggleExpand={() => setIsAdvancedOptionsExpanded(!isAdvancedOptionsExpanded)}
          isDisabled={!canInteractWithApi || isLoadingStory || isStoryStarted}
        />

        <Button 
            onClick={handleStartStory} 
            variant="primary" 
            disabled={!canInteractWithApi || isLoadingStory || isStoryStarted || !storyOptions.prompt.trim()}
        >
          {isLoadingStory && chaptersGenerated === 0 ? <LoadingSpinner size="w-6 h-6 inline-block mr-2" /> : null}
          {startButtonText}
        </Button>
      </div>

      <StoryOutput storyText={currentStoryText} isLoading={isLoadingStory && currentStoryText === ''} />
      
      {appMessage && !isLoadingStory && !currentStoryText && !apiKeyMessage.includes("sẵn sàng") && ( 
         <p className={`text-center text-sm mt-2 ${appMessage.includes("Lỗi") || appMessage.includes("lỗi") || appMessage.includes("Key") ? 'text-red-500' : 'text-[var(--theme-text-secondary)]'}`}>
            {appMessage}
        </p>
      )}
      {appMessage && !isLoadingStory && !currentStoryText && isGeminiClientInitialized && (
        <p className="text-center text-sm mt-2 text-[var(--theme-text-secondary)]">
            {appMessage.includes("Key") ? "Câu chuyện sẽ xuất hiện ở đây." : appMessage}
        </p>
      )}


      {isStoryStarted && canInteractWithApi && (
        <div className="mt-6 space-y-4">
          <Input
            id="continuePrompt"
            label="Gợi ý để tiếp tục (tùy chọn, để trống nếu muốn AI tự do):"
            placeholder="Nhập gợi ý tiếp theo..."
            value={continueStoryUserPrompt}
            onChange={(e) => setContinueStoryUserPrompt(e.target.value)}
            disabled={!canInteractWithApi || isLoadingStory}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <Button onClick={handleContinueStory} variant="secondary" style={{backgroundColor: '#4CAF50'}} disabled={isContinueDisabled}>
              {isLoadingStory && chaptersGenerated > 0 ? <LoadingSpinner size="w-6 h-6 inline-block mr-2" /> : null}
              {continueButtonText}
            </Button>
            <Button onClick={handleEvaluateStory} variant="secondary" style={{backgroundColor: '#10b981'}} disabled={!canInteractWithApi || isLoadingStory || isLoadingEvaluation || !currentStoryText}>
              {isLoadingEvaluation ? <LoadingSpinner size="w-6 h-6 inline-block mr-2" /> : null}
              Đánh Giá Tác Phẩm
            </Button>
             <Button 
              onClick={handleCopyToClipboard} 
              variant="info" // Or a neutral variant
              disabled={!canInteractWithApi || isLoadingStory || !currentStoryText}
              style={{backgroundColor: '#5A5A5A'}} // Example: Dark grey
            >
              Sao Chép Nội Dung
            </Button>
            <Button 
              onClick={handleOpenAiStudioForSpeech} 
              variant="info" // Or a custom style
              disabled={!canInteractWithApi || isLoadingStory || !currentStoryText}
              style={{backgroundColor: '#FF6F00'}} // Example: Orange, distinct
            >
              Chuyển Giọng Nói (AI Studio)
            </Button>
            <Button onClick={() => setIsExportModalOpen(true)} variant="secondary" style={{backgroundColor: '#0ea5e9'}} disabled={!canInteractWithApi || isLoadingStory || !currentStoryText}>
              Xuất Bản
            </Button>
            <Button onClick={handleResetStory} variant="danger" disabled={isLoadingStory}>
              Bắt Đầu Lại
            </Button>
          </div>
        </div>
      )}

      <Modal isOpen={isExportModalOpen} onClose={() => setIsExportModalOpen(false)} title="Chọn định dạng xuất bản:">
        <div className="space-y-3">
          {(['txt', 'doc', 'pdf', 'epub'] as ExportFormat[]).map((format) => (
            <Button key={format} onClick={() => handleExportStory(format)} variant="info" className="text-sm">
              {format === 'txt' && 'Tệp Văn Bản (.txt)'}
              {format === 'doc' && 'Word (.doc - Chỉ văn bản)'}
              {format === 'pdf' && 'PDF (.pdf - Chỉ văn bản)'}
              {format === 'epub' && 'EPUB (.epub - Chỉ văn bản)'}
            </Button>
          ))}
          <Button onClick={() => setIsExportModalOpen(false)} variant="neutral" className="mt-3 text-sm">Hủy</Button>
        </div>
      </Modal>

      <Modal isOpen={isEvaluationModalOpen} onClose={() => setIsEvaluationModalOpen(false)} title="Đánh Giá Tác Phẩm Chuyên Sâu" size="lg">
        <EvaluationDisplay evaluationResult={evaluationResult} isLoading={isLoadingEvaluation} error={evaluationError} />
        {!isLoadingEvaluation && evaluationResult && canInteractWithApi && (
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleContinueWithFeedback} variant="info" className="flex-1 text-sm" disabled={!evaluationResult}>
                    Tiếp Tục Theo Gợi Ý
                </Button>
                <Button onClick={handleRewriteWithFeedback} variant="warning" className="flex-1 text-sm" disabled={!evaluationResult || !storyOptions.prompt.trim()}>
                    Viết Lại Từ Đầu Theo Gợi Ý
                </Button>
            </div>
        )}
        <Button onClick={() => setIsEvaluationModalOpen(false)} variant="neutral" className="mt-4 w-full sm:w-auto sm:max-w-xs mx-auto block text-sm">
            Đóng
        </Button>
      </Modal>
    </div>
  );
};

export default App;
