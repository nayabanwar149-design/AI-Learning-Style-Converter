import React, { useState, ChangeEvent, useRef, useEffect } from 'react';
import { Upload, X, FileText, Loader2, Mic, MicOff } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

// Initialize worker for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/build/pdf.worker.min.mjs';

interface InputSectionProps {
  text: string;
  setText: React.Dispatch<React.SetStateAction<string>>;
  disabled?: boolean;
}

const InputSection: React.FC<InputSectionProps> = ({ text, setText, disabled }) => {
  const [fileName, setFileName] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsReading(true);
    setFileName(file.name);

    try {
      if (file.type === "application/pdf" || file.name.endsWith('.pdf')) {
        await handlePdfUpload(file);
      } else if (file.type === "text/plain" || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
        handleTextUpload(file);
      } else {
        alert("Please upload plain text files (.txt, .md) or PDF files (.pdf).");
        setFileName(null);
        setIsReading(false);
      }
    } catch (error) {
      console.error("File upload error:", error);
      alert("Error reading file.");
      setFileName(null);
      setIsReading(false);
    }
  };

  const handleTextUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setText(event.target.result as string);
        setIsReading(false);
      }
    };
    reader.onerror = () => {
      alert("Failed to read text file.");
      setIsReading(false);
    };
    reader.readAsText(file);
  };

  const handlePdfUpload = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        // Extract text items and join them with spaces
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }

      if (!fullText.trim()) {
        alert("Could not extract text from this PDF. It might be an image-based PDF.");
      } else {
        setText(fullText);
      }
    } catch (err) {
      console.error("PDF Parsing Error:", err);
      alert("Failed to parse PDF. Please try a different file.");
      setFileName(null);
    } finally {
      setIsReading(false);
    }
  };

  const handleVoiceInput = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support voice input. Please use Chrome, Edge, or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript) {
        setText((prev) => {
          // Add a space if the previous text doesn't end with whitespace
          const separator = prev.length > 0 && !/\s$/.test(prev) ? ' ' : '';
          return prev + separator + finalTranscript;
        });
      }
    };
    
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start speech recognition:", e);
    }
  };

  const clearInput = () => {
    setText('');
    setFileName(null);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Study Material <span className="text-slate-400 dark:text-slate-500 font-normal">(Text, Markdown, or PDF)</span>
        </label>
        {fileName && (
          <span className="text-xs flex items-center gap-1 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-full">
            <FileText size={12} /> {fileName}
          </span>
        )}
      </div>

      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled || isReading}
          placeholder={isReading ? "Reading file..." : isListening ? "Listening... Speak now." : "Paste your lecture notes, textbook chapter, or summary here..."}
          className={`w-full min-h-[200px] p-4 rounded-xl border transition-all shadow-sm resize-y outline-none
            ${isListening 
              ? 'border-red-400 ring-2 ring-red-100 dark:ring-red-900/30 bg-red-50/10 dark:bg-red-900/10' 
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
            }
            ${isReading ? 'opacity-50 cursor-wait' : ''}
            text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500
          `}
        />
        
        {isReading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-slate-800/50 backdrop-blur-[1px] rounded-xl z-10">
            <div className="flex flex-col items-center gap-2 text-indigo-600 dark:text-indigo-400">
               <Loader2 className="animate-spin" size={24} />
               <span className="text-sm font-medium">Extracting text...</span>
            </div>
          </div>
        )}

        {/* Visualizer / Status for Listening */}
        {isListening && (
          <div className="absolute top-3 left-3 flex items-center gap-2 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 px-2 py-1 rounded-md text-xs font-medium animate-pulse">
            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
            Recording...
          </div>
        )}

        {text && !disabled && !isReading && (
          <button
            onClick={clearInput}
            className="absolute top-3 right-3 p-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-full text-slate-500 dark:text-slate-400 transition-colors"
            title="Clear text"
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex justify-between items-center flex-wrap gap-2">
        <div className="text-xs text-slate-400 dark:text-slate-500">
          {text.length} characters
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleVoiceInput}
            disabled={disabled || isReading}
            className={`
              flex items-center gap-2 text-sm font-medium transition-colors px-3 py-1.5 rounded-lg
              ${isListening 
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50' 
                : 'text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }
              ${disabled || isReading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            title="Dictate content using your microphone"
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            {isListening ? 'Stop Recording' : 'Voice Input'}
          </button>

          {!fileName && (
            <div className="relative">
               <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".txt,.md,.pdf"
                onChange={handleFileUpload}
                disabled={disabled || isReading}
              />
              <label
                htmlFor="file-upload"
                className={`cursor-pointer inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 ${disabled || isReading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Upload size={16} />
                Upload File
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputSection;