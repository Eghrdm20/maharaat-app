import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

// GET: التحقق من حالة الإعجاب
// POST: تبديل الإعجاب (إضافة/حذف)
// DELETE: حذف إعجاب

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { post_id, uid, comment_id } = body;

    if (!uid) {
      return NextResponse.json(
        { error: "uid is required" },
        { status: 401 }
      );
    }

    const supabase = createSupabaseAdminClient();

    // البحث عن إعجاب موجود
    const { data: existingLike } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", post_id)
      .eq("uid", uid)
      .eq("comment_id", comment_id || null)
      .maybeSingle();

    if (existingLike) {
      // حذف الإعجاب (unlike)
      await supabase.from("likes").delete().eq("id", existingLike.id);
      
      // تحديث العداد
      if (comment_id) {
        await supabase.rpc("decrement_comment_likes", { comment_id });
      } else {
        await supabase.rpc("decrement_post_likes", { post_id });
      }

      return NextResponse.json({ ok: true, liked: false });
    } else {
      // إضافة إعجاب جديد (like)
      const { error } = await supabase.from("likes").insert({
        post_id,
        uid,
        comment_id: comment_id || null,
      });

      if (error) throw error;

      // تحديث العداد
      if (comment_id) {
        await supabase.rpc("increment_comment_likes", { comment_id });
      } else {
        await supabase.rpc("increment_post_likes", { post_id });
      }

      return NextResponse.json({ ok: true, liked: true });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

// GET: التحقق مما إذا كان المستخدم معجب
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const post_id = searchParams.get("post_id");
    const uid = searchParams.get("uid");
    const comment_id = searchParams.get("comment_id");

    if (!uid || !post_id) {
      return NextResponse.json({ liked: false });
    }

    const supabase = createSupabaseAdminClient();

    const { data } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", post_id)
      .eq("uid", uid)
      .eq("comment_id", comment_id || null)
      .maybeSingle();

    return NextResponse.json({ liked: !!data });
  } catch (error: any) {
    return NextResponse.json({ liked: false });
  }
}
