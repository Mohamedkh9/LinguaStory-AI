
import { Language } from './types';

interface TranslationData {
  appTitle: string;
  about: string;
  nav: {
    storyMode: string;
    conversationMode: string;
    curriculumMode: string;
    historyMode: string;
  };
  welcome: {
    title: string;
    subtitle: string;
    getStarted: string;
    features: {
      learn: string;
      practice: string;
      master: string;
    }
  };
  heroTitle: string;
  heroHighlight: string;
  heroDesc: string;
  formTitle: string;
  level: string;
  length: string;
  genre: string;
  topic: string;
  customTopic: string;
  customTopicPlaceholder: string;
  chooseFromList: string;
  typeOwnTopic: string;
  grammar: string;
  generateBtn: string;
  generating: string;
  features: {
    stories: { title: string; desc: string };
    tutor: { title: string; desc: string };
    lessons: { title: string; desc: string };
  };
  lesson: {
    back: string;
    mode: string;
    completeLesson: string;
    completed: string;
    tabs: {
      story: string;
      vocabulary: string;
      questions: string;
      writing: string;
    };
    storyControls: {
      listen: string;
      stop: string;
      translate: string;
      original: string;
    };
    selection: {
      listen: string;
      translate: string;
      translating: string;
      close: string;
    };
    vocabTable: {
      word: string;
      meaning: string;
      arabic: string;
      pronounce: string;
      viewList: string;
      viewCards: string;
      viewQuiz: string;
    };
    flashcards: {
      flip: string;
      next: string;
      prev: string;
      progress: string;
      front: string;
      back: string;
    };
    quiz: {
        question: string;
        completed: string;
        score: string;
        outOf: string;
        tryAgain: string;
    };
    comprehension: {
      title: string;
    };
    discussion: {
      title: string;
      tip: string;
    };
    writing: {
      title: string;
      task: string;
      placeholder: string;
      correction: string;
    };
  };
  conversation: {
    title: string;
    desc: string;
    topicLabel: string;
    startBtn: string;
    welcome: string;
  };
  curriculum: {
      title: string;
      desc: string;
      lessonsCount: string;
      locked: string;
      start: string;
      completed: string;
      progress: string;
      lockedMsg: string;
  };
  history: {
    title: string;
    empty: string;
    emptyDesc: string;
    generatedOn: string;
    open: string;
    delete: string;
    confirmDelete: string;
  };
  chatHelper: {
    title: string;
    translateTab: string;
    correctTab: string;
    placeholderAr: string;
    placeholderEn: string;
    actionTranslate: string;
    actionCorrect: string;
    resultLabel: string;
    copy: string;
    copied: string;
  };
  tutor: {
    title: string;
    status: string;
    descriptionTitle: string;
    description: string;
    placeholder: string;
    welcome: string;
    connectionError: string;
  };
  errors: {
    generationFailed: string;
  }
}

export const translations: Record<Language, TranslationData> = {
  en: {
    appTitle: "LinguaStory AI",
    about: "About",
    nav: {
      storyMode: "Story Generator",
      conversationMode: "Practice Chat",
      curriculumMode: "Learning Path",
      historyMode: "History",
    },
    welcome: {
      title: "Welcome to LinguaStory AI",
      subtitle: "Your personal AI-powered English tutor. Learn through stories, practice conversations, and master the language at your own pace.",
      getStarted: "Get Started",
      features: {
        learn: "Learn with Stories",
        practice: "Practice Speaking",
        master: "Master Grammar"
      }
    },
    heroTitle: "Master English with",
    heroHighlight: "Stories",
    heroDesc: "Generate personalized stories, vocabulary lists, and interactive lessons tailored to your level instantly.",
    formTitle: "Create Your English Lesson",
    level: "Current Level",
    length: "Story Length",
    genre: "Genre / Theme",
    topic: "Topic",
    customTopic: "Topic",
    customTopicPlaceholder: "e.g. Space travel in 2050...",
    chooseFromList: "Choose from list",
    typeOwnTopic: "Type my own topic",
    grammar: "Target Grammar",
    generateBtn: "Generate Lesson",
    generating: "Creating Lesson...",
    features: {
      stories: { title: "Leveled Stories", desc: "Content adapted to CEFR levels A1-C1." },
      tutor: { title: "AI Tutor", desc: "Real-time chat for corrections and explanations." },
      lessons: { title: "Full Lessons", desc: "Comprehension, vocab, and writing tasks included." }
    },
    lesson: {
      back: "Back",
      mode: "Lesson Mode",
      completeLesson: "Complete Lesson",
      completed: "Completed",
      tabs: {
        story: "📖 Story",
        vocabulary: "🔤 Vocabulary",
        questions: "❓ Comprehension",
        writing: "✍️ Writing"
      },
      storyControls: {
        listen: "Listen to Story",
        stop: "Stop Audio",
        translate: "Show Translation",
        original: "Show Original"
      },
      selection: {
        listen: "Listen",
        translate: "Translate",
        translating: "Translating...",
        close: "Close"
      },
      vocabTable: {
        word: "Word",
        meaning: "Meaning",
        arabic: "Arabic",
        pronounce: "Audio",
        viewList: "List View",
        viewCards: "Flashcards",
        viewQuiz: "Quiz"
      },
      flashcards: {
        flip: "Tap card to flip",
        next: "Next",
        prev: "Prev",
        progress: "Card",
        front: "Word",
        back: "Meaning"
      },
      quiz: {
          question: "Question",
          completed: "Quiz Completed!",
          score: "You scored",
          outOf: "out of",
          tryAgain: "Try Again"
      },
      comprehension: { title: "Comprehension Check" },
      discussion: { title: "Discussion Points", tip: "💡 Tip: Discuss these questions with LinguaBot in the chat!" },
      writing: {
        title: "Writing Assignment",
        task: "Task:",
        placeholder: "Write your answer here...",
        correction: "Need corrections? Ask LinguaBot →"
      }
    },
    conversation: {
      title: "Conversation Practice",
      desc: "Chat naturally with an AI partner to improve your fluency. Choose a topic and start talking!",
      topicLabel: "What do you want to talk about?",
      startBtn: "Start Conversation",
      welcome: "Hello! I'm ready to chat about whatever you like. What's on your mind today?",
    },
    curriculum: {
        title: "Structured Learning Path",
        desc: "Follow a step-by-step path to master English. Complete lessons to unlock the next level.",
        lessonsCount: "Lessons",
        locked: "Locked",
        start: "Start",
        completed: "Done",
        progress: "Progress",
        lockedMsg: "Please complete the previous level to unlock this one.",
    },
    history: {
        title: "Lesson History",
        empty: "No lessons found",
        emptyDesc: "Lessons you generate will appear here so you can review them later.",
        generatedOn: "Generated on",
        open: "Open",
        delete: "Delete",
        confirmDelete: "Are you sure you want to delete this lesson?"
    },
    chatHelper: {
      title: "Drafting Assistant",
      translateTab: "Translate (AR → EN)",
      correctTab: "Fix Grammar (EN)",
      placeholderAr: "Write your reply in Arabic here...",
      placeholderEn: "Write your English attempt here...",
      actionTranslate: "Translate to English",
      actionCorrect: "Fix My English",
      resultLabel: "Result:",
      copy: "Copy",
      copied: "Copied!"
    },
    tutor: {
      title: "LinguaBot Tutor",
      status: "Online • Ready to help",
      descriptionTitle: "Your AI Teacher",
      description: "Use the chat below to practice conversation, ask for word definitions, or check your writing!",
      placeholder: "Ask about grammar, vocab, or just chat...",
      welcome: "Hi! I'm your English tutor. I see you've read the story. Do you have any questions about the vocabulary or grammar? Or shall we practice some conversation? 😊",
      connectionError: "Sorry, I'm having trouble connecting right now. Please try again."
    },
    errors: {
      generationFailed: "Failed to generate lesson. Please check your API key or try again."
    }
  },
  ar: {
    appTitle: "LinguaStory AI",
    about: "عن التطبيق",
    nav: {
      storyMode: "مولد القصص",
      conversationMode: "ممارسة المحادثة",
      curriculumMode: "المسار التعليمي",
      historyMode: "السجل",
    },
    welcome: {
      title: "مرحباً بك في LinguaStory AI",
      subtitle: "معلمك الشخصي الذكي للغة الإنجليزية. تعلم من خلال القصص، مارس المحادثة، وأتقن اللغة حسب وتيرتك.",
      getStarted: "ابدأ الآن",
      features: {
        learn: "تعلم بالقصص",
        practice: "مارس التحدث",
        master: "أتقن القواعد"
      }
    },
    heroTitle: "أتقن الإنجليزية عبر",
    heroHighlight: "القصص",
    heroDesc: "أنشئ قصصًا مخصصة، وقوائم مفردات، ودروسًا تفاعلية تناسب مستواك فوراً وبذكاء اصطناعي متطور.",
    formTitle: "أنشئ درسك الإنجليزي",
    level: "المستوى الحالي",
    length: "طول القصة",
    genre: "النوع / الموضوع العام",
    topic: "الموضوع",
    customTopic: "موضوع مخصص",
    customTopicPlaceholder: "مثال: السفر عبر الزمن...",
    chooseFromList: "اختر من القائمة",
    typeOwnTopic: "أكتب موضوعاً خاصاً",
    grammar: "القواعد المستهدفة",
    generateBtn: "إنشاء الدرس",
    generating: "جاري إنشاء الدرس...",
    features: {
      stories: { title: "قصص حسب المستوى", desc: "محتوى مناسب لمستويات CEFR من A1 إلى C1." },
      tutor: { title: "معلم ذكي", desc: "محادثة فورية للتصحيح والشرح." },
      lessons: { title: "دروس متكاملة", desc: "أسئلة فهم، مفردات، ومهام كتابة." }
    },
    lesson: {
      back: "رجوع",
      mode: "وضع الدرس",
      completeLesson: "إكمال الدرس",
      completed: "مكتمل",
      tabs: {
        story: "📖 القصة",
        vocabulary: "🔤 المفردات",
        questions: "❓ الفهم والاستيعاب",
        writing: "✍️ الكتابة"
      },
      storyControls: {
        listen: "استمع للقصة",
        stop: "إيقاف الصوت",
        translate: "عرض الترجمة",
        original: "النص الأصلي"
      },
      selection: {
        listen: "استماع",
        translate: "ترجمة",
        translating: "جاري الترجمة...",
        close: "إغلاق"
      },
      vocabTable: {
        word: "الكلمة",
        meaning: "المعنى بالإنجليزية",
        arabic: "المعنى بالعربية",
        pronounce: "نطق",
        viewList: "قائمة",
        viewCards: "بطاقات",
        viewQuiz: "اختبار"
      },
      flashcards: {
        flip: "اضغط لقلب البطاقة",
        next: "التالي",
        prev: "السابق",
        progress: "بطاقة",
        front: "الكلمة",
        back: "المعنى"
      },
      quiz: {
          question: "سؤال",
          completed: "تم الاختبار!",
          score: "نتيجتك",
          outOf: "من",
          tryAgain: "حاول مرة أخرى"
      },
      comprehension: { title: "اختبار الفهم" },
      discussion: { title: "نقاط للنقاش", tip: "💡 نصيحة: ناقش هذه الأسئلة مع المعلم الذكي في الدردشة!" },
      writing: {
        title: "مهمة الكتابة",
        task: "المطلوب:",
        placeholder: "اكتب إجابتك هنا...",
        correction: "تحتاج تصحيحاً؟ اسأل المعلم الذكي ←"
      }
    },
    conversation: {
      title: "ممارسة المحادثة",
      desc: "تحدث بشكل طبيعي مع شريك ذكي لتحسين طلاقتك. اختر موضوعاً وابدأ الحديث!",
      topicLabel: "عن ماذا تريد أن تتحدث؟",
      startBtn: "بدء المحادثة",
      welcome: "أهلاً بك! أنا جاهز للدردشة في أي موضوع تحبه. ماذا يدور في ذهنك اليوم؟",
    },
    curriculum: {
        title: "المسار التعليمي المنهجي",
        desc: "اتبع مساراً تدريجياً لإتقان الإنجليزية. يجب عليك إكمال كل مستوى لفتح المستوى التالي.",
        lessonsCount: "درس",
        locked: "مغلق",
        start: "ابدأ",
        completed: "تم",
        progress: "التقدم",
        lockedMsg: "يجب إكمال المستوى السابق لفتح هذا المستوى.",
    },
    history: {
        title: "سجل الدروس",
        empty: "لا توجد دروس محفوظة",
        emptyDesc: "ستظهر الدروس التي تنشئها هنا لتتمكن من مراجعتها لاحقاً.",
        generatedOn: "تاريخ الإنشاء",
        open: "فتح",
        delete: "حذف",
        confirmDelete: "هل أنت متأكد أنك تريد حذف هذا الدرس؟"
    },
    chatHelper: {
      title: "مساعد الصياغة",
      translateTab: "ترجمة (عربي ← إنجليزي)",
      correctTab: "تصحيح القواعد (إنجليزي)",
      placeholderAr: "اكتب ردك بالعربية هنا...",
      placeholderEn: "حاول الكتابة بالإنجليزية هنا...",
      actionTranslate: "ترجم للإنجليزية",
      actionCorrect: "صحح لغتي",
      resultLabel: "النتيجة:",
      copy: "نسخ",
      copied: "تم النسخ!"
    },
    tutor: {
      title: "المعلم الذكي",
      status: "متصل • جاهز للمساعدة",
      descriptionTitle: "معلمك الشخصي",
      description: "استخدم الدردشة أدناه لممارسة المحادثة، أو السؤال عن معاني الكلمات، أو تصحيح كتابتك!",
      placeholder: "اسأل عن القواعد، المفردات، أو دردش معي...",
      welcome: "أهلاً بك! أنا معلمك للغة الإنجليزية. هل لديك أي أسئلة حول المفردات أو القواعد في القصة؟ أم نتدرب على المحادثة؟ 😊",
      connectionError: "عذراً، أواجه مشكلة في الاتصال حالياً. يرجى المحاولة مرة أخرى."
    },
    errors: {
      generationFailed: "فشل إنشاء الدرس. يرجى التحقق من الاتصال والمحاولة مرة أخرى."
    }
  }
};
