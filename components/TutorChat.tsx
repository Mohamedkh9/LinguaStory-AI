
import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, LessonData, Language, ConversationParams } from '../types';
import { createTutorChat, createConversationChat, generateSpeech, translateText } from '../services/geminiService';
import { translations } from '../translations';
import Button from './ui/Button';
import { Chat, GenerateContentResponse } from '@google/genai';

interface TutorChatProps {
  lesson?: LessonData;
  conversationParams?: ConversationParams;
  language: Language;
  mode: 'lesson' | 'conversation';
  className?: string;
  autoPlayResponse?: boolean;
}

interface SelectionState {
    x: number;
    y: number;
    text: string;
    translation?: string;
    isLoadingTranslation?: boolean;
    isPlaying?: boolean;
}

// Helper to decode Base64 string to Uint8Array
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Helper to decode audio data for the AudioContext
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

const TutorChat: React.FC<TutorChatProps> = ({ 
  lesson, 
  conversationParams, 
  language, 
  mode, 
  className = '',
  autoPlayResponse = false
}) => {
  const t = translations[language].tutor;
  const convT = translations[language].conversation;
  const tSel = translations[language].lesson.selection;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  
  // Audio State
  const [isPlayingAudio, setIsPlayingAudio] = useState<string | null>(null);
  const [isAudioLoading, setIsAudioLoading] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  
  // Selection State
  const [selectionMenu, setSelectionMenu] = useState<SelectionState | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContentRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize chat session
  useEffect(() => {
    let chat: Chat | null = null;
    let initialMessage = '';

    if (mode === 'lesson' && lesson) {
        chat = createTutorChat(lesson);
        initialMessage = t.welcome;
    } else if (mode === 'conversation' && conversationParams) {
        chat = createConversationChat(conversationParams);
        initialMessage = `${convT.welcome} (${conversationParams.topic})`;
        
        setIsLoading(true);
        chat.sendMessageStream({ message: `Hi! Let's talk about ${conversationParams.topic}.` })
            .then(async (result) => {
                let fullText = "";
                const msgId = Date.now().toString();
                for await (const chunk of result) {
                    const c = chunk as GenerateContentResponse;
                    fullText += c.text || "";
                }
                setMessages([{
                    id: msgId,
                    role: 'model',
                    text: fullText,
                    timestamp: Date.now()
                }]);
                setIsLoading(false);
                
                if (autoPlayResponse) {
                    playMessageAudio(fullText, msgId);
                }
            })
            .catch(() => {
                setMessages([{
                    id: 'welcome',
                    role: 'model',
                    text: initialMessage,
                    timestamp: Date.now(),
                }]);
                setIsLoading(false);
            });
            
        setChatSession(chat);
        return; 
    }

    setChatSession(chat);
    if (initialMessage && mode === 'lesson') {
         setMessages([
          {
            id: 'welcome',
            role: 'model',
            text: initialMessage,
            timestamp: Date.now(),
          },
        ]);
    }
  }, [lesson, conversationParams, mode, language]); 

  // Cleanup
  useEffect(() => {
    return () => {
        if (audioContextRef.current) {
            audioContextRef.current.close();
        }
        if (recognitionRef.current) {
            recognitionRef.current.abort();
        }
    };
  }, []);

  // Handle Selection
  useEffect(() => {
    const handleSelection = () => {
        const selection = window.getSelection();
        if (!selection || selection.isCollapsed) return;

        const text = selection.toString().trim();
        if (text.length < 1) return;

        // Check if selection is inside the chat content
        if (chatContentRef.current && !chatContentRef.current.contains(selection.anchorNode)) {
            return;
        }

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        setSelectionMenu({
            x: rect.left + (rect.width / 2),
            y: rect.top,
            text: text
        });
    };

    const handleDocumentMouseDown = (e: MouseEvent) => {
        const menuEl = document.getElementById('chat-selection-menu');
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
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Speech to Text Logic
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.");
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    
    recognition.lang = 'en-US'; 
    recognition.continuous = false;
    recognition.interimResults = false; 

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      const formattedTranscript = transcript.charAt(0).toUpperCase() + transcript.slice(1);
      
      setInput(prev => {
          const trimmed = prev.trim();
          return trimmed ? `${trimmed} ${formattedTranscript}` : formattedTranscript;
      });
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
        recognition.start();
    } catch (e) {
        console.error("Failed to start recognition", e);
        setIsListening(false);
    }
  };

  // Text to Speech Logic (Message)
  const playMessageAudio = async (text: string, msgId: string) => {
    // If checking loading state or already playing this message, ignore
    if (isPlayingAudio === msgId) return;
    if (!text) return;

    // Stop current audio if playing
    if (audioContextRef.current && audioContextRef.current.state === 'running') {
       await audioContextRef.current.suspend();
       setIsPlayingAudio(null);
    }

    try {
      setIsAudioLoading(msgId);
      
      const base64Audio = await generateSpeech(text);
      if (!base64Audio) throw new Error("Failed to generate audio");

      if (!audioContextRef.current) {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        audioContextRef.current,
        24000,
        1
      );

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
        setIsPlayingAudio(null);
      };

      source.start();
      setIsPlayingAudio(msgId);
    } catch (error) {
      console.error("TTS Error:", error);
      // Don't alert for auto-play, it can be annoying if it fails silently
      if (!autoPlayResponse) {
          alert("Could not play audio.");
      }
    } finally {
      setIsAudioLoading(null);
    }
  };

  // Play Selection Audio
  const playSelectionAudio = async () => {
    if (!selectionMenu) return;
    
    setSelectionMenu(prev => prev ? { ...prev, isPlaying: true } : null);
    setIsPlayingAudio(null); // Stop specific message audio if any

    try {
      const base64Audio = await generateSpeech(selectionMenu.text);
      if (!base64Audio) throw new Error("Failed to generate audio");

      if (!audioContextRef.current) {
         // eslint-disable-next-line @typescript-eslint/no-explicit-any
         audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({sampleRate: 24000});
      }
      
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      const audioBuffer = await decodeAudioData(
        decode(base64Audio),
        audioContextRef.current,
        24000,
        1
      );

      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      
      source.onended = () => {
         setSelectionMenu(prev => prev ? { ...prev, isPlaying: false } : null);
      };

      source.start();
    } catch (error) {
      console.error("Selection Audio Error:", error);
      alert("Could not play audio.");
      setSelectionMenu(prev => prev ? { ...prev, isPlaying: false } : null);
    }
  };
  
  // Translate Selection
  const handleTranslateSelection = async () => {
    if (!selectionMenu) return;
    setSelectionMenu(prev => prev ? { ...prev, isLoadingTranslation: true } : null);
    const result = await translateText(selectionMenu.text);
    setSelectionMenu(prev => prev ? { ...prev, translation: result, isLoadingTranslation: false } : null);
  };

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatSession.sendMessageStream({ message: userMsg.text });
      
      const botMsgId = (Date.now() + 1).toString();
      let fullText = "";
      let hasAddedBotMsg = false;

      for await (const chunk of result) {
          const c = chunk as GenerateContentResponse;
          const textChunk = c.text || "";
          fullText += textChunk;
          
          if (!hasAddedBotMsg) {
             setMessages(prev => [...prev, {
                id: botMsgId,
                role: 'model',
                text: fullText,
                timestamp: Date.now()
             }]);
             hasAddedBotMsg = true;
          } else {
             setMessages(prev => prev.map(msg => 
                msg.id === botMsgId ? { ...msg, text: fullText } : msg
             ));
          }
      }

      if (autoPlayResponse && fullText) {
          playMessageAudio(fullText, botMsgId);
      }

    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: t.connectionError,
        timestamp: Date.now(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`flex flex-col bg-white dark:bg-slate-800 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden relative ${className ? className : 'h-[600px]'} transition-colors duration-200`}>
      
      {/* Selection Popup Menu */}
      {selectionMenu && (
        <div 
            id="chat-selection-menu"
            className="fixed z-50 transform -translate-x-1/2 -translate-y-full mb-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg shadow-xl p-2 flex flex-col gap-2 min-w-[200px]"
            style={{ top: selectionMenu.y - 10, left: selectionMenu.x }}
        >
            <div className="flex gap-2 justify-center">
                <button 
                    onClick={playSelectionAudio}
                    className="flex-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                >
                    {selectionMenu.isPlaying ? (
                        <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    ) : (
                        <span>🔊</span>
                    )}
                    {tSel.listen}
                </button>
                <button 
                    onClick={handleTranslateSelection}
                    className="flex-1 px-3 py-1.5 bg-slate-600 hover:bg-slate-500 rounded text-xs font-medium flex items-center justify-center gap-1 transition-colors"
                >
                   <span>🈂️</span> {tSel.translate}
                </button>
            </div>
            
            {selectionMenu.isLoadingTranslation && (
                 <div className="text-xs text-slate-300 text-center py-1">{tSel.translating}</div>
            )}
            
            {selectionMenu.translation && (
                <div className="text-sm bg-slate-700 dark:bg-slate-600 p-2 rounded text-center border-t border-slate-600" dir="rtl">
                    {selectionMenu.translation}
                </div>
            )}
            
            <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-800 dark:bg-slate-700 transform rotate-45"></div>
        </div>
      )}

      {/* Header */}
      <div className={`p-4 flex items-center gap-3 ${mode === 'conversation' ? 'bg-indigo-700 dark:bg-indigo-800' : 'bg-indigo-600 dark:bg-indigo-700'} transition-colors duration-200`}>
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-2xl">
          {mode === 'conversation' ? '🗣️' : '🤖'}
        </div>
        <div>
          <h3 className="font-bold text-white">
            {mode === 'conversation' 
                ? (conversationParams?.topic ? `${conversationParams.topic}` : convT.title)
                : t.title}
          </h3>
          <p className="text-indigo-200 text-xs">{t.status}</p>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={chatContentRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-900 transition-colors duration-200"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%]`}>
                <div
                className={`px-4 py-3 shadow-sm ${
                    msg.role === 'user'
                    ? 'bg-indigo-600 dark:bg-indigo-700 text-white rounded-2xl rounded-be-none rtl:rounded-be-none rtl:rounded-bl-2xl selection:bg-indigo-800 selection:text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none rtl:rounded-bl-none rtl:rounded-be-2xl selection:bg-indigo-100 selection:text-indigo-900 dark:selection:bg-indigo-900 dark:selection:text-white'
                }`}
                >
                    <p className="whitespace-pre-wrap text-sm md:text-base" dir="auto">{msg.text}</p>
                </div>
                
                {msg.role === 'model' && msg.text && (
                    <button 
                        onClick={() => playMessageAudio(msg.text, msg.id)}
                        disabled={isAudioLoading === msg.id}
                        className={`mt-1 text-xs flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
                            isPlayingAudio === msg.id 
                            ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' 
                            : 'text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title="Listen to this message"
                    >
                        {isAudioLoading === msg.id ? (
                            <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
                        ) : (
                            <span>🔊</span>
                        )}
                        {isPlayingAudio === msg.id ? 'Playing...' : 'Listen'}
                    </button>
                )}
            </div>
          </div>
        ))}
        {isLoading && (
             <div className="flex justify-start">
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl rounded-bl-none rtl:rounded-be-none rtl:rounded-bl-2xl px-4 py-3 shadow-sm">
                    <div className="flex space-x-2 rtl:space-x-reverse">
                        <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-slate-400 dark:bg-slate-500 rounded-full animate-bounce delay-200"></div>
                    </div>
                </div>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 z-10 transition-colors duration-200">
        <div className="flex gap-2 items-center">
            <button
                onClick={toggleListening}
                className={`p-3 rounded-full transition-all duration-200 flex-shrink-0 relative group ${
                    isListening 
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse ring-2 ring-red-400' 
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                title={isListening ? "Stop listening" : "Speak (English)"}
            >
                {isListening ? (
                    <div className="w-5 h-5 flex items-center justify-center">
                        <span className="block w-3 h-3 bg-current rounded-sm"></span>
                    </div>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M8.25 4.5a3.75 3.75 0 117.5 0v8.25a3.75 3.75 0 11-7.5 0V4.5z" />
                        <path d="M6 10.5a.75.75 0 01.75.75v1.5a5.25 5.25 0 1010.5 0v-1.5a.75.75 0 011.5 0v1.5a6.751 6.751 0 01-6 6.709v2.291h3a.75.75 0 010 1.5h-7.5a.75.75 0 010-1.5h3v-2.291a6.751 6.751 0 01-6-6.709v-1.5A.75.75 0 016 10.5z" />
                    </svg>
                )}
                
                {!isListening && (
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-slate-800 dark:bg-slate-600 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                        Speak English
                    </span>
                )}
            </button>
            
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? "Listening..." : t.placeholder}
            className={`flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                isListening 
                ? 'border-indigo-400 bg-indigo-50 dark:bg-indigo-900/20' 
                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white'
            }`}
            disabled={isLoading}
          />
          <Button 
            onClick={handleSend} 
            disabled={!input.trim() || isLoading}
            className="!rounded-full !px-4"
          >
             <span className="rtl:rotate-180">➤</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TutorChat;
