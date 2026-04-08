import { NextResponse } from 'next/server'
import { questionBank } from '@/lib/questionBank'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { topic, difficulty, seenIds = [] } = await req.json()
    
    // Fallback topic if requested isn't in bank
    const lookupTopic = questionBank.some(q => q.topic === topic) ? topic : 'Operating Systems';

    const availableQuestions = questionBank.filter(
      (q) => q.topic === lookupTopic && !seenIds.includes(q.id)
    )

    if (availableQuestions.length === 0) {
      return NextResponse.json({ error: 'No more questions available.' }, { status: 404 })
    }

    const totalTopicQuestions = questionBank.filter((q) => q.topic === lookupTopic).length;

    let nextQuestion = availableQuestions.find((q) => q.difficulty === difficulty)

    if (!nextQuestion) {
      nextQuestion = availableQuestions[Math.floor(Math.random() * availableQuestions.length)]
    }

    return NextResponse.json({ ...nextQuestion, totalTopicQuestions }, {
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 })
  }
}
