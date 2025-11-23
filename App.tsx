
import React, { useState, useEffect } from 'react';
import GeneratorForm from './components/GeneratorForm';
import LessonView from './components/LessonView';
import ConversationView from './components/ConversationView';
import CurriculumView from './components/CurriculumView';
import WelcomeView from './components/WelcomeView';
import HistoryView from './components/HistoryView';
import SplashScreen from './components/SplashScreen';
import Logo from './components/Logo';
import { LessonData, LessonParams, Language, ViewMode, UserProgress, CurriculumLesson, LessonLength, HistoryItem } from './types';
import { generateLesson } from './services/geminiService';
import { translations } from './translations';
import { CURRICULUM_DATA, GENRES } from './constants';

const DEFAULT_PROGRESS: UserProgress = {
  completedLessonIds: [],
  unlockedLevelIds: ['lvl1']
};

const App: React.FC = () => {
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('ar'); 
  const [currentView, setCurrentView] = useState<ViewMode>('welcome');
  const [showSplash, setShowSplash] = useState(true);
  
  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('linguastory_theme');
      if (savedTheme) return savedTheme as 'light' | 'dark';
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  // Persistence
  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
      const saved = localStorage.getItem('linguastory_progress');
      return saved ? JSON.parse(saved) : DEFAULT_PROGRESS;
  });

  // History State
  const [history, setHistory] = useState<HistoryItem[]>(() => {
      const saved = localStorage.getItem('linguastory_history');
      return saved ? JSON.parse(saved) : [];
  });

  const [activeCurriculumLessonId, setActiveCurriculumLessonId] = useState<string | null>(null);

  const t = translations[language];

  // Theme Effect
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('linguastory_theme', theme);
  }, [theme]);

  // Splash Screen Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Save progress
  useEffect(() => {
    localStorage.setItem('linguastory_progress', JSON.stringify(userProgress));
  }, [userProgress]);

  // Save History
  useEffect(() => {
    localStorage.setItem('linguastory_history', JSON.stringify(history));
  }, [history]);

  // Handle direction change based on language
  useEffect(() => {
    document.body.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleGenerate = async (params: LessonParams) => {
    setIsGenerating(true);
    setError(null);
    try {
      const data = await generateLesson(params);
      setLesson(data);
      setCurrentView('lesson');
      setActiveCurriculumLessonId(null); 

      // Save to History
      const newHistoryItem: HistoryItem = {
          id: Date.now().toString(),
          timestamp: Date.now(),
          lesson: data,
          params: params
      };
      // Keep only the last 50 items to manage storage size
      setHistory(prev => [newHistoryItem, ...prev].slice(0, 50));

    } catch (err) {
      setError(t.errors.generationFailed);
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStartCurriculumLesson = async (currLesson: CurriculumLesson) => {
    setIsGenerating(true);
    setError(null);
    const params: LessonParams = {
        level: currLesson.level,
        genre: GENRES[0], 
        topic: currLesson.topic,
        grammar: currLesson.grammar,
        length: LessonLength.Medium
    };

    try {
        const data = await generateLesson(params);
        setLesson(data);
        setActiveCurriculumLessonId(currLesson.id);
        setCurrentView('lesson');
        
        // Note: We deliberately don't save curriculum lessons to "History" 
        // to keep the history focused on custom generations, 
        // but we could if desired. Let's keep it clean for now.
    } catch (err) {
        setError(t.errors.generationFailed);
    } finally {
        setIsGenerating(false);
    }
  };

  const handleCompleteLesson = () => {
      if (!activeCurriculumLessonId) return;

      const newCompleted = [...userProgress.completedLessonIds];
      if (!newCompleted.includes(activeCurriculumLessonId)) {
          newCompleted.push(activeCurriculumLessonId);
      }

      const newUnlocked = [...userProgress.unlockedLevelIds];
      
      CURRICULUM_DATA.forEach((level, idx) => {
          const isLevelComplete = level.lessons.every(l => newCompleted.includes(l.id));
          if (isLevelComplete) {
              const nextLevel = CURRICULUM_DATA[idx + 1];
              if (nextLevel && !newUnlocked.includes(nextLevel.id)) {
                  newUnlocked.push(nextLevel.id);
                  alert(`🎉 Congratulations! You have unlocked ${nextLevel.title[language]}`);
              }
          }
      });

      setUserProgress({
          completedLessonIds: newCompleted,
          unlockedLevelIds: newUnlocked
      });

      setLesson(null);
      setCurrentView('curriculum');
  };

  const handleHistorySelect = (item: HistoryItem) => {
      setLesson(item.lesson);
      setActiveCurriculumLessonId(null);
      setCurrentView('lesson');
  };

  const handleHistoryDelete = (id: string) => {
      setHistory(prev => prev.filter(item => item.id !== id));
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'ar' : 'en');
  };

  // Render logic based on view state
  const renderContent = () => {
    if (currentView === 'welcome') {
        return <WelcomeView language={language} onStart={() => setCurrentView('curriculum')} />;
    }

    if (isGenerating) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">{t.generating}</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2"> Creating your personalized content...</p>
            </div>
        );
    }

    if (currentView === 'conversation') {
      return <ConversationView language={language} />;
    }

    if (currentView === 'curriculum') {
        return (
            <CurriculumView 
                language={language} 
                userProgress={userProgress} 
                onLessonSelect={handleStartCurriculumLesson}
            />
        );
    }

    if (currentView === 'history') {
        return (
            <HistoryView 
                history={history}
                language={language}
                onSelect={handleHistorySelect}
                onDelete={handleHistoryDelete}
            />
        );
    }

    if (currentView === 'lesson' && lesson) {
      return (
        <LessonView 
            lesson={lesson} 
            onBack={() => {
                setLesson(null);
                setCurrentView(activeCurriculumLessonId ? 'curriculum' : 'generator');
            }} 
            language={language}
            onComplete={activeCurriculumLessonId ? handleCompleteLesson : undefined}
            isCompleted={activeCurriculumLessonId ? userProgress.completedLessonIds.includes(activeCurriculumLessonId) : false}
        />
      );
    }

    // Default: Generator View
    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="text-center space-y-4 py-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {t.heroTitle} <span className="text-indigo-600 dark:text-indigo-400">{t.heroHighlight}</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            {t.heroDesc}
          </p>
        </div>
        
        <GeneratorForm onSubmit={handleGenerate} isGenerating={isGenerating} language={language} />

        {error && (
          <div className="max-w-3xl mx-auto p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-center">
            {error}
          </div>
        )}

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12">
            {[
                { icon: '📚', ...t.features.stories },
                { icon: '🤖', ...t.features.tutor },
                { icon: '📝', ...t.features.lessons }
            ].map((f, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-center hover:shadow-md transition-shadow">
                    <div className="text-4xl mb-3">{f.icon}</div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-1">{f.title}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{f.desc}</p>
                </div>
            ))}
        </div>
      </div>
    );
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 pb-12 transition-colors duration-200">
      {/* Navbar - Only show if not in welcome screen */}
      {currentView !== 'welcome' && (
      <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-50 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentView('welcome')}>
            <Logo className="w-8 h-8" />
            <span className="font-bold text-xl tracking-tight text-slate-800 dark:text-white hidden sm:block">{t.appTitle}</span>
          </div>

          <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar">
            {/* View Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg flex-shrink-0 transition-colors duration-200">
                <button 
                    onClick={() => setCurrentView('curriculum')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        currentView === 'curriculum' 
                        ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                    {t.nav.curriculumMode}
                </button>
                <button 
                    onClick={() => setCurrentView('generator')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        currentView === 'generator' || (currentView === 'lesson' && !activeCurriculumLessonId)
                        ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                    {t.nav.storyMode}
                </button>
                <button 
                    onClick={() => setCurrentView('conversation')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        currentView === 'conversation' 
                        ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                    {t.nav.conversationMode}
                </button>
                <button 
                    onClick={() => setCurrentView('history')}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                        currentView === 'history' 
                        ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm' 
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                >
                    {t.nav.historyMode}
                </button>
            </div>

             {/* Theme Toggle */}
             <button
              onClick={toggleTheme}
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title="Toggle Theme"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>

             <button
              onClick={toggleLanguage}
              className="px-3 py-1 rounded-full border border-slate-300 dark:border-slate-600 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors flex-shrink-0"
            >
              {language === 'en' ? '🇺🇸 EN' : '🇪🇬 AR'}
            </button>
          </div>
        </div>
      </nav>
      )}
      
      {/* Language & Theme toggle on welcome screen */}
      {currentView === 'welcome' && !showSplash && (
          <div className="absolute top-4 right-4 z-50 flex gap-3">
             <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
             <button
              onClick={toggleLanguage}
              className="px-4 py-2 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors"
            >
              {language === 'en' ? '🇺🇸 English' : '🇪🇬 العربية'}
            </button>
          </div>
      )}

      {/* Main Content */}
      <main className={`${currentView !== 'welcome' ? 'pt-8' : 'pt-0'} px-4 sm:px-6 lg:px-8`}>
        {renderContent()}
      </main>
    </div>
  );
};

export default App;
