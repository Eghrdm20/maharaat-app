import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

function getAdminUids(): string[] {
  return (process.env.ADMIN_PI_UIDS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isAdminUid(uid?: string | null): boolean {
  if (!uid) return false;
  return getAdminUids().includes(uid.trim());
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = Number(params.id);
    const body = await req.json().catch(() => ({}));
    const requesterUid = String(body?.uid || "").trim();

    if (!courseId || Number.isNaN(courseId)) {
      return NextResponse.json(
        { ok: false, error: "Invalid course id" },
        { status: 400 }
      );
    }

    if (!requesterUid) {
      return NextResponse.json(
        { ok: false, error: "uid is required" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, owner_pi_uid, is_deleted")
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      return NextResponse.json(
        { ok: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const canDelete =
      requesterUid === course.owner_pi_uid || isAdminUid(requesterUid);

    if (!canDelete) {
      return NextResponse.json(
        {
          ok: false,
          error: "You are not allowed to delete this course",
          debug: {
            requesterUid,
            owner_pi_uid: course.owner_pi_uid,
            isAdmin: isAdminUid(requesterUid),
            admins: getAdminUids(),
          },
        },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase
      .from("courses")
      .update({ is_deleted: true })
      .eq("id", courseId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      ok: true,
      message: "Course deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/courses/[id] failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to delete course",
      },
      { status: 500 }
    );
  }
}
