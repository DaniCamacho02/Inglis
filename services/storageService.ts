
import { UserStats, VocabCard, Mistake, WritingSubmission, GrammarChart, UserProfile, StudyDay } from '../types';

const KEYS = {
  STATS: 'nexus_stats',
  VOCAB: 'nexus_vocab',
  GRAMMAR_CHARTS: 'nexus_grammar_charts',
  MISTAKES: 'nexus_mistakes',
  WRITING: 'nexus_writing',
  PLAN: 'nexus_plan_v2',
  PROFILE: 'nexus_profile',
  NAV_ORDER: 'nexus_nav_order'
};

const INITIAL_STATS: UserStats = {
  xp: 0,
  level: 1,
  streak: 1,
  lastLogin: new Date().toISOString(),
  mistakesFixed: 0,
  wordsLearned: 0,
  examHighScores: {},
  skills: {
      reading: 50,
      writing: 50,
      listening: 50,
      grammar: 50,
      vocab: 50
  }
};

export const StorageService = {
  // --- Profile & Sync ---
  getProfile: (): UserProfile => {
      const stored = localStorage.getItem(KEYS.PROFILE);
      // Default to English if not present
      return stored ? { targetLanguage: 'English', ...JSON.parse(stored) } : { username: 'Agent', avatarId: 'deadpool', level: 'C1', targetLanguage: 'English' };
  },

  saveProfile: (profile: UserProfile) => {
      localStorage.setItem(KEYS.PROFILE, JSON.stringify(profile));
  },

  exportData: (): string => {
      const data: Record<string, any> = {};
      Object.values(KEYS).forEach(key => {
          data[key] = localStorage.getItem(key);
      });
      return btoa(JSON.stringify(data));
  },

  importData: (base64Data: string): boolean => {
      // Legacy import - overwrites
      try {
          const decoded = atob(base64Data);
          const data = JSON.parse(decoded);
          Object.entries(data).forEach(([key, value]) => {
              if (value) localStorage.setItem(key, value as string);
          });
          return true;
      } catch (e) {
          return false;
      }
  },

  mergeData: (base64Data: string): { success: boolean, details: string } => {
      try {
          // Robust decoding: sometimes files add whitespace
          const cleanData = base64Data.trim();
          const decoded = atob(cleanData);
          const importedData = JSON.parse(decoded);
          const addedDetails: string[] = [];

          // 1. Merge Stats & Exam Scores
          if (importedData[KEYS.STATS]) {
              const currentStats = StorageService.getStats();
              const newStats = JSON.parse(importedData[KEYS.STATS]) as UserStats;
              
              currentStats.xp += newStats.xp;
              currentStats.wordsLearned += newStats.wordsLearned;
              currentStats.mistakesFixed += newStats.mistakesFixed;
              currentStats.level = Math.max(currentStats.level, newStats.level);
              currentStats.streak = Math.max(currentStats.streak, newStats.streak);
              
              // Merge skills (average)
              if (newStats.skills) {
                   Object.keys(currentStats.skills).forEach(key => {
                       const k = key as keyof typeof currentStats.skills;
                       currentStats.skills[k] = Math.round((currentStats.skills[k] + newStats.skills[k]) / 2);
                   });
              }

              // Merge Exam High Scores (Keep highest)
              if (newStats.examHighScores) {
                  Object.entries(newStats.examHighScores).forEach(([examId, score]) => {
                      if (!currentStats.examHighScores[examId] || score > currentStats.examHighScores[examId]) {
                          currentStats.examHighScores[examId] = score;
                      }
                  });
              }

              localStorage.setItem(KEYS.STATS, JSON.stringify(currentStats));
              addedDetails.push(`+${newStats.xp} XP`);
          }

          // 2. Merge Vocab (No Duplicates)
          if (importedData[KEYS.VOCAB]) {
              const currentVocab = StorageService.getVocab();
              const newVocab = JSON.parse(importedData[KEYS.VOCAB]) as VocabCard[];
              let addedCount = 0;
              
              newVocab.forEach(card => {
                  if (!currentVocab.some(c => c.word === card.word)) {
                      currentVocab.push(card);
                      addedCount++;
                  }
              });
              
              localStorage.setItem(KEYS.VOCAB, JSON.stringify(currentVocab));
              if (addedCount > 0) addedDetails.push(`${addedCount} palabras nuevas`);
          }

          // 3. Merge Grammar
          if (importedData[KEYS.GRAMMAR_CHARTS]) {
              const currentCharts = StorageService.getGrammarCharts();
              const newCharts = JSON.parse(importedData[KEYS.GRAMMAR_CHARTS]) as GrammarChart[];
              let addedCount = 0;

              newCharts.forEach(chart => {
                  if (!currentCharts.some(c => c.title === chart.title)) {
                      currentCharts.push(chart);
                      addedCount++;
                  }
              });

              localStorage.setItem(KEYS.GRAMMAR_CHARTS, JSON.stringify(currentCharts));
              if (addedCount > 0) addedDetails.push(`${addedCount} infografías`);
          }

          // 4. Merge Mistakes
          if (importedData[KEYS.MISTAKES]) {
              const currentMistakes = StorageService.getMistakes();
              const newMistakes = JSON.parse(importedData[KEYS.MISTAKES]) as Mistake[];
              let addedCount = 0;

              newMistakes.forEach(mistake => {
                  // Avoid duplicates based on question content
                  if (!currentMistakes.some(m => m.question === mistake.question)) {
                      currentMistakes.push(mistake);
                      addedCount++;
                  }
              });

              localStorage.setItem(KEYS.MISTAKES, JSON.stringify(currentMistakes));
              if (addedCount > 0) addedDetails.push(`${addedCount} errores`);
          }

          // 5. Merge Writing History
          if (importedData[KEYS.WRITING]) {
              const currentWriting = StorageService.getWriting();
              const newWriting = JSON.parse(importedData[KEYS.WRITING]) as WritingSubmission[];
              let addedCount = 0;

              newWriting.forEach(sub => {
                  if (!currentWriting.some(w => w.id === sub.id)) {
                      currentWriting.push(sub);
                      addedCount++;
                  }
              });
              
              // Sort by date new to old
              currentWriting.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

              localStorage.setItem(KEYS.WRITING, JSON.stringify(currentWriting));
              if (addedCount > 0) addedDetails.push(`${addedCount} redacciones`);
          }

          // 6. Merge Study Plan (Use imported if current is empty)
          if (importedData[KEYS.PLAN]) {
              const currentPlan = StorageService.getPlan();
              if (!currentPlan || currentPlan.length === 0) {
                   localStorage.setItem(KEYS.PLAN, importedData[KEYS.PLAN]);
                   addedDetails.push("Plan de estudio");
              }
          }

          return { success: true, details: addedDetails.length > 0 ? addedDetails.join(", ") : "Todo estaba ya sincronizado." };

      } catch (e) {
          console.error(e);
          return { success: false, details: "Datos corruptos o ilegibles." };
      }
  },

  // --- Stats ---
  getStats: (): UserStats => {
    try {
        const stored = localStorage.getItem(KEYS.STATS);
        if (!stored) return INITIAL_STATS;
        const stats = JSON.parse(stored);
        
        // Migration check for skills
        if (!stats.skills) stats.skills = INITIAL_STATS.skills;
        
        const last = new Date(stats.lastLogin).toDateString();
        const today = new Date().toDateString();
        if (last !== today) {
           stats.lastLogin = new Date().toISOString();
           localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
        }
        if (!stats.examHighScores) stats.examHighScores = {};
        return stats;
    } catch (e) {
        return INITIAL_STATS;
    }
  },

  addXP: (amount: number, skill?: keyof UserStats['skills']) => {
    const stats = StorageService.getStats();
    stats.xp += amount;
    const newLevel = Math.floor(stats.xp / 1000) + 1;
    if (newLevel > stats.level) {
        stats.level = newLevel;
    }
    if (amount > 0 && amount < 50) stats.wordsLearned += 1;
    if (amount >= 25 && amount <= 30) stats.mistakesFixed += 1;

    if (skill) {
        stats.skills[skill] = Math.min(100, stats.skills[skill] + 1);
    }
    
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
    window.dispatchEvent(new Event('statsUpdated'));
    return stats;
  },

  // --- Vocabulary ---
  saveVocab: (card: VocabCard) => {
    const current = StorageService.getVocab();
    const profile = StorageService.getProfile();
    const lang = profile.targetLanguage || 'English';
    card.language = lang;

    if (!current.find(c => c.word === card.word)) {
      current.unshift(card); 
      localStorage.setItem(KEYS.VOCAB, JSON.stringify(current));
      StorageService.addXP(10, 'vocab');
    }
  },

  getVocab: (): VocabCard[] => {
    const stored = localStorage.getItem(KEYS.VOCAB);
    return stored ? JSON.parse(stored) : [];
  },
  
  removeVocab: (id: string) => {
    const current = StorageService.getVocab();
    const updated = current.filter(c => c.id !== id);
    localStorage.setItem(KEYS.VOCAB, JSON.stringify(updated));
  },

  toggleVocabFavorite: (id: string) => {
      const current = StorageService.getVocab();
      const updated = current.map(c => c.id === id ? { ...c, favorite: !c.favorite } : c);
      localStorage.setItem(KEYS.VOCAB, JSON.stringify(updated));
      return updated;
  },

  // --- Grammar Charts ---
  saveGrammarChart: (chart: GrammarChart) => {
    const current = StorageService.getGrammarCharts();
    const profile = StorageService.getProfile();
    chart.language = profile.targetLanguage || 'English';

    if (!current.find(c => c.title === chart.title)) {
      current.unshift(chart);
      localStorage.setItem(KEYS.GRAMMAR_CHARTS, JSON.stringify(current));
      StorageService.addXP(50, 'grammar');
    }
  },

  getGrammarCharts: (): GrammarChart[] => {
    const stored = localStorage.getItem(KEYS.GRAMMAR_CHARTS);
    return stored ? JSON.parse(stored) : [];
  },

  removeGrammarChart: (id: string) => {
    const current = StorageService.getGrammarCharts();
    const updated = current.filter(c => c.id !== id);
    localStorage.setItem(KEYS.GRAMMAR_CHARTS, JSON.stringify(updated));
  },

  // --- Mistakes ---
  saveMistake: (mistake: Mistake) => {
    const current = StorageService.getMistakes();
    const profile = StorageService.getProfile();
    mistake.language = profile.targetLanguage || 'English';
    current.push(mistake);
    localStorage.setItem(KEYS.MISTAKES, JSON.stringify(current));
  },

  getMistakes: (): Mistake[] => {
    const stored = localStorage.getItem(KEYS.MISTAKES);
    return stored ? JSON.parse(stored) : [];
  },

  removeMistake: (id: string) => {
    const current = StorageService.getMistakes();
    const updated = current.filter(m => m.id !== id);
    localStorage.setItem(KEYS.MISTAKES, JSON.stringify(updated));
    StorageService.addXP(25); 
  },

  // --- Writing ---
  saveWriting: (sub: WritingSubmission) => {
    const current = StorageService.getWriting();
    current.unshift(sub);
    localStorage.setItem(KEYS.WRITING, JSON.stringify(current));
    StorageService.addXP(100, 'writing');
  },

  getWriting: (): WritingSubmission[] => {
    const stored = localStorage.getItem(KEYS.WRITING);
    return stored ? JSON.parse(stored) : [];
  },
  
  // --- Study Plan (Updated for V2) ---
  savePlan: (plan: StudyDay[]) => {
      localStorage.setItem(KEYS.PLAN, JSON.stringify(plan));
  },
  
  getPlan: (): StudyDay[] => {
      const stored = localStorage.getItem(KEYS.PLAN);
      if (!stored) return [];
      try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) return parsed;
          return [];
      } catch (e) {
          return [];
      }
  },

  toggleTask: (dayIndex: number, taskId: string) => {
      const plan = StorageService.getPlan();
      if (plan[dayIndex]) {
          const task = plan[dayIndex].tasks.find(t => t.id === taskId);
          if (task) {
              task.completed = !task.completed;
              if (task.completed) StorageService.addXP(15);
              localStorage.setItem(KEYS.PLAN, JSON.stringify(plan));
          }
      }
      return plan;
  },

  // --- Nav Order ---
  getNavOrder: (): string[] => {
      const stored = localStorage.getItem(KEYS.NAV_ORDER);
      return stored ? JSON.parse(stored) : [];
  },

  saveNavOrder: (order: string[]) => {
      localStorage.setItem(KEYS.NAV_ORDER, JSON.stringify(order));
  }
};