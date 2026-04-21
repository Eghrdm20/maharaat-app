"use client";

import { useState } from "react";
import Link from "next/link";
import type { CSSProperties } from "react";
import { translations, type Lang, getDirection } from "@/lib/i18n";

export default function ProfilePage() {
  const [lang, setLang] = useState<Lang>("ar");
  const t = translations[lang];
  const dir = getDirection(lang);

  const changeLanguage = (nextLang: Lang) => {
    setLang(nextLang);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("app_lang", nextLang);
      document.documentElement.lang = nextLang;
      document.documentElement.dir = getDirection(nextLang);
    }
  };

  /* ===== STYLES ===== */
  const mainStyle: CSSProperties = {
    minHeight: "100vh",
    paddingBottom: 100,
    background: "var(--bg-primary)",
    fontFamily: "var(--font-tajawal), sans-serif",
    padding: 20,
  };

  const containerStyle: CSSProperties = {
    maxWidth: 500,
    margin: "0 auto",
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
    marginBottom: 12,
  };

  const subtitleStyle: CSSProperties = {
    color: "var(--text-secondary)",
    fontSize: 15,
  };

  const cardStyle: CSSProperties = {
    background: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderRadius: 20,
    padding: 20,
    boxShadow: "var(--shadow-md)",
    marginBottom: 20,
  };

  const buttonStyle: CSSProperties = {
    width: "100%",
    padding: "14px",
    borderRadius: 14,
    border: "none",
    background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    color: "white",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    transition: "all 0.3s ease",
    marginTop: 16,
  };

  const navStyle: CSSProperties = {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 500,
    background: "rgba(255,255,255,0.95)",
    borderTop: "1px solid var(--border-color)",
    padding: 10,
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 8,
    zIndex: 100,
  };

  const navItemStyle = (active: boolean): CSSProperties => ({
    textDecoration: "none",
    textAlign: "center",
    background: active ? "#0f172a" : "transparent",
    color: active ? "white" : "var(--text-secondary)",
    padding: "10px 8px",
    borderRadius: 14,
    fontSize: 12,
    fontWeight: active ? 700 : 600,
  });

  return (
    <main style={{ ...mainStyle, direction: dir }}>
      <div style={containerStyle}>
        {/* Header */}
        <header style={headerStyle}>
          <h1 style={titleStyle}>👤 الملف الشخصي</h1>
          <p style={subtitleStyle}>
            {t.profileSubtitle}
          </p>
        </header>

        {/* Pi Status Card */}
        <div style={cardStyle}>
          <p style={{ textAlign: "center", color: "var(--text-muted)", marginBottom: 16 }}>
            يمكنك ربط حساب Pi من هنا ثم إدارة دوراتك.
          </p>

          <div style={{
            textAlign: "center",
            padding: 16,
            background: "linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.08) 100%)",
            borderRadius: 16,
            border: "2px solid rgba(102,126,234,0.2)",
          }}>
            <Link 
              href="/admin/create-post"
              style={{
                display: "inline-block",
                padding: "12px 24px",
                background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
                color: "white",
                borderRadius: "999px",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: 15,
                boxShadow: "0 6px 20px rgba(17,153,142,0.35)",
              }}
            >
              ✍️ نشر مقال جديد
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 12,
        }}>
          <Link href="/my-courses" style={{ ...cardStyle, textDecoration: "none", color: "inherit", textAlign: "center", padding: 16 }}>
            📚 {t.myCoursesTitle}
          </Link>
          
          <Link href="/explore-courses" style={{ ...cardStyle, textDecoration: "none", color: "inherit", textAlign: "center", padding: 16 }}>
            🔍 {t.exploreCourses}
          </Link>
        </div>

        {/* Create Post Button */}
        <button onClick={() => window.location.href = "/admin/create-post"} style={buttonStyle}>
          ✍️ إنشاء مقال جديد
        </button>
      </div>

      {/* Bottom Nav */}
      <nav style={navStyle}>
        <Link href="/profile" style={navItemStyle(true)}>
          <div style={{fontSize: 18, marginBottom: 3}}>👤</div>
          {t.profile}
        </Link>

        <Link href="/create-course" style={navItemStyle(false)}>
          <div style={{fontSize: 18, marginBottom: 3}}>➕</div>
          {t.createCourse}
        </Link>

        <Link href="/" style={navItemStyle(false)}>
          <div style={{fontSize: 18, marginBottom: 3}}>🏠</div>
          {t.home}
        </Link>
      </nav>
    </main>
  );
}
