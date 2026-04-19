"use client"

import type { CSSProperties } from "react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createSupabaseClient } from "@/lib/supabase/client"

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
  is_deleted?: boolean
}

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true)
        setError("")

        const supabase = createSupabaseClient()

        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("is_deleted", false)
          .order("id", { ascending: false })

        if (error) {
          throw new Error(error.message)
        }

        const nextCourses = (data || []) as Course[]
        setCourses(nextCourses)
        setFilteredCourses(nextCourses)
      } catch (err: any) {
        console.error(err)
        setError(err?.message || "تعذر تحميل الدورات")
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [])

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

  return (
    <main style={{ minHeight: "100vh", paddingBottom: 96 }}>
      <div style={{ maxWidth: 460, margin: "0 auto", padding: 14 }}>
        <header style={{ textAlign: "center", marginBottom: 18 }}>
          <h1 style={{ fontSize: 34, fontWeight: 900, margin: "8px 0" }}>
            دورات تدريبية 🎓
          </h1>
          <p style={{ color: "#64748b", lineHeight: 1.8 }}>
            استكشف الدورات المنشورة في المنصة
          </p>
        </header>

        <section
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 24,
            padding: 16,
            marginBottom: 18,
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن الدورات..."
            style={searchInputStyle}
          />
        </section>

        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>الدورات</h2>
          </div>

          {loading ? (
            <div style={infoBoxStyle}>جاري تحميل الدورات...</div>
          ) : error ? (
            <div style={errorBoxStyle}>{error}</div>
          ) : filteredCourses.length === 0 ? (
            <div style={infoBoxStyle}>لا توجد دورات مطابقة</div>
          ) : (
            <div style={{ display: "grid", gap: 16 }}>
              {filteredCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  style={{
                    ...cardStyle,
                    textDecoration: "none",
                    color: "#0f172a",
                    overflow: "hidden",
                    padding: 0,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: 180,
                      background: "#e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {course.image_url ? (
                      <img
                        src={course.image_url}
                        alt={course.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div style={{ fontSize: 48 }}>📘</div>
                    )}
                  </div>

                  <div style={{ padding: 16 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                        marginBottom: 10,
                      }}
                    >
                      <h3
                        style={{
                          fontSize: 22,
                          fontWeight: 900,
                          margin: 0,
                        }}
                      >
                        {course.title}
                      </h3>

                      {course.is_new ? (
                        <span style={newBadgeStyle}>جديد</span>
                      ) : null}
                    </div>

                    <div
                      style={{
                        color: "#64748b",
                        marginBottom: 8,
                        fontSize: 15,
                      }}
                    >
                      بواسطة {course.instructor_name}
                    </div>

                    <p
                      style={{
                        color: "#475569",
                        lineHeight: 1.8,
                        marginTop: 0,
                        marginBottom: 14,
                      }}
                    >
                      {course.description || "لا يوجد وصف"}
                    </p>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                        gap: 8,
                        marginBottom: 14,
                        color: "#334155",
                        fontSize: 14,
                      }}
                    >
                      <div>التقييم: {course.rating ?? 0}</div>
                      <div>الطلاب: {course.students_count ?? 0}</div>
                      <div>المدة: {course.duration || "غير محددة"}</div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          fontSize: 20,
                          fontWeight: 900,
                          color: "#0f172a",
                        }}
                      >
                        {course.is_free
                          ? "مجاني"
                          : `${course.price} ${course.currency || "PI"}`}
                      </div>

                      <div style={startButtonStyle}>ابدأ الآن</div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
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
        <Link href="/profile" style={navItemStyle(false)}>
          الملف الشخصي
        </Link>

        <Link href="/create-course" style={navItemStyle(false)}>
          أنشئ دورة
        </Link>

        <Link href="/" style={navItemStyle(true)}>
          الرئيسية
        </Link>
      </nav>
    </main>
  )
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

const cardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 24,
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

const newBadgeStyle: CSSProperties = {
  background: "#22c55e",
  color: "white",
  borderRadius: 999,
  padding: "8px 14px",
  fontWeight: 800,
  whiteSpace: "nowrap",
}

const startButtonStyle: CSSProperties = {
  background: "#0f172a",
  color: "white",
  borderRadius: 18,
  padding: "14px 18px",
  fontWeight: 900,
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
