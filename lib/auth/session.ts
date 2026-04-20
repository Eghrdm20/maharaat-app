import { createHash, randomBytes } from "crypto"
import type { NextRequest } from "next/server"
import { createSupabaseAdminClient } from "@/lib/supabase/admin"

export function generateSessionToken() {
  return randomBytes(32).toString("hex")
}

export function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

export async function getSessionFromRequest(req: NextRequest) {
  const authHeader = req.headers.get("authorization") || ""

  if (!authHeader.startsWith("Bearer ")) {
    return null
  }

  const rawToken = authHeader.slice(7).trim()
  if (!rawToken) return null

  const tokenHash = hashSessionToken(rawToken)
  const supabaseAdmin = createSupabaseAdminClient()

  const { data, error } = await supabaseAdmin
    .from("pi_sessions")
    .select("id, uid, username, expires_at, revoked_at")
    .eq("token_hash", tokenHash)
    .is("revoked_at", null)
    .gt("expires_at", new Date().toISOString())
    .single()

  if (error || !data) {
    return null
  }

  await supabaseAdmin
    .from("pi_sessions")
    .update({
      last_used_at: new Date().toISOString(),
    })
    .eq("id", data.id)

  return data
}
