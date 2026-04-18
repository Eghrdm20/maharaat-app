"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

type CachedPiUser = {
  uid: string
  username: string
}

export default function ProfilePage() {
  const [piReady, setPiReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState("")
  const [uid, setUid] = useState("")
  const [status, setStatus] = useState("غير مرتبط بـ Pi")

  useEffect(() => {
    const cached = window.localStorage.getItem("pi_user")

    if (cached) {
      try {
        const parsed: CachedPiUser = JSON.parse(cached)
        if (parsed?.uid && parsed?.username) {
          setUid(parsed.uid)
          setUsername(parsed.username)
          setStatus("تم استرجاع الحساب المحفوظ")
        }
      } catch (error) {
        console.error(error)
      }
    }

    const timer = window.setInterval(() => {
      const Pi = (window as any).Pi
      if (!Pi) return

      window.clearInterval(timer)

      try {
        Pi.init({
          version: "2.0",
          sandbox: process.env.NEXT_PUBLIC_PI_SANDBOX === "true",
        })
        setPiReady(true)

        if (!cached) {
          setStatus("Pi SDK جاهز")
        }
      } catch (error) {
        console.error(error)
        setStatus("تعذر تهيئة Pi SDK")
      }
    }, 400)

    return () => window.clearInterval(timer)
  }, [])

  const handlePiLogin = async () => {
    try {
      const Pi = (window as any).Pi

      if (!Pi) {
        setStatus("افتح التطبيق من Pi Browser")
        return
      }

      setLoading(true)
      setStatus("جاري ربط حساب Pi...")

      const auth = await Pi.authenticate(["username", "payments"], () => {})

      const nextUsername = auth?.user?.username || auth?.username || ""
      const nextUid = auth?.user?.uid || auth?.uid || ""

      if (!nextUsername || !nextUid) {
        throw new Error("Missing Pi user data")
      }

      const res = await fetch("/api/pi/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: nextUid, username: nextUsername }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.error || "Failed to save Pi user")
      }

      window.localStorage.setItem(
        "pi_user",
        JSON.stringify({
          uid: nextUid,
          username: nextUsername,
        })
      )

      setUid(nextUid)
      setUsername(nextUsername)
      setStatus("تم الربط بنجاح")
    } catch (error) {
      console.error(error)
      setStatus("فشل الربط")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ minHeight: "100vh", paddingBottom: 96 }}>
      <div style={{ maxWidth: 460, margin: "0 auto", padding: 14 }}>
        <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
          الملف الشخصي
        </h1>
        <p style={{ color: "#64748b", lineHeight: 1.8, marginBottom: 16 }}>
          يمكنك ربط حساب Pi من هنا ثم إدارة دوراتك.
        </p>

        <div style={cardStyle}>
          <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 10 }}>
            ربط حساب Pi
          </div>

          <div style={{ color: "#64748b", marginBottom: 12, lineHeight: 1.8 }}>
            الحالة: {status}
          </div>

          {username ? (
            <div
              style={{
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#065f46",
                borderRadius: 14,
                padding: 12,
                lineHeight: 1.8,
              }}
            >
              <div>اسم مستخدم Pi: {username}</div>
              <div>UID: {uid}</div>
            </div>
          ) : (
            <button
              onClick={handlePiLogin}
              disabled={!piReady || loading}
              style={primaryButtonStyle(!piReady || loading)}
            >
              {loading ? "جاري الربط..." : "ربط حساب Pi"}
            </button>
          )}
        </div>

        <div style={{ display: "grid", gap: 12 }}>
          <Link href="/my-courses" style={linkCardStyle}>
            دوراتي
          </Link>

          <Link href="/" style={linkCardStyle}>
            استكشاف الدورات
          </Link>

          <Link href="/create-course" style={linkCardStyle}>
            إنشاء دورة جديدة
          </Link>
        </div>
      </div>

      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 460,
          background: "white",
          borderTop: "1px solid #e5e7eb",
          padding: 10,
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 8,
        }}
      >
        <Link href="/" style={navItemStyle(false)}>
          الرئيسية
        </Link>
        <Link href="/create-course" style={navItemStyle(false)}>
          أنشئ دورة
        </Link>
        <Link href="/profile" style={navItemStyle(true)}>
          الملف الشخصي
        </Link>
      </nav>
    </main>
  )
}

const cardStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: 16,
  marginBottom: 16,
}

const linkCardStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: 16,
  textDecoration: "none",
  color: "#0f172a",
  fontWeight: 800,
}

function primaryButtonStyle(disabled: boolean): React.CSSProperties {
  return {
    border: "none",
    background: disabled ? "#94a3b8" : "#0f172a",
    color: "white",
    borderRadius: 14,
    padding: "12px 16px",
    fontSize: 15,
    fontWeight: 800,
    cursor: disabled ? "not-allowed" : "pointer",
  }
}

function navItemStyle(active: boolean): React.CSSProperties {
  return {
    textDecoration: "none",
    textAlign: "center",
    background: active ? "#0f172a" : "transparent",
    color: active ? "white" : "#0f172a",
    padding: "12px 8px",
    borderRadius: 18,
    fontSize: 14,
    fontWeight: active ? 800 : 700,
  }
          }
