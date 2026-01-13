import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { Send, Sparkles, X, Loader2, Bot, User, Trash2, ExternalLink, Copy, Check, Globe, Eye, AlertTriangle, ArrowRight, CornerDownLeft, Mic, Link as LinkIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Cast motion components
const MotionDiv = motion.div as any;
const MotionButton = motion.button as any;
const MotionSpan = motion.span as any;

interface Source {
  title: string;
  uri: string;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  sources?: Source[];
  isError?: boolean;
}

// Context-aware prompts based on active section
const SECTION_PROMPTS: Record<string, string[]> = {
  'hero-section': [
    "What can DocFlow do?",
    "Is my document data secure?",
    "How do I get started?",
    "Latest PDF features?"
  ],
  'tools': [
    "How do I merge multiple PDFs?",
    "Can I convert PDF to Word?",
    "Explain compression options.",
    "How to password protect a file?"
  ],
  'features': [
    "Tell me about Vault Security.",
    "How accurate is the OCR?",
    "Does this work on mobile?",
    "What makes DocFlow fast?"
  ]
};

const WELCOME_ACTIONS = [
  { label: "Merge PDFs", prompt: "How do I merge multiple PDF files?" },
  { label: "Summarize Doc", prompt: "How can I summarize a document?" },
  { label: "Security Check", prompt: "Is my data secure here?" },
  { label: "Convert File", prompt: "How do I convert PDF to Word?" },
];

// Refined Context-aware loading messages
const LOADING_SCENARIOS = {
  merge: [
    "Analyzing document structure and page count...", 
    "Checking dimensions and orientation...", 
    "Optimizing merge sequence...", 
    "Finalizing combined document..."
  ],
  security: [
    "Verifying encryption standards...", 
    "Checking security permissions...", 
    "Validating protocol compliance...", 
    "Ensuring zero-knowledge privacy..."
  ],
  convert: [
    "Detecting source format and layout...", 
    "Analyzing vector geometry...", 
    "Mapping font substitutions...", 
    "Optimizing output formatting..."
  ],
  compress: [
    "Analyzing bitstream efficiency...",
    "Calculating potential size reduction...",
    "Optimizing image assets...",
    "Rebuilding PDF structure..."
  ],
  edit: [
    "Loading annotation engine...",
    "Analyzing text layers...",
    "Preparing editing tools...",
    "Syncing document state..."
  ],
  extract: [
    "Initializing OCR engine...",
    "Enhancing image contrast...",
    "Detecting text regions...",
    "Extracting character data..."
  ],
  image: [
    "Scanning document for visual assets...",
    "Analyzing color profiles...",
    "Extracting high-quality image layers...",
    "Formatting output files..."
  ],
  general: [
    "Analyzing request context...",
    "Scanning PDF tool capabilities...",
    "Searching knowledge base...",
    "Formulating optimal solution...",
    "Structuring response..."
  ]
};

const AIAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hello! I'm your DocFlow Assistant powered by Gemini. How can I help you master your documents today?"
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSteps, setActiveSteps] = useState<string[]>(LOADING_SCENARIOS.general);
  const [loadingMessage, setLoadingMessage] = useState(LOADING_SCENARIOS.general[0]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>(SECTION_PROMPTS['hero-section']);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoadingRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const baseInputRef = useRef("");

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('');
          
          setInputValue((baseInputRef.current ? baseInputRef.current + ' ' : '') + transcript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
          
          if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
            alert("Microphone access was denied. Please allow microphone access in your browser settings to use voice commands.");
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Voice input is not supported in your browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      baseInputRef.current = inputValue;
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.warn("Speech recognition start failed (likely already active):", err);
      }
    }
  };

  // Keep ref synchronized with state for event handlers
  useEffect(() => {
    isLoadingRef.current = isLoading;
  }, [isLoading]);

  // Dynamic Loading Message Cycle
  useEffect(() => {
    if (!isLoading) return;

    let step = 0;
    const interval = setInterval(() => {
      step = (step + 1) % activeSteps.length;
      setLoadingMessage(activeSteps[step]);
    }, 1800);

    return () => clearInterval(interval);
  }, [isLoading, activeSteps]);

  // Scroll Spy for Contextual Prompts
  useEffect(() => {
    const observer = new IntersectionObserver(
        (entries) => {
            // Get the entry with the highest intersection ratio
            const sorted = entries.sort((a, b) => b.intersectionRatio - a.intersectionRatio);
            const target = sorted[0];
            
            if (target.isIntersecting && target.intersectionRatio > 0.1) {
                const sectionId = target.target.id;
                if (SECTION_PROMPTS[sectionId]) {
                    setSuggestedPrompts(SECTION_PROMPTS[sectionId]);
                }
            }
        },
        { threshold: [0.2, 0.5] }
    );

    const sections = document.querySelectorAll('section[id]');
    sections.forEach(s => observer.observe(s));

    return () => observer.disconnect();
  }, []);

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getFriendlyErrorMessage = (error: any): string => {
    const errString = error?.toString()?.toLowerCase() || "";
    const message = error?.message?.toLowerCase() || "";

    if (!navigator.onLine) {
      return "**Connection Lost**\nIt looks like you're offline. Please check your internet connection and try again.";
    }

    if (message.includes('429') || message.includes('quota') || errString.includes('quota')) {
      return "**Usage Limit Reached**\nI'm receiving a high volume of requests. Please wait a moment before trying again.";
    }

    if (message.includes('api key') || message.includes('apikey') || (message.includes('400') && message.includes('key'))) {
         return "**API Key Missing or Invalid**\nPlease check your configuration to ensure a valid Google Gemini API key is provided.";
    }

    if (message.includes('403') || message.includes('permission')) {
      return "**Configuration Issue**\nThere seems to be an issue with permissions. Please check the system configuration.";
    }

    if (message.includes('503') || message.includes('500') || message.includes('overloaded')) {
      return "**Service Temporarily Unavailable**\nThe AI service is currently experiencing high traffic. Please try again in a few minutes.";
    }

    if (message.includes('safety') || message.includes('blocked')) {
      return "**Content Filtered**\nI couldn't generate a response because the query triggered safety filters. Please try rephrasing your request.";
    }

    return "**Unexpected Error**\nI encountered an error while processing your request. Please try again.";
  };

  const handleSendMessage = async (text: string = inputValue) => {
    if (!text.trim() || isLoadingRef.current) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    // Determine loading context based on keywords - Enhanced regex for better coverage
    const lowerText = text.toLowerCase();
    let newSteps = LOADING_SCENARIOS.general;

    if (lowerText.match(/merge|split|combine|join|organize|binder|append/)) {
      newSteps = LOADING_SCENARIOS.merge;
    } else if (lowerText.match(/convert|word|excel|powerpoint|ppt|csv|format|export|transform|turn into/)) {
      newSteps = LOADING_SCENARIOS.convert;
    } else if (lowerText.match(/protect|unlock|password|encrypt|security|sign|lock|auth|permission|access/)) {
      newSteps = LOADING_SCENARIOS.security;
    } else if (lowerText.match(/compress|shrink|optimize|reduce|size|minify/)) {
      newSteps = LOADING_SCENARIOS.compress;
    } else if (lowerText.match(/edit|change|modify|annotate|draw|highlight|redact/)) {
      newSteps = LOADING_SCENARIOS.edit;
    } else if (lowerText.match(/ocr|text|extract|copy|read|scan/)) {
      newSteps = LOADING_SCENARIOS.extract;
    } else if (lowerText.match(/jpg|png|jpeg|image|photo|picture|bitmap/)) {
      newSteps = LOADING_SCENARIOS.image;
    }

    setActiveSteps(newSteps);
    setLoadingMessage(newSteps[0]);

    try {
      const ai = new GoogleGenAI({ apiKey: "AIzaSyCmLxRAoZGEXl_vQIZZXeCzCXuJTdxzY3w" });
      
      const systemInstruction = `You are DocFlow AI, the intelligent virtual assistant for a premium cloud-based document tool suite.

**Your Role:**
Guide users through our ecosystem of 20+ PDF tools including Merge, Split, Compress, Convert (PDF to Word/Excel/PPT/JPG), Edit, Sign, and Protect.

**Capabilities:**
- You have access to **Google Search** to provide real-time, up-to-date information when users ask about current events, specific facts, or external resources (e.g., "latest PDF standards", "competitor pricing").
- When using search, relevant sources will be automatically displayed to the user; simply reference them naturally if needed.

**Security Protocols (High Priority):**
When asked about safety, privacy, or security, explicitly state our 'Vault Security' standards:
1. **Encryption**: We use banking-grade 256-bit AES encryption for all file transfers and processing.
2. **Data Retention**: Files are strictly and automatically deleted from our servers after 2 hours.
3. **Compliance**: Our processing environment is ISO 27001 certified.
4. **Privacy**: We do not mine, read, or sell user document content.

**Interaction Guidelines:**
- For "How do I..." questions, provide clear, numbered step-by-step instructions.
- Use Markdown for clear formatting (bold keywords, lists).
- Keep responses concise, friendly, and professional.
- If a user wants to process a file *now*, kindly explain that you are the assistant and guide them to click the relevant tool card in the 'Tools' section of the dashboard.`;
      
      // Filter out empty messages and the welcome message to prevent API errors
      const validHistory = messages
        .filter(m => m.id !== 'welcome' && m.text.trim().length > 0 && !m.isError)
        .map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

      const streamResponse = await ai.models.generateContentStream({
        model: 'gemini-3-flash-preview',
        contents: [
            ...validHistory,
            { role: 'user', parts: [{ text }] }
        ],
        config: { 
          systemInstruction,
          tools: [{ googleSearch: {} }] 
        }
      });

      let modelMessageId: string | null = null;
      let fullText = "";
      const collectedSources: Source[] = [];
      const seenUrls = new Set<string>();

      for await (const chunk of streamResponse) {
        const c = chunk as GenerateContentResponse;
        
        if (c.text) {
            fullText += c.text;
        }

        // Handle Grounding Metadata (Search Sources)
        const metadata = c.candidates?.[0]?.groundingMetadata;
        if (metadata?.groundingChunks) {
          metadata.groundingChunks.forEach((chunk: any) => {
            if (chunk.web?.uri && chunk.web?.title) {
              if (!seenUrls.has(chunk.web.uri)) {
                seenUrls.add(chunk.web.uri);
                collectedSources.push({
                  title: chunk.web.title,
                  uri: chunk.web.uri
                });
              }
            }
          });
        }

        if (!modelMessageId) {
            modelMessageId = (Date.now() + 1).toString();
            setMessages(prev => [...prev, { 
                id: modelMessageId!, 
                role: 'model', 
                text: fullText, 
                sources: collectedSources.length > 0 ? [...collectedSources] : undefined
            }]);
        } else {
            setMessages(prev => 
                prev.map(msg => msg.id === modelMessageId ? { 
                  ...msg, 
                  text: fullText,
                  sources: collectedSources.length > 0 ? [...collectedSources] : undefined
                } : msg)
            );
        }
      }

    } catch (error) {
      console.error(error);
      const friendlyError = getFriendlyErrorMessage(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'model',
        text: friendlyError,
        isError: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Ref for handleSendMessage to avoid stale closures in event listener
  const handleSendMessageRef = useRef(handleSendMessage);
  useEffect(() => {
    handleSendMessageRef.current = handleSendMessage;
  }, [handleSendMessage]);

  // Listen for custom event to open assistant
  useEffect(() => {
    const handleOpen = (e: any) => {
      setIsOpen(true);
      if (e.detail?.prompt) {
        // Add a small delay to ensure the modal animation starts smoothly
        setTimeout(() => {
          handleSendMessageRef.current(e.detail.prompt);
        }, 300);
      }
    };
    window.addEventListener('open-ai-assistant', handleOpen);
    return () => window.removeEventListener('open-ai-assistant', handleOpen);
  }, []);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isLoading]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearHistory = () => {
    setMessages([{
      id: 'welcome',
      role: 'model',
      text: "Chat history cleared. How can I help you now?"
    }]);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <AnimatePresence>
        {!isOpen && (
          <MotionButton
            key="trigger-btn"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            aria-label="Open AI Assistant"
            className="fixed bottom-6 right-6 z-[60] w-16 h-16 rounded-full bg-gradient-to-r from-[#0061ff] to-cyan-500 text-white shadow-[0_0_40px_-10px_rgba(0,97,255,0.5)] flex items-center justify-center cursor-pointer group"
          >
            <Sparkles size={28} className="animate-pulse" />
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full border-2 border-white dark:border-slate-900 animate-bounce" />
            <span className="absolute right-full mr-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold py-1.5 px-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl">
              Ask AI Assistant
            </span>
          </MotionButton>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <MotionDiv
            key="chat-window"
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-4 md:right-6 z-[60] w-[95vw] md:w-[400px] h-[600px] max-h-[85vh] flex flex-col bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-2xl shadow-blue-900/20 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0061ff] to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">DocFlow Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Online</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={clearHistory} 
                  className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                  title="Clear History"
                  aria-label="Clear chat history"
                >
                  <Trash2 size={18} />
                </button>
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  aria-label="Close chat window"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide">
              {messages.map((msg, index) => (
                <MotionDiv
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${
                    msg.role === 'user' 
                      ? 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300' 
                      : msg.isError
                        ? 'bg-red-500 text-white'
                        : 'bg-gradient-to-tr from-[#0061ff] to-cyan-500 text-white'
                  }`}>
                    {msg.role === 'user' ? <User size={14} /> : msg.isError ? <AlertTriangle size={14} /> : <Bot size={14} />}
                  </div>
                  
                  <div className={`flex flex-col gap-1 max-w-[80%]`}>
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm relative group ${
                      msg.role === 'user'
                        ? 'bg-[#0061ff] text-white rounded-tr-sm'
                        : msg.isError
                          ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-200 border border-red-100 dark:border-red-800 rounded-tl-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 rounded-tl-sm border border-slate-200 dark:border-slate-700 pr-9'
                    }`}>
                      {msg.text}

                      {/* Welcome Suggestions */}
                      {msg.id === 'welcome' && (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                           {WELCOME_ACTIONS.map((action, i) => (
                              <button 
                                key={i}
                                onClick={() => handleSendMessage(action.prompt)}
                                className="text-left px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-700/50 hover:bg-[#0061ff]/10 dark:hover:bg-blue-500/20 border border-slate-200 dark:border-slate-600 hover:border-[#0061ff]/30 dark:hover:border-blue-500/30 transition-all group/btn flex items-center justify-between"
                              >
                                 <span className="text-xs font-semibold text-slate-700 dark:text-slate-100 group-hover/btn:text-[#0061ff] dark:group-hover/btn:text-blue-400">
                                   {action.label}
                                 </span>
                                 <ArrowRight size={12} className="opacity-0 group-hover/btn:opacity-100 -translate-x-2 group-hover/btn:translate-x-0 transition-all text-[#0061ff] dark:text-blue-400" />
                              </button>
                           ))}
                        </div>
                      )}
                      
                      {/* Streaming Indicator Cursor */}
                      {msg.role === 'model' && isLoading && index === messages.length - 1 && !msg.isError && (
                        <span className="inline-block w-1.5 h-4 ml-1 align-middle bg-slate-400/75 animate-pulse rounded-full" />
                      )}

                      {/* Copy Button */}
                      {msg.role === 'model' && (!isLoading || index !== messages.length - 1) && (
                        <button
                            onClick={() => copyToClipboard(msg.text, msg.id)}
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-700/50 text-slate-400 hover:text-[#0061ff] dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
                            title="Copy to clipboard"
                        >
                            {copiedId === msg.id ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                        </button>
                      )}

                      {/* Sources Section - Enhanced */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className={`mt-3 pt-3 border-t ${msg.role === 'user' ? 'border-white/20' : 'border-slate-100 dark:border-slate-700'}`}>
                          <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 text-slate-400 dark:text-slate-400`}>
                            Sources
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {msg.sources.map((source, idx) => (
                              <div 
                                key={idx}
                                className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-xs max-w-full sm:max-w-[280px] transition-all border ${
                                  msg.role === 'user'
                                    ? 'bg-white/10 border-white/10 text-white'
                                    : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-200 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700'
                                }`}
                              >
                                <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                                   <Globe size={10} className="text-slate-500 dark:text-slate-400" />
                                </div>
                                
                                <span className="truncate flex-1 font-semibold cursor-default" title={source.title}>
                                  {source.title}
                                </span>
                                
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => copyToClipboard(source.uri, `source-${msg.id}-${idx}`)}
                                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-500 transition-colors relative"
                                        title="Copy Link"
                                    >
                                        {copiedId === `source-${msg.id}-${idx}` ? (
                                            <Check size={12} className="text-emerald-500" />
                                        ) : (
                                            <LinkIcon size={12} />
                                        )}
                                    </button>
                                    <a 
                                      href={source.uri}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-500 transition-colors"
                                      title="Open in new tab"
                                    >
                                      <ExternalLink size={12} />
                                    </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </MotionDiv>
              ))}
              
              {/* Initial Thinking Indicator */}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0061ff] to-cyan-500 text-white flex-shrink-0 flex items-center justify-center">
                    <Sparkles size={14} className="animate-pulse" />
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl rounded-tl-sm border border-slate-200 dark:border-slate-700 shadow-sm flex items-center gap-3">
                    <div className="flex gap-1.5 h-3 items-center">
                      <MotionDiv 
                        animate={{ scale: [1, 1.2, 1], backgroundColor: ["#0061ff", "#06b6d4", "#0061ff"] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0 }}
                        className="w-2 h-2 rounded-full" 
                      />
                      <MotionDiv 
                        animate={{ scale: [1, 1.2, 1], backgroundColor: ["#0061ff", "#06b6d4", "#0061ff"] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                        className="w-2 h-2 rounded-full" 
                      />
                      <MotionDiv 
                        animate={{ scale: [1, 1.2, 1], backgroundColor: ["#0061ff", "#06b6d4", "#0061ff"] }}
                        transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                        className="w-2 h-2 rounded-full" 
                      />
                    </div>
                    <div className="min-w-[150px]">
                      <AnimatePresence mode="wait">
                        <MotionSpan
                          key={loadingMessage}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          transition={{ duration: 0.3 }}
                          className="text-xs font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#0061ff] to-cyan-500 block"
                        >
                          {loadingMessage}
                        </MotionSpan>
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
              <AnimatePresence mode="wait">
                {messages.length === 1 && !inputValue.trim() ? (
                  <MotionDiv
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide"
                  >
                    {suggestedPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        onClick={() => handleSendMessage(prompt)}
                        className="whitespace-nowrap px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-[#0061ff] hover:text-[#0061ff] transition-colors"
                      >
                        {prompt}
                      </button>
                    ))}
                  </MotionDiv>
                ) : inputValue.trim() ? (
                  <MotionDiv 
                    initial={{ opacity: 0, height: 0, y: 20 }}
                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                    exit={{ opacity: 0, height: 0, y: 20 }}
                    className="mb-4 px-2"
                  >
                     <div className="flex items-center justify-between px-1 mb-2">
                        <div className="flex items-center gap-1.5">
                            <Eye size={12} className="text-[#0061ff]" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0061ff] dark:text-blue-400">Previewing Draft</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-300 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                           <CornerDownLeft size={10} />
                           <span>Press Enter to send</span>
                        </div>
                     </div>
                     
                     <div className="flex flex-row-reverse gap-4">
                        {/* Avatar */}
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center flex-shrink-0 shadow-sm border border-white dark:border-slate-600">
                           <User size={14} />
                        </div>
                        
                        {/* Bubble */}
                        <div className="flex flex-col gap-1 max-w-[85%]">
                            <div className="bg-[#0061ff] text-white p-4 rounded-2xl rounded-tr-sm text-sm leading-relaxed whitespace-pre-wrap shadow-lg shadow-blue-500/10 relative border border-white/10 group">
                               {inputValue}
                            </div>
                        </div>
                     </div>
                  </MotionDiv>
                ) : null}
              </AnimatePresence>
              
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask anything about PDFs..."
                  className="w-full pl-6 pr-24 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl text-sm font-medium focus:outline-none focus:border-[#0061ff] focus:ring-4 focus:ring-[#0061ff]/10 transition-all shadow-sm hover:border-slate-300 dark:hover:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400"
                  disabled={isLoading}
                />
                
                <button
                  onClick={toggleListening}
                  disabled={isLoading}
                  title={isListening ? "Stop listening" : "Voice input"}
                  className={`absolute right-14 top-1/2 -translate-y-1/2 p-2.5 rounded-full transition-all flex items-center justify-center z-10 ${
                    isListening 
                      ? 'bg-red-500 text-white shadow-lg animate-pulse' 
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                   <Mic size={18} />
                </button>

                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  aria-label="Send message"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-[#0061ff] text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 active:scale-95 shadow-md flex items-center justify-center z-10"
                >
                  <Send size={18} className={isLoading ? "opacity-0" : "opacity-100"} />
                  {isLoading && <Loader2 size={18} className="absolute inset-0 m-auto animate-spin" />}
                </button>
              </div>
              <p className="text-center mt-3 text-[10px] font-medium text-slate-400 dark:text-slate-400">
                AI can make mistakes. Please verify important information.
              </p>
            </div>
          </MotionDiv>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;