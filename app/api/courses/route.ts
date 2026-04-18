import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const supabase = createSupabaseServerClient()

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ courses: data ?? [] }, { status: 200 })
  } catch (error) {
    console.error("GET /api/courses failed:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      uid,
      username,
      title,
      description,
      price,
      isFree,
      duration,
      imageUrl,
      videoUrl,
      fileUrl,
    } = body

    if (!uid || !username) {
      return NextResponse.json(
        { error: "يجب ربط حساب Pi أولًا" },
        { status: 400 }
      )
    }

    if (!title || !description || !duration) {
      return NextResponse.json(
        { error: "يرجى ملء جميع الحقول المطلوبة" },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    const numericPrice = isFree ? null : Number(price)

    if (!isFree && (!numericPrice || numericPrice <= 0)) {
      return NextResponse.json(
        { error: "السعر يجب أن يكون أكبر من 0" },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from("courses")
      .insert([
        {
          title,
          description,
          instructor_name: username,
          price: numericPrice,
          currency: "PI",
          is_free: !!isFree,
          image_url: imageUrl || null,
          video_url: videoUrl || null,
          file_url: fileUrl || null,
          duration,
          students_count: 0,
          rating: 0,
          is_new: true,
          owner_pi_uid: uid,
        },
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ course: data }, { status: 200 })
  } catch (error) {
    console.error("POST /api/courses failed:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
  }
