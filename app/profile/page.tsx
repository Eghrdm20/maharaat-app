"use client"

import type { CSSProperties } from "react"
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
  const [status, setStatus] = useState("جاري التحقق من Pi SDK...")

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
        console.error("Failed to parse cached Pi user:", error)
      }
    }

    let attempts = 0

    const timer = window.setInterval(() => {
      attempts += 1
      const Pi = window.Pi

      if (!Pi?.init) {
        if (attempts >= 15 && !cached) {
          setStatus("Pi SDK غير موجود. افتح التطبيق من داخل Pi Browser")
          window.clearInterval(timer)
        }
        return
      }

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
      } catch (error: any) {
        console.error("Pi init error:", error)
        setStatus(error?.message || "تعذر تهيئة Pi SDK")
      }
    }, 500)

    return () => window.clearInterval(timer)
  }, [])

  const handlePiLogin = async () => {
    try {
      const Pi = window.Pi

      if (!Pi?.authenticate) {
        setStatus("Pi SDK غير موجود. افتح التطبيق من داخل Pi Browser")
        return
      }

      setLoading(true)
      setStatus("جاري ربط حساب Pi...")

      const auth = await Pi.authenticate(
        ["username", "payments"],
        function onIncompletePaymentFound(payment: unknown) {
          console.log("Incomplete payment found:", payment)
        }
      )

      const accessToken = auth?.accessToken
      const authUsername = auth?.user?.username || auth?.username || ""

      if (!accessToken) {
        throw new Error("لم يصل accessToken من Pi")
      }

      const res = await fetch("/api/pi/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessToken,
          authUsername,
        }),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(json?.error || "فشل التحقق من مستخدم Pi")
      }

      const verifiedUid = json?.user?.uid || ""
      const verifiedUsername = json?.user?.username || authUsername || ""

      if (!verifiedUid || !verifiedUsername) {
        throw new Error("لم تصل بيانات المستخدم الموثقة")
      }

      window.localStorage.setItem(
        "pi_user",
        JSON.stringify({
          uid: verifiedUid,
          username: verifiedUsername,
        })
      )

      setUid(verifiedUid)
      setUsername(verifiedUsername)
      setStatus("تم الربط بنجاح")
    } catch (error: any) {
      console.error("Pi login error:", error)
      setStatus(error?.message || "فشل الربط")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem("pi_user")
    setUid("")
    setUsername("")
    setStatus(piReady ? "تم تسجيل الخروج" : "Pi SDK غير جاهز")
  }

  return (
    <main style={{ minHeight: "100vh", paddingBottom: 96 }}>
      <div style={{ maxWidth: 460, margin: "0 auto", padding: 14 }}>
        <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 8 }}>
          الملف الشخصي
        </h1>

        <p style={{ color: "#64748b", lineHeight: 1.8, marginBottom: 16 }}>
          يمكنك ربط حساب Pi من هنا ثم إدارة دوراتك.
        </p>

        <section
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 20,
            padding: 16,
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 10 }}>
            ربط حساب Pi
          </div>

          <div
            style={{
              color: "#64748b",
              fontSize: 15,
              lineHeight: 1.9,
              marginBottom: 14,
            }}
          >
            الحالة: {status}
          </div>

          {username && uid ? (
            <div
              style={{
                background: "#ecfdf5",
                border: "1px solid #a7f3d0",
                color: "#065f46",
                borderRadius: 14,
                padding: 14,
                lineHeight: 1.9,
                marginBottom: 12,
              }}
            >
              <div>اسم مستخدم Pi: {username}</div>
              <div>UID: {uid}</div>
            </div>
          ) : null}

          {!username ? (
            <button
              onClick={handlePiLogin}
              disabled={!piReady || loading}
              style={{
                border: "none",
                background: !piReady || loading ? "#94a3b8" : "#0f172a",
                color: "white",
                borderRadius: 16,
                padding: "14px 18px",
                fontSize: 16,
                fontWeight: 900,
                cursor: !piReady || loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "جاري الربط..." : "ربط حساب Pi"}
            </button>
          ) : (
            <button
              onClick={handleLogout}
              style={{
                border: "1px solid #cbd5e1",
                background: "white",
                color: "#0f172a",
                borderRadius: 16,
                padding: "14px 18px",
                fontSize: 15,
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              تسجيل الخروج
            </button>
          )}
        </section>

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

const linkCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: 16,
  textDecoration: "none",
  color: "#0f172a",
  fontWeight: 800,
}

function navItemStyle(active: boolean): CSSProperties {
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
