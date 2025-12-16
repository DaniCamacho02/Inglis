
import React, { useState, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';
import { StorageService } from '../services/storageService';
import { TranslationResult } from '../types';
import { Languages, ArrowRightLeft, Sparkles, Copy, Volume2, Loader2, Eraser, BookOpen, MessageSquare, Info } from 'lucide-react';

export const Translator: React.FC = () => {
    const [input, setInput] = useState('');
    const [output, setOutput] = useState<TranslationResult | null>(null);
    const [loading, setLoading] = useState(false);
    
    // Determine the user's current target language
    const profile = StorageService.getProfile();
    const globalTargetLang = profile.targetLanguage || 'English';
    
    // Toggle state: 'TARGET' (e.g. French) or 'ES' (Spanish)
    // We assume 'TARGET' means translating TO the target language from Spanish.
    // 'ES' means translating TO Spanish FROM the target language.
    const [direction, setDirection] = useState<'TO_TARGET' | 'TO_ES'>('TO_TARGET');
    
    const [mode, setMode] = useState<'TRANSLATE' | 'IMPROVE'>('TRANSLATE');

    const handleAction = async () => {
        if (!input.trim()) return;
        setLoading(true);
        setOutput(null);
        
        // Pass the actual language names to the service
        // If direction is TO_TARGET, destination is globalTargetLang (e.g., French). Source is Spanish.
        // If direction is TO_ES, destination is 'ES'. Source is globalTargetLang.
        const targetCode = direction === 'TO_TARGET' ? globalTargetLang : 'Spanish';
        
        try {
            const result = await GeminiService.translateText(input, targetCode, mode);
            if (result) {
                setOutput(result);
            } else {
                alert("Error al procesar el texto.");
            }
        } catch (e) {
            alert("Error de conexión.");
        }
        setLoading(false);
    };

    const toggleDirection = () => setDirection(prev => prev === 'TO_TARGET' ? 'TO_ES' : 'TO_TARGET');
    
    const copyToClipboard = () => {
        if (output?.mainTranslation) {
            navigator.clipboard.writeText(output.mainTranslation);
            alert("Copiado al portapapeles.");
        }
    };

    const speak = (text: string) => {
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(text);
        
        // Dynamic map for pronunciation
        const langMap: Record<string, string> = {
            'English': 'en-GB',
            'Spanish': 'es-ES',
            'French': 'fr-FR',
            'Italian': 'it-IT'
        };

        // If direction is TO_TARGET, result is in Target Language.
        // If direction is TO_ES, result is in Spanish.
        let code = 'en-GB';
        
        if (direction === 'TO_TARGET') {
            code = langMap[globalTargetLang] || 'en-GB';
        } else {
            code = langMap['Spanish'];
        }

        msg.lang = code;
        window.speechSynthesis.speak(msg);
    };

    return (
        <div className="max-w-5xl mx-auto animate-fade-in space-y-8">
            {/* Controls */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setMode('TRANSLATE')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${mode === 'TRANSLATE' ? 'bg-white text-fuchsia-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        <Languages size={16} /> Traductor
                    </button>
                    <button 
                        onClick={() => setMode('IMPROVE')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${mode === 'IMPROVE' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                    >
                        <Sparkles size={16} /> Mejorar Estilo (C1/C2)
                    </button>
                </div>

                {mode === 'TRANSLATE' && (
                    <button onClick={toggleDirection} className="flex items-center gap-3 font-bold text-slate-600 hover:text-fuchsia-600 transition-colors">
                        <span className={direction === 'TO_ES' ? 'text-fuchsia-700' : 'text-slate-400'}>{globalTargetLang}</span>
                        <div className="bg-fuchsia-50 p-2 rounded-full"><ArrowRightLeft size={18} className="text-fuchsia-600"/></div>
                        <span className={direction === 'TO_TARGET' ? 'text-fuchsia-700' : 'text-slate-400'}>Español</span>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[500px]">
                {/* Input Column */}
                <div className="flex flex-col h-full">
                    <div className="bg-white p-4 rounded-t-2xl border border-slate-200 border-b-0 flex justify-between items-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                        <span>Texto Original ({direction === 'TO_TARGET' ? 'Español' : globalTargetLang})</span>
                        <button onClick={() => setInput('')} className="hover:text-red-500"><Eraser size={14} /></button>
                    </div>
                    <textarea 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Escribe o pega texto aquí..."
                        className="flex-1 p-6 bg-white border border-slate-200 rounded-b-2xl resize-none outline-none focus:ring-2 focus:ring-fuchsia-500/50 text-slate-800 text-lg leading-relaxed shadow-sm transition-shadow"
                    />
                    
                    <button 
                        onClick={handleAction}
                        disabled={loading || !input}
                        className="mt-4 bg-fuchsia-600 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-lg shadow-fuchsia-200 hover:bg-fuchsia-500 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
                        {mode === 'TRANSLATE' ? 'Analizar y Traducir' : 'Mejorar Estilo'}
                    </button>
                </div>

                {/* Output Column (Analysis Dashboard) */}
                <div className="flex flex-col gap-4">
                    {/* Main Result */}
                    <div className="flex flex-col flex-1 relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                        <div className="bg-fuchsia-50 p-4 border-b border-fuchsia-100 flex justify-between items-center text-xs font-bold text-fuchsia-500 uppercase tracking-wider">
                            <span>Resultado ({direction === 'TO_TARGET' ? globalTargetLang : 'Español'})</span>
                            <div className="flex gap-2">
                                <button onClick={() => output && speak(output.mainTranslation)} disabled={!output} className="hover:text-fuchsia-700 disabled:opacity-50"><Volume2 size={16} /></button>
                                <button onClick={copyToClipboard} disabled={!output} className="hover:text-fuchsia-700 disabled:opacity-50"><Copy size={16} /></button>
                            </div>
                        </div>
                        <div className="flex-1 p-6 text-slate-800 text-xl font-medium leading-relaxed relative bg-fuchsia-50/20">
                            {loading ? (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <Loader2 size={32} className="animate-spin text-fuchsia-600" />
                                </div>
                            ) : output ? (
                                output.mainTranslation
                            ) : (
                                <span className="text-slate-400 italic">El resultado aparecerá aquí...</span>
                            )}
                        </div>
                    </div>

                    {/* Analysis Cards */}
                    {output && (
                        <div className="space-y-4 animate-fade-in">
                            {/* Alternatives */}
                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                <h4 className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                                    <BookOpen size={14} className="text-teal-500"/> Variaciones Sugeridas
                                </h4>
                                <ul className="space-y-2">
                                    {output.alternatives?.map((alt, i) => (
                                        <li key={i} className="text-sm text-slate-700 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                            {alt}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {/* Nuance (Detailed) */}
                                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">
                                        <Info size={14} /> Análisis de Matiz y Contexto
                                    </h4>
                                    <p className="text-sm text-indigo-900 leading-relaxed whitespace-pre-wrap">{output.nuance}</p>
                                </div>
                                
                                {/* Rich Vocab List (Vertical) */}
                                <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                    <h4 className="flex items-center gap-2 text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">
                                        <MessageSquare size={14} /> Vocabulario Clave (Sinónimos y Definiciones)
                                    </h4>
                                    <div className="flex flex-col gap-2">
                                        {output.keyVocabulary?.map((item, i) => (
                                            <div key={i} className="text-sm text-amber-900 bg-white px-3 py-2 rounded border border-amber-200 shadow-sm">
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
