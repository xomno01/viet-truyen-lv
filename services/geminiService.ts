
import { GoogleGenAI, GenerateContentResponse, Chat } from "@google/genai";
import { ChatMessage, EvaluationResult } from '../types';
import { GEMINI_TEXT_MODEL } from '../constants';

let ai: GoogleGenAI | null = null;

export const initializeGeminiClient = (apiKey: string): boolean => {
  if (!apiKey) {
    console.warn("API Key is missing. Gemini Client not initialized.");
    ai = null;
    return false;
  }
  try {
    ai = new GoogleGenAI({ apiKey });
    console.log("Gemini Client initialized successfully with provided API Key.");
    return true;
  } catch (error) {
    console.error("Failed to initialize Gemini Client:", error);
    ai = null;
    return false;
  }
};

const getAiClient = (): GoogleGenAI => {
  if (!ai) {
    throw new Error("Gemini Client not initialized. Please set your API Key in the application settings.");
  }
  return ai;
};

function parseJsonFromText(text: string): any {
  let jsonStr = text.trim();
  const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[2]) {
    jsonStr = match[2].trim();
  }
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "Original text:", text);
    throw new Error("AI returned invalid JSON. Original text was: " + text.substring(0, 100) + "...");
  }
}

export const createChat = (systemInstruction?: string): Chat => {
  const client = getAiClient();
  return client.chats.create({
    model: GEMINI_TEXT_MODEL,
    config: systemInstruction ? { systemInstruction } : undefined,
  });
};

export const sendMessageToChat = async (chat: Chat, message: string): Promise<string> => {
  // No need to call getAiClient() here as 'chat' instance is already created with one.
  try {
    const response: GenerateContentResponse = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Error sending message to chat:", error);
    throw new Error(`Gemini API Error: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const generateStoryContent = async (
  prompt: string,
  existingChatHistory?: ChatMessage[] // This parameter seems unused if Chat instances are used. Consider removing or integrating.
): Promise<string> => {
  const client = getAiClient();
  try {
    // For conversational context, it's better to use Chat instances (createChat, sendMessageToChat)
    // This function as a standalone generateContent might not leverage existingChatHistory effectively
    // without constructing the full 'contents' array structure for multi-turn.
    // For now, it acts as a single-turn generation.
    const contents = existingChatHistory ?
                     [...existingChatHistory, { role: 'user', parts: [{ text: prompt }] }] as any :
                     prompt;

    const response: GenerateContentResponse = await client.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: contents,
    });
    return response.text;
  } catch (error) {
    console.error("Error generating story content:", error);
    throw new Error(`Gemini API Error: ${error instanceof Error ? error.message : String(error)}`);
  }
};

export const evaluateStoryWithGemini = async (storyText: string): Promise<EvaluationResult> => {
  const client = getAiClient();
  const evaluationPrompt = `Bạn là một nhà phê bình văn học uyên bác. Hãy đọc kỹ và đánh giá toàn diện tác phẩm dưới đây.
Cho điểm trên thang từ 1 đến 10.
Cung cấp nhận xét chi tiết, mang tính xây dựng, tập trung vào các khía cạnh sau:
1.  Cốt truyện và Cấu trúc.
2.  Nhân vật.
3.  Chủ đề và Thông điệp.
4.  Ngôn ngữ và Phong cách.
5.  Bối cảnh và Không khí (World-building).
6.  Cảm xúc.
7.  Điểm mạnh nổi bật.
8.  Điểm cần cải thiện.

Định dạng đầu ra JSON với các trường:
- "score" (số nguyên từ 1 đến 10)
- "overallFeedback" (chuỗi)
- "strengths" (chuỗi)
- "areasForImprovement" (chuỗi)
- "detailedCritique" (đối tượng tùy chọn, ví dụ: {"plot": "...", "characters": "..."})

[Nội dung câu chuyện]
${storyText}`;

  try {
    const response: GenerateContentResponse = await client.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: evaluationPrompt,
      config: {
        responseMimeType: "application/json",
      },
    });
    
    const rawJsonText = response.text;
    const parsedResult = parseJsonFromText(rawJsonText) as EvaluationResult;
    
    if (typeof parsedResult.score !== 'number' || 
        typeof parsedResult.overallFeedback !== 'string' ||
        typeof parsedResult.strengths !== 'string' ||
        typeof parsedResult.areasForImprovement !== 'string') {
        throw new Error("AI returned JSON with missing required fields for evaluation.");
    }
    return parsedResult;

  } catch (error) {
    console.error("Error evaluating story:", error);
    if (error instanceof Error && error.message.startsWith("AI returned invalid JSON")) {
        throw error; 
    }
    throw new Error(`Gemini API Error during evaluation: ${error instanceof Error ? error.message : String(error)}`);
  }
};
