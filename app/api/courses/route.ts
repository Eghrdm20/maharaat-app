import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const {
      uid,
      username,
      title,
      description,
      duration,
      price,
      isFree,
      imageUrl,
      videoUrl,
      fileUrl,
      contentType,
      articleBlocks,
    } = body

    if (!uid || !username || !title || !description) {
      return NextResponse.json(
        { error: "uid, username, title, description are required" },
        { status: 400 }
      )
    }

    if (contentType === "article") {
      if (!Array.isArray(articleBlocks) || articleBlocks.length === 0) {
        return NextResponse.json(
          { error: "articleBlocks are required for article courses" },
          { status: 400 }
        )
      }
    }

    const supabase = createSupabaseServerClient()

    const payload = {
      title,
      description,
      instructor_name: username,
      price: isFree ? null : Number(price || 0),
      currency: "PI",
      is_free: !!isFree,
      image_url: imageUrl || null,
      video_url: contentType === "article" ? null : videoUrl || null,
      file_url: contentType === "article" ? null : fileUrl || null,
      duration: duration || null,
      students_count: 0,
      rating: 0,
      is_new: true,
      owner_pi_uid: uid,
      content_type: contentType || "media",
      article_blocks: contentType === "article" ? articleBlocks : null,
    }

    const { data, error } = await supabase
      .from("courses")
      .insert([payload])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ course: data }, { status: 200 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    )
  }
}
