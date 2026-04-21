"use client";

import type { CSSProperties } from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link } from "next/link"; // ✅ تمت إضافة الاستيراد الناقص!
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

  // جلب بيانات المستخدم من localStorage
  const getUserData = () => {
    if (typeof window === "undefined") return null;
    try {
      const piUser = window.localStorage.getItem("pi_user");
      return piUser ? JSON.parse(piUser) : null;
    } catch { 
      return null; 
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // التحقق من الحقول المطلوبة
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
          username: user?.username || (lang === "ar" ? "Admin" : "Admin"),
          title: title.trim(),
          content: content.trim(),
          excerpt: content.trim().substring(0, 150) + "...",
          category,
          image_url: imageUrl || null,
        }),
      });

      const json = await res.json();
      
      if (json.ok) {
        setMessage("✅ تم نشر المقال بنجاح! جاري التحويل...");
        setTimeout(() => router.push("/news"), 1500);
      } else {
        setMessage("❌ " + (json.error || "فشل نشر المقال"));
      }
    } catch (err: any) {
      console.error("Error creating post:", err);
      setMessage("❌ خطأ: " + (err.message || "حدث خطأ غير متوقع"));
    } finally {
      setLoading(false);
    }
  };

  // ====== 🎨 STYLES ======
  
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

  const headerStyle: CSSProperties = {
    textAlign: lang === "ar" ? "center" : "center",
    marginBottom: 28,
  };

  const titleStyle: CSSProperties = {
    fontSize: 28,
    fontWeight: 800,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: 8,
  };

  const subtitleStyle: CSSProperties = {
    color: "var(--text-secondary)",
    fontSize: 15,
  };

  const formStyle: CSSProperties = {
    background: "var(--bg-card)",
    borderRadius: "24px",
    padding: "28px",
    boxShadow: "var(--shadow-lg)",
    border: "1px solid var(--border-color)",
  };

  const labelStyle: CSSProperties = {
    display: "block",
    marginBottom: 8,
    fontWeight: 700,
    color: "var(--text-primary)",
    fontSize: 14,
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
    fontFamily: "inherit",
  };

  const textareaStyle: CSSProperties = {
    ...inputStyle,
    minHeight: 200,
    resize: "vertical",
    lineHeight: 1.7,
  };

  const selectStyle: CSSProperties = {
    ...inputStyle,
    cursor: "pointer",
    appearance: "auto",
  };

  const submitButtonStyle: CSSProperties = {
    width: "100%",
    padding: "16px",
    background: loading 
      ? "linear-gradient(135deg, #94a3b8 0%, #64748b 100%)" 
      : "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    color: "white",
    border: "none",
    borderRadius: "14px",
    fontWeight: 700,
    fontSize: 16,
    cursor: loading ? "not-allowed" : "pointer",
    transition: "all 0.3s ease",
    boxShadow: loading ? "none" : "0 8px 24px rgba(17, 153, 142, 0.35)",
    opacity: loading ? 0.7 : 1,
  };

  const messageStyle: CSSProperties = {
    marginTop: 16,
    padding: "14px 18px",
    borderRadius: "12px",
    textAlign: "center",
    fontWeight: 600,
    fontSize: 14,
    animation: "fadeInUp 0.3s ease",
  };

  // Navigation Styles
  const navStyle: CSSProperties = {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 650,
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderTop: "1px solid var(--border-color)",
    padding: "10px 12px",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 6,
    zIndex: 100,
  };

  const navItemStyle = (active: boolean): CSSProperties => ({
    textDecoration: "none",
    textAlign: "center",
    background: active 
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
      : "transparent",
    color: active ? "white" : "var(--text-secondary)",
    padding: "10px 6px",
    borderRadius: "16px",
    fontSize: 11,
    fontWeight: active ? 800 : 600,
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    boxShadow: active ? "0 6px 20px rgba(102, 126, 234, 0.35)" : "none",
    transform: active ? "translateY(-2px)" : "translateY(0)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  });

  // ====== RENDER ======
  return (
    <main style={{ ...mainStyle, direction: dir }}>
      {/* Background decorations */}
      <div style={{
        position: "fixed", top: -150, right: -150, width: 350, height: 350,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        opacity: 0.04, borderRadius: "50%", pointerEvents: "none", zIndex: 0,
      }} />
      
      <div style={containerStyle}>
        {/* Header */}
        <header style={headerStyle}>
          {/* Back button */}
          <Link 
            href="/news" 
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              color: "var(--text-secondary)",
              textDecoration: "none",
              fontSize: 15,
              fontWeight: 600,
              padding: "8px 12px",
              borderRadius: "12px",
              marginBottom: 16,
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            ← {t.back}
          </Link>

          <h1 style={titleStyle}>
            ✍️ {lang === "ar" ? "إنشاء مقال جديد" : "Create New Post"}
          </h1>
          
          <p style={subtitleStyle}>
            {lang === "ar" 
              ? "شارك معرفتك واخبارك مع المجتمع" 
              : "Share your knowledge and news with the community"
            }
          </p>
        </header>

        {/* Form */}
        <form onSubmit={handleSubmit} style={formStyle}>
          {/* Title Field */}
          <label style={labelStyle}>
            📝 {lang === "ar" ? "العنوان" : "Title"} <span style={{ color: "#f5576c" }}>*</span>
          </label>
          
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={lang === "ar" ? "اكتب عنواناً جذاباً..." : "Write a catchy title..."}
            style={inputStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#11998e";
              e.currentTarget.style.boxShadow = "0 0 0 4px rgba(17, 153, 142, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border-color)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />

          {/* Content Field */}
          <label style={labelStyle}>
            📄 {lang === "ar" ? "المحتوى" : "Content"} <span style={{ color: "#f5576c" }}>*</span>
          </label>
          
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={
              lang === "ar" 
                ? "اكتب محتوى المقال هنا... يمكنك استخدام Markdown!" 
                : "Write your post content here... You can use Markdown!"
            }
            style={textareaStyle}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#11998e";
              e.currentTarget.style.boxShadow = "0 0 0 4px rgba(17, 153, 142, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border-color)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />

          {/* Category Select */}
          <label style={labelStyle}>
            📂 {lang === "ar" ? "التصنيف" : "Category"}
          </label>
          
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={selectStyle}
          >
            <option value="general">
              🌟 {lang === "ar" ? "عامة" : "General"}
            </option>
            <option value="tech">
              💻 {lang === "ar" ? "تقنية" : "Technology"}
            </option>
            <option value="education">
              📚 {lang === "ar" ? "تعليم" : "Education"}
            </option>
            <option value="pi">
              π {lang === "ar" ? "Pi Network" : "Pi Network"}
            </option>
            <option value="news">
              📰 {lang === "ar" ? "أخبار" : "News"}
            </option>
            <option value="tutorial">
              🔧 {lang === "ar" ? "دروس" : "Tutorial"}
            </option>
          </select>

          {/* Image URL (Optional) */}
          <label style={labelStyle}>
            🖼️ {lang === "ar" ? "رابط الصورة (اختياري)" : "Image URL (optional)"}
          </label>
          
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
            style={inputStyle}
          />
          
          <div style={{
            fontSize: 12,
            color: "var(--text-muted)",
            marginTop: -10,
            marginBottom: 16,
          }}>
            {lang === "ar" 
              ? "💡 اتركه فارغاً لاستخدام صورة افتراضية" 
              : "💡 Leave empty to use default image"
            }
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            style={submitButtonStyle}
            disabled={loading}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.transform = "scale(1.02)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(17, 153, 142, 0.45)";
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 8px 24px rgba(17, 153, 142, 0.35)";
            }}
          >
            {loading 
              ? (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  ⏳ {lang === "ar" ? "جاري النشر..." : "Publishing..."}
                </span>
              ) : (
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  🚀 {lang === "ar" ? "نشر المقال الآن" : "Publish Post Now"}
                </span>
              )
            }
          </button>

          {/* Message */}
          {message && (
            <div style={{
              ...messageStyle,
              background: message.includes("✅") 
                ? "rgba(17, 153, 142, 0.1)" 
                : message.includes("⚠️")
                  ? "rgba(242, 153, 74, 0.1)"
                  : "rgba(245, 87, 108, 0.1)",
              color: message.includes("✅") 
                ? "#11998e" 
                : message.includes("⚠️")
                  ? "#f2994a"
                  : "#f5576c",
              borderRight: message.includes("✅") 
                ? "4px solid #11998e" 
                : message.includes("⚠️")
                  ? "4px solid #f2994a"
                  : "4px solid #f5576c",
            }}>
              {message}
            </div>
          )}
        </form>

        {/* Tips Section */}
        <div style={{
          marginTop: 24,
          padding: 20,
          background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
          borderRadius: "16px",
          border: "1px solid rgba(102, 126, 234, 0.15)",
        }}>
          <h3 style={{
            fontSize: 16,
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            💡 {lang === "ar" ? "نصائح لكتابة مقال رائع" : "Tips for a great post"}
          </h3>
          
          <ul style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "grid",
            gap: 8,
          }}>
            <li style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              fontSize: 13,
              color: "var(--text-secondary)",
            }}>
              <span>✨</span>
              {lang === "ar" ? "استخدم عنواناً واضحاً وجذاباً" : "Use a clear and attractive title"}
            </li>
            <li style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              fontSize: 13,
              color: "var(--text-secondary)",
            }}>
              <span>📝" />
              {lang === "ar" ? "اكتب محتوى مفيداً ومفصلاً" : "Write useful and detailed content"}
            </li>
            <li style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              fontSize: 13,
              color: "var(--text-secondary)",
            }}>
              <span>🖼️" />
              {lang === "ar" ? "أضف صورة لجذب الانتباه" : "Add an image to attract attention"}
            </li>
            <li style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              fontSize: 13,
              color: "var(--text-secondary)",
            }}>
              <span>💬" />
              {lang === "ar" ? "اختر التصنيف المناسب" : "Choose the appropriate category"}
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Navigation - 4 Tabs */}
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
          <span>{lang === "ar" ? "أخبار" : "News"}</span>
        </Link>

        <Link href="/" style={navItemStyle(false)}>
          <div style={{ fontSize: 18, marginBottom: 3 }}>🏠</div>
          <span>{t.home}</span>
        </Link>
      </nav>

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        input:focus, textarea:focus, select:focus {
          outline: none;
        }
      `}</style>
    </main>
  );
}
