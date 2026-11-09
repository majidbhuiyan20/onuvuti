import type { Metadata } from "next";
import AdultCatalogClient from "./AdultCatalogClient";

export const metadata: Metadata = {
  title: "18+ Adult Video Collection | Onuvuti After Hours",
  description: "Browse Onuvuti After Hours, an age-restricted 18+ video collection. Adults only; age confirmation is required.",
  alternates: { canonical: "/adult" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  other: { rating: "adult" },
  openGraph: {
    title: "Onuvuti After Hours — 18+ Collection",
    description: "Age-restricted 18+ collection. Adults only.",
    url: "/adult",
    type: "website",
  },
};

export default function AdultPage() {
  return <AdultCatalogClient />;
}
