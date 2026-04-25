import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getAdminUids(): string[] {
  return (process.env.ADMIN_PI_UIDS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function isAdminUid(uid?: string | null): boolean {
  if (!uid) return false;
  return getAdminUids().includes(uid.trim());
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get("uid");

    if (!uid) {
      return NextResponse.json(
        { ok: false, error: "uid is required" },
        { status: 400 }
      );
    }

    if (!isAdminUid(uid)) {
      return NextResponse.json(
        {
          ok: false,
          error: "You are not allowed to view withdrawals",
          debug: {
            uid,
            admins: getAdminUids(),
          },
        },
        { status: 403 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const { data, error } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      withdrawals: data || [],
    });
  } catch (error: any) {
    console.error("GET /api/admin/withdrawals failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to load withdrawal requests",
      },
      { status: 500 }
    );
  }
}
