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
      return NextResponse.json({ error: "Missing PI_API_KEY" }, { status: 500 })
    }

    const response = await fetch(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {
        method: "POST",
        headers: {
          authorization: `key ${apiKey}`,
        },
        cache: "no-store",
      }
    )

    const data = await response.json().catch(() => ({}))

    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("POST /api/pi/approve failed:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
