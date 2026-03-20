import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Loader2, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { chatWithThinking, fastChat } from '../lib/gemini';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Bonjour Yann ! Je suis votre assistant LifeOS. Comment puis-je vous aider aujourd'hui ?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Use thinking mode for complex queries, or fast chat for simple ones
      const response = await chatWithThinking(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: response || "Désolé, je n'ai pas pu générer de réponse." }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Une erreur est survenue. Veuillez réessayer." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 p-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-110 transition-all z-50 group"
      >
        {isOpen ? <X size={28} className="text-white" /> : <Bot size={28} className="text-white" />}
        <span className="absolute -top-2 -right-2 bg-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white animate-pulse">
          IA
        </span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 w-96 h-[600px] bg-black/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl flex flex-col z-50 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-t-3xl">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/20 rounded-xl">
                <Sparkles size={20} className="text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-white">LifeOS Brain</h3>
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest">Gemini 3.1 Pro</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={cn(
                  "flex gap-3 max-w-[85%]",
                  msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
                )}
              >
                <div className={cn(
                  "p-2 rounded-lg h-fit",
                  msg.role === 'user' ? "bg-blue-500/20" : "bg-purple-500/20"
                )}>
                  {msg.role === 'user' ? <User size={16} className="text-blue-400" /> : <Bot size={16} className="text-purple-400" />}
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  msg.role === 'user' 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-white/5 border border-white/10 text-white/90 rounded-tl-none"
                )}>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <ReactMarkdown>
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="p-2 bg-purple-500/20 rounded-lg h-fit">
                  <Bot size={16} className="text-purple-400" />
                </div>
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 rounded-tl-none flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin text-purple-400" />
                  <span className="text-xs text-white/50">L'IA réfléchit...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-6 border-t border-white/10">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Posez une question à LifeOS..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 text-sm focus:outline-none focus:border-purple-500/50 transition-all"
              />
              <button
                onClick={handleSend}
                disabled={isLoading}
                className="absolute right-2 top-2 p-2 bg-purple-600 rounded-xl hover:bg-purple-500 transition-all disabled:opacity-50"
              >
                <Send size={20} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
