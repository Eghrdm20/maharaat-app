import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(req: NextRequest) {
  try {
    const piUid = req.cookies.get("pi_uid")?.value || ""
    const adminUid = process.env.ADMIN_PI_UID || ""
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "Missing Supabase server environment variables" },
        { status: 500 }
      )
    }

    if (!adminUid) {
      return NextResponse.json(
        { error: "Missing ADMIN_PI_UID" },
        { status: 500 }
      )
    }

    if (!piUid || piUid !== adminUid) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      )
    }

    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    })

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

    const { count: totalVisits, error: countError } = await supabaseAdmin
      .from("page_visits")
      .select("*", { count: "exact", head: true })

    if (countError) {
      return NextResponse.json(
        { error: countError.message },
        { status: 500 }
      )
    }

    const { count: anonymousCount, error: anonymousError } = await supabaseAdmin
      .from("page_visits")
      .select("*", { count: "exact", head: true })
      .is("uid", null)

    if (anonymousError) {
      return NextResponse.json(
        { error: anonymousError.message },
        { status: 500 }
      )
    }

    const { data: uidRows, error: uidRowsError } = await supabaseAdmin
      .from("page_visits")
      .select("uid")
      .not("uid", "is", null)

    if (uidRowsError) {
      return NextResponse.json(
        { error: uidRowsError.message },
        { status: 500 }
      )
    }

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
