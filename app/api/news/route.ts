import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    const supabase = createSupabaseAdminClient();

    const { data: newsRows, error: newsError } = await supabase
      .from("news")
      .select("*")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (newsError) {
      throw newsError;
    }

    const news = newsRows || [];
    const newsIds = news.map((item) => item.id);

    if (newsIds.length === 0) {
      return NextResponse.json({
        ok: true,
        news: [],
      });
    }

    const { data: likesRows, error: likesError } = await supabase
      .from("news_likes")
      .select("news_id, uid")
      .in("news_id", newsIds);

    if (likesError) {
      throw likesError;
    }

    const likes = likesRows || [];

    const likesCountMap = new Map<number, number>();
    const likedByMeSet = new Set<number>();

    for (const like of likes) {
      const current = likesCountMap.get(like.news_id) || 0;
      likesCountMap.set(like.news_id, current + 1);

      if (uid && like.uid === uid) {
        likedByMeSet.add(like.news_id);
      }
    }

    const enrichedNews = news.map((item) => ({
      ...item,
      likes_count: likesCountMap.get(item.id) || 0,
      liked_by_me: likedByMeSet.has(item.id),
    }));

    return NextResponse.json({
      ok: true,
      news: enrichedNews,
    });
  } catch (error: any) {
    console.error("GET /api/news failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to load news",
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
    const title = String(body?.title || "").trim();
    const content = String(body?.content || "").trim();
    const excerpt = String(body?.excerpt || "").trim();
    const category = String(body?.category || "general").trim();
    const image_url = body?.image_url ? String(body.image_url).trim() : null;

    if (!uid || !username) {
      return NextResponse.json(
        { ok: false, error: "User is required" },
        { status: 400 }
      );
    }

    if (!title || !content) {
      return NextResponse.json(
        { ok: false, error: "title and content are required" },
        { status: 400 }
      );
    }

    const finalExcerpt =
      excerpt || content.slice(0, 180) + (content.length > 180 ? "..." : "");

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("news")
      .insert([
        {
          uid,
          username,
          title,
          content,
          excerpt: finalExcerpt,
          category,
          image_url,
          is_deleted: false,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      news: {
        ...data,
        likes_count: 0,
        liked_by_me: false,
      },
    });
  } catch (error: any) {
    console.error("POST /api/news failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to publish news",
      },
      { status: 500 }
    );
  }
}
