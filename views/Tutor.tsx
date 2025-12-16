
import React, { useState, useEffect, useRef } from 'react';
import { GeminiService } from '../services/geminiService';
import { ChatMessage, AvatarId } from '../types';
import { Send, Anchor } from 'lucide-react';
import { StorageService } from '../services/storageService';
import { MASCOT_DATA } from '../components/Mascot';

export const Tutor: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Initialize with correct mascot greeting
  useEffect(() => {
      const profile = StorageService.getProfile();
      // Fallback to deadpool if avatarId is invalid to prevent crash
      const mascotId = profile.avatarId || 'deadpool';
      const mascot = MASCOT_DATA[mascotId] || MASCOT_DATA['deadpool'];
      const language = profile.targetLanguage || 'English';
      
      setMessages([
          { 
              role: 'model', 
              text: `Hello! I'm ${mascot.name}. I'm ready to help you with your ${language}. ${mascot.quotes[0]}`, 
              timestamp: Date.now() 
          }
      ]);
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    
    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    // Get current persona with safety check
    const profile = StorageService.getProfile();
    const mascotId = profile.avatarId || 'deadpool';
    const config = MASCOT_DATA[mascotId] || MASCOT_DATA['deadpool'];
    const persona = config.systemPrompt;
    const language = profile.targetLanguage || 'English';

    const responseText = await GeminiService.chatWithTutor(input, history, persona, language);
    
    setMessages(prev => [...prev, { role: 'model', text: responseText, timestamp: Date.now() }]);
    setTyping(false);
  };

  const getMascotColor = () => {
      const profile = StorageService.getProfile();
      const mascotId = profile.avatarId || 'deadpool';
      const config = MASCOT_DATA[mascotId] || MASCOT_DATA['deadpool'];
      return config.primaryColor;
  }

  return (
    <div className="flex flex-col h-[calc(100vh-250px)] bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-lg">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50">
            {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {msg.role === 'model' && (
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-2 border text-white font-bold text-xs shrink-0 ${getMascotColor()}`}>
                            T
                        </div>
                    )}
                    <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed
                        ${msg.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-white text-slate-700 border border-slate-200 rounded-bl-none'
                        }`}
                    >
                        {msg.text}
                    </div>
                </div>
            ))}
            {typing && <div className="text-slate-400 text-xs animate-pulse ml-12">AI is thinking...</div>}
            <div ref={endRef} />
        </div>

        <div className="p-4 bg-white border-t border-slate-100 flex items-center gap-3">
            <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Pregunta sobre gramática, vocabulario..."
                className="flex-1 bg-slate-50 text-slate-800 px-4 py-3 rounded-full border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
            />
            <button 
                onClick={sendMessage}
                className="p-3 bg-blue-600 hover:bg-blue-500 rounded-full text-white transition-colors shadow-lg shadow-blue-200"
            >
                <Send size={20} />
            </button>
        </div>
    </div>
  );
};