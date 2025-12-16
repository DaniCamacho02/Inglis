
export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  VOCABULARY = 'VOCABULARY',
  GRAMMAR = 'GRAMMAR',
  WRITING = 'WRITING',
  PHRASAL_VERBS = 'PHRASAL_VERBS',
  STUDY_PLAN = 'STUDY_PLAN',
  TUTOR = 'TUTOR',
  LIBRARY = 'LIBRARY',
  EXAMS = 'EXAMS',
  PROFILE = 'PROFILE',
  CONVERSATION = 'CONVERSATION',
  TRANSLATOR = 'TRANSLATOR'
}

export type AvatarId = 'deadpool' | 'cap' | 'ironman' | 'wolverine' | 'spidey';
export type Level = 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type TargetLanguage = 'English' | 'French' | 'Italian' | 'Spanish';

export interface UserProfile {
  username: string;
  avatarId: AvatarId;
  level: Level;
  targetLanguage: TargetLanguage;
}

export interface UserStats {
  xp: number;
  level: number; // RPG Level
  streak: number;
  lastLogin: string; // ISO Date string
  mistakesFixed: number;
  wordsLearned: number;
  examHighScores: Record<string, number>; // Exam ID -> Score
  skills: {
      reading: number;
      writing: number;
      listening: number;
      grammar: number;
      vocab: number;
  }
}

export interface VocabCard {
  id: string;
  word: string;
  translationES: string; // BIG on card back
  definitionES: string;  // UPDATED: Spanish explanation
  exampleEN: string; // Now generic "exampleTarget"
  synonyms: string[];
  mastered: boolean;
  definitionEN?: string; // Legacy support
  language?: string;
  favorite?: boolean;
}

export interface GrammarChart {
  id: string;
  title: string;
  definition: string;
  structure: string; // The "Formula"
  usageContext: string; // "When to use it"
  examples: string[];
  tips: string;
  commonMistakes: string[]; 
  nativeNuance: string; // C1/C2 specific polish
  mnemonic: string;     // Memory rule
  visualMetaphor: string; // Description for mental image
  timestamp: number;
  customSections?: { title: string; content: string }[]; 
  language?: string;
}

export interface StudyTask {
    id: string;
    description: string;
    completed: boolean;
}

export interface StudyDay {
    day: string; // "Monday", "Tuesday"...
    focus: string;
    tasks: StudyTask[];
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// --- COMPLEX EXAM TYPES ---
export type ExamSectionType = 'READING' | 'CLOZE' | 'MATCHING' | 'TRANSFORMATION' | 'WORD_FORMATION';

export interface BaseSection {
    id: string;
    type: ExamSectionType;
    title: string;
    instruction: string;
}

export interface ReadingSection extends BaseSection {
    type: 'READING';
    text: string;
    questions: QuizQuestion[];
}

export interface ClozeGap {
    id: number;
    answer: string;
}

export interface ClozeSection extends BaseSection {
    type: 'CLOZE';
    textWithGaps: string; // "This is a (1) ____ text."
    gaps: ClozeGap[];
}

export interface MatchingPair {
    id: string;
    left: string;
    right: string;
}

export interface MatchingSection extends BaseSection {
    type: 'MATCHING';
    pairs: MatchingPair[];
}

export interface TransformationItem {
    id: string;
    sentence1: string;
    keyword: string;
    sentence2: string; // "I (1) _____ the bus." (Contains gap)
    answer: string; // The correct phrase
}

export interface TransformationSection extends BaseSection {
    type: 'TRANSFORMATION';
    items: TransformationItem[];
}

export interface WordFormationItem {
    id: string;
    sentence: string; 
    rootWord: string; 
    answer: string; 
}

export interface WordFormationSection extends BaseSection {
    type: 'WORD_FORMATION';
    items: WordFormationItem[];
}

export type ExamSection = ReadingSection | ClozeSection | MatchingSection | TransformationSection | WordFormationSection;

export interface ComplexExam {
    id: string;
    title: string;
    sections: ExamSection[];
}

export interface Mistake {
  id: string;
  type: 'grammar' | 'vocab';
  question: string;
  correctAnswer: string;
  userAnswer?: string;
  explanation: string;
  timestamp: number;
  language?: string;
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

// NEW: Translator Interface
export interface TranslationResult {
    mainTranslation: string;
    alternatives: string[];
    nuance: string;
    keyVocabulary: string[];
}

// --- UI TRANSLATIONS ---
export const UI_TRANSLATIONS: Record<TargetLanguage, Record<string, string>> = {
    'English': {
        [ViewState.DASHBOARD]: 'Pitinglis Dashboard',
        [ViewState.CONVERSATION]: 'Comms Uplink',
        [ViewState.VOCABULARY]: 'Lexicon Builder',
        [ViewState.GRAMMAR]: 'Grammar Master',
        [ViewState.PHRASAL_VERBS]: 'Phrasal Verbs',
        [ViewState.EXAMS]: 'Combat Simulator',
        [ViewState.WRITING]: 'Writing Studio',
        [ViewState.TRANSLATOR]: 'Nexus Translator',
        [ViewState.TUTOR]: 'AI Tutor',
        [ViewState.STUDY_PLAN]: 'Study Roadmap',
        [ViewState.LIBRARY]: 'My Library',
        [ViewState.PROFILE]: 'Agent Profile'
    },
    'Spanish': {
        [ViewState.DASHBOARD]: 'Panel Pitinglis',
        [ViewState.CONVERSATION]: 'Enlace de Comms',
        [ViewState.VOCABULARY]: 'Constructor Léxico',
        [ViewState.GRAMMAR]: 'Maestro Gramática',
        [ViewState.PHRASAL_VERBS]: 'Frases Verbales',
        [ViewState.EXAMS]: 'Simulador Combate',
        [ViewState.WRITING]: 'Estudio Escritura',
        [ViewState.TRANSLATOR]: 'Traductor Nexus',
        [ViewState.TUTOR]: 'Tutor IA',
        [ViewState.STUDY_PLAN]: 'Plan de Estudio',
        [ViewState.LIBRARY]: 'Mi Biblioteca',
        [ViewState.PROFILE]: 'Perfil Agente'
    },
    'French': {
        [ViewState.DASHBOARD]: 'Tableau Pitinglis',
        [ViewState.CONVERSATION]: 'Liaison Comms',
        [ViewState.VOCABULARY]: 'Vocabulaire',
        [ViewState.GRAMMAR]: 'Maître Grammaire',
        [ViewState.PHRASAL_VERBS]: 'Verbes à Particule',
        [ViewState.EXAMS]: 'Simulateur Combat',
        [ViewState.WRITING]: 'Atelier Écriture',
        [ViewState.TRANSLATOR]: 'Traducteur Nexus',
        [ViewState.TUTOR]: 'Tuteur IA',
        [ViewState.STUDY_PLAN]: 'Plan d\'Étude',
        [ViewState.LIBRARY]: 'Ma Bibliothèque',
        [ViewState.PROFILE]: 'Profil Agent'
    },
    'Italian': {
        [ViewState.DASHBOARD]: 'Pannello Pitinglis',
        [ViewState.CONVERSATION]: 'Collegamento Comms',
        [ViewState.VOCABULARY]: 'Vocabolario',
        [ViewState.GRAMMAR]: 'Maestro Grammatica',
        [ViewState.PHRASAL_VERBS]: 'Verbi Frasali',
        [ViewState.EXAMS]: 'Simulatore Lotta',
        [ViewState.WRITING]: 'Studio Scrittura',
        [ViewState.TRANSLATOR]: 'Traduttore Nexus',
        [ViewState.TUTOR]: 'Tutor IA',
        [ViewState.STUDY_PLAN]: 'Piano di Studio',
        [ViewState.LIBRARY]: 'La Mia Libreria',
        [ViewState.PROFILE]: 'Profilo Agente'
    }
};

export const THEMES = {
  [ViewState.DASHBOARD]: {
    bg: 'bg-white',
    accent: 'text-blue-600',
    img: 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?auto=format&fit=crop&w=1200&q=80',
    title: 'Pitinglis Dashboard'
  },
  [ViewState.VOCABULARY]: {
    bg: 'bg-slate-50',
    accent: 'text-indigo-600',
    img: 'https://images.unsplash.com/photo-1543165796-5426273eaab3?auto=format&fit=crop&w=1200&q=80',
    title: 'Lexicon Builder'
  },
  [ViewState.GRAMMAR]: {
    bg: 'bg-slate-50',
    accent: 'text-teal-600',
    img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80',
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
  },
  [ViewState.EXAMS]: {
    bg: 'bg-slate-50',
    accent: 'text-rose-600',
    img: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    title: 'Combat Simulator'
  },
  [ViewState.PROFILE]: {
    bg: 'bg-slate-50',
    accent: 'text-slate-600',
    img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    title: 'Agent Profile'
  },
  [ViewState.CONVERSATION]: {
    bg: 'bg-slate-900',
    accent: 'text-sky-500',
    img: 'https://images.unsplash.com/photo-1478737270239-2f02b77ac6d5?auto=format&fit=crop&w=1200&q=80',
    title: 'Comms Uplink'
  },
  [ViewState.TRANSLATOR]: {
    bg: 'bg-slate-50',
    accent: 'text-fuchsia-600',
    img: 'https://images.unsplash.com/photo-1543165796-5426273eaab3?auto=format&fit=crop&w=1200&q=80',
    title: 'Nexus Translator'
  }
};