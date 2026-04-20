import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(req: NextRequest) {
  try {
    const piUid = req.cookies.get("pi_uid")?.value || ""
    const adminUid = process.env.ADMIN_PI_UID || ""
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl) {
      return NextResponse.json(
        { error: "NEXT_PUBLIC_SUPABASE_URL is missing in Vercel" },
        { status: 500 }
      )
    }

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "SUPABASE_SERVICE_ROLE_KEY is missing in Vercel" },
        { status: 500 }
      )
    }

    if (!adminUid) {
      return NextResponse.json(
        { error: "ADMIN_PI_UID is missing in Vercel" },
        { status: 500 }
      )
    }

    if (!piUid) {
      return NextResponse.json(
        { error: "pi_uid cookie is missing. Log out and log in again from the profile page." },
        { status: 401 }
      )
    }

    if (piUid !== adminUid) {
      return NextResponse.json(
        {
          error: "Your Pi UID does not match ADMIN_PI_UID",
          currentPiUid: piUid,
          adminPiUid: adminUid,
        },
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
        { error: `Supabase visits query failed: ${visitsError.message}` },
        { status: 500 }
      )
    }

    const { count: totalVisits, error: countError } = await supabaseAdmin
      .from("page_visits")
      .select("*", { count: "exact", head: true })

    if (countError) {
      return NextResponse.json(
        { error: `Supabase total count failed: ${countError.message}` },
        { status: 500 }
      )
    }

    const { count: anonymousCount, error: anonymousError } = await supabaseAdmin
      .from("page_visits")
      .select("*", { count: "exact", head: true })
      .is("uid", null)

    if (anonymousError) {
      return NextResponse.json(
        { error: `Supabase anonymous count failed: ${anonymousError.message}` },
        { status: 500 }
      )
    }

    const { data: uidRows, error: uidRowsError } = await supabaseAdmin
      .from("page_visits")
      .select("uid")
      .not("uid", "is", null)

    if (uidRowsError) {
      return NextResponse.json(
        { error: `Supabase uid query failed: ${uidRowsError.message}` },
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
