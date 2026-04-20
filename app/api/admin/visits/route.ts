import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { getSessionFromRequest } from "@/lib/auth/session"

export async function GET(req: NextRequest) {
  try {
    const adminUid = process.env.ADMIN_PI_UID || ""

    if (!adminUid) {
      return NextResponse.json(
        { error: "ADMIN_PI_UID is missing in Vercel" },
        { status: 500 }
      )
    }

    const session = await getSessionFromRequest(req)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized session" },
        { status: 401 }
      )
    }

    if (session.uid !== adminUid) {
      return NextResponse.json(
        { error: "You are not allowed to open this page" },
        { status: 403 }
      )
    }

    const supabaseAdmin = createSupabaseAdminClient()

    const { data: visits, error: visitsError } = await supabaseAdmin
      .from("page_visits")
      .select("id, uid, username, path, page_title, visited_at")
      .order("visited_at", { ascending: false })
      .limit(300)

    if (visitsError) {
      return NextResponse.json(
        { error: visitsError.message },
        { status: 500 }
      )
    }

    const { count: totalVisits } = await supabaseAdmin
      .from("page_visits")
      .select("*", { count: "exact", head: true })

    const { count: anonymousCount } = await supabaseAdmin
      .from("page_visits")
      .select("*", { count: "exact", head: true })
      .is("uid", null)

    const { data: uidRows } = await supabaseAdmin
      .from("page_visits")
      .select("uid")
      .not("uid", "is", null)

    const uniqueUsers = new Set(
      (uidRows || []).map((row) => row.uid).filter(Boolean)
    ).size

    return NextResponse.json({
      ok: true,
      stats: {
        totalVisits: totalVisits || 0,
        anonymousVisits: anonymousCount || 0,
        uniquePiUsers: uniqueUsers || 0,
      },
      visits: visits || [],
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    )
  }
}
