import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

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

    const response = NextResponse.json({ user: data }, { status: 200 })

    response.cookies.set("pi_uid", uid, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    response.cookies.set("pi_username", username, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
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
