import { create } from 'zustand';
import { ResumeData, EvaluationData, RoadmapData } from '../services/api';

interface InterviewState {
  // User info
  userName: string;
  setUserName: (name: string) => void;
  
  // Resume
  resume: ResumeData | null;
  setResume: (resume: ResumeData) => void;
  
  // Interview settings
  difficulty: 'easy' | 'medium' | 'hard';
  setDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void;
  
  voiceName: string;
  setVoiceName: (voice: string) => void;
  
  // Session
  sessionId: string | null;
  setSessionId: (id: string) => void;
  
  // Interview state
  currentQuestion: string;
  setCurrentQuestion: (question: string) => void;
  
  conversationHistory: Array<{
    question: string;
    answer: string;
    audio_url?: string;
    video_url?: string;
  }>;
  addToHistory: (item: {
    question: string;
    answer: string;
    audio_url?: string;
    video_url?: string;
  }) => void;
  
  // Results
  evaluation: EvaluationData | null;
  setEvaluation: (eval: EvaluationData) => void;
  
  roadmap: RoadmapData | null;
  setRoadmap: (roadmap: RoadmapData) => void;
  
  // UI state
  isInterviewActive: boolean;
  setIsInterviewActive: (active: boolean) => void;
  
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Reset
  reset: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  userName: '',
  setUserName: (name) => set({ userName: name }),
  
  resume: null,
  setResume: (resume) => set({ resume }),
  
  difficulty: 'medium',
  setDifficulty: (difficulty) => set({ difficulty }),
  
  voiceName: 'Sia',
  setVoiceName: (voice) => set({ voiceName: voice }),
  
  sessionId: null,
  setSessionId: (id) => set({ sessionId: id }),
  
  currentQuestion: '',
  setCurrentQuestion: (question) => set({ currentQuestion: question }),
  
  conversationHistory: [],
  addToHistory: (item) =>
    set((state) => ({
      conversationHistory: [...state.conversationHistory, item],
    })),
  
  evaluation: null,
  setEvaluation: (evaluation) => set({ evaluation }),
  
  roadmap: null,
  setRoadmap: (roadmap) => set({ roadmap }),
  
  isInterviewActive: false,
  setIsInterviewActive: (active) => set({ isInterviewActive: active }),
  
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  reset: () =>
    set({
      userName: '',
      resume: null,
      difficulty: 'medium',
      voiceName: 'Sia',
      sessionId: null,
      currentQuestion: '',
      conversationHistory: [],
      evaluation: null,
      roadmap: null,
      isInterviewActive: false,
      isLoading: false,
    }),
}));
