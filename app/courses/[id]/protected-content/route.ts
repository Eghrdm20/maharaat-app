import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

// غير هذه الأسماء إذا كانت أسماء Buckets عندك مختلفة
const FILE_BUCKET =
  process.env.SUPABASE_COURSE_FILES_BUCKET ||
  process.env.NEXT_PUBLIC_SUPABASE_COURSE_FILES_BUCKET ||
  "course-files";

const VIDEO_BUCKET =
  process.env.SUPABASE_COURSE_VIDEOS_BUCKET ||
  process.env.NEXT_PUBLIC_SUPABASE_COURSE_VIDEOS_BUCKET ||
  FILE_BUCKET;

async function resolveStorageUrl(
  supabase: ReturnType<typeof createSupabaseAdminClient>,
  bucket: string,
  pathOrUrl?: string | null
) {
  if (!pathOrUrl) return null;

  if (/^https?:\/\//i.test(pathOrUrl)) {
    return pathOrUrl;
  }

  const signed = await supabase.storage
    .from(bucket)
    .createSignedUrl(pathOrUrl, 60 * 60 * 24 * 7);

  if (!signed.error && signed.data?.signedUrl) {
    return signed.data.signedUrl;
  }

  const publicData = supabase.storage.from(bucket).getPublicUrl(pathOrUrl);
  return publicData.data?.publicUrl || null;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const courseId = Number(params.id);

    if (!courseId || Number.isNaN(courseId)) {
      return NextResponse.json(
        { ok: false, error: "Invalid course id" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const { data: course, error } = await supabase
      .from("courses")
      .select(
        "id, title, content_type, file_url, file_path, video_url, video_path, article_blocks, is_deleted"
      )
      .eq("id", courseId)
      .eq("is_deleted", false)
      .single();

    if (error || !course) {
      return NextResponse.json(
        { ok: false, error: "Course not found" },
        { status: 404 }
      );
    }

    const resolvedFileUrl =
      course.file_url ||
      (await resolveStorageUrl(supabase, FILE_BUCKET, course.file_path));

    const resolvedVideoUrl =
      course.video_url ||
      (await resolveStorageUrl(supabase, VIDEO_BUCKET, course.video_path));

    let resolvedBlocks = Array.isArray(course.article_blocks)
      ? course.article_blocks
      : [];

    resolvedBlocks = await Promise.all(
      resolvedBlocks.map(async (block: any) => {
        if (block?.type === "image" && !block?.image_url && block?.image_path) {
          const imageUrl = await resolveStorageUrl(
            supabase,
            FILE_BUCKET,
            block.image_path
          );

          return {
            ...block,
            image_url: imageUrl,
          };
        }

        return block;
      })
    );

    return NextResponse.json({
      ok: true,
      content: {
        file_url: resolvedFileUrl,
        video_url: resolvedVideoUrl,
        article_blocks: resolvedBlocks,
      },
    });
  } catch (error: any) {
    console.error("GET /api/courses/[id]/protected-content failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to load protected content",
      },
      { status: 500 }
    );
  }
}
