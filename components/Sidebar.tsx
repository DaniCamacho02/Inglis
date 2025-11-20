import React from 'react';
import { ViewState, UserStats } from '../types';
import { LayoutDashboard, BookOpen, Gamepad2, PenTool, Anchor, Library, Map, Activity } from 'lucide-react';

interface Props {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  stats: UserStats;
}

const NAV_ITEMS = [
  { id: ViewState.DASHBOARD, label: 'Nexus Dashboard', icon: LayoutDashboard },
  { id: ViewState.VOCABULARY, label: 'Vocab Builder', icon: BookOpen },
  { id: ViewState.GRAMMAR, label: 'Grammar Master', icon: Gamepad2 },
  { id: ViewState.PHRASAL_VERBS, label: 'Phrasal Verbs', icon: Activity },
  { id: ViewState.WRITING, label: 'Writing Studio', icon: PenTool },
  { id: ViewState.TUTOR, label: 'Pool-E Tutor', icon: Anchor },
  { id: ViewState.STUDY_PLAN, label: 'Study Plan', icon: Map },
  { id: ViewState.LIBRARY, label: 'My Library', icon: Library },
];

export const Sidebar: React.FC<Props> = ({ currentView, setView, stats }) => {
  return (
    <div className="w-20 md:w-64 bg-white h-screen flex flex-col border-r border-slate-200 shadow-sm transition-all duration-300 z-20">
      <div className="p-4 md:p-6 flex items-center gap-3 border-b border-slate-100">
        <div className="w-8 h-8 md:w-10 md:h-10 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-200">
          C1
        </div>
        <h1 className="hidden md:block font-bold text-lg tracking-tight text-slate-800">Nexus AI</h1>
      </div>

      <div className="flex-1 overflow-y-auto py-4 space-y-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center gap-4 px-4 md:px-6 py-3 text-sm font-medium transition-all relative
              ${currentView === item.id 
                ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
          >
            <item.icon size={20} className={currentView === item.id ? 'text-blue-600' : 'text-slate-400'} />
            <span className="hidden md:block">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-slate-100 bg-slate-50">
        <div className="flex flex-col gap-2">
            <div className="flex justify-between text-xs text-slate-500 uppercase font-bold tracking-wider">
                <span>Level {stats.level}</span>
                <span className="text-orange-500">{stats.streak} Day Streak</span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-1000" 
                    style={{ width: `${(stats.xp % 1000) / 10}%` }}
                />
            </div>
            <div className="text-xs text-right text-slate-400 font-mono">{stats.xp} XP</div>
        </div>
      </div>
    </div>
  );
};