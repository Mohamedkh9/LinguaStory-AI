
import React from 'react';
import { Language, HistoryItem } from '../types';
import { translations } from '../translations';
import Button from './ui/Button';

interface HistoryViewProps {
  history: HistoryItem[];
  language: Language;
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ history, language, onSelect, onDelete }) => {
  const t = translations[language].history;

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in duration-500">
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
          <span className="text-4xl">📂</span>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t.empty}</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-md">{t.emptyDesc}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pt-8 pb-20 px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{t.title}</h1>
        <div className="h-1 w-20 bg-indigo-500 mx-auto rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((item) => (
          <div 
            key={item.id} 
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col"
          >
            <div className="p-6 flex-1">
              <div className="flex justify-between items-start mb-3">
                <span className="px-2 py-1 text-xs font-bold bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-md uppercase tracking-wider">
                  {item.params.level}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {new Date(item.timestamp).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US')}
                </span>
              </div>
              
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-2 min-h-[3.5rem]">
                {item.lesson.title}
              </h3>
              
              <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 mb-4">
                <div className="flex items-center gap-1">
                  <span>📝</span> <span>{item.params.topic}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>🎭</span> <span>{item.params.genre}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>⚡</span> <span>{item.params.grammar}</span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-100 dark:border-slate-700 flex gap-3">
              <Button 
                variant="primary" 
                className="flex-1 text-sm py-1.5"
                onClick={() => onSelect(item)}
              >
                {t.open}
              </Button>
              <button 
                onClick={() => {
                    if (window.confirm(t.confirmDelete)) {
                        onDelete(item.id);
                    }
                }}
                className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 rounded-lg transition-colors"
              >
                {t.delete}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
