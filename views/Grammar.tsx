
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { StorageService } from '../services/storageService';
import { QuizQuestion, GrammarChart } from '../types';
import { Save, Printer, Gamepad2, BookOpen, Brain, CheckCircle, Search, Lightbulb, Image as ImageIcon, PenTool, Plus, MessageSquare, Sliders, Play, XCircle, Sparkles, Loader2, Download } from 'lucide-react';

const C1_TOPICS = ["Inversion", "Cleft Sentences", "Conditionals", "Passive Voice", "Subjunctive", "Participle Clauses", "Relative Clauses", "Modal Verbs"];

export const Grammar: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [customTopic, setCustomTopic] = useState('');
  const [mode, setMode] = useState<'TUTORIAL' | 'QUIZ'>('TUTORIAL');
  const [chart, setChart] = useState<GrammarChart | null>(null);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);
  const [quizIdx, setQuizIdx] = useState(0);
  
  // Expansion state
  const [expansionQuery, setExpansionQuery] = useState('');
  const [expanding, setExpanding] = useState(false);

  const profile = StorageService.getProfile();
  const level = profile.level || 'C1';
  const language = profile.targetLanguage || 'English';

  const handleTopicSelect = async (topic: string) => {
      setActiveTopic(topic);
      setChart(null);
      setQuiz([]);
      setLoading(true);
      
      try {
          if (mode === 'TUTORIAL') {
              const data = await GeminiService.generateGrammarInfographic(topic, level, language);
              if (data) setChart({ ...data, id: Date.now().toString(), timestamp: Date.now(), customSections: [] });
          } else {
              const data = await GeminiService.generateQuiz(topic, 10, level, language);
              setQuiz(data);
              setQuizIdx(0);
              setScore(0);
          }
      } catch (e) {
          alert("Error generating content.");
      } finally {
          setLoading(false);
      }
  };

  const handleSaveChart = () => {
      if (chart) {
          StorageService.saveGrammarChart(chart);
          alert("Guardado en biblioteca.");
      }
  };

  const handlePrint = () => {
      window.print();
  };

  const handleExpand = async () => {
      if (!chart || !expansionQuery.trim()) return;
      setExpanding(true);
      try {
          const result = await GeminiService.expandGrammarChart(chart.title, expansionQuery);
          if (result) {
              const newSections = chart.customSections ? [...chart.customSections, result] : [result];
              setChart({ ...chart, customSections: newSections });
              setExpansionQuery('');
          }
      } catch (e) {
          alert("Error de expansión.");
      }
      setExpanding(false);
  };

  return (
    <div className="animate-fade-in pb-12">
      {/* Visual Header */}
      <div className="relative w-full h-48 md:h-56 rounded-3xl overflow-hidden mb-8 shadow-xl group print:hidden">
        <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-teal-900/90 to-emerald-900/80 flex flex-col justify-center px-12">
            <span className="text-teal-300 font-mono text-sm tracking-widest uppercase mb-2">Level {level} Blueprint - {language}</span>
            <h1 className="text-4xl font-black text-white">Gramática Maestra</h1>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8 print:hidden">
          <div className="flex gap-2">
            <button onClick={() => setMode('TUTORIAL')} className={`px-4 py-2 rounded-lg font-bold flex gap-2 ${mode === 'TUTORIAL' ? 'bg-teal-100 text-teal-700' : 'bg-white text-slate-500'}`}><BookOpen size={16}/> Infografía</button>
            <button onClick={() => setMode('QUIZ')} className={`px-4 py-2 rounded-lg font-bold flex gap-2 ${mode === 'QUIZ' ? 'bg-indigo-100 text-indigo-700' : 'bg-white text-slate-500'}`}><Brain size={16}/> Quiz</button>
          </div>
          <input type="text" value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} placeholder={`Tema en ${language} o Español...`} className="flex-1 px-4 py-2 rounded-lg border border-slate-300 outline-none focus:ring-2 focus:ring-teal-500" onKeyDown={(e) => e.key === 'Enter' && handleTopicSelect(customTopic)} />
      </div>

      {mode === 'TUTORIAL' && !activeTopic && !loading && (
          <div className="flex flex-col gap-3 mb-8 print:hidden">
            <span className="text-xs font-bold text-slate-400 uppercase">Temas Comunes (Genéricos)</span>
            <div className="flex flex-wrap gap-3">
                {C1_TOPICS.map(topic => (
                    <button key={topic} onClick={() => handleTopicSelect(topic)} className="px-5 py-2 rounded-full bg-white border border-slate-200 hover:border-teal-400 hover:text-teal-600 transition-all font-medium text-slate-600">{topic}</button>
                ))}
            </div>
            {language !== 'English' && <p className="text-xs text-orange-500 italic mt-2">Nota: Los temas predefinidos están en inglés, pero la IA los adaptará a {language}.</p>}
          </div>
      )}

      {loading && <div className="flex justify-center p-12"><Loader2 className="animate-spin text-teal-600" size={48} /></div>}

      {!loading && chart && mode === 'TUTORIAL' && (
           <div id="printable-chart" className="bg-white rounded-xl shadow-2xl overflow-hidden max-w-5xl mx-auto print:shadow-none print:max-w-none">
                {/* Chart Header */}
                <div className="bg-slate-900 text-white p-8 flex justify-between items-start print:bg-slate-900 print:text-white">
                    <div>
                        <div className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-2 border border-teal-500/30 inline-block px-2 py-1 rounded">{level} Grammar Blueprint</div>
                        <h2 className="text-5xl font-black mb-2 tracking-tight">{chart.title}</h2>
                        <p className="text-slate-300 text-lg font-serif italic max-w-2xl">{chart.definition}</p>
                    </div>
                    <div className="flex gap-2 print:hidden">
                        <button onClick={handleSaveChart} className="bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-colors" title="Guardar"><Save size={20}/></button>
                        <button onClick={handlePrint} className="bg-teal-600 hover:bg-teal-500 p-3 rounded-full text-white transition-colors shadow-lg shadow-teal-500/50" title="Descargar PDF"><Download size={20}/></button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="p-8 grid grid-cols-1 md:grid-cols-12 gap-6 bg-slate-50">
                    
                    {/* Structure (The Code) */}
                    <div className="md:col-span-8 bg-white p-6 rounded-2xl border-l-8 border-teal-500 shadow-sm">
                        <h3 className="text-slate-400 font-bold text-xs uppercase mb-3 flex items-center gap-2">
                            <PenTool size={14}/> Fórmula Estructural
                        </h3>
                        <div className="bg-slate-800 text-teal-300 p-4 rounded-xl font-mono text-lg shadow-inner">
                            {chart.structure}
                        </div>
                        <div className="mt-4 p-4 bg-teal-50 rounded-xl text-teal-900 text-sm border border-teal-100">
                             <strong>Cuándo usarlo:</strong> {chart.usageContext || "Contexto avanzado."}
                        </div>
                    </div>

                    {/* Mnemonic / Memory Hack */}
                    <div className="md:col-span-4 bg-yellow-100 p-6 rounded-2xl shadow-sm border border-yellow-200 transform rotate-1">
                        <h3 className="text-yellow-700 font-bold text-xs uppercase mb-3 flex items-center gap-2">
                            <Lightbulb size={14}/> Memory Hack
                        </h3>
                        <p className="font-handwriting text-xl text-slate-800 leading-snug">
                            {chart.mnemonic || "No mnemonic generated."}
                        </p>
                    </div>

                    {/* Visual Metaphor & Image */}
                    <div className="md:col-span-6 bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                        <div className="h-40 bg-slate-200 relative">
                             <img src={`https://source.unsplash.com/600x400/?${encodeURIComponent(chart.title)},abstract`} alt="Concept" className="w-full h-full object-cover opacity-80" />
                             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                             <div className="absolute bottom-4 left-4 text-white font-bold flex items-center gap-2">
                                <ImageIcon size={16}/> Metáfora Visual
                             </div>
                        </div>
                        <div className="p-4">
                            <p className="text-slate-600 text-sm italic">{chart.visualMetaphor}</p>
                        </div>
                    </div>

                    {/* Native Nuance */}
                    <div className="md:col-span-6 bg-slate-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={64}/></div>
                        <h3 className="text-teal-400 font-bold text-xs uppercase mb-3">Native Nuance ({level})</h3>
                        <p className="text-slate-300 font-medium leading-relaxed">{chart.nativeNuance}</p>
                    </div>

                    {/* Examples */}
                    <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                        <h3 className="text-slate-800 font-bold mb-4 flex gap-2 items-center"><CheckCircle size={18} className="text-teal-600"/> Ejemplos Reales</h3>
                        <ul className="space-y-3">
                            {chart.examples.map((ex, i) => (
                                <li key={i} className="flex gap-3 text-slate-600 text-sm">
                                    <span className="text-teal-500 font-bold">•</span>
                                    {ex}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Common Mistakes */}
                    <div className="md:col-span-5 bg-red-50 p-6 rounded-2xl border border-red-100 shadow-sm">
                        <h3 className="text-red-800 font-bold mb-4 flex gap-2 items-center"><XCircle size={18} className="text-red-500"/> Errores Comunes</h3>
                        <ul className="space-y-2">
                            {chart.commonMistakes?.map((m, i) => (
                                <li key={i} className="text-red-700 text-sm bg-white/50 p-2 rounded border border-red-100">
                                    ⚠️ {m}
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Custom AI Expansions */}
                    {chart.customSections?.map((section, idx) => (
                        <div key={idx} className="col-span-12 bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
                            <h3 className="text-indigo-800 font-bold mb-2 uppercase text-xs">{section.title}</h3>
                            <p className="text-slate-700 whitespace-pre-line">{section.content}</p>
                        </div>
                    ))}
                </div>

                {/* AI Expansion Module (Hidden in Print) */}
                <div className="p-8 bg-slate-100 border-t border-slate-200 print:hidden">
                    <div className="flex gap-2 items-center mb-2">
                         <Sparkles size={16} className="text-indigo-500"/>
                         <span className="text-xs font-bold text-slate-500 uppercase">Módulo de Expansión IA</span>
                    </div>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            value={expansionQuery}
                            onChange={(e) => setExpansionQuery(e.target.value)}
                            placeholder="Pregunta a la IA para completar esta tabla (ej: 'Más ejemplos formales')..."
                            className="flex-1 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handleExpand()}
                        />
                        <button 
                            onClick={handleExpand}
                            disabled={expanding}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-500 disabled:opacity-50"
                        >
                            {expanding ? <Loader2 className="animate-spin" size={16}/> : <Plus size={16}/>} Añadir
                        </button>
                    </div>
                </div>
           </div>
      )}
      
      {!loading && mode === 'QUIZ' && quiz.length > 0 && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 shadow-lg">
               {quizIdx < quiz.length ? (
                   <>
                     <h3 className="text-xl font-bold mb-6">{quiz[quizIdx].question}</h3>
                     <div className="space-y-3">
                         {quiz[quizIdx].options.map((opt, i) => (
                             <button key={i} onClick={() => {
                                 if (i === quiz[quizIdx].correctIndex) setScore(s => s + 1);
                                 setTimeout(() => setQuizIdx(p => p + 1), 1000);
                             }} className="w-full text-left p-4 rounded-xl border hover:bg-slate-50 transition-all">{opt}</button>
                         ))}
                     </div>
                   </>
               ) : (
                   <div className="text-center">
                       <h2 className="text-2xl font-bold">Quiz Terminado</h2>
                       <p>Puntuación: {score}/{quiz.length}</p>
                   </div>
               )}
          </div>
      )}
    </div>
  );
};