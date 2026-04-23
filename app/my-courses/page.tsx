"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getDirection, type Lang } from "@/lib/i18n";

type CachedPiUser = {
  uid: string;
  username: string;
};

type CourseItem = {
  id: number;
  title: string;
  description: string | null;
  instructor_name: string | null;
  duration: string | null;
  price: number | string | null;
  currency: string | null;
  is_free: boolean;
  image_url: string | null;
  video_url: string | null;
  file_url: string | null;
  students_count: number | null;
  rating: number | null;
  is_new: boolean | null;
  created_at?: string | null;
};

export default function MyCoursesPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const [piUser, setPiUser] = useState<CachedPiUser | null>(null);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  const dir = useMemo(() => getDirection(lang), [lang]);

  useEffect(() => {
    const savedLang = (window.localStorage.getItem("app_lang") as Lang) || "ar";
    setLang(savedLang);
    document.documentElement.lang = savedLang;
    document.documentElement.dir = getDirection(savedLang);

    const cachedUser = window.localStorage.getItem("pi_user");
    if (!cachedUser) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(cachedUser);
      if (parsed?.uid && parsed?.username) {
        setPiUser(parsed);
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadCourses = async () => {
      if (!piUser?.uid) return;

      try {
        setLoading(true);
        setStatus("");

        const res = await fetch(
          `/api/courses?uid=${encodeURIComponent(piUser.uid)}`,
          { cache: "no-store" }
        );

        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json?.ok) {
          throw new Error(
            json?.error ||
              (lang === "ar" ? "فشل تحميل دوراتك" : "Failed to load your courses")
          );
        }

        setCourses(Array.isArray(json.courses) ? json.courses : []);
      } catch (error: any) {
        console.error(error);
        setStatus(
          error?.message ||
            (lang === "ar" ? "فشل تحميل دوراتك" : "Failed to load your courses")
        );
      } finally {
        setLoading(false);
      }
    };

    void loadCourses();
  }, [piUser?.uid, lang]);

  const text = {
    ar: {
      back: "← العودة إلى الملف الشخصي",
      title: "دوراتي",
      subtitle: "كل الدورات التي أنشأتها تظهر هنا بعد النشر",
      mustLogin: "يجب ربط حساب Pi أولًا لعرض دوراتك",
      loading: "جاري تحميل دوراتك...",
      empty: "لا توجد لديك دورات منشورة حتى الآن",
      by: "بواسطة",
      free: "مجاني",
      price: "السعر",
      duration: "المدة",
      students: "الطلاب",
      rating: "التقييم",
      hasImage: "يوجد صورة",
      hasVideo: "يوجد فيديو",
      hasFile: "يوجد ملف",
      noImage: "لا توجد صورة",
      noVideo: "لا يوجد فيديو",
      noFile: "لا يوجد ملف",
      openCourse: "فتح صفحة الدورة",
      openVideo: "فتح الفيديو",
      openFile: "فتح الملف",
      newBadge: "جديد",
      home: "الرئيسية",
      createCourse: "أنشئ دورة",
      profile: "الملف",
    },
    en: {
      back: "← Back to Profile",
      title: "My Courses",
      subtitle: "All courses you created appear here after publishing",
      mustLogin: "Connect Pi first to view your courses",
      loading: "Loading your courses...",
      empty: "You do not have published courses yet",
      by: "By",
      free: "Free",
      price: "Price",
      duration: "Duration",
      students: "Students",
      rating: "Rating",
      hasImage: "Has image",
      hasVideo: "Has video",
      hasFile: "Has file",
      noImage: "No image",
      noVideo: "No video",
      noFile: "No file",
      openCourse: "Open Course Page",
      openVideo: "Open Video",
      openFile: "Open File",
      newBadge: "New",
      home: "Home",
      createCourse: "Create Course",
      profile: "Profile",
    },
  }[lang];

  const pageStyle: CSSProperties = {
    minHeight: "100vh",
    paddingBottom: 110,
    background:
      "radial-gradient(circle at top left, rgba(129,140,248,0.18), transparent 30%), linear-gradient(180deg, #f8faff 0%, #eef2ff 55%, #f5f7ff 100%)",
    fontFamily: "var(--font-tajawal), sans-serif",
  };

  const containerStyle: CSSProperties = {
    maxWidth: 760,
    margin: "0 auto",
    padding: "24px 18px",
  };

  const heroStyle: CSSProperties = {
    background: "linear-gradient(145deg, rgba(12,23,66,0.96), rgba(86,100,210,0.92))",
    borderRadius: 30,
    padding: "26px 22px",
    color: "#fff",
    marginBottom: 20,
    boxShadow: "0 24px 60px rgba(37, 45, 120, 0.22)",
  };

  const cardStyle: CSSProperties = {
    background: "rgba(255,255,255,0.94)",
    borderRadius: 28,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.7)",
    boxShadow: "0 18px 40px rgba(76, 81, 191, 0.12)",
    marginBottom: 18,
  };

  const imageStyle: CSSProperties = {
    width: "100%",
    height: 220,
    objectFit: "cover",
    display: "block",
    background: "#eef2ff",
  };

  const infoBoxStyle: CSSProperties = {
    background: "rgba(255,255,255,0.92)",
    borderRadius: 22,
    padding: 20,
    color: "#64748b",
    fontWeight: 700,
    textAlign: "center",
    boxShadow: "0 12px 30px rgba(15,23,42,0.06)",
  };

  const chipStyle = (active: boolean): CSSProperties => ({
    padding: "10px 14px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 800,
    background: active ? "rgba(16,185,129,0.10)" : "rgba(148,163,184,0.10)",
    color: active ? "#047857" : "#64748b",
    border: active
      ? "1px solid rgba(16,185,129,0.20)"
      : "1px solid rgba(148,163,184,0.18)",
  });

  const actionPrimaryStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
    padding: "0 18px",
    borderRadius: 18,
    background: "linear-gradient(135deg, #5b7cff 0%, #7c4dff 100%)",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 800,
    fontSize: 15,
    boxShadow: "0 12px 24px rgba(91,124,255,0.25)",
    border: "none",
    cursor: "pointer",
  };

  const actionSecondaryStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    padding: "0 16px",
    borderRadius: 16,
    background: "rgba(255,255,255,0.96)",
    color: "#0f172a",
    textDecoration: "none",
    fontWeight: 800,
    fontSize: 14,
    border: "1px solid rgba(148,163,184,0.22)",
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
      <div style={containerStyle}>
        <div style={{ marginBottom: 16 }}>
          <Link
            href="/profile"
            style={{
              textDecoration: "none",
              color: "#64748b",
              fontWeight: 800,
            }}
          >
            {text.back}
          </Link>
        </div>

        <section style={heroStyle}>
          <h1 style={{ fontSize: 36, fontWeight: 900, margin: "0 0 10px" }}>
            {text.title}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 16,
              lineHeight: 1.9,
              color: "rgba(255,255,255,0.82)",
            }}
          >
            {text.subtitle}
          </p>
        </section>

        {!piUser ? (
          <div style={infoBoxStyle}>{text.mustLogin}</div>
        ) : loading ? (
          <div style={infoBoxStyle}>{text.loading}</div>
        ) : status ? (
          <div style={infoBoxStyle}>{status}</div>
        ) : courses.length === 0 ? (
          <div style={infoBoxStyle}>{text.empty}</div>
        ) : (
          courses.map((course) => (
            <div key={course.id} style={cardStyle}>
              <img
                src={course.image_url || "/placeholder.svg"}
                alt={course.title}
                style={imageStyle}
              />

              <div style={{ padding: 20 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    alignItems: "flex-start",
                    marginBottom: 10,
                    flexWrap: "wrap",
                  }}
                >
                  <h2
                    style={{
                      fontSize: 30,
                      fontWeight: 900,
                      margin: 0,
                      color: "#0f172a",
                    }}
                  >
                    {course.title}
                  </h2>

                  {course.is_new ? (
                    <div
                      style={{
                        padding: "8px 14px",
                        borderRadius: 999,
                        background: "linear-gradient(135deg, #f59e0b 0%, #facc15 100%)",
                        color: "#fff",
                        fontWeight: 900,
                        fontSize: 13,
                      }}
                    >
                      {text.newBadge}
                    </div>
                  ) : null}
                </div>

                <div style={{ color: "#64748b", fontSize: 16, marginBottom: 10 }}>
                  {text.by} {course.instructor_name || "-"}
                </div>

                <div style={{ color: "#475569", lineHeight: 1.9, marginBottom: 16 }}>
                  {course.description || (lang === "ar" ? "لا يوجد وصف" : "No description")}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                    gap: 10,
                    marginBottom: 16,
                  }}
                >
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: 16,
                      padding: 12,
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: 18, color: "#0f172a" }}>
                      {course.is_free
                        ? text.free
                        : `${course.price || 0} ${course.currency || "PI"}`}
                    </div>
                    <div style={{ color: "#64748b", fontSize: 13 }}>{text.price}</div>
                  </div>

                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: 16,
                      padding: 12,
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: 18, color: "#0f172a" }}>
                      {course.duration || "-"}
                    </div>
                    <div style={{ color: "#64748b", fontSize: 13 }}>{text.duration}</div>
                  </div>

                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: 16,
                      padding: 12,
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: 18, color: "#0f172a" }}>
                      {course.students_count ?? 0}
                    </div>
                    <div style={{ color: "#64748b", fontSize: 13 }}>{text.students}</div>
                  </div>

                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: 16,
                      padding: 12,
                      textAlign: "center",
                    }}
                  >
                    <div style={{ fontWeight: 900, fontSize: 18, color: "#0f172a" }}>
                      {course.rating ?? 0}
                    </div>
                    <div style={{ color: "#64748b", fontSize: 13 }}>{text.rating}</div>
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    marginBottom: 18,
                  }}
                >
                  <div style={chipStyle(!!course.image_url)}>
                    {course.image_url ? text.hasImage : text.noImage}
                  </div>
                  <div style={chipStyle(!!course.video_url)}>
                    {course.video_url ? text.hasVideo : text.noVideo}
                  </div>
                  <div style={chipStyle(!!course.file_url)}>
                    {course.file_url ? text.hasFile : text.noFile}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <Link href={`/courses/${course.id}`} style={actionPrimaryStyle}>
                    {text.openCourse}
                  </Link>

                  {course.video_url ? (
                    <a
                      href={course.video_url}
                      target="_blank"
                      rel="noreferrer"
                      style={actionSecondaryStyle}
                    >
                      {text.openVideo}
                    </a>
                  ) : null}

                  {course.file_url ? (
                    <a
                      href={course.file_url}
                      target="_blank"
                      rel="noreferrer"
                      style={actionSecondaryStyle}
                    >
                      {text.openFile}
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <nav style={bottomNavStyle}>
        <div style={navWrapStyle}>
          <Link href="/" style={navItemStyle(false)}>
            {text.home}
          </Link>

          <Link href="/create-course" style={navItemStyle(false)}>
            {text.createCourse}
          </Link>

          <Link href="/profile" style={navItemStyle(true)}>
            {text.profile}
          </Link>
        </div>
      </nav>
    </main>
  );
}
