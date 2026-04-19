"use client"

import type { CSSProperties } from "react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { createSupabaseClient } from "@/lib/supabase/client"

type Course = {
  id: number
  title: string
  description: string | null
  instructor_name: string
  price: number | string | null
  currency: string
  is_free: boolean
  image_url: string | null
  video_url: string | null
  file_url: string | null
  duration: string | null
  students_count: number
  rating: number
  is_new: boolean
  owner_pi_uid: string | null
  created_at: string
}

type PiUser = {
  uid: string
  username: string
}

export default function CourseDetailsPage({
  params,
}: {
  params: { id: string }
}) {
  const courseId = useMemo(() => Number(params.id), [params.id])

  const [course, setCourse] = useState<Course | null>(null)
  const [piUser, setPiUser] = useState<PiUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [buying, setBuying] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [status, setStatus] = useState("")
  const [piReady, setPiReady] = useState(false)

  useEffect(() => {
    const cachedUser = window.localStorage.getItem("pi_user")
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser)
        if (parsed?.uid && parsed?.username) {
          setPiUser(parsed)
        }
      } catch (error) {
        console.error("Failed to parse pi_user", error)
      }
    }
  }, [])

  useEffect(() => {
    let attempts = 0

    const timer = window.setInterval(() => {
      attempts += 1
      const Pi = window.Pi

      if (!Pi?.init) {
        if (attempts >= 15) {
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
      } catch (error: any) {
        console.error("Pi init error:", error)
        setStatus(error?.message || "تعذر تهيئة Pi SDK")
      }
    }, 500)

    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const ownedFlag = window.localStorage.getItem(`owned_course_${courseId}`)
    if (ownedFlag === "true") {
      setHasAccess(true)
    }
  }, [courseId])

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true)
        const supabase = createSupabaseClient()

        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .single()

        if (error) {
          throw new Error(error.message)
        }

        setCourse(data as Course)

        if ((data as Course)?.is_free) {
          setHasAccess(true)
        }
      } catch (error: any) {
        console.error(error)
        setStatus(error?.message || "تعذر تحميل الدورة")
      } finally {
        setLoading(false)
      }
    }

    if (!Number.isNaN(courseId)) {
      loadCourse()
    }
  }, [courseId])

  const handleBuyCourse = async () => {
    try {
      if (!course) return

      if (course.is_free) {
        setHasAccess(true)
        return
      }

      const Pi = window.Pi

      if (!Pi?.createPayment || !piReady) {
        setStatus("Pi SDK غير جاهز بعد")
        return
      }

      if (!piUser) {
        setStatus("يجب ربط حساب Pi أولًا من صفحة الملف الشخصي")
        return
      }

      const amount = Number(course.price || 0)

      if (!amount || amount <= 0) {
        setStatus("سعر الدورة غير صالح")
        return
      }

      setBuying(true)
      setStatus("جاري بدء الدفع...")

      Pi.createPayment(
        {
          amount,
          memo: `شراء دورة: ${course.title}`,
          metadata: {
            courseId: course.id,
            courseTitle: course.title,
          },
        },
        {
          onReadyForServerApproval: async (paymentId: string) => {
            setStatus("جاري اعتماد الدفع...")

            const res = await fetch("/api/payments/approve", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ paymentId }),
            })

            const json = await res.json().catch(() => ({}))

            if (!res.ok) {
              throw new Error(json?.error || "فشل اعتماد الدفع")
            }
          },

          onReadyForServerCompletion: async (
            paymentId: string,
            txid: string
          ) => {
            setStatus("جاري إكمال الدفع...")

            const res = await fetch("/api/payments/complete", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                paymentId,
                txid,
                courseId: course.id,
                uid: piUser.uid,
                username: piUser.username,
              }),
            })

            const json = await res.json().catch(() => ({}))

            if (!res.ok) {
              throw new Error(json?.error || "فشل إكمال الدفع")
            }

            window.localStorage.setItem(`owned_course_${course.id}`, "true")
            setHasAccess(true)
            setStatus("تم شراء الدورة بنجاح")
            setBuying(false)
          },

          onCancel: () => {
            setBuying(false)
            setStatus("تم إلغاء الدفع")
          },

          onError: (error: any) => {
            console.error("Pi payment error:", error)
            setBuying(false)
            setStatus(error?.message || "حدث خطأ أثناء الدفع")
          },
        }
      )
    } catch (error: any) {
      console.error(error)
      setBuying(false)
      setStatus(error?.message || "فشل بدء الدفع")
    }
  }

  if (loading) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>جاري تحميل الدورة...</div>
      </main>
    )
  }

  if (!course) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <Link href="/" style={backLinkStyle}>
            ← العودة
          </Link>
          <div style={cardStyle}>لم يتم العثور على الدورة</div>
        </div>
      </main>
    )
  }

  const imageUrl = course.image_url || "/placeholder.svg"
  const priceText = course.is_free ? "مجاني" : `${course.price} ${course.currency}`

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <Link href="/" style={backLinkStyle}>
          ← العودة
        </Link>

        <section style={{ ...cardStyle, overflow: "hidden", padding: 0 }}>
          <div
            style={{
              width: "100%",
              height: 220,
              background: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            <img
              src={imageUrl}
              alt={course.title}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <div style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <h1 style={{ fontSize: 28, fontWeight: 900, margin: 0 }}>
                {course.title}
              </h1>

              {course.is_new ? (
                <span
                  style={{
                    background: "#22c55e",
                    color: "white",
                    borderRadius: 999,
                    padding: "8px 14px",
                    fontWeight: 800,
                    height: "fit-content",
                    whiteSpace: "nowrap",
                  }}
                >
                  جديد
                </span>
              ) : null}
            </div>

            <p style={{ color: "#64748b", marginTop: 10, marginBottom: 10 }}>
              بواسطة {course.instructor_name}
            </p>

            <p style={{ color: "#475569", lineHeight: 1.9, marginBottom: 18 }}>
              {course.description || "لا يوجد وصف"}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                gap: 10,
                marginBottom: 18,
                color: "#334155",
              }}
            >
              <div>التقييم: {course.rating}</div>
              <div>الطلاب: {course.students_count}</div>
              <div>المدة: {course.duration || "غير محددة"}</div>
              <div>السعر: {priceText}</div>
            </div>

            {!hasAccess ? (
              <div
                style={{
                  borderTop: "1px solid #e5e7eb",
                  paddingTop: 16,
                  display: "grid",
                  gap: 12,
                }}
              >
                {!course.is_free && !piUser ? (
                  <div
                    style={{
                      background: "#fff7ed",
                      border: "1px solid #fdba74",
                      color: "#9a3412",
                      borderRadius: 14,
                      padding: 12,
                      lineHeight: 1.8,
                    }}
                  >
                    يجب ربط حساب Pi أولًا من صفحة الملف الشخصي قبل شراء الدورة.
                  </div>
                ) : null}

                <button
                  onClick={handleBuyCourse}
                  disabled={buying || (!course.is_free && !piUser) || !piReady}
                  style={{
                    border: "none",
                    background:
                      buying || (!course.is_free && !piUser) || !piReady
                        ? "#94a3b8"
                        : "#0f172a",
                    color: "white",
                    borderRadius: 18,
                    padding: "16px 20px",
                    fontSize: 18,
                    fontWeight: 900,
                    cursor:
                      buying || (!course.is_free && !piUser) || !piReady
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {course.is_free
                    ? "ابدأ الآن"
                    : buying
                    ? "جاري الدفع..."
                    : `اشترِ الآن - ${priceText}`}
                </button>

                {status ? (
                  <div style={{ color: "#64748b", lineHeight: 1.8 }}>{status}</div>
                ) : null}
              </div>
            ) : (
              <div
                style={{
                  borderTop: "1px solid #e5e7eb",
                  paddingTop: 16,
                  display: "grid",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    background: "#ecfdf5",
                    border: "1px solid #a7f3d0",
                    color: "#065f46",
                    borderRadius: 14,
                    padding: 12,
                    fontWeight: 700,
                  }}
                >
                  لديك صلاحية الوصول إلى محتوى الدورة
                </div>

                {course.video_url ? (
                  <div style={contentBoxStyle}>
                    <div style={sectionTitleStyle}>فيديو الدورة</div>
                    <video
                      controls
                      src={course.video_url}
                      style={{ width: "100%", borderRadius: 14 }}
                    />
                  </div>
                ) : null}

                {course.file_url ? (
                  <div style={contentBoxStyle}>
                    <div style={sectionTitleStyle}>ملف الدورة</div>
                    <a
                      href={course.file_url}
                      target="_blank"
                      rel="noreferrer"
                      style={downloadLinkStyle}
                    >
                      فتح / تحميل الملف
                    </a>
                  </div>
                ) : null}

                {!course.video_url && !course.file_url ? (
                  <div style={contentBoxStyle}>
                    لا يوجد محتوى مرفوع بعد لهذه الدورة.
                  </div>
                ) : null}

                {status ? (
                  <div style={{ color: "#64748b", lineHeight: 1.8 }}>{status}</div>
                ) : null}
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  )
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  paddingBottom: 40,
}

const containerStyle: CSSProperties = {
  maxWidth: 460,
  margin: "0 auto",
  padding: 14,
}

const cardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 24,
  padding: 16,
}

const backLinkStyle: CSSProperties = {
  display: "inline-block",
  marginBottom: 12,
  color: "#0f172a",
  textDecoration: "none",
  fontSize: 14,
}

const contentBoxStyle: CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 14,
}

const sectionTitleStyle: CSSProperties = {
  fontWeight: 900,
  fontSize: 18,
  marginBottom: 10,
  color: "#0f172a",
}

const downloadLinkStyle: CSSProperties = {
  display: "inline-block",
  background: "#0f172a",
  color: "white",
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: 14,
  fontWeight: 800,
}
