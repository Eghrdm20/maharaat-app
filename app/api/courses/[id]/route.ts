import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = Number(params.id)
    const { uid } = await req.json()

    if (!courseId || Number.isNaN(courseId)) {
      return NextResponse.json(
        { error: "Invalid course id" },
        { status: 400 }
      )
    }

    if (!uid) {
      return NextResponse.json(
        { error: "uid is required" },
        { status: 400 }
      )
    }

    const supabase = createSupabaseServerClient()

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, owner_pi_uid, is_deleted")
      .eq("id", courseId)
      .single()

    if (courseError || !course) {
      return NextResponse.json(
        { error: "Course not found" },
        { status: 404 }
      )
    }

    if (course.owner_pi_uid !== uid) {
      return NextResponse.json(
        { error: "You are not allowed to delete this course" },
        { status: 403 }
      )
    }

    if (course.is_deleted) {
      return NextResponse.json(
        {
          ok: true,
          message: "Course already deleted",
        },
        { status: 200 }
      )
    }

    const { error: updateError } = await supabase
      .from("courses")
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString(),
      })
      .eq("id", courseId)

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Course deleted successfully",
      },
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Server error",
      },
      { status: 500 }
    )
  }
}
