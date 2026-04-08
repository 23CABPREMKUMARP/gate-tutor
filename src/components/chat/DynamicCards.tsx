"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useChatStore } from '@/store/chatStore'
import { Line } from 'react-chartjs-2'

export function AnalyticsCard({ payload }: { payload: any }) {
  const chartData = {
    labels: ['Attempt 1', 'Attempt 2', 'Attempt 3', 'Attempt 4', 'Attempt 5', 'Latest'],
    datasets: [{
      label: 'Accuracy',
      data: payload.history || [40, 50, 45, 60, 65, 72],
      borderColor: '#FF6B00',
      backgroundColor: 'rgba(255,107,0,0.1)',
      fill: true,
      tension: 0.4
    }]
  }

  const options = { responsive: true, plugins: { legend: { display: false } }, maintainAspectRatio: false }

  return (
    <div className="bg-white shadow-sm border border-gray-100 p-5 rounded-2xl w-full max-w-sm mt-3 mb-2">
      <div className="flex gap-4 mb-4">
        <div className="flex-1 bg-gray-50 p-3 rounded-xl">
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Overall</p>
          <p className="text-xl font-black text-gray-900">{payload.overallAccuracy}%</p>
        </div>
        <div className="flex-1 bg-red-50 p-3 rounded-xl">
          <p className="text-[10px] text-red-400 font-bold uppercase tracking-wider mb-1">Needs Work</p>
          <p className="text-xs font-bold text-red-700">{payload.weakAreas?.join(', ') || 'N/A'}</p>
        </div>
      </div>
      <div className="h-32 w-full">
        <Line data={chartData} options={options} />
      </div>
    </div>
  )
}

export function TopicSelectionCard() {
  const { startSession, addMessage, setTyping, session } = useChatStore()
  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState('')

  const GATE_SUBJECTS = {
    'General Aptitude': ['Verbal Ability', 'Numerical Ability'],
    'Engineering Mathematics': ['Discrete Mathematics', 'Linear Algebra', 'Calculus', 'Probability'],
    'Computer Science': ['Programming & DS', 'Algorithms', 'Operating Systems', 'DBMS', 'Computer Networks']
  }

  const handleStart = async (mode: string) => {
    if (!subject || !topic) return
    startSession(subject, topic, mode)
    addMessage({ sender: 'user', type: 'text', text: `I want to practice ${topic} in ${subject}. Mode: ${mode}. Let's begin!` })
    setTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: "Generate first question", context: { newSession: true, subject, topic, mode } })
      })
      const data = await res.json()
      addMessage({ sender: 'ai', type: data.type, text: data.text, payload: data.payload })
    } finally {
      setTyping(false)
    }
  }

  if (session.isActive) return null; // Hide if already started

  return (
    <div className="bg-white shadow-lg border border-gray-100 p-6 rounded-2xl w-full max-w-sm mt-3 mb-2">
      <h3 className="font-black text-gray-900 mb-4 text-lg border-b pb-2">🎯 Module Selection</h3>
      
      {!subject ? (
        <div className="space-y-2">
          <p className="text-sm font-bold text-gray-500 mb-3">Select a Core Subject:</p>
          {Object.keys(GATE_SUBJECTS).map((sub) => (
            <button key={sub} onClick={() => setSubject(sub)} className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-primary/10 hover:text-primary hover:border-primary border border-gray-100 rounded-xl font-bold transition-all text-sm">
              {sub}
            </button>
          ))}
        </div>
      ) : !topic ? (
        <div className="space-y-2">
          <button onClick={() => setSubject('')} className="text-xs text-primary font-bold mb-2">← Back to Subjects</button>
          <p className="text-sm font-bold text-gray-500 mb-3">Select a Topic in {subject}:</p>
          {(GATE_SUBJECTS as any)[subject].map((top: string) => (
            <button key={top} onClick={() => setTopic(top)} className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-primary/10 hover:text-primary hover:border-primary border border-gray-100 rounded-xl font-bold transition-all text-sm">
               {top}
            </button>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl text-center">
             <p className="text-xs uppercase tracking-wider font-bold text-primary mb-1">{subject}</p>
             <p className="font-black text-gray-900">{topic}</p>
          </div>
          <button onClick={() => setTopic('')} className="text-xs text-gray-400 font-bold block mx-auto hover:text-gray-600">Change Topic</button>
          
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button onClick={() => handleStart('Easy')} className="bg-green-50 text-green-700 py-3 rounded-xl font-bold text-xs hover:bg-green-100 border border-green-200">Start Easy</button>
            <button onClick={() => handleStart('Adaptive')} className="bg-primary text-white py-3 flex-col rounded-xl font-bold text-xs hover:bg-primary-600 shadow-md shadow-primary/30 col-span-2">Start Adaptive Engine 🚀</button>
          </div>
        </div>
      )}
    </div>
  )
}

export function QuizAnalysisCard({ payload }: { payload: any }) {
  if (!payload) return null;
  const attempted = payload.attempted || 0;
  const total = payload.totalQuestions || 20; // Defaulting to 20 as per example
  const correct = payload.correct || 0;
  const wrong = Math.max(attempted - correct, 0);
  const unattempted = Math.max(total - attempted, 0);
  const accuracy = attempted > 0 ? ((correct / attempted) * 100).toFixed(1) : "0";
  const avgTime = attempted > 0 ? Math.round(payload.totalTimeSeconds / attempted) : 0;

  // Insight Logic
  const accuracyNum = parseFloat(accuracy);
  let insight = "Keep practicing! Focus on understanding the core concepts.";
  if (accuracyNum > 80) insight = "Outstanding performance! You are on track for a top rank.";
  else if (accuracyNum > 60) insight = "Good progress. Try improving accuracy by managing your time per question.";
  else if (accuracyNum > 40) insight = "Steady start. Re-review the topics where you missed multiple questions.";

  return (
    <div className="bg-white shadow-[0_12px_40px_rgb(0,0,0,0.12)] border border-gray-100 p-7 rounded-[2rem] w-full max-w-sm mt-3 mb-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-primary via-orange-400 to-yellow-400"></div>
      
      <div className="flex items-center justify-between mb-8">
        <h3 className="font-black text-2xl text-gray-900 tracking-tight">📊 Performance Report</h3>
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-xl shadow-inner">🏆</div>
      </div>
      
      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-2xl border border-gray-100 transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-sm">📋</span>
            <span className="font-bold text-gray-600 text-sm">Total Questions</span>
          </div>
          <span className="font-black text-lg text-gray-900">{total}</span>
        </div>

        <div className="flex justify-between items-center p-3.5 bg-blue-50/50 rounded-2xl border border-blue-100 transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-sm">✍️</span>
            <span className="font-bold text-blue-700 text-sm">Attempted</span>
          </div>
          <span className="font-black text-lg text-blue-700">{attempted}</span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-green-50 border border-green-100 p-4 rounded-2xl text-center transition-all hover:scale-[1.02]">
            <p className="text-[10px] uppercase font-black text-green-600 tracking-widest mb-1">✅ Correct</p>
            <p className="text-2xl font-black text-green-700">{correct}</p>
          </div>
          <div className="bg-red-50 border border-red-100 p-4 rounded-2xl text-center transition-all hover:scale-[1.02]">
            <p className="text-[10px] uppercase font-black text-red-600 tracking-widest mb-1">❌ Wrong</p>
            <p className="text-2xl font-black text-red-700">{wrong}</p>
          </div>
        </div>

        <div className="flex justify-between items-center p-3.5 bg-gray-50/50 rounded-2xl border border-gray-200 transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm">⭕</span>
            <span className="font-bold text-gray-400 text-sm italic">Unattempted</span>
          </div>
          <span className="font-black text-lg text-gray-400">{unattempted}</span>
        </div>
      </div>

      <div className="mb-8 p-5 border border-primary/20 bg-primary/5 rounded-3xl relative overflow-hidden">
        <div className="flex justify-between items-end mb-3">
           <div>
             <span className="text-[10px] text-primary font-black uppercase tracking-widest block mb-1">📈 Final Accuracy</span>
             <span className="text-3xl font-black text-gray-900">{accuracy}%</span>
           </div>
           {accuracyNum >= 75 && <div className="text-2xl animate-bounce">🔥</div>}
        </div>
        <div className="w-full bg-gray-200/50 rounded-full h-3.5 overflow-hidden shadow-inner border border-gray-100">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${accuracy}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={`h-full rounded-full ${accuracyNum > 70 ? 'bg-green-500' : accuracyNum > 40 ? 'bg-orange-400' : 'bg-red-500'} shadow-[0_0_10px_rgba(34,197,94,0.3)]`}
          />
        </div>
        <p className="text-[9px] text-gray-400 font-bold mt-2.5">Progress tracked in real-time by AI Adaptive Engine</p>
      </div>

      <div className="bg-gray-900 text-white rounded-[1.5rem] p-5 shadow-xl relative group transition-all hover:bg-gray-800">
        <div className="flex items-start gap-4">
           <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-xl shrink-0 group-hover:rotate-12 transition-transform">🧠</div>
           <div>
             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1.5">AI Insights for {payload.topic || 'Module'}</p>
             <p className="text-sm font-medium leading-relaxed italic pr-2">{insight}</p>
             {payload.weakConcepts && payload.weakConcepts.length > 0 && (
               <div className="mt-3 flex flex-wrap gap-1.5 pb-1">
                 {payload.weakConcepts.map((c: string) => (
                   <span key={c} className="text-[9px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-full font-bold"># {c}</span>
                 ))}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  )
}

export function QuizCard({ payload }: { payload: any }) {
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [showHint, setShowHint] = useState<number>(0)
  const [startTime] = useState(Date.now())
  const { addMessage, setTyping, updateSessionMetrics, session } = useChatStore()

  const handleSelect = async (idx: number) => {
    if (submitted) return
    setSelectedOpt(idx)
    
    const timeTaken = Math.round((Date.now() - startTime) / 1000)
    const isCorrect = idx === payload.correctIndex
    
    if (isCorrect || attempts >= 1) {
      setSubmitted(true)
      // Update local Session Metrics organically
      updateSessionMetrics(isCorrect, timeTaken, payload.conceptTag || 'General')

      addMessage({
        sender: 'user',
        type: 'text',
        text: `I chose ${String.fromCharCode(65 + idx)}. Time taken: ${timeTaken}s.`
      })

      setTyping(true)

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: 'Evaluate answer', 
            context: { 
              isQuizAnswer: true, 
               selectedOption: idx, 
              expectedAnswer: payload.correctIndex,
              questionId: payload.id,
              session
            } 
          })
        })
        const data = await res.json()
        addMessage({
          sender: 'ai',
          type: data.type,
          text: data.text,
          payload: data.payload
        })
      } finally {
        setTyping(false)
      }
    } else {
      // Failed attempt inside Chat UI
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      setShowHint(newAttempts);
      setSelectedOpt(null); // allow retrying
      
      addMessage({
        sender: 'user',
        type: 'text',
        text: `I guessed ${String.fromCharCode(65 + idx)}.`
      });

      let hintMsg = newAttempts === 1 
        ? `That's incorrect ❌. Hint 1: ${payload.hint || "Review your basic rules for this topic."}`
        : `Still stuck? 🧠 Hint 2: Think deeply about ${payload.conceptTag || "the core concepts."}`;
        
      addMessage({
        sender: 'ai',
        type: 'text',
        text: hintMsg
      });
    }
  }


  return (
    <div className="bg-[#fcfdfd] shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-200 p-6 rounded-3xl w-full max-md:max-w-full mt-4 mb-2">
      <div className="flex justify-between items-center mb-5">
        <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-md border shadow-sm ${
          payload.difficulty === 'easy' ? 'bg-green-50 text-green-700 border-green-200' :
          payload.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
          'bg-red-50 text-red-700 border-red-200'
        }`}>
          {payload.difficulty}
        </span>
        <span className="text-xs bg-gray-100 text-gray-500 font-bold px-3 py-1.5 rounded-full">{payload.topic}</span>
      </div>
      <p className="font-black text-gray-900 text-base mb-6 leading-relaxed">{payload.question}</p>
      
      <div className="space-y-3">
        {payload.options.map((opt: string, idx: number) => (
          <button
            key={idx}
            disabled={submitted}
            onClick={() => handleSelect(idx)}
            className={`w-full flex items-center gap-4 text-left text-sm px-5 py-4 rounded-xl border-2 ${
              submitted 
                ? (idx === payload.correctIndex ? 'bg-green-50 border-green-500 text-green-900 shadow-sm' : idx === selectedOpt ? 'bg-red-50 border-red-300 text-red-900' : 'bg-gray-50/50 border-transparent text-gray-300 grayscale')
                : 'bg-white border-gray-100 hover:border-primary hover:bg-primary/5 text-gray-800 shadow-sm hover:shadow-md'
            } transition-all duration-200`}
          >
            <span className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-black ${submitted && idx === payload.correctIndex ? 'border-green-600 bg-green-600 text-white' : 'border-gray-200 text-gray-400'}`}>
               {String.fromCharCode(65 + idx)}
            </span>
            <span className="font-medium">{opt}</span>
          </button>
        ))}
      </div>

      {showHint > 0 && !submitted && (
        <div className="mt-5 space-y-3">
          {showHint >= 1 && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-sm text-orange-800 shadow-inner">
              <strong>Hint 1:</strong> {payload.hint || "Check your formulas."}
            </motion.div>
          )}
          {showHint >= 2 && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl text-sm text-yellow-800 shadow-inner">
              <strong>Hint 2:</strong> Concept rule around {payload.conceptTag || "this topic."}
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}
