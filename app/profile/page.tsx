"use client"

import type { CSSProperties } from "react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { translations, type Lang, getDirection } from "@/lib/i18n"

type CachedPiUser = {
  uid: string
  username: string
}

type StatusKey =
  | "piChecking"
  | "restoredSavedAccount"
  | "piMissing"
  | "piReady"
  | "piInitFailed"
  | "piLinking"
  | "piAuthNoToken"
  | "piVerifyFailed"
  | "piUserDataMissing"
  | "piLinkedSuccess"
  | "piLinkFailed"
  | "loggedOut"
  | "piNotReady"

export default function ProfilePage() {
  const [lang, setLang] = useState<Lang>("ar")
  const [piReady, setPiReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState("")
  const [uid, setUid] = useState("")
  const [statusKey, setStatusKey] = useState<StatusKey>("piChecking")
  const [customStatus, setCustomStatus] = useState("")

  const t = translations[lang]
  const dir = useMemo(() => getDirection(lang), [lang])

  useEffect(() => {
    const savedLang = (window.localStorage.getItem("app_lang") as Lang) || "ar"
    setLang(savedLang)
    document.documentElement.lang = savedLang
    document.documentElement.dir = getDirection(savedLang)
  }, [])

  useEffect(() => {
    const cached = window.localStorage.getItem("pi_user")

    if (cached) {
      try {
        const parsed: CachedPiUser = JSON.parse(cached)
        if (parsed?.uid && parsed?.username) {
          setUid(parsed.uid)
          setUsername(parsed.username)
          setStatusKey("restoredSavedAccount")
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
          setStatusKey("piMissing")
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
          setStatusKey("piReady")
        }
      } catch (error: any) {
        console.error("Pi init error:", error)
        setStatusKey("piInitFailed")
        setCustomStatus(error?.message || "")
      }
    }, 500)

    return () => window.clearInterval(timer)
  }, [])

  const changeLanguage = (nextLang: Lang) => {
    setLang(nextLang)
    window.localStorage.setItem("app_lang", nextLang)
    document.documentElement.lang = nextLang
    document.documentElement.dir = getDirection(nextLang)
  }

  const handlePiLogin = async () => {
    try {
      const Pi = window.Pi

      if (!Pi?.authenticate) {
        setStatusKey("piMissing")
        setCustomStatus("")
        return
      }

      setLoading(true)
      setCustomStatus("")
      setStatusKey("piLinking")

      const auth = await Pi.authenticate(
        ["username", "payments"],
        function onIncompletePaymentFound(payment: unknown) {
          console.log("Incomplete payment found:", payment)
        }
      )

      const accessToken = auth?.accessToken
      const authUsername = auth?.user?.username || auth?.username || ""

      if (!accessToken) {
        setStatusKey("piAuthNoToken")
        return
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
        throw new Error(json?.error || t.piVerifyFailed)
      }

      const verifiedUid = json?.user?.uid || ""
      const verifiedUsername = json?.user?.username || authUsername || ""

      if (!verifiedUid || !verifiedUsername) {
        setStatusKey("piUserDataMissing")
        return
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
      setStatusKey("piLinkedSuccess")
      setCustomStatus("")
    } catch (error: any) {
      console.error("Pi login error:", error)
      setStatusKey("piLinkFailed")
      setCustomStatus(error?.message || "")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    window.localStorage.removeItem("pi_user")
    setUid("")
    setUsername("")
    setCustomStatus("")
    setStatusKey(piReady ? "loggedOut" : "piNotReady")
  }

  const statusText = customStatus || t[statusKey]

  return (
    <main style={{ ...pageStyle, direction: dir }}>
      <div style={containerStyle}>
        <div style={headerRowStyle}>
          <div>
            <h1 style={titleStyle}>{t.profileTitle}</h1>
            <p style={subtitleStyle}>{t.profileSubtitle}</p>
          </div>

          <div style={languageWrapStyle}>
            <button
              onClick={() => changeLanguage("ar")}
              style={langButtonStyle(lang === "ar")}
            >
              العربية
            </button>
            <button
              onClick={() => changeLanguage("en")}
              style={langButtonStyle(lang === "en")}
            >
              English
            </button>
          </div>
        </div>

        <section style={cardStyle}>
          <div style={sectionTitleStyle}>{t.connectPiSection}</div>

          <div style={statusTextStyle}>
            {lang === "ar" ? `الحالة: ${statusText}` : `Status: ${statusText}`}
          </div>

          {username && uid ? (
            <div style={successInfoStyle}>
              <div>
                {t.username}: {username}
              </div>
              <div>
                {t.uid}: {uid}
              </div>
            </div>
          ) : null}

          {!username ? (
            <button
              onClick={handlePiLogin}
              disabled={!piReady || loading}
              style={{
                ...primaryButtonStyle,
                background: !piReady || loading ? "#94a3b8" : "#0f172a",
                cursor: !piReady || loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? t.piLinking : t.connectPi}
            </button>
          ) : (
            <button onClick={handleLogout} style={secondaryButtonStyle}>
              {t.logout}
            </button>
          )}
        </section>

        <div style={linksGridStyle}>
          <Link href="/my-courses" style={linkCardStyle}>
            {t.myCourses}
          </Link>

          <Link href="/" style={linkCardStyle}>
            {t.exploreCourses}
          </Link>

          <Link href="/create-course" style={linkCardStyle}>
            {t.createCourse}
          </Link>
        </div>
      </div>

      <nav style={navStyle}>
        <Link href="/" style={navItemStyle(false)}>
          {t.home}
        </Link>

        <Link href="/create-course" style={navItemStyle(false)}>
          {t.createCourse}
        </Link>

        <Link href="/profile" style={navItemStyle(true)}>
          {t.profile}
        </Link>
      </nav>
    </main>
  )
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  paddingBottom: 96,
}

const containerStyle: CSSProperties = {
  maxWidth: 460,
  margin: "0 auto",
  padding: 14,
}

const headerRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  marginBottom: 16,
}

const titleStyle: CSSProperties = {
  fontSize: 30,
  fontWeight: 900,
  marginBottom: 8,
  color: "#0f172a",
}

const subtitleStyle: CSSProperties = {
  color: "#64748b",
  lineHeight: 1.8,
  margin: 0,
}

const languageWrapStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexShrink: 0,
}

function langButtonStyle(active: boolean): CSSProperties {
  return {
    border: "1px solid #cbd5e1",
    background: active ? "#0f172a" : "white",
    color: active ? "white" : "#0f172a",
    borderRadius: 12,
    padding: "10px 12px",
    fontSize: 13,
    fontWeight: 800,
    cursor: "pointer",
  }
}

const cardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 20,
  padding: 16,
  marginBottom: 16,
}

const sectionTitleStyle: CSSProperties = {
  fontSize: 22,
  fontWeight: 900,
  marginBottom: 10,
  color: "#0f172a",
}

const statusTextStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 15,
  lineHeight: 1.9,
  marginBottom: 14,
}

const successInfoStyle: CSSProperties = {
  background: "#ecfdf5",
  border: "1px solid #a7f3d0",
  color: "#065f46",
  borderRadius: 14,
  padding: 14,
  lineHeight: 1.9,
  marginBottom: 12,
  wordBreak: "break-word",
}

const primaryButtonStyle: CSSProperties = {
  border: "none",
  color: "white",
  borderRadius: 16,
  padding: "14px 18px",
  fontSize: 16,
  fontWeight: 900,
}

const secondaryButtonStyle: CSSProperties = {
  border: "1px solid #cbd5e1",
  background: "white",
  color: "#0f172a",
  borderRadius: 16,
  padding: "14px 18px",
  fontSize: 15,
  fontWeight: 800,
  cursor: "pointer",
}

const linksGridStyle: CSSProperties = {
  display: "grid",
  gap: 12,
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

const navStyle: CSSProperties = {
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
