"use client"

import type { CSSProperties } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { createSupabaseClient } from "@/lib/supabase/client"
import {
  translations,
  type Lang,
  getDirection,
  detectBrowserLanguage,
  applyLanguage,
} from "@/lib/i18n"

type ArticleBlock = {
  id: string
  type: "text" | "image"
  text?: string
  image_url?: string
  caption?: string
}

type Course = {
  id: number
  title: string
  description: string | null
  instructor_name: string
  price: number | string | null
  currency: string | null
  is_free: boolean
  image_url: string | null
  video_url: string | null
  file_url: string | null
  duration: string | null
  students_count: number | null
  rating: number | null
  is_new: boolean | null
  owner_pi_uid: string | null
  created_at: string
  is_deleted?: boolean
  content_type: string | null
  article_blocks: ArticleBlock[] | null
}

type PiUser = {
  uid: string
  username: string
}

export default function CourseDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id
  const courseId = useMemo(() => Number(rawId), [rawId])

  const [lang, setLang] = useState<Lang>("ar")
  const [course, setCourse] = useState<Course | null>(null)
  const [piUser, setPiUser] = useState<PiUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [buying, setBuying] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [status, setStatus] = useState("")
  const [piReady, setPiReady] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const t = translations[lang]
  const dir = useMemo(() => getDirection(lang), [lang])

  useEffect(() => {
    const initialLang = detectBrowserLanguage()
    setLang(initialLang)
    applyLanguage(initialLang)

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
          setStatus(t.piMissing)
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
        setStatus(error?.message || t.piInitFailed)
      }
    }, 500)

    return () => window.clearInterval(timer)
  }, [t.piMissing, t.piInitFailed])

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true)
        setStatus("")

        const supabase = createSupabaseClient()

        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .eq("is_deleted", false)
          .single()

        if (error) {
          throw new Error(error.message)
        }

        const loadedCourse = data as Course
        setCourse(loadedCourse)

        if (loadedCourse.is_free) {
          setHasAccess(true)
        }
      } catch (error: any) {
        console.error(error)
        setStatus(error?.message || t.loadingCourse)
      } finally {
        setLoading(false)
      }
    }

    if (!Number.isNaN(courseId) && courseId > 0) {
      loadCourse()
    }
  }, [courseId, t.loadingCourse])

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setCheckingAccess(true)

        if (!courseId || Number.isNaN(courseId)) {
          setHasAccess(false)
          return
        }

        if (course?.is_free) {
          setHasAccess(true)
          return
        }

        if (!piUser?.uid) {
          const localOwned = window.localStorage.getItem(`owned_course_${courseId}`)
          setHasAccess(localOwned === "true")
          return
        }

        const supabase = createSupabaseClient()

        const { data, error } = await supabase
          .from("purchases")
          .select("payment_id,status")
          .eq("course_id", courseId)
          .eq("uid", piUser.uid)
          .eq("status", "completed")
          .limit(1)

        if (error) {
          console.error("Purchase check error:", error)
          const localOwned = window.localStorage.getItem(`owned_course_${courseId}`)
          setHasAccess(localOwned === "true")
          return
        }

        const bought = Array.isArray(data) && data.length > 0
        setHasAccess(bought)

        if (bought) {
          window.localStorage.setItem(`owned_course_${courseId}`, "true")
        }
      } finally {
        setCheckingAccess(false)
      }
    }

    checkAccess()
  }, [courseId, piUser, course?.is_free])

  const changeLanguage = (nextLang: Lang) => {
    setLang(nextLang)
    window.localStorage.setItem("app_lang", nextLang)
    applyLanguage(nextLang)
  }

  const refreshAccessFromSupabase = async () => {
    if (!piUser?.uid) return false

    const supabase = createSupabaseClient()

    const { data, error } = await supabase
      .from("purchases")
      .select("payment_id,status")
      .eq("course_id", courseId)
      .eq("uid", piUser.uid)
      .eq("status", "completed")
      .limit(1)

    if (error) {
      throw new Error(error.message)
    }

    const bought = Array.isArray(data) && data.length > 0
    setHasAccess(bought)

    if (bought) {
      window.localStorage.setItem(`owned_course_${courseId}`, "true")
    }

    return bought
  }

  const handleBuyCourse = async () => {
    try {
      if (!course) return

      if (course.is_free) {
        setHasAccess(true)
        return
      }

      const Pi = window.Pi

      if (!Pi?.createPayment || !piReady) {
        setStatus(t.paymentUnavailable)
        return
      }

      if (!piUser) {
        setStatus(t.mustConnectPiFirst)
        return
      }

      const amount = Number(course.price || 0)

      if (!amount || amount <= 0) {
        setStatus(t.invalidPrice)
        return
      }

      setBuying(true)
      setStatus(t.paymentStarted)

      Pi.createPayment(
        {
          amount,
          memo: `${t.buyNow}: ${course.title}`,
          metadata: {
            courseId: course.id,
            courseTitle: course.title,
          },
        },
        {
          onReadyForServerApproval: async (paymentId: string) => {
            setStatus(t.paymentApproving)

            const res = await fetch("/api/payments/approve", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ paymentId }),
            })

            const json = await res.json().catch(() => ({}))

            if (!res.ok) {
              throw new Error(json?.error || t.paymentFailed)
            }
          },

          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            try {
              setStatus(t.paymentCompleting)

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
                throw new Error(json?.error || t.paymentFailed)
              }

              await refreshAccessFromSupabase()
              setStatus(t.paymentSuccess)
            } catch (error: any) {
              console.error("complete error:", error)
              setStatus(error?.message || t.paymentFailed)
            } finally {
              setBuying(false)
            }
          },

          onCancel: () => {
            setBuying(false)
            setStatus(t.paymentCancelled)
          },

          onError: (error: any) => {
            console.error("Pi payment error:", error)
            setBuying(false)
            setStatus(error?.message || t.paymentFailed)
          },
        }
      )
    } catch (error: any) {
      console.error(error)
      setBuying(false)
      setStatus(error?.message || t.paymentFailed)
    }
  }

  const handleDeleteCourse = async () => {
    try {
      if (!course || !piUser?.uid) return

      const confirmed = window.confirm(
        lang === "ar"
          ? "هل أنت متأكد أنك تريد حذف هذه الدورة؟"
          : "Are you sure you want to delete this course?"
      )

      if (!confirmed) return

      setDeleting(true)
      setStatus(lang === "ar" ? "جاري حذف الدورة..." : "Deleting course...")

      const res = await fetch(`/api/courses/${course.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: piUser.uid,
        }),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(
          json?.error || (lang === "ar" ? "فشل حذف الدورة" : "Failed to delete course")
        )
      }

      setStatus(
        lang === "ar" ? "تم حذف الدورة بنجاح" : "Course deleted successfully"
      )

      setTimeout(() => {
        router.push("/my-courses")
      }, 1000)
    } catch (error: any) {
      console.error(error)
      setStatus(
        error?.message || (lang === "ar" ? "فشل حذف الدورة" : "Failed to delete course")
      )
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <main style={{ ...pageStyle, direction: dir }}>
        <div style={containerStyle}>{t.loadingCourse}</div>
      </main>
    )
  }

  if (!course) {
    return (
      <main style={{ ...pageStyle, direction: dir }}>
        <div style={containerStyle}>
          <Link href="/" style={backLinkStyle}>
            {t.back}
          </Link>
          <div style={cardStyle}>{t.courseNotFound}</div>
        </div>
      </main>
    )
  }

  const imageUrl = course.image_url || "/placeholder.svg"
  const priceText = course.is_free ? t.free : `${course.price} ${course.currency || "PI"}`
  const isOwner = !!piUser?.uid && piUser.uid === course.owner_pi_uid

  return (
    <main style={{ ...pageStyle, direction: dir }}>
      <div style={containerStyle}>
        <div style={headerRowStyle}>
          <div>
            <Link href="/" style={backLinkStyle}>
              {t.back}
            </Link>
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

        <section style={{ ...cardStyle, overflow: "hidden", padding: 0 }}>
          <div style={imageWrapStyle}>
            <img src={imageUrl} alt={course.title} style={imageStyle} />
          </div>

          <div style={contentStyle}>
            <div style={titleRowStyle}>
              <h1 style={titleStyle}>{course.title}</h1>
              {course.is_new ? <span style={badgeStyle}>{t.new}</span> : null}
            </div>

            <p style={metaTextStyle}>
              {t.instructorBy} {course.instructor_name}
            </p>

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
              <div>
                {t.price}: {priceText}
              </div>
            </div>

            {checkingAccess ? (
              <div style={contentBoxStyle}>{t.checkingAccess}</div>
            ) : !hasAccess ? (
              <div style={purchaseAreaStyle}>
                {!course.is_free && !piUser ? (
                  <div style={warningBoxStyle}>{t.mustConnectPiFirst}</div>
                ) : null}

                <button
                  onClick={handleBuyCourse}
                  disabled={buying || (!course.is_free && !piUser) || !piReady}
                  style={{
                    ...buyButtonStyle,
                    background:
                      buying || (!course.is_free && !piUser) || !piReady
                        ? "#94a3b8"
                        : "#0f172a",
                    cursor:
                      buying || (!course.is_free && !piUser) || !piReady
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {course.is_free
                    ? t.startNow
                    : buying
                    ? t.buyingNow
                    : `${t.buyNow} - ${priceText}`}
                </button>

                {isOwner ? (
                  <button
                    onClick={handleDeleteCourse}
                    disabled={deleting}
                    style={{
                      ...deleteButtonStyle,
                      opacity: deleting ? 0.7 : 1,
                      cursor: deleting ? "not-allowed" : "pointer",
                    }}
                  >
                    {deleting
                      ? lang === "ar"
                        ? "جاري الحذف..."
                        : "Deleting..."
                      : lang === "ar"
                      ? "حذف الدورة"
                      : "Delete Course"}
                  </button>
                ) : null}

                {status ? <div style={statusTextStyle}>{status}</div> : null}
              </div>
            ) : (
              <div style={accessAreaStyle}>
                <div style={successBoxStyle}>{t.courseContentAccess}</div>

                {course.content_type === "article" &&
                Array.isArray(course.article_blocks) &&
                course.article_blocks.length > 0 ? (
                  <div style={contentBoxStyle}>
                    <div style={sectionTitleStyle}>
                      {lang === "ar" ? "محتوى الدورة المكتوبة" : "Written Course Content"}
                    </div>

                    <div style={{ display: "grid", gap: 18 }}>
                      {course.article_blocks.map((block, index) => {
                        if (block.type === "text") {
                          return (
                            <div
                              key={block.id || index}
                              style={{
                                lineHeight: 2,
                                color: "#334155",
                                whiteSpace: "pre-wrap",
                                fontSize: 16,
                              }}
                            >
                              {block.text}
                            </div>
                          )
                        }

                        if (block.type === "image" && block.image_url) {
                          return (
                            <figure
                              key={block.id || index}
                              style={{ margin: 0, display: "grid", gap: 8 }}
                            >
                              <img
                                src={block.image_url}
                                alt={block.caption || `image-${index}`}
                                style={{
                                  width: "100%",
                                  borderRadius: 16,
                                  objectFit: "cover",
                                }}
                              />
                              {block.caption ? (
                                <figcaption
                                  style={{
                                    color: "#64748b",
                                    fontSize: 14,
                                    textAlign: "center",
                                  }}
                                >
                                  {block.caption}
                                </figcaption>
                              ) : null}
                            </figure>
                          )
                        }

                        return null
                      })}
                    </div>
                  </div>
                ) : null}

                {course.video_url ? (
                  <div style={contentBoxStyle}>
                    <div style={sectionTitleStyle}>{t.courseVideo}</div>
                    <video controls src={course.video_url} style={videoStyle} />
                  </div>
                ) : null}

                {course.file_url ? (
                  <div style={contentBoxStyle}>
                    <div style={sectionTitleStyle}>{t.courseFile}</div>
                    <a
                      href={course.file_url}
                      target="_blank"
                      rel="noreferrer"
                      style={downloadLinkStyle}
                    >
                      {t.openOrDownloadFile}
                    </a>
                  </div>
                ) : null}

                {course.content_type !== "article" &&
                !course.video_url &&
                !course.file_url ? (
                  <div style={contentBoxStyle}>{t.noUploadedContent}</div>
                ) : null}

                {isOwner ? (
                  <button
                    onClick={handleDeleteCourse}
                    disabled={deleting}
                    style={{
                      ...deleteButtonStyle,
                      opacity: deleting ? 0.7 : 1,
                      cursor: deleting ? "not-allowed" : "pointer",
                    }}
                  >
                    {deleting
                      ? lang === "ar"
                        ? "جاري الحذف..."
                        : "Deleting..."
                      : lang === "ar"
                      ? "حذف الدورة"
                      : "Delete Course"}
                  </button>
                ) : null}

                {status ? <div style={statusTextStyle}>{status}</div> : null}
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

const headerRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  marginBottom: 12,
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
  borderRadius: 24,
  padding: 16,
}

const backLinkStyle: CSSProperties = {
  display: "inline-block",
  color: "#0f172a",
  textDecoration: "none",
  fontSize: 14,
}

const imageWrapStyle: CSSProperties = {
  width: "100%",
  height: 220,
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

const contentStyle: CSSProperties = {
  padding: 18,
}

const titleRowStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start",
}

const titleStyle: CSSProperties = {
  fontSize: 28,
  fontWeight: 900,
  margin: 0,
  color: "#0f172a",
}

const badgeStyle: CSSProperties = {
  background: "#22c55e",
  color: "white",
  borderRadius: 999,
  padding: "8px 14px",
  fontWeight: 800,
  whiteSpace: "nowrap",
  height: "fit-content",
}

const metaTextStyle: CSSProperties = {
  color: "#64748b",
  marginTop: 10,
  marginBottom: 10,
}

const descriptionStyle: CSSProperties = {
  color: "#475569",
  lineHeight: 1.9,
  marginBottom: 18,
}

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 10,
  marginBottom: 18,
  color: "#334155",
}

const purchaseAreaStyle: CSSProperties = {
  borderTop: "1px solid #e5e7eb",
  paddingTop: 16,
  display: "grid",
  gap: 12,
}

const accessAreaStyle: CSSProperties = {
  borderTop: "1px solid #e5e7eb",
  paddingTop: 16,
  display: "grid",
  gap: 16,
}

const contentBoxStyle: CSSProperties = {
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 14,
}

const warningBoxStyle: CSSProperties = {
  background: "#fff7ed",
  border: "1px solid #fdba74",
  color: "#9a3412",
  borderRadius: 14,
  padding: 12,
  lineHeight: 1.8,
}

const successBoxStyle: CSSProperties = {
  background: "#ecfdf5",
  border: "1px solid #a7f3d0",
  color: "#065f46",
  borderRadius: 14,
  padding: 12,
  fontWeight: 700,
}

const buyButtonStyle: CSSProperties = {
  border: "none",
  color: "white",
  borderRadius: 18,
  padding: "16px 20px",
  fontSize: 18,
  fontWeight: 900,
}

const deleteButtonStyle: CSSProperties = {
  border: "1px solid #ef4444",
  background: "white",
  color: "#ef4444",
  borderRadius: 18,
  padding: "14px 18px",
  fontSize: 16,
  fontWeight: 900,
}

const sectionTitleStyle: CSSProperties = {
  fontWeight: 900,
  fontSize: 18,
  marginBottom: 10,
  color: "#0f172a",
}

const videoStyle: CSSProperties = {
  width: "100%",
  borderRadius: 14,
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

const statusTextStyle: CSSProperties = {
  color: "#64748b",
  lineHeight: 1.8,
}
