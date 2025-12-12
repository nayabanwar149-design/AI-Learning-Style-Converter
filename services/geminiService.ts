import { GoogleGenAI } from "@google/genai";
import { LearningStyleType } from "../types";
import { SYSTEM_INSTRUCTION } from "../constants";

// Initialize Gemini Client
// Note: In a real production app, ensure this is handled securely.
// The instructions specify using process.env.API_KEY directly.
const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateFormattedContent = async (
  content: string,
  style: LearningStyleType
): Promise<string> => {
  const client = getClient();
  
  let promptExtras = "";
  
  switch (style) {
    case LearningStyleType.VISUAL:
      promptExtras = "Focus on creating a mental image. If a process or hierarchy is described, generate a Mermaid.js diagram (graph TD) code block. CRITICAL SYNTAX RULES: Use 'graph TD'. Use simple alphanumeric IDs for nodes (e.g., Node1, StepA). Wrap ALL label text in double quotes (e.g., A[\"Label Text\"]). Do not use brackets () inside labels unless escaped. If using subgraphs, IDs MUST be one word (alphanumeric only). Use syntax `subgraph ID [\"Title\"]` for titles with spaces. After the code block, explain the diagram.";
      break;
    case LearningStyleType.FLOWCHART:
      promptExtras = "Strictly output a Mermaid.js flowchart (graph TD) code block that represents the logic. CRITICAL SYNTAX RULES: Use 'graph TD'. Use simple alphanumeric IDs (e.g., A, B, C). Wrap ALL label text in double quotes (e.g., A[\"Start Process\"]). Avoid special characters in IDs. If using subgraphs, IDs MUST be one word (alphanumeric only). Use syntax `subgraph ID [\"Title\"]` for titles with spaces. Follow it with a brief textual summary.";
      break;
    case LearningStyleType.STORY:
      promptExtras = "Rewrite this content as a short, engaging story with characters or personified elements to explain the mechanisms or facts. Make it memorable.";
      break;
    case LearningStyleType.ANALOGY:
      promptExtras = "Explain the key concepts using at least two distinct, simple real-world analogies that a college student would understand instantly.";
      break;
    case LearningStyleType.PRACTICE:
      promptExtras = "Generate a mini-quiz. Include 3-5 Multiple Choice Questions and 1 critical thinking question. Provide the answer key at the very end hidden under a '### Answers' section.";
      break;
  }

  const userPrompt = `
    Input Content:
    """
    ${content}
    """

    Selected Learning Style: ${style}
    
    Specific Instructions for this style:
    ${promptExtras}
    
    Please convert the content now.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, // Slightly creative for stories/analogies, but balanced
      }
    });

    if (!response || !response.text) {
      if (response && response.candidates && response.candidates.length > 0) {
        const candidate = response.candidates[0];
        if (candidate.finishReason && candidate.finishReason !== 'STOP') {
          throw new Error(`Content generation stopped due to: ${candidate.finishReason}. The content might be flagged by safety settings.`);
        }
      }
      return "No content generated. Please try again.";
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    
    let errorMessage = "Failed to generate content. Please try again.";

    if (error instanceof Error) {
        // Parse common error patterns
        const msg = error.message.toLowerCase();
        
        if (msg.includes('400') || msg.includes('api key') || msg.includes('invalid argument')) {
            errorMessage = "Invalid API Key or Request. Please check your configuration.";
        } else if (msg.includes('401') || msg.includes('unauthenticated')) {
             errorMessage = "Authentication failed. Please check your API key.";
        } else if (msg.includes('403') || msg.includes('permission denied')) {
            errorMessage = "Permission denied. Your API key might not have access to this model.";
        } else if (msg.includes('429') || msg.includes('exhausted') || msg.includes('quota')) {
            errorMessage = "Rate limit exceeded. Please wait a moment and try again.";
        } else if (msg.includes('500') || msg.includes('internal')) {
            errorMessage = "Internal server error. Please try again later.";
        } else if (msg.includes('503') || msg.includes('overloaded')) {
            errorMessage = "The AI service is currently overloaded. Please try again later.";
        } else if (msg.includes('safety') || msg.includes('blocked')) {
            errorMessage = "The content was flagged by safety settings. Please try distinct content.";
        } else if (msg.includes('finishreason')) {
             errorMessage = error.message; // Use the specific finish reason message we threw earlier
        } else {
            errorMessage = error.message;
        }
    } else if (typeof error === 'string') {
        errorMessage = error;
    }

    throw new Error(errorMessage);
  }
};