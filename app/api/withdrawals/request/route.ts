import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { uid, username, walletAddress, amount } = await req.json();

    if (!uid || !username || !walletAddress || !amount) {
      return NextResponse.json(
        { ok: false, error: "uid, username, walletAddress, amount are required" },
        { status: 400 }
      );
    }

    const requestedAmount = Number(amount);

    if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
      return NextResponse.json(
        { ok: false, error: "Invalid withdrawal amount" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseAdminClient();

    // 1) إجمالي صافي الأرباح المدفوعة
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

    // 2) إجمالي السحوبات غير المرفوضة
    const { data: withdrawals, error: withdrawalsError } = await supabase
      .from("withdrawal_requests")
      .select("amount, status")
      .eq("seller_uid", uid)
      .in("status", ["pending", "approved", "paid"]);

    if (withdrawalsError) {
      throw withdrawalsError;
    }

    const reservedAmount = (withdrawals || []).reduce(
      (sum, row) => sum + Number(row.amount || 0),
      0
    );

    const availableBalance = totalNet - reservedAmount;

    if (requestedAmount > availableBalance) {
      return NextResponse.json(
        {
          ok: false,
          error: "Requested amount exceeds available balance",
          availableBalance,
          currency,
        },
        { status: 400 }
      );
    }

    // 3) إنشاء طلب السحب
    const { data: requestRow, error: insertError } = await supabase
      .from("withdrawal_requests")
      .insert([
        {
          seller_uid: uid,
          seller_username: username,
          wallet_address: walletAddress.trim(),
          amount: requestedAmount,
          currency,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      ok: true,
      request: requestRow,
      availableBalance: availableBalance - requestedAmount,
      currency,
    });
  } catch (error: any) {
    console.error("POST /api/withdrawals/request failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to create withdrawal request",
      },
      { status: 500 }
    );
  }
}
