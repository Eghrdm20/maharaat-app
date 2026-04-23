import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    const supabase = createSupabaseAdminClient();

    let query = supabase
      .from("courses")
      .select("*")
      .eq("is_deleted", false)
      .order("id", { ascending: false });

    if (uid) {
      query = query.eq("owner_pi_uid", uid);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      courses: data || [],
    });
  } catch (error: any) {
    console.error("GET /api/courses failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to load courses",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const uid = String(body?.uid || "").trim();
    const username = String(body?.username || "").trim();
    const owner_pi_uid = String(body?.owner_pi_uid || uid).trim();

    const title = String(body?.title || "").trim();
    const description = String(body?.description || "").trim();
    const instructor_name = String(body?.instructor_name || username).trim();
    const duration = body?.duration ? String(body.duration).trim() : null;

    const is_free = Boolean(body?.is_free);
    const price = is_free ? 0 : Number(body?.price || 0);
    const currency = String(body?.currency || "PI").trim();

    const image_url = body?.image_url ? String(body.image_url).trim() : null;
    const video_url = body?.video_url ? String(body.video_url).trim() : null;
    const file_url = body?.file_url ? String(body.file_url).trim() : null;
    const content_type = String(body?.content_type || "media").trim();

    if (!uid || !username) {
      return NextResponse.json(
        { ok: false, error: "uid and username are required" },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { ok: false, error: "title is required" },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { ok: false, error: "description is required" },
        { status: 400 }
      );
    }

    if (!is_free && (!Number.isFinite(price) || price <= 0)) {
      return NextResponse.json(
        { ok: false, error: "Valid price is required for paid courses" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const insertPayload = {
      title,
      description,
      instructor_name: instructor_name || username,
      duration,
      price,
      currency,
      is_free,
      image_url,
      video_url,
      file_url,
      content_type,
      owner_pi_uid,
      created_by_uid: uid,
      created_by_username: username,
      students_count: 0,
      rating: 0,
      is_new: true,
      is_deleted: false,
    };

    const { data, error } = await supabase
      .from("courses")
      .insert([insertPayload])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      course: data,
    });
  } catch (error: any) {
    console.error("POST /api/courses failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to create course",
      },
      { status: 500 }
    );
  }
}
