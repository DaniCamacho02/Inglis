import React, { useState, useEffect, useRef } from 'react';
import { X, Zap, HelpCircle, Flame } from 'lucide-react';
import { GeminiService } from '../services/geminiService';

const QUOTES = [
  "¿Olvidaste una preposición? ¡Qué vergüenza! Hasta Wolverine sabe eso.",
  "El C1 es fácil... si eres yo. Si eres tú, suerte.",
  "¡Rompiendo la cuarta pared! Oye tú, el de la pantalla, endereza la espalda.",
  "Máximo esfuerzo... o mínimo, solo aprueba y vámonos por tacos.",
  "La gramática es dolor. Como mi cara, pero en papel.",
  "¿Inversión? ¡Úsala más! 'Never have I seen such bad spelling'.",
  "Chimichangas y Phrasal Verbs. Desayuno de campeones.",
  "¿Sabías que el inglés roba vocabulario de otros idiomas? Es un cleptómano lingüístico.",
  "Ese 'False Friend' te va a apuñalar por la espalda. Como mi ex.",
  "Si fallas el próximo Quiz, exploto. Literalmente. Tengo explosivos.",
  "¿Estás estudiando o solo mirando mi hermosa calva pixelada?",
  "Me pagan por palabra. Mentira, no me pagan. ¡Ayuda!",
  "Use of English Part 4... el infierno tiene una suite reservada para quien inventó eso.",
  "¡Hey! ¡No te duermas! Veo tus párpados pesados.",
  "Spiderman sacaría un B2 como mucho. Tú puedes hacerlo mejor.",
  "Esa 'comma splice' me ha dolido físicamente."
];

export const Mascot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-hide logic
  useEffect(() => {
      if (isOpen && !showMenu) {
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => {
              setIsOpen(false);
          }, 5000); // 5 seconds for random quotes
      }
      return () => {
          if (timerRef.current) clearTimeout(timerRef.current);
      };
  }, [isOpen, bubbleText, showMenu]);

  // Random "Bizarre" Comment Generator
  useEffect(() => {
    const randomInterval = setInterval(() => {
        // 20% chance every 30 seconds to say something if not already open
        if (!isOpen && Math.random() > 0.8) {
            const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
            setBubbleText(randomQuote);
            setShowMenu(false);
            setIsOpen(true);
        }
    }, 30000);

    return () => clearInterval(randomInterval);
  }, [isOpen]);

  const handlePoke = () => {
    // Force a quote interaction
    if (isOpen) {
        setIsOpen(false);
        return;
    }
    const randomQuote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
    setBubbleText(randomQuote);
    setIsOpen(true);
    setShowMenu(true);
  };

  const handleFunction = async (type: 'joke' | 'help' | 'roast') => {
      setIsThinking(true);
      setIsOpen(true);
      setShowMenu(false);
      
      let prompt = "";
      if (type === 'joke') prompt = "Tell me a very short, dark, sarcastic joke about English exams or British people.";
      if (type === 'help') prompt = "Give me one crucial, short, aggressive tip for Cambridge C1 Use of English.";
      if (type === 'roast') prompt = "Roast me for studying English grammar right now instead of saving the world. Be funny and reference Deadpool movies.";

      try {
          const res = await GeminiService.chatWithTutor(prompt, []);
          setBubbleText(res);
          // Keep open a bit longer for AI responses
          if (timerRef.current) clearTimeout(timerRef.current);
          timerRef.current = setTimeout(() => setIsOpen(false), 12000);
      } catch (e) {
          setBubbleText("Error del sistema. Culpa al guionista (o al servidor).");
      }
      setIsThinking(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
      {/* The bubble container needs pointer-events-auto to be clickable/closeable */}
      {isOpen && (
        <div className="pointer-events-auto bg-slate-900 text-white p-4 rounded-2xl rounded-br-none mb-4 max-w-[280px] shadow-2xl border-2 border-red-600 relative animate-fade-in origin-bottom-right">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-red-500 transition-colors"
          >
            <X size={14} />
          </button>
          
          <p className="font-extrabold text-[10px] mb-1 text-red-500 uppercase tracking-wider flex items-center gap-1">
             <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> Pool-E dice:
          </p>
          <p className="text-sm font-medium leading-snug font-sans">{isThinking ? "Afilando las katanas..." : bubbleText}</p>

          {showMenu && !isThinking && (
              <div className="mt-3 grid grid-cols-3 gap-2 border-t border-gray-800 pt-2">
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
          )}
        </div>
      )}
      
      {/* The head button */}
      <button 
        onClick={handlePoke}
        className="pointer-events-auto relative group transition-transform hover:scale-110 active:scale-95 outline-none"
      >
        {/* DEADPOOL FACE CSS ART */}
        <div className="w-16 h-16 rounded-full bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.6)] overflow-hidden relative border-2 border-red-900 z-10 cursor-pointer">
           
           {/* Center Line (Subtle) */}
           <div className="absolute top-0 bottom-0 left-1/2 w-[2px] bg-black/20 transform -translate-x-1/2 blur-[1px]"></div>
           
           {/* Left Eye Patch */}
           <div className="absolute top-[15%] left-[10%] w-[35%] h-[70%] bg-black rounded-[40%_60%_60%_40%_/_60%_60%_40%_40%] transform rotate-6 flex items-center justify-center shadow-inner">
              {/* Left Eye (White) */}
               <div className="w-[50%] h-[30%] bg-white rounded-[50%_50%_40%_40%] shadow-[0_0_8px_white] transform -rotate-3 scale-y-75 group-hover:scale-y-100 transition-transform"></div>
           </div>

           {/* Right Eye Patch */}
           <div className="absolute top-[15%] right-[10%] w-[35%] h-[70%] bg-black rounded-[60%_40%_40%_60%_/_60%_60%_40%_40%] transform -rotate-6 flex items-center justify-center shadow-inner">
               {/* Right Eye (White - Squinting slightly) */}
               <div className="w-[50%] h-[25%] bg-white rounded-[50%_50%_40%_40%] shadow-[0_0_8px_white] transform rotate-3 scale-y-50 group-hover:scale-y-90 transition-transform"></div>
           </div>

           {/* Texture Overlay */}
           <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-black/30 pointer-events-none rounded-full"></div>
        </div>
      </button>
    </div>
  );
};