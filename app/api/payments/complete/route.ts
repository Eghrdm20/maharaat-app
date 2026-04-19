import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const { paymentId, txid, courseId, uid, username } = await req.json()

    if (!paymentId || !txid || !courseId || !uid || !username) {
      return NextResponse.json(
        { error: "paymentId, txid, courseId, uid, username are required" },
        { status: 400 }
      )
    }

    const apiKey = process.env.PI_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing PI_API_KEY" },
        { status: 500 }
      )
    }

    const completeRes = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ txid }),
        cache: "no-store",
      }
    )

    const completeJson = await completeRes.json().catch(() => ({}))

    if (!completeRes.ok) {
      return NextResponse.json(
        {
          error: completeJson?.error || completeJson?.message || "Complete failed",
          details: completeJson,
        },
        { status: completeRes.status }
      )
    }

    const supabase = createSupabaseServerClient()

    const amount =
      completeJson?.amount ??
      completeJson?.payment?.amount ??
      0

    const currency =
      completeJson?.currency ??
      completeJson?.payment?.currency ??
      "PI"

    const { error } = await supabase
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
      )

    if (error) {
      return NextResponse.json(
        { error: `Supabase error: ${error.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { ok: true, payment: completeJson },
      { status: 200 }
    )
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error"

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
