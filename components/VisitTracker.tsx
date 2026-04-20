"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

type PiUser = {
  uid: string
  username: string
}

export default function VisitTracker({
  pageTitle,
}: {
  pageTitle?: string
}) {
  const pathname = usePathname()

  useEffect(() => {
    const key = `visit_logged_${pathname}`
    const last = sessionStorage.getItem(key)

    if (last === "1") return

    let piUser: PiUser | null = null

    try {
      const raw = localStorage.getItem("pi_user")
      if (raw) {
        piUser = JSON.parse(raw)
      }
    } catch (error) {
      console.error(error)
    }

    fetch("/api/track-visit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        path: pathname,
        pageTitle: pageTitle || document.title,
        uid: piUser?.uid || null,
        username: piUser?.username || null,
      }),
    }).catch(console.error)

    sessionStorage.setItem(key, "1")
  }, [pathname, pageTitle])

  return null
}
