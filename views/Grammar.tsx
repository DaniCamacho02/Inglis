import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { StorageService } from '../services/storageService';
import { QuizQuestion, GrammarChart } from '../types';
import { ArrowRight, Save, Printer, Gamepad2, BookOpen, Brain, CheckCircle, AlertTriangle, Loader2, Info, XCircle, Sparkles } from 'lucide-react';

// Popular C1 Topics
const C1_TOPICS = [
    "Inversion (Auxiliary)", "Cleft Sentences", "Mixed Conditionals", 
    "Passive Voice (Impersonal)", "Subjunctive Mood", "Participle Clauses", 
    "Future in the Past", "Wish / If only", "Relative Clauses", 
    "Gerunds vs Infinitives", "Modal Verbs", "Discourse Markers"
];

type Mode = 'TUTORIAL' | 'QUIZ' | 'WORD_FORMATION';

export const Grammar: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [mode, setMode] = useState<Mode>('TUTORIAL');
  
  // Data State
  const [chart, setChart] = useState<GrammarChart | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);

  // Quiz State
  const [quizIdx, setQuizIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);

  const handleTopicSelect = async (topic: string) => {
      setActiveTopic(topic);
      setLoading(true);
      setChart(null);
      setQuiz([]);
      setQuizIdx(0);
      setScore(0);
      setQuizFinished(false);
      setSelectedOpt(null);

      // Fetch content based on mode
      if (mode === 'TUTORIAL') {
          const data = await GeminiService.generateGrammarInfographic(topic);
          if (data) setChart({ ...data, id: Date.now().toString(), timestamp: Date.now() });
      } else if (mode === 'QUIZ') {
          const data = await GeminiService.generateQuiz(topic);
          setQuiz(data);
      }
      setLoading(false);
  };

  const handleSaveChart = () => {
      if (chart) {
          StorageService.saveGrammarChart(chart);
          alert("¡Cheat Sheet guardado en tu Biblioteca!");
      }
  };

  const handleAnswer = (idx: number) => {
      if (selectedOpt !== null) return; // Prevent double click
      setSelectedOpt(idx);
      const q = quiz[quizIdx];
      
      if (idx === q.correctIndex) {
          setScore(s => s + 1);
          StorageService.addXP(20);
      } else {
          StorageService.saveMistake({
              id: Date.now().toString(),
              type: 'grammar',
              question: q.question,
              correctAnswer: q.options[q.correctIndex],
              userAnswer: q.options[idx],
              explanation: q.explanation,
              timestamp: Date.now()
          });
      }

      setTimeout(() => {
          if (quizIdx < quiz.length - 1) {
              setQuizIdx(prev => prev + 1);
              setSelectedOpt(null);
          } else {
              setQuizFinished(true);
          }
      }, 2000);
  };

  return (
    <div className="animate-fade-in pb-12">
      {/* Hero Banner */}
      <div className="relative w-full h-48 md:h-56 rounded-3xl overflow-hidden mb-8 shadow-xl group">
        <img 
            src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80" 
            alt="Retro Tech" 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-purple-900/80 flex flex-col justify-center px-8 md:px-12">
            <div className="flex items-center gap-3 mb-2 text-indigo-300">
                <Gamepad2 size={28} />
                <span className="font-mono text-sm tracking-widest uppercase">Level {activeTopic ? '2' : '1'} Access</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">Gramática Maestra</h1>
            <p className="text-indigo-100 max-w-lg text-sm md:text-base font-light">
                Sube de nivel. Desbloquea estructuras complejas y derrota al Jefe Final (El Examen).
            </p>
        </div>
      </div>

      {/* Mission Control (Controls) */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
            <button 
                onClick={() => setMode('TUTORIAL')}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${mode === 'TUTORIAL' ? 'bg-indigo-100 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <BookOpen size={16} /> Infografía
            </button>
            <button 
                onClick={() => setMode('QUIZ')}
                className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${mode === 'QUIZ' ? 'bg-teal-100 text-teal-700' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <Brain size={16} /> Quiz (10)
            </button>
        </div>
      </div>

      {/* Topic Chips */}
      <div className="flex flex-wrap gap-3 mb-8">
          {C1_TOPICS.map(topic => (
              <button
                key={topic}
                onClick={() => handleTopicSelect(topic)}
                className={`px-5 py-2 rounded-full text-sm font-medium border transition-all shadow-sm
                    ${activeTopic === topic 
                        ? 'bg-slate-800 text-white border-slate-900 ring-2 ring-slate-200 ring-offset-2' 
                        : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                    }
                `}
              >
                  {topic}
              </button>
          ))}
      </div>

      {/* LOADING STATE */}
      {loading && (
          <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
              <p className="text-slate-500 font-mono animate-pulse">Generando datos de misión...</p>
          </div>
      )}

      {/* CONTENT: INFOGRAPHIC MODE */}
      {!loading && mode === 'TUTORIAL' && chart && (
          <div className="animate-fade-in">
               <div className="flex justify-end gap-3 mb-4">
                   <button onClick={handleSaveChart} className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-white px-4 py-2 rounded-lg border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 transition-all">
                       <Save size={16} /> Guardar en Biblioteca
                   </button>
               </div>

               {/* The Cheat Sheet Card */}
               <div className="bg-white rounded-t-3xl rounded-b-xl shadow-2xl border-t-8 border-indigo-600 overflow-hidden max-w-4xl mx-auto">
                    <div className="p-8 md:p-12">
                        <div className="flex justify-between items-start mb-6">
                             <div className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-2">Grammar Cheat Sheet</div>
                             <div className="bg-indigo-50 text-indigo-800 px-3 py-1 rounded-full text-xs font-bold">C1/C2 Master</div>
                        </div>
                        
                        <h2 className="text-4xl md:text-6xl font-serif font-bold text-slate-900 mb-6 leading-tight">
                            {chart.title}
                        </h2>
                        
                        <p className="text-lg md:text-xl text-slate-600 leading-relaxed mb-10 font-serif italic border-l-4 border-indigo-200 pl-6">
                            {chart.definition}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            {/* Structure Block */}
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600 font-bold">01</div>
                                    <h3 className="font-bold text-slate-800 text-lg">Estructura</h3>
                                </div>
                                <p className="font-mono text-indigo-600 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 text-sm md:text-base">
                                    {chart.structure}
                                </p>
                            </div>

                            {/* Examples Block */}
                            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center text-teal-600 font-bold">02</div>
                                    <h3 className="font-bold text-slate-800 text-lg">Ejemplos Reales</h3>
                                </div>
                                <ul className="space-y-3">
                                    {chart.examples.map((ex, i) => (
                                        <li key={i} className="text-slate-700 italic text-sm md:text-base leading-relaxed">
                                            "{ex}"
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        
                        {/* New Sections: Common Mistakes & Native Nuance */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                             {chart.commonMistakes && (
                                 <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                                     <div className="flex items-center gap-2 mb-3 text-red-600 font-bold uppercase text-xs tracking-wider">
                                         <XCircle size={16} /> Common Mistakes
                                     </div>
                                     <ul className="list-disc list-inside space-y-2 text-slate-700 text-sm">
                                         {chart.commonMistakes.map((mistake, i) => (
                                             <li key={i}>{mistake}</li>
                                         ))}
                                     </ul>
                                 </div>
                             )}

                             {chart.nativeNuance && (
                                 <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
                                      <div className="flex items-center gap-2 mb-3 text-purple-600 font-bold uppercase text-xs tracking-wider">
                                         <Sparkles size={16} /> Native Nuance (C2)
                                     </div>
                                     <p className="text-slate-700 text-sm leading-relaxed">
                                         {chart.nativeNuance}
                                     </p>
                                 </div>
                             )}
                        </div>

                        {/* Pro Tip */}
                        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 flex items-start gap-3">
                            <AlertTriangle className="text-yellow-500 shrink-0 mt-1" size={20} />
                            <div>
                                <span className="font-bold text-yellow-700 text-sm uppercase tracking-wide">Pro Tip</span>
                                <p className="text-yellow-800 mt-1 text-sm">{chart.tips}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 border-t border-slate-100">
                        Generated by Cambridge C1 Nexus AI • {new Date().toLocaleDateString()}
                    </div>
               </div>
          </div>
      )}

      {/* CONTENT: QUIZ MODE */}
      {!loading && mode === 'QUIZ' && quiz.length > 0 && (
          <div className="max-w-2xl mx-auto animate-fade-in">
              {!quizFinished ? (
                  <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                      <div className="flex justify-between items-center mb-8">
                          <span className="text-sm font-bold text-slate-400">QUEST {quizIdx + 1} / {quiz.length}</span>
                          <div className="flex items-center gap-2 text-teal-600 font-bold bg-teal-50 px-3 py-1 rounded-full">
                              <CheckCircle size={16} /> {score} XP
                          </div>
                      </div>
                      
                      <h3 className="text-xl md:text-2xl font-bold text-slate-800 mb-8 leading-snug">
                          {quiz[quizIdx].question}
                      </h3>

                      <div className="space-y-3">
                          {quiz[quizIdx].options.map((opt, i) => (
                              <button
                                key={i}
                                disabled={selectedOpt !== null}
                                onClick={() => handleAnswer(i)}
                                className={`w-full text-left p-5 rounded-xl border-2 transition-all font-medium text-lg relative
                                    ${selectedOpt === null 
                                        ? 'border-slate-100 bg-white hover:border-indigo-200 hover:bg-slate-50 text-slate-600' 
                                        : i === quiz[quizIdx].correctIndex
                                            ? 'border-green-500 bg-green-50 text-green-800'
                                            : i === selectedOpt
                                                ? 'border-red-500 bg-red-50 text-red-800'
                                                : 'border-slate-100 opacity-50'
                                    }
                                `}
                              >
                                  <span className="mr-4 font-mono text-sm opacity-40">{String.fromCharCode(65 + i)}</span>
                                  {opt}
                                  {selectedOpt !== null && i === quiz[quizIdx].correctIndex && (
                                      <CheckCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-green-600" />
                                  )}
                              </button>
                          ))}
                      </div>

                      {selectedOpt !== null && (
                          <div className="mt-6 p-4 bg-slate-50 rounded-xl text-slate-600 text-sm border border-slate-200 animate-fade-in">
                              <span className="font-bold text-slate-800">Explicación: </span>
                              {quiz[quizIdx].explanation}
                          </div>
                      )}
                  </div>
              ) : (
                  <div className="bg-white p-12 rounded-3xl shadow-xl text-center border border-slate-200">
                      <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                          <span className="text-4xl">🏆</span>
                      </div>
                      <h2 className="text-3xl font-black text-slate-900 mb-2">¡Misión Cumplida!</h2>
                      <p className="text-slate-500 mb-8">Has completado el desafío de {activeTopic}.</p>
                      <div className="text-5xl font-black text-indigo-600 mb-8">{score * 20} <span className="text-lg text-slate-400 font-medium">XP GANADOS</span></div>
                      <button onClick={() => handleTopicSelect(activeTopic!)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                          Reintentar Misión
                      </button>
                  </div>
              )}
          </div>
      )}

      {/* Empty State */}
      {!loading && !activeTopic && (
          <div className="text-center py-20 opacity-50">
              <Gamepad2 size={64} className="mx-auto mb-4 text-slate-300" />
              <p className="text-xl text-slate-400 font-medium">Selecciona una misión arriba para comenzar.</p>
          </div>
      )}
    </div>
  );
};