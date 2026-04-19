import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { paymentId } = await req.json()

    if (!paymentId) {
      return NextResponse.json(
        { error: "paymentId is required" },
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

    const res = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {
        method: "POST",
        headers: {
          Authorization: `Key ${apiKey}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    )

    const json = await res.json().catch(() => ({}))

    if (!res.ok) {
      return NextResponse.json(
        {
          error: json?.error || json?.message || "Approve failed",
          details: json,
        },
        { status: res.status }
      )
    }

    return NextResponse.json({ ok: true, payment: json }, { status: 200 })
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown server error"

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
