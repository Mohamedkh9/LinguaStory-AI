
export type Language = 'en' | 'ar';
export type ViewMode = 'welcome' | 'generator' | 'lesson' | 'conversation' | 'curriculum' | 'history';

export enum EnglishLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
}

export enum LessonLength {
  Short = 'Short (100-150 words)',
  Medium = 'Medium (150-250 words)',
  Long = 'Long (250-400 words)',
}

export interface VocabularyItem {
  word: string;
  englishMeaning: string;
  arabicMeaning: string;
}

export interface LessonData {
  title: string;
  story: string;
  storyTranslation: string;
  vocabulary: VocabularyItem[];
  comprehensionQuestions: string[];
  discussionQuestions: string[];
  writingTask: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface LessonParams {
  level: EnglishLevel;
  genre: string;
  topic: string;
  grammar: string;
  length: LessonLength;
}

export interface ConversationParams {
  topic: string;
  level: EnglishLevel;
}

// --- Curriculum Types ---
export interface CurriculumLesson {
  id: string;
  title: string;
  level: EnglishLevel;
  topic: string;
  grammar: string;
}

export interface CurriculumLevel {
  id: string;
  title: { en: string; ar: string };
  description: { en: string; ar: string };
  englishLevelRange: EnglishLevel[];
  lessons: CurriculumLesson[];
}

export interface UserProgress {
  completedLessonIds: string[];
  unlockedLevelIds: string[];
}

// --- History Types ---
export interface HistoryItem {
  id: string;
  timestamp: number;
  lesson: LessonData;
  params: LessonParams;
}
