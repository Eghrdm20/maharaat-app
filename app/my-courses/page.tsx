"use client"

import type { CSSProperties } from "react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { translations, type Lang, getDirection } from "@/lib/i18n"

type Course = {
  id: number
  title: string
  description: string | null
  instructor_name: string
  price: number | string | null
  currency: string | null
  is_free: boolean
  image_url: string | null
  duration: string | null
  purchase_created_at?: string
}

type PiUser = {
  uid: string
  username: string
}

export default function MyCoursesPage() {
  const [lang, setLang] = useState<Lang>("ar")
  const [piUser, setPiUser] = useState<PiUser | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const t = translations[lang]
  const dir = useMemo(() => getDirection(lang), [lang])

  useEffect(() => {
    const savedLang = (window.localStorage.getItem("app_lang") as Lang) || "ar"
    setLang(savedLang)
    document.documentElement.lang = savedLang
    document.documentElement.dir = getDirection(savedLang)

    const cachedUser = window.localStorage.getItem("pi_user")
    if (!cachedUser) {
      setLoading(false)
      return
    }

    try {
      const parsed = JSON.parse(cachedUser)
      if (parsed?.uid && parsed?.username) {
        setPiUser(parsed)
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error("Failed to parse pi_user", error)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const loadMyCourses = async () => {
      if (!piUser?.uid) return

      try {
        setLoading(true)
        setError("")

        const res = await fetch(
          `/api/my-courses?uid=${encodeURIComponent(piUser.uid)}`,
          { cache: "no-store" }
        )

        const json = await res.json().catch(() => ({}))

        if (!res.ok) {
          throw new Error(json?.error || t.failedToLoadCourses)
        }

        setCourses(Array.isArray(json.courses) ? json.courses : [])
      } catch (error: any) {
        console.error(error)
        setError(error?.message || t.failedToLoadCourses)
      } finally {
        setLoading(false)
      }
    }

    loadMyCourses()
  }, [piUser, t.failedToLoadCourses])

  const changeLanguage = (nextLang: Lang) => {
    setLang(nextLang)
    window.localStorage.setItem("app_lang", nextLang)
    document.documentElement.lang = nextLang
    document.documentElement.dir = getDirection(nextLang)
  }

  return (
    <main style={{ ...pageStyle, direction: dir }}>
      <div style={containerStyle}>
        <div style={headerRowStyle}>
          <div>
            <Link href="/profile" style={backLinkStyle}>
              {t.back}
            </Link>

            <h1 style={titleStyle}>{t.myCoursesTitle}</h1>
            <p style={subtitleStyle}>{t.myCoursesSubtitle}</p>
          </div>

          <div style={languageWrapStyle}>
            <button
              onClick={() => changeLanguage("ar")}
              style={langButtonStyle(lang === "ar")}
              type="button"
            >
              العربية
            </button>
            <button
              onClick={() => changeLanguage("en")}
              style={langButtonStyle(lang === "en")}
              type="button"
            >
              English
            </button>
          </div>
        </div>

        {!piUser ? (
          <div style={infoBoxStyle}>{t.mustConnectPiFirst}</div>
        ) : loading ? (
          <div style={infoBoxStyle}>{t.loadingCourses}</div>
        ) : error ? (
          <div style={errorBoxStyle}>{error}</div>
        ) : courses.length === 0 ? (
          <div style={infoBoxStyle}>{t.noOwnedCourses}</div>
        ) : (
          <div style={gridStyle}>
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                style={cardLinkStyle}
              >
                <div style={imageWrapStyle}>
                  {course.image_url ? (
                    <img
                      src={course.image_url}
                      alt={course.title}
                      style={imageStyle}
                    />
                  ) : (
                    <div style={imagePlaceholderStyle}>📘</div>
                  )}
                </div>

                <div style={cardContentStyle}>
                  <h3 style={cardTitleStyle}>{course.title}</h3>

                  <div style={metaTextStyle}>
                    {t.instructorBy} {course.instructor_name}
                  </div>

                  <p style={descriptionStyle}>
                    {course.description || t.noDescription}
                  </p>

                  <div style={statsRowStyle}>
                    <div>
                      {t.duration}: {course.duration || t.notSpecified}
                    </div>
                    <div>
                      {t.price}:{" "}
                      {course.is_free
                        ? t.free
                        : `${course.price} ${course.currency || "PI"}`}
                    </div>
                  </div>

                  <div style={openButtonStyle}>{t.startNow}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <nav style={navStyle}>
        <Link href="/profile" style={navItemStyle(false)}>
          {t.profile}
        </Link>

        <Link href="/my-courses" style={navItemStyle(true)}>
          {t.myCourses}
        </Link>

        <Link href="/" style={navItemStyle(false)}>
          {t.home}
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

const backLinkStyle: CSSProperties = {
  color: "#0f172a",
  textDecoration: "none",
  fontSize: 14,
  display: "inline-block",
  marginBottom: 10,
}

const titleStyle: CSSProperties = {
  fontSize: 30,
  fontWeight: 900,
  margin: "0 0 8px",
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

const infoBoxStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 20,
  padding: 18,
  color: "#475569",
  lineHeight: 1.8,
}

const errorBoxStyle: CSSProperties = {
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: 20,
  padding: 18,
  color: "#991b1b",
  lineHeight: 1.8,
}

const gridStyle: CSSProperties = {
  display: "grid",
  gap: 16,
}

const cardLinkStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 24,
  textDecoration: "none",
  color: "#0f172a",
  overflow: "hidden",
}

const imageWrapStyle: CSSProperties = {
  width: "100%",
  height: 170,
  background: "#e2e8f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  overflow: "hidden",
}

const imageStyle: CSSProperties = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
}

const imagePlaceholderStyle: CSSProperties = {
  fontSize: 44,
}

const cardContentStyle: CSSProperties = {
  padding: 16,
}

const cardTitleStyle: CSSProperties = {
  fontSize: 22,
  fontWeight: 900,
  margin: "0 0 8px",
}

const metaTextStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 14,
  marginBottom: 10,
}

const descriptionStyle: CSSProperties = {
  color: "#475569",
  lineHeight: 1.8,
  margin: "0 0 14px",
}

const statsRowStyle: CSSProperties = {
  display: "grid",
  gap: 8,
  color: "#334155",
  fontSize: 14,
  marginBottom: 14,
}

const openButtonStyle: CSSProperties = {
  background: "#0f172a",
  color: "white",
  borderRadius: 16,
  padding: "12px 16px",
  fontWeight: 900,
  textAlign: "center",
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
