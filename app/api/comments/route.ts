import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// GET: جلب تعليقات مقال معين
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("post_id");

    if (!postId) {
      return NextResponse.json(
        { error: "post_id is required" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    // جلب التعليقات الرئيسية (بدون ردود)
    const { data: comments, error } = await supabase
      .from("comments")
      .select(`
        *,
        replies:comments(parent_id)(
          id,
          content,
          username,
          uid,
          likes_count,
          created_at
        )
      `)
      .eq("post_id", postId)
      .is("parent_id", null)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ ok: true, comments: comments || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// POST: إضافة تعليق جديد
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { post_id, uid, username, content, parent_id } = body;

    if (!post_id || !content) {
      return NextResponse.json(
        { error: "post_id and content are required" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        post_id,
        uid: uid || null,
        username: username || "زائر مجهول",
        content,
        parent_id: parent_id || null,
      })
      .select()
      .single();

    if (error) throw error;

    // تحديث عداد التعليقات في المقال
    await supabase.rpc("increment_comments_count", { post_id });

    return NextResponse.json({ ok: true, comment });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
