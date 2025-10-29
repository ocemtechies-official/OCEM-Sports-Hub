import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Await params before using them
    const { id } = await params

    const supabase = await getSupabaseServerClient()
    
    const { data: quiz, error } = await supabase
      .from('quizzes')
      .select(`
        *,
        questions:quiz_questions(*)
      `)
      .eq('id', id)
      .eq('deleted_at', null)
      .single()

    if (error) {
      console.error('Error fetching quiz:', error)
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    return NextResponse.json({ data: quiz })
  } catch (error) {
    console.error('Error in GET /api/admin/quizzes/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    
    // Await params before using them
    const { id } = await params
    
    // Update the quiz
    const { data: quiz, error: quizError } = await supabase
      .from('quizzes')
      .update({
        title,
        description: description || null,
        difficulty: difficulty || 'medium',
        time_limit: time_limit || null,
        is_active: is_active !== undefined ? is_active : true,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('deleted_at', null)
      .select('*')
      .single()

    if (quizError) {
      console.error('Error updating quiz:', quizError)
      return NextResponse.json({ error: 'Failed to update quiz' }, { status: 500 })
    }

    // If questions are provided, update them
    if (questions && Array.isArray(questions)) {
      // Delete existing questions
      await supabase
        .from('quiz_questions')
        .delete()
        .eq('quiz_id', id)

      // Insert new questions
      if (questions.length > 0) {
        const questionsWithQuizId = questions.map((q: any) => ({
          ...q,
          quiz_id: id
        }))

        const { error: questionsError } = await supabase
          .from('quiz_questions')
          .insert(questionsWithQuizId)

        if (questionsError) {
          console.error('Error updating quiz questions:', questionsError)
          // Don't fail the entire operation, just log the error
        }
      }
    }

    return NextResponse.json({ 
      data: quiz,
      message: 'Quiz updated successfully' 
    })
  } catch (error) {
    console.error('Error in PUT /api/admin/quizzes/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await getSupabaseServerClient()
    
    // Await params before using them
    const { id } = await params
    
    // Use the soft delete function
    const { data, error } = await supabase
      .rpc('soft_delete_quiz', { quiz_id: id })

    if (error) {
      console.error('Error soft deleting quiz:', error)
      return NextResponse.json({ error: 'Failed to delete quiz' }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Quiz not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      message: 'Quiz deleted successfully' 
    })
  } catch (error) {
    console.error('Error in DELETE /api/admin/quizzes/[id]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}