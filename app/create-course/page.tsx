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

export default function CreateCoursePage() {
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

    if (error) {
      throw new Error(error.message);
    }

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

  // ====== 🎨 الأنماط المحسنة باستخدام CSS Variables ======
  
  const pageStyle: CSSProperties = {
    minHeight: "100vh",
    paddingBottom: 96,
    background: "var(--bg-primary)",
    fontFamily: "var(--font-tajawal), sans-serif",
  };

  const containerStyle: CSSProperties = {
    maxWidth: 600,
    margin: "0 auto",
    padding: "24px 20px",
    animation: "fadeInUp 0.6s ease-out",
  };

  const headerRowStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 28,
  };

  const backLinkStyle: CSSProperties = {
    color: "var(--text-secondary)",
    textDecoration: "none",
    fontSize: 15,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    padding: "8px 12px",
    borderRadius: "12px",
    transition: "all 0.3s ease",
    background: "transparent",
    fontWeight: 600,
  };

  const titleStyle: CSSProperties = {
    fontSize: 36,
    fontWeight: 800,
    margin: "0 0 10px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    lineHeight: 1.3,
  };

  const subtitleStyle: CSSProperties = {
    color: "var(--text-secondary)",
    lineHeight: 1.8,
    margin: 0,
    fontSize: 16,
  };

  const languageWrapStyle: CSSProperties = {
    display: "flex",
    gap: 10,
    flexShrink: 0,
  };

  function langButtonStyle(active: boolean): CSSProperties {
    return {
      border: active ? "2px solid transparent" : "2px solid var(--border-color)",
      background: active 
        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
        : "var(--bg-card)",
      color: active ? "white" : "var(--text-primary)",
      borderRadius: "14px",
      padding: "12px 16px",
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: active ? "0 8px 24px rgba(102, 126, 234, 0.35)" : "var(--shadow-sm)",
      transform: active ? "translateY(-2px)" : "translateY(0)",
    };
  }

  const infoBoxStyle: CSSProperties = {
    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.08) 0%, rgba(118, 75, 162, 0.08) 100%)",
    border: "2px solid rgba(102, 126, 234, 0.2)",
    borderRadius: "24px",
    padding: "24px",
    color: "var(--text-secondary)",
    lineHeight: 1.9,
    fontSize: 15,
    boxShadow: "var(--shadow-md)",
    backdropFilter: "blur(10px)",
  };

  const formStyle: CSSProperties = {
    background: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderRadius: "28px",
    padding: "28px 24px",
    display: "grid",
    gap: 18,
    boxShadow: "var(--shadow-lg)",
    animation: "fadeInUp 0.6s ease-out 0.2s backwards",
  };

  const mutedTextStyle: CSSProperties = {
    color: "var(--text-muted)",
    fontSize: 14,
    fontWeight: 500,
    padding: "12px 16px",
    background: "rgba(17, 153, 142, 0.08)",
    borderRadius: "14px",
    borderRight: "4px solid #11998e",
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    border: "2px solid var(--border-color)",
    borderRadius: "16px",
    padding: "16px 18px",
    fontSize: 15,
    outline: "none",
    background: "var(--bg-card)",
    color: "var(--text-primary)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: "var(--shadow-xs)",
    fontWeight: 500,
  };

  const fieldBoxStyle: CSSProperties = {
    border: "2px solid var(--border-color)",
    borderRadius: "16px",
    padding: "18px",
    background: "var(--bg-card)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    boxShadow: "var(--shadow-xs)",
  };

  const fieldLabelStyle: CSSProperties = {
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 10,
    color: "var(--text-primary)",
    display: "block",
  };

  const checkboxRowStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 12,
    fontSize: 15,
    color: "var(--text-primary)",
    padding: "16px",
    background: "var(--bg-hover)",
    borderRadius: "14px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontWeight: 600,
  };

  const primaryButtonStyle: CSSProperties = {
    border: "none",
    color: "white",
    borderRadius: "18px",
    padding: "18px 24px",
    fontSize: 17,
    fontWeight: 800,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    boxShadow: "0 12px 32px rgba(102, 126, 234, 0.4)",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    letterSpacing: "0.5px",
    textTransform: "uppercase",
    position: "relative",
    overflow: "hidden",
  };

  const statusTextStyle: CSSProperties = {
    color: "var(--text-secondary)",
    lineHeight: 1.8,
    fontSize: 14,
    padding: "14px 18px",
    background: "var(--bg-hover)",
    borderRadius: "14px",
    textAlign: "center",
    fontWeight: 500,
  };

  const navStyle: CSSProperties = {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 600,
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderTop: "1px solid var(--border-color)",
    padding: "12px 16px",
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.1)",
    zIndex: 100,
  };

  function navItemStyle(active: boolean): CSSProperties {
    return {
      textDecoration: "none",
      textAlign: "center",
      background: active 
        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
        : "transparent",
      color: active ? "white" : "var(--text-secondary)",
      padding: "14px 10px",
      borderRadius: "18px",
      fontSize: 13,
      fontWeight: active ? 800 : 600,
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: active ? "0 8px 24px rgba(102, 126, 234, 0.35)" : "none",
      transform: active ? "translateY(-2px)" : "translateY(0)",
      position: "relative",
    };
  }

  return (
    <main style={{ ...pageStyle, direction: dir }}>
      {/* ✨ خلفية زخرفية */}
      <div style={{
        position: "fixed",
        top: -200,
        right: -200,
        width: 400,
        height: 400,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        opacity: 0.03,
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 0,
      }} />
      
      <div style={{
        position: "fixed",
        bottom: -150,
        left: -150,
        width: 300,
        height: 300,
        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        opacity: 0.03,
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 0,
      }} />

      <div style={{ ...containerStyle, position: "relative", zIndex: 1 }}>
        <div style={headerRowStyle}>
          <div>
            <Link 
              href="/profile" 
              style={backLinkStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-hover)";
                e.currentTarget.style.transform = "translateX(-4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              ← {t.back}
            </Link>

            <h1 style={titleStyle}>
              <span style={{ marginRight: 10 }}>🎓</span>
              {t.createCourseTitle}
            </h1>
            <p style={subtitleStyle}>{t.createCourseSubtitle}</p>
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
          <div style={infoBoxStyle}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
            {t.mustConnectPiFirst}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={formStyle}>
            <div style={mutedTextStyle}>
              👤 {t.username}:{" "}
              <strong style={{ color: "#11998e" }}>{piUser.username}</strong>
            </div>

            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={`✏️ ${t.courseTitle}`}
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#667eea";
                e.currentTarget.style.boxShadow = "0 0 0 4px rgba(102, 126, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.boxShadow = "var(--shadow-xs)";
              }}
            />

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={`📝 ${t.courseDescription}`}
              rows={5}
              style={{ ...inputStyle, resize: "vertical", minHeight: 130 }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#667eea";
                e.currentTarget.style.boxShadow = "0 0 0 4px rgba(102, 126, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.boxShadow = "var(--shadow-xs)";
              }}
            />

            <input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder={`⏱️ ${t.duration}`}
              style={inputStyle}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#667eea";
                e.currentTarget.style.boxShadow = "0 0 0 4px rgba(102, 126, 234, 0.1)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.boxShadow = "var(--shadow-xs)";
              }}
            />

            <div 
              style={fieldBoxStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#667eea";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.boxShadow = "var(--shadow-xs)";
              }}
            >
              <div style={fieldLabelStyle}>🖼️ {t.imageUrl}</div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                style={{ marginTop: 8 }}
              />
            </div>

            <div 
              style={fieldBoxStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#f5576c";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.boxShadow = "var(--shadow-xs)";
              }}
            >
              <div style={fieldLabelStyle}>🎬 {t.videoUrl}</div>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                style={{ marginTop: 8 }}
              />
            </div>

            <div 
              style={fieldBoxStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#f2994a";
                e.currentTarget.style.boxShadow = "var(--shadow-md)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-color)";
                e.currentTarget.style.boxShadow = "var(--shadow-xs)";
              }}
            >
              <div style={fieldLabelStyle}>📁 {t.fileUrl}</div>
              <input
                type="file"
                accept=".pdf,.zip,.doc,.docx,.ppt,.pptx"
                onChange={(e) => setCourseFile(e.target.files?.[0] || null)}
                style={{ marginTop: 8 }}
              />
            </div>

            <label 
              style={checkboxRowStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(102, 126, 234, 0.08)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "var(--bg-hover)";
              }}
            >
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                style={{ 
                  width: 20, 
                  height: 20, 
                  accentColor: "#667eea",
                  cursor: "pointer",
                }}
              />
              <span>💰 {t.isFreeCourse}</span>
            </label>

            {!isFree ? (
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={`💵 ${t.coursePrice} (π)`}
                type="number"
                step="0.01"
                min="0"
                style={inputStyle}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "#11998e";
                  e.currentTarget.style.boxShadow = "0 0 0 4px rgba(17, 153, 142, 0.1)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "var(--border-color)";
                  e.currentTarget.style.boxShadow = "var(--shadow-xs)";
                }}
              />
            ) : null}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...primaryButtonStyle,
                background: loading 
                  ? "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)" 
                  : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 16px 40px rgba(102, 126, 234, 0.5)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(102, 126, 234, 0.4)";
              }}
            >
              {loading ? "⏳ " + t.publishingCourse : "🚀 " + t.publishCourse}
            </button>

            {status ? (
              <div style={{
                ...statusTextStyle,
                background: status.includes("نجاح") || status.includes("success")
                  ? "rgba(17, 153, 142, 0.1)"
                  : status.includes("خطأ") || status.includes("Error")
                    ? "rgba(245, 87, 108, 0.1)"
                    : "var(--bg-hover)",
                color: status.includes("نجاح") || status.includes("success")
                  ? "#11998e"
                  : status.includes("خطأ") || status.includes("Error")
                    ? "#f5576c"
                    : "var(--text-secondary)",
                borderRight: status.includes("نجاح") || status.includes("success")
                  ? "4px solid #11998e"
                  : status.includes("خطأ") || status.includes("Error")
                    ? "4px solid #f5576c"
                    : "4px solid var(--border-color)",
              }}>
                {status}
              </div>
            ) : null}
          </form>
        )}
      </div>

      <nav style={navStyle}>
        <Link 
          href="/profile" 
          style={navItemStyle(false)}
          onMouseEnter={(e) => {
            if (!e.currentTarget.style.background.includes("gradient")) {
              e.currentTarget.style.background = "var(--bg-hover)";
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.style.background.includes("gradient")) {
              e.currentTarget.style.background = "transparent";
            }
          }}
        >
          <div style={{ fontSize: 20, marginBottom: 4 }}>👤</div>
          {t.profile}
        </Link>

        <Link 
          href="/create-course" 
          style={navItemStyle(true)}
        >
          <div style={{ fontSize: 20, marginBottom: 4 }}>➕</div>
          {t.createCourse}
        </Link>

        <Link 
          href="/" 
          style={navItemStyle(false)}
          onMouseEnter={(e) => {
            if (!e.currentTarget.style.background.includes("gradient")) {
              e.currentTarget.style.background = "var(--bg-hover)";
            }
          }}
          onMouseLeave={(e) => {
            if (!e.currentTarget.style.background.includes("gradient")) {
              e.currentTarget.style.background = "transparent";
            }
          }}
        >
          <div style={{ fontSize: 20, marginBottom: 4 }}>🏠</div>
          {t.home}
        </Link>
      </nav>

      {/* 🎨 أنماط CSS للـ Animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* تحسين مظهر file inputs */
        input[type="file"]::file-selector-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          margin-left: 12px;
          transition: all 0.3s ease;
        }
        
        input[type="file"]::file-selector-button:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
      `}</style>
    </main>
  );
}
