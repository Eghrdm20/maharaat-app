"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { translations, type Lang, getDirection } from "@/lib/i18n";

type Post = {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  image_url: string | null;
  username: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
};

type Category = {
  id: string;
  name: string;
  icon: string;
};

const categories: Category[] = [
  { id: "all", name: "الكل", icon: "" },
  { id: "tech", name: "تقنية", icon: "" },
  { id: "education", name: "تعليم", icon: "" },
  { id: "pi", name: "Pi Network", icon: "π" },
  { id: "general", name: "عامة", icon: "" },
];

export default function NewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [lang, setLang] = useState<Lang>("ar");

  const t = translations[lang];
  const dir = getDirection(lang);

  useEffect(() => {
    const savedLang = (window.localStorage.getItem("app_lang") as Lang) || "ar";
    setLang(savedLang);
  }, []);

  useEffect(() => {
    void loadPosts(activeCategory);
  }, [activeCategory]);

  const loadPosts = async (category: string) => {
    setLoading(true);
    setError(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(`/api/news?category=${encodeURIComponent(category)}&limit=10`, {
        method: "GET",
        cache: "no-store",
        signal: controller.signal,
      });

      let json: any = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }

      if (!res.ok) {
        throw new Error(json?.error || "تعذر تحميل الأخبار");
      }

      setPosts(Array.isArray(json?.posts) ? json.posts : []);
    } catch (err: any) {
      console.error("Failed to load news:", err);

      if (err?.name === "AbortError") {
        setError("انتهت مهلة تحميل الأخبار. حاول مرة أخرى.");
      } else {
        setError(err?.message || "حدث خطأ أثناء تحميل الأخبار.");
      }

      setPosts([]);
    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  const mainStyle: CSSProperties = {
    minHeight: "100vh",
    paddingBottom: 100,
    background: "var(--bg-primary)",
    fontFamily: "var(--font-tajawal), sans-serif",
  };

  const containerStyle: CSSProperties = {
    maxWidth: 600,
    margin: "0 auto",
    padding: "20px",
  };

  const headerStyle: CSSProperties = {
    textAlign: "center",
    marginBottom: 24,
  };

  const titleStyle: CSSProperties = {
    fontSize: 32,
    fontWeight: 800,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    marginBottom: 8,
  };

  const categoriesStyle: CSSProperties = {
    display: "flex",
    gap: 10,
    overflowX: "auto",
    paddingBottom: 12,
    marginBottom: 20,
    scrollbarWidth: "none",
  };

  const categoryChipStyle = (active: boolean): CSSProperties => ({
    padding: "10px 18px",
    borderRadius: "999px",
    border: active ? "2px solid transparent" : "2px solid var(--border-color)",
    background: active
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      : "var(--bg-card)",
    color: active ? "white" : "var(--text-secondary)",
    fontWeight: active ? 700 : 600,
    fontSize: 14,
    cursor: "pointer",
    whiteSpace: "nowrap",
    transition: "all 0.3s ease",
    boxShadow: active ? "0 4px 16px rgba(102, 126, 234, 0.35)" : "none",
  });

  const cardStyle: CSSProperties = {
    background: "var(--bg-card)",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "var(--shadow-md)",
    marginBottom: 20,
    transition: "all 0.3s ease",
    textDecoration: "none",
    color: "inherit",
    display: "block",
  };

  const imageStyle: CSSProperties = {
    width: "100%",
    height: 200,
    objectFit: "cover",
    background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
  };

  const contentStyle: CSSProperties = {
    padding: "18px",
  };

  const metaStyle: CSSProperties = {
    display: "flex",
    gap: 16,
    fontSize: 13,
    color: "var(--text-muted)",
    marginTop: 12,
    flexWrap: "wrap",
  };

  const metaItemStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 4,
  };

  const stateCardStyle: CSSProperties = {
    background: "var(--bg-card)",
    borderRadius: 20,
    padding: 24,
    textAlign: "center",
    boxShadow: "var(--shadow-md)",
  };

  return (
    <main style={mainStyle} dir={dir}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>الأخبار والمقالات</h1>
          <p style={{ color: "var(--text-secondary)" }}>
            اقرأ أحدث المقالات والتفاعل مع المجتمع
          </p>
        </div>

        <div style={categoriesStyle}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={categoryChipStyle(activeCategory === cat.id)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={stateCardStyle}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
            <div>جاري تحميل المقالات...</div>
          </div>
        ) : error ? (
          <div style={stateCardStyle}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
            <div style={{ marginBottom: 12 }}>{error}</div>
            <button
              onClick={() => void loadPosts(activeCategory)}
              style={{
                padding: "10px 16px",
                borderRadius: 12,
                border: "none",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              إعادة المحاولة
            </button>
          </div>
        ) : posts.length === 0 ? (
          <div style={stateCardStyle}>لا توجد مقالات بعد</div>
        ) : (
          posts.map((post) => (
            <Link key={post.id} href={`/news/${post.id}`} style={cardStyle}>
              {post.image_url ? (
                <img src={post.image_url} alt={post.title} style={imageStyle} />
              ) : null}

              <div style={contentStyle}>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 8 }}>
                  {categories.find((c) => c.id === post.category)?.icon}{" "}
                  {categories.find((c) => c.id === post.category)?.name || post.category}
                </div>

                <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>
                  {post.title}
                </h2>

                <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
                  {post.excerpt}
                </p>

                <div style={metaStyle}>
                  <span style={metaItemStyle}>👤 {post.username || "مجهول"}</span>
                  <span style={metaItemStyle}>❤️ {post.likes_count || 0}</span>
                  <span style={metaItemStyle}>💬 {post.comments_count || 0}</span>
                  <span style={metaItemStyle}>👁️ {post.views_count || 0}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
