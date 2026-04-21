"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
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

  // جلب بيانات المستخدم
  const getUserData = () => {
    try {
      const piUser = localStorage.getItem("pi_user");
      return piUser ? JSON.parse(piUser) : null;
    } catch { return null; }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setMessage("⚠️ العنوان والمحتوى مطلوبان");
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
          excerpt: content.substring(0, 150) + "...",
          category,
          image_url: imageUrl || null,
        }),
      });

      const json = await res.json();
      
      if (json.ok) {
        setMessage("✅ تم نشر المقال بنجاح!");
        setTimeout(() => router.push("/news"), 1500);
      } else {
        setMessage("❌ " + (json.error || "فشل النشر"));
      }
    } catch (err: any) {
      setMessage("❌ خطأ: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Styles
  const mainStyle: CSSProperties = {
    minHeight: "100vh",
    paddingBottom: 100,
    background: "var(--bg-primary)",
    fontFamily: "var(--font-tajawal), sans-serif",
    padding: "20px",
  };

  const containerStyle: CSSProperties = {
    maxWidth: 600,
    margin: "0 auto",
  };

  const formStyle: CSSProperties = {
    background: "var(--bg-card)",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "var(--shadow-lg)",
    border: "1px solid var(--border-color)",
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    border: "2px solid var(--border-color)",
    borderRadius: "14px",
    padding: "14px 16px",
    fontSize: 15,
    outline: "none",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    marginBottom: "16px",
    transition: "all 0.3s ease",
  };

  const textareaStyle: CSSProperties = {
    ...inputStyle,
    minHeight: 200,
    resize: "vertical",
    fontFamily: "inherit",
  };

  const selectStyle: CSSProperties = {
    ...inputStyle,
    cursor: "pointer",
  };

  const submitButtonStyle: CSSProperties = {
    width: "100%",
    padding: "16px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "14px",
    fontWeight: 700,
    fontSize: 16,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.35)",
    opacity: loading ? 0.7 : 1,
  };

  const messageStyle: CSSProperties = {
    marginTop: 16,
    padding: "14px",
    borderRadius: "12px",
    textAlign: "center",
    fontWeight: 600,
    fontSize: 14,
  };

  const navStyle: CSSProperties = {
    position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
    width: "100%", maxWidth: 650,
    background: "rgba(255,255,255,0.95)", backdropFilter: "blur(20px)",
    borderTop: "1px solid var(--border-color)", padding: "10px 12px",
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, zIndex: 100,
  };

  const navItemStyle = (active: boolean): CSSProperties => ({
    textDecoration: "none", textAlign: "center",
    background: active ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "transparent",
    color: active ? "white" : "var(--text-secondary)",
    padding: "10px 6px", borderRadius: "16px", fontSize: 11,
    fontWeight: active ? 700 : 600,
    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
  });

  return (
    <main style={{ ...mainStyle, direction: dir }}>
      <div style={containerStyle}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h1 style={{ 
            fontSize: 28, fontWeight: 800, 
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", marginBottom: 8
          }}>
            ✍️ {lang === "ar" ? "إنشاء مقال جديد" : "Create New Post"}
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
            {lang === "ar" ? "شارك معرفتك مع المجتمع" : "Share your knowledge with the community"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={formStyle}>
          {/* Title */}
          <label style={{ display: "block", marginBottom: 6, fontWeight: 700, color: "var(--text-primary)", fontSize: 14 }}>
            📝 {lang === "ar" ? "العنوان" : "Title"} *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={lang === "ar" ? "عنوان المقال..." : "Post title..."}
            style={inputStyle}
            onFocus={(e) => e.currentTarget.style.borderColor = "#667eea"}
            onBlur={(e) => e.currentTarget.style.borderColor = "var(--border-color)"}
          />

          {/* Content */}
          <label style={{ display: "block", marginBottom: 6, fontWeight: 700, color: "var(--text-primary)", fontSize: 14 }}>
            📄 {lang === "ar" ? "المحتوى" : "Content"} *
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={lang === "ar" ? "اكتب محتوى المقال هنا..." : "Write your post content here..."}
            style={textareaStyle}
            onFocus={(e) => e.currentTarget.style.borderColor = "#667eea"}
            onBlur={(e) => e.currentTarget.style.borderColor = "var(--border-color)"}
          />

          {/* Category */}
          <label style={{ display: "block", marginBottom: 6, fontWeight: 700, color: "var(--text-primary)", fontSize: 14 }}>
            📂 {lang === "ar" ? "التصنيف" : "Category"}
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={selectStyle}
          >
            <option value="general">🌟 {lang === "ar" ? "عامة" : "General"}</option>
            <option value="tech">💻 {lang === "ar" ? "تقنية" : "Tech"}</option>
            <option value="education">📚 {lang === "ar" ? "تعليم" : "Education"}</option>
            <option value="pi">π {lang === "ar" ? "Pi Network" : "Pi Network"}</option>
          </select>

          {/* Image URL (Optional) */}
          <label style={{ display: "block", marginBottom: 6, fontWeight: 700, color: "var(--text-primary)", fontSize: 14 }}>
            🖼️ {lang === "ar" ? "رابط الصورة (اختياري)" : "Image URL (optional)"}
          </label>
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            style={inputStyle}
          />

          {/* Submit Button */}
          <button type="submit" style={submitButtonStyle} disabled={loading}>
            {loading 
              ? (lang === "ar" ? "جاري النشر..." : "Publishing...")
              : (lang === "ar" ? "🚀 نشر المقال" : "🚀 Publish Post")
            }
          </button>

          {/* Message */}
          {message && (
            <div style={{
              ...messageStyle,
              background: message.includes("✅") ? "rgba(17, 153, 142, 0.1)" : "rgba(245, 87, 108, 0.1)",
              color: message.includes("✅") ? "#11998e" : "#f5576c",
              borderRight: message.includes("✅") ? "4px solid #11998e" : "4px solid #f5576c",
            }}>
              {message}
            </div>
          )}
        </form>
      </div>

      {/* Bottom Nav */}
      <nav style={navStyle}>
        <Link href="/profile" style={navItemStyle(false)}>
          <div style={{ fontSize: 18, marginBottom: 3 }}>👤</div>
          <span>{t.profile}</span>
        </Link>
        <Link href="/create-course" style={navItemStyle(false)}>
          <div style={{ fontSize: 18, marginBottom: 3 }}>➕</div>
          <span>{t.createCourse}</span>
        </Link>
        <Link href="/news" style={navItemStyle(true)}>
          <div style={{ fontSize: 18, marginBottom: 3 }}>📰</div>
          <span>أخبار</span>
        </Link>
        <Link href="/" style={navItemStyle(false)}>
          <div style={{ fontSize: 18, marginBottom: 3 }}>🏠</div>
          <span>{t.home}</span>
        </Link>
      </nav>
    </main>
  );
    }
