"use client"

import QuizCard from '@/components/quiz/QuizCard'
import AnalyticsDashboard from '@/components/dashboard/AnalyticsDashboard'
import { useUserStore } from '@/store/userStore'

export default function Dashboard() {
  const { isDemoMode, toggleDemoMode, profile } = useUserStore()

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-wrap gap-4 justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-primary/30">
              G
            </div>
            <h1 className="font-black text-xl text-gray-900 tracking-tight">GATE AI platform</h1>
          </div>
          
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-3 cursor-pointer group">
              <span className={`text-sm font-bold transition-colors ${isDemoMode ? 'text-primary' : 'text-gray-400'}`}>
                Demo Mode 🔥
              </span>
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={isDemoMode} onChange={toggleDemoMode} />
                <div className={`block w-12 h-7 rounded-full transition-colors ${isDemoMode ? 'bg-primary' : 'bg-gray-200'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform ${isDemoMode ? 'transform translate-x-5' : ''}`}></div>
              </div>
            </label>
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900">{profile.name}</p>
                <p className="text-xs text-primary font-bold tracking-wider uppercase">Level {profile.topicsMastered + 1}</p>
              </div>
              <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold">
                {profile.name.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
          
          <div className="xl:col-span-4 space-y-10">
            <section>
              <div className="mb-6 flex items-baseline justify-between">
                <h2 className="text-2xl font-black text-gray-900">Active Module</h2>
              </div>
              <QuizCard topic={profile.recommendedTopic} />
            </section>
            
            <section className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">🎯 Daily Challenge</h3>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                <p className="text-sm text-blue-900 font-medium mb-3">Solve 3 Hard problems in `{profile.recommendedTopic}` to rank up.</p>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '33%' }}></div>
                </div>
                <p className="text-xs text-blue-700 font-bold mt-2 text-right">1/3 Completed</p>
              </div>
            </section>
          </div>

          <div className="xl:col-span-8">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Performance Dashboard</h2>
            <AnalyticsDashboard />
          </div>

        </div>
      </main>
    </div>
  )
}
