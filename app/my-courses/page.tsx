"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

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
}

type CachedPiUser = {
  uid: string
  username: string
}

export default function MyCoursesPage() {
  const [piUser, setPiUser] = useState<CachedPiUser | null>(null)
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    const cached = window.localStorage.getItem("pi_user")

    if (!cached) {
      setLoading(false)
      return
    }

    try {
      const parsed = JSON.parse(cached)
      if (parsed?.uid && parsed?.username) {
        setPiUser(parsed)
      } else {
        setLoading(false)
      }
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    async function loadMyCourses() {
      if (!piUser?.uid) return

      try {
        setLoading(true)
        setError("")

        const res = await fetch(
          `/api/my-courses?uid=${encodeURIComponent(piUser.uid)}`,
          { cache: "no-store" }
        )

        const json = await res.json()

        if (!res.ok) {
          throw new Error(json?.error || "Failed to load courses")
        }

        setCourses(Array.isArray(json.courses) ? json.courses : [])
      } catch (error) {
        console.error(error)
        setError("تعذر تحميل دوراتك")
      } finally {
        setLoading(false)
      }
    }

    loadMyCourses()
  }, [piUser])

  return (
    <main style={{ minHeight: "100vh", paddingBottom: 40 }}>
      <div style={{ maxWidth: 460, margin: "0 auto", padding: 14 }}>
        <Link
          href="/profile"
          style={{
            color: "#0f172a",
            textDecoration: "none",
            fontSize: 14,
            display: "inline-block",
            marginBottom: 12,
          }}
        >
          ← العودة
        </Link>

        <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 12 }}>
          دوراتي
        </h1>

        {!piUser ? (
          <div style={cardStyle}>
            اربط حساب Pi من صفحة الملف الشخصي أولًا حتى تظهر دوراتك.
          </div>
        ) : loading ? (
          <div style={cardStyle}>جاري تحميل دوراتك...</div>
        ) : error ? (
          <div
            style={{
              ...cardStyle,
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              color: "#881337",
            }}
          >
            {error}
          </div>
        ) : courses.length === 0 ? (
          <div style={cardStyle}>لا توجد دورات مشتراة بعد.</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/courses/${course.id}`}
                style={{
                  textDecoration: "none",
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: 18,
                  padding: 14,
                  color: "#0f172a",
                }}
              >
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 6 }}>
                  {course.title}
                </div>

                <div style={{ fontSize: 14, color: "#64748b", marginBottom: 6 }}>
                  بواسطة {course.instructor_name}
                </div>

                <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.8 }}>
                  {course.description || "بدون وصف"}
                </div>

                <div style={{ fontSize: 13, color: "#475569", marginTop: 8 }}>
                  {course.is_free
                    ? "مجاني"
                    : `${course.price ?? 0} ${course.currency || "PI"}`}{" "}
                  • {course.duration || "غير محدد"}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

const cardStyle: React.CSSProperties = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: 16,
  color: "#64748b",
  lineHeight: 1.8,
              }
