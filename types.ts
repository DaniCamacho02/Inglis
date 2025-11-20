export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  VOCABULARY = 'VOCABULARY',
  GRAMMAR = 'GRAMMAR',
  WRITING = 'WRITING',
  PHRASAL_VERBS = 'PHRASAL_VERBS',
  STUDY_PLAN = 'STUDY_PLAN',
  TUTOR = 'TUTOR',
  LIBRARY = 'LIBRARY',
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  lastLogin: string; // ISO Date string
  mistakesFixed: number;
  wordsLearned: number;
}

export interface VocabCard {
  id: string;
  word: string;
  definitionES: string;
  exampleEN: string;
  synonyms: string[];
  mastered: boolean;
}

export interface GrammarChart {
  id: string;
  title: string;
  definition: string;
  structure: string;
  examples: string[];
  tips: string;
  commonMistakes: string[]; // New field for more complete info
  nativeNuance: string;     // New field for "C2 level detail"
  timestamp: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Mistake {
  id: string;
  type: 'grammar' | 'vocab';
  question: string;
  correctAnswer: string;
  userAnswer?: string;
  explanation: string;
  timestamp: number;
}

export interface WritingSubmission {
  id: string;
  type: string;
  originalText: string;
  correctedText: string;
  score: number;
  feedback: string;
  date: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export const THEMES = {
  [ViewState.DASHBOARD]: {
    bg: 'bg-white',
    accent: 'text-blue-600',
    img: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=1200&q=80',
    title: 'Nexus Dashboard'
  },
  [ViewState.VOCABULARY]: {
    bg: 'bg-slate-50',
    accent: 'text-indigo-600',
    img: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?auto=format&fit=crop&w=1200&q=80',
    title: 'Lexicon Builder'
  },
  [ViewState.GRAMMAR]: {
    bg: 'bg-slate-50',
    accent: 'text-teal-600',
    img: 'https://images.unsplash.com/photo-1555421689-491a97ff2040?auto=format&fit=crop&w=1200&q=80',
    title: 'Grammar Master'
  },
  [ViewState.WRITING]: {
    bg: 'bg-slate-50',
    accent: 'text-orange-600',
    img: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80',
    title: 'Writing Studio'
  },
  [ViewState.PHRASAL_VERBS]: {
    bg: 'bg-slate-50',
    accent: 'text-red-600',
    img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    title: 'Phrasal Verbs'
  },
  [ViewState.TUTOR]: {
    bg: 'bg-slate-50',
    accent: 'text-cyan-600',
    img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=80',
    title: 'Pool-E Tutor'
  },
  [ViewState.LIBRARY]: {
    bg: 'bg-slate-50',
    accent: 'text-violet-600',
    img: 'https://images.unsplash.com/photo-1507842217158-27228d450fbd?auto=format&fit=crop&w=1200&q=80',
    title: 'My Library'
  },
  [ViewState.STUDY_PLAN]: {
    bg: 'bg-slate-50',
    accent: 'text-emerald-600',
    img: 'https://images.unsplash.com/photo-1506784365847-bbad939e9335?auto=format&fit=crop&w=1200&q=80',
    title: 'Study Roadmap'
  }
};