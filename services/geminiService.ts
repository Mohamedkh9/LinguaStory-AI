import { GoogleGenAI, Type, Schema, Chat, Modality } from "@google/genai";
import { LessonData, LessonParams, VocabularyItem, ConversationParams } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Schema for structured JSON output
const vocabularySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING },
    englishMeaning: { type: Type.STRING },
    arabicMeaning: { type: Type.STRING },
  },
  required: ["word", "englishMeaning", "arabicMeaning"],
};

const lessonSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    story: { type: Type.STRING },
    storyTranslation: { type: Type.STRING },
    vocabulary: {
      type: Type.ARRAY,
      items: vocabularySchema,
    },
    comprehensionQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    discussionQuestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    writingTask: { type: Type.STRING },
  },
  required: ["title", "story", "storyTranslation", "vocabulary", "comprehensionQuestions", "discussionQuestions", "writingTask"],
};

export const generateLesson = async (params: LessonParams): Promise<LessonData> => {
  const model = "gemini-2.5-flash";

  const prompt = `
    Generate a structured English lesson for an English learner.
    
    Parameters:
    - Level: ${params.level}
    - Genre: ${params.genre}
    - Topic: ${params.topic}
    - Target Grammar: ${params.grammar}
    - Length: ${params.length}

    Requirements:
    1. Story: Write an engaging story fitting the level, genre, and topic. Highlight the use of ${params.grammar}.
    2. Story Translation: Provide a natural Arabic translation of the generated story.
    3. Vocabulary: Pick 12+ challenging words from the story. Provide English definition and Arabic translation.
    4. Comprehension: 5 questions to test understanding of the plot.
    5. Discussion: 3-5 open-ended questions to spark conversation.
    6. Writing Task: One creative writing prompt related to the story.
    
    Adaptivity:
    - For A1-A2: Use simple sentences, high frequency words.
    - For B1-B2: Use more complex structures.
    - For C1: Use nuanced vocabulary and idioms.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: lessonSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    return JSON.parse(text) as LessonData;
  } catch (error) {
    console.error("Error generating lesson:", error);
    throw error;
  }
};

export const createTutorChat = (lessonContext: LessonData): Chat => {
  const systemInstruction = `
    You are a friendly, encouraging, and patient English Tutor named "LinguaBot".
    
    Context: The student is currently studying a lesson titled "${lessonContext.title}".
    Story Summary: ${lessonContext.story.substring(0, 200)}...
    
    Your Goals:
    1. Help the student understand the vocabulary and grammar from the story.
    2. If the student makes a grammar mistake, gently correct them by showing the correct version, then explain why.
    3. Ask follow-up questions based on the "Discussion Questions" provided in the lesson to practice speaking/writing.
    4. Keep explanations simple and concise. Avoid long lectures.
    5. Be supportive and use emojis occasionally to keep the mood light.
  `;

  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction,
    },
  });
};

export const createConversationChat = (params: ConversationParams): Chat => {
  const systemInstruction = `
    You are "LinguaBot", a friendly English conversation partner designed to help students practice speaking.
    
    Parameters:
    - Topic: ${params.topic}
    - User Level: ${params.level}

    Instructions:
    1. Engage in a natural, friendly conversation about the chosen topic.
    2. Ask open-ended questions to keep the conversation going.
    3. Adjust your vocabulary and sentence complexity to match the User Level (${params.level}).
    4. Keep your responses relatively short (1-3 sentences) to allow for a back-and-forth dialogue.
    5. If the user makes a significant grammar or vocabulary mistake, gently correct it at the end of your response in parentheses, e.g., "(Correction: ...)" but do not interrupt the flow.
    6. Be encouraging and fun!
  `;

  return ai.chats.create({
    model: "gemini-2.5-flash",
    config: {
      systemInstruction,
    },
  });
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    
    // Iterate through parts to find the audio data
    const candidates = response.candidates;
    if (candidates && candidates.length > 0) {
        const parts = candidates[0].content.parts;
        for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
                return part.inlineData.data;
            }
        }
    }
    return undefined;
  } catch (error) {
    console.error("Error generating speech:", error);
    return undefined;
  }
};

export const translateText = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Translate the following English text to Arabic. Output ONLY the translated text without any explanation. Text: "${text}"`,
            config: {
                temperature: 0.3,
            }
        });
        return response.text?.trim() || "Translation unavailable";
    } catch (error) {
        console.error("Translation error:", error);
        return "Error translating text.";
    }
};

export const getChatHelperResponse = async (text: string, type: 'translate' | 'correct'): Promise<string> => {
    const prompt = type === 'translate'
        ? `Translate the following Arabic text to natural, conversational English. Output ONLY the English translation, no other text. Text: "${text}"`
        : `Correct the grammar, spelling, and vocabulary of the following English text to make it sound natural and correct. Output ONLY the corrected text, no explanation. Text: "${text}"`;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                temperature: 0.3,
            }
        });
        return response.text?.trim() || "";
    } catch (error) {
        console.error("Helper error:", error);
        return "Error processing request.";
    }
};