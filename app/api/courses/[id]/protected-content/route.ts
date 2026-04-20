import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { getSessionFromRequest } from "@/lib/auth/session"

type ArticleBlock = {
  id: string
  type: "text" | "image"
  heading?: string
  text?: string
  image_path?: string
  caption?: string
}

async function signIfExists(
  bucket: string,
  path?: string | null
) {
  if (!path) return null

  const supabaseAdmin = createSupabaseAdminClient()

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 15)

  if (error) {
    throw new Error(error.message)
  }

  return data.signedUrl
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = Number(params.id)

    if (!courseId || Number.isNaN(courseId)) {
      return NextResponse.json(
        { error: "Invalid course id" },
        { status: 400 }
      )
    }

    const session = await getSessionFromRequest(req)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized session" },
        { status: 401 }
      )
    }

    const piUid = session.uid
    const supabaseAdmin = createSupabaseAdminClient()

    const { data: course, error: courseError } = await supabaseAdmin
      .from("courses")
      .select("*")
      .eq("id", courseId)
      .eq("is_deleted", false)
      .single()

    if (courseError || !course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }

    const isOwner = course.owner_pi_uid === piUid
    let allowed = false

    if (course.is_free) {
      allowed = true
    } else if (isOwner) {
      allowed = true
    } else {
      const { data: purchase, error: purchaseError } = await supabaseAdmin
        .from("purchases")
        .select("id")
        .eq("course_id", courseId)
        .eq("uid", piUid)
        .eq("status", "completed")
        .limit(1)

      if (purchaseError) {
        return NextResponse.json(
          { error: purchaseError.message },
          { status: 500 }
        )
      }

      allowed = Array.isArray(purchase) && purchase.length > 0
    }

    if (!allowed) {
      return NextResponse.json(
        { error: "You do not have access to this course" },
        { status: 403 }
      )
    }

    const signedVideoUrl = await signIfExists(
      "course-videos",
      course.video_path
    )

    const signedFileUrl = await signIfExists(
      "course-files",
      course.file_path
    )

    const signedArticleBlocks = await Promise.all(
      ((course.article_blocks || []) as ArticleBlock[]).map(async (block) => {
        if (block.type === "image" && block.image_path) {
          const signedImageUrl = await signIfExists(
            "course-content-images",
            block.image_path
          )

          return {
            ...block,
            image_url: signedImageUrl,
          }
        }

        return block
      })
    )

    return NextResponse.json({
      ok: true,
      content: {
        video_url: signedVideoUrl,
        file_url: signedFileUrl,
        article_blocks: signedArticleBlocks,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    )
  }
}
