"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getDirection, type Lang } from "@/lib/i18n";

type PiUser = {
  uid: string;
  username: string;
};

type WithdrawalRequest = {
  id: number;
  seller_uid: string;
  seller_username: string | null;
  amount: number | string;
  currency: string | null;
  wallet_address: string | null;
  status: string;
  created_at: string;
  updated_at?: string | null;
  paid_at?: string | null;
  admin_note?: string | null;
};

export default function AdminWithdrawalsPage() {
  const [lang, setLang] = useState<Lang>("ar");
  const [piUser, setPiUser] = useState<PiUser | null>(null);
  const [items, setItems] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

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
    const loadWithdrawals = async () => {
      if (!piUser?.uid) return;

      try {
        setLoading(true);
        setStatus("");

        const res = await fetch(
          `/api/admin/withdrawals?uid=${encodeURIComponent(piUser.uid)}`,
          { cache: "no-store" }
        );

        const json = await res.json().catch(() => ({}));

        if (!res.ok || !json?.ok) {
          throw new Error(
            json?.error ||
              (lang === "ar"
                ? "فشل تحميل طلبات السحب"
                : "Failed to load withdrawal requests")
          );
        }

        setItems(Array.isArray(json.withdrawals) ? json.withdrawals : []);
      } catch (error: any) {
        console.error(error);
        setStatus(
          error?.message ||
            (lang === "ar"
              ? "فشل تحميل طلبات السحب"
              : "Failed to load withdrawal requests")
        );
      } finally {
        setLoading(false);
      }
    };

    void loadWithdrawals();
  }, [piUser?.uid, lang]);

  const updateWithdrawalStatus = async (
    id: number,
    nextStatus: "approved" | "rejected" | "paid"
  ) => {
    if (!piUser?.uid) return;

    const note =
      nextStatus === "rejected"
        ? window.prompt(
            lang === "ar" ? "سبب الرفض (اختياري)" : "Reason for rejection (optional)"
          ) || ""
        : "";

    try {
      setUpdatingId(id);
      setStatus("");

      const res = await fetch(`/api/admin/withdrawals/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: piUser.uid,
          status: nextStatus,
          admin_note: note || null,
        }),
      });

      const json = await res.json().catch(() => ({}));

      if (!res.ok || !json?.ok) {
        throw new Error(
          json?.error ||
            (lang === "ar"
              ? "فشل تحديث طلب السحب"
              : "Failed to update withdrawal request")
        );
      }

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, ...json.withdrawal } : item
        )
      );

      setStatus(
        lang === "ar"
          ? "تم تحديث الطلب بنجاح"
          : "Withdrawal request updated successfully"
      );
    } catch (error: any) {
      console.error(error);
      setStatus(
        error?.message ||
          (lang === "ar"
            ? "فشل تحديث طلب السحب"
            : "Failed to update withdrawal request")
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const pageStyle: CSSProperties = {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(129,140,248,0.18), transparent 30%), linear-gradient(180deg, #f8faff 0%, #eef2ff 55%, #f5f7ff 100%)",
    fontFamily: "var(--font-tajawal), sans-serif",
    paddingBottom: 120,
  };

  const containerStyle: CSSProperties = {
    maxWidth: 760,
    margin: "0 auto",
    padding: "24px 18px",
  };

  const headerStyle: CSSProperties = {
    background: "linear-gradient(145deg, rgba(12,23,66,0.96), rgba(86,100,210,0.92))",
    borderRadius: 28,
    padding: "24px 20px",
    color: "#fff",
    marginBottom: 20,
  };

  const cardStyle: CSSProperties = {
    background: "rgba(255,255,255,0.94)",
    borderRadius: 24,
    padding: 18,
    boxShadow: "0 18px 40px rgba(76, 81, 191, 0.12)",
    marginBottom: 16,
    border: "1px solid rgba(255,255,255,0.7)",
  };

  const badgeStyle = (status: string): CSSProperties => {
    let bg = "#e2e8f0";
    let color = "#334155";

    if (status === "pending") {
      bg = "#fef3c7";
      color = "#92400e";
    } else if (status === "approved") {
      bg = "#dbeafe";
      color = "#1d4ed8";
    } else if (status === "paid") {
      bg = "#dcfce7";
      color = "#166534";
    } else if (status === "rejected") {
      bg = "#fee2e2";
      color = "#b91c1c";
    }

    return {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 90,
      padding: "8px 14px",
      borderRadius: 999,
      background: bg,
      color,
      fontWeight: 800,
      fontSize: 13,
    };
  };

  const actionButtonStyle = (kind: "approve" | "reject" | "paid"): CSSProperties => {
    const styles = {
      approve: {
        background: "#2563eb",
        color: "#fff",
      },
      reject: {
        background: "#fff",
        color: "#ef4444",
        border: "2px solid #ef4444",
      },
      paid: {
        background: "#16a34a",
        color: "#fff",
      },
    }[kind];

    return {
      minHeight: 44,
      padding: "0 14px",
      borderRadius: 14,
      fontWeight: 800,
      fontSize: 14,
      cursor: "pointer",
      border: "none",
      ...styles,
    };
  };

  const infoBoxStyle: CSSProperties = {
    background: "rgba(255,255,255,0.92)",
    borderRadius: 20,
    padding: 18,
    color: "#64748b",
    textAlign: "center",
    fontWeight: 700,
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

        <section style={headerStyle}>
          <h1 style={{ fontSize: 34, fontWeight: 900, margin: "0 0 10px" }}>
            {lang === "ar" ? "إدارة طلبات السحب" : "Manage Withdrawal Requests"}
          </h1>
          <p style={{ margin: 0, color: "rgba(255,255,255,0.82)", lineHeight: 1.8 }}>
            {lang === "ar"
              ? "راجع الطلبات ووافق أو ارفض أو علّمها كمدفوعة"
              : "Review requests and approve, reject, or mark them as paid"}
          </p>
        </section>

        {!piUser ? (
          <div style={infoBoxStyle}>
            {lang === "ar"
              ? "يجب تسجيل الدخول أولًا"
              : "You must sign in first"}
          </div>
        ) : loading ? (
          <div style={infoBoxStyle}>
            {lang === "ar" ? "جاري التحميل..." : "Loading..."}
          </div>
        ) : status ? (
          <div style={infoBoxStyle}>{status}</div>
        ) : items.length === 0 ? (
          <div style={infoBoxStyle}>
            {lang === "ar"
              ? "لا توجد طلبات سحب حاليًا"
              : "No withdrawal requests found"}
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  marginBottom: 14,
                }}
              >
                <div>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#0f172a" }}>
                    {lang === "ar" ? "طلب سحب" : "Withdrawal Request"} #{item.id}
                  </div>
                  <div style={{ color: "#64748b", marginTop: 6 }}>
                    {item.seller_username || item.seller_uid}
                  </div>
                </div>

                <div style={badgeStyle(item.status)}>{item.status}</div>
              </div>

              <div style={{ lineHeight: 2, color: "#334155", marginBottom: 14 }}>
                <div>
                  <strong>{lang === "ar" ? "المبلغ:" : "Amount:"}</strong>{" "}
                  {item.amount} {item.currency || "PI"}
                </div>
                <div>
                  <strong>{lang === "ar" ? "المحفظة:" : "Wallet:"}</strong>{" "}
                  {item.wallet_address || "-"}
                </div>
                <div>
                  <strong>{lang === "ar" ? "التاريخ:" : "Date:"}</strong>{" "}
                  {new Date(item.created_at).toLocaleString()}
                </div>
                {item.admin_note ? (
                  <div>
                    <strong>{lang === "ar" ? "ملاحظة الأدمن:" : "Admin note:"}</strong>{" "}
                    {item.admin_note}
                  </div>
                ) : null}
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                {item.status === "pending" ? (
                  <>
                    <button
                      type="button"
                      disabled={updatingId === item.id}
                      onClick={() => updateWithdrawalStatus(item.id, "approved")}
                      style={actionButtonStyle("approve")}
                    >
                      {lang === "ar" ? "موافقة" : "Approve"}
                    </button>

                    <button
                      type="button"
                      disabled={updatingId === item.id}
                      onClick={() => updateWithdrawalStatus(item.id, "rejected")}
                      style={actionButtonStyle("reject")}
                    >
                      {lang === "ar" ? "رفض" : "Reject"}
                    </button>
                  </>
                ) : null}

                {item.status === "approved" ? (
                  <button
                    type="button"
                    disabled={updatingId === item.id}
                    onClick={() => updateWithdrawalStatus(item.id, "paid")}
                    style={actionButtonStyle("paid")}
                  >
                    {lang === "ar" ? "تم الدفع" : "Mark as Paid"}
                  </button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
