"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getDirection, type Lang } from "@/lib/i18n";

type CachedPiUser = {
  uid: string;
  username: string;
};

type EarningsState = {
  totalSales: number;
  totalGross: number;
  totalNet: number;
  currency: string;
};

function FloatingShape({ style }: { style?: CSSProperties }) {
  return (
    <div
      style={{
        position: "absolute",
        borderRadius: "50%",
        filter: "blur(10px)",
        opacity: 0.55,
        pointerEvents: "none",
        ...style,
      }}
    />
  );
}

function MenuCard({
  href,
  title,
  subtitle,
  icon,
}: {
  href: string;
  title: string;
  subtitle: string;
  icon: string;
}) {
  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
        padding: "20px 18px",
        minHeight: 96,
        borderRadius: 28,
        textDecoration: "none",
        color: "#0f172a",
        background:
          "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(245,247,255,0.88))",
        border: "1px solid rgba(255,255,255,0.75)",
        boxShadow:
          "0 18px 40px rgba(76, 81, 191, 0.12), inset 0 1px 0 rgba(255,255,255,0.8), inset 0 -1px 0 rgba(148,163,184,0.08)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        marginBottom: 16,
      }}
    >
      <div style={{ flex: 1 }}>
        <div
          style={{
            fontSize: 24,
            fontWeight: 900,
            marginBottom: 4,
            color: "#0b1736",
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 14,
            color: "#64748b",
            fontWeight: 600,
          }}
        >
          {subtitle}
        </div>
      </div>

      <div
        style={{
          width: 58,
          height: 58,
          borderRadius: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          background:
            "linear-gradient(145deg, rgba(109,140,255,0.18), rgba(139,92,246,0.18))",
          boxShadow:
            "inset 0 1px 0 rgba(255,255,255,0.75), 0 10px 24px rgba(99,102,241,0.16)",
        }}
      >
        {icon}
      </div>
    </Link>
  );
}

export default function ProfilePage() {
  const [lang, setLang] = useState<Lang>("ar");
  const [piUser, setPiUser] = useState<CachedPiUser | null>(null);
  const [earnings, setEarnings] = useState<EarningsState>({
    totalSales: 0,
    totalGross: 0,
    totalNet: 0,
    currency: "PI",
  });
  const [earningsLoading, setEarningsLoading] = useState(true);

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

  useEffect(() => {
    const loadEarnings = async () => {
      if (!piUser?.uid) {
        setEarningsLoading(false);
        setEarnings({
          totalSales: 0,
          totalGross: 0,
          totalNet: 0,
          currency: "PI",
        });
        return;
      }

      try {
        setEarningsLoading(true);

        const res = await fetch(
          `/api/earnings?uid=${encodeURIComponent(piUser.uid)}`,
          { cache: "no-store" }
        );

        const json = await res.json();

        if (!res.ok || !json?.ok) {
          throw new Error(json?.error || "Failed to load earnings");
        }

        setEarnings({
          totalSales: json.totalSales || 0,
          totalGross: json.totalGross || 0,
          totalNet: json.totalNet || 0,
          currency: json.currency || "PI",
        });
      } catch (error) {
        console.error("Failed to load earnings:", error);
        setEarnings({
          totalSales: 0,
          totalGross: 0,
          totalNet: 0,
          currency: "PI",
        });
      } finally {
        setEarningsLoading(false);
      }
    };

    loadEarnings();
  }, [piUser?.uid]);

  const handleLogout = () => {
    window.localStorage.removeItem("pi_user");
    setPiUser(null);
    setEarnings({
      totalSales: 0,
      totalGross: 0,
      totalNet: 0,
      currency: "PI",
    });
  };

  const text = {
    ar: {
      title: "الملف الشخصي",
      subtitle: "إدارة حسابك والوصول السريع لكل أدوات المنصة",
      piTitle: "حساب Pi",
      connected: "تم ربط الحساب بنجاح",
      notConnected: "لم يتم ربط حساب Pi بعد",
      username: "اسم المستخدم",
      logout: "تسجيل الخروج",
      connectPi: "ربط حساب Pi",

      earningsTitle: "أرباحي",
      earningsLoading: "جاري تحميل الأرباح...",
      totalSales: "عدد المبيعات",
      totalGross: "الإجمالي",
      totalNet: "صافي الأرباح",

      myCourses: "دوراتي",
      myCoursesSub: "راجع الدورات التي أنشأتها أو التحقت بها",

      courses: "الدورات",
      coursesSub: "كل الدورات المرئية والملفات",

      writtenCourses: "الدورات المكتوبة",
      writtenCoursesSub: "كل الدورات النصية داخل الصفحة",

      browseCourses: "استكشاف الدورات",
      browseCoursesSub: "اكتشف محتوى جديد ومميز",

      createCourse: "أنشئ دورة",
      createCourseSub: "ابدأ ببناء دورتك التعليمية",

      createWrittenCourse: "دورة مكتوبة",
      createWrittenCourseSub: "أنشئ محتوى نصي منظم وجاهز للنشر",

      visitorDashboard: "لوحة الزوار",
      visitorDashboardSub: "عرض مختصر لتفاعل المستخدمين",

      addNews: "إضافة الأخبار",
      addNewsSub: "انشر جديد المنصة والمقالات",

      home: "الرئيسية",
      profile: "الملف",
    },
    en: {
      title: "Profile",
      subtitle: "Manage your account and access platform tools quickly",
      piTitle: "Pi Account",
      connected: "Account connected successfully",
      notConnected: "Pi account not connected yet",
      username: "Username",
      logout: "Log out",
      connectPi: "Connect Pi",

      earningsTitle: "My Earnings",
      earningsLoading: "Loading earnings...",
      totalSales: "Sales",
      totalGross: "Gross",
      totalNet: "Net",

      myCourses: "My Courses",
      myCoursesSub: "Review your created and enrolled courses",

      courses: "Courses",
      coursesSub: "All media courses",

      writtenCourses: "Written Courses",
      writtenCoursesSub: "All article-based courses",

      browseCourses: "Browse Courses",
      browseCoursesSub: "Discover new and featured content",

      createCourse: "Create Course",
      createCourseSub: "Start building your learning experience",

      createWrittenCourse: "Written Course",
      createWrittenCourseSub: "Create structured text content",

      visitorDashboard: "Visitor Dashboard",
      visitorDashboardSub: "See audience activity and stats",

      addNews: "Add News",
      addNewsSub: "Publish updates and articles",

      home: "Home",
      profile: "Profile",
    },
  }[lang];

  const pageStyle: CSSProperties = {
    minHeight: "100vh",
    paddingBottom: 120,
    background:
      "radial-gradient(circle at top left, rgba(129,140,248,0.22), transparent 30%), radial-gradient(circle at top right, rgba(168,85,247,0.18), transparent 28%), linear-gradient(180deg, #f8faff 0%, #eef2ff 55%, #f5f7ff 100%)",
    fontFamily: "var(--font-tajawal), sans-serif",
    position: "relative",
    overflow: "hidden",
  };

  const containerStyle: CSSProperties = {
    maxWidth: 760,
    margin: "0 auto",
    padding: "28px 18px",
    position: "relative",
    zIndex: 2,
  };

  const heroStyle: CSSProperties = {
    position: "relative",
    padding: "28px 22px",
    borderRadius: 34,
    marginBottom: 22,
    background:
      "linear-gradient(145deg, rgba(12,23,66,0.96), rgba(54,78,180,0.90) 55%, rgba(139,92,246,0.88))",
    boxShadow:
      "0 24px 60px rgba(37, 45, 120, 0.28), inset 0 1px 0 rgba(255,255,255,0.18)",
    color: "#fff",
    overflow: "hidden",
  };

  const heroGlowStyle: CSSProperties = {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.25), transparent 70%)",
    top: -90,
    right: -40,
    pointerEvents: "none",
  };

  const heroGlowStyle2: CSSProperties = {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(255,255,255,0.18), transparent 70%)",
    bottom: -60,
    left: -30,
    pointerEvents: "none",
  };

  const titleStyle: CSSProperties = {
    fontSize: 42,
    fontWeight: 900,
    lineHeight: 1.05,
    marginBottom: 10,
    position: "relative",
    zIndex: 1,
  };

  const subtitleStyle: CSSProperties = {
    fontSize: 16,
    lineHeight: 1.8,
    color: "rgba(255,255,255,0.82)",
    position: "relative",
    zIndex: 1,
    maxWidth: 460,
  };

  const sectionStyle: CSSProperties = {
    position: "relative",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.94), rgba(247,249,255,0.88))",
    borderRadius: 32,
    padding: 22,
    boxShadow:
      "0 22px 46px rgba(76, 81, 191, 0.12), inset 0 1px 0 rgba(255,255,255,0.85)",
    border: "1px solid rgba(255,255,255,0.78)",
    marginBottom: 20,
    overflow: "hidden",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
  };

  const sectionGlow: CSSProperties = {
    position: "absolute",
    width: 140,
    height: 140,
    borderRadius: "50%",
    background:
      "radial-gradient(circle, rgba(99,102,241,0.12), rgba(99,102,241,0.02), transparent 70%)",
    top: -30,
    left: -20,
    pointerEvents: "none",
  };

  const cardTitleStyle: CSSProperties = {
    fontSize: 32,
    fontWeight: 900,
    color: "#0b1736",
    marginBottom: 12,
    position: "relative",
    zIndex: 1,
  };

  const statusStyle: CSSProperties = {
    fontSize: 18,
    color: "#64748b",
    marginBottom: 16,
    lineHeight: 1.8,
    position: "relative",
    zIndex: 1,
  };

  const userBoxStyle: CSSProperties = {
    background:
      "linear-gradient(145deg, rgba(16,185,129,0.10), rgba(52,211,153,0.12))",
    border: "1px solid rgba(16,185,129,0.16)",
    color: "#065f46",
    borderRadius: 24,
    padding: "18px 16px",
    marginBottom: 18,
    fontSize: 17,
    lineHeight: 1.9,
    fontWeight: 700,
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.75)",
    position: "relative",
    zIndex: 1,
  };

  const primaryButtonStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px 26px",
    minWidth: 190,
    minHeight: 62,
    borderRadius: 24,
    border: "none",
    textDecoration: "none",
    cursor: "pointer",
    fontSize: 20,
    fontWeight: 900,
    color: "#fff",
    background: "linear-gradient(135deg, #5b7cff 0%, #7c4dff 100%)",
    boxShadow:
      "0 16px 28px rgba(91,124,255,0.28), inset 0 1px 0 rgba(255,255,255,0.30), inset 0 -2px 0 rgba(0,0,0,0.08)",
  };

  const secondaryButtonStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px 24px",
    minWidth: 180,
    minHeight: 60,
    borderRadius: 24,
    border: "1px solid rgba(148,163,184,0.26)",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 900,
    color: "#0f172a",
    background:
      "linear-gradient(145deg, rgba(255,255,255,0.95), rgba(241,245,249,0.9))",
    boxShadow:
      "0 12px 24px rgba(15,23,42,0.08), inset 0 1px 0 rgba(255,255,255,0.95)",
  };

  const bottomNavStyle: CSSProperties = {
    position: "fixed",
    bottom: 0,
    left: 0,
    right: 0,
    padding: "12px 14px max(12px, env(safe-area-inset-bottom))",
    background: "rgba(255,255,255,0.72)",
    backdropFilter: "blur(18px)",
    WebkitBackdropFilter: "blur(18px)",
    borderTop: "1px solid rgba(255,255,255,0.65)",
    zIndex: 50,
  };

  const navWrapStyle: CSSProperties = {
    maxWidth: 760,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 10,
    background: "rgba(255,255,255,0.55)",
    borderRadius: 28,
    padding: 8,
    boxShadow:
      "0 12px 30px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,0.72)",
  };

  const navItemStyle = (active: boolean): CSSProperties => ({
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 62,
    borderRadius: 22,
    textDecoration: "none",
    fontWeight: 900,
    fontSize: 18,
    color: active ? "#fff" : "#0f172a",
    background: active
      ? "linear-gradient(135deg, #08153c 0%, #0f245f 100%)"
      : "transparent",
    boxShadow: active ? "0 14px 26px rgba(8,21,60,0.24)" : "none",
  });

  return (
    <main style={pageStyle} dir={dir}>
      <FloatingShape
        style={{
          width: 180,
          height: 180,
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.40), rgba(139,92,246,0.25))",
          top: 80,
          left: -50,
        }}
      />
      <FloatingShape
        style={{
          width: 220,
          height: 220,
          background:
            "linear-gradient(135deg, rgba(59,130,246,0.28), rgba(16,185,129,0.20))",
          top: 420,
          right: -80,
        }}
      />
      <FloatingShape
        style={{
          width: 160,
          height: 160,
          background:
            "linear-gradient(135deg, rgba(236,72,153,0.22), rgba(168,85,247,0.20))",
          bottom: 120,
          left: -40,
        }}
      />

      <div style={containerStyle}>
        <section style={heroStyle}>
          <div style={heroGlowStyle} />
          <div style={heroGlowStyle2} />
          <div style={titleStyle}>{text.title}</div>
          <div style={subtitleStyle}>{text.subtitle}</div>
        </section>

        <section style={sectionStyle}>
          <div style={sectionGlow} />
          <div style={cardTitleStyle}>{text.piTitle}</div>

          <div style={statusStyle}>
            {piUser ? text.connected : text.notConnected}
          </div>

          {piUser ? (
            <>
              <div style={userBoxStyle}>
                <div>
                  {text.username}: {piUser.username}
                </div>
                <div>UID: {piUser.uid}</div>
              </div>

              <button onClick={handleLogout} style={secondaryButtonStyle}>
                {text.logout}
              </button>
            </>
          ) : (
            <Link href="/profile" style={primaryButtonStyle}>
              {text.connectPi}
            </Link>
          )}
        </section>

        <section style={sectionStyle}>
          <div style={sectionGlow} />
          <div style={cardTitleStyle}>{text.earningsTitle}</div>

          {earningsLoading ? (
            <div style={statusStyle}>{text.earningsLoading}</div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(
