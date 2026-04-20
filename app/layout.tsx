import type { Metadata } from "next";
import Script from "next/script";
import { Tajawal } from "next/font/google"; // ✅ إضافة الخط العربي
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider"; // ✅ إضافة مدير السمة

// ✅ تهيئة خط Tajawal العربي
const tajawal = Tajawal({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700", "800"],
  variable: "--font-tajawal",
  display: "swap",
});

// ✅ تحسين الـ Metadata بالعربية
export const metadata: Metadata = {
  title: {
    default: "منصة المهارات | Maharaat Platform",
    template: "%s | منصة المهارات",
  },
  description:
    "منصة تعليمية عربية متكاملة تعمل مع شبكة Pi Network. تعلم وعلّم واكسب عملة Pi!",
  keywords: [
    "مهارات",
    "تعليم",
    "دورات",
    "Pi Network",
    "بلوك تشين",
    "تكنولوجيا",
    "عربي",
  ],
  authors: [{ name: "Eghrdm20" }],
  creator: "Eghrdm20",
  publisher: "Maharaat Platform",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "ar_AR",
    url: "https://maharaat-app.vercel.app",
    siteName: "منصة المهارات",
    title: "منصة المهارات | تعلّم واكسب مع Pi Network",
    description:
      "انضم إلى أفضل منصة تعليمية عربية مدعومة بشبكة Pi Network",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "منصة المهارات",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "منصة المهارات | Maharaat Platform",
    description: "منصة تعليمية عربية مع Pi Network",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

// ✅ التصميم الرئيسي المحسن
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={tajawal.variable} // ✅ تفعيل خط Tajawal
      suppressHydrationWarning // ✅ منع أخطاء الترطيب (Hydration)
    >
      <body
        style={{
          // ✅ تطبيق المتغيرات مباشرة على body
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
          fontFamily: "var(--font-tajawal), Arial, sans-serif",
          transition: "background-color 0.3s ease, color 0.3s ease",
          minHeight: "100vh",
        }}
      >
        {/* ✅ Pi Network SDK */}
        <Script
          src="https://sdk.minepi.com/pi-sdk.js"
          strategy="beforeInteractive"
        />

        {/* ✅ غلّف كل شيء بـ ThemeProvider */}
        <ThemeProvider>
          {children}
        </ThemeProvider>

        {/* ✅ سكريبت لتفعيل الوضع المحفوظ قبل ظهور الصفحة */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function() {
              const savedTheme = localStorage.getItem('theme') || 'light';
              document.documentElement.setAttribute('data-theme', savedTheme);
            })();
          `}
        </Script>
      </body>
    </html>
  );
}
