import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "অনুভূতি ১৮+ — এক্সক্লুসিভ প্রাপ্তবয়স্ক কর্নার",
  description: "শুধুমাত্র ১৮+ প্রাপ্তবয়স্কদের জন্য নির্ধারিত বিশেষ কর্নার।",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0B0F17] text-stone-100 selection:bg-[#80131E] selection:text-white">
      {children}
    </div>
  );
}
