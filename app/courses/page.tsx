"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { translations, type Lang, getDirection } from "@/lib/i18n";

type Course = {
  id: number;
  title: string;
  description: string | null;
  instructor_name: string;
  image_url: string | null;
  duration: string | null;
  students_count: number | null;
  rating: number | null;
  is_free: boolean;
  price: number | string | null;
  currency: string | null;
  content_type?: string | null;
};

export default function CoursesPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const t = translations[lang];
  const dir = useMemo(() => getDirection(lang), [lang]);

  useEffect(() => {
    const savedLang = (window.localStorage.getItem("app_lang") as Lang) || "ar";
    setLang(savedLang);
    document.documentElement.lang = savedLang;
    document.documentElement.dir = getDirection(savedLang);
  }, []);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError("");

        const supabase = createSupabaseClient();
        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("is_deleted", false)
          .neq("content_type", "article")
          .order("id", { ascending: false });

        if (error) throw new Error(error.message);
        setCourses((data || []) as Course[]);
      } catch (err: any) {
        console.error(err);
        setError("فشل تحميل الدورات");
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const pageStyle: CSSProperties = {
    minHeight: "100vh",
    paddingBottom: 100,
    background: "var(--bg-primary)",
    fontFamily: "var(--font-tajawal), sans-serif",
  };

  const containerStyle: CSSProperties = {
    maxWidth: 650,
    margin: "0 auto",
    padding: "24px 20px",
  };

  const cardStyle: CSSProperties = {
    background: "var(--bg-card)",
    border: "1px solid var(--border-color)",
    borderRadius: 24,
    overflow: "hidden",
    boxShadow: "var(--shadow-md)",
    textDecoration: "none",
    color: "var(--text-primary)",
    display: "block",
    marginBottom: 18,
  };

  return (
    <main style={pageStyle} dir={dir}>
      <div style={containerStyle}>
        <div style={{ marginBottom: 20 }}>
          <Link href="/profile" style={{ textDecoration: "none", color: "var(--text-secondary)" }}>
            ← {lang === "ar" ? "العودة" : "Back"}
          </Link>
          <h1 style={{ fontSize: 34, fontWeight: 900, margin: "12px 0 8px" }}>
            {lang === "ar" ? "الدورات" : "Courses"}
          </h1>
          <p style={{ color: "var(--text-secondary)" }}>
            {lang === "ar" ? "جميع الدورات المرئية والملفات" : "All media courses"}
          </p>
        </div>

        {loading ? (
          <div>جاري التحميل...</div>
        ) : error ? (
          <div>{error}</div>
        ) : courses.length === 0 ? (
          <div>لا توجد دورات بعد</div>
        ) : (
          courses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`} style={cardStyle}>
              {course.image_url ? (
                <img
                  src={course.image_url}
                  alt={course.title}
                  style={{ width: "100%", height: 210, objectFit: "cover" }}
                />
              ) : null}

              <div style={{ padding: 20 }}>
                <h2 style={{ fontSize: 24, fontWeight: 900, marginBottom: 10 }}>
                  {course.title}
                </h2>

                <div style={{ color: "var(--text-secondary)", marginBottom: 10 }}>
                  بواسطة {course.instructor_name}
                </div>

                <p style={{ color: "var(--text-secondary)", lineHeight: 1.8 }}>
                  {course.description || "لا يوجد وصف"}
                </p>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3,1fr)",
                    gap: 10,
                    marginTop: 16,
                    padding: 14,
                    background: "var(--bg-hover)",
                    borderRadius: 14,
                  }}
                >
                  <div style={{ textAlign: "center" }}>
                    <strong>{course.duration || "-"}</strong>
                    <div>المدة</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <strong>{course.students_count ?? 0}</strong>
                    <div>الطلاب</div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <strong>{course.rating ?? 0}</strong>
                    <div>التقييم</div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}
