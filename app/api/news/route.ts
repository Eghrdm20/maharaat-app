import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// GET: جلب جميع المقالات المنشورة
export async function GET(req: NextRequest) {
  try {
    const supabase = createSupabaseAdminClient();
    
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = parseInt(searchParams.get("offset") || "0");

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

    // جلب العدد الكلي
    const { count } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true })
      .eq("is_published", true);

    return NextResponse.json({
      ok: true,
      posts: posts || [],
      total: count || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST: إنشاء مقال جديد
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid, username, title, content, excerpt, category, image_url } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const { data: post, error } = await supabase
      .from("posts")
      .insert({
        uid,
        username,
        title,
        content,
        excerpt: excerpt || content.substring(0, 150) + "...",
        category: category || "general",
        image_url,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, post });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
