import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const limit = Math.max(1, Math.min(50, Number(searchParams.get("limit") || "10")));
    const offset = Math.max(0, Number(searchParams.get("offset") || "0"));

    let query = supabase
      .from("posts")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (category && category !== "all") {
      query = query.eq("category", category);
    }

    const { data: posts, error } = await query;
    if (error) throw error;

    let countQuery = supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true);

    if (category && category !== "all") {
      countQuery = countQuery.eq("category", category);
    }

    const { count, error: countError } = await countQuery;
    if (countError) throw countError;

    return NextResponse.json({
      ok: true,
      posts: posts || [],
      total: count || 0,
    });
  } catch (error: any) {
    console.error("GET /api/news failed:", error);

    return NextResponse.json(
      {
        ok: false,
        posts: [],
        total: 0,
        error: error?.message || "Failed to load news",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const uid = body?.uid?.toString?.().trim?.() || "";
    const username = body?.username?.toString?.().trim?.() || "";
    const title = body?.title?.toString?.().trim?.() || "";
    const content = body?.content?.toString?.().trim?.() || "";
    const excerpt = body?.excerpt?.toString?.().trim?.() || "";
    const category = body?.category?.toString?.().trim?.() || "general";
    const image_url_raw = body?.image_url?.toString?.().trim?.() || "";

    const image_url = image_url_raw
      ? image_url_raw.replace(/^\/+https?:\/\//i, (match) => match.replace(/^\/+/, ""))
      : null;

    if (!title || !content) {
      return NextResponse.json(
        { ok: false, error: "Title and content are required" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const payload = {
      uid: uid || null,
      username: username || "anonymous",
      title,
      content,
      excerpt: excerpt || `${content.slice(0, 150)}...`,
      category,
      image_url,
      is_published: true,
    };

    const { data: post, error } = await supabase
      .from("posts")
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true, post });
  } catch (error: any) {
    console.error("POST /api/news failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to publish news",
        details: error,
      },
      { status: 500 }
    );
  }
}
