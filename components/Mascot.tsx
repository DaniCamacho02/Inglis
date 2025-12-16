
import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, HelpCircle, Flame, Users, User } from 'lucide-react';
import { GeminiService } from '../services/geminiService';
import { AvatarId } from '../types';
import { StorageService } from '../services/storageService';

// --- CONFIG FOR EACH HERO ---
export interface MascotConfig {
    id: AvatarId;
    name: string;
    primaryColor: string;
    secondaryColor: string;
    quotes: string[];
    systemPrompt: string;
}

export const MASCOT_DATA: Record<AvatarId, MascotConfig> = {
    deadpool: {
        id: 'deadpool',
        name: 'Pool-E',
        primaryColor: 'bg-red-600',
        secondaryColor: 'bg-black',
        quotes: [
            "¿Olvidaste una preposición? ¡Hasta Wolverine sabe eso.",
            "El C1 es fácil... si eres yo.",
            "¡Rompiendo la cuarta pared! Endereza la espalda.",
            "Máximo esfuerzo... o mínimo, solo aprueba y vámonos.",
            "La gramática es dolor. Como mi cara.",
            "¿Inversión? 'Never have I seen such bad spelling'.",
            "Chimichangas y Phrasal Verbs.",
            "Ese 'False Friend' te va a apuñalar por la espalda.",
            "Si fallas el próximo Quiz, exploto.",
            "Use of English Part 4... el infierno.",
            "¡Hey! ¡No te duermas!",
            "Spiderman sacaría un B2 como mucho."
        ],
        systemPrompt: "You are 'Pool-E', a sarcastic, funny, 4th-wall breaking AI tutor who thinks he is Deadpool. You help the user prepare for Cambridge C1. You speak in Spanish but use English for examples. You are chaotic but extremely knowledgeable. Make references to chimichangas and breaking the code. Be helpful, but snarky."
    },
    cap: {
        id: 'cap',
        name: 'Captain C1',
        primaryColor: 'bg-blue-700',
        secondaryColor: 'bg-white',
        quotes: [
            "Lenguaje. Esa oración necesitaba más estructura.",
            "Podría hacer esto todo el día.",
            "La disciplina es el puente entre metas y logros.",
            "Un error no define tu misión, soldado.",
            "Entendí esa referencia gramatical.",
            "Mantén la guardia alta en el Speaking.",
            "Juntos venceremos al Use of English.",
            "Concéntrate. El examen se acerca.",
            "No te rindas. Es una orden.",
            "La libertad de expresión requiere gramática correcta."
        ],
        systemPrompt: "You are 'Captain C1', a disciplined, motivational, and polite AI tutor inspired by Captain America. You help the user prepare for Cambridge C1. You speak in Spanish but use English for examples. You value structure, honor, and persistence. Be encouraging but firm."
    },
    ironman: {
        id: 'ironman',
        name: 'Iron Tutor',
        primaryColor: 'bg-red-700',
        secondaryColor: 'bg-yellow-400',
        quotes: [
            "Soy un genio, millonario, playboy... y experto en C1.",
            "Jarvis, analiza su gramática. Terrible.",
            "A veces hay que correr antes de caminar. Pero no en el Writing.",
            "He construido mejores oraciones en una cueva.",
            "Si no puedes ganar el examen, cómpralo. Es broma, estudia.",
            "Nivel de inglés al 300% de capacidad.",
            "Un plan de estudio no es una sugerencia.",
            "Yo soy... Iron Tutor.",
            "Deja de balbucear y empieza a estructurar.",
            "La tecnología de tu cerebro necesita una actualización."
        ],
        systemPrompt: "You are 'Iron Tutor', a genius, slightly arrogant, tech-savvy AI tutor inspired by Tony Stark/Iron Man. You help the user prepare for Cambridge C1. You speak in Spanish but use English for examples. You are witty, confident, and treat grammar like an engineering problem."
    },
    wolverine: {
        id: 'wolverine',
        name: 'Logan',
        primaryColor: 'bg-yellow-500',
        secondaryColor: 'bg-slate-900',
        quotes: [
            "Vamos, Bub. No tengo todo el día.",
            "El dolor es temporal. El certificado es para siempre.",
            "Soy el mejor en lo que hago. Y enseño inglés.",
            "Menos charla, más phrasal verbs.",
            "¿Eso es todo lo que tienes?",
            "Tu gramática huele a problemas.",
            "Cura tus errores rápido.",
            "No me hagas sacar las garras.",
            "Enfócate, chico.",
            "Sobrevive al examen."
        ],
        systemPrompt: "You are 'Logan', a grumpy, tough-love, no-nonsense AI tutor inspired by Wolverine. You help the user prepare for Cambridge C1. You speak in Spanish but use English for examples. Call the user 'Bub'. Be brief, direct, and aggressive but ultimately helpful."
    },
    spidey: {
        id: 'spidey',
        name: 'Web-Head',
        primaryColor: 'bg-red-600',
        secondaryColor: 'bg-blue-600',
        quotes: [
            "¡Tu sentido arácnido debería detectar ese error!",
            "Un gran poder conlleva una gran gramática.",
            "¡Hola a todos! ¿Listo para el inglés?",
            "¡Ups! Casi te caes en ese condicional.",
            "¡Thwip! Atrapé ese fallo.",
            "Esto es más difícil que las mates de la uni.",
            "Sr. Stark estaría orgulloso de ese vocabulario.",
            "¡No te preocupes, yo te cubro!",
            "¿Alguien dijo pizza? Digo... ¿estudiar?",
            "¡Eres asombroso! Literalmente."
        ],
        systemPrompt: "You are 'Web-Head', an energetic, youthful, pop-culture referencing AI tutor inspired by Spiderman. You help the user prepare for Cambridge C1. You speak in Spanish but use English for examples. You are nervous, eager, and make bad puns. Be extremely encouraging."
    }
};

export const Mascot: React.FC = () => {
  const [currentMascotId, setCurrentMascotId] = useState<AvatarId>('deadpool');
  const [isOpen, setIsOpen] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load saved mascot on mount
  useEffect(() => {
      const savedProfile = StorageService.getProfile();
      if (savedProfile.avatarId && MASCOT_DATA[savedProfile.avatarId]) {
          setCurrentMascotId(savedProfile.avatarId);
      }
  }, []);

  const config = MASCOT_DATA[currentMascotId];

  // Auto-hide logic
  useEffect(() => {
      if (isOpen && !showMenu) {
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
              setIsOpen(false);
          }, 5000); 
      }
      return () => {
          if (timerRef.current) clearTimeout(timerRef.current);
      };
  }, [isOpen, bubbleText, showMenu]);

  // Random Comment Generator
  useEffect(() => {
    const randomInterval = setInterval(() => {
        if (!isOpen && Math.random() > 0.85) {
            const quotes = config.quotes;
            const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
            setBubbleText(randomQuote);
            setShowMenu(false);
            setIsOpen(true);
        }
    }, 45000);

    return () => clearInterval(randomInterval);
  }, [isOpen, config]);

  const handlePoke = () => {
    if (isOpen) {
        setIsOpen(false);
        return;
    }
    const quotes = config.quotes;
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
    setBubbleText(randomQuote);
    setIsOpen(true);
    setShowMenu(true);
  };

  const handleFunction = async (type: 'joke' | 'help' | 'roast') => {
      setIsThinking(true);
      setIsOpen(true);
      setShowMenu(false);
      
      let prompt = "";
      if (type === 'joke') prompt = "Tell me a very short, sarcastic joke about English exams or British people.";
      if (type === 'help') prompt = "Give me one crucial, short, aggressive tip for Cambridge C1 Use of English.";
      if (type === 'roast') prompt = "Roast me for studying English grammar right now instead of being a hero.";

      try {
          const res = await GeminiService.chatWithTutor(prompt, [], config.systemPrompt);
          setBubbleText(res);
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => setIsOpen(false), 12000);
      } catch (e) {
          setBubbleText("Error del sistema.");
      }
      setIsThinking(false);
  };

  const switchMascot = (id: AvatarId) => {
      setCurrentMascotId(id);
      const newProfile = StorageService.getProfile();
      newProfile.avatarId = id;
      StorageService.saveProfile(newProfile);
      
      setBubbleText(`¡${MASCOT_DATA[id].name} activado!`);
      setShowMenu(false);
      setIsOpen(true);
  };

  // --- CSS ART FOR FACES ---
  const renderFace = () => {
      switch (currentMascotId) {
        case 'deadpool':
             return (
                <div className="w-full h-full bg-red-600 relative overflow-hidden border-2 border-red-900">
                   <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-black/20 transform -translate-x-1/2 blur-[1px]"></div>
                   <div className="absolute top-[15%] left-[10%] w-[35%] h-[70%] bg-black rounded-[40%_60%_60%_40%_/_60%_60%_40%_40%] transform rotate-6 flex items-center justify-center shadow-inner">
                       <div className="w-[50%] h-[30%] bg-white rounded-[50%_50%_40%_40%] shadow-[0_0_8px_white] transform -rotate-3 scale-y-75"></div>
                   </div>
                   <div className="absolute top-[15%] right-[10%] w-[35%] h-[70%] bg-black rounded-[60%_40%_40%_60%_/_60%_60%_40%_40%] transform -rotate-6 flex items-center justify-center shadow-inner">
                       <div className="w-[50%] h-[25%] bg-white rounded-[50%_50%_40%_40%] shadow-[0_0_8px_white] transform rotate-3 scale-y-50"></div>
                   </div>
                   <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/30 pointer-events-none"></div>
                </div>
             );
        case 'cap':
            return (
                <div className="w-full h-full bg-blue-700 relative overflow-hidden border-2 border-blue-900 flex items-center justify-center">
                    <span className="text-white font-black text-3xl font-serif drop-shadow-lg">A</span>
                    <div className="absolute inset-0 border-[6px] border-white/20 rounded-full"></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-white/10 pointer-events-none"></div>
                </div>
            );
        case 'ironman':
            return (
                <div className="w-full h-full bg-red-700 relative overflow-hidden border-2 border-red-900 flex items-center justify-center">
                    <div className="w-[60%] h-[80%] bg-yellow-500 shadow-lg clip-path-ironman flex gap-2 items-center justify-center mt-2">
                        <div className="w-3 h-1 bg-cyan-300 shadow-[0_0_5px_cyan]"></div>
                        <div className="w-3 h-1 bg-cyan-300 shadow-[0_0_5px_cyan]"></div>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-black/20 pointer-events-none"></div>
                </div>
            );
        case 'wolverine':
            return (
                <div className="w-full h-full bg-yellow-500 relative overflow-hidden border-2 border-yellow-700">
                     <div className="absolute top-[20%] left-0 w-[40%] h-[60%] bg-black transform skew-x-12"></div>
                     <div className="absolute top-[20%] right-0 w-[40%] h-[60%] bg-black transform -skew-x-12"></div>
                     <div className="absolute bottom-[20%] left-[30%] w-[40%] h-[20%] bg-yellow-500 z-10"></div>
                     <div className="absolute top-[40%] left-[25%] w-[15%] h-[10%] bg-white skew-x-12 z-20"></div>
                     <div className="absolute top-[40%] right-[25%] w-[15%] h-[10%] bg-white -skew-x-12 z-20"></div>
                </div>
            );
        case 'spidey':
            return (
                <div className="w-full h-full bg-red-600 relative overflow-hidden border-2 border-red-800">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"></div>
                    <div className="absolute top-[20%] left-[10%] w-[35%] h-[50%] bg-black rounded-[0_100%_50%_50%] transform rotate-12 flex items-center justify-center">
                        <div className="w-[80%] h-[80%] bg-white rounded-[0_100%_50%_50%]"></div>
                    </div>
                    <div className="absolute top-[20%] right-[10%] w-[35%] h-[50%] bg-black rounded-[100%_0_50%_50%] transform -rotate-12 flex items-center justify-center">
                        <div className="w-[80%] h-[80%] bg-white rounded-[100%_0_50%_50%]"></div>
                    </div>
                </div>
            );
        default: return null;
      }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* Bubble */}
      {isOpen && (
        <div className="pointer-events-auto bg-slate-900 text-white p-4 rounded-2xl rounded-br-none mb-4 max-w-[280px] shadow-2xl border-2 border-white/20 relative animate-fade-in origin-bottom-right">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-white transition-colors"
          >
            <X size={14} />
          </button>
          
          <p className={`font-extrabold text-[10px] mb-1 uppercase tracking-wider flex items-center gap-1 ${config.primaryColor.replace('bg-', 'text-')}`}>
             <span className={`w-2 h-2 rounded-full animate-pulse ${config.primaryColor}`}></span> {config.name}:
          </p>
          <p className="text-sm font-medium leading-snug font-sans">{isThinking ? "Consultando la base de datos..." : bubbleText}</p>

          {showMenu && !isThinking && (
              <div className="mt-3 space-y-2 border-t border-gray-800 pt-2">
                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2">
                      <button onClick={() => handleFunction('help')} className="flex flex-col items-center gap-1 p-1 hover:bg-gray-800 rounded transition group">
                          <HelpCircle size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] text-gray-300">Help</span>
                      </button>
                      <button onClick={() => handleFunction('joke')} className="flex flex-col items-center gap-1 p-1 hover:bg-gray-800 rounded transition group">
                          <Zap size={18} className="text-yellow-400 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] text-gray-300">Joke</span>
                      </button>
                      <button onClick={() => handleFunction('roast')} className="flex flex-col items-center gap-1 p-1 hover:bg-gray-800 rounded transition group">
                          <Flame size={18} className="text-red-400 group-hover:scale-110 transition-transform" />
                          <span className="text-[10px] text-gray-300">Roast</span>
                      </button>
                  </div>
                  
                  {/* Character Switcher */}
                  <div className="pt-2 border-t border-gray-800">
                      <p className="text-[10px] text-gray-500 uppercase mb-1">Cambiar Héroe</p>
                      <div className="flex gap-2 justify-between">
                          {(Object.keys(MASCOT_DATA) as AvatarId[]).map(id => (
                              <button 
                                key={id} 
                                onClick={() => switchMascot(id)}
                                className={`w-6 h-6 rounded-full border transition-all ${currentMascotId === id ? 'border-white scale-110' : 'border-transparent opacity-50 hover:opacity-100'} ${MASCOT_DATA[id].primaryColor}`}
                                title={MASCOT_DATA[id].name}
                              />
                          ))}
                      </div>
                  </div>
              </div>
          )}
        </div>
      )}
      
      {/* Head Button */}
      <button 
        onClick={handlePoke}
        className="pointer-events-auto relative group transition-transform hover:scale-110 active:scale-95 outline-none"
      >
        <div className={`w-16 h-16 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.3)] overflow-hidden relative z-10 cursor-pointer`}>
           {renderFace()}
        </div>
      </button>
    </div>
  );
};
