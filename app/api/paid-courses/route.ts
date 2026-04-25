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

    const { data: purchases, error: purchasesError } = await supabase
      .from("purchases")
      .select("course_id, payment_id, txid, amount, currency, created_at, status")
      .eq("uid", uid)
      .eq("status", "completed")
      .order("created_at", { ascending: false });

    if (purchasesError) {
      throw purchasesError;
    }

    const rows = purchases || [];
    const courseIds = [...new Set(rows.map((item) => item.course_id))];

    if (courseIds.length === 0) {
      return NextResponse.json({
        ok: true,
        courses: [],
      });
    }

    const { data: courses, error: coursesError } = await supabase
      .from("courses")
      .select("*")
      .in("id", courseIds)
      .eq("is_deleted", false);

    if (coursesError) {
      throw coursesError;
    }

    const courseMap = new Map<number, any>();

    for (const course of courses || []) {
      courseMap.set(course.id, course);
    }

    const merged = rows
      .map((purchase) => {
        const course = courseMap.get(purchase.course_id);

        if (!course) return null;
        if (course.is_free) return null;

        return {
          ...course,
          purchase_created_at: purchase.created_at,
          paid_amount: purchase.amount,
          paid_currency: purchase.currency,
          payment_id: purchase.payment_id,
          txid: purchase.txid,
        };
      })
      .filter(Boolean);

    return NextResponse.json({
      ok: true,
      courses: merged,
    });
  } catch (error: any) {
    console.error("GET /api/paid-courses failed:", error);

    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Failed to load paid courses",
      },
      { status: 500 }
    );
  }
}
