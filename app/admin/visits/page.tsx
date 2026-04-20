"use client"

import type { CSSProperties } from "react"
import Link from "next/link"
import { useEffect, useMemo, useState } from "react"

type Visit = {
  id: number
  uid: string | null
  username: string | null
  path: string
  page_title: string | null
  visited_at: string
}

type Stats = {
  totalVisits: number
  anonymousVisits: number
  uniquePiUsers: number
}

export default function AdminVisitsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [search, setSearch] = useState("")
  const [visits, setVisits] = useState<Visit[]>([])
  const [stats, setStats] = useState<Stats>({
    totalVisits: 0,
    anonymousVisits: 0,
    uniquePiUsers: 0,
  })

  useEffect(() => {
    const loadVisits = async () => {
      try {
        setLoading(true)
        setError("")

        const res = await fetch("/api/admin/visits", {
          method: "GET",
          cache: "no-store",
        })

        const json = await res.json().catch(() => ({}))

        if (!res.ok) {
          throw new Error(json?.error || "Failed to load visits")
        }

        setVisits(Array.isArray(json.visits) ? json.visits : [])
        setStats(
          json?.stats || {
            totalVisits: 0,
            anonymousVisits: 0,
            uniquePiUsers: 0,
          }
        )
      } catch (error: any) {
        console.error(error)
        setError(error?.message || "Failed to load visits")
      } finally {
        setLoading(false)
      }
    }

    loadVisits()
  }, [])

  const filteredVisits = useMemo(() => {
    const q = search.trim().toLowerCase()

    if (!q) return visits

    return visits.filter((visit) => {
      return (
        (visit.username || "").toLowerCase().includes(q) ||
        (visit.uid || "").toLowerCase().includes(q) ||
        (visit.path || "").toLowerCase().includes(q) ||
        (visit.page_title || "").toLowerCase().includes(q)
      )
    })
  }, [search, visits])

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div>
            <Link href="/profile" style={backLinkStyle}>
              ← العودة
            </Link>
            <h1 style={titleStyle}>لوحة الزوار</h1>
            <p style={subtitleStyle}>
              تعرض آخر الزيارات داخل التطبيق
            </p>
          </div>
        </div>

        <div style={statsGridStyle}>
          <div style={statCardStyle}>
            <div style={statLabelStyle}>إجمالي الزيارات</div>
            <div style={statValueStyle}>{stats.totalVisits}</div>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>مستخدمو Pi الفريدون</div>
            <div style={statValueStyle}>{stats.uniquePiUsers}</div>
          </div>

          <div style={statCardStyle}>
            <div style={statLabelStyle}>زيارات بدون تسجيل</div>
            <div style={statValueStyle}>{stats.anonymousVisits}</div>
          </div>
        </div>

        <div style={searchWrapStyle}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث بالاسم أو uid أو الصفحة..."
            style={searchInputStyle}
          />
        </div>

        {loading ? (
          <div style={infoBoxStyle}>جاري تحميل الزيارات...</div>
        ) : error ? (
          <div style={errorBoxStyle}>{error}</div>
        ) : filteredVisits.length === 0 ? (
          <div style={infoBoxStyle}>لا توجد زيارات لعرضها</div>
        ) : (
          <div style={listStyle}>
            {filteredVisits.map((visit) => (
              <div key={visit.id} style={visitCardStyle}>
                <div style={visitTopStyle}>
                  <div style={pathStyle}>{visit.path}</div>
                  <div style={timeStyle}>
                    {new Date(visit.visited_at).toLocaleString()}
                  </div>
                </div>

                <div style={metaStyle}>
                  <strong>الاسم:</strong>{" "}
                  {visit.username || "زائر بدون تسجيل"}
                </div>

                <div style={metaStyle}>
                  <strong>UID:</strong> {visit.uid || "—"}
                </div>

                <div style={metaStyle}>
                  <strong>عنوان الصفحة:</strong> {visit.page_title || "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#f8fafc",
  paddingBottom: 40,
}

const containerStyle: CSSProperties = {
  maxWidth: 720,
  margin: "0 auto",
  padding: 16,
}

const headerStyle: CSSProperties = {
  marginBottom: 16,
}

const backLinkStyle: CSSProperties = {
  display: "inline-block",
  marginBottom: 10,
  color: "#0f172a",
  textDecoration: "none",
  fontSize: 14,
}

const titleStyle: CSSProperties = {
  fontSize: 30,
  fontWeight: 900,
  color: "#0f172a",
  margin: "0 0 8px",
}

const subtitleStyle: CSSProperties = {
  margin: 0,
  color: "#64748b",
  lineHeight: 1.8,
}

const statsGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 12,
  marginBottom: 16,
}

const statCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: 16,
}

const statLabelStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 14,
  marginBottom: 8,
}

const statValueStyle: CSSProperties = {
  color: "#0f172a",
  fontSize: 28,
  fontWeight: 900,
}

const searchWrapStyle: CSSProperties = {
  marginBottom: 16,
}

const searchInputStyle: CSSProperties = {
  width: "100%",
  border: "1px solid #dbe3ea",
  borderRadius: 16,
  padding: "14px 16px",
  fontSize: 15,
  outline: "none",
  background: "white",
}

const infoBoxStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: 18,
  color: "#475569",
}

const errorBoxStyle: CSSProperties = {
  background: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: 18,
  padding: 18,
  color: "#991b1b",
}

const listStyle: CSSProperties = {
  display: "grid",
  gap: 12,
}

const visitCardStyle: CSSProperties = {
  background: "white",
  border: "1px solid #e5e7eb",
  borderRadius: 18,
  padding: 16,
}

const visitTopStyle: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 12,
  marginBottom: 10,
}

const pathStyle: CSSProperties = {
  fontSize: 18,
  fontWeight: 900,
  color: "#0f172a",
  wordBreak: "break-word",
}

const timeStyle: CSSProperties = {
  color: "#64748b",
  fontSize: 13,
  whiteSpace: "nowrap",
}

const metaStyle: CSSProperties = {
  color: "#334155",
  lineHeight: 1.9,
  wordBreak: "break-word",
}
