import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { id, status, processedTxid, note } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { ok: false, error: "id and status are required" },
        { status: 400 }
      );
    }

    if (!["pending", "approved", "paid", "rejected"].includes(status)) {
      return NextResponse.json(
        { ok: false, error: "Invalid status" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    const updatePayload: Record<string, any> = {
      status,
      note: note || null,
    };

    if (status === "paid" || status === "approved") {
      updatePayload.processed_at = new Date().toISOString();
    }

    if (processedTxid) {
      updatePayload.processed_txid = processedTxid;
    }

    const { data, error } = await supabase
      .from("withdrawal_requests")
      .update(updatePayload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ ok: true, request: data });
  } catch (error: any) {
    console.error("POST /api/withdrawals/update failed:", error);

    return NextResponse.json(
      { ok: false, error: error?.message || "Failed to update withdrawal" },
      { status: 500 }
    );
  }
}
