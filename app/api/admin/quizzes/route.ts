import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await getSupabaseServerClient()
    
    const { data: quizzes, error } = await supabase
      .from('quizzes')
      .select('*, questions:quiz_questions(count)')
      .eq('deleted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching quizzes:', error)
      return NextResponse.json({ error: 'Failed to fetch quizzes' }, { status: 500 })
    }

    return NextResponse.json({ data: quizzes })
  } catch (error) {
    console.error('Error in GET /api/admin/quizzes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, difficulty, time_limit, is_active, questions } = body

    // Validate required fields
    if (!title) {
      return NextResponse.json({ 
        error: 'Quiz title is required' 
      }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()
    
    // Create the quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .insert({
        title,
        description: description || null,
        difficulty: difficulty || 'medium',
        time_limit: time_limit || null,
        is_active: is_active !== undefined ? is_active : true
      })
      .select('*')
      .single()

    if (quizError) {
      console.error('Error creating quiz:', quizError)
      return NextResponse.json({ error: 'Failed to create quiz' }, { status: 500 })
    }

    // If questions are provided, create them
    if (questions && questions.length > 0) {
      const questionsWithQuizId = questions.map((q: any) => ({
        ...q,
        quiz_id: quiz.id
      }))

      const { error: questionsError } = await supabase
        .from('quiz_questions')
        .insert(questionsWithQuizId)

      if (questionsError) {
        console.error('Error creating quiz questions:', questionsError)
        // Don't fail the entire operation, just log the error
      }
    }

    return NextResponse.json({ 
      data: quiz,
      message: 'Quiz created successfully' 
    })
  } catch (error) {
    console.error('Error in POST /api/admin/quizzes:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
