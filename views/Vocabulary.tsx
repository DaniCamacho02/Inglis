
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { StorageService } from '../services/storageService';
import { VocabCard, QuizQuestion } from '../types';
import { Volume2, Loader2, RefreshCw, Heart, Brain, BookOpen, Zap, Layers, AlertTriangle, ArrowRight, Trophy } from 'lucide-react';

const MODES = [
    { id: 'Topic', label: 'Por Tema', icon: BookOpen },
    { id: 'Idioms', label: 'Idioms', icon: Zap },
    { id: 'Collocations', label: 'Collocations', icon: Layers },
    { id: 'False Friends', label: 'False Friends', icon: AlertTriangle },
];

const TOPIC_PRESETS = [
    { id: "Environment", label: "Environment", img: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80" },
    { id: "Technology", label: "Technology", img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80" },
    { id: "Social Issues", label: "Social Issues", img: "https://images.unsplash.com/photo-1573164713988-8665fc963095?auto=format&fit=crop&w=400&q=80" },
    { id: "Work & Business", label: "Business", img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80" },
    { id: "Health", label: "Health", img: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=400&q=80" },
    { id: "Culture", label: "Culture", img: "https://images.unsplash.com/photo-1460723237483-7a6dc9d0b212?auto=format&fit=crop&w=400&q=80" },
    { id: "Education", label: "Education", img: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80" },
    { id: "Arts", label: "The Arts", img: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=400&q=80" },
    { id: "Crime", label: "Crime & Law", img: "https://images.unsplash.com/photo-1453873531674-2151bcd01707?auto=format&fit=crop&w=400&q=80" },
    { id: "Science", label: "Science", img: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=400&q=80" },
    { id: "Relationships", label: "Relationships", img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=400&q=80" },
    { id: "Abstract", label: "Abstract Concepts", img: "https://images.unsplash.com/photo-1501619593928-a2a971c260c6?auto=format&fit=crop&w=400&q=80" }
];

export const Vocabulary: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState('Topic');
  const [activity, setActivity] = useState<'STUDY' | 'QUIZ'>('STUDY');
  
  const [cards, setCards] = useState<VocabCard[]>([]);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);

  const profile = StorageService.getProfile();
  const level = profile.level || 'C1';
  const language = profile.targetLanguage || 'English';

  const generateContent = async (overrideTopic?: string) => {
    const finalTopic = overrideTopic || topic;
    if (!finalTopic) { alert("Tema requerido."); return; }
    if (overrideTopic) setTopic(overrideTopic);

    setLoading(true);
    setSavedIds(new Set());
    
    try {
        const parsedTopic = GeminiService.cleanJSON(finalTopic); // Clean input just in case

        if (activity === 'STUDY') {
            const rawData = await GeminiService.generateVocabulary(parsedTopic, mode, level, language);
            if(rawData && Array.isArray(rawData)) {
                const newCards = rawData.map((item: any, idx: number) => ({
                    ...item,
                    id: `${Date.now()}-${idx}`,
                    mastered: false
                }));
                setCards(newCards);
                setFlipped({});
            } else {
                alert("La IA no devolvió resultados válidos.");
            }
        } else {
            setQuizQuestions([]);
            setQuizIdx(0);
            setQuizScore(0);
            setQuizFinished(false);
            setSelectedOpt(null);
            const questions = await GeminiService.generateVocabQuiz(parsedTopic, level, language);
            if(questions && questions.length > 0) {
                 setQuizQuestions(questions);
            } else {
                alert("Error generando Quiz.");
            }
        }
    } catch (e) {
        alert(`Error al generar: ${e}`);
    } finally {
        setLoading(false);
    }
  };

  const toggleFlip = (id: string) => setFlipped(prev => ({ ...prev, [id]: !prev[id] }));
  
  const speak = (text: string, e: React.MouseEvent) => { 
      e.stopPropagation(); 
      window.speechSynthesis.cancel(); // Clear queue for faster response
      const msg = new SpeechSynthesisUtterance(text); 
      
      // Strict BCP 47 Language Codes for Pronunciation
      const langMap: Record<string, string> = {
          'English': 'en-GB', // British English for Cambridge
          'Spanish': 'es-ES',
          'French': 'fr-FR',
          'Italian': 'it-IT'
      };
      
      msg.lang = langMap[language] || 'en-GB';
      window.speechSynthesis.speak(msg); 
  };

  const saveCard = (card: VocabCard, e: React.MouseEvent) => { e.stopPropagation(); StorageService.saveVocab(card); setSavedIds(prev => new Set(prev).add(card.id)); };

  const handleAnswer = (idx: number) => {
      if (selectedOpt !== null) return;
      setSelectedOpt(idx);
      const q = quizQuestions[quizIdx];
      if (idx === q.correctIndex) {
          setQuizScore(s => s + 1);
          StorageService.addXP(15);
      }
      setTimeout(() => {
          if (quizIdx < quizQuestions.length - 1) {
              setQuizIdx(prev => prev + 1);
              setSelectedOpt(null);
          } else {
              setQuizFinished(true);
          }
      }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-lg border border-indigo-100">
              <span className="text-xs font-bold text-indigo-500 uppercase">Nivel Activo</span>
              <span className="font-black text-indigo-700">{level} - {language}</span>
          </div>

          <div className="flex flex-wrap gap-6">
              <div className="flex-1 min-w-[200px]">
                  <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                      {MODES.map(m => (
                          <button key={m.id} onClick={() => setMode(m.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold border whitespace-nowrap ${mode === m.id ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : 'bg-white text-slate-500'}`}>
                              <m.icon size={16} /> {m.label}
                          </button>
                      ))}
                  </div>
                  <div className="flex gap-2">
                       <button onClick={() => setActivity('STUDY')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border ${activity === 'STUDY' ? 'bg-white border-indigo-500 text-indigo-600' : 'bg-slate-50 border-transparent'}`}><BookOpen size={16} /> Estudio</button>
                       <button onClick={() => setActivity('QUIZ')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border ${activity === 'QUIZ' ? 'bg-white border-teal-500 text-teal-600' : 'bg-slate-50 border-transparent'}`}><Brain size={16} /> Quiz</button>
                   </div>
              </div>
          </div>

          <div className="flex flex-col gap-4">
              <div className="flex gap-4">
                <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={`Escribe un tema en ${language}...`} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500" />
                <button onClick={() => generateContent()} disabled={loading} className="px-6 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-500 transition-colors">
                    {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />} Generar
                </button>
              </div>

              {/* Visual Preset Topics */}
              <div className="pt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-4">Galería de Temas Frecuentes</span>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {TOPIC_PRESETS.map(t => (
                        <button 
                            key={t.id} 
                            onClick={() => generateContent(t.id)}
                            disabled={loading}
                            className="group relative h-24 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-200"
                        >
                            <img src={t.img} alt={t.label} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
                            <span className="absolute bottom-2 left-2 text-white font-bold text-xs shadow-black drop-shadow-md">
                                {t.label}
                            </span>
                        </button>
                    ))}
                  </div>
              </div>
          </div>
      </div>

      {activity === 'STUDY' && cards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div key={card.id} onClick={() => toggleFlip(card.id)} className="group h-80 perspective-1000 cursor-pointer">
              <div className={`relative w-full h-full duration-700 transform-style-3d transition-transform ${flipped[card.id] ? 'rotate-y-180' : ''}`}>
                {/* FRONT */}
                <div className="absolute w-full h-full backface-hidden bg-white border-2 border-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md transition-shadow">
                  <span className="absolute top-4 right-4 bg-indigo-100 text-indigo-700 text-[10px] font-bold px-2 py-1 rounded-full">{mode}</span>
                  <h3 className="text-3xl font-black text-slate-800 text-center tracking-tight leading-none">{card.word}</h3>
                  <div className="mt-6 flex gap-2">
                       <button onClick={(e) => speak(card.word, e)} className="p-3 rounded-full bg-slate-100 hover:bg-indigo-100 text-slate-400 hover:text-indigo-600 transition-colors"><Volume2 size={24} /></button>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-8 font-medium uppercase tracking-widest flex items-center gap-1">
                      Ver Significado <ArrowRight size={12} />
                  </p>
                </div>

                {/* BACK */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-slate-900 rounded-2xl p-6 flex flex-col shadow-xl text-white overflow-y-auto relative border border-slate-700">
                    <button onClick={(e) => saveCard(card, e)} disabled={savedIds.has(card.id)} className={`absolute top-4 right-4 text-pink-500 hover:scale-110 transition-transform ${savedIds.has(card.id) ? 'opacity-50' : ''}`}>
                        <Heart fill={savedIds.has(card.id) ? "currentColor" : "none"} size={20} />
                    </button>

                    <div className="flex-1 flex flex-col justify-center space-y-4">
                        {/* 1. Translation ES */}
                        <div className="text-center pb-3 border-b border-slate-700">
                            <h4 className="text-2xl font-black text-indigo-400 leading-tight">{card.translationES}</h4>
                        </div>

                        {/* 2. Definition ES (UPDATED) */}
                        <div className="text-center">
                            <p className="text-sm font-medium text-slate-200 leading-snug">{card.definitionES}</p>
                        </div>

                        {/* 3. Example EN */}
                        <div className="bg-slate-800 p-3 rounded-lg border-l-4 border-indigo-500">
                             <p className="text-xs text-indigo-200 italic font-serif">"{card.exampleEN}"</p>
                        </div>
                    </div>

                    {/* 4. Synonyms */}
                    <div className="mt-4 pt-3 border-t border-slate-700">
                        <div className="flex flex-wrap gap-1 justify-center">
                            {card.synonyms?.slice(0, 3).map(syn => (
                                <span key={syn} className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded text-[10px] font-bold border border-slate-600">
                                    {syn}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activity === 'QUIZ' && quizQuestions.length > 0 && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
             {!quizFinished ? (
                 <>
                    <div className="mb-4 flex justify-between text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <span>Pregunta {quizIdx + 1} de {quizQuestions.length}</span>
                        <span>Score: {quizScore}</span>
                    </div>
                    <h3 className="text-xl font-bold mb-6 text-slate-800">{quizQuestions[quizIdx]?.question}</h3>
                    <div className="space-y-3">
                        {quizQuestions[quizIdx]?.options?.map((opt, i) => (
                            <button key={i} onClick={() => handleAnswer(i)} disabled={selectedOpt !== null} className={`w-full text-left p-4 rounded-xl border transition-all ${selectedOpt === null ? 'border-slate-200 hover:bg-slate-50' : i === quizQuestions[quizIdx].correctIndex ? 'bg-green-100 border-green-500 text-green-800 font-bold' : selectedOpt === i ? 'bg-red-50 border-red-500 text-red-800' : 'border-slate-200 opacity-50'}`}>
                                {opt}
                            </button>
                        ))}
                    </div>
                    {selectedOpt !== null && (
                        <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-sm rounded-lg animate-fade-in border border-blue-100">
                            <strong>Explicación:</strong> {quizQuestions[quizIdx].explanation}
                        </div>
                    )}
                 </>
             ) : (
                 <div className="text-center py-8">
                     <Trophy className="mx-auto text-yellow-500 mb-4" size={48} />
                     <h2 className="text-3xl font-bold mb-2 text-slate-900">Quiz Finalizado</h2>
                     <p className="text-xl mb-8 text-slate-600">Tu puntuación: <span className="font-black text-indigo-600">{quizScore}/{quizQuestions.length}</span></p>
                     <button onClick={() => generateContent()} className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all">
                        Generar Nuevo Quiz
                     </button>
                 </div>
             )}
          </div>
      )}
    </div>
  );
};
