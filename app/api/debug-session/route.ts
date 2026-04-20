import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  return NextResponse.json({
    pi_uid: req.cookies.get("pi_uid")?.value || null,
    pi_username: req.cookies.get("pi_username")?.value || null,
  })
}
