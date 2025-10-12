import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { isAdmin } = await requireAdmin()
    
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { subject, message } = body

    // Validate required fields
    if (!subject || !message) {
      return NextResponse.json({ 
        error: 'Subject and message are required' 
      }, { status: 400 })
    }

    const supabase = await getSupabaseServerClient()
    
    // Get user details
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', params.id)
      .eq('deleted_at', null)
      .single()

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // For now, we'll just log the email since we don't have an email service configured
    // In a real application, you would integrate with an email service like SendGrid, AWS SES, etc.
    console.log('Email to be sent:', {
      to: user.email,
      subject,
      message,
      recipientName: user.full_name || 'User'
    })

    // TODO: Integrate with actual email service
    // Example with SendGrid:
    // const sgMail = require('@sendgrid/mail')
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    // 
    // const msg = {
    //   to: user.email,
    //   from: process.env.FROM_EMAIL,
    //   subject: subject,
    //   text: message,
    //   html: `<p>${message}</p>`
    // }
    // 
    // await sgMail.send(msg)

    return NextResponse.json({ 
      message: 'Email sent successfully',
      recipient: {
        email: user.email,
        name: user.full_name
      }
    })
  } catch (error) {
    console.error('Error in POST /api/admin/users/[id]/email:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
