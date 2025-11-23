
import React, { useState } from 'react';
import { EnglishLevel, Language, ConversationParams } from '../types';
import { translations } from '../translations';
import { LEVELS, DEFAULT_TOPICS_VALUES, TOPIC_LABELS } from '../constants';
import Button from './ui/Button';
import TutorChat from './TutorChat';
import ChatHelper from './ChatHelper';

interface ConversationViewProps {
  language: Language;
}

const ConversationView: React.FC<ConversationViewProps> = ({ language }) => {
  const t = translations[language];
  const [hasStarted, setHasStarted] = useState(false);
  const [topic, setTopic] = useState(DEFAULT_TOPICS_VALUES[0]);
  const [customTopic, setCustomTopic] = useState('');
  const [isCustomTopic, setIsCustomTopic] = useState(false);
  const [level, setLevel] = useState<EnglishLevel>(EnglishLevel.A2);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    setHasStarted(true);
  };

  const finalTopic = isCustomTopic ? customTopic : topic;

  if (hasStarted) {
    return (
      <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col">
         {/* Header Bar */}
         <div className="mb-4 flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
             <div className="flex items-center gap-2">
                <span className="text-2xl">💬</span>
                <div>
                     <h2 className="font-bold text-slate-900 dark:text-white leading-tight">{finalTopic}</h2>
                     <p className="text-xs text-slate-500 dark:text-slate-400">{t.level}: {level}</p>
                </div>
             </div>
             <button 
                onClick={() => setHasStarted(false)}
                className="text-sm px-3 py-1.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg transition-colors"
             >
                {t.lesson.back}
             </button>
         </div>

         {/* Main Content Grid */}
         <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4">
             {/* Chat Area */}
             <div className="flex-1 h-full min-h-0">
                <TutorChat 
                    language={language} 
                    mode="conversation" 
                    conversationParams={{ topic: finalTopic, level }}
                    className="h-full"
                    autoPlayResponse={true}
                />
             </div>
             
             {/* Helper Tool (Hidden on small mobile, stacked on tablet, side on desktop) */}
             <div className="lg:w-80 xl:w-96 h-64 lg:h-full flex-shrink-0">
                <ChatHelper language={language} />
             </div>
         </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.conversation.title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300">
          {t.conversation.desc}
        </p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 transition-colors duration-200">
        <form onSubmit={handleStart} className="space-y-6">
            
           {/* Level Selection */}
           <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.level}</label>
            <div className="flex flex-wrap gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLevel(l)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    level === l 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* Topic Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.conversation.topicLabel}</label>
            <div className="space-y-3">
                {!isCustomTopic ? (
                <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                >
                    {DEFAULT_TOPICS_VALUES.map((tVal) => (
                    <option key={tVal} value={tVal}>
                        {TOPIC_LABELS[tVal] ? TOPIC_LABELS[tVal][language] : tVal}
                    </option>
                    ))}
                </select>
                ) : (
                <input
                    type="text"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    placeholder={t.customTopicPlaceholder}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                    required={isCustomTopic}
                />
                )}
                <button
                type="button"
                onClick={() => setIsCustomTopic(!isCustomTopic)}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 underline"
                >
                {isCustomTopic ? t.chooseFromList : t.typeOwnTopic}
                </button>
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full py-3 text-lg">
                {t.conversation.startBtn}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConversationView;
