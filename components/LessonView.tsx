
import React, { useState, useRef, useEffect } from 'react';
import { LessonData, Language } from '../types';
import TutorChat from './TutorChat';
import { translations } from '../translations';
import { generateSpeech, translateText } from '../services/geminiService';
import Button from './ui/Button';

interface LessonViewProps {
  lesson: LessonData;
  onBack: () => void;
  language: Language;
  onComplete?: () => void;
  isCompleted?: boolean;
}

type Tab = 'story' | 'vocabulary' | 'questions' | 'writing';
type VocabViewMode = 'list' | 'cards' | 'quiz';

interface SelectionState {
    x: number;
    y: number;
    text: string;
    translation?: string;
    isLoadingTranslation?: boolean;
}

interface AudioState {
    isPlaying: boolean;
    playingSource: string | null;
    loadingSource: string | null;
}

// Audio Helpers
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const LessonView: React.FC<LessonViewProps> = ({ lesson, onBack, language, onComplete, isCompleted }) => {
  const [activeTab, setActiveTab] = useState<Tab>('story');
  const [showTranslation, setShowTranslation] = useState(false);
  
  // Vocab State
  const [vocabViewMode, setVocabViewMode] = useState<VocabViewMode>('list');
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isCardFlipped, setIsCardFlipped] = useState(false);

  // Quiz State
  const [quizCurrentIndex, setQuizCurrentIndex] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);
  const [quizIsFinished, setQuizIsFinished] = useState(false);
  const [currentQuizOptions, setCurrentQuizOptions] = useState<string[]>([]);

  // Selection State
  const [selectionMenu, setSelectionMenu] = useState<SelectionState | null>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  
  // Audio State
  const [audioState, setAudioState] = useState<AudioState>({
      isPlaying: false,
      playingSource: null,
      loadingSource: null
  });
  
  const storyAudioContextRef = useRef<AudioContext | null>(null);
  const storySourceRef = useRef<AudioBufferSourceNode | null>(null);

  const t = translations[language].lesson;

  // Cleanup audio when unmounting
  useEffect(() => {
    return () => {
      stopAudio();
      if (storyAudioContextRef.current) {
        storyAudioContextRef.current.close();
        storyAudioContextRef.current = null;
      }
    };
  }, []);

  // Handle Text Selection
  useEffect(() => {
    const handleSelection = () => {
        if (activeTab !== 'story' || showTranslation) return;

        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) {
            return; 
        }

        const text = selection.toString().trim();
        if (text.length < 2) return; 

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        if (storyRef.current && !storyRef.current.contains(selection.anchorNode)) {
            return;
        }

        setSelectionMenu({
            x: rect.left + (rect.width / 2),
            y: rect.top, 
            text: text
        });
    };

    const handleDocumentMouseDown = (e: MouseEvent) => {
        const menuEl = document.getElementById('selection-menu');
        if (menuEl && menuEl.contains(e.target as Node)) {
            return;
        }
        setSelectionMenu(null);
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('mousedown', handleDocumentMouseDown);

    return () => {
        document.removeEventListener('mouseup', handleSelection);
        document.removeEventListener('mousedown', handleDocumentMouseDown);
    };
  }, [activeTab, showTranslation]);

  const stopAudio = () => {
    if (storySourceRef.current) {
      try {
        storySourceRef.current.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
      storySourceRef.current = null;
    }
    setAudioState({
        isPlaying: false,
        playingSource: null,
        loadingSource: null
    });
  };

  const playAudio = async (textToPlay: string, sourceKey: string) => {
    if (audioState.isPlaying && audioState.playingSource === sourceKey) {
      stopAudio();
      return;
    }

    if (audioState.isPlaying) {
        stopAudio();
    }

    try {
      setAudioState(prev => ({ ...prev, loadingSource: sourceKey }));
      
      const base64Audio = await generateSpeech(textToPlay);
      if (!base64Audio) throw new Error("Failed to generate audio");

      if (!storyAudioContextRef.current) {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         storyAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      }
      
      if (storyAudioContextRef.current.state === 'suspended') {
        await storyAudioContextRef.current.resume();
      }

      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        storyAudioContextRef.current,
        24000,
        1
      );

      const source = storyAudioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(storyAudioContextRef.current.destination);
      
      source.onended = () => {
        setAudioState({ isPlaying: false, playingSource: null, loadingSource: null });
      };

      source.start();
      storySourceRef.current = source;
      setAudioState({
          isPlaying: true,
          playingSource: sourceKey,
          loadingSource: null
      });

    } catch (error) {
      console.error("Audio TTS Error:", error);
      alert("Could not play audio.");
      setAudioState({ isPlaying: false, playingSource: null, loadingSource: null });
    }
  };

  const toggleTranslation = () => {
      const newState = !showTranslation;
      setShowTranslation(newState);
      if (newState) {
          stopAudio();
          setSelectionMenu(null);
      }
  };

  const handleTranslateSelection = async () => {
    if (!selectionMenu) return;
    setSelectionMenu(prev => prev ? { ...prev, isLoadingTranslation: true } : null);
    const result = await translateText(selectionMenu.text);
    setSelectionMenu(prev => prev ? { ...prev, translation: result, isLoadingTranslation: false } : null);
  };

  // Flashcard Navigation
  const nextCard = () => {
      stopAudio();
      setIsCardFlipped(false);
      if (currentCardIndex < lesson.vocabulary.length - 1) {
          setCurrentCardIndex(prev => prev + 1);
      } else {
          setCurrentCardIndex(0); // Loop back
      }
  };
  
  const prevCard = () => {
      stopAudio();
      setIsCardFlipped(false);
      if (currentCardIndex > 0) {
          setCurrentCardIndex(prev => prev - 1);
      } else {
          setCurrentCardIndex(lesson.vocabulary.length - 1);
      }
  };

  // --- QUIZ LOGIC ---
  const generateQuizOptions = (index: number) => {
    if (!lesson || !lesson.vocabulary || index >= lesson.vocabulary.length) return;
    
    const currentVocab = lesson.vocabulary[index];
    const correct = currentVocab.arabicMeaning;
    
    // Get distractors
    const others = lesson.vocabulary.filter((_, i) => i !== index);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random());
    const distractors = shuffledOthers.slice(0, 3).map(v => v.arabicMeaning);
    
    const options = [...distractors, correct].sort(() => 0.5 - Math.random());
    setCurrentQuizOptions(options);
  };

  const startQuiz = () => {
      setVocabViewMode('quiz');
      setQuizCurrentIndex(0);
      setQuizScore(0);
      setQuizIsFinished(false);
      setQuizSelectedOption(null);
      generateQuizOptions(0);
      stopAudio();
  };

  const handleQuizOptionClick = (option: string) => {
    if (quizSelectedOption) return; // Prevent multiple clicks
    
    setQuizSelectedOption(option);
    const correct = lesson.vocabulary[quizCurrentIndex].arabicMeaning;
    
    if (option === correct) {
        setQuizScore(prev => prev + 1);
        // Play word pronunciation as positive reinforcement
        playAudio(lesson.vocabulary[quizCurrentIndex].word, 'quiz-feedback');
    }
  };

  const handleNextQuizQuestion = () => {
      if (quizCurrentIndex < lesson.vocabulary.length - 1) {
          const nextIndex = quizCurrentIndex + 1;
          setQuizCurrentIndex(nextIndex);
          setQuizSelectedOption(null);
          generateQuizOptions(nextIndex);
      } else {
          setQuizIsFinished(true);
      }
  };


  return (
    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
      
      {/* Floating Selection Menu */}
      {selectionMenu && (
        <div 
            id="selection-menu"
            className="fixed z-50 transform -translate-x-1/2 -translate-y-full mb-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg shadow-xl p-2 flex flex-col gap-2 min-w-[200px]"
            style={{ top: selectionMenu.y - 10, left: selectionMenu.x }}
        >
            <div className="flex gap-2 justify-center">
                <button 
                    onClick={() => playAudio(selectionMenu.text, 'selection')}
                    className="flex-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                >
                    {audioState.loadingSource === 'selection' ? (
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : audioState.playingSource === 'selection' ? (
                        <span>⏹</span>
                    ) : (
                        <span>🔊</span>
                    )}
                    {t.selection.listen}
                </button>
                <button 
                    onClick={handleTranslateSelection}
                    className="flex-1 px-3 py-1.5 bg-slate-600 hover:bg-slate-500 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                >
                   <span>🈂️</span> {t.selection.translate}
                </button>
            </div>
            
            {selectionMenu.isLoadingTranslation && (
                 <div className="text-xs text-slate-300 text-center py-1">{t.selection.translating}</div>
            )}
            
            {selectionMenu.translation && (
                <div className="text-sm bg-slate-700 dark:bg-slate-600 p-2 rounded text-center border-t border-slate-600" dir="rtl">
                    {selectionMenu.translation}
                </div>
            )}
            
            <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 dark:bg-slate-700 transform rotate-45"></div>
        </div>
      )}

      {/* Main Content Area (2/3 width) */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <div>
             <button 
                onClick={onBack}
                className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 mb-2 flex items-center gap-1 rtl:flex-row-reverse"
             >
                <span className="rtl:rotate-180 inline-block">←</span> {t.back}
             </button>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">{lesson.title}</h1>
          </div>
          <div className="hidden sm:block">
             <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 text-xs font-bold rounded-full uppercase tracking-wide">
                 {t.mode}
             </span>
             {isCompleted && (
                 <span className="ml-2 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-full uppercase tracking-wide">
                     ✓ {t.completed}
                 </span>
             )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: 'story', label: t.tabs.story },
            { id: 'vocabulary', label: t.tabs.vocabulary },
            { id: 'questions', label: t.tabs.questions },
            { id: 'writing', label: t.tabs.writing },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                  setActiveTab(tab.id as Tab);
                  stopAudio();
                  setSelectionMenu(null);
                  setVocabViewMode('list'); // Reset to list view when returning
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-md'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 min-h-[500px]">
          
          {activeTab === 'story' && (
            <div className="space-y-4">
                {/* Story Controls */}
                <div className="flex flex-wrap gap-3 items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4 mb-4">
                     <button
                        onClick={() => playAudio(lesson.story, 'story')}
                        disabled={audioState.loadingSource === 'story'}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
                            audioState.playingSource === 'story'
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-200 dark:border-red-800' 
                            : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800'
                        }`}
                     >
                        {audioState.loadingSource === 'story' ? (
                             <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                        ) : audioState.playingSource === 'story' ? (
                             <span>⏹</span>
                        ) : (
                             <span>🔊</span>
                        )}
                        {audioState.playingSource === 'story' ? t.storyControls.stop : t.storyControls.listen}
                     </button>

                     <button
                        onClick={toggleTranslation}
                        className="flex items-center gap-2 px-4 py-2 rounded-full font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-600 transition-all"
                     >
                        <span>{showTranslation ? '📖' : '🈂️'}</span>
                        {showTranslation ? t.storyControls.original : t.storyControls.translate}
                     </button>
                </div>

                <div className={`prose prose-slate dark:prose-invert lg:prose-lg max-w-none transition-opacity duration-300 ${showTranslation ? 'text-right' : ''}`}>
                    {showTranslation ? (
                        <p className="whitespace-pre-line leading-relaxed text-slate-800 dark:text-slate-200 font-['Cairo'] text-lg" dir="rtl">
                            {lesson.storyTranslation || "Translation not available."}
                        </p>
                    ) : (
                        <div ref={storyRef} className="selection:bg-indigo-200 dark:selection:bg-indigo-700 selection:text-indigo-900 dark:selection:text-white">
                             <p className="whitespace-pre-line leading-relaxed text-slate-700 dark:text-slate-300" dir="ltr">
                                {lesson.story}
                            </p>
                        </div>
                    )}
                </div>
            </div>
          )}

          {activeTab === 'vocabulary' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                 <h3 className="text-xl font-bold text-slate-800 dark:text-white">{t.tabs.vocabulary}</h3>
                 <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-lg">
                    <button
                        onClick={() => {
                            setVocabViewMode('list');
                            stopAudio();
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            vocabViewMode === 'list' 
                            ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    >
                        {t.vocabTable.viewList}
                    </button>
                    <button
                        onClick={() => {
                            setVocabViewMode('cards');
                            stopAudio();
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            vocabViewMode === 'cards' 
                            ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    >
                        {t.vocabTable.viewCards}
                    </button>
                    <button
                        onClick={() => startQuiz()}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            vocabViewMode === 'quiz' 
                            ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm' 
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}
                    >
                        {t.vocabTable.viewQuiz}
                    </button>
                 </div>
              </div>

              {vocabViewMode === 'list' && (
                  <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 animate-in fade-in duration-300">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                      <thead className="bg-slate-50 dark:bg-slate-700/50">
                        <tr>
                          <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider w-16">{t.vocabTable.pronounce}</th>
                          <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.vocabTable.word}</th>
                          <th className="px-6 py-3 text-start text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.vocabTable.meaning}</th>
                          <th className="px-6 py-3 text-end text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.vocabTable.arabic}</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                        {lesson.vocabulary.map((vocab, idx) => {
                          const vocabId = `vocab-${idx}`;
                          return (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td className="px-6 py-4">
                                <button
                                    onClick={() => playAudio(vocab.word, vocabId)}
                                    disabled={audioState.loadingSource === vocabId}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                                        audioState.playingSource === vocabId
                                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-300'
                                        : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-indigo-600 dark:hover:text-indigo-300'
                                    }`}
                                >
                                     {audioState.loadingSource === vocabId ? (
                                        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        <span>🔊</span>
                                    )}
                                </button>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-indigo-600 dark:text-indigo-400 text-start" dir="ltr">{vocab.word}</td>
                            <td className="px-6 py-4 text-sm text-slate-700 dark:text-slate-300 text-start" dir="ltr">{vocab.englishMeaning}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-end text-slate-600 dark:text-slate-300" dir="rtl">{vocab.arabicMeaning}</td>
                          </tr>
                        )})}
                      </tbody>
                    </table>
                  </div>
              )}

              {vocabViewMode === 'cards' && (
                  // Flashcard UI
                  <div className="max-w-md mx-auto animate-in zoom-in-95 duration-300 py-8 perspective-[1000px]">
                      <div className="relative h-80 w-full cursor-pointer" onClick={() => setIsCardFlipped(!isCardFlipped)}>
                          <div 
                              className={`w-full h-full rounded-2xl shadow-xl transition-all duration-500 [transform-style:preserve-3d] relative ${isCardFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                          >
                               {/* Front */}
                               <div className="absolute inset-0 w-full h-full bg-indigo-600 dark:bg-indigo-700 text-white rounded-2xl flex flex-col items-center justify-center p-8 [backface-visibility:hidden] shadow-lg border border-indigo-500 dark:border-indigo-600">
                                   <div className="text-sm font-medium opacity-75 uppercase tracking-wider mb-2">{t.flashcards.front}</div>
                                   <div className="text-4xl font-bold mb-6 text-center">{lesson.vocabulary[currentCardIndex].word}</div>
                                   <button
                                        onClick={(e) => {
                                            e.stopPropagation(); 
                                            playAudio(lesson.vocabulary[currentCardIndex].word, 'flashcard-front');
                                        }}
                                        className="p-3 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                                   >
                                        {audioState.loadingSource === 'flashcard-front' ? (
                                            <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin block"></span>
                                        ) : (
                                            <span className="text-2xl">🔊</span>
                                        )}
                                   </button>
                                   <div className="absolute bottom-6 text-xs opacity-50">{t.flashcards.flip}</div>
                               </div>

                               {/* Back */}
                               <div className="absolute inset-0 w-full h-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white rounded-2xl flex flex-col items-center justify-center p-8 [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-lg">
                                   <div className="text-sm font-medium text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-2">{t.flashcards.back}</div>
                                   <div className="text-xl text-center mb-4 font-medium" dir="ltr">{lesson.vocabulary[currentCardIndex].englishMeaning}</div>
                                   <div className="w-12 h-1 bg-indigo-100 dark:bg-indigo-900 rounded-full mb-4"></div>
                                   <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 text-center font-['Cairo']" dir="rtl">
                                       {lesson.vocabulary[currentCardIndex].arabicMeaning}
                                   </div>
                               </div>
                          </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between mt-8 px-4">
                          <button 
                             onClick={prevCard}
                             className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                          >
                              ← {t.flashcards.prev}
                          </button>
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                              {t.flashcards.progress} {currentCardIndex + 1} / {lesson.vocabulary.length}
                          </span>
                          <button 
                             onClick={nextCard}
                             className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                          >
                              {t.flashcards.next} →
                          </button>
                      </div>
                  </div>
              )}

              {vocabViewMode === 'quiz' && (
                  <div className="max-w-xl mx-auto py-4 animate-in fade-in duration-300">
                      {quizIsFinished ? (
                          // Quiz Results
                          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-8 text-center border border-slate-200 dark:border-slate-600 animate-in fade-in slide-in-from-bottom-4 duration-500">
                               <div className="text-6xl mb-4">🏆</div>
                               <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{t.quiz.completed}</h2>
                               <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                                   {t.quiz.score} <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xl">{quizScore}</span> {t.quiz.outOf} {lesson.vocabulary.length}
                               </p>
                               <div className="flex justify-center gap-4">
                                   <Button onClick={startQuiz} variant="primary">
                                       {t.quiz.tryAgain}
                                   </Button>
                                   <Button onClick={() => setVocabViewMode('list')} variant="outline">
                                       {t.vocabTable.viewList}
                                   </Button>
                               </div>
                          </div>
                      ) : (
                          // Quiz Question
                          <div className="space-y-6">
                              {/* Progress */}
                              <div className="flex justify-between items-center text-sm font-medium text-slate-500 dark:text-slate-400">
                                  <span>{t.quiz.question} {quizCurrentIndex + 1} / {lesson.vocabulary.length}</span>
                                  <span>{t.quiz.score}: {quizScore}</span>
                              </div>
                              <div className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                  <div 
                                      className="h-full bg-indigo-500 transition-all duration-300"
                                      style={{ width: `${((quizCurrentIndex) / lesson.vocabulary.length) * 100}%` }}
                                  ></div>
                              </div>
                              
                              {/* Animated Question Container */}
                              <div key={quizCurrentIndex} className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                                  {/* Question Card */}
                                  <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
                                      <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                                          {lesson.vocabulary[quizCurrentIndex].word}
                                      </h3>
                                      <button
                                            onClick={() => playAudio(lesson.vocabulary[quizCurrentIndex].word, 'quiz-question')}
                                            className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-full text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                                      >
                                            <span>🔊</span> {t.vocabTable.pronounce}
                                      </button>
                                  </div>
                                  
                                  {/* Options */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3" dir="rtl">
                                      {currentQuizOptions.map((option, idx) => {
                                          const isSelected = quizSelectedOption === option;
                                          const isCorrect = option === lesson.vocabulary[quizCurrentIndex].arabicMeaning;
                                          const showCorrect = quizSelectedOption !== null && isCorrect;
                                          const showIncorrect = isSelected && !isCorrect;
                                          
                                          let btnClass = "bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20";
                                          
                                          if (showCorrect) {
                                              btnClass = "bg-emerald-100 dark:bg-emerald-900/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 ring-1 ring-emerald-500";
                                          } else if (showIncorrect) {
                                              btnClass = "bg-red-100 dark:bg-red-900/40 border-red-500 text-red-800 dark:text-red-200";
                                          } else if (quizSelectedOption !== null) {
                                              btnClass = "opacity-50 cursor-not-allowed bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700";
                                          }
                                          
                                          return (
                                              <button
                                                  key={idx}
                                                  onClick={() => handleQuizOptionClick(option)}
                                                  disabled={quizSelectedOption !== null}
                                                  className={`relative p-4 rounded-xl border-2 text-lg font-medium transition-all duration-200 ${btnClass} font-['Cairo']`}
                                              >
                                                  <div className="flex items-center justify-between w-full">
                                                    <span>{option}</span>
                                                    {showCorrect && <span className="text-xl">✅</span>}
                                                    {showIncorrect && <span className="text-xl">❌</span>}
                                                  </div>
                                              </button>
                                          );
                                      })}
                                  </div>
                              </div>
                              
                              {/* Next Button & Feedback */}
                              {quizSelectedOption && (
                                  <div className="pt-4 animate-in slide-in-from-bottom-2 space-y-4">
                                      {/* Feedback Message */}
                                      <div className={`text-center font-bold text-lg ${
                                          quizSelectedOption === lesson.vocabulary[quizCurrentIndex].arabicMeaning
                                          ? "text-emerald-600 dark:text-emerald-400"
                                          : "text-red-600 dark:text-red-400"
                                      }`}>
                                          {quizSelectedOption === lesson.vocabulary[quizCurrentIndex].arabicMeaning
                                              ? (language === 'ar' ? "🎉 إجابة صحيحة!" : "🎉 Correct!")
                                              : (language === 'ar' ? "❌ إجابة خاطئة" : "❌ Incorrect")}
                                      </div>

                                      <div className="flex justify-center">
                                          <Button onClick={handleNextQuizQuestion} className="w-full md:w-auto px-12 py-3 text-lg">
                                              {quizCurrentIndex < lesson.vocabulary.length - 1 ? t.flashcards.next : t.quiz.completed} <span className="rtl:rotate-180">→</span>
                                          </Button>
                                      </div>
                                  </div>
                              )}
                          </div>
                      )}
                  </div>
              )}

            </div>
          )}

          {activeTab === 'questions' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">{t.comprehension.title}</h3>
                <ul className="space-y-4" dir="ltr">
                  {lesson.comprehensionQuestions.map((q, i) => (
                    <li key={i} className="bg-slate-50 dark:bg-slate-700/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700 flex gap-3">
                      <span className="font-bold text-indigo-500 dark:text-indigo-400 flex-shrink-0">{i + 1}.</span>
                      <span className="text-slate-800 dark:text-slate-200 font-medium">{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border-t border-slate-100 dark:border-slate-700 pt-6">
                <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">{t.discussion.title}</h3>
                 <ul className="space-y-4" dir="ltr">
                  {lesson.discussionQuestions.map((q, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-indigo-500 dark:text-indigo-400 mt-1 flex-shrink-0">💬</span>
                      <span className="text-slate-700 dark:text-slate-300">{q}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400 italic bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded border border-yellow-100 dark:border-yellow-900/30">
                  {t.discussion.tip}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'writing' && (
            <div>
              <h3 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">{t.writing.title}</h3>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-xl border border-indigo-100 dark:border-indigo-800 mb-6">
                 <h4 className="font-bold text-indigo-900 dark:text-indigo-300 mb-2">{t.writing.task}</h4>
                 <p className="text-indigo-800 dark:text-indigo-200" dir="ltr">{lesson.writingTask}</p>
              </div>
              <textarea 
                className="w-full h-64 p-4 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none placeholder-slate-400 dark:placeholder-slate-500"
                placeholder={t.writing.placeholder}
                dir="ltr"
              ></textarea>
              <div className="mt-4 flex justify-end">
                <button className="text-sm text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" onClick={() => alert("Check the Tutor chat!")}>
                    {t.writing.correction}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Complete Button (Only if onComplete handler is provided) */}
        {onComplete && !isCompleted && (
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 flex justify-center animate-in slide-in-from-bottom-2">
                 <Button onClick={onComplete} variant="secondary" className="w-full md:w-auto text-lg py-3 px-8">
                     {t.completeLesson}
                 </Button>
            </div>
        )}

      </div>

      {/* Sidebar Area (1/3 width) - Chat Tutor */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 space-y-6">
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 p-4 rounded-xl">
                <h3 className="text-sm font-bold text-orange-800 dark:text-orange-300 mb-1">{translations[language].tutor.descriptionTitle}</h3>
                <p className="text-xs text-orange-700 dark:text-orange-200">{translations[language].tutor.description}</p>
            </div>
            <TutorChat lesson={lesson} language={language} mode="lesson" />
        </div>
      </div>

    </div>
  );
};

export default LessonView;
