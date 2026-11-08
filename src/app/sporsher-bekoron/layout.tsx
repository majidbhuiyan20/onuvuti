import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "স্পর্শের ব্যাকরণ — ভালোবাসা, মনস্তত্ত্ব ও অন্তরঙ্গতার এক অনন্য পাঠ | অনুভূতি",
  description:
    "৫৫% ছাড়ে মাত্র ৯৯ টাকায় সংগ্রহ করুন বেস্টসেলার ই-বুক 'স্পর্শের ব্যাকরণ'। বিকাশ বা নগদে পেমেন্ট করলেই তাৎক্ষণিক PDF ডাউনলোড।",
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
};

export default function SporsherBekoronLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
