"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuizStore } from '@/store/quizStore'
import { useChatStore } from '@/store/chatStore'
import QuizResultCard from '@/components/quiz/QuizResultCard'

export default function QuizCard({ topic }: { topic: string }) {
  const [loading, setLoading] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{ isCorrect: boolean, explanation: string, nextDifficulty: string, hint: string, conceptSummary: string } | null>(null)
  const [isFinished, setIsFinished] = useState(false)
  const [timeLeft, setTimeLeft] = useState(120) // 2 min timer
  const [showHint, setShowHint] = useState<number>(0)
  const [attempts, setAttempts] = useState(0)
  const [chatSent, setChatSent] = useState(false)
  const { currentQuestion, setCurrentQuestion, seenIds, addSeenId, questionStats, totalQuestions, setTotalQuestions, addQuestionStat } = useQuizStore()
  const { addMessage, endSession } = useChatStore()

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (currentQuestion && !feedback && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000)
    } else if (timeLeft === 0 && !feedback) {
      handleSubmit(true) // Auto submit on timeout
    }
    return () => clearInterval(timer)
  }, [currentQuestion, feedback, timeLeft])

  const generateQuiz = async (difficulty: string) => {
    setLoading(true)
    setFeedback(null)
    setSelectedOption(null)
    setShowHint(0)
    setAttempts(0)
    setTimeLeft(difficulty === 'hard' ? 90 : 120)
    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty, seenIds })
      })
      if (res.status === 404) {
        setIsFinished(true)
        setCurrentQuestion(null)
        return
      }
      const data = await res.json()
      setCurrentQuestion(data)
      setTotalQuestions(data.totalTopicQuestions || 0)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (autoSubmit = false) => {
    if ((selectedOption === null && !autoSubmit) || !currentQuestion) return;
    
    setLoading(true)
    const isSkipped = autoSubmit && selectedOption === null
    const isCorrect = !isSkipped && selectedOption === currentQuestion.correctIndex
    
    try {
      if (isCorrect || isSkipped || attempts >= 1) {
        // Terminal attempt (either correct, skipped, or failed twice already)
        addQuestionStat({
          questionId: currentQuestion.id,
          status: isSkipped ? 'skipped' : (isCorrect ? 'correct' : 'wrong')
        })

        // Compute new accuracy for the engine explicitly
        const correctCount = questionStats.filter(s => s.status === 'correct').length;
        const attemptedCount = questionStats.filter(s => s.status === 'correct' || s.status === 'wrong').length;
        const newAccuracy = (correctCount + (isCorrect ? 1 : 0)) / (attemptedCount + 1);

        const res = await fetch('/api/adaptive-engine', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'demo-user',
            topic,
            accuracy: newAccuracy,
            timeTaken: 120 - timeLeft,
            retries: attempts
          })
        })
        const adaptData = await res.json()
        addSeenId(currentQuestion.id)
        
        let aiMsg = isCorrect 
          ? `Correct! 🎯 ${adaptData.adaptiveFeedback}` 
          : `That's incorrect. Let's go over the explanation! ${adaptData.adaptiveFeedback}`;

        addMessage({ sender: 'ai', type: 'text', text: aiMsg });

        setFeedback({
          isCorrect,
          explanation: currentQuestion.explanation,
          nextDifficulty: adaptData.nextDifficulty,
          hint: currentQuestion.hint,
          conceptSummary: currentQuestion.conceptSummary
        })
      } else {
        // Failed attempt — Trigger multi-tier hints
        const newAttempts = attempts + 1
        setAttempts(newAttempts)
        setShowHint(newAttempts)
        setSelectedOption(null)
        
        let hintMsg = newAttempts === 1 
          ? `That's incorrect ❌. Hint 1: ${currentQuestion.hint}`
          : `Still stuck? 🧠 Hint 2: Remember this concept: ${currentQuestion.conceptSummary}`;
          
        addMessage({ sender: 'ai', type: 'text', text: hintMsg });
      }
    } finally {
      setLoading(false)
    }
  }

  // Analytics computation
  const correctCount = questionStats.filter(s => s.status === 'correct').length;
  const wrongCount = questionStats.filter(s => s.status === 'wrong').length;
  const skippedCount = questionStats.filter(s => s.status === 'skipped').length;
  const attemptedCount = correctCount + wrongCount;
  // If we haven't answered some from the total topic pool, they are unattempted. Total = attempted + skipped + completely unseen.
  const actualUnattempted = (totalQuestions || 0) - attemptedCount;

  useEffect(() => {
    if (isFinished && !chatSent) {
      setChatSent(true);
      const accuracy = attemptedCount === 0 ? 0 : (correctCount / attemptedCount) * 100;
      
      let summaryText = "";
      if (accuracy < 50) {
         summaryText = `\n\n**📑 Auto-Summary for ${topic}**\n* ⚠️ **Key Issue**: Found multiple concept gaps.\n* 🔄 **Recommendation**: Please revisit primary formulas and structural dependency rules. You might be confusing intermediate concepts.`;
      } else if (accuracy < 75) {
         summaryText = `\n\n**📑 Auto-Summary for ${topic}**\n* ⚖️ **Key Issue**: Solid fundamentals but stumbling on trickier edge-cases.\n* 🎯 **Recommendation**: Practice tracking boundary conditions closely. I recommend attempting more medium-level problems next.`;
      } else {
         summaryText = `\n\n**📑 Auto-Summary for ${topic}**\n* 🏆 **Key Issue**: Near-perfect execution. No obvious conceptual gaps!\n* 🚀 **Recommendation**: Keep doing what you're doing. You are ready for high-difficulty GATE simulations!`;
      }

      const msg = `Here's your performance 👇\n\n* You attempted ${attemptedCount} out of ${totalQuestions} questions\n* ✅ Correct: ${correctCount}\n* ❌ Wrong: ${wrongCount}\n* ⭕ Skipped / Unattempted: ${actualUnattempted}\n* 📈 Accuracy: ${accuracy.toFixed(1)}%${summaryText}`;
      
      addMessage({
        sender: 'ai',
        text: msg,
        type: 'text'
      });
      
      endSession();
    }
  }, [isFinished, chatSent, attemptedCount, totalQuestions, correctCount, wrongCount, actualUnattempted, addMessage, endSession, topic]);

  return (
    <div className="w-full">
      {!currentQuestion && !loading && !feedback ? (
        <motion.div 
          onClick={() => generateQuiz('medium')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="group cursor-pointer relative overflow-hidden bg-gradient-to-br from-primary to-primary-600 text-white p-8 rounded-3xl shadow-[0_20px_40px_rgba(255,107,0,0.3)] border border-primary/50"
        >
          <div className="relative z-10">
            <h3 className="text-2xl font-black mb-2">{seenIds.length === 0 ? 'Start Adaptive Environment' : 'Continue Simulation'}</h3>
            <p className="text-white/80 font-medium">Topic: {topic} • AI Calibrated</p>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 group-hover:scale-110 transition-transform duration-500">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 22h20L12 2zm0 4.1L18.4 19H5.6L12 6.1z"/></svg>
          </div>
        </motion.div>
      ) : (
        <AnimatePresence mode="wait">
          {currentQuestion && (
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white/80 backdrop-blur-2xl rounded-[2rem] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-white/60 relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <span className="bg-gray-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg tracking-widest uppercase">
                    GATE {new Date().getFullYear()}
                  </span>
                  <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border ${
                    currentQuestion.difficulty === 'easy' ? 'bg-green-50 text-green-700 border-green-200' :
                    currentQuestion.difficulty === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {currentQuestion.difficulty}
                  </span>
                </div>
                <div className={`flex items-center gap-2 font-mono text-lg font-bold ${timeLeft < 30 ? 'text-red-500 animate-pulse' : 'text-gray-500'}`}>
                  ⏰ {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                </div>
              </div>
              
              <h2 className="text-2xl font-black text-gray-900 mb-8 leading-snug">
                {currentQuestion.question}
              </h2>

              <div className="space-y-4 mb-8">
                {currentQuestion.options.map((opt: string, idx: number) => {
                  let btnClass = 'bg-white border-2 border-gray-100 hover:border-gray-300 hover:bg-gray-50 text-gray-700'
                  
                  if (feedback) {
                    if (idx === currentQuestion.correctIndex) {
                      btnClass = 'bg-green-50 border-2 border-green-500 text-green-800 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
                    } else if (idx === selectedOption) {
                      btnClass = 'bg-red-50 border-2 border-red-500 text-red-800'
                    } else {
                      btnClass = 'bg-gray-50/30 border-2 border-gray-100/50 text-gray-300 grayscale'
                    }
                  } else if (selectedOption === idx) {
                    btnClass = 'bg-primary/5 border-2 border-primary text-primary font-bold shadow-sm'
                  }

                  return (
                    <button
                      key={idx}
                      disabled={feedback !== null}
                      onClick={() => setSelectedOption(idx)}
                      className={`w-full text-left px-6 py-5 rounded-2xl transition-all duration-200 relative overflow-hidden ${btnClass}`}
                    >
                      <div className="flex gap-4 items-center">
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                          (selectedOption === idx || (feedback && idx === currentQuestion.correctIndex)) ? 'border-current' : 'border-gray-200 text-gray-400'
                        }`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                    </button>
                  )
                })}
              </div>

              {!feedback && showHint === 0 && (
                <button onClick={() => { setShowHint(1); setAttempts(1); }} className="text-primary hover:text-primary-600 font-bold text-sm mb-6 flex items-center gap-2">
                  🤖 Ask AI Tutor for a Hint
                </button>
              )}

              {showHint > 0 && !feedback && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 mb-6">
                  {showHint >= 1 && (
                    <div className="bg-orange-50 border border-orange-100 p-4 rounded-xl text-sm text-orange-800 shadow-inner">
                      <strong>Hint 1:</strong> {currentQuestion.hint}
                    </div>
                  )}
                  {showHint >= 2 && (
                    <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-xl text-sm text-yellow-800 shadow-inner">
                      <strong>Hint 2:</strong> {currentQuestion.conceptSummary}
                    </div>
                  )}
                </motion.div>
              )}

              {feedback && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4 mb-8"
                >
                  <div className={`p-6 rounded-2xl border ${feedback.isCorrect ? 'bg-green-50/50 border-green-200' : 'bg-red-50/50 border-red-200'}`}>
                    <div className="flex items-start gap-4">
                      <div className={`text-3xl ${feedback.isCorrect ? '' : 'grayscale'}`}>{feedback.isCorrect ? '🎯' : '💡'}</div>
                      <div>
                        <h4 className={`font-black mb-1 ${feedback.isCorrect ? 'text-green-800' : 'text-red-800'}`}>
                          {feedback.isCorrect ? 'Perfect Execution!' : 'Concept Check Needed'}
                        </h4>
                        <p className="text-gray-700 leading-relaxed text-sm">{feedback.explanation}</p>
                      </div>
                    </div>
                  </div>

                  {(!feedback.isCorrect || currentQuestion.difficulty === 'hard') && (
                    <div className="bg-gray-900 text-gray-300 p-6 rounded-2xl">
                      <h4 className="text-white font-bold mb-2 flex items-center gap-2">🤖 AI RAG Context Summary</h4>
                      <p className="text-sm border-l-2 border-primary pl-4 py-1">{feedback.conceptSummary}</p>
                    </div>
                  )}
                </motion.div>
              )}

              {!feedback ? (
                <motion.button
                  disabled={selectedOption === null || loading}
                  whileHover={selectedOption !== null ? { scale: 1.02 } : {}}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSubmit(false)}
                  className={`w-full py-5 rounded-2xl font-black text-lg transition-all ${
                    selectedOption !== null && !loading
                      ? 'bg-gray-900 text-white shadow-[0_10px_20px_rgba(0,0,0,0.2)] hover:bg-black' 
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? 'Analyzing...' : 'Submit Answer'}
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => generateQuiz(feedback.nextDifficulty)}
                  className="w-full bg-primary text-white py-5 rounded-2xl font-black text-lg shadow-[0_10px_20px_rgba(255,107,0,0.3)] hover:bg-primary-600 transition-all flex items-center justify-center gap-2"
                >
                  {feedback.isCorrect ? 'Brace for Harder Challenge 🚀' : 'Try Similar Concept 🔄'}
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Result Dialog Modal */}
      <AnimatePresence>
        {isFinished && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/70 backdrop-blur-lg"
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300, mass: 0.8 }}
              className="w-full max-w-lg max-h-[90vh] overflow-y-auto no-scrollbar rounded-3xl shadow-2xl"
            >
              <QuizResultCard
                topic={topic}
                totalQuestions={totalQuestions}
                correctAnswers={correctCount}
                wrongAnswers={wrongCount}
                onRestart={() => {
                  useQuizStore.setState({ questionStats: [], totalQuestions: 0, seenIds: [] })
                  setChatSent(false)
                  setIsFinished(false)
                }}
                onClose={() => setIsFinished(false)}
                onContinue={() => window.location.reload()}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
