import { EnglishLevel, LessonLength, CurriculumLevel, CurriculumLesson } from './types';

export const GENRES = [
  "Daily Life",
  "Travel",
  "Work & Business",
  "Fantasy",
  "Sci-Fi",
  "Mystery",
  "Adventure"
];

export const GENRE_LABELS: Record<string, { en: string; ar: string }> = {
  "Daily Life": { en: "Daily Life", ar: "الحياة اليومية" },
  "Travel": { en: "Travel", ar: "السفر" },
  "Work & Business": { en: "Work & Business", ar: "العمل والأعمال" },
  "Fantasy": { en: "Fantasy", ar: "الخيال" },
  "Sci-Fi": { en: "Sci-Fi", ar: "الخيال العلمي" },
  "Mystery": { en: "Mystery", ar: "الغموض" },
  "Adventure": { en: "Adventure", ar: "المغامرة" },
};

export const TOPICS_BY_GENRE: Record<string, string[]> = {
  "Daily Life": [
    "Morning routine",
    "Grocery shopping",
    "Cooking dinner",
    "Weekend plans",
    "Ordering food",
    "Meeting a new friend"
  ],
  "Travel": [
    "At the airport",
    "Checking into a hotel",
    "Asking for directions",
    "Sightseeing in a city",
    "Missing a train"
  ],
  "Work & Business": [
    "First day at work",
    "Job interview",
    "Writing an email",
    "Meeting a client",
    "Giving a presentation"
  ],
  "Fantasy": [
    "A magical forest",
    "The dragon's cave",
    "A wizard's spell",
    "The hidden kingdom",
    "Talking animals"
  ],
  "Sci-Fi": [
    "Space travel",
    "Robots and AI",
    "Time machine",
    "Life on Mars",
    "A technological breakthrough"
  ],
  "Mystery": [
    "The missing key",
    "A strange message",
    "The secret room",
    "A rainy night",
    "The lost artifact"
  ],
  "Adventure": [
    "Climbing a mountain",
    "Lost in the jungle",
    "Sailing across the ocean",
    "Desert expedition",
    "Camping in the wild"
  ]
};

export const DEFAULT_TOPICS_VALUES = [
  ...TOPICS_BY_GENRE["Daily Life"],
  ...TOPICS_BY_GENRE["Travel"]
];

export const TOPIC_LABELS: Record<string, { en: string; ar: string }> = {
  // Basic generic translations if specific ones aren't found
  "Morning routine": { en: "Morning routine", ar: "الروتين الصباحي" },
  "Grocery shopping": { en: "Grocery shopping", ar: "التسوق للبقالة" },
  "Cooking dinner": { en: "Cooking dinner", ar: "طهي العشاء" },
  // ... (Add more mappings as needed, or fallback to English in UI)
};

export const GRAMMAR_VALUES = [
  "Present Simple",
  "Past Simple",
  "Present Perfect",
  "Future with Will/Going to",
  "Conditionals (1st & 2nd)",
  "Passive Voice",
];

export const GRAMMAR_LABELS: Record<string, { en: string; ar: string }> = {
  "Present Simple": { en: "Present Simple", ar: "المضارع البسيط" },
  "Past Simple": { en: "Past Simple", ar: "الماضي البسيط" },
  "Present Perfect": { en: "Present Perfect", ar: "المضارع التام" },
  "Future with Will/Going to": { en: "Future with Will/Going to", ar: "المستقبل" },
  "Conditionals (1st & 2nd)": { en: "Conditionals (1st & 2nd)", ar: "الجمل الشرطية" },
  "Passive Voice": { en: "Passive Voice", ar: "المبني للمجهول" },
};

export const LENGTH_LABELS: Record<LessonLength, { en: string; ar: string }> = {
  [LessonLength.Short]: { en: "Short (100-150 words)", ar: "قصيرة (100-150 كلمة)" },
  [LessonLength.Medium]: { en: "Medium (150-250 words)", ar: "متوسطة (150-250 كلمة)" },
  [LessonLength.Long]: { en: "Long (250-400 words)", ar: "طويلة (250-400 كلمة)" },
};

export const LEVELS = Object.values(EnglishLevel);
export const LENGTHS = Object.values(LessonLength);


// --- Curriculum Data Generation ---

const generateLessons = (
  levelId: string, 
  count: number, 
  baseLevel: EnglishLevel, 
  topics: string[], 
  grammar: string[]
): CurriculumLesson[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `${levelId}-lesson-${i + 1}`,
    title: `Lesson ${i + 1}: ${topics[i % topics.length]}`,
    level: baseLevel,
    topic: topics[i % topics.length],
    grammar: grammar[i % grammar.length],
  }));
};

const LEVEL_1_TOPICS = ["Greetings", "Family", "Numbers", "Colors", "Food", "Daily Routine", "House", "City", "Jobs", "Weather", "Clothing", "Time", "Days", "Months", "Transport"];
const LEVEL_1_GRAMMAR = ["Verb To Be", "Present Simple", "Pronouns", "There is/are", "Can/Can't", "Imperatives", "Possessives", "Present Continuous"];

const LEVEL_2_TOPICS = ["Travel", "Health", "Technology", "Culture", "Environment", "Shopping", "Education", "Relationships", "Hobbies", "Media", "Sports", "Entertainment", "Music", "History", "Science"];
const LEVEL_2_GRAMMAR = ["Past Simple", "Present Perfect", "Future with Will", "Comparatives", "Modal Verbs", "Past Continuous", "First Conditional", "Used to"];

const LEVEL_3_TOPICS = ["Global Issues", "Business", "Politics", "Psychology", "Arts", "Philosophy", "Economics", "Literature", "Innovation", "Law", "Medicine", "Space", "Ethics", "Sociology", "Architecture"];
const LEVEL_3_GRAMMAR = ["Present Perfect Continuous", "Second Conditional", "Third Conditional", "Passive Voice", "Reported Speech", "Future Perfect", "Mixed Conditionals", "Inversion"];

export const CURRICULUM_DATA: CurriculumLevel[] = [
  {
    id: 'lvl1',
    title: { en: "Level 1 – Beginner", ar: "المستوى 1 – مبتدئ" },
    description: { 
      en: "Foundations: Letters, pronunciation, basic vocabulary, and simple grammar.",
      ar: "تأسيس – حروف، نطق، مفردات أساسية، قواعد بسيطة."
    },
    englishLevelRange: [EnglishLevel.A1, EnglishLevel.A2],
    lessons: generateLessons('lvl1', 70, EnglishLevel.A2, LEVEL_1_TOPICS, LEVEL_1_GRAMMAR),
  },
  {
    id: 'lvl2',
    title: { en: "Level 2 – Intermediate", ar: "المستوى 2 – متوسط" },
    description: {
      en: "Sentence structure, tenses, daily conversations, and writing.",
      ar: "تركيب الجمل، الأزمنة، المحادثات اليومية، الكتابة."
    },
    englishLevelRange: [EnglishLevel.B1, EnglishLevel.B2],
    lessons: generateLessons('lvl2', 70, EnglishLevel.B1, LEVEL_2_TOPICS, LEVEL_2_GRAMMAR),
  },
  {
    id: 'lvl3',
    title: { en: "Level 3 – Advanced", ar: "المستوى 3 – متقدم" },
    description: {
      en: "Academic English, business skills, and accent refinement.",
      ar: "الإنجليزية الأكاديمية، مهارات العمل، تحسين النطق."
    },
    englishLevelRange: [EnglishLevel.C1],
    lessons: generateLessons('lvl3', 70, EnglishLevel.C1, LEVEL_3_TOPICS, LEVEL_3_GRAMMAR),
  }
];