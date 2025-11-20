import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Mascot } from './components/Mascot';
import { Dashboard } from './views/Dashboard';
import { Vocabulary } from './views/Vocabulary';
import { Grammar } from './views/Grammar';
import { Writing } from './views/Writing';
import { Tutor } from './views/Tutor';
import { Library } from './views/Library';
import { StudyPlan } from './views/StudyPlan';
import { PhrasalVerbs } from './views/PhrasalVerbs';
import { ViewState, THEMES, UserStats } from './types';
import { StorageService } from './services/storageService';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [stats, setStats] = useState<UserStats>(StorageService.getStats());

  useEffect(() => {
    const updateStats = () => setStats(StorageService.getStats());
    window.addEventListener('statsUpdated', updateStats);
    return () => window.removeEventListener('statsUpdated', updateStats);
  }, []);

  const activeTheme = THEMES[currentView];

  const renderView = () => {
    switch(currentView) {
      case ViewState.DASHBOARD: return <Dashboard stats={stats} />;
      case ViewState.VOCABULARY: return <Vocabulary />;
      case ViewState.GRAMMAR: return <Grammar />;
      case ViewState.WRITING: return <Writing />;
      case ViewState.TUTOR: return <Tutor />;
      case ViewState.PHRASAL_VERBS: return <PhrasalVerbs />;
      case ViewState.STUDY_PLAN: return <StudyPlan />;
      case ViewState.LIBRARY: return <Library />;
      default: return <Dashboard stats={stats} />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      <Sidebar currentView={currentView} setView={setCurrentView} stats={stats} />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Dynamic Header */}
        <header className="relative h-40 md:h-52 flex-shrink-0 overflow-hidden">
            {/* Image Layer */}
            <img 
                src={activeTheme.img} 
                alt="Header" 
                className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-[30s]"
            />
            
            {/* Gradient Overlay for Text Readability (Light Theme) */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent z-10" />
            
            <div className="absolute bottom-4 left-8 z-20">
                <h2 className={`text-3xl md:text-5xl font-extrabold tracking-tight ${activeTheme.accent} drop-shadow-sm`}>
                    {activeTheme.title}
                </h2>
            </div>
        </header>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth bg-slate-50">
            <div className="max-w-6xl mx-auto pb-24">
                {renderView()}
            </div>
        </div>
      </main>
      
      <Mascot />
    </div>
  );
}