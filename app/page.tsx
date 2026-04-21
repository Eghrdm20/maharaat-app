"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { translations, type Lang, getDirection } from "@/lib/i18n";

type Course = {
  id: number;
  title: string;
  description: string | null;
  instructor_name: string;
  price: number | string | null;
  currency: string | null;
  is_free: boolean;
  image_url: string | null;
  duration: string | null;
  students_count: number | null;
  rating: number | null;
  is_new: boolean | null;
  is_deleted?: boolean;
};

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lang, setLang] = useState<Lang>("ar");
  
  const t = translations[lang];
  const dir = getDirection(lang);

  useEffect(() => {
    const savedLang = (window.localStorage.getItem("app_lang") as Lang) || "ar";
    setLang(savedLang);
    document.documentElement.lang = savedLang;
    document.documentElement.dir = getDirection(savedLang);

    const loadCourses = async () => {
      try {
        setLoading(true);
        setError("");
        const supabase = createSupabaseClient();
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("is_deleted", false)
          .order("id", { ascending: false });

        if (error) throw new Error(error.message);
        const nextCourses = (data || []) as Course[];
        setCourses(nextCourses);
        setFilteredCourses(nextCourses);
      } catch (err: any) {
        console.error(err);
        setError(t.failedToLoadCourses);
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  const changeLanguage = (newLang: Lang) => {
    setLang(newLang);
    window.localStorage.setItem("app_lang", newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = getDirection(newLang);
  };

  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setFilteredCourses(courses);
      return;
    }
    setFilteredCourses(
      courses.filter((course) =>
        course.title?.toLowerCase().includes(q) ||
        course.description?.toLowerCase().includes(q) ||
        course.instructor_name?.toLowerCase().includes(q)
      )
    );
  }, [search, courses]);

  // ====== Styles ======
  const mainStyle: CSSProperties = {
    minHeight: "100vh",
    paddingBottom: 100,
    background: "var(--bg-primary)",
    fontFamily: "var(--font-tajawal), sans-serif",
    position: "relative",
  };

  const containerStyle: CSSProperties = {
    maxWidth: 600,
    margin: "0 auto",
    padding: "24px 20px",
    position: "relative",
    zIndex: 1,
  };

  const titleStyle: CSSProperties = {
    fontSize: 38,
    fontWeight: 800,
    margin: "12px 0",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    lineHeight: 1.3,
  };

  const subtitleStyle: CSSProperties = {
    color: "var(--text-secondary)",
    lineHeight: 1.9,
    fontSize: 16,
    fontWeight: 500,
  };

  const searchSectionStyle: CSSProperties = {
    background: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderRadius: "28px",
    padding: "20px",
    marginBottom: 24,
    boxShadow: "var(--shadow-lg)",
  };

  const searchInputStyle: CSSProperties = {
    width: "100%",
    border: "2px solid var(--border-color)",
    borderRadius: "18px",
    padding: "16px 20px",
    fontSize: 16,
    outline: "none",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    transition: "all 0.3s ease",
    boxShadow: "var(--shadow-xs)",
  };

  const sectionTitleStyle: CSSProperties = {
    fontSize: 26,
    fontWeight: 800,
    margin: 0,
    color: "var(--text-primary)",
    display: "flex",
    alignItems: "center",
    gap: 10,
  };

  const cardStyle: CSSProperties = {
    background: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderRadius: "24px",
    overflow: "hidden",
    boxShadow: "var(--shadow-md)",
    transition: "all 0.4s ease",
    textDecoration: "none",
    color: "var(--text-primary)",
    display: "block",
  };

  const cardImageWrapperStyle: CSSProperties = {
    width: "100%",
    height: 200,
    background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
  };

  const cardContentStyle: CSSProperties = { padding: "22px" };

  const cardTitleStyle: CSSProperties = {
    fontSize: 22,
    fontWeight: 800,
    margin: 0,
    color: "var(--text-primary)",
    lineHeight: 1.4,
  };

  const newBadgeStyle: CSSProperties = {
    background: "linear-gradient(135deg, #f2994a 0%, #f2c94c 100%)",
    color: "white",
    borderRadius: "999px",
    padding: "8px 16px",
    fontWeight: 700,
    fontSize: 13,
    boxShadow: "0 4px 12px rgba(242, 153, 74, 0.35)",
  };

  const activeBadgeStyle: CSSProperties = {
    background: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    color: "white",
    borderRadius: "999px",
    padding: "8px 16px",
    fontWeight: 700,
    fontSize: 13,
    boxShadow: "0 4px 12px rgba(56, 239, 125, 0.35)",
  };

  const instructorStyle: CSSProperties = {
    color: "var(--text-secondary)",
    marginBottom: 10,
    fontSize: 14,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: 6,
  };

  const descriptionStyle: CSSProperties = {
    color: "var(--text-secondary)",
    lineHeight: 1.8,
    marginTop: 0,
    marginBottom: 16,
    fontSize: 14,
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  };

  const statsGridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    marginBottom: 16,
    padding: "14px",
    background: "var(--bg-hover)",
    borderRadius: "14px",
  };

  const statItemStyle: CSSProperties = {
    textAlign: "center",
    fontSize: 13,
    color: "var(--text-muted)",
    fontWeight: 600,
  };

  const statValueStyle: CSSProperties = {
    display: "block",
    fontSize: 15,
    fontWeight: 800,
    color: "var(--text-primary)",
    marginBottom: 2,
  };

  const cardFooterStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    paddingTop: 16,
    borderTop: "1px solid var(--border-color)",
  };

  const priceStyle: CSSProperties = {
    fontSize: 22,
    fontWeight: 800,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  };

  const startButtonStyle: CSSProperties = {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderRadius: "16px",
    padding: "12px 20px",
    fontWeight: 700,
    fontSize: 14,
    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.35)",
    transition: "all 0.3s ease",
    cursor: "pointer",
    border: "none",
  };

  const infoBoxStyle: CSSProperties = {
    background: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderRadius: "20px",
    padding: "22px",
    color: "var(--text-secondary)",
    textAlign: "center",
    boxShadow: "var(--shadow-sm)",
    fontSize: 15,
  };

  const errorBoxStyle: CSSProperties = {
    background: "rgba(245, 87, 108, 0.08)",
    border: "2px solid rgba(245, 87, 108, 0.2)",
    borderRadius: "20px",
    padding: "22px",
    color: "#f5576c",
    textAlign: "center",
    boxShadow: "var(--shadow-sm)",
    fontSize: 15,
    fontWeight: 600,
  };

  const loadingBoxStyle: CSSProperties = {
    ...infoBoxStyle,
    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
    border: "2px solid rgba(102, 126, 234, 0.15)",
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

  const languageToggleStyle: CSSProperties = {
    display: "inline-flex",
    gap: 8,
    background: "var(--bg-hover)",
    padding: "6px",
    borderRadius: "14px",
    border: "1px solid var(--border-color)",
  };

  const langButtonStyle = (active: boolean): CSSProperties => ({
    padding: "8px 14px",
    borderRadius: "10px",
    border: "none",
    background: active ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "transparent",
    color: active ? "white" : "var(--text-secondary)",
    fontWeight: active ? 700 : 600,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: active ? "0 4px 12px rgba(102, 126, 234, 0.25)" : "none",
  });

  const navItemStyle = (active: boolean): CSSProperties => ({
    textDecoration: "none",
    textAlign: "center",
    background: active ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "transparent",
    color: active ? "white" : "var(--text-secondary)",
    padding: "14px 10px",
    borderRadius: "18px",
    fontSize: 13,
    fontWeight: active ? 800 : 600,
    transition: "all 0.3s ease",
    boxShadow: active ? "0 8px 24px rgba(102, 126, 234, 0.35)" : "none",
    transform: active ? "translateY(-2px)" : "translateY(0)",
  });

  // ====== RENDER ======
  return (
    <main style={{ ...mainStyle, direction: dir }}>
      {/* Background decorations */}
      <div style={{
        position: "fixed", top: -150, left: -150, width: 350, height: 350,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        opacity: 0.04, borderRadius: "50%", pointerEvents: "none", zIndex: 0,
      }} />
      <div style={{
        position: "fixed", bottom: 100, right: -100, width: 300, height: 300,
        background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        opacity: 0.04, borderRadius: "50%", pointerEvents: "none", zIndex: 0,
      }} />

      <div style={containerStyle}>
        {/* Header */}
        <header style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div />
            <div style={languageToggleStyle}>
              <button onClick={() => changeLanguage("ar")} style={langButtonStyle(lang === "ar")} type="button">عربي</button>
              <button onClick={() => changeLanguage("en")} style={langButtonStyle(lang === "en")} type="button">EN</button>
            </div>
          </div>
          <h1 style={titleStyle}>{t.homeTitle}</h1>
          <p style={subtitleStyle}>{t.homeSubtitle}</p>
        </header>

        {/* Search */}
        <section style={searchSectionStyle}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`🔍 ${t.searchCourses}`}
            style={searchInputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#667eea"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(102, 126, 234, 0.1)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--border-color)"; e.currentTarget.style.boxShadow = "var(--shadow-xs)"; }}
          />
        </section>

        {/* Courses */}
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
            <h2 style={sectionTitleStyle}>
              <span>📚</span> {t.courses}
              <span style={{ background: "var(--bg-hover)", padding: "4px 12px", borderRadius: "999px", fontSize: 14, fontWeight: 700, color: "var(--text-muted)" }}>
                {filteredCourses.length}
              </span>
            </h2>
          </div>

          {loading ? (
            <div style={loadingBoxStyle}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>⏳</div>
              {t.loadingCourses}
            </div>
          ) : error ? (
            <div style={errorBoxStyle}>
              <div style={{ fontSize: 32, marginBottom: 10 }}>⚠️</div>
              {error}
            </div>
          ) : filteredCourses.length === 0 ? (
            <div style={infoBoxStyle}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              {t.noCourses}
            </div>
          ) : (
            <div style={{ display: "grid", gap: 20 }}>
              {filteredCourses.map((course, index) => (
                <Link key={course.id} href={`/courses/${course.id}`} style={cardStyle}>
                  <div style={cardImageWrapperStyle}>
                    {course.image_url ? (
                      <img src={course.image_url} alt={course.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ fontSize: 64, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>📘</div>
                    )}
                    <div style={{ position: "absolute", top: 14, right: 14 }}>
                      {course.is_new ? <span style={newBadgeStyle}>✨ {t.new}</span> : <span style={activeBadgeStyle}>✅ متاح</span>}
                    </div>
                  </div>

                  <div style={cardContentStyle}>
                    <h3 style={cardTitleStyle}>{course.title}</h3>
                    <div style={instructorStyle}><span>👨‍🏫</span> {t.instructorBy} <strong>{course.instructor_name}</strong></div>
                    <p style={descriptionStyle}>{course.description || t.noDescription}</p>

                    <div style={statsGridStyle}>
                      <div style={statItemStyle}><span style={statValueStyle}>⭐ {course.rating ?? 0}</span>{t.rating}</div>
                      <div style={statItemStyle}><span style={statValueStyle}>👥 {course.students_count ?? 0}</span>{t.students}</div>
                      <div style={statItemStyle}><span style={statValueStyle}>⏱️ {course.duration || "-"}</span>{t.duration}</div>
                    </div>

                    <div style={cardFooterStyle}>
                      <div style={priceStyle}>{course.is_free ? <span>{t.free} 💚</span> : <span>{course.price} {course.currency || "π"}</span>}</div>
                      <button style={startButtonStyle}>{t.startNow} →</button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Navigation */}
      <nav style={navStyle}>
        <Link href="/profile" style={navItemStyle(false)}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>👤</div>
          {t.profile}
        </Link>
        <Link href="/create-course" style={navItemStyle(false)}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>➕</div>
          {t.createCourse}
        </Link>
        <Link href="/" style={navItemStyle(true)}>
          <div style={{ fontSize: 20, marginBottom: 4 }}>🏠</div>
          {t.home}
        </Link>
      </nav>
    </main>
  );
}
