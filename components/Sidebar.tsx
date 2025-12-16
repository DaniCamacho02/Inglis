
import React, { useState, useEffect } from 'react';
import { ViewState, UserStats, Level, UI_TRANSLATIONS, TargetLanguage } from '../types';
import { LayoutDashboard, BookOpen, Gamepad2, PenTool, Anchor, Library, Map, Activity, ChevronLeft, ChevronRight, Target, Mic, User, Languages, Settings2, GripVertical, Check } from 'lucide-react';
import { StorageService } from '../services/storageService';

interface Props {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  stats: UserStats;
}

// Map icons to IDs, labels will be dynamic
const NAV_ICONS = {
  [ViewState.DASHBOARD]: LayoutDashboard,
  [ViewState.CONVERSATION]: Mic,
  [ViewState.VOCABULARY]: BookOpen,
  [ViewState.GRAMMAR]: Gamepad2,
  [ViewState.PHRASAL_VERBS]: Activity,
  [ViewState.EXAMS]: Target,
  [ViewState.WRITING]: PenTool,
  [ViewState.TRANSLATOR]: Languages,
  [ViewState.TUTOR]: Anchor,
  [ViewState.STUDY_PLAN]: Map,
  [ViewState.LIBRARY]: Library,
  [ViewState.PROFILE]: User,
};

const DEFAULT_NAV_ORDER = [
    ViewState.DASHBOARD, ViewState.CONVERSATION, ViewState.VOCABULARY, ViewState.GRAMMAR, 
    ViewState.PHRASAL_VERBS, ViewState.EXAMS, ViewState.WRITING, ViewState.TRANSLATOR,
    ViewState.TUTOR, ViewState.STUDY_PLAN, ViewState.LIBRARY, ViewState.PROFILE
];

export const Sidebar: React.FC<Props> = ({ currentView, setView, stats }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [currentLevel, setCurrentLevel] = useState<Level>('C1');
  const [targetLang, setTargetLang] = useState<TargetLanguage>('English');
  const [navOrder, setNavOrder] = useState<string[]>([]);
  const [isReordering, setIsReordering] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);

  const refreshConfig = () => {
      const profile = StorageService.getProfile();
      if(profile.level) setCurrentLevel(profile.level);
      if(profile.targetLanguage) setTargetLang(profile.targetLanguage);

      const savedOrder = StorageService.getNavOrder();
      if (savedOrder.length > 0) {
          // Ensure consistency
          const allIds = Object.keys(NAV_ICONS);
          const filteredSaved = savedOrder.filter(id => allIds.includes(id));
          const missing = allIds.filter(id => !filteredSaved.includes(id));
          setNavOrder([...filteredSaved, ...missing]);
      } else {
          setNavOrder(DEFAULT_NAV_ORDER);
      }
  };

  useEffect(() => {
      refreshConfig();
      // Listen for global updates
      window.addEventListener('statsUpdated', refreshConfig);
      return () => window.removeEventListener('statsUpdated', refreshConfig);
  }, [stats]);

  const toggleLevel = () => {
      const levels: Level[] = ['A2', 'B1', 'B2', 'C1', 'C2'];
      const currentIndex = levels.indexOf(currentLevel);
      const nextLevel = levels[(currentIndex + 1) % levels.length];
      
      const profile = StorageService.getProfile();
      profile.level = nextLevel;
      StorageService.saveProfile(profile);
      setCurrentLevel(nextLevel);
      window.dispatchEvent(new Event('statsUpdated'));
  };

  const saveOrder = () => {
      StorageService.saveNavOrder(navOrder);
      setIsReordering(false);
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
      setDraggedItem(index);
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
      e.preventDefault();
      if (draggedItem === null) return;

      const newOrder = [...navOrder];
      const movedItem = newOrder.splice(draggedItem, 1)[0];
      newOrder.splice(dropIndex, 0, movedItem);

      setNavOrder(newOrder);
      setDraggedItem(null);
  };

  return (
    <div 
        className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white h-screen flex flex-col border-r border-slate-200 shadow-sm transition-[width] duration-300 ease-in-out z-20 relative`}
    >
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-8 bg-white border border-slate-200 rounded-full p-1 text-slate-400 hover:text-blue-600 shadow-sm z-50 hover:scale-110 transition-transform hidden md:block"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={`p-4 ${isCollapsed ? 'px-2 justify-center' : 'md:p-6'} flex items-center gap-3 border-b border-slate-100`}>
        <button 
            onClick={toggleLevel}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-500 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-200 transition-colors cursor-pointer"
            title="Click to switch level"
        >
          {currentLevel}
        </button>
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'w-0 opacity-0 hidden md:block' : 'w-auto opacity-100'}`}>
            <h1 className="font-bold text-lg tracking-tight text-slate-800 whitespace-nowrap">
                Pitinglis Ai
            </h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 space-y-1 scrollbar-hide">
        {navOrder.map((id, index) => {
            const viewId = id as ViewState;
            const Icon = NAV_ICONS[viewId];
            const label = UI_TRANSLATIONS[targetLang][viewId] || viewId;

            return (
              <div
                key={viewId}
                draggable={isReordering}
                onDragStart={(e) => handleDragStart(e, index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => !isReordering && setView(viewId)}
                title={isCollapsed ? label : ''}
                className={`w-full flex items-center gap-4 px-4 py-3 text-sm font-medium transition-all relative group duration-200
                  ${currentView === viewId && !isReordering
                    ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                  }
                  ${isCollapsed ? 'justify-center px-2' : 'px-6'}
                  ${isReordering ? 'cursor-move border-2 border-dashed border-transparent hover:border-slate-300' : 'cursor-pointer'}
                  ${isReordering && draggedItem === index ? 'opacity-50' : 'opacity-100'}
                `}
              >
                {isReordering && !isCollapsed && <GripVertical size={16} className="text-slate-300 mr-1" />}
                
                <Icon size={20} className={`flex-shrink-0 transition-colors ${currentView === viewId && !isReordering ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                
                <div className={`overflow-hidden transition-all duration-200 ease-out ${isCollapsed ? 'w-0 opacity-0 hidden md:block' : 'w-auto opacity-100'}`}>
                    <span className="whitespace-nowrap block">{label}</span>
                </div>

                {/* Mobile Label Fallback or Tooltip */}
                {isCollapsed && !isReordering && (
                    <div className="absolute left-14 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg hidden md:block">
                        {label}
                    </div>
                )}
              </div>
            );
        })}
      </div>

      {/* Settings / Reorder Toggle */}
      <div className={`p-2 border-t border-slate-100 bg-white flex justify-center`}>
           <button 
                onClick={() => isReordering ? saveOrder() : setIsReordering(true)}
                className={`p-2 rounded-lg transition-all flex items-center gap-2 text-xs font-bold ${isReordering ? 'bg-green-100 text-green-700 w-full justify-center' : 'text-slate-400 hover:bg-slate-50'}`}
                title="Reorder Menu"
           >
               {isReordering ? <Check size={16} /> : <Settings2 size={16} />}
               {!isCollapsed && (isReordering ? "Guardar Orden" : "")}
           </button>
      </div>

      <div className={`p-4 border-t border-slate-100 bg-slate-50 transition-all duration-300 ${isCollapsed ? 'items-center justify-center' : ''}`}>
        <div className="flex flex-col gap-2">
            {!isCollapsed ? (
                <div className="flex justify-between text-xs text-slate-500 uppercase font-bold tracking-wider animate-fade-in">
                    <span>Rank {stats.level}</span>
                    <span className="text-orange-500">{stats.streak} Day Streak</span>
                </div>
            ) : (
                <div className="text-[10px] font-bold text-slate-400 text-center mb-1">Rk {stats.level}</div>
            )}
            
            <div className={`bg-slate-200 h-2 rounded-full overflow-hidden transition-all ${isCollapsed ? 'w-8' : 'w-full'}`}>
                <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-1000" 
                    style={{ width: `${(stats.xp % 1000) / 10}%` }}
                />
            </div>
        </div>
      </div>
    </div>
  );
};