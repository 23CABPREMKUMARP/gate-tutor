import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { questionBank } from '@/lib/questionBank'
import { supabase } from '@/lib/supabaseClient'

export const runtime = 'nodejs'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || ''
})

export async function POST(req: Request) {
  try {
    const { message, context = {} } = await req.json()
    const input = message.toLowerCase()

    // 1. FAST-PATH LOGIC (Same as before for instant UI)
    if (input.includes('start quiz')) return NextResponse.json({ type: 'topic_selection', text: "Pick your module:" })
    if (input.includes('finish quiz')) return NextResponse.json({ type: 'quiz_analysis', payload: context.session, text: "Results compiled!" })

    // 2. RAG INTEGRATION (Search local bank + placeholder for Supabase Vector)
    let ragContext = ""
    try {
      // Find similar questions in the local bank as a primary context source
      const relevantQuestions = questionBank
        .filter(q => input.includes(q.topic.toLowerCase()) || input.includes(q.id.toLowerCase()))
        .slice(0, 2)
        .map(q => `Topic: ${q.topic}\nConcept: ${q.conceptSummary}\nQuestion Example: ${q.question}`)
        .join("\n\n")
      
      ragContext = relevantQuestions || "No specific local context found."

      // Optional: Attempt Supabase Vector search if configured
      if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY !== 'public-anon-key') {
         // Placeholder for standard pgvector RPC match
         const { data: vectorData } = await supabase.rpc('match_documents', {
            query_text: message,
            match_threshold: 0.5,
            match_count: 3
         })
         if (vectorData) {
            ragContext += "\n\nVector Store context:\n" + vectorData.map((d: any) => d.content).join("\n")
         }
      }
    } catch (e) {
      console.warn("RAG retrieval skipped or failed:", e)
    }

    // 3. GROQ LLM CALL
    const systemPrompt = `You are an expert GATE tutor. Use the provided context to answer. 
Teach concepts clearly, generate quizzes (MCQ/MSQ/NAT), give hints instead of direct answers, and adapt difficulty. 
Keep responses concise, structured ($ math), and under 200 words.

RAG CONTEXT:
${ragContext}

RESPONSE FORMAT (STRICT JSON ONLY):
{
  "type": "quiz | explanation | hint | chat",
  "text": "Your conversational content or concept explanation in Markdown",
  "payload": {
     "id": "q_id",
     "topic": "topic",
     "difficulty": "easy|medium|hard",
     "question": "question text",
     "options": ["A", "B", "C", "D"],
     "correctIndex": 0,
     "explanation": "why it is correct",
     "hint": "strategic hint",
     "conceptTag": "tag"
  }
}

Rules:
- If user says 'Next' -> generate quiz.
- If wrong answer -> explanation + hint.
- Escape all backslashes for JSON compliance.
- NO conversational text outside the JSON block.`

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Context: ${JSON.stringify(context)}\nUser Query: "${message}"` }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })

    const rawResponse = chatCompletion.choices[0]?.message?.content || "{}"
    
    // 4. SANITIZATION & PARSING
    try {
      // Direct parse since Groq supports json_object response format
      const parsed = JSON.parse(rawResponse)
      
      // Map Groq's requested keys to UI keys if they differ slightly
      return NextResponse.json({
        type: parsed.type || 'text',
        text: parsed.text || parsed.content || "", // Handle user's 'content' vs UI's 'text'
        payload: parsed.payload || (parsed.type === 'quiz' ? parsed : null)
      })
    } catch (e) {
      // Fallback extraction
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
         try {
            return NextResponse.json(JSON.parse(jsonMatch[0].replace(/\\([^"\\/bfnrtu])/g, "\\\\$1")))
         } catch (e2) {}
      }
      return NextResponse.json({ type: 'text', text: "Groq encountered a formatting issue. Re-try." })
    }

  } catch (error: any) {
    console.error("GROQ ERROR:", error)
    return NextResponse.json({ type: 'text', text: "Groq interface busy. Switching protocols..." })
  }
}
