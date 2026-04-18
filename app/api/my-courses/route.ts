import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(req: NextRequest) {
  try {
    const uid = req.nextUrl.searchParams.get("uid")

    if (!uid) {
      return NextResponse.json({ error: "uid is required" }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()

    const { data: purchases, error: purchasesError } = await supabase
      .from("purchases")
      .select("*")
      .eq("uid", uid)
      .order("created_at", { ascending: false })

    if (purchasesError) {
      return NextResponse.json({ error: purchasesError.message }, { status: 500 })
    }

    const courseIds = (purchases || []).map((item) => item.course_id)

    if (courseIds.length === 0) {
      return NextResponse.json({ courses: [] }, { status: 200 })
    }

    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("*")
      .in("id", courseIds)

    if (coursesError) {
      return NextResponse.json({ error: coursesError.message }, { status: 500 })
    }

    const merged = (purchases || []).map((purchase) => {
      const course = (courses || []).find((item) => item.id === purchase.course_id)
      return {
        ...course,
        purchase_created_at: purchase.created_at,
        payment_id: purchase.payment_id,
        txid: purchase.txid,
      }
    })

    return NextResponse.json(
      { courses: merged.filter(Boolean) },
      { status: 200 }
    )
  } catch (error) {
    console.error("GET /api/my-courses failed:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
