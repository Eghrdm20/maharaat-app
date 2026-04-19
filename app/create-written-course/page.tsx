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

type TextBlock = {
  id: string
  type: "text"
  text: string
}

type ImageBlock = {
  id: string
  type: "image"
  caption: string
  file: File | null
  preview: string
}

type DraftBlock = TextBlock | ImageBlock

export default function CreateWrittenCoursePage() {
  const router = useRouter()

  const [piUser, setPiUser] = useState<CachedPiUser | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [duration, setDuration] = useState("")
  const [price, setPrice] = useState("")
  const [isFree, setIsFree] = useState(false)
  const [coverImage, setCoverImage] = useState<File | null>(null)

  const [blocks, setBlocks] = useState<DraftBlock[]>([
    {
      id: crypto.randomUUID(),
      type: "text",
      text: "",
    },
  ])

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

  const addTextBlock = () => {
    setBlocks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "text",
        text: "",
      },
    ])
  }

  const addImageBlock = () => {
    setBlocks((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        type: "image",
        caption: "",
        file: null,
        preview: "",
      },
    ])
  }

  const updateTextBlock = (id: string, text: string) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id && block.type === "text"
          ? { ...block, text }
          : block
      )
    )
  }

  const updateImageCaption = (id: string, caption: string) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id && block.type === "image"
          ? { ...block, caption }
          : block
      )
    )
  }

  const updateImageFile = (id: string, file: File | null) => {
    if (!file) return

    const preview = URL.createObjectURL(file)

    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id && block.type === "image"
          ? { ...block, file, preview }
          : block
      )
    )
  }

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((block) => block.id !== id))
  }

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
      setStatus("يجب ربط حساب Pi أولًا")
      return
    }

    if (!title.trim() || !description.trim()) {
      setStatus("أدخل عنوان الدورة ووصفها")
      return
    }

    if (!isFree) {
      const numericPrice = Number(price)
      if (!numericPrice || numericPrice <= 0) {
        setStatus("أدخل سعرًا صحيحًا")
        return
      }
    }

    const nonEmptyBlocks = blocks.filter((block) => {
      if (block.type === "text") return block.text.trim().length > 0
      return !!block.file
    })

    if (nonEmptyBlocks.length === 0) {
      setStatus("أضف فقرة أو صورة واحدة على الأقل")
      return
    }

    try {
      setLoading(true)
      setStatus("جاري رفع المحتوى...")

      let imageUrl: string | null = null

      if (coverImage) {
        imageUrl = await uploadToBucket("course-images", coverImage)
      }

      const articleBlocks = []

      for (const block of nonEmptyBlocks) {
        if (block.type === "text") {
          articleBlocks.push({
            id: block.id,
            type: "text",
            text: block.text,
          })
        }

        if (block.type === "image" && block.file) {
          const uploadedUrl = await uploadToBucket("course-images", block.file)

          articleBlocks.push({
            id: block.id,
            type: "image",
            image_url: uploadedUrl,
            caption: block.caption || "",
          })
        }
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
          videoUrl: null,
          fileUrl: null,
          contentType: "article",
          articleBlocks,
        }),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(json?.error || "فشل إنشاء الدورة المكتوبة")
      }

      setStatus("تم إنشاء الدورة المكتوبة بنجاح")

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
      <div style={{ maxWidth: 700, margin: "0 auto", padding: 14 }}>
        <Link href="/profile" style={backLinkStyle}>
          ← العودة
        </Link>

        <h1 style={titleStyle}>إنشاء دورة مكتوبة</h1>
        <p style={subtitleStyle}>
          هذه الدورة تُقرأ داخل الصفحة فقط، ويمكنك إضافة فقرات وصور.
        </p>

        {!piUser ? (
          <div style={infoBoxStyle}>يجب ربط حساب Pi أولًا من صفحة الملف الشخصي.</div>
        ) : (
          <form onSubmit={handleSubmit} style={formStyle}>
            <div style={mutedTextStyle}>الناشر: {piUser.username}</div>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="عنوان الدورة"
              style={inputStyle}
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف قصير للدورة"
              rows={4}
              style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
            />

            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="مدة القراءة أو التقدير الزمني"
              style={inputStyle}
            />

            <div style={fieldBoxStyle}>
              <div style={fieldLabelStyle}>الصورة الرئيسية للدورة</div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setCoverImage(e.target.files?.[0] || null)}
              />
            </div>

            <label style={checkboxRowStyle}>
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
              />
              <span>دورة مجانية</span>
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

            <div style={sectionHeaderStyle}>
              <div style={blocksTitleStyle}>محتوى الدورة</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <button type="button" onClick={addTextBlock} style={secondaryButtonStyle}>
                  + فقرة
                </button>
                <button type="button" onClick={addImageBlock} style={secondaryButtonStyle}>
                  + صورة
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gap: 14 }}>
              {blocks.map((block, index) => (
                <div key={block.id} style={blockCardStyle}>
                  <div style={blockHeaderStyle}>
                    <strong>
                      {block.type === "text"
                        ? `فقرة ${index + 1}`
                        : `صورة ${index + 1}`}
                    </strong>

                    <button
                      type="button"
                      onClick={() => removeBlock(block.id)}
                      style={removeButtonStyle}
                    >
                      حذف
                    </button>
                  </div>

                  {block.type === "text" ? (
                    <textarea
                      value={block.text}
                      onChange={(e) => updateTextBlock(block.id, e.target.value)}
                      placeholder="اكتب محتوى الفقرة هنا..."
                      rows={6}
                      style={{ ...inputStyle, minHeight: 140, resize: "vertical" }}
                    />
                  ) : (
                    <div style={{ display: "grid", gap: 10 }}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          updateImageFile(block.id, e.target.files?.[0] || null)
                        }
                      />

                      <input
                        value={block.caption}
                        onChange={(e) =>
                          updateImageCaption(block.id, e.target.value)
                        }
                        placeholder="تعليق الصورة"
                        style={inputStyle}
                      />

                      {block.preview ? (
                        <img
                          src={block.preview}
                          alt="preview"
                          style={previewImageStyle}
                        />
                      ) : null}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                ...primaryButtonStyle,
                background: loading ? "#94a3b8" : "#0f172a",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "جاري النشر..." : "نشر الدورة المكتوبة"}
            </button>

            {status ? <div style={statusTextStyle}>{status}</div> : null}
          </form>
        )}
      </div>
    </main>
  )
}

const backLinkStyle: CSSProperties = {
  color: "#0f172a",
  textDecoration: "none",
  fontSize: 14,
  display: "inline-block",
  marginBottom: 10,
}

const titleStyle: CSSProperties = {
  fontSize: 32,
  fontWeight: 900,
  margin: "0 0 8px",
  color: "#0f172a",
}

const subtitleStyle: CSSProperties = {
  color: "#64748b",
  lineHeight: 1.8,
  margin: "0 0 16px",
}

const infoBoxStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 20,
  padding: 18,
  color: "#475569",
  lineHeight: 1.8,
}

const formStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 20,
  padding: 16,
  display: "grid",
  gap: 12,
}

const mutedTextStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 14,
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

const fieldBoxStyle: CSSProperties = {
  border: "1px solid #dbe3ea",
  borderRadius: 14,
  padding: 12,
  background: "white",
}

const fieldLabelStyle: CSSProperties = {
  fontSize: 15,
  fontWeight: 800,
  marginBottom: 8,
  color: "#0f172a",
}

const checkboxRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 15,
  color: "#0f172a",
}

const sectionHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
  marginTop: 8,
}

const blocksTitleStyle: CSSProperties = {
  fontSize: 20,
  fontWeight: 900,
  color: "#0f172a",
}

const blockCardStyle: CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: 14,
  background: "#fafafa",
}

const blockHeaderStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 10,
}

const removeButtonStyle: CSSProperties = {
  border: "1px solid #ef4444",
  background: "white",
  color: "#ef4444",
  borderRadius: 12,
  padding: "8px 12px",
  fontWeight: 700,
  cursor: "pointer",
}

const secondaryButtonStyle: CSSProperties = {
  border: "1px solid #cbd5e1",
  background: "white",
  color: "#0f172a",
  borderRadius: 12,
  padding: "10px 12px",
  fontWeight: 800,
  cursor: "pointer",
}

const primaryButtonStyle: CSSProperties = {
  border: "none",
  color: "white",
  borderRadius: 16,
  padding: "14px 18px",
  fontSize: 16,
  fontWeight: 900,
}

const statusTextStyle: CSSProperties = {
  color: "#475569",
  lineHeight: 1.8,
  fontSize: 14,
}

const previewImageStyle: CSSProperties = {
  width: "100%",
  maxHeight: 280,
  objectFit: "cover",
  borderRadius: 14,
}
