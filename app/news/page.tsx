"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { translations, type Lang, getDirection } from "@/lib/i18n";

type Post = {
  id: number;
  title: string;
  excerpt: string;
  category: string;
  image_url: string | null;
  username: string;
  views_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
};

type Category = {
  id: string;
  name: string;
  icon: string;
};

const categories: Category[] = [
  { id: "all", name: "الكل", icon:
