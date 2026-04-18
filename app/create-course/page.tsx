"use client"

import type { CSSProperties, FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { createSupabaseClient } from "@/lib/supabase/client"

type CachedPiUser = {
  uid: string
  username: string
}

export default function CreateCoursePage() {
  const router = useRouter()

  const [piUser, setPiUser] = useState<CachedPiUser | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("")
  const [price, setPrice] = useState("")
  const [isFree, setIsFree] = useState(false)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [courseFile, setCourseFile] = useState<File | null>(null)

  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("")

  useEffect(() => {
    const cached = window.localStorage.getItem("pi_user")
    if (!cached) return

    try {
      const parsed = JSON.parse(cached)
      if (parsed?.uid && parsed?.username) {
        setPiUser(parsed)
      }
    } catch (error) {
      console.error(error)
    }
  }, [])

  const uploadToBucket = async (bucket: string, file: File) => {
    const supabase = createSupabaseClient()

    const ext = file.name.split(".").pop() || "bin"
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const path = `${piUser?.uid || "guest"}/${safeName}`

    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    })

    if (error) {
      throw new Error(error.message)
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!piUser) {
      setStatus("يجب ربط حساب Pi أولًا من صفحة الملف الشخصي")
      return
    }

    try {
      setLoading(true)
      setStatus("جاري رفع الملفات...")

      let imageUrl: string | null = null
      let videoUrl: string | null = null
      let fileUrl: string | null = null

      if (imageFile) {
        imageUrl = await uploadToBucket("course-images", imageFile)
      }

      if (videoFile) {
        videoUrl = await uploadToBucket("course-videos", videoFile)
      }

      if (courseFile) {
        fileUrl = await uploadToBucket("course-files", courseFile)
      }

      setStatus("جاري نشر الدورة...")

      const res = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: piUser.uid,
          username: piUser.username,
          title,
          description,
          duration,
          price,
          isFree,
          imageUrl,
          videoUrl,
          fileUrl,
        }),
      })

      const json = await res.json()

      if (!res.ok) {
        throw new Error(json?.error || "فشل إنشاء الدورة")
      }

      setStatus("تم إنشاء الدورة بنجاح")

      setTimeout(() => {
        router.push("/")
      }, 1200)
    } catch (error: any) {
      console.error(error)
      setStatus(error?.message || "حدث خطأ أثناء إنشاء الدورة")
    } finally {
      setLoading(false)
    }
  }

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

        <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 12px" }}>
          إنشاء دورة جديدة
        </h1>

        {!piUser ? (
          <div style={boxStyle}>
            يجب ربط حساب Pi أولًا من صفحة الملف الشخصي قبل إنشاء دورة.
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={boxStyle}>
            <div style={{ color: "#64748b", fontSize: 14 }}>
              الناشر: {piUser.username}
            </div>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان الدورة"
              style={inputStyle}
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف الدورة"
              rows={5}
              style={{ ...inputStyle, resize: "vertical" }}
            />

            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="مدة الدورة مثال: 6 ساعات"
              style={inputStyle}
            />

            <div style={fieldStyle}>
              <div style={labelStyle}>صورة الدورة</div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
            </div>

            <div style={fieldStyle}>
              <div style={labelStyle}>فيديو الدورة</div>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              />
            </div>

            <div style={fieldStyle}>
              <div style={labelStyle}>ملف الدورة</div>
              <input
                type="file"
                accept=".pdf,.zip,.doc,.docx,.ppt,.pptx"
                onChange={(e) => setCourseFile(e.target.files?.[0] || null)}
              />
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 15,
              }}
            >
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
              />
              دورة مجانية
            </label>

            {!isFree ? (
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="سعر الدورة بعملة Pi"
                type="number"
                step="0.01"
                min="0"
                style={inputStyle}
              />
            ) : null}

            <button
              type="submit"
              disabled={loading}
              style={{
                border: "none",
                background: "#0f172a",
                color: "white",
                borderRadius: 16,
                padding: "14px 18px",
                fontSize: 16,
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {loading ? "جاري التنفيذ..." : "نشر الدورة"}
            </button>

            {status ? (
              <div style={{ fontSize: 14, color: "#475569", lineHeight: 1.8 }}>
                {status}
              </div>
            ) : null}
          </form>
        )}
      </div>
    </main>
  )
}

const boxStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 20,
  padding: 16,
  display: "grid",
  gap: 12,
}

const inputStyle: CSSProperties = {
  width: "100%",
  border: "1px solid #dbe3ea",
  borderRadius: 14,
  padding: "12px 14px",
  fontSize: 15,
  outline: "none",
  background: "white",
}

const fieldStyle: CSSProperties = {
  border: "1px solid #dbe3ea",
  borderRadius: 14,
  padding: 12,
  background: "white",
}

const labelStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 800,
  marginBottom: 8,
    }
