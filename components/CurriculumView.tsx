
import React, { useState } from 'react';
import { Language, UserProgress, CurriculumLesson } from '../types';
import { CURRICULUM_DATA } from '../constants';
import { translations } from '../translations';

interface CurriculumViewProps {
  language: Language;
  userProgress: UserProgress;
  onLessonSelect: (lesson: CurriculumLesson) => void;
}

const CurriculumView: React.FC<CurriculumViewProps> = ({ language, userProgress, onLessonSelect }) => {
  const t = translations[language].curriculum;
  const [expandedLevel, setExpandedLevel] = useState<string | null>(CURRICULUM_DATA[0].id);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8 pb-20">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t.title}</h1>
        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          {t.desc}
        </p>
      </div>

      <div className="space-y-6">
        {CURRICULUM_DATA.map((level, index) => {
          const isUnlocked = userProgress.unlockedLevelIds.includes(level.id);
          const completedCount = level.lessons.filter(l => userProgress.completedLessonIds.includes(l.id)).length;
          const totalCount = level.lessons.length;
          const progressPercent = Math.round((completedCount / totalCount) * 100);
          const isExpanded = expandedLevel === level.id;
          
          // Determine styling based on lock state
          const containerClass = isUnlocked 
            ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm" 
            : "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-75 grayscale-[0.5]";
          
          return (
            <div key={level.id} className={`border rounded-2xl overflow-hidden transition-all duration-300 ${containerClass}`}>
              
              {/* Level Header */}
              <div 
                className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer ${!isUnlocked && 'cursor-not-allowed'}`}
                onClick={() => isUnlocked && setExpandedLevel(isExpanded ? null : level.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 ${
                    isUnlocked ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {level.title[language]}
                        {!isUnlocked && <span className="text-xs bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">🔒 {t.locked}</span>}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-300 text-sm mt-1">{level.description[language]}</p>
                    
                    {/* Progress Bar */}
                    <div className="mt-3 flex items-center gap-3">
                        <div className="w-32 h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-emerald-500 transition-all duration-500" 
                                style={{ width: `${progressPercent}%` }}
                            ></div>
                        </div>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">{progressPercent}% {t.completed}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                   <div className="text-right">
                       <div className="text-2xl font-bold text-slate-900 dark:text-white">{totalCount}</div>
                       <div className="text-xs text-slate-500 dark:text-slate-400 uppercase">{t.lessonsCount}</div>
                   </div>
                   {isUnlocked && (
                       <div className={`transform transition-transform duration-200 text-slate-500 dark:text-slate-400 ${isExpanded ? 'rotate-180' : ''}`}>
                           ▼
                       </div>
                   )}
                </div>
              </div>

              {/* Lesson List (Collapsible) */}
              {isExpanded && isUnlocked && (
                <div className="border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900/30 p-4 md:p-6 animate-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {level.lessons.map((lesson) => {
                            const isCompleted = userProgress.completedLessonIds.includes(lesson.id);
                            
                            return (
                                <div 
                                    key={lesson.id}
                                    className={`p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer flex flex-col justify-between h-32 ${
                                        isCompleted 
                                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800 hover:border-emerald-200 dark:hover:border-emerald-700' 
                                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                                    }`}
                                    onClick={() => onLessonSelect(lesson)}
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">{lesson.topic}</span>
                                            {isCompleted && <span className="text-emerald-600 dark:text-emerald-400">✓</span>}
                                        </div>
                                        <h3 className={`font-bold leading-tight ${isCompleted ? 'text-emerald-900 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-100'}`}>
                                            {lesson.title}
                                        </h3>
                                    </div>
                                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center">
                                        <span>{lesson.grammar}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isCompleted ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-200' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                                            {isCompleted ? t.completed : t.start}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
              )}
              
              {!isUnlocked && isExpanded && (
                  <div className="p-4 text-center text-slate-500 dark:text-slate-400 italic bg-slate-100 dark:bg-slate-900/50">
                      {t.lockedMsg}
                  </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CurriculumView;
