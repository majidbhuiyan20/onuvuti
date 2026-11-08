import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "স্পর্শের ব্যাকরণ — ভালোবাসা, মনস্তত্ত্ব ও অন্তরঙ্গতার এক অনন্য পাঠ | অনুভূতি",
  description:
    "৫৫% ছাড়ে মাত্র ৯৯ টাকায় সংগ্রহ করুন বেস্টসেলার ই-বুক 'স্পর্শের ব্যাকরণ'। ভালোবাসা, স্পর্শের ভাষা ও দাম্পত্য মনস্তত্ত্বের বাস্তব দিশা। বিকাশ বা নগদে পেমেন্ট করলেই তাৎক্ষণিক PDF ডাউনলোড।",
  keywords: [
    "স্পর্শের ব্যাকরণ",
    "ভালোবাসার মনস্তত্ত্ব",
    "দাম্পত্য সম্পর্ক",
    "ই-বুক",
    "অনলাইন বই",
    "অনুভূতি",
    "অনলাইন রিলেশনশিপ গাইড",
  ],
  authors: [{ name: "দাম্পত্য সম্পর্ক ও মনোবিজ্ঞান বিভাগ" }],
  openGraph: {
    title: "স্পর্শের ব্যাকরণ — ভালোবাসা, মনস্তত্ত্ব ও অন্তরঙ্গতার এক অনন্য পাঠ",
    description:
      "৫৫% ছাড়ে এখন মাত্র ৯৯ টাকায় সংগ্রহ করুন বেস্টসেলার ই-বুক 'স্পর্শের ব্যাকরণ'। বিকাশ, নগদ বা রকেটে পেমেন্ট করলেই সাথে সাথে PDF ডাউনলোড।",
    url: "https://onuvuti.site/sporsher-byakoron",
    siteName: "অনুভূতি (Onuvuti.site)",
    images: [
      {
        url: "https://onuvuti.site/images/book-cover.png?v=20261108c",
        width: 1200,
        height: 630,
        alt: "স্পর্শের ব্যাকরণ ই-বুক প্রচ্ছদ",
      },
    ],
    locale: "bn_BD",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "স্পর্শের ব্যাকরণ — ভালোবাসা, মনস্তত্ত্ব ও অন্তরঙ্গতার এক অনন্য পাঠ",
    description:
      "৫৫% ছাড়ে মাত্র ৯৯ টাকায় সংগ্রহ করুন বেস্টসেলার ই-বুক 'স্পর্শের ব্যাকরণ'। বিকাশ বা নগদে পেমেন্ট করলেই তাৎক্ষণিক ডাউনলোড।",
    images: ["https://onuvuti.site/images/book-cover.png?v=20261108c"],
  },
};

export default function SporsherByakoronLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
