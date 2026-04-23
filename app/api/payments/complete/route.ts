import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const { paymentId, txid, courseId, uid, username } = await req.json();

    if (!paymentId || !txid || !courseId || !uid || !username) {
      return NextResponse.json(
        { error: "paymentId, txid, courseId, uid, username are required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.PI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing PI_API_KEY" },
        { status: 500 }
      );
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const completeRes = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      {
        method: "POST",
        headers: {
          authorization: `key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ txid }),
        cache: "no-store",
        signal: controller.signal,
      }
    ).finally(() => clearTimeout(timeout));

    const completeJson = await completeRes.json().catch(() => ({}));

    if (!completeRes.ok) {
      return NextResponse.json(
        {
          error:
            completeJson?.error ||
            completeJson?.message ||
            "Complete failed",
          details: completeJson,
        },
        { status: completeRes.status }
      );
    }

    const supabase = createSupabaseServerClient();

    const amount = Number(
      completeJson?.amount ?? completeJson?.payment?.amount ?? 0
    );

    const currency =
      completeJson?.currency ??
      completeJson?.payment?.currency ??
      "PI";

    // 1) حفظ الشراء
    const { error: purchaseError } = await supabase
      .from("purchases")
      .upsert(
        [
          {
            uid,
            username,
            course_id: Number(courseId),
            payment_id: paymentId,
            txid,
            amount,
            currency,
            status: "completed",
          },
        ],
        { onConflict: "payment_id" }
      );

    if (purchaseError) {
      return NextResponse.json(
        { error: `Supabase purchase error: ${purchaseError.message}` },
        { status: 500 }
      );
    }

    // 2) جلب بيانات الدورة لمعرفة البائع
    const { data: course, error: courseError } = await supabase
      .from("courses")
      .select("id, owner_pi_uid, instructor_name, price, currency")
      .eq("id", Number(courseId))
      .single();

    if (courseError) {
      return NextResponse.json(
        { error: `Course lookup error: ${courseError.message}` },
        { status: 500 }
      );
    }

    const sellerUid = course?.owner_pi_uid || null;
    const sellerUsername = course?.instructor_name || null;

    if (!sellerUid) {
      return NextResponse.json(
        {
          error:
            "Course owner_pi_uid is missing, cannot record seller earnings",
        },
        { status: 500 }
      );
    }

    // 3) حساب صافي أرباح البائع
    const platformFee = 0;
    const sellerNet = amount - platformFee;

    // 4) حفظ الأرباح في course_sales
    const { error: saleError } = await supabase
      .from("course_sales")
      .upsert(
        [
          {
            course_id: Number(courseId),
            seller_uid: sellerUid,
            seller_username: sellerUsername,
            buyer_uid: uid,
            buyer_username: username,
            amount,
            currency,
            platform_fee: platformFee,
            seller_net: sellerNet,
            payment_txid: txid,
            payment_id: paymentId,
            payment_status: "paid",
          },
        ],
        { onConflict: "payment_id" }
      );

    if (saleError) {
      return NextResponse.json(
        { error: `Supabase sales error: ${saleError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        payment: completeJson,
        saleRecorded: true,
      },
      { status: 200 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
