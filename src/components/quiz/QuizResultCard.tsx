"use client"

import { motion } from 'framer-motion'

interface QuizResultCardProps {
  topic: string
  totalQuestions: number
  correctAnswers: number
  wrongAnswers: number
  onRestart: () => void
  onClose?: () => void
  onContinue?: () => void
}

export default function QuizResultCard({
  topic,
  totalQuestions,
  correctAnswers,
  wrongAnswers,
  onRestart,
  onClose,
  onContinue,
}: QuizResultCardProps) {
  const attempted = correctAnswers + wrongAnswers
  const unattempted = Math.max(0, totalQuestions - attempted)
  const accuracy = attempted === 0 ? 0 : (correctAnswers / attempted) * 100
  const accuracyDisplay = accuracy.toFixed(1)

  const getAccuracyColor = () => {
    if (accuracy >= 80) return { bar: '#22c55e', text: 'text-green-600', label: 'Excellent Performance! 🏆' }
    if (accuracy >= 60) return { bar: '#f59e0b', text: 'text-yellow-600', label: 'Good Work! Keep it up 💪' }
    if (accuracy >= 40) return { bar: '#f97316', text: 'text-orange-600', label: 'Room for Improvement 📚' }
    return { bar: '#ef4444', text: 'text-red-600', label: 'Needs More Practice 🔄' }
  }

  const { bar, text, label } = getAccuracyColor()

  const metrics = [
    { icon: '📋', label: 'Total Questions', value: totalQuestions, color: 'bg-gray-100 text-gray-800', border: 'border-gray-200' },
    { icon: '🎯', label: 'Attempted', value: attempted, color: 'bg-blue-50 text-blue-800', border: 'border-blue-200' },
    { icon: '✅', label: 'Correct', value: correctAnswers, color: 'bg-green-50 text-green-800', border: 'border-green-200' },
    { icon: '❌', label: 'Wrong', value: wrongAnswers, color: 'bg-red-50 text-red-800', border: 'border-red-200' },
    { icon: '⭕', label: 'Unattempted', value: unattempted, color: 'bg-gray-50 text-gray-600', border: 'border-gray-100' },
  ]

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Header Trophy Card */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-8 mb-4 text-white text-center relative overflow-hidden shadow-2xl">
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
          >
            ❌
          </button>
        )}
        {/* Background glow */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ background: `radial-gradient(ellipse at 50% 0%, ${bar} 0%, transparent 70%)` }} />
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="text-6xl mb-3"
        >
          🏆
        </motion.div>
        <h2 className="text-2xl font-black mb-1">Quiz Complete!</h2>
        <p className="text-gray-400 text-sm font-medium uppercase tracking-widest">{topic}</p>

        {/* Big accuracy circle */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 inline-flex flex-col items-center"
        >
          <div
            className="w-28 h-28 rounded-full flex flex-col items-center justify-center border-4 shadow-lg"
            style={{ borderColor: bar, boxShadow: `0 0 30px ${bar}44` }}
          >
            <span className="text-3xl font-black" style={{ color: bar }}>{accuracyDisplay}%</span>
            <span className="text-gray-400 text-xs font-semibold">Accuracy</span>
          </div>
          <p className={`mt-3 text-sm font-bold ${text}`}>{label}</p>
        </motion.div>
      </div>

      {/* Metrics Grid */}
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-gray-100 mb-4">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">📊 Performance Breakdown</h3>
        <div className="space-y-3">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i + 0.3 }}
              className={`flex items-center justify-between px-4 py-3 rounded-2xl border ${m.color} ${m.border}`}
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{m.icon}</span>
                <span className="font-semibold text-sm">{m.label}</span>
              </div>
              <span className="font-black text-xl">{m.value}</span>
            </motion.div>
          ))}
        </div>

        {/* Accuracy Progress Bar */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-gray-500">📈 Accuracy</span>
            <span className="text-sm font-black" style={{ color: bar }}>{accuracyDisplay}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${accuracy}%` }}
              transition={{ delay: 0.6, duration: 0.9, ease: 'easeOut' }}
              className="h-3 rounded-full"
              style={{ background: `linear-gradient(90deg, ${bar}88, ${bar})` }}
            />
          </div>
        </div>

        {/* Correct vs Wrong mini bars */}
        {attempted > 0 && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-green-600 font-semibold">Correct</span>
                <span className="text-xs text-green-600 font-bold">{((correctAnswers / attempted) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-green-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(correctAnswers / attempted) * 100}%` }}
                  transition={{ delay: 0.8, duration: 0.7 }}
                  className="h-2 bg-green-500 rounded-full"
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-xs text-red-500 font-semibold">Wrong</span>
                <span className="text-xs text-red-500 font-bold">{((wrongAnswers / attempted) * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full bg-red-100 rounded-full h-2 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(wrongAnswers / attempted) * 100}%` }}
                  transition={{ delay: 0.9, duration: 0.7 }}
                  className="h-2 bg-red-400 rounded-full"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Chat Insight Box */}
      <div className="bg-gray-900 rounded-3xl p-5 mb-4 border border-gray-700">
        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">🤖 AI Insight</p>
        <p className="text-white text-sm leading-relaxed">
          Here&apos;s your performance 👇<br />
          You attempted <strong>{attempted}</strong> out of <strong>{totalQuestions}</strong> questions.<br />
          ✅ Correct: <span className="text-green-400 font-bold">{correctAnswers}</span> &nbsp;
          ❌ Wrong: <span className="text-red-400 font-bold">{wrongAnswers}</span> &nbsp;
          ⭕ Skipped: <span className="text-gray-400 font-bold">{unattempted}</span><br />
          📈 Accuracy: <span className="font-black" style={{ color: bar }}>{accuracyDisplay}%</span>
        </p>
        {accuracy >= 80 && (
          <div className="mt-4 space-y-1">
            <p className="text-green-400 text-sm font-semibold">• Good performance in {topic}!</p>
            <p className="text-gray-300 text-sm font-semibold">• Great job! Keep improving 🚀</p>
            <p className="text-blue-400 text-sm font-semibold">• Next Recommended Topic: Advanced {topic}</p>
          </div>
        )}
        {accuracy >= 50 && accuracy < 80 && (
          <div className="mt-4 space-y-1">
            <p className="text-yellow-400 text-sm font-semibold">• You handled medium-level questions well.</p>
            <p className="text-gray-300 text-sm font-semibold">• Improve {topic} concepts</p>
            <p className="text-blue-400 text-sm font-semibold">• Next Recommended Topic: Review {topic}</p>
          </div>
        )}
        {accuracy < 50 && attempted > 0 && (
          <div className="mt-4 space-y-1">
            <p className="text-orange-400 text-sm font-semibold">• Needs more practice in {topic}.</p>
            <p className="text-gray-300 text-sm font-semibold">• Consider revisiting fundamentals.</p>
            <p className="text-blue-400 text-sm font-semibold">• Next Recommended Topic: Basic {topic}</p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onRestart}
          className="flex-1 py-4 rounded-2xl font-bold text-lg bg-gray-100 text-gray-800 hover:bg-gray-200 transition-all border border-gray-300 shadow-md"
        >
          🔁 Retry Quiz
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={onContinue || onClose}
          className="flex-1 py-4 rounded-2xl font-bold text-lg text-white shadow-xl transition-all"
          style={{ background: 'linear-gradient(135deg, #ff6b00, #ff8c38)' }}
        >
          ➡ Continue
        </motion.button>
      </div>
    </div>
  )
}
