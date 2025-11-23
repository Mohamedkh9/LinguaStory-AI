
import React from 'react';
import { Language } from '../types';
import { translations } from '../translations';
import Button from './ui/Button';
import Logo from './Logo';

interface WelcomeViewProps {
  language: Language;
  onStart: () => void;
}

const WelcomeView: React.FC<WelcomeViewProps> = ({ language, onStart }) => {
  const t = translations[language].welcome;

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6 animate-in fade-in duration-700">
      
      {/* Icon / Logo */}
      <div className="mb-8 bg-indigo-100 dark:bg-indigo-900/30 p-6 rounded-3xl rotate-3 hover:rotate-0 transition-transform duration-500">
        <Logo className="w-20 h-20" />
      </div>

      {/* Title */}
      <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
        {t.title}
      </h1>

      {/* Subtitle */}
      <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mb-12 leading-relaxed">
        {t.subtitle}
      </p>

      {/* Action Button */}
      <Button 
        onClick={onStart} 
        className="text-lg px-10 py-4 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
      >
        {t.getStarted} <span className="rtl:rotate-180">→</span>
      </Button>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-4xl">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-200">
            <div className="text-3xl mb-3">📚</div>
            <h3 className="font-bold text-slate-800 dark:text-white">{t.features.learn}</h3>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-200">
            <div className="text-3xl mb-3">🗣️</div>
            <h3 className="font-bold text-slate-800 dark:text-white">{t.features.practice}</h3>
        </div>
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-colors duration-200">
            <div className="text-3xl mb-3">✨</div>
            <h3 className="font-bold text-slate-800 dark:text-white">{t.features.master}</h3>
        </div>
      </div>

    </div>
  );
};

export default WelcomeView;
