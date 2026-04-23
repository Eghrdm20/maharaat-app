"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getDirection, type Lang } from "@/lib/i18n";

type CachedPiUser = {
  uid: string;
  username: string;
};

export default function ProfilePage() {
  const [lang, setLang] = useState<Lang>("ar");
  const [piUser, setPiUser] = useState<CachedPiUser | null>(null);

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

  const handleLogout = () => {
    window.localStorage.removeItem("pi_user");
    setPiUser(null);
  };

  const text = {
    ar: {
      title: "الملف الشخصي",
      piTitle: "ربط حساب Pi",
      connected: "الحالة: تم استرجاع الحساب المحفوظ",
      notConnected: "الحالة: لم يتم ربط حساب Pi بعد",
      username: "اسم مستخدم Pi",
      logout: "تسجيل الخروج",
      myCourses: "دوراتي",
      browseCourses: "استكشاف الدورات",
      createCourse: "أنشئ دورة",
      createWrittenCourse: "إنشاء دورة مكتوبة",
      visitorDashboard: "لوحة الزوار",
      addNews: "إضافة الأخبار",
      home: "الرئيسية",
      profile: "الملف الشخصي",
    },
    en: {
      title: "Profile",
      piTitle: "Pi Account",
      connected: "Status: Restored saved account",
      notConnected: "Status: Pi account not connected yet",
      username: "Pi Username",
      logout: "Log out",
      myCourses: "My Courses",
      browseCourses: "Browse Courses",
      createCourse: "Create Course",
      createWrittenCourse: "Create Written Course",
      visitorDashboard: "Visitor Dashboard",
      addNews: "Add News",
      home: "Home",
      profile: "Profile",
    },
  }[lang];

  const pageStyle: CSSProperties = {
    minHeight: "100vh",
    paddingBottom: 110,
    background: "var(--bg-primary)",
    fontFamily: "var(--font-tajawal), sans-serif",
  };

  const containerStyle: CSSProperties = {
    maxWidth: 720,
    margin: "0 auto",
    padding: "20px 16px",
  };

  const titleStyle: CSSProperties = {
    fontSize: 34,
    fontWeight: 900,
    color: "var(--text-primary)",
    marginBottom: 20,
    textAlign: "right",
  };

  const sectionStyle: CSSProperties = {
    background: "var(--bg-card)",
    borderRadius: 28,
    padding: 20,
    boxShadow: "var(--shadow-md)",
    marginBottom: 18,
    border: "1px solid var(--border-color)",
  };

  const cardTitleStyle: CSSProperties = {
    fontSize: 26,
    fontWeight: 900,
    color: "#0f172a",
    marginBottom: 18,
  };

  const statusBoxStyle: CSSProperties = {
    background: "rgba(16, 185, 129, 0.12)",
    border: "1px solid rgba(16, 185, 129, 0.22)",
    color: "#065f46",
    borderRadius: 22,
    padding: "18px 16px",
    marginBottom: 18,
    lineHeight: 1.9,
    fontSize: 16,
  };

  const ghostButtonStyle: CSSProperties = {
    width: "fit-content",
    minWidth: 170,
    padding: "18px 22px",
    borderRadius: 22,
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#0f172a",
    fontSize: 18,
    fontWeight: 900,
    cursor: "pointer",
  };

  const menuLinkStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 92,
    padding: "0 24px",
    borderRadius: 28,
    background: "var(--bg-card)",
    color: "var(--text-primary)",
    textDecoration: "none",
    fontSize: 22,
    fontWeight: 900,
    boxShadow: "var(--shadow-sm)",
    marginBottom: 18,
    border: "1px solid var(--border-color)",
  };

  const bottomNavStyle: CSSProperties = {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    background: "rgba(255,255,255,0.96)",
    borderTop: "1px solid #e5e7eb",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    padding: "12px 14px max(12px, env(safe-area-inset-bottom))",
    gap: 10,
    zIndex: 50,
  };

  const navItemStyle = (active: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 64,
    borderRadius: 22,
    textDecoration: "none",
    fontWeight: 900,
    fontSize: 18,
    background: active ? "#08122f" : "transparent",
    color: active ? "#fff" : "#111827",
  });

  return (
    <main style={pageStyle} dir={dir}>
      <div style={containerStyle}>
        <h1 style={titleStyle}>{text.title}</h1>

        <section style={sectionStyle}>
          <div style={cardTitleStyle}>{text.piTitle}</div>

          <div style={{ color: "var(--text-secondary)", fontSize: 18, marginBottom: 14 }}>
            {piUser ? text.connected : text.notConnected}
          </div>

          {piUser ? (
            <>
              <div style={statusBoxStyle}>
                <div>
                  {text.username}: {piUser.username}
                </div>
                <div>UID: {piUser.uid}</div>
              </div>

              <button onClick={handleLogout} style={ghostButtonStyle}>
                {text.logout}
              </button>
            </>
          ) : (
            <Link href="/profile" style={{ ...ghostButtonStyle, display: "inline-flex", textDecoration: "none", alignItems: "center", justifyContent: "center" }}>
              ربط حساب Pi
            </Link>
          )}
        </section>

        <Link href="/my-courses" style={menuLinkStyle}>
          <span>{text.myCourses}</span>
        </Link>

        <Link href="/" style={menuLinkStyle}>
          <span>{text.browseCourses}</span>
        </Link>

        <Link href="/create-course" style={menuLinkStyle}>
          <span>{text.createCourse}</span>
        </Link>

        <Link href="/create-written-course" style={menuLinkStyle}>
          <span>{text.createWrittenCourse}</span>
        </Link>

        <Link href="/visitor-dashboard" style={menuLinkStyle}>
          <span>{text.visitorDashboard}</span>
        </Link>

        <Link href="/create-news" style={menuLinkStyle}>
          <span>{text.addNews}</span>
        </Link>
      </div>

      <nav style={bottomNavStyle}>
        <Link href="/" style={navItemStyle(false)}>
          {text.home}
        </Link>

        <Link href="/create-course" style={navItemStyle(false)}>
          {text.createCourse}
        </Link>

        <Link href="/profile" style={navItemStyle(true)}>
          {text.profile}
        </Link>
      </nav>
    </main>
  );
}
