import type { Metadata } from "next";
import "./globals.css";
import { BOOK_INFO } from "@/data/bookData";
import { ThemeProvider } from "@/components/ThemeProvider";

export const metadata: Metadata = {
  title: `অনুভূতি (Onuvuti) — ${BOOK_INFO.titleBn}`,
  description:
    "অনুভূতি (Onuvuti) — মনস্তত্ত্ব, সম্পর্ক ও জীবনদর্শন ব্লগ এবং স্পর্শের ব্যাকরণ ই-বুক।",
  icons: {
    icon: "/images/Onuvuti-Publications-Logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const saved = localStorage.getItem("onuvuti_theme");
                const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                if (saved === "dark" || (!saved && prefersDark)) {
                  document.documentElement.classList.add("dark");
                  document.documentElement.setAttribute("data-theme", "dark");
                } else {
                  document.documentElement.classList.remove("dark");
                  document.documentElement.setAttribute("data-theme", "light");
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#FCFAF6] dark:bg-[#0B0F17] text-[#142230] dark:text-[#E2E8F0] transition-colors duration-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
