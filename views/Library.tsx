import React, { useState, useEffect } from 'react';
import { StorageService } from '../services/storageService';
import { VocabCard, Mistake, GrammarChart } from '../types';
import { Trash2, Eye, BookOpen, AlertTriangle, Layers, Download } from 'lucide-react';

export const Library: React.FC = () => {
  const [tab, setTab] = useState<'vocab' | 'charts' | 'mistakes'>('vocab');
  const [vocab, setVocab] = useState<VocabCard[]>([]);
  const [charts, setCharts] = useState<GrammarChart[]>([]);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [revealedMistake, setRevealedMistake] = useState<string | null>(null);

  useEffect(() => {
      setVocab(StorageService.getVocab());
      setCharts(StorageService.getGrammarCharts());
      setMistakes(StorageService.getMistakes());
  }, [tab]);

  const handleFixMistake = (id: string) => {
      StorageService.removeMistake(id);
      setMistakes(prev => prev.filter(m => m.id !== id));
  };
  
  const deleteChart = (id: string) => {
      StorageService.removeGrammarChart(id);
      setCharts(prev => prev.filter(c => c.id !== id));
  };
  
  const deleteVocab = (id: string) => {
      StorageService.removeVocab(id);
      setVocab(prev => prev.filter(v => v.id !== id));
  };

  return (
    <div className="space-y-6">
        <div className="flex gap-2 border-b border-slate-200 pb-4 overflow-x-auto">
            <TabButton active={tab === 'vocab'} onClick={() => setTab('vocab')} icon={BookOpen} label={`Vocabulario (${vocab.length})`} color="indigo" />
            <TabButton active={tab === 'charts'} onClick={() => setTab('charts')} icon={Layers} label={`Infografías (${charts.length})`} color="teal" />
            <TabButton active={tab === 'mistakes'} onClick={() => setTab('mistakes')} icon={AlertTriangle} label={`Fallos (${mistakes.length})`} color="red" />
        </div>

        {tab === 'vocab' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {vocab.map(card => (
                    <div key={card.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative group">
                         <button 
                            onClick={() => deleteVocab(card.id)} 
                            className="absolute top-3 right-3 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={16} />
                        </button>
                        <h4 className="text-lg font-bold text-indigo-600 mb-1">{card.word}</h4>
                        <p className="text-sm text-slate-600 mb-3 leading-relaxed">{card.definitionES}</p>
                        <div className="bg-indigo-50 p-2 rounded text-xs text-indigo-800 italic border-l-2 border-indigo-300">
                            "{card.exampleEN}"
                        </div>
                    </div>
                ))}
                {vocab.length === 0 && <EmptyState msg="No hay palabras guardadas." />}
            </div>
        )}

        {tab === 'charts' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {charts.map(chart => (
                    <div key={chart.id} className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200 relative group">
                        {/* Header */}
                        <div className="bg-slate-900 p-4 flex justify-between items-center">
                            <h3 className="text-white font-serif font-bold text-lg">{chart.title}</h3>
                            <div className="flex gap-2">
                                <button onClick={() => deleteChart(chart.id)} className="text-slate-400 hover:text-red-400"><Trash2 size={16}/></button>
                            </div>
                        </div>
                        
                        <div className="p-6">
                            <p className="text-sm text-slate-600 mb-4 italic border-l-2 border-teal-500 pl-3">{chart.definition}</p>
                            
                            <div className="mb-4">
                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide block mb-1">Estructura</span>
                                <code className="block bg-slate-100 p-2 rounded text-xs font-mono text-slate-700">{chart.structure}</code>
                            </div>

                            <div>
                                <span className="text-xs font-bold text-teal-600 uppercase tracking-wide block mb-1">Ejemplo</span>
                                <p className="text-sm text-slate-700">"{chart.examples?.[0]}"</p>
                            </div>
                        </div>
                    </div>
                ))}
                 {charts.length === 0 && <EmptyState msg="No hay infografías guardadas." />}
            </div>
        )}

        {tab === 'mistakes' && (
            <div className="space-y-4 max-w-3xl mx-auto">
                {mistakes.map(m => (
                    <div key={m.id} className="bg-white border-l-4 border-red-500 p-6 rounded-r-xl shadow-sm flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                            <span className="text-[10px] font-bold uppercase bg-red-50 text-red-500 px-2 py-1 rounded tracking-wider">{m.type}</span>
                            <button onClick={() => handleFixMistake(m.id)} className="text-green-600 text-xs font-bold hover:underline flex items-center gap-1">
                                <CheckCircleIcon /> Marcar como Aprendido (+25XP)
                            </button>
                        </div>
                        <p className="text-lg font-medium text-slate-800">{m.question}</p>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="flex justify-between items-center mb-2">
                                <p className="text-red-500 text-sm font-medium">Tu respuesta: <span className="line-through">{m.userAnswer}</span></p>
                            </div>
                            {revealedMistake === m.id ? (
                                <div className="animate-fade-in">
                                    <p className="text-green-600 font-bold mb-2">Correcto: {m.correctAnswer}</p>
                                    <p className="text-slate-600 text-sm">{m.explanation}</p>
                                </div>
                            ) : (
                                <button 
                                    onClick={() => setRevealedMistake(m.id)}
                                    className="flex items-center gap-2 text-sm text-slate-500 hover:text-teal-600 font-medium"
                                >
                                    <Eye size={16} /> Ver Solución
                                </button>
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
    const activeClass = active 
        ? `bg-${color}-100 text-${color}-700 shadow-sm ring-1 ring-${color}-200` 
        : "text-slate-500 hover:bg-slate-100 hover:text-slate-700";
    
    return (
        <button onClick={onClick} className={`${baseClass} ${activeClass}`}>
            <Icon size={18} /> {label}
        </button>
    );
};

const EmptyState = ({ msg }: { msg: string }) => (
    <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Layers size={24} />
        </div>
        <p>{msg}</p>
    </div>
);

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
)