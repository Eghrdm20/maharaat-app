"use client";

import type { CSSProperties, FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseClient } from "@/lib/supabase/client";
import { translations, type Lang, getDirection } from "@/lib/i18n";

type CachedPiUser = {
  uid: string;
  username: string;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_VIDEO_SIZE = 200 * 1024 * 1024; // 200MB
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export default function CreateCoursePage() {
  const router = useRouter();

  const [lang, setLang] = useState<Lang>("ar");
  const [piUser, setPiUser] = useState<CachedPiUser | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("PI");
  const [isFree, setIsFree] = useState(false);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [attachmentFile, setAttachmentFile] = useState<File | null>(null);

  const [imagePreview, setImagePreview] = useState("");
  const [videoPreview, setVideoPreview] = useState("");

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");

  const t = translations[lang];
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
        setInstructorName(parsed.username);
      }
    } catch (error) {
      console.error("Failed to parse pi_user", error);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
    };
  }, [imagePreview, videoPreview]);

  const validateSelectedFile = (
    file: File,
    type: "image" | "video" | "file"
  ): string | null => {
    if (type === "image" && file.size > MAX_IMAGE_SIZE) {
      return lang === "ar"
        ? "حجم صورة الدورة كبير جدًا. الحد الأقصى 5MB"
        : "Image is too large. Max size is 5MB";
    }

    if (type === "video" && file.size > MAX_VIDEO_SIZE) {
      return lang === "ar"
        ? "حجم فيديو الدورة كبير جدًا. الحد الأقصى 200MB"
        : "Video is too large. Max size is 200MB";
    }

    if (type === "file" && file.size > MAX_FILE_SIZE) {
      return lang === "ar"
        ? "حجم ملف الدورة كبير جدًا. الحد الأقصى 100MB"
        : "Attachment is too large. Max size is 100MB";
    }

    return null;
  };

  const uploadToBucket = async (bucket: string, folder: string, file: File) => {
    const supabase = createSupabaseClient();

    const signedRes = await fetch("/api/storage/upload-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        bucket,
        folder,
        fileName: file.name,
      }),
    });

    const signedJson = await signedRes.json().catch(() => ({}));

    if (!signedRes.ok || !signedJson?.ok) {
      throw new Error(
        signedJson?.error || `${bucket}: failed to prepare signed upload`
      );
    }

    const { path, token, publicUrl } = signedJson;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .uploadToSignedUrl(path, token, file, {
        contentType: file.type || undefined,
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`${bucket}: ${uploadError.message}`);
    }

    return publicUrl as string;
  };

  const uploadCourseAssets = async () => {
    setUploading(true);

    try {
      let imageUrl: string | null = null;
      let videoUrl: string | null = null;
      let fileUrl: string | null = null;

      if (imageFile) {
        setStatus(lang === "ar" ? "جاري رفع صورة الدورة..." : "Uploading course image...");
        imageUrl = await uploadToBucket("course-images", "images", imageFile);
      }

      if (videoFile) {
        setStatus(lang === "ar" ? "جاري رفع فيديو الدورة..." : "Uploading course video...");
        videoUrl = await uploadToBucket("course-videos", "videos", videoFile);
      }

      if (attachmentFile) {
        setStatus(lang === "ar" ? "جاري رفع ملف الدورة..." : "Uploading course file...");
        fileUrl = await uploadToBucket("course-files", "files", attachmentFile);
      }

      return {
        image_url: imageUrl,
        video_url: videoUrl,
        file_url: fileUrl,
      };
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDuration("");
    setPrice("");
    setCurrency("PI");
    setIsFree(false);
    setImageFile(null);
    setVideoFile(null);
    setAttachmentFile(null);

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    if (videoPreview) URL.revokeObjectURL(videoPreview);

    setImagePreview("");
    setVideoPreview("");
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!piUser) {
      setStatus(t.mustConnectPiFirst);
      return;
    }

    if (!title.trim()) {
      setStatus(lang === "ar" ? "أدخل عنوان الدورة" : "Enter course title");
      return;
    }

    if (!description.trim()) {
      setStatus(lang === "ar" ? "أدخل وصف الدورة" : "Enter course description");
      return;
    }

    if (!isFree) {
      const numericPrice = Number(price);
      if (!price.trim() || !Number.isFinite(numericPrice) || numericPrice <= 0) {
        setStatus(
          lang === "ar"
            ? "أدخل سعرًا صحيحًا للدورة المدفوعة"
            : "Valid price is required for paid courses"
        );
        return;
      }
    }

    try {
      setLoading(true);
      setStatus(lang === "ar" ? "جاري تجهيز الدورة..." : "Preparing course...");

      const uploadedAssets = await uploadCourseAssets();

      setStatus(lang === "ar" ? "جاري حفظ الدورة..." : "Saving course...");

      const res = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: piUser.uid,
          username: piUser.username,
          owner_pi_uid: piUser.uid,
          title: title.trim(),
          description: description.trim(),
          instructor_name: instructorName.trim() || piUser.username,
          duration: duration.trim() || null,
          price: isFree ? 0 : Number(price),
          currency,
          is_free: isFree,
          image_url: uploadedAssets.image_url,
          video_url: uploadedAssets.video_url,
          file_url: uploadedAssets.file_url,
          content_type: "media",
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          json?.error ||
            (lang === "ar" ? "فشل إنشاء الدورة" : "Failed to create course")
        );
      }

      setStatus(lang === "ar" ? "تم نشر الدورة بنجاح" : "Course published successfully");
      resetForm();

      setTimeout(() => {
        router.push("/my-courses");
      }, 1200);
    } catch (error: any) {
      console.error(error);
      setStatus(
        error?.message ||
          (lang === "ar" ? "فشل إنشاء الدورة" : "Failed to create course")
      );
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  const pageStyle: CSSProperties = {
    minHeight: "100vh",
    paddingBottom: 100,
    background: "var(--bg-primary)",
    fontFamily: "var(--font-tajawal), sans-serif",
  };

  const containerStyle: CSSProperties = {
    maxWidth: 760,
    margin: "0 auto",
    padding: "20px",
  };

  const cardStyle: CSSProperties = {
    background: "var(--bg-card)",
    borderRadius: 24,
    padding: 20,
    boxShadow: "var(--shadow-md)",
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 16,
    border: "1px solid var(--border-color)",
    background: "var(--bg-secondary)",
    color: "var(--text-primary)",
    fontSize: 16,
    outline: "none",
  };

  const labelStyle: CSSProperties = {
    display: "block",
    marginBottom: 8,
    fontWeight: 700,
    fontSize: 15,
    color: "var(--text-primary)",
  };

  const buttonStyle: CSSProperties = {
    width: "100%",
    padding: "16px",
    borderRadius: 18,
    border: "none",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 800,
    color: "#fff",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  };

  return (
    <main style={pageStyle} dir={dir}>
      <div style={containerStyle}>
        <div style={{ marginBottom: 18 }}>
          <Link
            href="/profile"
            style={{
              textDecoration: "none",
              color: "var(--text-secondary)",
              fontWeight: 700,
            }}
          >
            {lang === "ar" ? "← العودة إلى الملف الشخصي" : "← Back to Profile"}
          </Link>
        </div>

        <div style={cardStyle}>
          <h1 style={{ fontSize: 30, fontWeight: 900, marginBottom: 8 }}>
            {lang === "ar" ? "إنشاء دورة جديدة" : "Create New Course"}
          </h1>

          <p style={{ color: "var(--text-secondary)", marginBottom: 20 }}>
            {lang === "ar"
              ? "ارفع صورة وفيديو وملف للدورة"
              : "Upload image, video, and file for the course"}
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                {lang === "ar" ? "عنوان الدورة" : "Course Title"}
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={inputStyle}
                placeholder={lang === "ar" ? "اكتب عنوان الدورة" : "Enter course title"}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                {lang === "ar" ? "اسم المدرب" : "Instructor Name"}
              </label>
              <input
                value={instructorName}
                onChange={(e) => setInstructorName(e.target.value)}
                style={inputStyle}
                placeholder={lang === "ar" ? "اسم المدرب" : "Instructor name"}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                {lang === "ar" ? "وصف الدورة" : "Course Description"}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ ...inputStyle, minHeight: 140, resize: "vertical" }}
                placeholder={lang === "ar" ? "اكتب وصف الدورة..." : "Write course description..."}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                {lang === "ar" ? "مدة الدورة" : "Course Duration"}
              </label>
              <input
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                style={inputStyle}
                placeholder={lang === "ar" ? "مثال: 3 ساعات" : "Example: 3 hours"}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  ...labelStyle,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={isFree}
                  onChange={(e) => {
                    setIsFree(e.target.checked);
                    if (e.target.checked) {
                      setPrice("");
                    }
                    setStatus("");
                  }}
                />
                {lang === "ar" ? "دورة مجانية" : "This course is free"}
              </label>
            </div>

            {!isFree ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 120px",
                  gap: 12,
                  marginBottom: 16,
                }}
              >
                <div>
                  <label style={labelStyle}>
                    {lang === "ar" ? "سعر الدورة" : "Course Price"}
                  </label>
                  <input
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    type="number"
                    min="0"
                    step="0.01"
                    style={inputStyle}
                    placeholder="0"
                  />
                </div>

                <div>
                  <label style={labelStyle}>
                    {lang === "ar" ? "العملة" : "Currency"}
                  </label>
                  <input
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    style={inputStyle}
                    placeholder="PI"
                  />
                </div>
              </div>
            ) : null}

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                {lang === "ar" ? "صورة الدورة" : "Course Image"}
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;

                  if (!file) {
                    setImageFile(null);
                    if (imagePreview) URL.revokeObjectURL(imagePreview);
                    setImagePreview("");
                    return;
                  }

                  const fileError = validateSelectedFile(file, "image");
                  if (fileError) {
                    setStatus(fileError);
                    return;
                  }

                  setImageFile(file);

                  if (imagePreview) URL.revokeObjectURL(imagePreview);
                  setImagePreview(URL.createObjectURL(file));
                  setStatus("");
                }}
                style={inputStyle}
              />

              {imagePreview ? (
                <div style={{ marginTop: 12 }}>
                  <img
                    src={imagePreview}
                    alt="preview"
                    style={{
                      width: "100%",
                      maxHeight: 220,
                      objectFit: "cover",
                      borderRadius: 16,
                    }}
                  />
                </div>
              ) : null}
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>
                {lang === "ar" ? "فيديو الدورة" : "Course Video"}
              </label>
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;

                  if (!file) {
                    setVideoFile(null);
                    if (videoPreview) URL.revokeObjectURL(videoPreview);
                    setVideoPreview("");
                    return;
                  }

                  const fileError = validateSelectedFile(file, "video");
                  if (fileError) {
                    setStatus(fileError);
                    return;
                  }

                  setVideoFile(file);

                  if (videoPreview) URL.revokeObjectURL(videoPreview);
                  setVideoPreview(URL.createObjectURL(file));
                  setStatus("");
                }}
                style={inputStyle}
              />

              {videoPreview ? (
                <div style={{ marginTop: 12 }}>
                  <video
                    src={videoPreview}
                    controls
                    style={{
                      width: "100%",
                      maxHeight: 260,
                      borderRadius: 16,
                      background: "#000",
                    }}
                  />
                </div>
              ) : null}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>
                {lang === "ar" ? "ملف مرفق للدورة" : "Course Attachment"}
              </label>
              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.txt,.xlsx,.xls"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null;

                  if (!file) {
                    setAttachmentFile(null);
                    return;
                  }

                  const fileError = validateSelectedFile(file, "file");
                  if (fileError) {
                    setStatus(fileError);
                    return;
                  }

                  setAttachmentFile(file);
                  setStatus("");
                }}
                style={inputStyle}
              />

              {attachmentFile ? (
                <div
                  style={{
                    marginTop: 10,
                    padding: "12px 14px",
                    borderRadius: 14,
                    background: "rgba(102, 126, 234, 0.08)",
                    color: "var(--text-primary)",
                    fontWeight: 700,
                  }}
                >
                  {lang === "ar" ? "تم اختيار الملف:" : "Selected file:"} {attachmentFile.name}
                </div>
              ) : null}
            </div>

            <button type="submit" disabled={loading || uploading} style={buttonStyle}>
              {loading || uploading
                ? lang === "ar"
                  ? "جاري رفع الدورة..."
                  : "Uploading course..."
                : lang === "ar"
                ? "نشر الدورة 🚀"
                : "Publish Course 🚀"}
            </button>

            {status ? (
              <div
                style={{
                  marginTop: 16,
                  padding: "14px 16px",
                  borderRadius: 16,
                  background: "rgba(102, 126, 234, 0.10)",
                  color: "var(--text-primary)",
                  fontWeight: 700,
                }}
              >
                {status}
              </div>
            ) : null}
          </form>
        </div>
      </div>
    </main>
  );
}
