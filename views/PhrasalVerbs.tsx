
import React, { useState } from 'react';
import { Vocabulary } from './Vocabulary';
import { Activity, Zap } from 'lucide-react';

const TOPICS = ["Relationship", "Work / Business", "Travel", "Anger / Emotions", "Crime", "Health"];
const PARTICLES = ["UP", "DOWN", "OFF", "ON", "OUT", "AWAY"];

export const PhrasalVerbs: React.FC = () => {
  // Note: We are reusing the Vocabulary component logic but wrapping it in a nicer specific UI
  // In a full refactor, we might pass props to Vocabulary to pre-fill the search
  
  return (
    <div className="space-y-8 animate-fade-in">
        {/* Hero */}
        <div className="relative w-full h-40 rounded-3xl overflow-hidden shadow-xl">
            <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" 
                alt="Active" 
                className="w-full h-full object-cover"
            />
             <div className="absolute inset-0 bg-gradient-to-r from-red-900/90 to-orange-900/80 flex flex-col justify-center px-10">
                <div className="flex items-center gap-3 mb-2 text-red-200">
                    <Activity size={28} />
                    <span className="font-mono text-sm tracking-widest uppercase">Action Module</span>
                </div>
                <h1 className="text-4xl font-black text-white mb-1 tracking-tight">Phrasal Verbs</h1>
                <p className="text-red-100 text-sm font-light">Domina los verbos que definen el nivel C1.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Zap size={18} className="text-yellow-500" /> Por Partícula
                </h3>
                <div className="flex flex-wrap gap-2">
                    {PARTICLES.map(p => (
                        <span key={p} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200 cursor-help hover:bg-slate-200 transition-colors">
                            {p}
                        </span>
                    ))}
                </div>
                <p className="text-xs text-slate-400 mt-4">Tip: Escribe "Verbs with UP" en el buscador de abajo.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Activity size={18} className="text-red-500" /> Por Tema
                </h3>
                <div className="flex flex-wrap gap-2">
                    {TOPICS.map(t => (
                        <span key={t} className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-xs font-bold border border-red-100 cursor-help hover:bg-red-100 transition-colors">
                            {t}
                        </span>
                    ))}
                </div>
                <p className="text-xs text-slate-400 mt-4">Tip: Escribe el tema en el buscador.</p>
            </div>
        </div>

        {/* Reuse the powerful Vocab engine */}
        <Vocabulary />
    </div>
  );
};