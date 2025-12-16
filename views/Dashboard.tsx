
import React, { useState, useEffect } from 'react';
import { UserStats, Level, TargetLanguage } from '../types';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { Trophy, Flame, Brain, Target, Shield, MapPin, Globe } from 'lucide-react';
import { StorageService } from '../services/storageService';

const FLAGS: Record<TargetLanguage, string> = {
    'English': '🇬🇧',
    'Spanish': '🇪🇸',
    'French': '🇫🇷',
    'Italian': '🇮🇹'
};

export const Dashboard: React.FC<{ stats: UserStats }> = ({ stats }) => {
  const [targetLevel, setTargetLevel] = useState<Level>('C1');
  const [targetLang, setTargetLang] = useState<TargetLanguage>('English');

  useEffect(() => {
      const profile = StorageService.getProfile();
      if (profile.level) setTargetLevel(profile.level);
      if (profile.targetLanguage) setTargetLang(profile.targetLanguage);
  }, []);

  const handleLevelChange = (newLevel: Level) => {
      setTargetLevel(newLevel);
      const profile = StorageService.getProfile();
      profile.level = newLevel;
      StorageService.saveProfile(profile);
  };

  const handleLangChange = (newLang: TargetLanguage) => {
      setTargetLang(newLang);
      const profile = StorageService.getProfile();
      profile.targetLanguage = newLang;
      StorageService.saveProfile(profile);
      window.dispatchEvent(new Event('statsUpdated')); // Notify Sidebar
  };

  const chartData = [
      { subject: 'Reading', A: stats.skills?.reading || 50, fullMark: 100 },
      { subject: 'Writing', A: stats.skills?.writing || 50, fullMark: 100 },
      { subject: 'Listening', A: stats.skills?.listening || 50, fullMark: 100 },
      { subject: 'Grammar', A: stats.skills?.grammar || 50, fullMark: 100 },
      { subject: 'Vocab', A: stats.skills?.vocab || 50, fullMark: 100 },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Level Selector & Mission Visual */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="mb-6">
                 <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
                    <Globe size={24} className="text-emerald-600" /> Idioma Objetivo
                </h3>
                <div className="flex gap-2">
                    {(Object.keys(FLAGS) as TargetLanguage[]).map(lang => (
                        <button 
                            key={lang}
                            onClick={() => handleLangChange(lang)}
                            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all border-2 ${targetLang === lang ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-white border-slate-200 text-slate-500 hover:border-emerald-200'}`}
                        >
                            <span className="text-xl">{FLAGS[lang]}</span> {lang}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-2">
                    <Shield size={24} className="text-blue-600" /> Nivel de Acceso (Target Level)
                </h3>
                <p className="text-slate-500 text-sm mb-4">Esto adaptará la dificultad de toda la plataforma a tu objetivo.</p>
                <div className="flex gap-2 flex-wrap">
                    {(['A2', 'B1', 'B2', 'C1', 'C2'] as Level[]).map(lvl => (
                        <button
                            key={lvl}
                            onClick={() => handleLevelChange(lvl)}
                            className={`px-4 py-2 rounded-xl font-bold transition-all border-2 text-sm flex-1 ${targetLevel === lvl ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' : 'bg-slate-50 text-slate-400 border-slate-200 hover:border-blue-300'}`}
                        >
                            {lvl}
                        </button>
                    ))}
                </div>
            </div>
          </div>

          <div className="bg-slate-900 rounded-2xl overflow-hidden relative shadow-lg min-h-[160px] flex items-end p-6">
              <img src="https://images.unsplash.com/photo-1432821596592-e2c18b78144f?auto=format&fit=crop&w=600&q=80" className="absolute inset-0 w-full h-full object-cover opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
              <div className="relative z-10 text-white">
                  <div className="flex items-center gap-2 mb-1 text-orange-400 text-xs font-bold uppercase tracking-wider">
                      <MapPin size={12} /> Daily Mission
                  </div>
                  <p className="font-bold leading-tight">Completa 1 Examen de Combate para mantener tu racha.</p>
              </div>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={Trophy} label="Nivel RPG" value={stats.level.toString()} color="text-yellow-500 bg-yellow-50" />
        <StatCard icon={Flame} label="Racha" value={stats.streak.toString()} color="text-orange-500 bg-orange-50" />
        <StatCard icon={Brain} label="Vocabulario" value={stats.wordsLearned.toString()} color="text-blue-500 bg-blue-50" />
        <StatCard icon={Target} label="Errores" value={stats.mistakesFixed.toString()} color="text-green-500 bg-green-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radar Chart */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm min-h-[400px]">
            <h3 className="text-xl font-bold mb-6 text-slate-800">Radar de Competencias</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} />
                  <Radar name="Habilidad Actual" dataKey="A" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.6} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Activity Breakdown */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
             <h3 className="text-xl font-bold mb-6 text-slate-800">Desglose Táctico</h3>
             <div className="space-y-4">
                 {chartData.map(item => (
                     <div key={item.subject}>
                         <div className="flex justify-between text-sm font-medium mb-1">
                             <span className="text-slate-600">{item.subject}</span>
                             <span className="text-blue-600 font-bold">{item.A}%</span>
                         </div>
                         <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                             <div 
                                className="bg-blue-500 h-full rounded-full transition-all duration-1000" 
                                style={{ width: `${item.A}%` }} 
                             />
                         </div>
                     </div>
                 ))}
             </div>
             <div className="mt-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
                 <p className="text-sm text-slate-500 italic">"Para subir tus estadísticas, completa exámenes en el Simulador de Combate y guarda vocabulario nuevo."</p>
             </div>
          </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }: any) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow group">
    <div className={`p-3 rounded-xl ${color} group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <div>
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);