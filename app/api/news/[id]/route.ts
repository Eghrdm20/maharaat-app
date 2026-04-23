import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdminUid } from "@/lib/admin";

export const runtime = "nodejs";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const newsId = Number(params.id);
    const body = await req.json().catch(() => ({}));
    const requesterUid = String(body?.uid || "").trim();

    if (!newsId || Number.isNaN(newsId)) {
      return NextResponse.json(
        { ok: false, error: "Invalid news id" },
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

    const { data: news, error: newsError } = await supabase
      .from("news")
      .select("id, uid, is_deleted")
      .eq("id", newsId)
      .single();

    if (newsError || !news) {
      return NextResponse.json(
        { ok: false, error: "News not found" },
        { status: 404 }
      );
    }

    const canDelete = requesterUid === news.uid || isAdminUid(requesterUid);

    if (!canDelete) {
      return NextResponse.json(
        { ok: false, error: "You are not allowed to delete this news post" },
        { status: 403 }
      );
    }

    const { error: deleteError } = await supabase
      .from("news")
      .update({ is_deleted: true })
      .eq("id", newsId);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({
      ok: true,
      message: "News deleted successfully",
    });
  } catch (error: any) {
    console.error("DELETE /api/news/[id] failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to delete news",
      },
      { status: 500 }
    );
  }
}
