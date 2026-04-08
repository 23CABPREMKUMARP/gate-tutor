import { create } from 'zustand'

export interface AttemptLog {
  date: string
  accuracy: number
}

export interface UserProfile {
  id: string
  name: string
  overallAccuracy: number
  streak: number
  topicsMastered: number
  history: AttemptLog[]
  weakAreas: string[]
  recommendedTopic: string
}

interface UserState {
  profile: UserProfile
  isDemoMode: boolean
  toggleDemoMode: () => void
  updateProfile: (profile: Partial<UserProfile>) => void
}

const defaultProfile: UserProfile = {
  id: 'new-user',
  name: 'GATE Aspirant',
  overallAccuracy: 0,
  streak: 0,
  topicsMastered: 0,
  history: [],
  weakAreas: [],
  recommendedTopic: 'Operating Systems'
}

const demoProfile: UserProfile = {
  id: 'demo-user',
  name: 'Demo Student',
  overallAccuracy: 78,
  streak: 14,
  topicsMastered: 5,
  history: [
    { date: 'Mon', accuracy: 40 },
    { date: 'Tue', accuracy: 55 },
    { date: 'Wed', accuracy: 50 },
    { date: 'Thu', accuracy: 65 },
    { date: 'Fri', accuracy: 72 },
    { date: 'Sat', accuracy: 80 },
    { date: 'Sun', accuracy: 78 }
  ],
  weakAreas: ['Paging', 'Normalization'],
  recommendedTopic: 'DBMS'
}

export const useUserStore = create<UserState>((set) => ({
  profile: defaultProfile,
  isDemoMode: false,
  toggleDemoMode: () => set((state) => ({ 
    isDemoMode: !state.isDemoMode,
    profile: !state.isDemoMode ? demoProfile : defaultProfile 
  })),
  updateProfile: (updates) => set((state) => ({
    profile: { ...state.profile, ...updates }
  }))
}))
