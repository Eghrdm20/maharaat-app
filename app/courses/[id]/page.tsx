"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import PiPayButton from "@/components/pi-pay-button"

type Course = {
  id: number
  title: string
  description: string | null
  instructor_name: string
  price: number | null
  currency: string | null
  is_free: boolean
  image_url: string | null
  video_url: string | null
  file_url: string | null
  duration: string | null
  students_count: number | null
  rating: number | null
  is_new: boolean | null
  created_at: string
}

type CachedPiUser = {
  uid: string
  username: string
}

export default function CourseDetailsPage() {
  const params = useParams()
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id

  const [course, setCourse] = useState<Course | null>(null)
  const [loading, setLoading] = useState(true)
  const [paid, setPaid] = useState(false)
  const [piUser, setPiUser] = useState<CachedPiUser | null>(null)

  useEffect(() => {
    const cached = window.localStorage.getItem("pi_user")
    if (cached) {
      try {
        const parsed = JSON.parse(cached)
        if (parsed?.uid && parsed?.username) {
          setPiUser(parsed)
        }
      } catch (error) {
        console.error(error)
      }
    }
  }, [])

  useEffect(() => {
    async function loadCourse() {
      try {
        const res = await fetch("/api/courses", { cache: "no-store" })
        const json = await res.json()
        const items = Array.isArray(json.courses) ? json.courses : []
        const found = items.find((item: Course) => String(item.id) === String(id))
        setCourse(found || null)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadCourse()
  }, [id])

  useEffect(() => {
    async function checkPurchased() {
      if (!piUser?.uid || !id) return

      try {
        const res = await fetch(
          `/api/my-courses?uid=${encodeURIComponent(piUser.uid)}`,
          { cache: "no-store" }
        )
        const json = await res.json()
        const items = Array.isArray(json.courses) ? json.courses : []
        const found = items.some((item: Course) => String(item.id) === String(id))
        setPaid(found)
      } catch (error) {
        console.error(error)
      }
    }

    checkPurchased()
  }, [piUser, id])

  const canStart = useMemo(() => {
    if (!course) return false
    return course.is_free || paid
  }, [course, paid])

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", padding: 20, direction: "rtl" }}>
        جاري التحميل...
      </main>
    )
  }

  if (!course) {
    return (
      <main style={{ minHeight: "100vh", padding: 20, direction: "rtl" }}>
        <p>الدورة غير موجودة.</p>
        <Link href="/">العودة للرئيسية</Link>
      </main>
    )
  }

  return (
    <main style={{ minHeight: "100vh", padding: 16 }}>
      <div style={{ maxWidth: 460, margin: "0 auto" }}>
        <Link
          href="/"
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

        <div
          style={{
            background: "white",
            border: "1px solid #e5e7eb",
            borderRadius: 20,
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
                height: 220,
                objectFit: "cover",
                display: "block",
                background: "#e2e8f0",
              }}
            />
          ) : (
            <div
              style={{
                height: 220,
                background: "#e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 48,
              }}
            >
              📘
            </div>
          )}

          <div style={{ padding: 16 }}>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 900,
                margin: "0 0 10px",
                lineHeight: 1.5,
              }}
            >
              {course.title}
            </h1>

            <div style={{ color: "#64748b", marginBottom: 12 }}>
              بواسطة {course.instructor_name}
            </div>

            <div
              style={{
                color: "#475569",
                lineHeight: 1.9,
                marginBottom: 14,
                fontSize: 15,
              }}
            >
              {course.description || "بدون وصف"}
            </div>

            {course.video_url && canStart ? (
              <div style={{ marginBottom: 14 }}>
                <video
                  controls
                  style={{
                    width: "100%",
                    borderRadius: 14,
                    background: "#000",
                    display: "block",
                  }}
                  src={course.video_url}
                />
              </div>
            ) : null}

            {course.file_url && canStart ? (
              <div style={{ marginBottom: 14 }}>
                <a
                  href={course.file_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: "inline-block",
                    background: "#e2e8f0",
                    color: "#0f172a",
                    padding: "10px 14px",
                    borderRadius: 12,
                    textDecoration: "none",
                    fontSize: 14,
                    fontWeight: 700,
                  }}
                >
                  فتح ملف الدورة
                </a>
              </div>
            ) : null}

            <div
              style={{
                display: "grid",
                gap: 8,
                color: "#475569",
                marginBottom: 16,
                lineHeight: 1.8,
              }}
            >
              <span>التقييم: {course.rating ?? 0}</span>
              <span>الطلاب: {course.students_count ?? 0}</span>
              <span>المدة: {course.duration || "غير محدد"}</span>
              <span>
                السعر:{" "}
                {course.is_free
                  ? "مجاني"
                  : `${course.price ?? 0} ${course.currency || "PI"}`}
              </span>
            </div>

            {canStart ? (
              <div
                style={{
                  display: "grid",
                  gap: 10,
                }}
              >
                <button
                  style={{
                    border: "none",
                    background: "#0f172a",
                    color: "white",
                    padding: "12px 16px",
                    borderRadius: 14,
                    fontSize: 15,
                    fontWeight: 800,
                  }}
                >
                  ابدأ الآن
                </button>

                {!course.video_url && !course.file_url ? (
                  <div style={{ fontSize: 13, color: "#64748b", lineHeight: 1.8 }}>
                    تم فتح الدورة، لكن لا يوجد فيديو أو ملف مرفق بعد.
                  </div>
                ) : null}
              </div>
            ) : (
              <PiPayButton
                amount={Number(course.price ?? 0)}
                memo={`شراء دورة: ${course.title}`}
                metadata={{ courseId: course.id }}
                onPaid={() => setPaid(true)}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
