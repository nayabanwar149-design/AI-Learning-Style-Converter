import React, { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import MermaidDiagram from './MermaidDiagram';
import { Copy, RefreshCw, Download, Check, X, FileText, FileCode, FileType } from 'lucide-react';
import { LearningStyleType } from '../types';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface OutputSectionProps {
  content: string;
  style: LearningStyleType;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

type FileFormat = 'md' | 'txt' | 'pdf';

const OutputSection: React.FC<OutputSectionProps> = ({ content, style, onRegenerate, isRegenerating }) => {
  const [copied, setCopied] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [filename, setFilename] = useState('study_material');
  const [fileFormat, setFileFormat] = useState<FileFormat>('md');
  const [isSaving, setIsSaving] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveClick = () => {
    // Set default filename based on style
    const defaultName = `study_${style.replace(/\s+/g, '_').toLowerCase()}`;
    setFilename(defaultName);
    setShowSaveModal(true);
  };

  const performDownload = async () => {
    if (!filename) return;
    setIsSaving(true);
    
    const finalFilename = `${filename}.${fileFormat}`;

    try {
      if (fileFormat === 'pdf') {
        await downloadAsPdf(finalFilename);
      } else {
        downloadAsText(finalFilename, fileFormat);
      }
      setShowSaveModal(false);
    } catch (error) {
      console.error("Save failed:", error);
      alert("An error occurred while saving the file.");
    } finally {
      setIsSaving(false);
    }
  };

  const downloadAsText = (name: string, format: 'md' | 'txt') => {
    let textContent = content;
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAsPdf = async (name: string) => {
    if (!contentRef.current) return;

    // Clone and strip dark mode classes for PDF generation to ensure it's white paper
    const original = contentRef.current;
    const clone = original.cloneNode(true) as HTMLElement;
    
    clone.style.position = 'fixed';
    clone.style.top = '0';
    clone.style.left = '-9999px'; 
    clone.style.width = `${original.clientWidth}px`; 
    clone.style.height = 'auto';
    clone.style.maxHeight = 'none';
    clone.style.overflow = 'visible';
    clone.style.background = 'white';
    clone.style.padding = '40px'; 
    clone.style.color = 'black'; // Force black text
    
    // Remove dark mode classes from prose if any
    clone.classList.remove('prose-invert');
    
    document.body.appendChild(clone);

    try {
      const canvas = await html2canvas(clone, {
        scale: 2, 
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210; 
      const pageHeight = 297; 
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(name);
    } catch (err) {
      console.error("PDF generation error:", err);
      throw new Error("Failed to generate PDF");
    } finally {
      document.body.removeChild(clone);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden flex flex-col h-full min-h-[500px] relative transition-colors duration-300">
      {/* Header Actions */}
      <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/50">
        <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
          <span className="w-2 h-6 bg-indigo-500 rounded-full"></span>
          Converted Output
        </h3>
        <div className="flex gap-2">
          <button
            onClick={onRegenerate}
            disabled={isRegenerating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={isRegenerating ? 'animate-spin' : ''} />
            {isRegenerating ? 'Regenerating...' : 'Regenerate'}
          </button>
          
          <button
            onClick={handleSaveClick}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <Download size={14} />
            Save
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-900/50 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Content */}
      <div 
        ref={contentRef}
        className="p-6 md:p-8 overflow-y-auto flex-grow prose prose-slate dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:text-slate-800 dark:prose-headings:text-slate-100 prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-a:text-indigo-600 dark:prose-a:text-indigo-400"
      >
        <ReactMarkdown
          components={{
            // Custom renderer for code blocks to detect mermaid
            code({ node, inline, className, children, ...props }: any) {
              const match = /language-(\w+)/.exec(className || '');
              const isMermaid = match && match[1] === 'mermaid';

              if (!inline && isMermaid) {
                return <MermaidDiagram chart={String(children).replace(/\n$/, '')} />;
              }
              
              return !inline && match ? (
                <div className="bg-slate-900 dark:bg-slate-950 rounded-lg p-4 my-4 overflow-x-auto text-slate-50 text-sm font-mono border border-slate-800 dark:border-slate-800">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </div>
              ) : (
                <code className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-1 py-0.5 rounded text-sm font-mono" {...props}>
                  {children}
                </code>
              );
            },
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-indigo-300 dark:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-900/20 pl-4 py-2 italic text-slate-700 dark:text-slate-300 rounded-r-lg my-4">
                {children}
              </blockquote>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-5 space-y-1 my-4 text-slate-700 dark:text-slate-300 marker:text-indigo-400">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-5 space-y-1 my-4 text-slate-700 dark:text-slate-300 marker:text-indigo-500 font-medium">
                {children}
              </ol>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-6 rounded-lg border border-slate-200 dark:border-slate-700">
                <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => <thead className="bg-slate-50 dark:bg-slate-800/50">{children}</thead>,
            th: ({ children }) => <th className="px-6 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{children}</th>,
            td: ({ children }) => <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800">{children}</td>,
          }}
        >
          {content}
        </ReactMarkdown>
      </div>

      {/* Save As Modal */}
      {showSaveModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/20 dark:bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in-up">
            <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
              <h4 className="font-semibold text-slate-800 dark:text-white">Save File</h4>
              <button 
                onClick={() => setShowSaveModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Filename</label>
                <input 
                  type="text" 
                  value={filename}
                  onChange={(e) => setFilename(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="Enter filename..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Format</label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setFileFormat('md')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      fileFormat === 'md' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-200 dark:ring-indigo-500/50' 
                        : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-slate-600/50'
                    }`}
                  >
                    <FileCode size={20} className="mb-1" />
                    <span className="text-xs font-medium">Markdown</span>
                    <span className="text-[10px] opacity-60">.md</span>
                  </button>
                  
                  <button
                    onClick={() => setFileFormat('txt')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      fileFormat === 'txt' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-200 dark:ring-indigo-500/50' 
                        : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-slate-600/50'
                    }`}
                  >
                    <FileText size={20} className="mb-1" />
                    <span className="text-xs font-medium">Text</span>
                    <span className="text-[10px] opacity-60">.txt</span>
                  </button>
                  
                  <button
                    onClick={() => setFileFormat('pdf')}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      fileFormat === 'pdf' 
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-500/50 text-indigo-700 dark:text-indigo-400 ring-1 ring-indigo-200 dark:ring-indigo-500/50' 
                        : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-indigo-200 dark:hover:border-indigo-500/30 hover:bg-slate-50 dark:hover:bg-slate-600/50'
                    }`}
                  >
                    <FileType size={20} className="mb-1" />
                    <span className="text-xs font-medium">PDF</span>
                    <span className="text-[10px] opacity-60">.pdf</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={performDownload}
                disabled={isSaving || !filename}
                className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-900 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Download size={14} />
                    Download
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutputSection;