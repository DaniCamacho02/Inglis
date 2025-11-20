import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { StorageService } from '../services/storageService';
import { Calendar, Loader2 } from 'lucide-react';

export const StudyPlan: React.FC = () => {
  const [hours, setHours] = useState(5);
  const [focus, setFocus] = useState('Use of English Part 4');
  const [plan, setPlan] = useState(StorageService.getPlan());
  const [loading, setLoading] = useState(false);

  const generate = async () => {
      setLoading(true);
      const newPlan = await GeminiService.generateStudyPlan(hours, focus);
      setPlan(newPlan);
      StorageService.savePlan(newPlan);
      setLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
        <div className="bg-white p-6 rounded-xl border border-slate-200 mb-8 flex flex-col md:flex-row gap-6 items-end shadow-sm">
            <div className="flex-1 space-y-2 w-full">
                <label className="block text-sm font-bold text-slate-500">Horas Semanales</label>
                <input type="number" value={hours} onChange={(e) => setHours(Number(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <div className="flex-[2] space-y-2 w-full">
                <label className="block text-sm font-bold text-slate-500">Punto Débil / Enfoque</label>
                <input type="text" value={focus} onChange={(e) => setFocus(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none" />
            </div>
            <button 
                onClick={generate}
                disabled={loading}
                className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg flex items-center gap-2 h-10 shadow-lg shadow-emerald-200"
            >
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Calendar size={18} />}
                Generar Plan
            </button>
        </div>

        {plan && (
            <div className="bg-white p-8 rounded-2xl prose prose-slate max-w-none shadow-sm border border-slate-100">
                <pre className="whitespace-pre-wrap font-sans text-slate-600 leading-7">{plan}</pre>
            </div>
        )}
    </div>
  );
};