import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function POST(req: Request) {
  try {
    const { userId, topic, accuracy, timeTaken, retries } = await req.json()
    
    // Update user profile in Supabase (or mock)
    // Analytics & Behavioral Tracking stored here

    let nextDifficulty = 'medium'
    let adaptLog = ''

    if (accuracy < 0.5) {
      nextDifficulty = 'easy'
      adaptLog = 'Accuracy low. Switching to easier module with detailed hints.'
    } else if (accuracy >= 0.5 && accuracy <= 0.75) {
      nextDifficulty = 'medium'
      adaptLog = 'Accuracy moderate. Proceeding with standard difficulty.'
    } else {
      nextDifficulty = 'hard'
      adaptLog = 'Accuracy high. Increasing complexity and applying time pressure.'
    }

    return NextResponse.json({
      success: true,
      nextDifficulty,
      adaptiveFeedback: adaptLog
    })
  } catch (error) {
    return NextResponse.json({ error: 'Adaptive engine failed' }, { status: 500 })
  }
}
