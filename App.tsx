import React, { useState, useRef, useEffect } from 'react';
import { Brain, Sparkles, ChevronRight, ArrowLeft, Sun, Moon } from 'lucide-react';
import InputSection from './components/InputSection';
import StyleSelector from './components/StyleSelector';
import OutputSection from './components/OutputSection';
import { generateFormattedContent } from './services/geminiService';
import { LearningStyleType } from './types';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedStyle, setSelectedStyle] = useState<LearningStyleType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [outputContent, setOutputContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || 
             (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  
  // Ref for scrolling
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleConvert = async () => {
    if (!inputText.trim() || !selectedStyle) return;

    setIsProcessing(true);
    setError(null);
    setOutputContent(null);

    try {
      const result = await generateFormattedContent(inputText, selectedStyle);
      setOutputContent(result);
      // Scroll to output after a short delay for rendering
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err: any) {
      setError(err.message || 'An error occurred during conversion.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRegenerate = async () => {
    if (outputContent) {
      await handleConvert();
    }
  };

  const resetProcess = () => {
    setOutputContent(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Brain size={24} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 hidden sm:block">
              AI Learning Style Converter
            </h1>
            <h1 className="text-lg font-bold text-slate-800 dark:text-white sm:hidden">
              Style Converter
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
              title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
              Powered by Gemini 2.5
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-6 lg:p-8">
        <div className="max-w-5xl mx-auto space-y-8">
          
          <div className={`transition-all duration-500 ease-in-out ${outputContent ? 'opacity-40 pointer-events-none hidden md:block md:opacity-100 md:pointer-events-auto' : 'opacity-100'}`}>
             <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 space-y-8 transition-colors duration-300">
                {/* Step 1: Input */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold text-sm">1</span>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Provide Material</h2>
                  </div>
                  <div className="pl-11">
                    <InputSection text={inputText} setText={setInputText} disabled={isProcessing} />
                  </div>
                </div>

                {/* Step 2: Style */}
                <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 font-bold text-sm">2</span>
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">Choose Style</h2>
                  </div>
                  <div className="pl-11">
                    <StyleSelector selectedStyle={selectedStyle} onSelect={setSelectedStyle} disabled={isProcessing} />
                  </div>
                </div>

                {/* Action Button */}
                <div className="pl-11 pt-4">
                  <button
                    onClick={handleConvert}
                    disabled={!inputText.trim() || !selectedStyle || isProcessing}
                    className={`
                      w-full sm:w-auto px-8 py-3 rounded-xl font-semibold shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]
                      ${!inputText.trim() || !selectedStyle || isProcessing
                        ? 'bg-slate-100 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }
                    `}
                  >
                    {isProcessing ? (
                      <>
                        <Sparkles className="animate-spin" size={20} />
                        Converting Content...
                      </>
                    ) : (
                      <>
                        <Sparkles size={20} />
                        Convert Material
                      </>
                    )}
                  </button>
                  {error && (
                    <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-900/30 animate-fade-in">
                      {error}
                    </div>
                  )}
                </div>
             </div>
          </div>

          {/* Section: Output */}
          {outputContent && (
             <div ref={outputRef} className="animate-fade-in-up">
                {/* Mobile Back Button to "Edit" inputs if we hid them */}
                <div className="md:hidden mb-4">
                   <button onClick={resetProcess} className="flex items-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white">
                     <ArrowLeft size={16} className="mr-1"/> Edit Input
                   </button>
                </div>

                <OutputSection 
                  content={outputContent} 
                  style={selectedStyle!}
                  onRegenerate={handleRegenerate}
                  isRegenerating={isProcessing}
                />
             </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 mt-auto transition-colors duration-300">
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} AI Learning Style Converter</p>
          <div className="flex gap-4 mt-2 md:mt-0">
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">Help</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;