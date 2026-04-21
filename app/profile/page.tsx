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

export default function ProfilePage() {
  const router = useRouter();

  const [lang, setLang] = useState<Lang>("ar");
  const [piUser, setPiUser] = useState<CachedPiUser | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [isFree, setIsFree] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [courseFile, setCourseFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
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
      }
    } catch (error) {
      console.error("Failed to parse pi_user", error);
    }
  }, []);

  const changeLanguage = (nextLang: Lang) => {
    setLang(nextLang);
    window.localStorage.setItem("app_lang", nextLang);
    document.documentElement.lang = nextLang;
    document.documentElement.dir = getDirection(nextLang);
  };

  const uploadToBucket = async (bucket: string, file: File) => {
    const supabase = createSupabaseClient();
    const ext = file.name.split(".").pop() || "bin";
    const safeName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const path = `${piUser?.uid || "guest"}/${safeName}`;

    const { error } = await supabase.storage.from(bucket).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!piUser) {
      setStatus(t.mustConnectPiFirst);
      return;
    }

    if (!title.trim() || !description.trim() || !duration.trim()) {
      setStatus(t.fillRequiredFields);
      return;
    }

    if (!isFree) {
      const numericPrice = Number(price);
      if (!numericPrice || numericPrice <= 0) {
        setStatus(t.invalidPrice);
        return;
      }
    }

    try {
      setLoading(true);
      setStatus(t.publishingCourse);

      let imageUrl: string | null = null;
      let videoUrl: string | null = null;
      let fileUrl: string | null = null;

      if (imageFile) {
        imageUrl = await uploadToBucket("course-images", imageFile);
      }

      if (videoFile) {
        videoUrl = await uploadToBucket("course-videos", videoFile);
      }

      if (courseFile) {
        fileUrl = await uploadToBucket("course-files", courseFile);
      }

      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: piUser.uid,
          username: piUser.username,
          title,
          description,
          duration,
          price,
          isFree,
          imageUrl,
          videoUrl,
          fileUrl,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(json?.error || t.courseCreatedFailed);
      }

      setStatus(t.courseCreatedSuccess);

      setTimeout(() => {
        router.push("/");
      }, 1200);
    } catch (error: any) {
      console.error(error);
      setStatus(error?.message || t.courseCreatedFailed);
    } finally {
      setLoading(false);
    }
  };

  /* ====== STYLES ====== */
  
  const pageStyle: CSSProperties = {
    minHeight: "100vh",
    paddingBottom: 100,
    background: "var(--bg-primary)",
    fontFamily
