"use client"

import type { CSSProperties } from "react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { createSupabaseClient } from "@/lib/supabase/client"
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
  students_count: number | null
  rating: number | null
  is_new: boolean | null
}

export default function HomePage() {
  const [lang, setLang] = useState<Lang>("ar")
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const t = translations[lang]
  const dir = useMemo(() => getDirection(lang), [lang])

  useEffect(() => {
    const savedLang = (window.localStorage.getItem("app_lang") as Lang) || "ar"
    setLang(savedLang)
    document.documentElement.lang = savedLang
    document.documentElement.dir = getDirection(savedLang)
  }, [])

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true)
        setError("")

        const supabase = createSupabaseClient()

        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .order("id", { ascending: false })

        if (error) {
          throw new Error(error.message)
        }

        const nextCourses = (data || []) as Course[]
        setCourses(nextCourses)
        setFilteredCourses(nextCourses)
      } catch (err: any) {
        console.error(err)
        setError(err?.message || t.failedToLoadCourses)
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [t.failedToLoadCourses])

  useEffect(() => {
    const q = search.trim().toLowerCase()

    if (!q) {
      setFilteredCourses(courses)
      return
    }

    setFilteredCourses(
      courses.filter((course) => {
        return (
          course.title?.toLowerCase().includes(q) ||
          course.description?.toLowerCase().includes(q) ||
          course.instructor_name?.toLowerCase().includes(q)
        )
      })
    )
  }, [search, courses])

  const changeLanguage = (nextLang: Lang) => {
    setLang(nextLang)
    window.localStorage.setItem("app_lang", nextLang)
    document.documentElement.lang = nextLang
    document.documentElement.dir = getDirection(nextLang)
  }

  return (
    <main style={{ ...pageStyle, direction: dir }}>
      <div style={containerStyle}>
        <header style={headerStyle}>
          <div style={topBarStyle}>
            <div>
              <h1 style={titleStyle}>{t.homeTitle}</h1>
              <p style={subtitleStyle}>{t.homeSubtitle}</p>
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
        </header>

        <section style={searchBoxStyle}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchCourses}
            style={searchInputStyle}
          />
        </section>

        <section>
          <div style={sectionHeaderStyle}>
            <h2 style={sectionTitleStyle}>{t.courses}</h2>
          </div>

          {loading ? (
            <div style={infoBoxStyle}>{t.loadingCourses}</div>
          ) : error ? (
            <div style={errorBoxStyle}>{error}</div>
          ) : filteredCourses.length === 0 ? (
            <div style={infoBoxStyle}>{t.noCourses}</div>
          ) : (
            <div style={gridStyle}>
              {filteredCourses.map((course) => (
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
                    <div style={cardTitleRowStyle}>
                      <h3 style={cardTitleStyle}>{course.title}</h3>

                      {course.is_new ? (
                        <span style={badgeStyle}>{t.new}</span>
                      ) : null}
                    </div>

                    <div style={metaTextStyle}>
                      {t.instructorBy} {course.instructor_name}
                    </div>

                    <p style={descriptionStyle}>
                      {course.description || t.noDescription}
                    </p>

                    <div style={statsGridStyle}>
                      <div>
                        {t.rating}: {course.rating ?? 0}
                      </div>
                      <div>
                        {t.students}: {course.students_count ?? 0}
                      </div>
                      <div>
                        {t.duration}: {course.duration || t.notSpecified}
                      </div>
                    </div>

                    <div style={bottomRowStyle}>
                      <div style={priceStyle}>
                        {course.is_free
                          ? t.free
                          : `${course.price} ${course.currency || "PI"}`}
                      </div>

                      <div style={actionButtonStyle}>{t.startNow}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <nav style={navStyle}>
        <Link href="/profile" style={navItemStyle(false)}>
          {t.profile}
        </Link>

        <Link href="/create-course" style={navItemStyle(false)}>
          {t.createCourse}
        </Link>

        <Link href="/" style={navItemStyle(true)}>
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

const headerStyle: CSSProperties = {
  marginBottom: 18,
}

const topBarStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
}

const titleStyle: CSSProperties = {
  fontSize: 34,
  fontWeight: 900,
  margin: "8px 0",
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

const searchBoxStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 24,
  padding: 16,
  marginBottom: 18,
}

const searchInputStyle: CSSProperties = {
  width: "100%",
  border: "1px solid #dbe3ea",
  borderRadius: 18,
  padding: "14px 16px",
  fontSize: 16,
  outline: "none",
  background: "white",
}

const sectionHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 14,
}

const sectionTitleStyle: CSSProperties = {
  fontSize: 24,
  fontWeight: 900,
  margin: 0,
  color: "#0f172a",
}

const infoBoxStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 20,
  padding: 18,
  color: "#475569",
}

const errorBoxStyle: CSSProperties = {
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: 20,
  padding: 18,
  color: "#991b1b",
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
  padding: 0,
}

const imageWrapStyle: CSSProperties = {
  width: "100%",
  height: 180,
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
  fontSize: 48,
}

const cardContentStyle: CSSProperties = {
  padding: 16,
}

const cardTitleRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  marginBottom: 10,
}

const cardTitleStyle: CSSProperties = {
  fontSize: 22,
  fontWeight: 900,
  margin: 0,
}

const badgeStyle: CSSProperties = {
  background: "#22c55e",
  color: "white",
  borderRadius: 999,
  padding: "8px 14px",
  fontWeight: 800,
  whiteSpace: "nowrap",
}

const metaTextStyle: CSSProperties = {
  color: "#64748b",
  marginBottom: 8,
  fontSize: 15,
}

const descriptionStyle: CSSProperties = {
  color: "#475569",
  lineHeight: 1.8,
  marginTop: 0,
  marginBottom: 14,
}

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 8,
  marginBottom: 14,
  color: "#334155",
  fontSize: 14,
}

const bottomRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
}

const priceStyle: CSSProperties = {
  fontSize: 20,
  fontWeight: 900,
  color: "#0f172a",
}

const actionButtonStyle: CSSProperties = {
  background: "#0f172a",
  color: "white",
  borderRadius: 18,
  padding: "14px 18px",
  fontWeight: 900,
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
