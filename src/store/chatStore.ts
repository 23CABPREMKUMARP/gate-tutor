import { create } from 'zustand'

export type MessageType = 'text' | 'quiz' | 'analytics' | 'topic_selection' | 'quiz_analysis'

export interface Message {
  id: string
  sender: 'user' | 'ai'
  text: string
  type: MessageType
  payload?: any
}

export interface QuizSession {
  isActive: boolean
  subject: string
  topic: string
  mode: string
  totalQuestions: number
  attempted: number
  correct: number
  streak: number
  totalTimeSeconds: number
  weakConcepts: string[]
}

interface ChatState {
  messages: Message[]
  isTyping: boolean
  session: QuizSession
  addMessage: (msg: Omit<Message, 'id'>) => void
  setTyping: (typing: boolean) => void
  startSession: (subject: string, topic: string, mode: string) => void
  updateSessionMetrics: (isCorrect: boolean, timeTaken: number, concept: string) => void
  endSession: () => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [
    {
      id: 'welcome',
      sender: 'ai',
      type: 'text',
      text: '👋 Welcome to your GATE AI Tutor! I provide adaptive learning matched to your cognitive profile. Ready to dominate the GATE? Select "Start Quiz" to pick a subject.'
    }
  ],
  isTyping: false,
  session: {
    isActive: false,
    subject: '',
    topic: '',
    mode: '',
    totalQuestions: 10,
    attempted: 0,
    correct: 0,
    streak: 0,
    totalTimeSeconds: 0,
    weakConcepts: []
  },
  addMessage: (msg) => set((state) => ({ 
    messages: [...state.messages, { ...msg, id: Date.now().toString() + Math.random().toString() }] 
  })),
  setTyping: (typing) => set({ isTyping: typing }),
  
  startSession: (subject, topic, mode) => set(() => ({
    session: { isActive: true, subject, topic, mode, totalQuestions: 10, attempted: 0, correct: 0, streak: 0, totalTimeSeconds: 0, weakConcepts: [] }
  })),

  updateSessionMetrics: (isCorrect, timeTaken, concept) => set((state) => {
    const newWeakConcepts = [...state.session.weakConcepts]
    if (!isCorrect && !newWeakConcepts.includes(concept)) newWeakConcepts.push(concept)
    return {
      session: {
        ...state.session,
        attempted: state.session.attempted + 1,
        correct: isCorrect ? state.session.correct + 1 : state.session.correct,
        streak: isCorrect ? state.session.streak + 1 : 0,
        totalTimeSeconds: state.session.totalTimeSeconds + timeTaken,
        weakConcepts: newWeakConcepts
      }
    }
  }),

  endSession: () => set((state) => ({
    session: { ...state.session, isActive: false }
  }))
}))
