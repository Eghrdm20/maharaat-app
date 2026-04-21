"use client";

import type { CSSProperties, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { translations, type Lang, getDirection } from "@/lib/i18n";

type CachedPiUser = {
  uid: string;
  username: string;
};

export default function ProfilePage() {
  const router = useRouter();

  const [lang, setLang] = useState<Lang>("ar");
  const [piUser, setPiUser] = useState<CachedPiUser | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [courseFile, setCourseFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const t = translations[lang];
  const dir = useMemo(() => getDirection(lang), [lang]);

  useEffect(() => {
    const savedLang = (window.localStorage.getItem("app_lang") as Lang) || "ar";
    setLang(savedLang);
    document.documentElement.lang = savedLang;
    document.documentElement.dir = getDirection(savedLang);

    const cachedUser = window.localStorage.getItem("pi_user");
    if (!cachedUser) return;

    try {
      const parsed = JSON.parse(cachedUser);
      if (parsed?.uid && parsed?.username) {
        setPiUser(parsed);
      }
    } catch (error) {
      console.error("Failed to parse pi_user", error);
    }
  }, []);

  const changeLanguage = (nextLang: Lang) => {
    setLang(nextLang);
    window.localStorage.setItem("app_lang", nextLang);
    document.documentElement.lang = nextLang;
    document.documentElement.dir = getDirection(nextLang);
  };

  const uploadToBucket = async (bucket: string, file: File) => {
    const supabase = createSupabaseClient();
    const ext = file.name.split(".").pop() || "bin";
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `${piUser?.uid || "guest"}/${safeName}`;

    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!piUser) {
      setStatus(t.mustConnectPiFirst);
      return;
    }

    if (!title.trim() || !description.trim() || !duration.trim()) {
      setStatus(t.fillRequiredFields);
      return;
    }

    if (!isFree) {
      const numericPrice = Number(price);
      if (!numericPrice || numericPrice <= 0) {
        setStatus(t.invalidPrice);
        return;
      }
    }

    try {
      setLoading(true);
      setStatus(t.publishingCourse);

      let imageUrl: string | null = null;
      let videoUrl: string | null = null;
      let fileUrl: string | null = null;

      if (imageFile) {
        imageUrl = await uploadToBucket("course-images", imageFile);
      }

      if (videoFile) {
        videoUrl = await uploadToBucket("course-videos", videoFile);
      }

      if (courseFile) {
        fileUrl = await uploadToBucket("course-files", courseFile);
      }

      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.error || t.courseCreatedFailed);
      }

      setStatus(t.courseCreatedSuccess);

      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch (error: any) {
      console.error(error);
      setStatus(error?.message || t.courseCreatedFailed);
    } finally {
      setLoading(false);
    }
  };

  /* ====== STYLES ====== */
  
  const pageStyle: CSSProperties = {
    minHeight: "100vh",
    paddingBottom: 96,
    background: "var(--bg-primary)",
    fontFamily: "var(--font-tajawal), sans-serif",
  };

  const containerStyle: CSSProperties = {
    maxWidth: 460,
    margin: "0 auto",
    padding: 14,
  };

  const headerRowStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
    flexWrap: "wrap",
  };

  const backLinkStyle: CSSProperties = {
    color: "#0f172a",
    textDecoration: "none",
    fontSize: 14,
    display: "inline-block",
    marginBottom: 10,
    padding: "8px 12px",
    borderRadius: 12,
    transition: "all 0.3s ease",
  };

  const titleStyle: CSSProperties = {
    fontSize: 32,
    fontWeight: 900,
    margin: "8px 0",
    color: "#0f172a",
  };

  const subtitleStyle: CSSProperties = {
    color: "#64748b",
    lineHeight: 1.8,
    margin: 0,
  };

  const languageWrapStyle: CSSProperties = {
    display: "flex",
    gap: 8,
    flexShrink: 0,
  };

  function langButtonStyle(active: boolean): CSSProperties {
    return {
      border: "1px solid #cbd5e1",
      background: active ? "#0f172a" : "white",
      color: active ? "white" : "#0f172a",
      borderRadius: 12,
      padding: "10px 12px",
      fontSize: 13,
      fontWeight: 800,
      cursor: "pointer", // ✅ تم التصحيح
      transition: "all 0.3s ease",
    };
  }

  const infoBoxStyle: CSSProperties = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 20,
    padding: 18,
    color: "#475569",
    lineHeight: 1.8,
  };

  const formStyle: CSSProperties = {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 20,
    padding: 16,
    display: "grid",
    gap: 12,
  };

  const mutedTextStyle: CSSProperties = {
    color: "#64748b",
    fontSize: 14,
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    border: "1px solid #dbe3ea",
    borderRadius: 14,
    padding: "12px 14px",
    fontSize: 15,
    outline: "none",
    background: "white",
    transition: "all 0.3s ease",
  };

  const fieldBoxStyle: CSSProperties = {
    border: "1px solid #dbe3ea",
    borderRadius: 14,
    padding: 12,
    background: "white",
  };

  const fieldLabelStyle: CSSProperties = {
    fontSize: 15,
    fontWeight: 800,
    marginBottom: 8,
    color: "#0f172a",
  };

  const checkboxRowStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 15,
    color: "#0f172a",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: 14,
    cursor: "pointer", // ✅
  };

  const primaryButtonStyle: CSSProperties = {
    border: "none",
    color: "white",
    borderRadius: 16,
    padding: "14px 18px",
    fontSize: 16,
    fontWeight: 900,
    background: loading ? "#94a3b8" : "#0f172a",
    cursor: loading ? "not-allowed" : "pointer", // ✅
    transition: "all 0.3s ease",
  };

  const statusTextStyle: CSSProperties = {
    color: "#475569",
    lineHeight: 1.8,
    fontSize: 14,
  };

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
    zIndex: 100,
  };

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
      transition: "all 0.3s ease",
    };
  }

  /* ====== NEW: Create Post Button Style ====== */
  const createPostButtonStyle: CSSProperties = {
    width: "100%",
    padding: "16px",
    marginTop: 24,
    marginBottom: 28,
    background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    color: "white",
    border: "none",
    borderRadius: 16,
    fontWeight: 800,
    fontSize: 16,
    cursor: "pointer", // ✅
    boxShadow: "0 8px 24px rgba(17, 153, 142, 0.35)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    textDecoration: "none",
  };

  return (
    <main style={{ ...pageStyle, direction: dir }}>
      <div style={containerStyle}>
        <div style={headerRowStyle}>
          <div>
            <Link href="/" style={backLinkStyle}>
              ← {t.back}
            </Link>

            <h1 style={titleStyle}>ربط حساب Pi</h1>
            <p style={subtitleStyle}>{t.profileSubtitle}</p>
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
        ) : (
          <>
            {/* Pi Info Card */}
            <div style={{
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)",
              border: "2px solid rgba(102, 126, 234, 0.2)",
              borderRadius: 24,
              padding: "20px 24px",
              marginBottom: 20,
            }}>
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: "#11998e" }}>
                  اسم المستخدم: {piUser.username}
                </span>
              </div>
              <div style={{ textAlign: "center", fontFamily: "monospace", fontSize: 13, color: "#64748b" }}>
                UID: {piUser.uid}
              </div>
              
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <button onClick={() => router.push("/admin/create-post")} style={createPostButtonStyle}>
                  ✍️ نشر مقال جديد
                </button>
              </div>
            </div>

            {/* ====== FORM ====== */}
            <form onSubmit={handleSubmit} style={formStyle}>
              <div style={mutedTextStyle}>
                👤 {t.username}:{" "}
                <strong style={{ color: "#11998e" }}>{piUser.username}</strong>
              </div>

              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.courseTitle}
                style={inputStyle}
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t.courseDescription}
                rows={5}
                style={{ ...inputStyle, resize: "vertical", minHeight: 120 }}
              />

              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder={t.duration}
                style={inputStyle}
              />

              <div style={fieldBoxStyle}>
                <div style={fieldLabelStyle}>{t.imageUrl}</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                />
              </div>

              <div style={fieldBoxStyle}>
                <div style={fieldLabelStyle}>{t.videoUrl}</div>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                />
              </div>

              <div style={fieldBoxStyle}>
                <div style={fieldLabelStyle}>{t.fileUrl}</div>
                <input
                  type="file"
                  accept=".pdf,.zip,.doc,.docx,.ppt,.pptx"
                  onChange={(e) => setCourseFile(e.target.files?.[0] || null)}
                />
              </div>

              <label style={checkboxRowStyle}>
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => setIsFree(e.target.checked)}
                  style={{ width: 20, height: 20, accentColor: "#667eea" }}
                />
                <span>{t.isFreeCourse}</span>
              </label>

              {!isFree ? (
                <input
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={t.coursePrice}
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
                  ...primaryButtonStyle,
                  background: loading 
                    ? "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)" 
                    : "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
                }}
              >
                {loading ? t.publishingCourse : t.publishCourse}
              </button>

              {status ? <div style={statusTextStyle}>{status}</div> : null}
            </form>

            {/* ====== Quick Links Grid ====== */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 12,
              marginTop: 20,
            }}>
              <Link href="/my-courses" style={{
                ...fieldBoxStyle,
                textDecoration: "none",
                color: "#0f172a",
                display: "block",
                padding: "16px",
                textAlign: "center",
                fontWeight: 700,
                transition: "all 0.3s ease",
              }} onMouseEnter={(e) => e.currentTarget.style.borderColor = "#667eea"} onMouseLeave={(e) => e.currentTarget.style.borderColor = "#dbe3ea"}>
                📚 {t.myCoursesTitle}
              </Link>

              <Link href="/explore-courses" style={{
                ...fieldBoxStyle,
                textDecoration: "none",
                color: "#0f172a",
                display: "block",
                padding: "16px",
                textAlign: "center",
                fontWeight: 700,
                transition: "all 0.3s ease",
              }} onMouseEnter={(e) => e.currentTarget.style.borderColor = "#667eea"} onMouseLeave={(e) => e.currentTarget.style.borderColor = "#dbe3ea"}>
                🔍 {t.exploreCourses}
              </Link>

              <Link href="/create-written-course" style={{
                ...fieldBoxStyle,
                textDecoration: "none",
                color: "#0f172a",
                display: "block",
                padding: "16px",
                textAlign: "center",
                fontWeight: 700,
                transition: "all 0.3s ease",
              }} onMouseEnter={(e) => e.currentTarget.style.borderColor = "#667eea"} onMouseLeave={(e) => e.currentTarget.style.borderColor = "#dbe3ea">
                📝 {t.createWrittenCourse}
              </Link>

              <Link href="/privacy-policy" style={{
                ...fieldBoxStyle,
                textDecoration: "none",
                color: "#64748b",
                display: "block",
                padding: "16px",
                textAlign: "center",
                fontWeight: 600,
                fontSize: 14,
                transition: "all 0.3s ease",
              }}>
                🔒 {t.privacyPolicy}
              </Link>

              <Link href="/terms" style={{
                ...fieldBoxStyle,
                textDecoration: "none",
                color: "#64748b",
                display: "block",
                padding: "16px",
                textAlign: "center",
                fontWeight: 600,
                fontSize: 14,
                transition: "all 0.3s ease",
              }}>
                📜 {t.termsOfService}
              </Link>
            </div>
          </>
        )}
      </div>

      {/* Bottom Nav */}
      <nav style={navStyle}>
        <Link href="/profile" style={navItemStyle(true)}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>👤</div>
          {t.profile}
        </Link>

        <Link href="/create-course" style={navItemStyle(false)}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>➕</div>
          {t.createCourse}
        </Link>

        <Link href="/" style={navItemStyle(false)}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>🏠</div>
          {t.home}
        </Link>
      </nav>
    </main>
  );
}
