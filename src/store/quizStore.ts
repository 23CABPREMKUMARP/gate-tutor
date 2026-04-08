import { create } from 'zustand'

interface QuestionStat {
  questionId: string;
  status: 'correct' | 'wrong' | 'skipped';
}

interface QuizState {
  currentQuestion: any | null
  questions: any[]
  currentScore: number
  seenIds: string[]
  questionStats: QuestionStat[]
  totalQuestions: number
  setCurrentQuestion: (q: any) => void
  setQuestions: (qs: any[]) => void
  addScore: (score: number) => void
  addSeenId: (id: string) => void
  setTotalQuestions: (total: number) => void
  addQuestionStat: (stat: QuestionStat) => void
}

export const useQuizStore = create<QuizState>((set) => ({
  currentQuestion: null,
  questions: [],
  currentScore: 0,
  seenIds: [],
  questionStats: [],
  totalQuestions: 0,
  setCurrentQuestion: (q) => set({ currentQuestion: q }),
  setQuestions: (qs) => set({ questions: qs }),
  addScore: (score) => set((state) => ({ currentScore: state.currentScore + score })),
  addSeenId: (id) => set((state) => ({ seenIds: [...state.seenIds, id] })),
  setTotalQuestions: (total) => set({ totalQuestions: total }),
  addQuestionStat: (stat) => set((state) => {
    // Only add if not already present
    if (state.questionStats.some(s => s.questionId === stat.questionId)) return state;
    return { questionStats: [...state.questionStats, stat] };
  }),
}))
