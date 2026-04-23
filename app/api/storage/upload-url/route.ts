import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

const ALLOWED_BUCKETS = ["course-images", "course-videos", "course-files"];

function sanitizeFileName(name: string) {
  return name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "")
    .toLowerCase();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const bucket = String(body?.bucket || "").trim();
    const folder = String(body?.folder || "").trim();
    const fileName = String(body?.fileName || "").trim();

    if (!bucket || !folder || !fileName) {
      return NextResponse.json(
        { ok: false, error: "bucket, folder, fileName are required" },
        { status: 400 }
      );
    }

    if (!ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json(
        { ok: false, error: "Invalid bucket" },
        { status: 400 }
      );
    }

    const safeName = sanitizeFileName(fileName || "file.bin");
    const path = `${folder}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2)}-${safeName}`;

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase.storage
      .from(bucket)
      .createSignedUploadUrl(path);

    if (error || !data?.token) {
      throw new Error(error?.message || "Failed to create signed upload URL");
    }

    const { data: publicData } = supabase.storage.from(bucket).getPublicUrl(path);

    return NextResponse.json({
      ok: true,
      bucket,
      path,
      token: data.token,
      publicUrl: publicData.publicUrl,
    });
  } catch (error: any) {
    console.error("POST /api/storage/upload-url failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to prepare upload",
      },
      { status: 500 }
    );
  }
}
