import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

    const supabase = createSupabaseAdminClient();

    const { data: sales, error: salesError } = await supabase
      .from("course_sales")
      .select("seller_net, currency")
      .eq("seller_uid", uid)
      .eq("payment_status", "paid");

    if (salesError) {
      throw salesError;
    }

    const totalNet = (sales || []).reduce(
      (sum, row) => sum + Number(row.seller_net || 0),
      0
    );

    const currency = sales?.[0]?.currency || "PI";

    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from("withdrawal_requests")
      .select("*")
      .eq("seller_uid", uid)
      .order("created_at", { ascending: false });

    if (withdrawalsError) {
      throw withdrawalsError;
    }

    const reservedAmount = (withdrawals || [])
      .filter((row) => ["pending", "approved", "paid"].includes(row.status))
      .reduce((sum, row) => sum + Number(row.amount || 0), 0);

    const availableBalance = totalNet - reservedAmount;

    return NextResponse.json({
      ok: true,
      availableBalance,
      totalNet,
      currency,
      withdrawals: withdrawals || [],
    });
  } catch (error: any) {
    console.error("GET /api/withdrawals/history failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to load withdrawals",
      },
      { status: 500 }
    );
  }
}
