"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useChatStore, Message } from '@/store/chatStore'
import { QuizCard, TopicSelectionCard, QuizAnalysisCard, AnalyticsCard } from '@/components/chat/DynamicCards'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'


export default function ChatInterface() {
  const { messages, isTyping, addMessage, setTyping, session, endSession } = useChatStore()
  const [inputVal, setInputVal] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  const handleSend = async (overrideText?: string, hideInput?: boolean) => {
    const textToSend = overrideText || inputVal.trim()
    if (!textToSend) return

    if (!hideInput) setInputVal('')
    
    addMessage({ sender: 'user', type: 'text', text: textToSend })
    setTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: textToSend, context: { session } })
      })
      const data = await res.json()
      addMessage({
        sender: 'ai',
        type: data.type,
        text: data.text,
        payload: data.payload
      })
      
      if (data.type === 'quiz_analysis') {
         endSession()
      }
    } finally {
      setTyping(false)
    }
  }

  const renderMessageContent = (msg: Message) => {
    let content = (
      <div className={`text-[15px] leading-relaxed overflow-x-auto ${msg.sender === 'user' ? 'text-white' : 'text-gray-800'}`}>
        <ReactMarkdown 
          remarkPlugins={[remarkGfm, remarkMath]} 
          rehypePlugins={[rehypeKatex]}
          components={{
            p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
            code: ({children}) => <code className="bg-gray-100 px-1 rounded text-primary font-mono text-sm">{children}</code>,
            ul: ({children}) => <ul className="list-disc ml-4 mb-2">{children}</ul>,
            ol: ({children}) => <ol className="list-decimal ml-4 mb-2">{children}</ol>,
            h3: ({children}) => <h3 className="font-bold text-lg mb-2 mt-4">{children}</h3>,
          }}
        >
          {msg.text}
        </ReactMarkdown>
      </div>
    )
    
    if (msg.type === 'quiz' && msg.payload) {
      content = <>{content}<QuizCard payload={msg.payload} /></>
    }
    if (msg.type === 'topic_selection') {
      content = <>{content}<TopicSelectionCard /></>
    }
    if (msg.type === 'quiz_analysis' && msg.payload) {
      content = <>{content}<QuizAnalysisCard payload={msg.payload} /></>
    }
    if (msg.type === 'analytics' && msg.payload) {
      content = <>{content}<AnalyticsCard payload={msg.payload} /></>
    }

    return content
  }

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8f9fa] shadow-2xl overflow-hidden relative">
      
      {/* HEADER & LIVE METRICS */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-100 flex flex-col sticky top-0 z-20 shadow-sm">
        <div className="h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white font-black text-sm shadow-md">AI</div>
            <div>
              <h1 className="font-black text-gray-900 tracking-tight leading-none">GATE Tutor AI</h1>
              <p className="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-1">• System Active</p>
            </div>
          </div>
        </div>

        {/* FLOATING LIVE METRICS PANEL (Only visible during active quiz session) */}
        <AnimatePresence>
          {session.isActive && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gray-900 border-t border-gray-800 px-6 py-3 flex gap-6 overflow-x-auto scrollbar-hide items-center text-white"
            >
               <div className="flex items-center gap-2 border-r border-gray-700 pr-6">
                 <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Module</span>
                 <span className="font-bold text-sm text-primary">{session.topic}</span>
               </div>
               <div className="flex items-center gap-2 border-r border-gray-700 pr-6">
                 <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Accuracy</span>
                 <span className="font-black text-lg">{session.attempted > 0 ? Math.round((session.correct/session.attempted)*100) : 0}%</span>
               </div>
               <div className="flex items-center gap-2 border-r border-gray-700 pr-6">
                 <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Streak</span>
                 <span className="font-black text-lg text-orange-400">{session.streak} 🔥</span>
               </div>
               <div className="flex items-center gap-2">
                 <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Avg Time</span>
                 <span className="font-black text-lg">{session.attempted > 0 ? Math.round(session.totalTimeSeconds/session.attempted) : 0}s</span>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed opacity-95">
        <div className="max-w-4xl mx-auto space-y-6">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex w-full ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                   <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 mr-3 mt-1 flex items-center justify-center font-bold text-gray-500 text-xs">AI</div>
                )}
                <div className={`max-w-[85%] sm:max-w-[70%] px-5 py-4 ${
                  msg.sender === 'user' 
                    ? 'bg-primary text-white rounded-2xl rounded-tr-sm shadow-md' 
                    : 'bg-white border border-gray-100 rounded-2xl rounded-tl-sm shadow-sm'
                }`}>
                  {renderMessageContent(msg)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
               <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 mr-3 mt-1 flex items-center justify-center font-bold text-gray-500 text-xs">AI</div>
              <div className="bg-white border border-gray-100 px-5 py-4 rounded-2xl rounded-tl-sm flex items-center gap-1 shadow-sm">
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} className="h-4" />
        </div>
      </div>

      {/* QUICK ACTIONS & INPUT BAR */}
      <div className="bg-white border-t border-gray-100 p-4 shrink-0">
        <div className="max-w-4xl mx-auto">
          
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide py-1">
             {session.isActive ? (
               <>
                 {/* Smart Contextual Chips based on recent flow */}
                 <button onClick={() => handleSend('Next Question')} className="whitespace-nowrap px-5 py-2.5 bg-gray-900 border border-gray-800 hover:scale-105 active:scale-95 rounded-full text-sm font-bold text-white transition-all shadow-md hover:shadow-xl">Next Question ⏭️</button>
                 {messages.length > 0 && messages[messages.length - 1].text.includes('incorrect') ? (
                   <>
                     <button onClick={() => handleSend('Tell me the concept rule for this')} className="whitespace-nowrap px-5 py-2.5 bg-blue-50 border border-blue-200 hover:bg-blue-100 rounded-full text-sm font-bold text-blue-700 transition-all">Revise Concept 📚</button>
                     <button onClick={() => handleSend('Show me a simpler example')} className="whitespace-nowrap px-5 py-2.5 bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 rounded-full text-sm font-bold text-yellow-700 transition-all">Simpler Example 🧩</button>
                   </>
                 ) : (
                   <button onClick={() => handleSend('Provide a quick tip')} className="whitespace-nowrap px-5 py-2.5 bg-yellow-50 border border-yellow-200 hover:bg-yellow-100 rounded-full text-sm font-bold text-yellow-700 transition-all">Provide Tip 💡</button>
                 )}
                 <button onClick={() => handleSend('Finish Quiz')} className="whitespace-nowrap px-5 py-2.5 bg-red-50 border border-red-200 hover:bg-red-100 rounded-full text-sm font-bold text-red-600 transition-all">Finish Quiz & Generate Summary 🏁</button>
               </>
             ) : (
                <>
                  <button onClick={() => handleSend('Start Quiz')} className="whitespace-nowrap px-6 py-2.5 bg-gradient-to-r from-primary to-primary-600 hover:to-primary-700 hover:scale-105 active:scale-95 text-white shadow-lg rounded-full text-sm font-bold transition-all">Start Adaptive Session 🚀</button>
                  <button onClick={() => handleSend('Explain Boyce Codd Normal Form (BCNF)')} className="whitespace-nowrap px-5 py-2.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-full text-sm font-bold text-gray-700 transition-all">Explain BCNF 📝</button>
                  <button onClick={() => handleSend('Show me my weak areas')} className="whitespace-nowrap px-5 py-2.5 bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 rounded-full text-sm font-bold text-indigo-700 transition-all">Diagnose Weaknesses 📊</button>
                </>
             )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={session.isActive ? "Ask the AI tutor a conceptual doubt..." : "Tell the AI what you want to learn..."}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-6 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all font-medium text-gray-800"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!inputVal.trim() || isTyping}
              className="w-14 h-14 rounded-full bg-primary flex flex-shrink-0 items-center justify-center text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary-600 transition-colors shadow-lg shadow-primary/30"
            >
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 ml-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      
    </div>
  )
}
