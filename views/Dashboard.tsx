import React from 'react';
import { UserStats } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Trophy, Flame, Brain, Target } from 'lucide-react';

const data = [
  { name: 'Mon', xp: 120 },
  { name: 'Tue', xp: 200 },
  { name: 'Wed', xp: 150 },
  { name: 'Thu', xp: 300 },
  { name: 'Fri', xp: 250 },
  { name: 'Sat', xp: 380 },
  { name: 'Sun', xp: 400 },
];

export const Dashboard: React.FC<{ stats: UserStats }> = ({ stats }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard icon={Trophy} label="Nivel Actual" value={stats.level.toString()} color="text-yellow-500 bg-yellow-50" />
        <StatCard icon={Flame} label="Racha (Días)" value={stats.streak.toString()} color="text-orange-500 bg-orange-50" />
        <StatCard icon={Brain} label="Palabras Dominadas" value={stats.wordsLearned.toString()} color="text-blue-500 bg-blue-50" />
        <StatCard icon={Target} label="Errores Corregidos" value={stats.mistakesFixed.toString()} color="text-green-500 bg-green-50" />
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold mb-6 text-slate-800">Actividad de la Semana (XP)</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#1e293b' }}
              />
              <Area type="monotone" dataKey="xp" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorXp)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 flex items-start gap-4">
         <div className="bg-blue-600 text-white p-2 rounded-full mt-1">
             <Brain size={20} />
         </div>
         <div>
            <h4 className="font-bold text-lg mb-1 text-blue-800">Daily Tip by Nexus AI</h4>
            <p className="text-slate-600 italic">"En el examen C1, usar 'inversion' (e.g., 'Rarely have I seen...') aumenta tu puntuación en Writing y Speaking. ¡Úsalo para impresionar!"</p>
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