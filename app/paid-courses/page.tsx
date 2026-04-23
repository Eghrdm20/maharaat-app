"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getDirection, type Lang } from "@/lib/i18n";

type CachedPiUser = {
  uid: string;
  username: string;
};

type PaidCourse = {
  id: number;
  title: string;
  description: string | null;
  instructor_name: string;
  image_url: string | null;
  duration: string | null;
  rating: number | null;
  students_count: number | null;
  paid_amount: number | string | null;
  paid_currency: string | null;
  purchase_created_at: string;
};

export default function PaidCoursesPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const [piUser, setPiUser] = useState<CachedPiUser | null>(null);
  const [courses, setCourses] = useState<PaidCourse[]>([]);
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
    const loadPaidCourses = async () => {
      if (!piUser?.uid) return;

      try {
        setLoading(true);
        setStatus("");

        const res = await fetch(
          `/api/paid-courses?uid=${encodeURIComponent(piUser.uid)}`,
          { cache: "no-store" }
        );

        const json = await res.json();

        if (!res.ok || !json?.ok) {
          throw new Error(
            json?.error ||
              (lang === "ar" ? "فشل تحميل الدورات المدفوعة" : "Failed to load paid courses")
          );
        }

        setCourses(Array.isArray(json.courses) ? json.courses : []);
      } catch (error: any) {
        setStatus(
          error?.message ||
            (lang === "ar" ? "فشل تحميل الدورات المدفوعة" : "Failed to load paid courses")
        );
      } finally {
        setLoading(false);
      }
    };

    void loadPaidCourses();
  }, [piUser?.uid, lang]);

  const pageStyle: CSSProperties = {
    minHeight: "100vh",
    paddingBottom: 100,
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

  const actionButtonStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
    padding: "0 22px",
    borderRadius: 18,
    background: "linear-gradient(135deg, #5b7cff 0%, #7c4dff 100%)",
    color: "#fff",
    textDecoration: "none",
    fontWeight: 800,
    fontSize: 16,
    boxShadow: "0 12px 24px rgba(91,124,255,0.25)",
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
            {lang === "ar" ? "← العودة إلى الملف الشخصي" : "← Back to Profile"}
          </Link>
        </div>

        <section style={heroStyle}>
          <h1 style={{ fontSize: 36, fontWeight: 900, margin: "0 0 10px" }}>
            {lang === "ar" ? "الدورات المدفوعة" : "Paid Courses"}
          </h1>
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.9, color: "rgba(255,255,255,0.82)" }}>
            {lang === "ar"
              ? "كل الدورات التي اشتريتها ستظهر هنا ويمكنك فتحها مباشرة"
              : "All purchased courses appear here and can be opened مباشرة"}
          </p>
        </section>

        {!piUser ? (
          <div style={infoBoxStyle}>
            {lang === "ar"
              ? "يجب ربط حساب Pi أولًا حتى تظهر الدورات المدفوعة"
              : "Connect Pi first to view paid courses"}
          </div>
        ) : loading ? (
          <div style={infoBoxStyle}>
            {lang === "ar" ? "جاري تحميل الدورات المدفوعة..." : "Loading paid courses..."}
          </div>
        ) : status ? (
          <div style={infoBoxStyle}>{status}</div>
        ) : courses.length === 0 ? (
          <div style={infoBoxStyle}>
            {lang === "ar"
              ? "لا توجد لديك دورات مدفوعة حتى الآن"
              : "You do not have paid courses yet"}
          </div>
        ) : (
          courses.map((course) => (
            <div key={course.id} style={cardStyle}>
              <img
                src={course.image_url || "/placeholder.svg"}
                alt={course.title}
                style={imageStyle}
              />

              <div style={{ padding: 20 }}>
                <h2 style={{ fontSize: 30, fontWeight: 900, margin: "0 0 10px", color: "#0f172a" }}>
                  {course.title}
                </h2>

                <div style={{ color: "#64748b", fontSize: 16, marginBottom: 10 }}>
                  {lang === "ar" ? "بواسطة" : "By"} {course.instructor_name}
                </div>

                <div style={{ color: "#475569", lineHeight: 1.9, marginBottom: 14 }}>
                  {course.description || (lang === "ar" ? "لا يوجد وصف" : "No description")}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
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
                      {course.paid_amount || 0} {course.paid_currency || "PI"}
                    </div>
                    <div style={{ color: "#64748b", fontSize: 13 }}>
                      {lang === "ar" ? "المبلغ المدفوع" : "Paid"}
                    </div>
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
                    <div style={{ color: "#64748b", fontSize: 13 }}>
                      {lang === "ar" ? "المدة" : "Duration"}
                    </div>
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
                    <div style={{ color: "#64748b", fontSize: 13 }}>
                      {lang === "ar" ? "التقييم" : "Rating"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                  <div style={{ color: "#64748b", fontSize: 14 }}>
                    {lang === "ar" ? "تاريخ الشراء:" : "Purchased at:"}{" "}
                    {new Date(course.purchase_created_at).toLocaleDateString()}
                  </div>

                  <Link href={`/courses/${course.id}`} style={actionButtonStyle}>
                    {lang === "ar" ? "فتح محتوى الدورة" : "Open Course"}
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
                      }
