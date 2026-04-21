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
  { id: "all", name: "الكل", icon: "📰" },
  { id: "tech", name: "تقنية", icon: "💻" },
  { id: "education", name: "تعليم", icon: "📚" },
  { id: "pi", name: "Pi Network", icon: "π" },
  { id: "general", name: "عامة", icon: "🌟" },
];

export default function NewsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  const [lang, setLang] = useState<Lang>("ar");
  
  const t = translations[lang];
  const dir = getDirection(lang);

  useEffect(() => {
    const savedLang = (window.localStorage.getItem("app_lang") as Lang) || "ar";
    setLang(savedLang);
    
    loadPosts(activeCategory);
  }, [activeCategory]);

  const loadPosts = async (category: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/news?category=${category}&limit=10`);
      const json = await res.json();
      setPosts(json.posts || []);
    } catch (error) {
      console.error("Failed to load news:", error);
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
  };

  const metaItemStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 4,
  };

  return (
    <main style={{ ...mainStyle, direction: dir }}>
      <div style={containerStyle}>
        {/* Header */}
        <header style={headerStyle}>
          <h1 style={titleStyle}>📰 الأخبار والمقالات</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>
            اقرأ أحدث المقالات والتفاعل مع المجتمع
          </p>
        </header>

        {/* Categories */}
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

        {/* Posts */}
        {loading ? (
          <div style={{
            textAlign: "center",
            padding: 40,
            color: "var(--text-muted)",
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>⏳</div>
            جاري تحميل المقالات...
          </div>
        ) : posts.length === 0 ? (
          <div style={{
            textAlign: "center",
            padding: 40,
            color: "var(--text-muted)",
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
            لا توجد مقالات بعد
          </div>
        ) : (
          <div>
            {posts.map((post) => (
              <Link key={post.id} href={`/news/${post.id}`} style={cardStyle}>
                {post.image_url ? (
                  <img src={post.image_url} alt={post.title} style={imageStyle} />
                ) : (
                  <div style={{ ...imageStyle, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>
                    📰
                  </div>
                )}
                
                <div style={contentStyle}>
                  <span style={{
                    display: "inline-block",
                    padding: "4px 12px",
                    background: "rgba(102, 126, 234, 0.1)",
                    color: "#667eea",
                    borderRadius: "999px",
                    fontSize: 12,
                    fontWeight: 700,
                    marginBottom: 10,
                  }}>
                    {categories.find(c => c.id === post.category)?.icon}{" "}
                    {categories.find(c => c.id === post.category)?.name || post.category}
                  </span>

                  <h2 style={{
                    fontSize: 20,
                    fontWeight: 800,
                    color: "var(--text-primary)",
                    marginBottom: 8,
                    lineHeight: 1.4,
                  }}>
                    {post.title}
                  </h2>

                  <p style={{
                    color: "var(--text-secondary)",
                    fontSize: 14,
                    lineHeight: 1.6,
                    marginBottom: 12,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                    {post.excerpt}
                  </p>

                  <div style={metaStyle}>
                    <span style={metaItemStyle}>
                      👤 {post.username || "مجهول"}
                    </span>
                    <span style={metaItemStyle}>
                      ❤️ {post.likes_count || 0}
                    </span>
                    <span style={metaItemStyle}>
                      💬 {post.comments_count || 0}
                    </span>
                    <span style={metaItemStyle}>
                      👁️ {post.views_count || 0}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom Nav */}
      <nav style={{
        position: "fixed",
        bottom: 0,
        left: "50%",
        transform: "translateX(-50%)",
        width: "100%",
        maxWidth: 600,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid var(--border-color)",
        padding: "12px 16px",
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 8,
        zIndex: 100,
      }}>
        <Link href="/profile" style={{
          textDecoration: "none",
          textAlign: "center",
          color: "var(--text-secondary)",
          padding: "10px",
          borderRadius: "14px",
          fontSize: 12,
          fontWeight: 600,
        }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>👤</div>
          الملف الشخصي
        </Link>
        
        <Link href="/create-course" style={{
          textDecoration: "none",
          textAlign: "center",
          color: "var(--text-secondary)",
          padding: "10px",
          borderRadius: "14px",
          fontSize: 12,
          fontWeight: 600,
        }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>➕</div>
          دورة
        </Link>

        <Link href="/news" style={{
          textDecoration: "none",
          textAlign: "center",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: "10px",
          borderRadius: "14px",
          fontSize: 12,
          fontWeight: 700,
          boxShadow: "0 8px 24px rgba(102, 126, 234, 0.35)",
        }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>📰</div>
          أخبار
        </Link>

        <Link href="/" style={{
          textDecoration: "none",
          textAlign: "center",
          color: "var(--text-secondary)",
          padding: "10px",
          borderRadius: "14px",
          fontSize: 12,
          fontWeight: 600,
        }}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>🏠</div>
          الرئيسية
        </Link>
      </nav>
    </main>
  );
      }
