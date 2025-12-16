
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { StorageService } from '../services/storageService';
import { ComplexExam, ReadingSection, ClozeSection, MatchingSection, TransformationSection, WordFormationSection } from '../types';
import { Target, Loader2, Play, Zap, RefreshCw } from 'lucide-react';

export const Exams: React.FC = () => {
  const [mode, setMode] = useState<'CONFIG' | 'COMBAT' | 'REPORT'>('CONFIG');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [examData, setExamData] = useState<ComplexExam | null>(null);
  
  const [readingAnswers, setReadingAnswers] = useState<Record<string, number>>({});
  const [clozeAnswers, setClozeAnswers] = useState<Record<number, string>>({});
  const [matchingAnswers, setMatchingAnswers] = useState<Record<string, string>>({});
  const [transformAnswers, setTransformAnswers] = useState<Record<string, string>>({});
  const [wordFormAnswers, setWordFormAnswers] = useState<Record<string, string>>({});

  const [report, setReport] = useState({ score: 0, total: 0, xp: 0 });

  const sanitizeExamData = (data: ComplexExam): ComplexExam => {
      if (!data || !data.sections || !Array.isArray(data.sections)) return data;
      
      const newData = { ...data };
      newData.sections = newData.sections.map((section, secIdx) => {
          const s = { ...section };
          if (s.type === 'READING') {
              s.questions = (s as ReadingSection).questions || [];
              (s as ReadingSection).questions = (s as ReadingSection).questions.map((q, qIdx) => ({
                  ...q,
                  id: `reading_${secIdx}_q_${qIdx}`
              }));
          } else if (s.type === 'CLOZE') {
              s.gaps = (s as ClozeSection).gaps || [];
              (s as ClozeSection).gaps = (s as ClozeSection).gaps.map((g, gIdx) => ({
                  ...g,
                  id: parseInt(`100${secIdx}${gIdx}`) 
              }));
          } else if (s.type === 'MATCHING') {
              s.pairs = (s as MatchingSection).pairs || [];
              (s as MatchingSection).pairs = (s as MatchingSection).pairs.map((p, pIdx) => ({
                  ...p,
                  id: `matching_${secIdx}_p_${pIdx}`,
                  left: p.left || `Item ${pIdx}`,
                  right: p.right || `Match ${pIdx}`
              }));
          } else if (s.type === 'TRANSFORMATION') {
              s.items = (s as TransformationSection).items || [];
              (s as TransformationSection).items = (s as TransformationSection).items.map((t, tIdx) => ({
                  ...t,
                  id: `trans_${secIdx}_t_${tIdx}`
              }));
          } else if (s.type === 'WORD_FORMATION') {
              s.items = (s as WordFormationSection).items || [];
              (s as WordFormationSection).items = (s as WordFormationSection).items.map((w, wIdx) => ({
                  ...w,
                  id: `wf_${secIdx}_w_${wIdx}`
              }));
          }
          return s;
      });
      return newData;
  };

  const startExam = async () => {
      if (!topic.trim()) {
         alert("Por favor, introduce un tema para la misión.");
         return;
      }

      setLoading(true);
      setExamData(null);
      setReadingAnswers({});
      setClozeAnswers({});
      setMatchingAnswers({});
      setTransformAnswers({});
      setWordFormAnswers({});

      // Get current level
      const profile = StorageService.getProfile();
      const level = profile.level || 'C1';
      const language = profile.targetLanguage || 'English';

      try {
          const parsedTopic = GeminiService.cleanJSON(topic); // Clean input
          const rawData = await GeminiService.generateComplexExam(parsedTopic, level, language);
          if (rawData && rawData.sections && Array.isArray(rawData.sections) && rawData.sections.length > 0) {
              const safeData = sanitizeExamData(rawData);
              setExamData(safeData);
              setMode('COMBAT');
          } else {
              alert("La IA no pudo generar el examen. Por favor, inténtalo de nuevo con otro tema.");
          }
      } catch (e) {
          alert(`Error al generar: ${e}`);
      } finally {
          setLoading(false);
      }
  };

  const finishExam = () => {
      if (!examData) return;

      let correctCount = 0;
      let totalCount = 0;

      examData.sections?.forEach(section => {
          if (section.type === 'READING') {
              (section as ReadingSection).questions?.forEach(q => {
                  totalCount++;
                  if (readingAnswers[q.id] === q.correctIndex) correctCount++;
              });
          } else if (section.type === 'CLOZE') {
              (section as ClozeSection).gaps?.forEach(gap => {
                  totalCount++;
                  if (clozeAnswers[gap.id]?.toLowerCase().trim() === gap.answer.toLowerCase().trim()) correctCount++;
              });
          } else if (section.type === 'MATCHING') {
              (section as MatchingSection).pairs?.forEach(pair => {
                  totalCount++;
                  if (matchingAnswers[pair.left] === pair.right) correctCount++;
              });
          } else if (section.type === 'TRANSFORMATION') {
              (section as TransformationSection).items?.forEach(item => {
                  totalCount++;
                  if (transformAnswers[item.id]?.toLowerCase().trim() === item.answer.toLowerCase().trim()) correctCount++;
              });
          } else if (section.type === 'WORD_FORMATION') {
              (section as WordFormationSection).items?.forEach(item => {
                  totalCount++;
                  if (wordFormAnswers[item.id]?.toLowerCase().trim() === item.answer.toLowerCase().trim()) correctCount++;
              });
          }
      });

      const xpEarned = correctCount * 30;
      StorageService.addXP(xpEarned);
      setReport({ score: correctCount, total: totalCount, xp: xpEarned });
      setMode('REPORT');
  };

  const ReadingComponent = ({ section }: { section: ReadingSection }) => (
      <div className="space-y-6">
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 font-serif text-lg leading-relaxed text-slate-800 shadow-inner">
              {section.text}
          </div>
          <div className="space-y-6">
              {section.questions?.map((q) => (
                  <div key={q.id} className="bg-white border border-slate-200 p-4 rounded-xl">
                      <h4 className="font-bold text-slate-800 mb-3">{q.question}</h4>
                      <div className="space-y-2">
                          {q.options?.map((opt, i) => (
                              <button
                                key={i}
                                onClick={() => setReadingAnswers(prev => ({ ...prev, [q.id]: i }))}
                                disabled={mode === 'REPORT'}
                                className={`w-full text-left p-3 rounded-lg border transition-all ${
                                    mode === 'REPORT' 
                                      ? i === q.correctIndex 
                                        ? 'bg-green-100 border-green-500 text-green-800'
                                        : readingAnswers[q.id] === i ? 'bg-red-100 border-red-500' : 'opacity-50'
                                      : readingAnswers[q.id] === i ? 'bg-rose-50 border-rose-500 text-rose-800' : 'hover:bg-slate-50 border-slate-200'
                                }`}
                              >
                                  {opt}
                              </button>
                          ))}
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const ClozeComponent = ({ section }: { section: ClozeSection }) => {
      const parts = section.textWithGaps.split(/(\(\d+\))/g);
      return (
          <div className="bg-white p-6 rounded-xl border border-slate-200 leading-loose text-lg text-slate-800">
              {parts.map((part, i) => {
                  const match = part.match(/\((\d+)\)/);
                  if (match) {
                      const gapId = parseInt(match[1]); // Ensure it maps to sanitized ID logic if needed, but here simple parsing works for display
                      // Find actual gap object to get the real ID if we complexified it
                      const realGap = section.gaps.find((_, idx) => idx === gapId - 1); 
                      const inputId = realGap ? realGap.id : 0;
                      
                      const isCorrect = clozeAnswers[inputId]?.toLowerCase().trim() === realGap?.answer.toLowerCase().trim();
                      
                      return (
                          <span key={i} className="inline-block mx-1">
                              <span className="text-xs font-bold text-slate-400 mr-1">({gapId})</span>
                              <input 
                                type="text" 
                                className={`border-b-2 outline-none w-32 px-1 text-center font-bold transition-colors ${
                                    mode === 'REPORT'
                                      ? isCorrect ? 'border-green-500 text-green-700 bg-green-50' : 'border-red-500 text-red-700 bg-red-50'
                                      : 'border-slate-300 focus:border-rose-500 bg-slate-50'
                                }`}
                                value={clozeAnswers[inputId] || ''}
                                onChange={(e) => setClozeAnswers(prev => ({ ...prev, [inputId]: e.target.value }))}
                                disabled={mode === 'REPORT'}
                              />
                              {mode === 'REPORT' && !isCorrect && (
                                  <span className="text-xs text-green-600 font-bold ml-1">{realGap?.answer}</span>
                              )}
                          </span>
                      );
                  }
                  return <span key={i}>{part}</span>;
              })}
          </div>
      );
  };

  const MatchingComponent = ({ section }: { section: MatchingSection }) => (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-3">
              <h4 className="text-center font-bold text-slate-400 uppercase text-xs">Items</h4>
              {section.pairs?.map(pair => (
                  <div key={pair.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <span className="font-medium text-slate-700">{pair.left}</span>
                      <div className="w-4 h-4 rounded-full bg-rose-200"></div>
                  </div>
              ))}
          </div>
          <div className="space-y-3">
               <h4 className="text-center font-bold text-slate-400 uppercase text-xs">Matches</h4>
               {section.pairs?.map(pair => (
                   <div key={`sel_${pair.id}`} className="flex items-center gap-2">
                       <select 
                        className={`flex-1 p-4 border rounded-xl outline-none appearance-none ${
                            mode === 'REPORT'
                                ? matchingAnswers[pair.left] === pair.right 
                                    ? 'bg-green-50 border-green-300 text-green-800'
                                    : 'bg-red-50 border-red-300 text-red-800'
                                : 'bg-white border-slate-200 focus:border-rose-500'
                        }`}
                        value={matchingAnswers[pair.left] || ''}
                        onChange={(e) => setMatchingAnswers(prev => ({ ...prev, [pair.left]: e.target.value }))}
                        disabled={mode === 'REPORT'}
                       >
                           <option value="">Select match...</option>
                           {section.pairs.map(p => (
                               <option key={p.right} value={p.right}>{p.right}</option>
                           ))}
                       </select>
                       {mode === 'REPORT' && matchingAnswers[pair.left] !== pair.right && (
                           <span className="text-xs font-bold text-green-600 px-2">Correct: {pair.right}</span>
                       )}
                   </div>
               ))}
          </div>
      </div>
  );

  const WordFormationComponent = ({ section }: { section: WordFormationSection }) => (
      <div className="space-y-4">
          {section.items?.map((item) => {
             const parts = item.sentence.split('___');
             const isCorrect = wordFormAnswers[item.id]?.toLowerCase().trim() === item.answer.toLowerCase().trim();
             return (
                 <div key={item.id} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-white p-4 rounded-xl border border-slate-200">
                     <div className="w-32 text-right font-black text-slate-900 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded">
                         {item.rootWord}
                     </div>
                     <div className="flex-1 text-lg leading-relaxed">
                         {parts[0]}
                         <input 
                            type="text"
                            className={`mx-2 border-b-2 outline-none w-40 text-center font-bold px-1 ${
                                mode === 'REPORT'
                                    ? isCorrect ? 'border-green-500 text-green-700 bg-green-50' : 'border-red-500 text-red-700 bg-red-50'
                                    : 'border-slate-300 focus:border-rose-500 bg-slate-50'
                            }`}
                            value={wordFormAnswers[item.id] || ''}
                            onChange={(e) => setWordFormAnswers(prev => ({ ...prev, [item.id]: e.target.value }))}
                            disabled={mode === 'REPORT'}
                         />
                         {parts[1]}
                     </div>
                     {mode === 'REPORT' && !isCorrect && (
                         <div className="text-green-600 font-bold text-sm bg-green-50 px-3 py-1 rounded">
                             {item.answer}
                         </div>
                     )}
                 </div>
             );
          })}
      </div>
  );

  const TransformationComponent = ({ section }: { section: TransformationSection }) => (
      <div className="space-y-6">
          {section.items?.map((item) => {
              const isCorrect = transformAnswers[item.id]?.toLowerCase().trim() === item.answer.toLowerCase().trim();
              return (
                <div key={item.id} className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
                    <p className="font-medium text-slate-600">{item.sentence1}</p>
                    <p className="font-black text-slate-800 tracking-widest uppercase text-sm">{item.keyword}</p>
                    <div className="flex items-center gap-2 text-lg">
                        {item.sentence2.split('___')[0]}
                        <input 
                            type="text" 
                            className={`flex-1 border-b-2 outline-none px-2 font-bold ${
                                mode === 'REPORT'
                                    ? isCorrect ? 'border-green-500 text-green-700' : 'border-red-500 text-red-700'
                                    : 'border-slate-300 focus:border-rose-500 bg-slate-50'
                            }`}
                            value={transformAnswers[item.id] || ''}
                            onChange={(e) => setTransformAnswers(prev => ({ ...prev, [item.id]: e.target.value }))}
                            disabled={mode === 'REPORT'}
                        />
                        {item.sentence2.split('___')[1]}
                    </div>
                    {mode === 'REPORT' && !isCorrect && (
                         <p className="text-sm text-green-600 font-bold">Answer: {item.answer}</p>
                    )}
                </div>
              );
          })}
      </div>
  );
  
  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center h-96 animate-fade-in">
              <Loader2 size={64} className="text-rose-600 animate-spin" />
              <p className="mt-6 text-slate-500 font-mono text-sm uppercase">Generando Examen Adaptativo ({StorageService.getProfile().level || 'C1'})...</p>
          </div>
      );
  }

  return (
    <div className="animate-fade-in pb-20">
        <div className="relative w-full h-40 rounded-3xl overflow-hidden shadow-xl mb-8">
            <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80" className="w-full h-full object-cover" alt="Combat" />
            <div className="absolute inset-0 bg-gradient-to-r from-rose-900/90 to-slate-900/80 flex flex-col justify-center px-10">
                <div className="flex items-center gap-3 mb-2 text-rose-300">
                    <Target size={28} />
                    <span className="font-mono text-sm tracking-widest uppercase">Combat Simulator v3.0</span>
                </div>
                <h1 className="text-4xl font-black text-white mb-1 tracking-tight">Examen Adaptativo</h1>
            </div>
        </div>

        {mode === 'CONFIG' && (
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                 {/* Visual Map */}
                <div className="bg-slate-900 rounded-3xl overflow-hidden relative min-h-[300px] shadow-lg">
                    <img src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80" className="absolute inset-0 w-full h-full object-cover opacity-40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-6 text-white">
                        <p className="text-rose-400 font-mono text-xs uppercase tracking-widest mb-1">Target Zone</p>
                        <h3 className="text-2xl font-bold">Global Data Network</h3>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-lg flex flex-col justify-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                        <Zap className="text-yellow-500" /> Configuración de Misión
                    </h2>
                    
                    <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <span className="text-xs font-bold text-blue-500 uppercase">Perfil Detectado</span>
                        <div className="text-xl font-black text-blue-800">{StorageService.getProfile().targetLanguage} // {StorageService.getProfile().level || 'C1'}</div>
                    </div>

                    <div className="mb-8">
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tema del Examen</label>
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="Ej: Technology, Environment..."
                            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none font-medium"
                        />
                    </div>

                    <button 
                        onClick={startExam}
                        disabled={loading}
                        className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-black text-lg shadow-lg flex justify-center items-center gap-3 transition-transform hover:scale-105"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Play fill="currentColor" />} 
                        INICIAR SIMULACIÓN
                    </button>
                </div>
            </div>
        )}

        {(mode === 'COMBAT' || mode === 'REPORT') && examData && (
            <div className="max-w-4xl mx-auto bg-white shadow-2xl min-h-screen relative print:shadow-none p-8 rounded-2xl mt-8">
                 <div className="mb-8 border-b border-slate-200 pb-6 flex justify-between items-end">
                     <div>
                        <span className="text-rose-600 font-bold text-xs uppercase tracking-wider">Mission Active</span>
                        <h2 className="text-3xl font-serif font-bold text-slate-900">{examData.title}</h2>
                     </div>
                     <div className="text-slate-400 font-mono text-sm">ID: {examData.id.slice(-6)}</div>
                 </div>
                 
                 {examData.sections?.map((section, idx) => (
                     <div key={idx} className="mb-12 border-b border-slate-100 pb-12 last:border-0">
                         <div className="flex items-center gap-3 mb-4">
                             <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">{idx + 1}</div>
                             <h3 className="font-bold text-slate-800 text-xl">{section.title}</h3>
                         </div>
                         <div className="bg-blue-50 text-blue-800 p-4 rounded-xl mb-6 font-medium text-sm border-l-4 border-blue-500">
                             {section.instruction}
                         </div>
                         
                         {section.type === 'READING' && <ReadingComponent section={section as ReadingSection} />}
                         {section.type === 'CLOZE' && <ClozeComponent section={section as ClozeSection} />}
                         {section.type === 'MATCHING' && <MatchingComponent section={section as MatchingSection} />}
                         {section.type === 'TRANSFORMATION' && <TransformationComponent section={section as TransformationSection} />}
                         {section.type === 'WORD_FORMATION' && <WordFormationComponent section={section as WordFormationSection} />}
                     </div>
                 ))}

                 <div className="sticky bottom-8 bg-white/90 backdrop-blur p-4 rounded-2xl shadow-2xl border border-slate-200 mt-8">
                    {mode === 'COMBAT' ? (
                        <button onClick={finishExam} className="w-full py-4 bg-slate-900 hover:bg-black text-white font-bold rounded-xl shadow-lg transition-transform hover:-translate-y-1">
                            Finalizar y Corregir
                        </button>
                    ) : (
                        <div className="text-center">
                            <p className="text-slate-500 uppercase text-xs font-bold mb-1">Resultado Final</p>
                            <div className="text-4xl font-black text-slate-900 mb-2">
                                {report.score} <span className="text-slate-400 text-2xl">/ {report.total}</span>
                            </div>
                            <div className="inline-block bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full font-bold text-sm mb-4">
                                +{report.xp} XP Earned
                            </div>
                            <button onClick={() => setMode('CONFIG')} className="block w-full py-3 bg-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-300">
                                Nueva Misión
                            </button>
                        </div>
                    )}
                 </div>
            </div>
        )}
    </div>
  );
};