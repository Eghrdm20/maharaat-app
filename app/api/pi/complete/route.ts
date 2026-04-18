import { NextRequest, NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const {
      paymentId,
      txid,
      courseId,
      uid,
      username,
      amount,
      currency,
    } = await req.json()

    if (!paymentId || !txid || !courseId || !uid || !username) {
      return NextResponse.json(
        {
          error: "paymentId, txid, courseId, uid, username are required",
        },
        { status: 400 }
      )
    }

    const apiKey = process.env.PI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Missing PI_API_KEY" }, { status: 500 })
    }

    const response = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/complete`,
      {
        method: "POST",
        headers: {
          authorization: `key ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ txid }),
        cache: "no-store",
      }
    )

    const payment = await response.json().catch(() => ({}))

    if (!response.ok) {
      return NextResponse.json(payment, { status: response.status })
    }

    const supabase = createSupabaseServerClient()

    const { error: userError } = await supabase
      .from("pi_users")
      .upsert(
        [
          {
            uid,
            username,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: "uid" }
      )

    if (userError) {
      return NextResponse.json({ error: userError.message }, { status: 500 })
    }

    const { data: purchase, error: purchaseError } = await supabase
      .from("purchases")
      .upsert(
        [
          {
            uid,
            username,
            course_id: Number(courseId),
            payment_id: paymentId,
            txid,
            amount: Number(amount ?? 0),
            currency: currency || "PI",
            status: "completed",
          },
        ],
        { onConflict: "uid,course_id" }
      )
      .select()
      .single()

    if (purchaseError) {
      return NextResponse.json({ error: purchaseError.message }, { status: 500 })
    }

    return NextResponse.json(
      {
        success: true,
        payment,
        purchase,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("POST /api/pi/complete failed:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
