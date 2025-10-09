import { NextResponse } from "next/server"

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json(
      {
        ok: false,
        error: "Missing Supabase env vars",
        details: {
          NEXT_PUBLIC_SUPABASE_URL: !!supabaseUrl,
          NEXT_PUBLIC_SUPABASE_ANON_KEY: !!supabaseAnonKey,
          NEXT_PUBLIC_SITE_URL: siteUrl || null,
        },
      },
      { status: 500 },
    )
  }

  try {
    const startedAt = Date.now()
    const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      cache: "no-store",
    })

    const durationMs = Date.now() - startedAt
    const text = await res.text().catch(() => null)

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      statusText: res.statusText,
      durationMs,
      endpoint: `${supabaseUrl}/auth/v1/settings`,
      siteUrl: siteUrl || null,
      bodyPreview: text ? text.slice(0, 2000) : null,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error.message || "Unknown error",
        endpoint: `${supabaseUrl}/auth/v1/settings`,
        siteUrl: siteUrl || null,
      },
      { status: 500 },
    )
  }
}


