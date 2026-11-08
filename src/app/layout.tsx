import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BOOK_INFO } from "@/data/bookData";
import { ThemeProvider } from "@/components/ThemeProvider";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import MetaPixel from "@/components/analytics/MetaPixel";

export const viewport: Viewport = {
  themeColor: "#80131E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes("localhost")
      ? process.env.NEXT_PUBLIC_SITE_URL
      : "https://onuvuti.site"
  ),
  title: `অনুভূতি (Onuvuti) — ${BOOK_INFO.titleBn}`,
  description:
    "অনুভূতি (Onuvuti) — মনস্তত্ত্ব, সম্পর্ক ও জীবনদর্শন ব্লগ এবং স্পর্শের ব্যাকরণ ই-বুক।",
  applicationName: "অনুভূতি",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "অনুভূতি",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: "/icon-192.png",
    apple: "/apple-touch-icon.png",
    shortcut: "/icon-192.png",
  },
  manifest: "/manifest.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="bn" className="h-full antialiased" suppressHydrationWarning>
      <head>
        {adsenseClientId && (
          <>
            <meta name="google-adsense-account" content={adsenseClientId} />
            <script
              async
              src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
              crossOrigin="anonymous"
            />
          </>
        )}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem("onuvuti_theme");
                const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                const isDark = saved === "dark" || (!saved && prefersDark);
                if (isDark) {
                  document.documentElement.classList.add("dark");
                  document.documentElement.setAttribute("data-theme", "dark");
                  document.documentElement.style.colorScheme = "dark";
                } else {
                  document.documentElement.classList.remove("dark");
                  document.documentElement.setAttribute("data-theme", "light");
                  document.documentElement.style.colorScheme = "light";
                }
              } catch (e) {}
            `,
          }}
        />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="অনুভূতি" />
      </head>
      <body className="min-h-full flex flex-col bg-[#FCFAF6] dark:bg-[#0B0F17] text-[#142230] dark:text-[#E2E8F0] transition-colors duration-200">
        <ThemeProvider>
          <MetaPixel />
          {children}
          <PWAInstallPrompt />
        </ThemeProvider>
      </body>
    </html>
  );
}
