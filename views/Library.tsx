
import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { GeminiService } from '../services/geminiService';
import { VocabCard, Mistake, GrammarChart, TargetLanguage } from '../types';
import { Trash2, Eye, BookOpen, AlertTriangle, Layers, X, Play, RotateCcw, Shuffle, Brain, CheckCircle, XCircle, Puzzle, Settings2, Globe, Sparkles, Plus, Star, Heart, Loader2, Wand2, Volume2 } from 'lucide-react';

export const Library: React.FC = () => {
  const [tab, setTab] = useState<'vocab' | 'charts' | 'mistakes'>('vocab');
  const [activeLang, setActiveLang] = useState<string>('English');
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all');
  
  const [vocab, setVocab] = useState<VocabCard[]>([]);
  const [charts, setCharts] = useState<GrammarChart[]>([]);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [revealedMistake, setRevealedMistake] = useState<string | null>(null);

  // Manual Input State
  const [manualWord, setManualWord] = useState('');
  const [generatingCard, setGeneratingCard] = useState(false);

  // Review Mode State (Flashcards)
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyDeck, setStudyDeck] = useState<VocabCard[]>([]);

  // Quick Test State
  const [quickTestMode, setQuickTestMode] = useState(false);
  const [contextMode, setContextMode] = useState(false); 
  const [testQuestions, setTestQuestions] = useState<any[]>([]);
  const [testIdx, setTestIdx] = useState(0);
  const [testScore, setTestScore] = useState(0);
  const [testSelected, setTestSelected] = useState<number | null>(null);
  const [testFinished, setTestFinished] = useState(false);
  const [loading, setLoading] = useState(false);

  // Context Challenge Settings
  const [contextCount, setContextCount] = useState(5);

  const loadContent = () => {
      const profile = StorageService.getProfile();
      const currentLang = profile.targetLanguage || 'English';
      setActiveLang(currentLang);

      // Load ALL content
      const allVocab = StorageService.getVocab();
      const allCharts = StorageService.getGrammarCharts();
      const allMistakes = StorageService.getMistakes();

      // Filter by current language
      setVocab(allVocab.filter(v => (v.language || 'English') === currentLang));
      setCharts(allCharts.filter(c => (c.language || 'English') === currentLang));
      setMistakes(allMistakes.filter(m => (m.language || 'English') === currentLang));
  };

  useEffect(() => {
      loadContent();
      // Listen for global language changes
      window.addEventListener('statsUpdated', loadContent);
      return () => window.removeEventListener('statsUpdated', loadContent);
  }, [tab, reviewMode, quickTestMode, contextMode]);

  const handleManualAdd = async () => {
      if(!manualWord.trim()) return;
      setGeneratingCard(true);
      try {
          const cardData = await GeminiService.generateSingleVocabCard(manualWord, activeLang);
          if(cardData) {
              const newCard = { ...cardData, id: Date.now().toString(), mastered: false, language: activeLang, favorite: false };
              StorageService.saveVocab(newCard);
              setVocab(prev => [newCard, ...prev]);
              setManualWord('');
          } else {
              alert("Error generando tarjeta. Inténtalo de nuevo.");
          }
      } catch (e) {
          alert("Error de conexión. Verifica tu red.");
      }
      setGeneratingCard(false);
  }

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      StorageService.toggleVocabFavorite(id);
      setVocab(prev => prev.map(c => c.id === id ? { ...c, favorite: !c.favorite } : c));
  }

  const speak = (text: string, lang: string, e: React.MouseEvent) => {
      e.stopPropagation();
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      const langMap: Record<string, string> = {
          'English': 'en-GB',
          'Spanish': 'es-ES',
          'French': 'fr-FR',
          'Italian': 'it-IT'
      };
      msg.lang = langMap[lang] || 'en-GB';
      window.speechSynthesis.speak(msg);
  };

  const startReview = () => {
      const filteredDeck = viewMode === 'favorites' ? vocab.filter(v => v.favorite) : vocab;
      if (filteredDeck.length === 0) {
          alert("No hay cartas para estudiar en esta vista.");
          return;
      }
      setStudyDeck([...filteredDeck]); 
      setReviewIdx(0);
      setIsFlipped(false);
      setReviewMode(true);
  };

  const startQuickTest = () => {
      const deck = viewMode === 'favorites' ? vocab.filter(v => v.favorite) : vocab;
      if (deck.length < 4) {
          alert("Necesitas al menos 4 palabras para generar un test.");
          return;
      }
      const numQuestions = Math.min(5, deck.length);
      const shuffledVocab = [...deck].sort(() => Math.random() - 0.5);
      const selectedWords = shuffledVocab.slice(0, numQuestions);

      const questions = selectedWords.map(targetWord => {
          const distractors = vocab
              .filter(w => w.id !== targetWord.id)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3);
          
          const options = [targetWord, ...distractors].sort(() => Math.random() - 0.5);
          
          return {
              question: `What is the definition of "${targetWord.word}"?`,
              correctId: targetWord.id,
              options: options.map(o => ({ id: o.id, text: o.definitionEN || o.definitionES, word: o.word }))
          };
      });

      setTestQuestions(questions);
      resetTestState();
      setQuickTestMode(true);
  };

  const startContextChallenge = async () => {
      const deck = viewMode === 'favorites' ? vocab.filter(v => v.favorite) : vocab;
      if (deck.length < contextCount) {
          alert(`Necesitas al menos ${contextCount} palabras para este desafío.`);
          return;
      }
      setLoading(true);
      
      const shuffled = [...deck].sort(() => Math.random() - 0.5).slice(0, contextCount);
      const words = shuffled.map(v => v.word);

      try {
          const questions = await GeminiService.generateContextQuiz(words, contextCount);
          if (questions && questions.length > 0) {
             const formattedQuestions = questions.map((q: any) => ({
                 question: q.sentence,
                 correctId: q.correctAnswer, 
                 options: q.options.map((opt: string) => ({ id: opt, text: opt }))
             }));
             
             setTestQuestions(formattedQuestions);
             resetTestState();
             setContextMode(true);
          } else {
              alert("Error generando el desafío.");
          }
      } catch (e) {
          alert("Error de conexión.");
      }
      setLoading(false);
  };

  const resetTestState = () => {
      setTestIdx(0);
      setTestScore(0);
      setTestSelected(null);
      setTestFinished(false);
  };

  const handleTestAnswer = (optionId: string) => {
      if (testSelected !== null) return; 
      
      const currentQ = testQuestions[testIdx];
      const selectedIndex = currentQ.options.findIndex((o: any) => o.id === optionId);
      setTestSelected(selectedIndex);

      if (optionId === currentQ.correctId) {
          setTestScore(s => s + 1);
          StorageService.addXP(20); 
      }

      setTimeout(() => {
          if (testIdx < testQuestions.length - 1) {
              setTestIdx(p => p + 1);
              setTestSelected(null);
          } else {
              setTestFinished(true);
              if (testScore + (optionId === currentQ.correctId ? 1 : 0) === testQuestions.length) {
                  StorageService.addXP(100); 
              }
          }
      }, 1500);
  };

  const shuffleDeck = () => {
      const deck = viewMode === 'favorites' ? vocab.filter(v => v.favorite) : vocab;
      const shuffled = [...deck].sort(() => Math.random() - 0.5);
      setStudyDeck(shuffled);
      setReviewIdx(0);
      setIsFlipped(false);
  };

  const deleteChart = (id: string) => {
      StorageService.removeGrammarChart(id);
      setCharts(prev => prev.filter(c => c.id !== id));
  };
  
  const deleteVocab = (id: string) => {
      StorageService.removeVocab(id);
      setVocab(prev => prev.filter(v => v.id !== id));
  };

  const handleFixMistake = (id: string) => {
      StorageService.removeMistake(id);
      setMistakes(prev => prev.filter(m => m.id !== id));
  };

  // Filter logic for render
  const visibleVocab = viewMode === 'favorites' ? vocab.filter(v => v.favorite) : vocab;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
        {/* Header with active language */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
             <div className="flex items-center gap-2">
                 <Globe className="text-blue-500" size={20} />
                 <h2 className="font-bold text-slate-700">Biblioteca: <span className="text-blue-600">{activeLang}</span></h2>
             </div>
             
             {/* Magic Input */}
             {tab === 'vocab' && (
                 <div className="flex flex-col md:flex-row w-full md:w-auto gap-2">
                     <div className="relative flex-1 md:w-64">
                        <input 
                            value={manualWord}
                            onChange={(e) => setManualWord(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleManualAdd()}
                            placeholder="Escribe una palabra..."
                            className="w-full pl-3 pr-10 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <Wand2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-400" />
                     </div>
                     <button 
                        onClick={handleManualAdd} 
                        disabled={generatingCard || !manualWord}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 text-sm font-bold flex items-center justify-center gap-2"
                     >
                        {generatingCard ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                        Crear Ficha
                     </button>
                 </div>
             )}
        </div>

        {/* Flashcards Overlay */}
        {reviewMode && studyDeck.length > 0 && (
            <div className="fixed inset-0 z-50 bg-slate-900/95 flex flex-col items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
                <button onClick={() => setReviewMode(false)} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"><X size={32} /></button>
                <div className="text-center mb-8 relative w-full max-w-md">
                    <h2 className="text-2xl font-black text-white tracking-tight mb-1">DOJO DE REPASO</h2>
                    <p className="text-indigo-300 font-mono text-sm">Tarjeta {reviewIdx + 1} de {studyDeck.length}</p>
                    <button onClick={shuffleDeck} className="absolute right-0 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors p-2"><Shuffle size={20} /></button>
                </div>
                <div className="w-full max-w-md h-80 perspective-1000 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
                     <div className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${isFlipped ? 'rotate-y-180' : ''}`}>
                        <div className="absolute w-full h-full backface-hidden bg-white rounded-3xl flex flex-col items-center justify-center p-8 shadow-2xl border-b-8 border-indigo-600">
                            <span className="text-indigo-500 text-xs font-bold uppercase tracking-widest mb-4">The Word</span>
                            <h3 className="text-4xl font-black text-slate-800 text-center">{studyDeck[reviewIdx].word}</h3>
                            <button onClick={(e) => speak(studyDeck[reviewIdx].word, studyDeck[reviewIdx].language || activeLang, e)} className="mt-6 p-3 rounded-full bg-slate-100 hover:bg-indigo-100 text-slate-400 hover:text-indigo-600 transition-colors">
                                <Volume2 size={24} />
                            </button>
                            <p className="text-slate-400 text-xs mt-8 animate-pulse">Clic para girar</p>
                        </div>
                        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-indigo-600 rounded-3xl flex flex-col items-center justify-center p-8 shadow-2xl text-white border-b-8 border-indigo-800">
                            <p className="text-xl font-medium text-center mb-4 leading-relaxed">{studyDeck[reviewIdx].definitionES}</p>
                            <div className="bg-indigo-800/50 p-3 rounded-xl text-sm italic text-indigo-100 text-center">"{studyDeck[reviewIdx].exampleEN}"</div>
                        </div>
                     </div>
                </div>
                <div className="flex gap-4 mt-10">
                    <button onClick={(e) => { e.stopPropagation(); setIsFlipped(false); setReviewIdx((prev) => (prev - 1 + studyDeck.length) % studyDeck.length); }} className="p-4 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"><RotateCcw size={20} className="-scale-x-100" /></button>
                    <button onClick={(e) => { e.stopPropagation(); setIsFlipped(false); setReviewIdx((prev) => (prev + 1) % studyDeck.length); }} className="px-8 py-4 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white font-bold shadow-lg shadow-indigo-500/30 transition-all flex items-center gap-2">Siguiente <Play size={16} fill="currentColor" /></button>
                </div>
            </div>
        )}

        {/* Quiz Overlay */}
        {(quickTestMode || contextMode) && (
            <div className="fixed inset-0 z-50 bg-slate-900/95 flex flex-col items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
                <button onClick={() => { setQuickTestMode(false); setContextMode(false); }} className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors"><X size={32} /></button>
                <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl">
                    {!testFinished ? (
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-8">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pregunta {testIdx + 1} / {testQuestions.length}</span>
                                <span className="text-indigo-600 font-black">Score: {testScore}</span>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center leading-relaxed">{testQuestions[testIdx].question}</h3>
                            <div className="grid grid-cols-1 gap-3">
                                {testQuestions[testIdx].options.map((opt: any, i: number) => {
                                    let btnClass = "border-slate-200 hover:bg-slate-50 text-slate-600";
                                    if (testSelected !== null) {
                                        if (opt.id === testQuestions[testIdx].correctId) btnClass = "bg-green-100 border-green-500 text-green-700 font-bold";
                                        else if (i === testSelected) btnClass = "bg-red-100 border-red-500 text-red-700";
                                        else btnClass = "opacity-50 border-slate-200";
                                    }
                                    return (
                                        <button key={i} onClick={() => handleTestAnswer(opt.id)} disabled={testSelected !== null} className={`p-4 rounded-xl border-2 text-left transition-all text-sm md:text-base ${btnClass}`}>
                                            {opt.text}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                             <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 text-indigo-600"><Brain size={40} /></div>
                             <h2 className="text-3xl font-black text-slate-800 mb-2">Misión Cumplida</h2>
                             <p className="text-slate-500 mb-8">Has acertado <strong className="text-indigo-600">{testScore}</strong> de <strong className="text-slate-900">{testQuestions.length}</strong></p>
                             <button onClick={() => { setQuickTestMode(false); setContextMode(false); }} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-500 transition-colors shadow-lg">Volver a Biblioteca</button>
                        </div>
                    )}
                </div>
            </div>
        )}

        {/* Tab Navigation */}
        <div className="flex flex-col xl:flex-row gap-4 border-b border-slate-200 pb-4 justify-between items-start xl:items-center">
            <div className="flex gap-2 overflow-x-auto w-full xl:w-auto pb-2 xl:pb-0">
                <TabButton active={tab === 'vocab'} onClick={() => setTab('vocab')} icon={BookOpen} label={`Vocabulario (${vocab.length})`} color="indigo" />
                <TabButton active={tab === 'charts'} onClick={() => setTab('charts')} icon={Layers} label={`Infografías (${charts.length})`} color="teal" />
                <TabButton active={tab === 'mistakes'} onClick={() => setTab('mistakes')} icon={AlertTriangle} label={`Fallos (${mistakes.length})`} color="red" />
            </div>
            
            {tab === 'vocab' && vocab.length > 0 && (
                <div className="flex flex-col md:flex-row flex-wrap gap-3 items-start md:items-center w-full xl:w-auto">
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button onClick={() => setViewMode('all')} className={`px-3 py-1.5 rounded text-xs font-bold ${viewMode === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}>Todos</button>
                        <button onClick={() => setViewMode('favorites')} className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 ${viewMode === 'favorites' ? 'bg-white text-pink-600 shadow-sm' : 'text-slate-500'}`}><Heart size={12} fill="currentColor" /> Favoritos</button>
                    </div>

                    <div className="hidden md:block h-6 w-px bg-slate-300"></div>
                    
                    <div className="flex gap-2 w-full md:w-auto">
                        <button onClick={startQuickTest} className="flex-1 md:flex-none bg-white border-2 border-indigo-100 text-indigo-600 px-3 py-2 rounded-lg text-xs font-bold hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2" title="Match Definition"><Brain size={14} /> Test</button>
                        
                        <div className="flex items-center gap-1 bg-fuchsia-50 border border-fuchsia-100 rounded-lg px-2">
                            <span className="text-[10px] font-bold text-fuchsia-400 uppercase mr-1">Cant:</span>
                            <select 
                                value={contextCount} 
                                onChange={(e) => setContextCount(Number(e.target.value))}
                                className="bg-transparent text-xs font-bold text-fuchsia-700 outline-none py-2"
                            >
                                <option value="3">3</option>
                                <option value="5">5</option>
                                <option value="10">10</option>
                                <option value="20">20</option>
                            </select>
                        </div>
                        <button onClick={startContextChallenge} disabled={loading} className="flex-1 md:flex-none bg-white border-2 border-fuchsia-100 text-fuchsia-600 px-3 py-2 rounded-lg text-xs font-bold hover:bg-fuchsia-50 transition-colors flex items-center justify-center gap-2" title="Fill in the Gap with your words"><Puzzle size={14} /> Challenge</button>
                        
                        <button onClick={startReview} className="flex-1 md:flex-none bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"><Play size={14} /> Estudio</button>
                    </div>
                </div>
            )}
        </div>

        {tab === 'vocab' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {visibleVocab.map(card => (
                    <div key={card.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
                        <div className="absolute top-3 right-3 flex gap-2">
                             <button onClick={(e) => speak(card.word, card.language || activeLang, e)} className="text-slate-300 hover:text-indigo-500 transition-colors" title="Escuchar pronunciación">
                                 <Volume2 size={18} />
                             </button>
                             <button onClick={(e) => toggleFavorite(card.id, e)} className={`transition-transform hover:scale-110 ${card.favorite ? 'text-pink-500' : 'text-slate-300 hover:text-pink-300'}`}>
                                 <Heart size={18} fill={card.favorite ? "currentColor" : "none"} />
                             </button>
                             <button onClick={() => deleteVocab(card.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={18} /></button>
                        </div>
                        <h4 className="text-lg font-bold text-indigo-600 mb-1 pr-20 break-words">{card.word}</h4>
                        <p className="text-sm text-slate-600 mb-3 leading-relaxed">{card.definitionES}</p>
                        <div className="bg-indigo-50 p-2 rounded text-xs text-indigo-800 italic border-l-2 border-indigo-300">"{card.exampleEN}"</div>
                    </div>
                ))}
                {visibleVocab.length === 0 && <EmptyState msg={`No hay palabras guardadas para ${activeLang} en esta vista.`} />}
            </div>
        )}

        {tab === 'charts' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {charts.map(chart => (
                    <div key={chart.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200 relative group">
                        <div className="bg-slate-900 p-4 flex justify-between items-center">
                            <h3 className="text-white font-serif font-bold text-lg">{chart.title}</h3>
                            <button onClick={() => deleteChart(chart.id)} className="text-slate-400 hover:text-red-400"><Trash2 size={16}/></button>
                        </div>
                        <div className="p-6">
                            <p className="text-sm text-slate-600 mb-4 italic border-l-2 border-teal-500 pl-3">{chart.definition}</p>
                            <div className="mb-4"><span className="text-xs font-bold text-indigo-600 uppercase tracking-wide block mb-1">Estructura</span><code className="block bg-slate-100 p-2 rounded text-xs font-mono text-slate-700">{chart.structure}</code></div>
                        </div>
                    </div>
                ))}
                 {charts.length === 0 && <EmptyState msg={`No hay infografías guardadas para ${activeLang}.`} />}
            </div>
        )}

        {tab === 'mistakes' && (
            <div className="space-y-4 max-w-3xl mx-auto">
                {mistakes.map(m => (
                    <div key={m.id} className="bg-white border-l-4 border-red-500 p-6 rounded-r-xl shadow-sm flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold uppercase bg-red-50 text-red-500 px-2 py-1 rounded tracking-wider">{m.type}</span>
                            <button onClick={() => handleFixMistake(m.id)} className="text-green-600 text-xs font-bold hover:underline flex items-center gap-1"><CheckCircle size={14} /> Marcar como Aprendido (+25XP)</button>
                        </div>
                        <p className="text-lg font-medium text-slate-800">{m.question}</p>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="flex justify-between items-center mb-2"><p className="text-red-500 text-sm font-medium">Tu respuesta: <span className="line-through">{m.userAnswer}</span></p></div>
                            {revealedMistake === m.id ? (
                                <div className="animate-fade-in"><p className="text-green-600 font-bold mb-2">Correcto: {m.correctAnswer}</p><p className="text-slate-600 text-sm">{m.explanation}</p></div>
                            ) : (
                                <button onClick={() => setRevealedMistake(m.id)} className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 font-medium"><Eye size={16} /> Ver Solución</button>
                            )}
                        </div>
                    </div>
                ))}
                 {mistakes.length === 0 && <EmptyState msg="¡No tienes errores pendientes! Buen trabajo." />}
            </div>
        )}
    </div>
  );
};

const TabButton = ({ active, onClick, icon: Icon, label, color }: any) => {
    const baseClass = "flex items-center gap-2 px-5 py-3 rounded-lg font-bold transition-all whitespace-nowrap";
    const activeClass = active ? `bg-${color}-100 text-${color}-700 shadow-sm ring-1 ring-${color}-200` : "text-slate-500 hover:bg-slate-100 hover:text-slate-700";
    return <button onClick={onClick} className={`${baseClass} ${activeClass}`}><Icon size={18} /> {label}</button>;
};

const EmptyState = ({ msg }: { msg: string }) => (
    <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4"><Layers size={24} /></div>
        <p>{msg}</p>
    </div>
);
