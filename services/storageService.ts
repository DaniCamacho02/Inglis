import { UserStats, VocabCard, Mistake, WritingSubmission, GrammarChart } from '../types';

const KEYS = {
  STATS: 'nexus_stats',
  VOCAB: 'nexus_vocab',
  GRAMMAR_CHARTS: 'nexus_grammar_charts',
  MISTAKES: 'nexus_mistakes',
  WRITING: 'nexus_writing',
  PLAN: 'nexus_plan'
};

const INITIAL_STATS: UserStats = {
  xp: 0,
  level: 1,
  streak: 1,
  lastLogin: new Date().toISOString(),
  mistakesFixed: 0,
  wordsLearned: 0
};

export const StorageService = {
  getStats: (): UserStats => {
    const stored = localStorage.getItem(KEYS.STATS);
    if (!stored) return INITIAL_STATS;
    const stats = JSON.parse(stored);
    // Simple streak check
    const last = new Date(stats.lastLogin).toDateString();
    const today = new Date().toDateString();
    if (last !== today) {
       // In a real app, check if yesterday to increment streak, else reset
       // For demo, we just update the login date
       stats.lastLogin = new Date().toISOString();
       localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
    }
    return stats;
  },

  addXP: (amount: number) => {
    const stats = StorageService.getStats();
    stats.xp += amount;
    const newLevel = Math.floor(stats.xp / 1000) + 1;
    if (newLevel > stats.level) {
        stats.level = newLevel;
    }
    if (amount > 0 && amount < 50) stats.wordsLearned += 1;
    if (amount >= 25 && amount <= 30) stats.mistakesFixed += 1;
    
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
    window.dispatchEvent(new Event('statsUpdated'));
    return stats;
  },

  // --- Vocabulary ---
  saveVocab: (card: VocabCard) => {
    const current = StorageService.getVocab();
    if (!current.find(c => c.word === card.word)) {
      current.unshift(card); // Add to top
      localStorage.setItem(KEYS.VOCAB, JSON.stringify(current));
      StorageService.addXP(10);
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

  // --- Grammar Charts ---
  saveGrammarChart: (chart: GrammarChart) => {
    const current = StorageService.getGrammarCharts();
    if (!current.find(c => c.title === chart.title)) {
      current.unshift(chart);
      localStorage.setItem(KEYS.GRAMMAR_CHARTS, JSON.stringify(current));
      StorageService.addXP(50);
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
    StorageService.addXP(25); // Bonus for fixing mistake
  },

  // --- Writing ---
  saveWriting: (sub: WritingSubmission) => {
    const current = StorageService.getWriting();
    current.unshift(sub);
    localStorage.setItem(KEYS.WRITING, JSON.stringify(current));
    StorageService.addXP(100);
  },

  getWriting: (): WritingSubmission[] => {
    const stored = localStorage.getItem(KEYS.WRITING);
    return stored ? JSON.parse(stored) : [];
  },
  
  savePlan: (plan: string) => {
      localStorage.setItem(KEYS.PLAN, plan);
  },
  
  getPlan: (): string => {
      return localStorage.getItem(KEYS.PLAN) || "";
  }
};