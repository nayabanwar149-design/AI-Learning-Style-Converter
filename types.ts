export enum LearningStyleType {
  VISUAL = 'Visual Explanation',
  STORY = 'Story-Based',
  FLOWCHART = 'Flowchart',
  ANALOGY = 'Analogies',
  PRACTICE = 'Practice-Based',
}

export interface LearningStyleConfig {
  id: LearningStyleType;
  label: string;
  description: string;
  iconName: string;
  color: string;
}

export interface ConversionRequest {
  content: string;
  style: LearningStyleType;
}

export interface ConversionResponse {
  markdown: string;
  rawText: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  originalContent: string;
  convertedContent: string;
  style: LearningStyleType;
}
