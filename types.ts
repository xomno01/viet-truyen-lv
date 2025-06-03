
export interface ChatMessage {
  role: 'user' | 'model';
  parts: Array<{ text: string }>;
}

export interface StoryOptions {
  prompt: string;
  genre: string;
  style: string;
  tone: string;
  audience: string;
  totalChapters: number | null;
  chaptersPerGen: string; // "1", "2", "3", "5", "all", "custom"
  customChaptersPerGen: number | null;
}

export interface DetailedCritique {
  plot?: string;
  characters?: string;
  style?: string;
  theme?: string;
  worldBuilding?: string;
  emotionalImpact?: string;
}

export interface EvaluationResult {
  score: number;
  overallFeedback: string;
  strengths: string;
  areasForImprovement: string;
  detailedCritique?: DetailedCritique;
}

export type ExportFormat = 'txt' | 'doc' | 'pdf' | 'epub';

export interface SelectOption {
  value: string;
  label: string;
}
