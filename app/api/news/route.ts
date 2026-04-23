import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category");
    const limit = Math.max(1, Math.min(50, Number(searchParams.get("limit") || 10)));
    const offset = Math.max(0, Number(searchParams.get("offset") || 0));

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

    if (error) {
      throw error;
    }

    let countQuery = supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true);

    if (category && category !== "all") {
      countQuery = countQuery.eq("category", category);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
      throw countError;
    }

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
