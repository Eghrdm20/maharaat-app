"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CSSProperties } from "react";
import { translations, type Lang, getDirection } from "@/lib/i18n";

export default function CreatePostPage() {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("ar");
  const t = translations[lang];
  const dir = getDirection(lang);
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const getUserData = () => {
    try {
      if (typeof window !== "undefined") {
        const piUser = window.localStorage.getItem("pi_user");
        return piUser ? JSON.parse(piUser) : null;
      }
    } catch (e) {
      return null;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      setMessage("⚠️ العنوان مطلوب");
      return;
    }
    
    if (!content.trim()) {
      setMessage("⚠️ المحتوى مطلوب");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const user = getUserData();
      
      const res = await fetch("/api/news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: user?.uid || null,
          username: user?.username || "Admin",
          title: title.trim(),
          content: content.trim(),
          excerpt: content.trim().substring(0, 150),
          category,
          image_url: imageUrl || null,
        }),
      });

      const json = await res.json();
      
      if (json.ok) {
        setMessage("✅ تم النشر!");
        setTimeout(() => router.push("/news"), 1500);
      } else {
        setMessage("❌ فشل: " + (json.error || "خطأ"));
      }
    } catch (err: any) {
      console.error(err);
      setMessage("❌ خطأ: " + (err.message || "حدث خطأ"));
    } finally {
      setLoading(false);
    }
  };

  /* ===== STYLES ===== */
  const mainStyle: CSSProperties = {
    minHeight: "100vh", paddingBottom: 100,
    background: "var(--bg-primary)",
    fontFamily: "var(--font-tajawal), sans-serif",
    padding: "20px"
  };
  const containerStyle: CSSProperties = { maxWidth: 600, margin: "0 auto" };
  const formStyle: CSSProperties = {
    background: "var(--bg-card)", borderRadius: 24, padding: 28,
    boxShadow: "var(--shadow-lg)", border: "1px solid var(--border-color)"
  };
  const labelStyle: CSSProperties = {
    display: "block", marginBottom: 8, fontWeight: 700,
    color: "var(--text-primary)", fontSize: 14
  };
  const inputStyle: CSSProperties = {
    width: "100%", border: "2px solid var(--border-color)",
    borderRadius: 14, padding: "14px 16px", fontSize: 15,
    outline: "none", background: "var(--bg-primary)",
    color: "var(--text-primary)", marginBottom: 16,
    transition: "all 0.3s ease", fontFamily: "inherit"
  };
  const textareaStyle: CSSProperties = {
    ...inputStyle, minHeight: 200, resize: "vertical", lineHeight: 1.7
  };
  const selectStyle: CSSProperties = { ...inputStyle, cursor: "pointer" };
  const btnStyle: CSSProperties = {
    width: "100%", padding: 16,
    background: loading ? "#94a3b8" : "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    color: "white", border: "none", borderRadius: 14,
    fontWeight: 700, fontSize: 16, cursor: loading ? "not-allowed" : "pointer",
    transition: "all 0.3s ease",
    boxShadow: loading ? "none" : "0 8px 24px rgba(17,153,142,0.35)"
  };
  const msgStyle: CSSProperties = {
    marginTop: 16, padding: "14px 18px", borderRadius: 12,
    textAlign: "center", fontWeight: 600, fontSize: 14
  };
  const navStyle: CSSProperties = {
    position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
    width: "100%", maxWidth: 650,
    background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)",
    borderTop: "1px solid var(--border-color)", padding: "10px 12px",
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, zIndex: 100
  };
  const navItem = (active: boolean): CSSProperties => ({
    textDecoration: "none", textAlign: "center",
    background: active ? "linear-gradient(135deg,#667eea 0%,#764ba2 100%)" : "transparent",
    color: active ? "white" : "var(--text-secondary)",
    padding: "10px 6px", borderRadius: 16, fontSize: 11,
    fontWeight: active ? 800 : 600,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 2
  });

  return (
    <main style={{ ...mainStyle, direction: dir }}>
      <div style={containerStyle}>
        <header style={{ textAlign: lang === "ar" ? "center" : "center", marginBottom: 28 }}>
          <Link href="/news" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            color: "var(--text-secondary)", textDecoration: "none",
            fontSize: 15, fontWeight: 600, padding: "8px 12px",
            borderRadius: 12, marginBottom: 16, transition: "all 0.3s ease"
          }}>
            ← {t.back}
          </Link>
          
          <h1 style={{
            fontSize: 28, fontWeight: 800,
            background: "linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8
          }}>
            ✍️ {lang === "ar" ? "إنشاء مقال جديد" : "Create New Post"}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
            {lang === "ar" ? "شارك معرفتك مع المجتمع" : "Share with community"}
          </p>
        </header>

        <form onSubmit={handleSubmit} style={formStyle}>
          <label style={labelStyle}>📝 العنوان *</label>
          <input value={title} onChange={e => setTitle(e.target.value)}
            placeholder="عنوان المقال..." style={inputStyle} />
          
          <label style={labelStyle}>📄 المحتوى *</label>
          <textarea value={content} onChange={e => setContent(e.target.value)}
            placeholder="اكتب المحتوى هنا..." style={textareaStyle} />
          
          <label style={labelStyle}>📂 التصنيف</label>
          <select value={category} onChange={e => setCategory(e.target.value)} style={selectStyle}>
            <option value="general">🌟 عامة</option>
            <option value="tech">💻 تقنية</option>
            <option value="education">📚 تعليم</option>
            <option value="pi">π Pi Network</option>
          </select>

          <label style={labelStyle}>🖼️ صورة (اختياري)</label>
          <input value={imageUrl} onChange={e => setImageUrl(e.target.value)}
            placeholder="https://..." style={inputStyle} />

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? "⏳ جاري..." : "🚀 نشر المقال"}
          </button>

          {message && (
            <div style={{
              ...msgStyle,
              background: message.includes("✅") ? "rgba(17,153,142,0.1)" : "rgba(245,87,108,0.1)",
              color: message.includes("✅") ? "#11998e" : "#f5576c",
              borderRight: message.includes("✅") ? "4px solid #11998e" : "4px solid #f5576c"
            }}>{message}</div>
          )}
        </form>
      </div>

      {/* ===== NAV ===== */}
      <nav style={navStyle}>
        <Link href="/profile" style={navItem(false)}>
          <div style={{fontSize:18,marginBottom:3}}>👤</div><span>{t.profile}</span>
        </Link>
        <Link href="/create-course" style={navItem(false)}>
          <div style={{fontSize:18,marginBottom:3}}>➕</div><span>{t.createCourse}</span>
        </Link>
        <Link href="/news" style={navItem(true)}>
          <div style={{fontSize:18,marginBottom:3}}>📰</div><span>أخبار</span>
        </Link>
        <Link href="/" style={navItem(false)}>
          <div style={{fontSize:18,marginBottom:3}}>🏠</div><span>{t.home}</span>
        </Link>
      </nav>
    </main>
  );
        }
