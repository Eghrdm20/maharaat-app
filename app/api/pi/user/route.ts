import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { generateSessionToken, hashSessionToken } from "@/lib/auth/session"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const accessToken = body?.accessToken
    const authUsername = body?.authUsername || ""

    if (!accessToken) {
      return NextResponse.json(
        { error: "accessToken is required" },
        { status: 400 }
      )
    }

    const meRes = await fetch("https://api.minepi.com/v2/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
    })

    const meJson = await meRes.json().catch(() => ({}))

    if (!meRes.ok) {
      return NextResponse.json(
        {
          error: meJson?.error || meJson?.message || "Pi /me verification failed",
          details: meJson,
        },
        { status: meRes.status }
      )
    }

    const uid = meJson?.user?.uid || meJson?.uid || ""
    const username =
      meJson?.user?.username || meJson?.username || authUsername || ""

    if (!uid || !username) {
      return NextResponse.json(
        {
          error: "Pi returned incomplete user data",
          details: meJson,
        },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    const { data, error } = await supabase
      .from("pi_users")
      .upsert(
        [
          {
            uid,
            username,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: "uid" }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        {
          error: `Supabase error: ${error.message}`,
          details: error,
        },
        { status: 500 }
      )
    }

    const sessionToken = generateSessionToken()
    const tokenHash = hashSessionToken(sessionToken)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()

    const supabaseAdmin = createSupabaseAdminClient()

    const { error: sessionError } = await supabaseAdmin
      .from("pi_sessions")
      .insert([
        {
          uid,
          username,
          token_hash: tokenHash,
          expires_at: expiresAt,
          user_agent: req.headers.get("user-agent") || null,
        },
      ])

    if (sessionError) {
      return NextResponse.json(
        { error: `Session error: ${sessionError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        user: data,
        sessionToken,
        expiresAt,
      },
      { status: 200 }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error"

    return NextResponse.json(
      {
        error: message,
      },
      { status: 500 }
    )
  }
}
