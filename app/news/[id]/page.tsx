"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useParams } from "next/navigation"; // ✅ التصحيح هنا
import { useEffect, useState } from "react";
import { translations, type Lang, getDirection } from "@/lib/i18n";

type Post = {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  image_url: string | null;
  username: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
};

type Comment = {
  id: number;
  content: string;
  username: string;
  uid: string | null;
  likes_count: number;
  created_at: string;
  replies?: Comment[];
};

export default function PostDetailPage() {
  const params = useParams();                    // ✅ التصحيح
  const id = params.id as string;                // ✅ التصحيح

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [lang, setLang] = useState<Lang>("ar");
  
  const t = translations[lang];
  const dir = getDirection(lang);

  // Get current user info
  const getCurrentUser = () => {
    try {
      const piUser = window.localStorage.getItem("pi_user");
      if (piUser) return JSON.parse(piUser);
    } catch (e) {}
    return null;
  };

  useEffect(() => {
    const savedLang = (window.localStorage.getItem("app_lang") as Lang) || "ar";
    setLang(savedLang);

    if (id) {                          // ✅ id متاح الآن
      loadPost(id);
      loadComments(id);
      checkIfLiked(id);
    }
  }, [id]);

  const loadPost = async (postId: string) => {
    try {
      const res = await fetch(`/api/news`);
      const json = await res.json();
      const found = json.posts?.find((p: Post) => p.id.toString() === postId);
      if (found) {
        setPost(found);
        setLikeCount(found.likes_count || 0);
        
        // Increment view count
        fetch(`/api/news/${postId}/view`, { method: 'POST' }).catch(() => {});
      }
    } catch (error) {
      console.error("Failed to load post:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadComments = async (postId: string) => {
    try {
      const res = await fetch(`/api/comments?post_id=${postId}`);
      const json = await res.json();
      setComments(json.comments || []);
    } catch (error) {
      console.error("Failed to load comments:", error);
    }
  };

  const checkIfLiked = async (postId: string) => {
    const user = getCurrentUser();
    if (!user?.uid) return;

    try {
      const res = await fetch(`/api/likes?post_id=${postId}&uid=${user.uid}`);
      const json = await res.json();
      setLiked(json.liked);
    } catch (error) {}
  };

  const handleLike = async () => {
    const user = getCurrentUser();
    if (!user?.uid) {
      alert(lang === "ar" ? "يجب تسجيل الدخول أولاً" : "Please login first");
      return;
    }

    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: id, uid: user.uid }),
      });
      const json = await res.json();
      if (json.ok) {
        setLiked(json.liked);
        setLikeCount(prev => json.liked ? prev + 1 : prev - 1);
      }
    } catch (error) {
      console.error("Failed to like:", error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const user = getCurrentUser();
    setSubmittingComment(true);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          post_id: id,
          uid: user?.uid || null,
          username: user?.username || (lang === "ar" ? "زائر" : "Guest"),
          content: commentText.trim(),
        }),
      });

      const json = await res.json();
      if (json.ok) {
        setCommentText("");
        loadComments(id);
        
        if (post) {
          setPost({ ...post, comments_count: (post.comments_count || 0) + 1 });
        }
      }
    } catch (error) {
      console.error("Failed to submit comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}${lang === "ar" ? "دقيقة" : "min"} ago`;
    if (hours < 24) return `${hours}${lang === "ar" ? "ساعة" : "hr"} ago`;
    if (days < 7) return `${days}${lang === "ar" ? "أيام" : "days"} ago`;
    return date.toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US");
  };

  // ====== STYLES (نفسها كما هي - لم أغيرها) ======
  const mainStyle: CSSProperties = {
    minHeight: "100vh",
    paddingBottom: 100,
    background: "var(--bg-primary)",
    fontFamily: "var(--font-tajawal), sans-serif",
  };

  const containerStyle: CSSProperties = {
    maxWidth: 650,
    margin: "0 auto",
    padding: "20px",
  };

  const backButtonStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    color: "var(--text-secondary)",
    textDecoration: "none",
    fontSize: 15,
    fontWeight: 600,
    padding: "8px 12px",
    borderRadius: "12px",
    marginBottom: 20,
    transition: "all 0.3s ease",
  };

  const titleStyle: CSSProperties = {
    fontSize: 28,
    fontWeight: 800,
    color: "var(--text-primary)",
    lineHeight: 1.4,
    marginBottom: 16,
  };

  const metaRowStyle: CSSProperties = {
    display: "flex",
    gap: 16,
    fontSize: 13,
    color: "var(--text-muted)",
    marginBottom: 24,
    flexWrap: "wrap",
  };

  const metaItemStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 4,
  };

  const imageStyle: CSSProperties = {
    width: "100%",
    maxHeight: 400,
    objectFit: "cover",
    borderRadius: "20px",
    marginBottom: 24,
    background: "linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%)",
  };

  const contentStyle: CSSProperties = {
    fontSize: 16,
    lineHeight: 1.9,
    color: "var(--text-secondary)",
    marginBottom: 32,
    whiteSpace: "pre-wrap",
  };

  const actionButtonsStyle: CSSProperties = {
    display: "flex",
    gap: 12,
    marginBottom: 32,
    flexWrap: "wrap",
  };

  const likeButtonStyle: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 24px",
    borderRadius: "999px",
    border: "2px solid var(--border-color)",
    background: liked ? "linear-gradient(135deg, #f5576c 0%, #f093fb 100%)" : "var(--bg-card)",
    color: liked ? "white" : "var(--text-primary)",
    fontWeight: 700,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: liked ? "0 8px 24px rgba(245, 87, 108, 0.35)" : "var(--shadow-sm)",
    fontSize: 15,
  };

  const commentSectionStyle: CSSProperties = {
    background: "var(--bg-card)",
    borderRadius: "24px",
    padding: "24px",
    boxShadow: "var(--shadow-lg)",
  };

  const sectionTitleStyle: CSSProperties = {
    fontSize: 22,
    fontWeight: 800,
    color: "var(--text-primary)",
    marginBottom: 20,
    display: "flex",
    alignItems: "center",
    gap: 10,
  };

  const commentFormStyle: CSSProperties = {
    marginBottom: 24,
  };

  const textareaStyle: CSSProperties = {
    width: "100%",
    border: "2px solid var(--border-color)",
    borderRadius: "16px",
    padding: "14px 16px",
    fontSize: 15,
    outline: "none",
    background: "var(--bg-primary)",
    color: "var(--text-primary)",
    resize: "vertical",
    minHeight: 100,
    marginBottom: 12,
    fontFamily: "inherit",
  };

  const submitButtonStyle: CSSProperties = {
    width: "100%",
    padding: "14px",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    border: "none",
    borderRadius: "14px",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    transition: "all 0.3s ease",
    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.35)",
    opacity: submittingComment ? 0.7 : 1,
  };

  const commentCardStyle: CSSProperties = {
    background: "var(--bg-hover)",
    borderRadius: "16px",
    padding: "16px",
    marginBottom: 12,
  };

  const commentHeaderStyle: CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  };

  const commentAuthorStyle: CSSProperties = {
    fontWeight: 700,
    color: "var(--text-primary)",
    fontSize: 14,
  };

  const commentDateStyle: CSSProperties = {
    fontSize: 12,
    color: "var(--text-muted)",
  };

  const commentBodyStyle: CSSProperties = {
    fontSize: 14,
    lineHeight: 1.7,
    color: "var(--text-secondary)",
  };

  const navStyle: CSSProperties = {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: 650,
    background: "rgba(255,255,255,0.95)",
    backdropFilter: "blur(20px)",
    borderTop: "1px solid var(--border-color)",
    padding: "10px 12px",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 6,
    zIndex: 100,
  };

  const navItemStyle = (active: boolean): CSSProperties => ({
    textDecoration: "none",
    textAlign: "center",
    background: active ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "transparent",
    color: active ? "white" : "var(--text-secondary)",
    padding: "10px 6px",
    borderRadius: "16px",
    fontSize: 11,
    fontWeight: active ? 700 : 600,
    transition: "all 0.3s ease",
    boxShadow: active ? "0 6px 20px rgba(102, 126, 234, 0.3)" : "none",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  });

  if (loading) {
    return (
      <main style={{ ...mainStyle, direction: dir }}>
        <div style={containerStyle}>
          <div style={{ textAlign: "center", padding: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            {lang === "ar" ? "جاري تحميل المقال..." : "Loading article..."}
          </div>
        </div>
      </main>
    );
  }

  if (!post) {
    return (
      <main style={{ ...mainStyle, direction: dir }}>
        <div style={containerStyle}>
          <div style={{ textAlign: "center", padding: 80 }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>😕</div>
            {lang === "ar" ? "لم يتم العثور على المقال" : "Article not found"}
            <br />
            <Link href="/news" style={backButtonStyle}>
              ← {lang === "ar" ? "العودة للأخبار" : "Back to News"}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ ...mainStyle, direction: dir }}>
      <div style={containerStyle}>
        {/* Back Button */}
        <Link href="/news" style={backButtonStyle}>
          ← {lang === "ar" ? "العودة" : "Back"}
        </Link>

        {/* Title & Meta */}
        <h1 style={titleStyle}>{post.title}</h1>
        
        <div style={metaRowStyle}>
          <span style={metaItemStyle}>👤 {post.username || (lang === "ar" ? "مجهول" : "Anonymous")}</span>
          <span style={metaItemStyle}>📅 {formatDate(post.created_at)}</span>
          <span style={metaItemStyle}>👁️ {post.views_count || 0}</span>
        </div>

        {/* Image */}
        {post.image_url && (
          <img src={post.image_url} alt={post.title} style={imageStyle} />
        )}

        {/* Content */}
        <div style={contentStyle}>{post.content}</div>

        {/* Action Buttons */}
        <div style={actionButtonsStyle}>
          <button 
            onClick={handleLike}
            style={likeButtonStyle}
            onMouseEnter={(e) => {
              if (!liked) e.currentTarget.style.borderColor = "#f5576c";
            }}
            onMouseLeave={(e) => {
              if (!liked) e.currentTarget.style.borderColor = "var(--border-color)";
            }}
          >
            {liked ? "❤️" : "🤍"} {likeCount} {lang === "ar" ? "إعجاب" : "Likes"}
          </button>
          
          <div style={{
            padding: "12px 24px",
            borderRadius: "999px",
            background: "var(--bg-hover)",
            color: "var(--text-secondary)",
            fontWeight: 600,
            fontSize: 14,
          }}>
            💬 {post.comments_count || 0} {lang === "ar" ? "تعليق" : "Comments"}
          </div>
        </div>

        {/* Comments Section */}
        <div style={commentSectionStyle}>
          <h2 style={sectionTitleStyle}>
            💬 {lang === "ar" ? "التعليقات" : "Comments"}
            <span style={{
              background: "var(--bg-hover)",
              padding: "4px 12px",
              borderRadius: "999px",
              fontSize: 14,
              fontWeight: 700,
              color: "var(--text-muted)",
            }}>
              {comments.length}
            </span>
          </h2>

          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} style={commentFormStyle}>
            <textarea
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={lang === "ar" ? "اكتب تعليقك هنا..." : "Write your comment here..."}
              style={textareaStyle}
              disabled={submittingComment}
            />
            <button type="submit" style={submitButtonStyle} disabled={submittingComment}>
              {submittingComment 
                ? (lang === "ar" ? "جاري النشر..." : "Posting...")
                : (lang === "ar" ? "نشر التعليق" : "Post Comment")
              }
            </button>
          </form>

          {/* Comments List */}
          {comments.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "var(--text-muted)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
              {lang === "ar" ? "لا توجد تعليقات بعد. كن الأول!" : "No comments yet. Be the first!"}
            </div>
          ) : (
            <div>
              {comments.map((comment) => (
                <div key={comment.id} style={commentCardStyle}>
                  <div style={commentHeaderStyle}>
                    <div>
                      <span style={commentAuthorStyle}>
                        {comment.username || (lang === "ar" ? "زائر" : "Guest")}
                      </span>
                      <span style={commentDateStyle}> • {formatDate(comment.created_at)}</span>
                    </div>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                      ❤️ {comment.likes_count || 0}
                    </span>
                  </div>
                  <p style={commentBodyStyle}>{comment.content}</p>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div style={{
                      marginTop: 12,
                      paddingRight: lang === "ar" ? 16 : 0,
                      paddingLeft: lang === "en" ? 16 : 0,
                      borderRight: lang === "ar" ? "3px solid var(--border-color)" : "none",
                      borderLeft: lang === "en" ? "3px solid var(--border-color)" : "none",
                    }}>
                      {comment.replies.map((reply) => (
                        <div key={reply.id} style={{ ...commentCardStyle, marginBottom: 8, background: "var(--bg-card)" }}>
                          <div style={commentHeaderStyle}>
                            <div>
                              <span style={commentAuthorStyle}>{reply.username || "Guest"}</span>
                              <span style={commentDateStyle}> • {formatDate(reply.created_at)}</span>
                            </div>
                          </div>
                          <p style={commentBodyStyle}>{reply.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Nav */}
      <nav style={navStyle}>
        <Link href="/profile" style={navItemStyle(false)}>
          <div style={{ fontSize: 18, marginBottom: 3 }}>👤</div>
          <span>{lang === "ar" ? "الملف" : "Profile"}</span>
        </Link>
        
        <Link href="/create-course" style={navItemStyle(false)}>
          <div style={{ fontSize: 18, marginBottom: 3 }}>➕</div>
          <span>{lang === "ar" ? "إنشاء" : "Create"}</span>
        </Link>

        <Link href="/news" style={navItemStyle(true)}>
          <div style={{ fontSize: 18, marginBottom: 3 }}>📰</div>
          <span>{lang === "ar" ? "أخبار" : "News"}</span>
        </Link>

        <Link href="/" style={navItemStyle(false)}>
          <div style={{ fontSize: 18, marginBottom: 3 }}>🏠</div>
          <span>{lang === "ar" ? "الرئيسية" : "Home"}</span>
        </Link>
      </nav>
    </main>
  );
}
