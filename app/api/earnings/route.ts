import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

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

    const { data, error } = await supabase
      .from("course_sales")
      .select("seller_net, amount, currency")
      .eq("seller_uid", uid)
      .eq("payment_status", "paid");

    if (error) {
      throw error;
    }

    const sales = data || [];

    const totalSales = sales.length;
    const totalGross = sales.reduce(
      (sum, row) => sum + Number(row.amount || 0),
      0
    );
    const totalNet = sales.reduce(
      (sum, row) => sum + Number(row.seller_net || 0),
      0
    );
    const currency = sales[0]?.currency || "PI";

    return NextResponse.json({
      ok: true,
      totalSales,
      totalGross,
      totalNet,
      currency,
    });
  } catch (error: any) {
    console.error("GET /api/earnings failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to load earnings",
      },
      { status: 500 }
    );
  }
}
