
import React, { useState, useEffect } from 'react';
import { EnglishLevel, LessonLength, LessonParams, Language } from '../types';
import { GENRES, GENRE_LABELS, TOPICS_BY_GENRE, GRAMMAR_VALUES, LEVELS, LENGTHS, TOPIC_LABELS, GRAMMAR_LABELS, LENGTH_LABELS } from '../constants';
import { translations } from '../translations';
import Button from './ui/Button';

interface GeneratorFormProps {
  onSubmit: (params: LessonParams) => void;
  isGenerating: boolean;
  language: Language;
}

const GeneratorForm: React.FC<GeneratorFormProps> = ({ onSubmit, isGenerating, language }) => {
  const t = translations[language];
  const [level, setLevel] = useState<EnglishLevel>(EnglishLevel.A2);
  const [genre, setGenre] = useState(GENRES[0]);
  const [topic, setTopic] = useState(TOPICS_BY_GENRE[GENRES[0]][0]);
  const [customTopic, setCustomTopic] = useState('');
  const [grammar, setGrammar] = useState(GRAMMAR_VALUES[1]);
  const [length, setLength] = useState<LessonLength>(LessonLength.Medium);
  const [isCustomTopic, setIsCustomTopic] = useState(false);

  // Update topic options when genre changes
  useEffect(() => {
    if (!isCustomTopic) {
        setTopic(TOPICS_BY_GENRE[genre][0]);
    }
  }, [genre, isCustomTopic]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      level,
      genre,
      topic: isCustomTopic ? customTopic : topic,
      grammar,
      length,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-2xl shadow-lg border border-slate-100 dark:border-slate-700 max-w-3xl mx-auto transition-colors duration-200">
      <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6 text-center">{t.formTitle}</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Length Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.length}</label>
             <select
              value={length}
              onChange={(e) => setLength(e.target.value as LessonLength)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            >
              {LENGTHS.map((len) => (
                <option key={len} value={len}>
                  {LENGTH_LABELS[len][language]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Genre Selection */}
            <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.genre}</label>
            <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
            >
                {GENRES.map((g) => (
                <option key={g} value={g}>
                    {GENRE_LABELS[g] ? GENRE_LABELS[g][language] : g}
                </option>
                ))}
            </select>
            </div>

            {/* Topic Selection */}
            <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.topic}</label>
            <div className="space-y-3">
                {!isCustomTopic ? (
                <select
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                >
                    {TOPICS_BY_GENRE[genre].map((tVal) => (
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
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
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
        </div>

        {/* Grammar Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.grammar}</label>
          <select
            value={grammar}
            onChange={(e) => setGrammar(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
          >
            {GRAMMAR_VALUES.map((g) => (
              <option key={g} value={g}>
                {GRAMMAR_LABELS[g] ? GRAMMAR_LABELS[g][language] : g}
              </option>
            ))}
          </select>
        </div>

        <div className="pt-4">
            <Button type="submit" isLoading={isGenerating} className="w-full py-3 text-lg">
                {isGenerating ? t.generating : t.generateBtn}
            </Button>
        </div>
      </form>
    </div>
  );
};

export default GeneratorForm;
