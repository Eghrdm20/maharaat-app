import { NextRequest, NextResponse } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"
import { hashSessionToken } from "@/lib/auth/session"

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization") || ""

    if (authHeader.startsWith("Bearer ")) {
      const rawToken = authHeader.slice(7).trim()

      if (rawToken) {
        const tokenHash = hashSessionToken(rawToken)
        const supabaseAdmin = createSupabaseAdminClient()

        await supabaseAdmin
          .from("pi_sessions")
          .update({
            revoked_at: new Date().toISOString(),
          })
          .eq("token_hash", tokenHash)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Server error" },
      { status: 500 }
    )
  }
}
