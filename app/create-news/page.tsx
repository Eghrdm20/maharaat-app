"use client";

import type { CSSProperties, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { translations, type Lang, getDirection } from "@/lib/i18n";

type CachedPiUser = {
  uid: string;
  username: string;
};

export default function CreateNewsPage() {
  const router = useRouter();

  const [lang, setLang] = useState<Lang>("ar");
  const [piUser, setPiUser] = useState<CachedPiUser | null>(null);

  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");
  const [imageUrl, setImageUrl] = useState("");

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!piUser) {
      setStatus(t.mustConnectPiFirst);
      return;
    }

    if (!title.trim() || !content.trim()) {
      setStatus(t.fillRequiredFields);
      return;
    }

    try {
      setLoading(true);
      setStatus(lang === "ar" ? "جاري نشر الخبر..." : "Publishing news...");

      const res = await fetch("/api/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: piUser.uid,
          username: piUser.username,
          title,
          content,
          excerpt,
          category,
          image_url: imageUrl.trim() || null,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.error || (lang === "ar" ? "فشل نشر الخبر" : "Failed to publish news"));
      }

      setStatus(lang === "ar" ? "تم نشر الخبر بنجاح" : "News published successfully");

      setTimeout(() => {
        router.push("/news");
      }, 1000);
    } catch (error: any) {
      console.error(error);
      setStatus(error?.message || (lang === "ar" ? "فشل نشر الخبر" : "Failed to publish news"));
    } finally {
      setLoading(false);
    }
  };

  const pageStyle: CSSProperties = {
    minHeight: "100vh",
    paddingBottom: 100,
    background: "var(--bg-primary)",
    fontFamily: "var(--font-tajawal), sans-serif",
  };

  const containerStyle: CSSProperties = {
    maxWidth: 680,
    margin: "0 auto",
    padding: "20px",
  };

  const cardStyle: CSSProperties = {
    background: "var(--bg-card)",
    borderRadius: 24,
    padding: 20,
    boxShadow: "var(--shadow-md)",
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid var(--border-color)",
    background: "var(--bg-secondary)",
    color: "var(--text-primary)",
    fontSize: 16,
    outline: "none",
  };

  const labelStyle: CSSProperties = {
    display: "block",
    marginBottom: 8,
    fontWeight: 700,
    fontSize: 15,
    color: "var(--text-primary)",
  };

  const buttonStyle: CSSProperties = {
    width: "100%",
    padding: "16px",
    borderRadius: 18,
    border: "none",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 800,
    color: "#fff",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  };

  return (
    <main style={pageStyle} dir={dir}>
      <div style={containerStyle}>
        <div style={{ marginBottom: 18 }}>
          <Link
            href="/profile"
            style={{
              textDecoration: "none",
              color: "var(--text-secondary)",
              fontWeight: 700,
            }}
          >
            {lang === "ar" ? "← العودة إلى الملف الشخصي" : "← Back to Profile"}
          </Link>
        </div>

        <div style={cardStyle}>
          <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 8 }}>
            {lang === "ar" ? "إضافة خبر جديد" : "Create News Post"}
          </h1>

          <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
            {lang === "ar"
              ? "اكتب خبرًا جديدًا وانشره في المنصة"
              : "Write and publish a new post to the platform"}
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                {lang === "ar" ? "عنوان الخبر" : "News Title"}
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={inputStyle}
                placeholder={lang === "ar" ? "اكتب عنوان الخبر" : "Enter title"}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                {lang === "ar" ? "ملخص الخبر" : "News Excerpt"}
              </label>
              <input
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                style={inputStyle}
                placeholder={lang === "ar" ? "ملخص قصير" : "Short excerpt"}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                {lang === "ar" ? "التصنيف" : "Category"}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={inputStyle}
              >
                <option value="general">{lang === "ar" ? "عامة" : "General"}</option>
                <option value="tech">{lang === "ar" ? "تقنية" : "Tech"}</option>
                <option value="education">{lang === "ar" ? "تعليم" : "Education"}</option>
                <option value="pi">Pi Network</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                {lang === "ar" ? "رابط الصورة" : "Image URL"}
              </label>
              <input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                style={inputStyle}
                placeholder="https://..."
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>
                {lang === "ar" ? "محتوى الخبر" : "News Content"}
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{ ...inputStyle, minHeight: 180, resize: "vertical" }}
                placeholder={lang === "ar" ? "اكتب محتوى الخبر هنا..." : "Write the content here..."}
              />
            </div>

            <button type="submit" disabled={loading} style={buttonStyle}>
              {loading
                ? lang === "ar"
                  ? "جاري نشر الخبر..."
                  : "Publishing news..."
                : lang === "ar"
                ? "نشر الخبر"
                : "Publish News"}
            </button>

            {status ? (
              <div
                style={{
                  marginTop: 16,
                  padding: "14px 16px",
                  borderRadius: 16,
                  background: "rgba(102, 126, 234, 0.10)",
                  color: "var(--text-primary)",
                  fontWeight: 700,
                }}
              >
                {status}
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </main>
  );
}
