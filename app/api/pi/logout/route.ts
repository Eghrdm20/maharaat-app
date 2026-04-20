import { NextResponse } from "next/server"

export async function POST() {
  const response = NextResponse.json({ ok: true })

  response.cookies.set("pi_uid", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })

  response.cookies.set("pi_username", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })

  return response
}
