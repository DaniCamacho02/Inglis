import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { StorageService } from '../services/storageService';
import { VocabCard, QuizQuestion } from '../types';
import { Search, Volume2, Loader2, RefreshCw, Heart, Brain, BookOpen, Zap, Layers, GraduationCap, AlertTriangle, CheckCircle, Sparkles, Globe, Briefcase, Smile } from 'lucide-react';

const MODES = [
    { id: 'Topic', label: 'Por Tema', icon: BookOpen },
    { id: 'Idioms', label: 'Idioms', icon: Zap },
    { id: 'Collocations', label: 'Collocations', icon: Layers },
    { id: 'False Friends', label: 'False Friends', icon: AlertTriangle },
];

const PRESET_CATEGORIES = {
    "Sociedad y Global": [
        "Environment & Sustainability", "Crime & Punishment", "Globalization", "Media & Advertising", "Healthcare Systems", "Urban Living"
    ],
    "Conceptos Abstractos (C1+)": [
        "Success & Failure", "Truth & Lies", "Memory & Nostalgia", "Time Management", "Risk & Adventure", "Creativity"
    ],
    "Trabajo y Tecnología": [
        "Remote Work", "Artificial Intelligence", "Startups & Business", "Cybersecurity", "Work-Life Balance"
    ],
    "Estilo de Vida": [
        "Travel & Tourism", "Food & Nutrition", "Fashion & Trends", "Sports & Psychology", "Arts & Culture"
    ]
};

export const Vocabulary: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState('Topic');
  const [activity, setActivity] = useState<'STUDY' | 'QUIZ'>('STUDY');
  const [difficulty, setDifficulty] = useState('Standard C1');
  
  // Study State
  const [cards, setCards] = useState<VocabCard[]>([]);
  const [flipped, setFlipped] = useState<Record<string, boolean>>({});
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  // Quiz State
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);

  const generateContent = async (overrideTopic?: string) => {
    const finalTopic = overrideTopic || topic;
    if (!finalTopic) {
        alert("Por favor, selecciona un tema o escribe uno.");
        return;
    }
    // If user clicks a preset, update input
    if (overrideTopic) setTopic(overrideTopic);

    setLoading(true);
    setSavedIds(new Set());
    
    if (activity === 'STUDY') {
        try {
            const rawData = await GeminiService.generateVocabulary(finalTopic, mode);
            const newCards = rawData.map((item: any, idx: number) => ({
                ...item,
                id: `${Date.now()}-${idx}`,
                mastered: false
            }));
            setCards(newCards);
            setFlipped({});
        } catch (e) {
            alert("Error generating vocabulary.");
        }
    } else {
        // Generate Quiz
        setQuizQuestions([]);
        setQuizIdx(0);
        setQuizScore(0);
        setQuizFinished(false);
        setSelectedOpt(null);
        try {
            const questions = await GeminiService.generateVocabQuiz(finalTopic, difficulty);
            setQuizQuestions(questions);
        } catch (e) {
            alert("Error generating quiz.");
        }
    }

    setLoading(false);
  };

  const toggleFlip = (id: string) => {
    setFlipped(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const speak = (text: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const msg = new SpeechSynthesisUtterance(text);
    msg.lang = 'en-GB'; 
    window.speechSynthesis.speak(msg);
  };

  const saveCard = (card: VocabCard, e: React.MouseEvent) => {
    e.stopPropagation();
    StorageService.saveVocab(card);
    setSavedIds(prev => new Set(prev).add(card.id));
  };

  // Quiz Handlers
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

  const getCategoryIcon = (cat: string) => {
      if (cat.includes("Sociedad")) return <Globe size={16} className="text-blue-500"/>;
      if (cat.includes("Abstractos")) return <Sparkles size={16} className="text-purple-500"/>;
      if (cat.includes("Trabajo")) return <Briefcase size={16} className="text-slate-500"/>;
      return <Smile size={16} className="text-orange-500"/>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Controls Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          {/* Top Row: Mode Selection */}
          <div className="flex flex-wrap gap-6 border-b border-slate-100 pb-6">
              <div className="flex-1 min-w-[200px]">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">1. Tipo de Contenido</label>
                  <div className="flex flex-wrap gap-2">
                      {MODES.map(m => (
                          <button 
                             key={m.id} 
                             onClick={() => setMode(m.id)}
                             className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all border
                                ${mode === m.id 
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 ring-1 ring-indigo-200' 
                                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
                          >
                              <m.icon size={16} /> {m.label}
                          </button>
                      ))}
                  </div>
              </div>
              
              <div className="flex-1 min-w-[200px]">
                   <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">2. Modo de Actividad</label>
                   <div className="flex gap-2">
                       <button onClick={() => setActivity('STUDY')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border transition-all ${activity === 'STUDY' ? 'bg-white border-indigo-500 text-indigo-600 ring-1 ring-indigo-500' : 'bg-slate-50 border-transparent text-slate-500'}`}>
                           <BookOpen size={16} /> Estudio
                       </button>
                       <button onClick={() => setActivity('QUIZ')} className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 border transition-all ${activity === 'QUIZ' ? 'bg-white border-teal-500 text-teal-600 ring-1 ring-teal-500' : 'bg-slate-50 border-transparent text-slate-500'}`}>
                           <Brain size={16} /> Quiz
                       </button>
                   </div>
              </div>

               {activity === 'QUIZ' && (
                   <div className="flex-1 min-w-[150px]">
                       <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Dificultad</label>
                       <select 
                           value={difficulty} 
                           onChange={(e) => setDifficulty(e.target.value)}
                           className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                       >
                           <option>Standard C1</option>
                           <option>Nightmare (C2/Native)</option>
                       </select>
                   </div>
               )}
          </div>

          {/* Topic Selection */}
          <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-3.5 text-slate-400" size={20} />
                    <input
                        type="text"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        placeholder="Escribe un tema o selecciona uno abajo..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 font-medium"
                    />
                </div>
                <button
                    onClick={() => generateContent()}
                    disabled={loading || !topic}
                    className={`px-8 py-3 font-bold rounded-xl flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg whitespace-nowrap
                        ${activity === 'STUDY' ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-200' : 'bg-teal-600 hover:bg-teal-500 text-white shadow-teal-200'}
                    `}
                >
                    {loading ? <Loader2 className="animate-spin" /> : <RefreshCw />}
                    {activity === 'STUDY' ? 'Generar' : 'Empezar Quiz'}
                </button>
              </div>

              {/* Preset Categories */}
              <div className="pt-2">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Temas Sugeridos (C1/C2 Essential)</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(PRESET_CATEGORIES).map(([category, topics]) => (
                          <div key={category} className="border border-slate-100 rounded-xl p-3 bg-slate-50/50">
                              <h5 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                                  {getCategoryIcon(category)} {category}
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                  {topics.map(t => (
                                      <button
                                        key={t}
                                        onClick={() => generateContent(t)}
                                        disabled={loading}
                                        className="text-xs bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-600 hover:text-indigo-600 hover:border-indigo-300 hover:shadow-sm transition-all"
                                      >
                                          {t}
                                      </button>
                                  ))}
                              </div>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>

      {/* CONTENT AREA: CARDS */}
      {activity === 'STUDY' && cards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {cards.map((card) => (
            <div 
              key={card.id} 
              onClick={() => toggleFlip(card.id)}
              className="group h-72 perspective-1000 cursor-pointer"
            >
              <div className={`relative w-full h-full duration-700 transform-style-3d transition-transform ${flipped[card.id] ? 'rotate-y-180' : ''}`}>
                
                {/* Front */}
                <div className="absolute w-full h-full backface-hidden bg-white border-2 border-slate-100 rounded-2xl p-6 flex flex-col items-center justify-center shadow-sm group-hover:border-indigo-300 transition-colors">
                  <div className="absolute top-3 left-3 bg-slate-100 text-slate-500 text-[10px] px-2 py-1 rounded uppercase font-bold tracking-wider">{mode}</div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2 text-center">{card.word}</h3>
                  <div className="w-12 h-1 bg-indigo-500 rounded-full mb-4"></div>
                  <p className="text-slate-400 text-xs uppercase tracking-wide">Toca para girar</p>
                </div>

                {/* Back */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-indigo-50 border-2 border-indigo-200 rounded-2xl p-5 flex flex-col justify-between shadow-md">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold bg-indigo-200 text-indigo-800 px-2 py-1 rounded">ES</span>
                        <button onClick={(e) => speak(card.word, e)} className="text-indigo-400 hover:text-indigo-700"><Volume2 size={18} /></button>
                    </div>
                    <p className="text-slate-700 mb-3 text-sm font-medium leading-tight">{card.definitionES}</p>
                    <p className="text-slate-600 italic text-xs mt-1 border-l-2 border-indigo-400 pl-2">"{card.exampleEN}"</p>
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex items-center gap-2 justify-between">
                        <p className="text-[10px] text-slate-500 truncate max-w-[60%]">{card.synonyms.join(", ")}</p>
                        <button 
                            onClick={(e) => saveCard(card, e)}
                            disabled={savedIds.has(card.id)}
                            className={`p-2 rounded-full transition-colors ${savedIds.has(card.id) ? 'bg-pink-100 text-pink-500' : 'bg-white text-slate-400 hover:text-pink-500 hover:bg-pink-50'}`}
                        >
                            <Heart size={16} fill={savedIds.has(card.id) ? "currentColor" : "none"} />
                        </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONTENT AREA: QUIZ */}
      {activity === 'QUIZ' && quizQuestions.length > 0 && (
          <div className="max-w-2xl mx-auto">
             {!quizFinished ? (
                 <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-slate-100">
                          <div className="h-full bg-teal-500 transition-all duration-500" style={{ width: `${((quizIdx + 1) / quizQuestions.length) * 100}%` }}></div>
                      </div>
                      
                      <div className="flex justify-between items-center mb-8 mt-2">
                          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pregunta {quizIdx + 1} / {quizQuestions.length}</span>
                          <div className="flex items-center gap-2 text-teal-600 font-bold bg-teal-50 px-3 py-1 rounded-full text-sm">
                              <GraduationCap size={16} /> {quizScore} pts
                          </div>
                      </div>
                      
                      <h3 className="text-xl font-bold text-slate-800 mb-8">{quizQuestions[quizIdx].question}</h3>

                      <div className="space-y-3">
                          {quizQuestions[quizIdx].options.map((opt, i) => (
                              <button
                                key={i}
                                disabled={selectedOpt !== null}
                                onClick={() => handleAnswer(i)}
                                className={`w-full text-left p-4 rounded-xl border-2 transition-all font-medium relative
                                    ${selectedOpt === null 
                                        ? 'border-slate-100 bg-white hover:border-teal-200 hover:bg-slate-50 text-slate-600' 
                                        : i === quizQuestions[quizIdx].correctIndex
                                            ? 'border-green-500 bg-green-50 text-green-800'
                                            : i === selectedOpt
                                                ? 'border-red-500 bg-red-50 text-red-800'
                                                : 'border-slate-100 opacity-40'
                                    }
                                `}
                              >
                                  {opt}
                                  {selectedOpt !== null && i === quizQuestions[quizIdx].correctIndex && (
                                      <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600" size={20} />
                                  )}
                              </button>
                          ))}
                      </div>

                      {selectedOpt !== null && (
                          <div className="mt-6 p-4 bg-slate-50 rounded-xl text-slate-600 text-sm border border-slate-200 animate-fade-in">
                              <span className="font-bold text-slate-800">Info: </span>
                              {quizQuestions[quizIdx].explanation}
                          </div>
                      )}
                 </div>
             ) : (
                  <div className="bg-white p-12 rounded-3xl shadow-xl text-center border border-slate-200">
                      <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 text-teal-600">
                          <GraduationCap size={48} />
                      </div>
                      <h2 className="text-3xl font-black text-slate-900 mb-2">¡Quiz Completado!</h2>
                      <p className="text-slate-500 mb-8">Has acertado {quizScore} de {quizQuestions.length} en modo <span className="font-bold text-slate-700">{difficulty}</span>.</p>
                      <button onClick={() => generateContent()} className="bg-teal-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-teal-700 transition-colors shadow-lg shadow-teal-200">
                          Otro Quiz
                      </button>
                  </div>
             )}
          </div>
      )}
    </div>
  );
};