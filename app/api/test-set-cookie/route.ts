import { NextResponse } from "next/server"

export async function GET() {
  const response = NextResponse.json({
    ok: true,
    message: "test cookies set",
  })

  response.cookies.set("pi_uid", "TEST-UID-123", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  })

  response.cookies.set("pi_username", "TEST-USER", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10,
  })

  return response
}
