"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

type Course = {
  id: number
  title: string
  description: string | null
  instructor_name: string
  price: number | null
  currency: string | null
  is_free: boolean
  image_url: string | null
  duration: string | null
  students_count: number | null
  rating: number | null
  is_new: boolean | null
}

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadCourses() {
      try {
        const res = await fetch("/api/courses", { cache: "no-store" })
        const json = await res.json()
        setCourses(Array.isArray(json.courses) ? json.courses : [])
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return courses
    return courses.filter((course) => {
      return (
        course.title.toLowerCase().includes(q) ||
        (course.description || "").toLowerCase().includes(q) ||
        course.instructor_name.toLowerCase().includes(q)
      )
    })
  }, [courses, search])

  return (
    <main style={{ minHeight: "100vh", paddingBottom: 96 }}>
      <div style={{ maxWidth: 460, margin: "0 auto", padding: 14 }}>
        <header style={{ paddingTop: 8, marginBottom: 18 }}>
          <div style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>
            منصة المهارات
          </div>
          <div style={{ fontSize: 16, color: "#64748b", lineHeight: 1.8 }}>
            استكشف الدورات المنشورة في المنصة
          </div>
        </header>

        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 18,
            padding: 14,
            marginBottom: 18,
          }}
        >
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث عن الدورات..."
            style={{
              width: "100%",
              border: "1px solid #dbe3ea",
              borderRadius: 14,
              padding: "12px 14px",
              fontSize: 15,
              outline: "none",
            }}
          />
        </div>

        <div style={{ fontSize: 18, fontWeight: 900, marginBottom: 12 }}>
          الدورات
        </div>

        {loading ? (
          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              padding: 16,
            }}
          >
            جاري التحميل...
          </div>
        ) : filtered.length === 0 ? (
          <div
            style={{
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: 18,
              padding: 16,
              color: "#64748b",
            }}
          >
            لا توجد دورات بعد.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {filtered.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                style={{
                  textDecoration: "none",
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: 22,
                  overflow: "hidden",
                  boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
                }}
              >
                {course.image_url ? (
                  <img
                    src={course.image_url}
                    alt={course.title}
                    style={{
                      width: "100%",
                      height: 180,
                      objectFit: "cover",
                      background: "#e2e8f0",
                      display: "block",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: 180,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#e2e8f0",
                      fontSize: 44,
                    }}
                  >
                    📘
                  </div>
                )}

                <div style={{ padding: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      alignItems: "start",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 900,
                        lineHeight: 1.6,
                        color: "#0f172a",
                      }}
                    >
                      {course.title}
                    </div>

                    {course.is_new ? (
                      <span
                        style={{
                          background: "#22c55e",
                          color: "white",
                          fontSize: 13,
                          fontWeight: 800,
                          padding: "8px 12px",
                          borderRadius: 999,
                          whiteSpace: "nowrap",
                        }}
                      >
                        جديد
                      </span>
                    ) : null}
                  </div>

                  <div
                    style={{
                      color: "#64748b",
                      marginTop: 8,
                      fontSize: 14,
                    }}
                  >
                    بواسطة {course.instructor_name}
                  </div>

                  <div
                    style={{
                      color: "#475569",
                      marginTop: 10,
                      fontSize: 14,
                      lineHeight: 1.8,
                    }}
                  >
                    {course.description || "بدون وصف"}
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      color: "#475569",
                      fontSize: 14,
                      flexWrap: "wrap",
                    }}
                  >
                    <span>المدة: {course.duration || "غير محدد"}</span>
                    <span>الطلاب: {course.students_count ?? 0}</span>
                    <span>التقييم: {course.rating ?? 0}</span>
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: 900,
                        color: "#0f172a",
                      }}
                    >
                      {course.is_free
                        ? "مجاني"
                        : `${course.price ?? 0} ${course.currency || "PI"}`}
                    </div>

                    <span
                      style={{
                        background: "#0f172a",
                        color: "white",
                        padding: "12px 18px",
                        borderRadius: 16,
                        fontWeight: 800,
                        fontSize: 15,
                      }}
                    >
                      ابدأ الآن
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
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
        <Link
          href="/profile"
          style={navItemStyle(false)}
        >
          الملف الشخصي
        </Link>

        <Link
          href="/create-course"
          style={navItemStyle(false)}
        >
          أنشئ دورة
        </Link>

        <Link
          href="/"
          style={navItemStyle(true)}
        >
          الرئيسية
        </Link>
      </nav>
    </main>
  )
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
