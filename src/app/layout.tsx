import type { Metadata } from "next";
import "./globals.css";
import { BOOK_INFO } from "@/data/bookData";

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
    <html lang="bn" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#FCFAF6] text-[#142230]">
        {children}
      </body>
    </html>
  );
}
