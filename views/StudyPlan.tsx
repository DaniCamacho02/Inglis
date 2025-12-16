
import React, { useState, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';
import { StorageService } from '../services/storageService';
import { StudyDay } from '../types';
import { Calendar, Loader2, CheckSquare, Square, Trophy, RefreshCw } from 'lucide-react';

export const StudyPlan: React.FC = () => {
  const [hours, setHours] = useState(5);
  const [focus, setFocus] = useState('Use of English Part 4');
  const [plan, setPlan] = useState<StudyDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
      const storedPlan = StorageService.getPlan();
      setPlan(storedPlan);
      calculateProgress(storedPlan);
  }, []);

  const calculateProgress = (currentPlan: StudyDay[]) => {
      if (currentPlan.length === 0) return setProgress(0);
      let total = 0;
      let completed = 0;
      currentPlan.forEach(day => {
          day.tasks.forEach(task => {
              total++;
              if (task.completed) completed++;
          });
      });
      setProgress(total === 0 ? 0 : Math.round((completed / total) * 100));
  };

  const generate = async () => {
      setLoading(true);
      try {
          const newPlan = await GeminiService.generateStudyPlan(hours, focus);
          setPlan(newPlan);
          StorageService.savePlan(newPlan);
          setProgress(0);
      } catch (e) {
          alert("Failed to generate plan.");
      }
      setLoading(false);
  };

  const toggleTask = (dayIndex: number, taskId: string) => {
      const updatedPlan = StorageService.toggleTask(dayIndex, taskId);
      setPlan(updatedPlan); // Update local state from storage return to ensure sync
      calculateProgress(updatedPlan);
  };

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
        {/* Controls */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 mb-8 shadow-sm">
             <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg">
                    <Calendar size={24} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Generador de Rutina Semanal</h2>
                    <p className="text-slate-500 text-sm">Crea un plan táctico personalizado.</p>
                </div>
             </div>

             <div className="flex flex-col md:flex-row gap-6 items-end">
                <div className="flex-1 space-y-2 w-full">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Horas Semanales</label>
                    <input 
                        type="number" 
                        value={hours} 
                        onChange={(e) => setHours(Number(e.target.value))} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none font-bold" 
                    />
                </div>
                <div className="flex-[2] space-y-2 w-full">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Objetivo Principal</label>
                    <input 
                        type="text" 
                        value={focus} 
                        onChange={(e) => setFocus(e.target.value)} 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none font-bold" 
                    />
                </div>
                <button 
                    onClick={generate}
                    disabled={loading}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <RefreshCw size={20} />}
                    Generar
                </button>
            </div>
        </div>

        {/* Plan Display */}
        {plan.length > 0 && (
            <div className="space-y-6">
                {/* Progress Bar */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                    <div className="flex-1">
                        <div className="flex justify-between text-xs font-bold uppercase text-slate-500 mb-2">
                            <span>Progreso Semanal</span>
                            <span>{progress}% Completado</span>
                        </div>
                        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                            <div 
                                className="bg-emerald-500 h-full transition-all duration-1000 ease-out" 
                                style={{ width: `${progress}%` }} 
                            />
                        </div>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 font-bold border border-emerald-100">
                        <Trophy size={20} />
                    </div>
                </div>

                {/* Days Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {plan.map((day, dayIndex) => (
                        <div key={dayIndex} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center">
                                <h3 className="font-bold text-slate-800">{day.day}</h3>
                                <span className="text-xs font-medium bg-white px-2 py-1 rounded border border-slate-200 text-slate-500">
                                    {day.focus}
                                </span>
                            </div>
                            <div className="p-4 space-y-2">
                                {day.tasks.map((task) => (
                                    <div 
                                        key={task.id}
                                        onClick={() => toggleTask(dayIndex, task.id)}
                                        className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border
                                            ${task.completed 
                                                ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
                                                : 'bg-white border-slate-100 text-slate-700 hover:border-slate-300'
                                            }
                                        `}
                                    >
                                        <div className={`mt-0.5 ${task.completed ? 'text-emerald-500' : 'text-slate-300'}`}>
                                            {task.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                                        </div>
                                        <span className={`text-sm font-medium ${task.completed ? 'line-through opacity-70' : ''}`}>
                                            {task.description}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
  );
};
