
import React, { useState } from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import { getChatHelperResponse } from '../services/geminiService';
import Button from './ui/Button';

interface ChatHelperProps {
  language: Language;
}

type HelperMode = 'translate' | 'correct';

const ChatHelper: React.FC<ChatHelperProps> = ({ language }) => {
  const t = translations[language].chatHelper;
  const [mode, setMode] = useState<HelperMode>('translate');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAction = async () => {
    if (!input.trim()) return;
    
    setIsLoading(true);
    setResult('');
    try {
        const response = await getChatHelperResponse(input, mode);
        setResult(response);
    } catch (error) {
        console.error(error);
        setResult("Error processing.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 h-full flex flex-col overflow-hidden transition-colors duration-200">
      {/* Header */}
      <div className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700 p-3">
         <h3 className="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2">
            <span>✨</span> {t.title}
         </h3>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => { setMode('translate'); setInput(''); setResult(''); }}
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            mode === 'translate' 
            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
            : 'bg-slate-50 dark:bg-slate-700/30 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          {t.translateTab}
        </button>
        <button
          onClick={() => { setMode('correct'); setInput(''); setResult(''); }}
          className={`flex-1 py-2 text-xs font-medium transition-colors ${
            mode === 'correct' 
            ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' 
            : 'bg-slate-50 dark:bg-slate-700/30 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
          }`}
        >
          {t.correctTab}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 flex flex-col gap-4 overflow-y-auto">
         
         <div className="space-y-2">
            <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={mode === 'translate' ? t.placeholderAr : t.placeholderEn}
                className="w-full h-24 p-3 text-sm border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none placeholder-slate-400 dark:placeholder-slate-500 transition-colors"
                dir={mode === 'translate' ? 'rtl' : 'ltr'}
            />
            <Button 
                onClick={handleAction} 
                isLoading={isLoading} 
                disabled={!input.trim()}
                variant="secondary"
                className="w-full text-sm py-1.5"
            >
                {mode === 'translate' ? t.actionTranslate : t.actionCorrect}
            </Button>
         </div>

         {result && (
             <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-3 border border-indigo-100 dark:border-indigo-800 space-y-2 animate-in fade-in slide-in-from-top-2">
                 <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300">{t.resultLabel}</span>
                    <button 
                        onClick={handleCopy}
                        className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 flex items-center gap-1"
                    >
                        {copied ? (
                            <>
                                <span className="text-green-600 dark:text-green-400">✓</span> {t.copied}
                            </>
                        ) : (
                            <>
                                <span>📋</span> {t.copy}
                            </>
                        )}
                    </button>
                 </div>
                 <p className="text-sm text-slate-800 dark:text-slate-200 font-medium whitespace-pre-wrap select-all" dir="ltr">
                     {result}
                 </p>
             </div>
         )}
      </div>
    </div>
  );
};

export default ChatHelper;
