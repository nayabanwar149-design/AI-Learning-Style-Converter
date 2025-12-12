import { LearningStyleType, LearningStyleConfig } from './types';
import { 
  Eye, 
  BookOpen, 
  GitGraph, 
  Zap, 
  CheckSquare 
} from 'lucide-react';

export const LEARNING_STYLES: LearningStyleConfig[] = [
  {
    id: LearningStyleType.VISUAL,
    label: 'Visual Explanation',
    description: 'Generate descriptive diagrams, mental maps, and visual breakdowns.',
    iconName: 'Eye',
    color: 'bg-blue-100 text-blue-600 border-blue-200 hover:border-blue-400',
  },
  {
    id: LearningStyleType.STORY,
    label: 'Story-Based',
    description: 'Rewrite content as a relatable narrative or metaphoric tale.',
    iconName: 'BookOpen',
    color: 'bg-purple-100 text-purple-600 border-purple-200 hover:border-purple-400',
  },
  {
    id: LearningStyleType.FLOWCHART,
    label: 'Flowchart',
    description: 'Break content into step-by-step sequences or logic flows.',
    iconName: 'GitGraph',
    color: 'bg-emerald-100 text-emerald-600 border-emerald-200 hover:border-emerald-400',
  },
  {
    id: LearningStyleType.ANALOGY,
    label: 'Analogies',
    description: 'Explain complex concepts using real-life comparisons.',
    iconName: 'Zap',
    color: 'bg-amber-100 text-amber-600 border-amber-200 hover:border-amber-400',
  },
  {
    id: LearningStyleType.PRACTICE,
    label: 'Practice-Based',
    description: 'Create quizzes, MCQs, and exercises to test knowledge.',
    iconName: 'CheckSquare',
    color: 'bg-rose-100 text-rose-600 border-rose-200 hover:border-rose-400',
  },
];

export const SYSTEM_INSTRUCTION = `You are an expert educational content converter called "AI Learning Style Converter". 
Your goal is to rewrite study material into specific learning styles for university students. 
Strictly adhere to the following constraints:
1. Use only the input content; do not hallucinate unrelated information.
2. Keep explanations concise, clear, and suitable for early university students.
3. Ensure accuracy and high readability.
4. Output must be in Markdown format.

For specific styles:
- If 'Visual Explanation' or 'Flowchart' is selected, try to generate a Mermaid.js diagram code block (using \`\`\`mermaid) where appropriate to visualize the concept, followed by a text explanation.
- For 'Story-Based', create a coherent narrative.
- For 'Practice-Based', provide 5 Multiple Choice Questions (with answers at the bottom) and 2 Short Answer scenarios.
`;
