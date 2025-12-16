
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
import { Exams } from './views/Exams';
import { Profile } from './views/Profile';
import { Conversation } from './views/Conversation';
import { Translator } from './views/Translator';
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

  const activeTheme = THEMES[currentView] || THEMES[ViewState.DASHBOARD];

  // Helper to render view with persistence (hidden instead of unmounted)
  const renderPersistentView = (view: ViewState, Component: React.ReactNode) => {
      const isVisible = currentView === view;
      return (
          <div className={`${isVisible ? 'block h-full' : 'hidden h-full'}`}>
              {Component}
          </div>
      );
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
      <Sidebar currentView={currentView} setView={setCurrentView} stats={stats} />
      
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Dynamic Header */}
        <header className="relative h-40 md:h-52 flex-shrink-0 overflow-hidden transition-all duration-500">
            {/* Image Layer - We update the src based on active theme */}
            <img 
                key={activeTheme.img} // Key forces animation on change
                src={activeTheme.img} 
                alt="Header" 
                className="w-full h-full object-cover animate-fade-in"
            />
            
            {/* Gradient Overlay for Text Readability (Light Theme) */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/80 to-transparent z-10" />
            
            <div className="absolute bottom-4 left-8 z-20">
                <h2 className={`text-3xl md:text-5xl font-extrabold tracking-tight ${activeTheme.accent} drop-shadow-sm`}>
                    {activeTheme.title}
                </h2>
            </div>
        </header>

        {/* Main Content Area - All views generated but only one visible */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth bg-slate-50">
            <div className="max-w-6xl mx-auto pb-24 h-full">
                {renderPersistentView(ViewState.DASHBOARD, <Dashboard stats={stats} />)}
                {renderPersistentView(ViewState.VOCABULARY, <Vocabulary />)}
                {renderPersistentView(ViewState.GRAMMAR, <Grammar />)}
                {renderPersistentView(ViewState.WRITING, <Writing />)}
                {renderPersistentView(ViewState.TUTOR, <Tutor />)}
                {renderPersistentView(ViewState.PHRASAL_VERBS, <PhrasalVerbs />)}
                {renderPersistentView(ViewState.STUDY_PLAN, <StudyPlan />)}
                {renderPersistentView(ViewState.LIBRARY, <Library />)}
                {renderPersistentView(ViewState.EXAMS, <Exams />)}
                {renderPersistentView(ViewState.PROFILE, <Profile />)}
                {renderPersistentView(ViewState.CONVERSATION, <Conversation />)}
                {renderPersistentView(ViewState.TRANSLATOR, <Translator />)}
            </div>
        </div>
      </main>
      
      <Mascot />
    </div>
  );
}
