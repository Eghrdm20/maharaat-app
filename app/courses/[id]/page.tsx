"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import {
  translations,
  type Lang,
  getDirection,
  detectBrowserLanguage,
  applyLanguage,
} from "@/lib/i18n";

type ArticleBlock = {
  id: string;
  type: "text" | "image";
  heading?: string;
  text?: string;
  image_path?: string;
  image_url?: string;
  caption?: string;
};

type ProtectedContent = {
  video_url: string | null;
  file_url: string | null;
  article_blocks: ArticleBlock[];
};

type Course = {
  id: number;
  title: string;
  description: string | null;
  instructor_name: string;
  price: number | string | null;
  currency: string | null;
  is_free: boolean;
  image_url: string | null;
  video_url: string | null;
  file_url: string | null;
  video_path?: string | null;
  file_path?: string | null;
  duration: string | null;
  students_count: number | null;
  rating: number | null;
  is_new: boolean | null;
  owner_pi_uid: string | null;
  created_at: string;
  is_deleted?: boolean;
  content_type: string | null;
  article_blocks: ArticleBlock[] | null;
};

type PiUser = {
  uid: string;
  username: string;
};

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const rawId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const courseId = useMemo(() => Number(rawId), [rawId]);

  const [lang, setLang] = useState<Lang>("ar");
  const [course, setCourse] = useState<Course | null>(null);
  const [piUser, setPiUser] = useState<PiUser | null>(null);

  const [loading, setLoading] = useState(true);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [buying, setBuying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [piReady, setPiReady] = useState(false);
  const [status, setStatus] = useState("");
  const [protectedContent, setProtectedContent] = useState<ProtectedContent | null>(null);
  const [loadingProtectedContent, setLoadingProtectedContent] = useState(false);

  const t = translations[lang];
  const dir = useMemo(() => getDirection(lang), [lang]);

  useEffect(() => {
    const initialLang = detectBrowserLanguage();
    setLang(initialLang);
    applyLanguage(initialLang);

    const cachedUser = window.localStorage.getItem("pi_user");
    if (cachedUser) {
      try {
        const parsed = JSON.parse(cachedUser);
        if (parsed?.uid && parsed?.username) {
          setPiUser(parsed);
        }
      } catch (error) {
        console.error("Failed to parse pi_user", error);
      }
    }
  }, []);

  useEffect(() => {
    let attempts = 0;

    const timer = window.setInterval(() => {
      attempts += 1;
      const Pi = (window as typeof window & { Pi?: any }).Pi;

      if (!Pi?.init) {
        if (attempts >= 15) {
          setStatus(t.piMissing);
          window.clearInterval(timer);
        }
        return;
      }

      window.clearInterval(timer);

      try {
        Pi.init({
          version: "2.0",
          sandbox: process.env.NEXT_PUBLIC_PI_SANDBOX === "true",
        });
        setPiReady(true);
      } catch (error: any) {
        console.error("Pi init error:", error);
        setStatus(error?.message || t.piInitFailed);
      }
    }, 500);

    return () => window.clearInterval(timer);
  }, [t.piMissing, t.piInitFailed]);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        setLoading(true);
        setStatus("");

        const supabase = createSupabaseClient();

        const { data, error } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .eq("is_deleted", false)
          .single();

        if (error) {
          throw new Error(error.message);
        }

        setCourse(data as Course);
      } catch (error: any) {
        console.error(error);
        setStatus(error?.message || t.loadingCourse);
      } finally {
        setLoading(false);
      }
    };

    if (!Number.isNaN(courseId) && courseId > 0) {
      void loadCourse();
    }
  }, [courseId, t.loadingCourse]);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setCheckingAccess(true);

        if (!courseId || Number.isNaN(courseId) || !course) {
          setHasAccess(false);
          return;
        }

        const localOwned = window.localStorage.getItem(`owned_course_${courseId}`);
        if (localOwned === "true") {
          setHasAccess(true);
          return;
        }

        if (course.is_free) {
          setHasAccess(true);
          return;
        }

        if (piUser?.uid && course.owner_pi_uid === piUser.uid) {
          setHasAccess(true);
          window.localStorage.setItem(`owned_course_${courseId}`, "true");
          return;
        }

        if (!piUser?.uid) {
          setHasAccess(false);
          return;
        }

        const supabase = createSupabaseClient();
        const { data, error } = await supabase
          .from("purchases")
          .select("payment_id,status")
          .eq("course_id", courseId)
          .eq("uid", piUser.uid)
          .eq("status", "completed")
          .limit(1);

        if (error) {
          console.error("Purchase check error:", error);
          setHasAccess(false);
          return;
        }

        const bought = Array.isArray(data) && data.length > 0;
        setHasAccess(bought);

        if (bought) {
          window.localStorage.setItem(`owned_course_${courseId}`, "true");
        }
      } finally {
        setCheckingAccess(false);
      }
    };

    void checkAccess();
  }, [courseId, course, piUser]);

  useEffect(() => {
    const loadProtectedContent = async () => {
      try {
        if (!course || !hasAccess) {
          setProtectedContent(null);
          return;
        }

        const sessionToken = window.localStorage.getItem("pi_session_token") || "";

        if (!sessionToken) {
          setProtectedContent({
            video_url: course.video_url || null,
            file_url: course.file_url || null,
            article_blocks: course.article_blocks || [],
          });
          return;
        }

        setLoadingProtectedContent(true);

        const res = await fetch(`/api/courses/${course.id}/protected-content`, {
          method: "GET",
          cache: "no-store",
          headers: {
            Authorization: `Bearer ${sessionToken}`,
          },
        });

        const json = await res.json().catch(() => ({}));

        if (!res.ok) {
          setProtectedContent({
            video_url: course.video_url || null,
            file_url: course.file_url || null,
            article_blocks: course.article_blocks || [],
          });
          return;
        }

        setProtectedContent(json.content || null);
      } catch (error) {
        console.error(error);
        setProtectedContent({
          video_url: course?.video_url || null,
          file_url: course?.file_url || null,
          article_blocks: course?.article_blocks || [],
        });
      } finally {
        setLoadingProtectedContent(false);
      }
    };

    void loadProtectedContent();
  }, [course, hasAccess]);

  const changeLanguage = (nextLang: Lang) => {
    setLang(nextLang);
    window.localStorage.setItem("app_lang", nextLang);
    applyLanguage(nextLang);
  };

  const refreshAccessFromSupabase = async (uidOverride?: string) => {
    const currentUid = uidOverride || piUser?.uid;
    if (!currentUid) return false;

    const supabase = createSupabaseClient();
    const { data, error } = await supabase
      .from("purchases")
      .select("payment_id,status")
      .eq("course_id", courseId)
      .eq("uid", currentUid)
      .eq("status", "completed")
      .limit(1);

    if (error) {
      throw new Error(error.message);
    }

    const bought = Array.isArray(data) && data.length > 0;
    setHasAccess(bought);

    if (bought) {
      window.localStorage.setItem(`owned_course_${courseId}`, "true");
    }

    return bought;
  };

  const ensurePiAuthForPayments = async () => {
    const Pi = (window as typeof window & { Pi?: any }).Pi;

    if (!Pi?.authenticate) {
      throw new Error(
        lang === "ar"
          ? "افتح التطبيق من Pi Browser أولًا"
          : "Open the app in Pi Browser first"
      );
    }

    const authResult = await Pi.authenticate(
      ["username", "payments"],
      (payment: any) => {
        console.log("Incomplete payment found:", payment);
      }
    );

    const accessToken = authResult?.accessToken;
    const authUsername = authResult?.user?.username || "";

    if (!accessToken) {
      throw new Error(
        lang === "ar"
          ? "فشل الحصول على صلاحية الدفع من Pi"
          : "Failed to get Pi payment scope"
      );
    }

    const res = await fetch("/api/pi/user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken,
        authUsername,
      }),
    });

    const json = await res.json();

    if (!res.ok) {
      throw new Error(json?.error || "Pi authentication failed");
    }

    const user = json?.user;

    if (!user?.uid || !user?.username) {
      throw new Error(
        lang === "ar"
          ? "بيانات مستخدم Pi غير صالحة"
          : "Invalid Pi user data"
      );
    }

    const normalizedUser = {
      uid: user.uid,
      username: user.username,
    };

    window.localStorage.setItem("pi_user", JSON.stringify(normalizedUser));

    if (json?.sessionToken) {
      window.localStorage.setItem("pi_session_token", json.sessionToken);
    }

    setPiUser(normalizedUser);

    return normalizedUser;
  };

  const handleBuyCourse = async () => {
    try {
      if (!course) return;

      if (hasAccess) {
        setStatus(
          lang === "ar"
            ? "أنت تملك هذه الدورة بالفعل"
            : "You already own this course"
        );
        return;
      }

      if (course.is_free) {
        window.localStorage.setItem(`owned_course_${course.id}`, "true");
        setHasAccess(true);
        setStatus(
          lang === "ar"
            ? "تم فتح الدورة المجانية بنجاح"
            : "Free course unlocked successfully"
        );
        return;
      }

      const Pi = (window as typeof window & { Pi?: any }).Pi;

      if (!Pi?.createPayment || !piReady) {
        setStatus(t.paymentUnavailable);
        return;
      }

      setStatus(
        lang === "ar"
          ? "جاري التحقق من حساب Pi وصلاحية الدفع..."
          : "Checking Pi account and payments scope..."
      );

      const currentUser = await ensurePiAuthForPayments();
      const amount = Number(course.price || 0);

      if (!amount || amount <= 0) {
        setStatus(t.invalidPrice);
        return;
      }

      setBuying(true);
      setStatus(t.paymentStarted);

      Pi.createPayment(
        {
          amount,
          memo: `${t.buyNow}: ${course.title}`,
          metadata: {
            courseId: course.id,
            courseTitle: course.title,
          },
        },
        {
          onReadyForServerApproval: async (paymentId: string) => {
            setStatus(t.paymentApproving);

            const res = await fetch("/api/payments/approve", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ paymentId }),
            });

            const json = await res.json().catch(() => ({}));

            if (!res.ok) {
              throw new Error(json?.error || t.paymentFailed);
            }
          },

          onReadyForServerCompletion: async (paymentId: string, txid: string) => {
            try {
              setStatus(t.paymentCompleting);

              const res = await fetch("/api/payments/complete", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  paymentId,
                  txid,
                  courseId: course.id,
                  uid: currentUser.uid,
                  username: currentUser.username,
                }),
              });

              const json = await res.json().catch(() => ({}));

              if (!res.ok) {
                throw new Error(json?.error || t.paymentFailed);
              }

              window.localStorage.setItem(`owned_course_${course.id}`, "true");
              setHasAccess(true);

              try {
                await refreshAccessFromSupabase(currentUser.uid);
              } catch (error) {
                console.error("refreshAccessFromSupabase failed:", error);
              }

              setProtectedContent({
                video_url: course.video_url || null,
                file_url: course.file_url || null,
                article_blocks: course.article_blocks || [],
              });

              setStatus(
                lang === "ar"
                  ? "تم شراء الدورة بنجاح. يمكنك الآن فتح المحتوى."
                  : "Course purchased successfully. You can now access the content."
              );
            } catch (error: any) {
              console.error("complete error:", error);
              setStatus(error?.message || t.paymentFailed);
            } finally {
              setBuying(false);
            }
          },

          onCancel: () => {
            setBuying(false);
            setStatus(t.paymentCancelled);
          },

          onError: (error: any) => {
            console.error("Pi payment error:", error);
            setBuying(false);
            setStatus(error?.message || t.paymentFailed);
          },
        }
      );
    } catch (error: any) {
      console.error(error);
      setBuying(false);
      setStatus(error?.message || t.paymentFailed);
    }
  };

  const handleDeleteCourse = async () => {
    try {
      if (!course || !piUser?.uid) return;

      const confirmed = window.confirm(
        lang === "ar"
          ? "هل أنت متأكد أنك تريد حذف هذه الدورة؟"
          : "Are you sure you want to delete this course?"
      );

      if (!confirmed) return;

      setDeleting(true);
      setStatus(lang === "ar" ? "جاري حذف الدورة..." : "Deleting course...");

      const res = await fetch(`/api/courses/${course.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: piUser.uid,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          json?.error ||
            (lang === "ar" ? "فشل حذف الدورة" : "Failed to delete course")
        );
      }

      setStatus(
        lang === "ar" ? "تم حذف الدورة بنجاح" : "Course deleted successfully"
      );

      setTimeout(() => {
        router.push("/my-courses");
      }, 1000);
    } catch (error: any) {
      console.error(error);
      setStatus(
        error?.message ||
          (lang === "ar" ? "فشل حذف الدورة" : "Failed to delete course")
      );
    } finally {
      setDeleting(false);
    }
  };

  const pageStyle: CSSProperties = {
    minHeight: "100vh",
    paddingBottom: 120,
    background: "var(--bg-primary)",
    fontFamily: "var(--font-tajawal), sans-serif",
  };

  const containerStyle: CSSProperties = {
    maxWidth: 760,
    margin: "0 auto",
    padding: "20px 16px 120px",
  };

  const cardStyle: CSSProperties = {
    background: "var(--bg-card)",
    borderRadius: 28,
    overflow: "hidden",
    boxShadow: "var(--shadow-lg)",
    border: "1px solid var(--border-color)",
  };

  const imageStyle: CSSProperties = {
    width: "100%",
    height: 280,
    objectFit: "cover",
    display: "block",
    background: "#eef2ff",
  };

  const contentStyle: CSSProperties = {
    padding: 22,
  };

  const badgeStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 80,
    padding: "10px 18px",
    borderRadius: 999,
    background: "#22c55e",
    color: "#fff",
    fontWeight: 800,
    fontSize: 16,
    marginBottom: 18,
  };

  const titleStyle: CSSProperties = {
    fontSize: 34,
    fontWeight: 900,
    color: "#0f172a",
    margin: "0 0 12px",
  };

  const instructorStyle: CSSProperties = {
    color: "#64748b",
    fontSize: 16,
    marginBottom: 14,
  };

  const descriptionStyle: CSSProperties = {
    color: "#475569",
    fontSize: 16,
    lineHeight: 1.9,
    marginBottom: 20,
  };

  const statsGridStyle: CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 12,
    marginBottom: 22,
  };

  const statBoxStyle: CSSProperties = {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: 18,
    padding: 16,
    fontSize: 16,
    color: "#334155",
    lineHeight: 1.8,
  };

  const actionButtonStyle: CSSProperties = {
    width: "100%",
    minHeight: 72,
    borderRadius: 22,
    border: "none",
    background: "#08153c",
    color: "#fff",
    fontSize: 22,
    fontWeight: 900,
    cursor: "pointer",
    marginTop: 10,
  };

  const deleteButtonStyle: CSSProperties = {
    width: "100%",
    minHeight: 72,
    borderRadius: 22,
    border: "2px solid #ef4444",
    background: "#fff",
    color: "#ef4444",
    fontSize: 22,
    fontWeight: 900,
    cursor: "pointer",
    marginTop: 16,
  };

  const statusBoxStyle: CSSProperties = {
    marginTop: 18,
    color: "#64748b",
    fontSize: 16,
    lineHeight: 1.8,
    whiteSpace: "pre-wrap",
  };

  const ownedBoxStyle: CSSProperties = {
    marginTop: 14,
    padding: "16px 18px",
    borderRadius: 18,
    background: "rgba(34,197,94,0.10)",
    border: "1px solid rgba(34,197,94,0.22)",
    color: "#166534",
    fontWeight: 800,
    fontSize: 17,
    lineHeight: 1.8,
  };

  const sectionTitleStyle: CSSProperties = {
    fontSize: 26,
    fontWeight: 900,
    color: "#0f172a",
    margin: "26px 0 14px",
  };

  const articleBlockStyle: CSSProperties = {
    background: "#fff",
    borderRadius: 20,
    padding: 18,
    border: "1px solid #e2e8f0",
    marginBottom: 14,
  };

  const backRowStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  };

  const backLinkStyle: CSSProperties = {
    color: "#334155",
    textDecoration: "none",
    fontWeight: 800,
    fontSize: 16,
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
    background: active
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      : "transparent",
    color: active ? "white" : "var(--text-secondary)",
    fontWeight: active ? 700 : 600,
    fontSize: 13,
    cursor: "pointer",
    transition: "all 0.3s ease",
  });

  if (loading) {
    return (
      <main style={pageStyle} dir={dir}>
        <div style={containerStyle}>
          <div style={cardStyle}>
            <div style={{ padding: 24, fontSize: 18 }}>{t.loadingCourse}</div>
          </div>
        </div>
      </main>
    );
  }

  if (!course) {
    return (
      <main style={pageStyle} dir={dir}>
        <div style={containerStyle}>
          <div style={backRowStyle}>
            <Link href="/" style={backLinkStyle}>
              {t.back}
            </Link>
          </div>
          <div style={cardStyle}>
            <div style={{ padding: 24, fontSize: 18 }}>{t.courseNotFound}</div>
          </div>
        </div>
      </main>
    );
  }

  const imageUrl = course.image_url || "/placeholder.svg";
  const priceText = course.is_free ? t.free : `${course.price} ${course.currency || "PI"}`;
  const isOwner = !!piUser?.uid && piUser.uid === course.owner_pi_uid;

  const effectiveVideoUrl = protectedContent?.video_url || course.video_url || null;
  const effectiveFileUrl = protectedContent?.file_url || course.file_url || null;
  const effectiveArticleBlocks =
    protectedContent?.article_blocks || course.article_blocks || [];

  const articleBlocks = effectiveArticleBlocks;
  const hasWrittenContent =
    course.content_type === "article" &&
    Array.isArray(articleBlocks) &&
    articleBlocks.length > 0;

  return (
    <main style={pageStyle} dir={dir}>
      <div style={containerStyle}>
        <div style={backRowStyle}>
          <Link href="/" style={backLinkStyle}>
            {t.back}
          </Link>

          <div style={languageToggleStyle}>
            <button
              onClick={() => changeLanguage("ar")}
              style={langButtonStyle(lang === "ar")}
              type="button"
            >
              العربية
            </button>
            <button
              onClick={() => changeLanguage("en")}
              style={langButtonStyle(lang === "en")}
              type="button"
            >
              English
            </button>
          </div>
        </div>

        <div style={cardStyle}>
          <img src={imageUrl} alt={course.title} style={imageStyle} />

          <div style={contentStyle}>
            {course.is_new ? <div style={badgeStyle}>{t.new}</div> : null}

            <h1 style={titleStyle}>{course.title}</h1>

            <div style={instructorStyle}>
              {t.instructorBy} {course.instructor_name}
            </div>

            <div style={descriptionStyle}>{course.description || t.noDescription}</div>

            <div style={statsGridStyle}>
              <div style={statBoxStyle}>
                {t.rating}: {course.rating ?? 0}
              </div>
              <div style={statBoxStyle}>
                {t.students}: {course.students_count ?? 0}
              </div>
              <div style={statBoxStyle}>
                {t.duration}: {course.duration || t.notSpecified}
              </div>
              <div style={statBoxStyle}>
                {t.price}: {priceText}
              </div>
            </div>

            {checkingAccess ? (
              <div style={statusBoxStyle}>{t.checkingAccess}</div>
            ) : !hasAccess ? (
              <>
                {!piUser ? (
                  <div style={statusBoxStyle}>
                    {lang === "ar"
                      ? "يجب تسجيل الدخول بواسطة Pi للوصول إلى هذه الدورة، حتى لو كانت مجانية."
                      : "You must sign in with Pi to access this course, even if it is free."}
                  </div>
                ) : null}

                <button
                  onClick={handleBuyCourse}
                  disabled={buying}
                  type="button"
                  style={actionButtonStyle}
                >
                  {course.is_free
                    ? t.startNow
                    : buying
                    ? lang === "ar"
                      ? "جاري الشراء..."
                      : "Buying..."
                    : `${t.buyNow} - ${priceText}`}
                </button>

                {isOwner ? (
                  <button
                    onClick={handleDeleteCourse}
                    disabled={deleting}
                    type="button"
                    style={deleteButtonStyle}
                  >
                    {deleting
                      ? lang === "ar"
                        ? "جاري الحذف..."
                        : "Deleting..."
                      : lang === "ar"
                      ? "حذف الدورة"
                      : "Delete Course"}
                  </button>
                ) : null}

                {status ? <div style={statusBoxStyle}>{status}</div> : null}
              </>
            ) : (
              <>
                <div style={ownedBoxStyle}>
                  {lang === "ar"
                    ? "أنت تملك هذه الدورة بالفعل. مرّر للأسفل لعرض المحتوى."
                    : "You already own this course. Scroll down to access the content."}
                </div>

                <div style={sectionTitleStyle}>{t.courseContentAccess}</div>

                {loadingProtectedContent ? (
                  <div style={statusBoxStyle}>
                    {lang === "ar"
                      ? "جاري تحميل المحتوى المحمي..."
                      : "Loading protected content..."}
                  </div>
                ) : null}

                {hasWrittenContent ? (
                  <>
                    <div style={sectionTitleStyle}>
                      {lang === "ar" ? "محتوى الدورة المكتوبة" : "Written Course Content"}
                    </div>

                    {articleBlocks.map((block, index) => {
                      if (block.type === "text") {
                        return (
                          <div key={block.id || `${index}`} style={articleBlockStyle}>
                            {block.heading ? (
                              <h3 style={{ marginTop: 0, marginBottom: 10 }}>
                                {block.heading}
                              </h3>
                            ) : null}
                            <div style={{ lineHeight: 1.9, color: "#334155" }}>
                              {block.text}
                            </div>
                          </div>
                        );
                      }

                      if (block.type === "image" && block.image_url) {
                        return (
                          <div key={block.id || `${index}`} style={articleBlockStyle}>
                            <img
                              src={block.image_url}
                              alt={block.caption || "course image"}
                              style={{
                                width: "100%",
                                borderRadius: 16,
                                display: "block",
                              }}
                            />
                            {block.caption ? (
                              <div
                                style={{
                                  marginTop: 10,
                                  color: "#64748b",
                                  fontSize: 14,
                                }}
                              >
                                {block.caption}
                              </div>
                            ) : null}
                          </div>
                        );
                      }

                      return null;
                    })}
                  </>
                ) : null}

                {effectiveVideoUrl ? (
                  <>
                    <div style={sectionTitleStyle}>{t.courseVideo}</div>
                    <video
                      src={effectiveVideoUrl}
                      controls
                      style={{
                        width: "100%",
                        borderRadius: 20,
                        background: "#000",
                      }}
                    />
                  </>
                ) : null}

                {effectiveFileUrl ? (
                  <>
                    <div style={sectionTitleStyle}>{t.courseFile}</div>
                    <a
                      href={effectiveFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 56,
                        padding: "0 20px",
                        borderRadius: 18,
                        background: "#0f172a",
                        color: "#fff",
                        textDecoration: "none",
                        fontWeight: 800,
                      }}
                    >
                      {t.openOrDownloadFile}
                    </a>
                  </>
                ) : null}

                {course.content_type !== "article" &&
                !effectiveVideoUrl &&
                !effectiveFileUrl &&
                !loadingProtectedContent ? (
                  <div style={statusBoxStyle}>
                    {lang === "ar"
                      ? "لا يوجد محتوى مرفوع بعد لهذه الدورة. يجب على صاحب الدورة رفع فيديو أو ملف أو محتوى مكتوب."
                      : "No content has been uploaded yet for this course."}
                  </div>
                ) : null}

                {isOwner ? (
                  <button
                    onClick={handleDeleteCourse}
                    disabled={deleting}
                    type="button"
                    style={deleteButtonStyle}
                  >
                    {deleting
                      ? lang === "ar"
                        ? "جاري الحذف..."
                        : "Deleting..."
                      : lang === "ar"
                      ? "حذف الدورة"
                      : "Delete Course"}
                  </button>
                ) : null}

                {status ? <div style={statusBoxStyle}>{status}</div> : null}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
