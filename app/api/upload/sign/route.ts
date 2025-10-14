import { NextRequest, NextResponse } from 'next/server'
import { requireModerator } from '@/lib/auth'
import { getSupabaseServerClient } from '@/lib/supabase/server'

// Issues a signed URL for uploading media to Supabase Storage
export async function POST(request: NextRequest) {
  try {
    const { user, isModerator } = await requireModerator()
    if (!user || !isModerator) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = await getSupabaseServerClient()
    const body = await request.json()
    const { fileName, contentType } = body

    if (!fileName) {
      return NextResponse.json({ error: 'fileName required' }, { status: 400 })
    }

    const path = `${user.id}/${Date.now()}-${fileName}`
    const bucket = 'match-media'

    // Ensure bucket exists (no-op if exists)
    await supabase.storage.createBucket(bucket, { public: true }).catch(() => {})

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path)

    if (error || !data) {
      return NextResponse.json({ error: 'Failed to create signed URL' }, { status: 500 })
    }

    return NextResponse.json({ bucket, path, signedUrl: data.signedUrl, token: data.token, contentType })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}



