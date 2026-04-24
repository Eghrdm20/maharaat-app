import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isAdminUid } from "@/lib/admin";

export const runtime = "nodejs";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const withdrawalId = Number(params.id);
    const body = await req.json().catch(() => ({}));

    const uid = String(body?.uid || "").trim();
    const status = String(body?.status || "").trim();
    const admin_note = body?.admin_note ? String(body.admin_note).trim() : null;

    if (!withdrawalId || Number.isNaN(withdrawalId)) {
      return NextResponse.json(
        { ok: false, error: "Invalid withdrawal id" },
        { status: 400 }
      );
    }

    if (!uid) {
      return NextResponse.json(
        { ok: false, error: "uid is required" },
        { status: 400 }
      );
    }

    if (!isAdminUid(uid)) {
      return NextResponse.json(
        { ok: false, error: "You are not allowed to update this request" },
        { status: 403 }
      );
    }

    const allowedStatuses = ["pending", "approved", "paid", "rejected"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        { ok: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const updatePayload: Record<string, any> = {
      status,
      admin_note,
      updated_at: new Date().toISOString(),
    };

    if (status === "paid") {
      updatePayload.paid_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from("withdrawal_requests")
      .update(updatePayload)
      .eq("id", withdrawalId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({
      ok: true,
      withdrawal: data,
    });
  } catch (error: any) {
    console.error("PATCH /api/admin/withdrawals/[id] failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to update withdrawal request",
      },
      { status: 500 }
    );
  }
}
